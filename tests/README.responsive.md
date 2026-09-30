# Responsive regression snapshots

Captures screenshots of every public and admin route at 9 viewports — from
**320 px (iPhone SE 1st gen)** up to **1920 px (desktop)** — and asserts none
of them produce horizontal overflow.

## Viewports tested

| Name          | Width | Height | Persona                     |
| ------------- | ----- | ------ | --------------------------- |
| mobile-320    |  320  |  720   | iPhone SE 1st gen (hard floor) |
| mobile-375    |  375  |  812   | iPhone 13 mini              |
| mobile-390    |  390  |  844   | iPhone 14/15                |
| mobile-428    |  428  |  926   | iPhone Pro Max              |
| tablet-768    |  768  | 1024   | iPad portrait               |
| tablet-1024   | 1024  | 1366   | iPad Pro portrait           |
| desktop-1280  | 1280  |  800   | Entry-level laptop          |
| desktop-1440  | 1440  |  900   | MacBook Pro 14"             |
| desktop-1920  | 1920  | 1080   | External display            |

## Routes covered

Public: `/`, `/partners`, `/brand-kit`, `/admin/login`
Admin (auth required): `/admin`, `/admin/leads`, `/admin/social`,
`/admin/affiliates`

Total: 9 viewports × 8 routes = **72 checks** per run.

## Running locally

```bash
pip install playwright==1.47.0
playwright install chromium

# Quick run against the current preview URL:
python3 /app/tests/responsive_snapshots.py --ci
```

## CI integration

Exit code is **0** on pass, **1** on any overflow detected — drop straight
into a GitHub Action or similar:

```yaml
- name: Responsive regression
  run: |
    pip install playwright==1.47.0
    playwright install chromium --with-deps
    python3 tests/responsive_snapshots.py \
      --base-url https://strange-goldberg-8.preview.emergentagent.com \
      --ci
```

A JSON report is written to `tests/snapshots/report.json` and raw JPEGs to
`tests/snapshots/<viewport>/<route>.jpg` for artifact upload.

## Adding a new route

Edit `PUBLIC_ROUTES` or `ADMIN_ROUTES` in `responsive_snapshots.py`. That's it.
