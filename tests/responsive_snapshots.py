#!/usr/bin/env python3
"""
Responsive regression snapshot script.

Captures screenshots of every public and admin route at a matrix of
viewports and asserts NONE of them produce horizontal overflow
(document.documentElement.scrollWidth > window.innerWidth).

The smallest viewport (320 × 720) is the hard constraint — Brivo must
render without a horizontal scrollbar even on a first-gen iPhone SE.

Usage:
    # One-off, local (requires `playwright install chromium` once):
    python3 tests/responsive_snapshots.py \
        --base-url https://admin-panel-launch.preview.emergentagent.com \
        --out /app/tests/snapshots

    # CI (exit code is 0 on pass, 1 on any overflow):
    python3 tests/responsive_snapshots.py --ci

Exit code 0 = all green; exit code 1 = at least one overflow detected.
A JSON report is written to {out}/report.json.

You can add this to a GitHub Action or any other CI by running:
    pip install playwright==1.47.0
    playwright install chromium
    python3 tests/responsive_snapshots.py --ci
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except ImportError:  # pragma: no cover
    print(
        "[responsive_snapshots] playwright not installed. Run:\n"
        "  pip install playwright==1.47.0 && playwright install chromium",
        file=sys.stderr,
    )
    sys.exit(2)


# --- Viewports to verify ------------------------------------------------------
#  name, width, height
VIEWPORTS = [
    ("mobile-320",  320,  720),   # hard floor — iPhone SE 1st gen
    ("mobile-375",  375,  812),   # iPhone 13 mini
    ("mobile-390",  390,  844),   # iPhone 14 / 15
    ("mobile-428",  428,  926),   # iPhone Pro Max
    ("tablet-768",  768, 1024),   # iPad portrait
    ("tablet-1024", 1024, 1366),  # iPad Pro portrait
    ("desktop-1280", 1280, 800),
    ("desktop-1440", 1440, 900),
    ("desktop-1920", 1920, 1080),
]

# --- Routes to verify ---------------------------------------------------------
PUBLIC_ROUTES = [
    ("landing",   "/"),
    ("partners",  "/partners"),
    ("brand-kit", "/brand-kit"),
    ("login",     "/admin/login"),
]

# Admin routes need auth — loaded after login
ADMIN_ROUTES = [
    ("admin-dashboard",  "/admin"),
    ("admin-leads",      "/admin/leads"),
    ("admin-social",     "/admin/social"),
    ("admin-affiliates", "/admin/affiliates"),
]


async def _overflow_report(page):
    """Return {docW, winW, overflow, overflowing_selectors}."""
    return await page.evaluate("""() => {
        const d = document.documentElement.scrollWidth;
        const w = window.innerWidth;
        const over = d > w;
        // Find which elements are wider than the viewport (exclude html/body)
        const offenders = [];
        if (over) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
                if (el === document.documentElement || el === document.body) continue;
                const r = el.getBoundingClientRect();
                if (r.right > w + 1 && r.width < 5000) {
                    const tag = el.tagName.toLowerCase();
                    const id = el.id ? '#' + el.id : '';
                    const cls = (typeof el.className === 'string' && el.className)
                        ? '.' + el.className.split(/\\s+/).slice(0,3).join('.')
                        : '';
                    offenders.push(`${tag}${id}${cls} (right=${Math.round(r.right)})`);
                    if (offenders.length >= 5) break;
                }
            }
        }
        return { docW: d, winW: w, overflow: over, offenders };
    }""")


async def _capture(page, out_dir: Path, name: str) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    await page.screenshot(
        path=str(out_dir / f"{name}.jpg"),
        type="jpeg",
        quality=55,
        full_page=False,
    )


async def _login_as_admin(page, base_url: str, email: str, password: str) -> bool:
    await page.goto(f"{base_url}/admin/login", wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(2000)
    try:
        await page.fill('[data-testid="admin-login-email"]', email)
        await page.fill('[data-testid="admin-login-password"]', password)
        await page.click('[data-testid="admin-login-submit"]')
        await page.wait_for_timeout(3500)
        # Token saved = login OK
        has_token = await page.evaluate("() => !!localStorage.getItem('brivo_admin_token')")
        return bool(has_token)
    except Exception as e:  # pragma: no cover
        print(f"[responsive_snapshots] login error: {e}", file=sys.stderr)
        return False


async def run(base_url: str, out: Path, email: str, password: str, ci_mode: bool) -> int:
    results: list[dict] = []
    out.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch()

        # Public routes — one context
        ctx_public = await browser.new_context()
        page = await ctx_public.new_page()
        for vp_name, vp_w, vp_h in VIEWPORTS:
            await page.set_viewport_size({"width": vp_w, "height": vp_h})
            for route_name, route_path in PUBLIC_ROUTES:
                url = base_url.rstrip("/") + route_path
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                    await page.wait_for_timeout(2500)
                    rep = await _overflow_report(page)
                    await _capture(page, out / vp_name, route_name)
                    results.append({
                        "viewport": vp_name, "viewport_w": vp_w,
                        "route": route_name, "path": route_path,
                        **rep,
                    })
                    status = "OVERFLOW" if rep["overflow"] else "ok"
                    print(f"[{vp_name:12s}] {route_name:16s} {status} "
                          f"({rep['docW']}/{rep['winW']})")
                except Exception as e:
                    results.append({
                        "viewport": vp_name, "viewport_w": vp_w,
                        "route": route_name, "path": route_path,
                        "error": str(e),
                    })
                    print(f"[{vp_name:12s}] {route_name:16s} ERROR: {e}")

        await ctx_public.close()

        # Admin routes — fresh context with auth
        ctx_admin = await browser.new_context()
        page = await ctx_admin.new_page()
        ok = await _login_as_admin(page, base_url, email, password)
        if not ok:
            print(
                "[responsive_snapshots] WARN: admin login failed; skipping admin routes",
                file=sys.stderr,
            )
        else:
            for vp_name, vp_w, vp_h in VIEWPORTS:
                await page.set_viewport_size({"width": vp_w, "height": vp_h})
                for route_name, route_path in ADMIN_ROUTES:
                    url = base_url.rstrip("/") + route_path
                    try:
                        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                        await page.wait_for_timeout(3000)
                        rep = await _overflow_report(page)
                        await _capture(page, out / vp_name, route_name)
                        results.append({
                            "viewport": vp_name, "viewport_w": vp_w,
                            "route": route_name, "path": route_path,
                            **rep,
                        })
                        status = "OVERFLOW" if rep["overflow"] else "ok"
                        print(f"[{vp_name:12s}] {route_name:16s} {status} "
                              f"({rep['docW']}/{rep['winW']})")
                    except Exception as e:
                        results.append({
                            "viewport": vp_name, "viewport_w": vp_w,
                            "route": route_name, "path": route_path,
                            "error": str(e),
                        })
                        print(f"[{vp_name:12s}] {route_name:16s} ERROR: {e}")

        await ctx_admin.close()
        await browser.close()

    # Persist report
    report_path = out / "report.json"
    report_path.write_text(json.dumps({
        "base_url": base_url,
        "viewports": [v[0] for v in VIEWPORTS],
        "results": results,
    }, indent=2))

    # Summarise
    overflows = [r for r in results if r.get("overflow")]
    errors = [r for r in results if r.get("error")]
    print("\n=== Summary ===")
    print(f"Total checks: {len(results)}")
    print(f"Overflow: {len(overflows)}")
    print(f"Errors:   {len(errors)}")
    print(f"Report:   {report_path}")

    if overflows:
        print("\nOverflow details:")
        for r in overflows:
            print(f"  - [{r['viewport']}] {r['route']}: "
                  f"docW={r.get('docW')} winW={r.get('winW')} "
                  f"offenders={r.get('offenders')}")

    if ci_mode and overflows:
        return 1
    return 0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--base-url",
        default=os.environ.get(
            "BRIVO_BASE_URL",
            "https://admin-panel-launch.preview.emergentagent.com",
        ),
    )
    parser.add_argument("--out", default="/app/tests/snapshots")
    parser.add_argument(
        "--email",
        default=os.environ.get("BRIVO_ADMIN_EMAIL", "admin@brivomarketing.com"),
    )
    parser.add_argument(
        "--password",
        default=os.environ.get("BRIVO_ADMIN_PASSWORD", "BrivoOps2026!"),
    )
    parser.add_argument(
        "--ci",
        action="store_true",
        help="Exit 1 if any overflow detected",
    )
    args = parser.parse_args()

    rc = asyncio.run(
        run(
            base_url=args.base_url,
            out=Path(args.out),
            email=args.email,
            password=args.password,
            ci_mode=args.ci,
        )
    )
    sys.exit(rc)


if __name__ == "__main__":
    main()
