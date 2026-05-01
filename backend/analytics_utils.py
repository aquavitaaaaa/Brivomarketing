"""
Analytics helpers — parse user-agent + optionally resolve geo from IP.
Geo lookup is best-effort (ipapi.co free tier, no key). Swallow errors silently.
"""
import httpx
from typing import Optional


def parse_user_agent(ua: Optional[str]) -> dict:
    """Extremely lightweight UA parser — no third-party dep.
    Returns {device, os, browser}."""
    ua = (ua or "").lower()

    if "mobi" in ua or "iphone" in ua or "android" in ua and "mobile" in ua:
        device = "mobile"
    elif "ipad" in ua or "tablet" in ua:
        device = "tablet"
    else:
        device = "desktop"

    if "windows" in ua:
        os_name = "Windows"
    elif "mac os x" in ua or "macintosh" in ua:
        os_name = "macOS"
    elif "android" in ua:
        os_name = "Android"
    elif "iphone" in ua or "ipad" in ua or "ipod" in ua:
        os_name = "iOS"
    elif "linux" in ua:
        os_name = "Linux"
    else:
        os_name = "Other"

    if "edg/" in ua:
        browser = "Edge"
    elif "chrome/" in ua and "safari/" in ua and "edg/" not in ua:
        browser = "Chrome"
    elif "firefox/" in ua:
        browser = "Firefox"
    elif "safari/" in ua and "chrome/" not in ua:
        browser = "Safari"
    else:
        browser = "Other"

    return {"device": device, "os": os_name, "browser": browser}


async def resolve_geo(ip: Optional[str]) -> dict:
    """Resolve IP to country/city via ipapi.co — free, no key, best-effort."""
    if not ip or ip.startswith(("127.", "10.", "172.", "192.168.")):
        return {"country": None, "country_code": None, "city": None, "region": None}
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"https://ipapi.co/{ip}/json/")
        if r.status_code == 200:
            d = r.json()
            return {
                "country": d.get("country_name"),
                "country_code": d.get("country_code"),
                "city": d.get("city"),
                "region": d.get("region"),
            }
    except Exception:
        pass
    return {"country": None, "country_code": None, "city": None, "region": None}


def client_ip_from_request(request) -> Optional[str]:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    real = request.headers.get("x-real-ip")
    if real:
        return real.strip()
    return request.client.host if request.client else None
