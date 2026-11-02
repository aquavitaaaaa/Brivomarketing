#!/usr/bin/env bash
# BrivoMarketing — production deploy for a single Ubuntu box (e.g. 67.217.246.13).
# Run as root on the server. Safe to re-run: rebuilds frontend, restarts backend.
set -euo pipefail

DOMAIN="${1:-brivomarketing.com}"
APP_DIR="/opt/brivo"
REPO="https://github.com/aquavitaaaaa/Brivomarketing.git"

echo "== BrivoMarketing deploy: $DOMAIN =="

# ---- 1. system deps ----
apt-get update -qq
apt-get install -y -qq python3 python3-venv python3-pip nginx mongodb certbot python3-certbot-nginx curl > /dev/null

# ---- 2. code ----
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin main
  git -C "$APP_DIR" reset --hard origin/main
fi
cd "$APP_DIR"

# ---- 3. backend venv ----
if [ ! -d "$APP_DIR/backend/venv" ]; then
  python3 -m venv "$APP_DIR/backend/venv"
fi
"$APP_DIR/backend/venv/bin/pip" install -q --upgrade pip
"$APP_DIR/backend/venv/bin/pip" install -q -r "$APP_DIR/backend/requirements.txt"

# ---- 4. backend env (never overwritten if it exists) ----
if [ ! -f "$APP_DIR/backend/.env" ]; then
  cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
  echo "!! Created backend/.env from example — EDIT IT NOW (ADMIN_PASSWORD, JWT_SECRET, CORS_ORIGINS) !!"
fi

# ---- 5. frontend build ----
export REACT_APP_BACKEND_URL="https://$DOMAIN"
export NODE_ENV=production
if ! command -v yarn >/dev/null 2>&1; then
  npm install -g yarn > /dev/null
fi
cd "$APP_DIR/frontend"
yarn install --frozen-lockfile
python3 "$APP_DIR/scripts/gen_sitemap.py" "https://$DOMAIN"
yarn build

# ---- 6. nginx ----
cat > /etc/nginx/sites-available/brivo <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $APP_DIR/frontend/build;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /agent-host/ {
        alias $APP_DIR/agent_host/;
        autoindex off;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/brivo /etc/nginx/sites-enabled/brivo
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ---- 7. backend service ----
cat > /etc/systemd/system/brivo-backend.service <<SVC
[Unit]
Description=BrivoMarketing FastAPI backend
After=network.target mongod.service
Wants=mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/backend
EnvironmentFile=$APP_DIR/backend/.env
ExecStart=$APP_DIR/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVC
systemctl daemon-reload
systemctl enable --now mongod 2>/dev/null || systemctl enable --now mongodb 2>/dev/null || true
systemctl enable --now brivo-backend
systemctl restart brivo-backend

# ---- 8. HTTPS (needs DNS already pointing here) ----
if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
  echo "HTTPS ready."
else
  echo "!! certbot skipped/failed — point DNS at this box first, then re-run this script. !!"
fi

echo "== Done. Check: https://$DOMAIN and https://$DOMAIN/api/ =="
