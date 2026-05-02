#!/usr/bin/env bash
# BrivoMarketing Auto-Poster — one-click installer for macOS.
#
# Usage on the Mac you want to host the agent:
#   curl -fsSL https://admin-panel-launch.preview.emergentagent.com/agent-host/install.sh | bash
#
# Or, with backend already provisioned and a pair code in hand:
#   curl -fsSL https://.../install.sh | bash -s -- --code 123456 --name "Mac mini"

set -euo pipefail

BACKEND_URL="${BRIVO_BACKEND_URL:-https://admin-panel-launch.preview.emergentagent.com}"
APP_HOME="$HOME/Library/Application Support/BrivoAgent"
LAUNCHD_PLIST="$HOME/Library/LaunchAgents/com.brivomarketing.agent.plist"
LAUNCHD_LABEL="com.brivomarketing.agent"

PAIR_CODE=""
AGENT_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --code)    PAIR_CODE="$2"; shift 2;;
    --name)    AGENT_NAME="$2"; shift 2;;
    --backend) BACKEND_URL="$2"; shift 2;;
    *) echo "unknown arg $1"; exit 1;;
  esac
done

bold()  { printf "\033[1m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*"; }

bold "BrivoMarketing Auto-Poster — one-click install"
echo "  Backend: $BACKEND_URL"
echo "  Install dir: $APP_HOME"
echo

# ---- 1. macOS check
if [[ "$(uname)" != "Darwin" ]]; then
  red "This installer targets macOS. For Linux, install Python 3.11 + Playwright manually."
  exit 1
fi

# ---- 2. Homebrew + Python
if ! command -v brew >/dev/null 2>&1; then
  bold "→ Installing Homebrew (5 min)"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

bold "→ Installing Python 3.11"
brew list python@3.11 >/dev/null 2>&1 || brew install python@3.11

PYTHON="$(brew --prefix)/opt/python@3.11/bin/python3.11"

# ---- 3. App dir + venv
mkdir -p "$APP_HOME"
cd "$APP_HOME"

if [[ ! -d "$APP_HOME/venv" ]]; then
  bold "→ Creating venv"
  "$PYTHON" -m venv "$APP_HOME/venv"
fi

source "$APP_HOME/venv/bin/activate"
pip install --quiet --upgrade pip
pip install --quiet websockets httpx playwright

bold "→ Installing Chromium (one-time, ~150MB)"
playwright install chromium

# ---- 4. Drop agent.py
bold "→ Downloading latest agent.py"
curl -fsSL "$BACKEND_URL/agent-host/agent.py" -o "$APP_HOME/agent.py"

# ---- 5. login.sh helper
cat > "$APP_HOME/login.sh" <<EOF
#!/usr/bin/env bash
# Open the persistent Chromium so you can log into IG/X/LinkedIn manually.
set -e
cd "$APP_HOME"
exec "$APP_HOME/venv/bin/python" - <<PY
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            "${HOME}/.brivo_agent/chromium-profile",
            headless=False,
            viewport={"width": 1280, "height": 900},
        )
        page = await ctx.new_page()
        await page.goto("https://x.com/login")
        print("→ Log into X / Instagram / LinkedIn in this window.")
        print("→ Close the window when done.")
        try:
            await ctx.wait_for_event("close", timeout=0)
        except Exception:
            pass
asyncio.run(main())
PY
EOF
chmod +x "$APP_HOME/login.sh"

# ---- 6. Pair if code provided
if [[ -z "$PAIR_CODE" ]]; then
  bold "→ Pair this Mac with the BrivoMarketing dashboard"
  read -r -p "  Enter the 6-digit pair code: " PAIR_CODE
fi
if [[ -z "$AGENT_NAME" ]]; then
  AGENT_NAME="$(scutil --get ComputerName 2>/dev/null || echo 'Mac mini')"
fi

bold "→ Pairing as \"$AGENT_NAME\""
BRIVO_BACKEND_URL="$BACKEND_URL" \
  "$APP_HOME/venv/bin/python" "$APP_HOME/agent.py" \
  --backend "$BACKEND_URL" --pair "$PAIR_CODE" "$AGENT_NAME"

# ---- 7. launchd daemon — keep running across reboots
bold "→ Installing launchd daemon ($LAUNCHD_LABEL)"
mkdir -p "$HOME/Library/LaunchAgents"
cat > "$LAUNCHD_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LAUNCHD_LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$APP_HOME/venv/bin/python</string>
    <string>$APP_HOME/agent.py</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>BRIVO_BACKEND_URL</key>
    <string>$BACKEND_URL</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key>
  <string>$APP_HOME/agent.out.log</string>
  <key>StandardErrorPath</key>
  <string>$APP_HOME/agent.err.log</string>
</dict>
</plist>
PLIST

launchctl unload "$LAUNCHD_PLIST" >/dev/null 2>&1 || true
launchctl load "$LAUNCHD_PLIST"

# ---- 8. Anti-sleep
bold "→ Disabling sleep on AC power (needs sudo, optional)"
sudo pmset -c sleep 0 disksleep 0 womp 1 || \
  echo "  (skipped — re-run \`sudo pmset -c sleep 0 womp 1\` later if you want)"

green "✓ Install complete."
echo
echo "  Next steps:"
echo "    1. Run:  open \"$APP_HOME/login.sh\""
echo "       (a Chromium opens — log into Instagram, X, LinkedIn manually,"
echo "        finish any 2FA, then close the window)"
echo
echo "    2. Watch the dashboard at $BACKEND_URL/admin/social — your Mac"
echo "       will show as ONLINE within ~30s."
echo
echo "  Logs: $APP_HOME/agent.out.log"
echo "  Stop: launchctl unload \"$LAUNCHD_PLIST\""
echo "  Start: launchctl load   \"$LAUNCHD_PLIST\""
