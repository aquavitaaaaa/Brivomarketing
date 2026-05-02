#!/usr/bin/env bash
# BrivoMarketing Auto-Poster — installer for Linux (systemd).
#
# Usage on the Linux box that should host the agent:
#   curl -fsSL https://admin-panel-launch.preview.emergentagent.com/agent-host/install-linux.sh | bash
set -euo pipefail

BACKEND_URL="${BRIVO_BACKEND_URL:-https://admin-panel-launch.preview.emergentagent.com}"
APP_HOME="$HOME/.local/share/brivo-agent"
SERVICE_NAME="brivo-agent"
PAIR_CODE="${1:-}"
AGENT_NAME="${2:-$(hostname)}"

bold()  { printf "\033[1m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }

bold "BrivoMarketing Auto-Poster — Linux installer"
echo "  Backend: $BACKEND_URL"

# ---- Python 3.11 + venv
if ! command -v python3 >/dev/null; then
  bold "Installing Python 3"
  if command -v apt-get >/dev/null;     then sudo apt-get update && sudo apt-get install -y python3 python3-venv python3-pip
  elif command -v dnf >/dev/null;       then sudo dnf install -y python3 python3-pip
  elif command -v pacman >/dev/null;    then sudo pacman -S --noconfirm python python-pip
  else echo "Install Python 3.11 manually then re-run." && exit 1; fi
fi

mkdir -p "$APP_HOME" && cd "$APP_HOME"
[[ -d venv ]] || python3 -m venv venv
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet websockets httpx playwright

bold "Installing Chromium (one-time)"
playwright install chromium
playwright install-deps chromium 2>/dev/null || true

bold "Downloading agent.py"
curl -fsSL "$BACKEND_URL/agent-host/agent.py" -o "$APP_HOME/agent.py"

# ---- Pair
if [[ -z "$PAIR_CODE" ]]; then
  read -r -p "Enter 6-digit pair code from /admin/social: " PAIR_CODE
fi
BRIVO_BACKEND_URL="$BACKEND_URL" \
  "$APP_HOME/venv/bin/python" "$APP_HOME/agent.py" \
  --backend "$BACKEND_URL" --pair "$PAIR_CODE" "$AGENT_NAME"

# ---- systemd user unit (boots on user login, auto-restarts)
mkdir -p "$HOME/.config/systemd/user"
cat > "$HOME/.config/systemd/user/$SERVICE_NAME.service" <<UNIT
[Unit]
Description=BrivoMarketing Auto-Poster Agent
After=network-online.target

[Service]
Environment=BRIVO_BACKEND_URL=$BACKEND_URL
ExecStart=$APP_HOME/venv/bin/python $APP_HOME/agent.py
Restart=always
RestartSec=10
StandardOutput=append:$APP_HOME/agent.out.log
StandardError=append:$APP_HOME/agent.err.log

[Install]
WantedBy=default.target
UNIT

systemctl --user daemon-reload
systemctl --user enable --now $SERVICE_NAME.service
loginctl enable-linger "$USER" 2>/dev/null || \
  echo "(skip) run: sudo loginctl enable-linger $USER  — to keep the agent running when you're logged out"

green "✓ Install complete."
echo
echo "  Log into IG/X/LinkedIn once (headless host: skip if you've already done it on a desktop):"
echo "    cd $APP_HOME && DISPLAY=:0 venv/bin/python -c \\"
echo "      \"import asyncio; from playwright.async_api import async_playwright; \\"
echo "       asyncio.run((lambda: (lambda p: p.chromium.launch_persistent_context('~/.brivo_agent/chromium-profile', headless=False))()))\""
echo
echo "  Tail logs: tail -f $APP_HOME/agent.out.log"
echo "  Stop:      systemctl --user stop $SERVICE_NAME"
echo "  Start:     systemctl --user start $SERVICE_NAME"
echo "  Status:    systemctl --user status $SERVICE_NAME"
