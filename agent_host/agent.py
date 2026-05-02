"""
BrivoMarketing Mac/Linux Host Agent.

Connects out to the backend over a single secure WebSocket and runs posting
jobs in a persistent Chromium browser via Playwright. Designed to run as a
launchd / systemd daemon — boot on startup, auto-reconnect, never crash.

Usage:
  python agent.py                    # daemon mode (silent, reconnect forever)
  python agent.py --foreground       # log to stdout
  python agent.py --pair CODE NAME   # one-time pair via 6-digit code

Config lives at ~/.brivo_agent/config.json:
  { "backend_url": "https://...", "agent_id": "...", "token": "..." }
"""
from __future__ import annotations

import argparse
import asyncio
import base64
import json
import os
import platform
import sys
import time
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import httpx
import websockets
from playwright.async_api import async_playwright, BrowserContext, Page

CFG_DIR = Path(os.path.expanduser("~/.brivo_agent"))
CFG_PATH = CFG_DIR / "config.json"
PROFILE_DIR = CFG_DIR / "chromium-profile"
HEARTBEAT_S = 20
RECONNECT_BACKOFF_S = (3, 10, 30, 60, 120)
VERSION = "1.0.0"


def load_config() -> dict:
    if not CFG_PATH.exists():
        return {}
    try:
        return json.loads(CFG_PATH.read_text())
    except Exception:
        return {}


def save_config(cfg: dict) -> None:
    CFG_DIR.mkdir(parents=True, exist_ok=True)
    CFG_PATH.write_text(json.dumps(cfg, indent=2))
    os.chmod(CFG_PATH, 0o600)


def http_to_ws(url: str) -> str:
    p = urlparse(url)
    scheme = "wss" if p.scheme == "https" else "ws"
    return f"{scheme}://{p.netloc}{p.path}"


# --------------------------------------------------------------- pairing
async def pair(backend_url: str, code: str, name: str) -> None:
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(
            f"{backend_url.rstrip('/')}/api/agent/pair",
            json={"code": code, "name": name},
        )
        r.raise_for_status()
        data = r.json()
    save_config({
        "backend_url": backend_url.rstrip("/"),
        "agent_id": data["agent_id"],
        "token": data["token"],
        "name": data["name"],
    })
    print(f"✓ paired as {data['name']} ({data['agent_id']})")
    print(f"✓ config: {CFG_PATH}")


# --------------------------------------------------------------- browser
class Browser:
    """Holds a single persistent Chromium context across jobs."""

    def __init__(self) -> None:
        self.ctx: Optional[BrowserContext] = None
        self._pw = None

    async def start(self) -> None:
        if self.ctx is not None:
            return
        self._pw = await async_playwright().start()
        PROFILE_DIR.mkdir(parents=True, exist_ok=True)
        self.ctx = await self._pw.chromium.launch_persistent_context(
            str(PROFILE_DIR),
            headless=False,
            viewport={"width": 1280, "height": 900},
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-default-browser-check",
            ],
        )

    async def page(self) -> Page:
        await self.start()
        if self.ctx and self.ctx.pages:
            return self.ctx.pages[0]
        return await self.ctx.new_page()  # type: ignore[union-attr]


BROWSER = Browser()


# --------------------------------------------------------------- posters
async def _screenshot_b64(page: Page) -> str:
    raw = await page.screenshot(type="jpeg", quality=60, full_page=False)
    return base64.b64encode(raw).decode("ascii")


async def _download_media(url: str, dest: Path) -> Path:
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        dest.write_bytes(r.content)
    return dest


async def _check_session(page: Page, url: str, signed_in_marker: str) -> bool:
    """Visit `url` and look for an element selector that only appears when
    logged in. Returns True if logged-in, False otherwise."""
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(1500)
        return await page.locator(signed_in_marker).count() > 0
    except Exception:
        return False


async def collect_session_status() -> dict:
    """Background-check whether the persistent profile is still logged into
    each platform. Cheap (no DOM mutations, just DOM presence)."""
    page = await BROWSER.page()
    out: dict = {}
    # X — the compose button only shows when logged in
    out["x"] = await _check_session(page, "https://x.com/home", '[data-testid="SideNav_NewTweet_Button"]')
    # Instagram — search for the "New post" button on the home shell
    out["instagram"] = await _check_session(page, "https://www.instagram.com/", 'svg[aria-label="New post"]')
    # LinkedIn — global nav is only present logged-in
    out["linkedin"] = await _check_session(page, "https://www.linkedin.com/feed/", 'header.global-nav')
    return out


async def post_x(page: Page, caption: str, media_url: Optional[str]) -> dict:
    """Post a tweet via the logged-in x.com web composer."""
    await page.goto("https://x.com/compose/post", wait_until="domcontentloaded")
    await page.wait_for_timeout(2500)

    box = page.get_by_role("textbox").first
    await box.click()
    await box.fill("")
    await box.type(caption, delay=22)

    if media_url:
        try:
            tmp = CFG_DIR / "tmp"
            tmp.mkdir(exist_ok=True)
            ext = ".png" if media_url.endswith(".png") else ".jpg"
            local = await _download_media(media_url, tmp / f"x_media{ext}")
            file_input = page.locator('input[type="file"]').first
            await file_input.set_input_files(str(local))
            await page.wait_for_timeout(3500)
        except Exception as e:
            return {"ok": False, "error": f"media upload failed: {e}",
                    "screenshot_b64": await _screenshot_b64(page)}

    # The post button uses data-testid='tweetButton' on web
    try:
        await page.get_by_test_id("tweetButton").click()
    except Exception:
        await page.locator('[data-testid="tweetButton"]').click()

    await page.wait_for_timeout(3500)
    shot = await _screenshot_b64(page)
    return {"ok": True, "posted_url": page.url, "screenshot_b64": shot}


async def post_instagram(page: Page, caption: str, media_url: Optional[str]) -> dict:
    """Post a single feed image via instagram.com web composer.

    Note: IG web requires a *square or 4:5* image. We rely on the caller to
    feed a 1080x1080 image. If IG throws a 'new device' challenge the caller
    will see a screenshot in the result.
    """
    if not media_url:
        return {"ok": False, "error": "Instagram requires media"}

    tmp = CFG_DIR / "tmp"
    tmp.mkdir(exist_ok=True)
    ext = ".png" if media_url.endswith(".png") else ".jpg"
    local = await _download_media(media_url, tmp / f"ig_media{ext}")

    await page.goto("https://www.instagram.com/", wait_until="domcontentloaded")
    await page.wait_for_timeout(3000)

    try:
        await page.get_by_role("link", name="New post").click(timeout=8000)
    except Exception:
        try:
            await page.get_by_role("button", name="New post").click(timeout=4000)
        except Exception:
            return {"ok": False,
                    "error": "Could not find New-Post button (may need login or challenge)",
                    "screenshot_b64": await _screenshot_b64(page)}

    await page.wait_for_timeout(1500)
    file_input = page.locator('input[type="file"]').first
    await file_input.set_input_files(str(local))
    await page.wait_for_timeout(2500)

    # Click Next, Next, then add caption + Share
    try:
        await page.get_by_role("button", name="Next").click()
        await page.wait_for_timeout(1200)
        await page.get_by_role("button", name="Next").click()
        await page.wait_for_timeout(1500)
    except Exception:
        pass

    try:
        cap_box = page.get_by_label("Write a caption...")
        await cap_box.click()
        await cap_box.type(caption, delay=18)
    except Exception:
        pass

    try:
        await page.get_by_role("button", name="Share").click()
        await page.wait_for_timeout(5000)
    except Exception as e:
        return {"ok": False, "error": f"share click failed: {e}",
                "screenshot_b64": await _screenshot_b64(page)}

    return {"ok": True, "posted_url": page.url,
            "screenshot_b64": await _screenshot_b64(page)}


async def post_linkedin(page: Page, caption: str, media_url: Optional[str]) -> dict:
    """Post via the LinkedIn share modal."""
    await page.goto("https://www.linkedin.com/feed/", wait_until="domcontentloaded")
    await page.wait_for_timeout(2500)

    try:
        await page.get_by_role("button", name="Start a post").click(timeout=6000)
    except Exception:
        return {"ok": False, "error": "could not open Start-a-post (login/challenge?)",
                "screenshot_b64": await _screenshot_b64(page)}

    await page.wait_for_timeout(1500)
    if media_url:
        try:
            tmp = CFG_DIR / "tmp"
            tmp.mkdir(exist_ok=True)
            ext = ".png" if media_url.endswith(".png") else ".jpg"
            local = await _download_media(media_url, tmp / f"li_media{ext}")
            await page.get_by_role("button", name="Add a photo").click(timeout=4000)
            file_input = page.locator('input[type="file"]').first
            await file_input.set_input_files(str(local))
            await page.wait_for_timeout(2500)
            await page.get_by_role("button", name="Next").click()
            await page.wait_for_timeout(1200)
        except Exception:
            pass

    try:
        editor = page.locator('div[role="textbox"]').first
        await editor.click()
        await editor.type(caption, delay=18)
        await page.wait_for_timeout(800)
        await page.get_by_role("button", name="Post", exact=True).click()
        await page.wait_for_timeout(4000)
    except Exception as e:
        return {"ok": False, "error": f"post click failed: {e}",
                "screenshot_b64": await _screenshot_b64(page)}

    return {"ok": True, "posted_url": page.url,
            "screenshot_b64": await _screenshot_b64(page)}


PLATFORM_HANDLERS = {
    "post_x":         post_x,
    "post_instagram": post_instagram,
    "post_linkedin":  post_linkedin,
}


async def handle_job(job: dict) -> dict:
    handler = PLATFORM_HANDLERS.get(job.get("kind", ""))
    if handler is None:
        return {"ok": False, "error": f"unknown job kind: {job.get('kind')}"}
    page = await BROWSER.page()
    media = job.get("image_url") or job.get("video_url")
    # Resolve relative URLs against backend
    if media and media.startswith("/"):
        cfg = load_config()
        media = cfg["backend_url"] + media
    try:
        return await handler(page, job["caption"], media)
    except Exception as e:
        try:
            shot = await _screenshot_b64(page)
        except Exception:
            shot = None
        return {"ok": False, "error": str(e), "screenshot_b64": shot}


# --------------------------------------------------------------- main loop
async def run_once(verbose: bool) -> None:
    cfg = load_config()
    if not cfg.get("token"):
        raise SystemExit("No token. Run with --pair CODE NAME first.")
    ws_base = http_to_ws(cfg["backend_url"]) + "/api/agent/ws"
    url = f"{ws_base}?token={cfg['token']}"

    if verbose:
        print(f"→ connecting to {ws_base}")

    async with websockets.connect(url, max_size=8 * 1024 * 1024) as ws:
        # Probe the persistent browser profile for which platforms are logged in
        try:
            sessions = await collect_session_status()
        except Exception:
            sessions = {}

        await ws.send(json.dumps({
            "type": "hello",
            "version": VERSION,
            "platform": platform.platform(),
            "platforms": ["x", "instagram", "linkedin"],
            "sessions": sessions,
        }))
        if verbose:
            print("✓ connected — sessions:", sessions)

        async def heartbeat() -> None:
            tick = 0
            while True:
                await asyncio.sleep(HEARTBEAT_S)
                payload = {"type": "heartbeat"}
                # Re-probe sessions every ~5 minutes (tick = 15 × 20s)
                tick += 1
                if tick % 15 == 0:
                    try:
                        payload["sessions"] = await collect_session_status()
                    except Exception:
                        pass
                try:
                    await ws.send(json.dumps(payload))
                except Exception:
                    return

        hb_task = asyncio.create_task(heartbeat())
        try:
            async for raw in ws:
                try:
                    msg = json.loads(raw)
                except json.JSONDecodeError:
                    continue
                if msg.get("type") == "job":
                    job_id = msg.get("id")
                    if verbose:
                        print(f"→ job {msg.get('kind')} {job_id}")
                    result = await handle_job(msg)
                    await ws.send(json.dumps({
                        "type": "job_result",
                        "job_id": job_id,
                        **result,
                    }))
                    if verbose:
                        print(f"  {'✓' if result.get('ok') else '✗'} {result.get('posted_url') or result.get('error')}")
                elif msg.get("type") == "ping":
                    await ws.send(json.dumps({"type": "pong"}))
        finally:
            hb_task.cancel()


async def daemon(verbose: bool) -> None:
    attempt = 0
    while True:
        try:
            await run_once(verbose)
            attempt = 0
        except Exception as e:
            if verbose:
                print(f"✗ disconnect: {e}")
        delay = RECONNECT_BACKOFF_S[min(attempt, len(RECONNECT_BACKOFF_S) - 1)]
        if verbose:
            print(f"  reconnecting in {delay}s")
        await asyncio.sleep(delay)
        attempt += 1


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--foreground", "-f", action="store_true",
                   help="log progress to stdout")
    p.add_argument("--pair", nargs=2, metavar=("CODE", "NAME"),
                   help="redeem a 6-digit pair code, e.g. --pair 123456 'Mac mini'")
    p.add_argument("--backend", default=os.environ.get(
        "BRIVO_BACKEND_URL",
        "https://admin-panel-launch.preview.emergentagent.com",
    ))
    args = p.parse_args()

    if args.pair:
        asyncio.run(pair(args.backend, args.pair[0], args.pair[1]))
        return

    asyncio.run(daemon(verbose=args.foreground))


if __name__ == "__main__":
    main()
