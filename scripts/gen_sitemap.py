"""Regenerate sitemap.xml + robots.txt for the live domain.
Usage: python3 /app/scripts/gen_sitemap.py https://yourdomain.com
"""
import sys, datetime
base = (sys.argv[1] if len(sys.argv) > 1 else "").rstrip("/")
if not base:
    sys.exit("pass your domain, e.g. https://brivomarketing.com")
paths = ["/", "/partners", "/work/dwj-home-services", "/work/loba-catskill-restaurant",
         "/web-design/home-service-contractors", "/web-design/restaurants"]
today = datetime.date.today().isoformat()
urls = "".join(f"  <url><loc>{base}{p}</loc><lastmod>{today}</lastmod><priority>{'1.0' if p=='/' else '0.8'}</priority></url>\n" for p in paths)
open("/app/frontend/public/sitemap.xml", "w").write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
open("/app/frontend/public/robots.txt", "w").write(f"User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /pair\nDisallow: /api/\n\nSitemap: {base}/sitemap.xml\n")
print("wrote sitemap.xml + robots.txt for", base)
