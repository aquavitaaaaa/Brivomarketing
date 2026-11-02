#!/usr/bin/env bash
# BrivoMarketing — side-by-side deploy on the shared 67.217.246.13 box.
# Does NOT touch existing sites. Uses its own dir, ports, mongo, nginx vhost.
# Run as root. Safe to re-run.
set -euo pipefail

DOMAIN="${1:-brivomarketing.com}"
APP_DIR="/opt/brivo"
BACKEND_PORT="8201"
MONGO_PORT="27027"
REPO="https://github.com/aquavitaaaaa/Brivomarketing.git"

echo "== BrivoMarketing side-by-side deploy: $DOMAIN =="

# ---- 1. system deps (skip what exists) ----
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq python3 python3-venv python3-pip nginx certbot python3-certbot-nginx curl git > /dev/null
command -v docker >/dev/null || { echo "!! docker missing — install docker first. !!"; exit 1; }

# ---- 2. dedicated mongo (own container, own port, own volume) ----
if ! docker ps --format '{{.Names}}' | grep -q '^brivo-mongo$'; then
  docker rm -f brivo-mongo 2>/dev/null || true
  docker run -d --name brivo-mongo --restart unless-stopped \
    -p 127.0.0.1:${MONGO_PORT}:27017 \
    -v brivo-mongo-data:/data/db mongo:7 > /dev/null
  echo "mongo started on 127.0.0.1:${MONGO_PORT}"
fi

# ---- 3. code ----
if [ ! -d "$APP_DIR/.git" ]; then
  git clone --depth 1 -b main "$REPO" "$APP_DIR" || {
    echo "!! git clone failed (private repo?). Copy /opt/brivo manually, then re-run. !!"
    exit 1
  }
else
  git -C "$APP_DIR" fetch origin main
  git -C "$APP_DIR" reset --hard origin/main
fi
cd "$APP_DIR"

# ---- 4. backend venv ----
if [ ! -d "$APP_DIR/backend/venv" ]; then
  python3 -m venv "$APP_DIR/backend/venv"
fi
"$APP_DIR/backend/venv/bin/pip" install -q --upgrade pip
"$APP_DIR/backend/venv/bin/pip" install -q --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ -r "$APP_DIR/backend/requirements.txt"

# ---- 5. backend env (create once, patch keys without overwriting secrets) ----
if [ ! -f "$APP_DIR/backend/.env" ]; then
  cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
  sed -i "s|^MONGO_URL=.*|MONGO_URL=\"mongodb://127.0.0.1:${MONGO_PORT}\"|" "$APP_DIR/backend/.env"
  sed -i "s|^DB_NAME=.*|DB_NAME=\"brivomarketing\"|" "$APP_DIR/backend/.env"
  echo "!! Created backend/.env — EDIT ADMIN_PASSWORD + JWT_SECRET + EMERGENT_LLM_KEY !!"
else
  grep -q "^MONGO_URL=" "$APP_DIR/backend/.env" || echo "MONGO_URL=\"mongodb://127.0.0.1:${MONGO_PORT}\"" >> "$APP_DIR/backend/.env"
  grep -q "^DB_NAME=" "$APP_DIR/backend/.env" || echo 'DB_NAME="brivomarketing"' >> "$APP_DIR/backend/.env"
fi

# ---- 6. frontend build ----
export REACT_APP_BACKEND_URL="https://${DOMAIN}"
export NODE_ENV=production
export PATH="/opt/node20/bin:/opt/node-v20.20.2-linux-x64/bin:$PATH"
command -v node >/dev/null || { echo "!! node missing at /opt/node20 — adjust PATH in script. !!"; exit 1; }
command -v yarn >/dev/null || npm install -g yarn > /dev/null
cd "$APP_DIR/frontend"
yarn install --frozen-lockfile --network-timeout 300000
python3 "$APP_DIR/scripts/gen_sitemap.py" "https://${DOMAIN}"
yarn build

# ---- 7. nginx vhost (brivo only — never touches other sites) ----
cat > /etc/nginx/sites-available/brivo <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    root ${APP_DIR}/frontend/build;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /agent-host/ {
        alias ${APP_DIR}/agent_host/;
        autoindex off;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/brivo /etc/nginx/sites-enabled/brivo
nginx -t && systemctl reload nginx

# ---- 8. backend service (own port, own dir) ----
cat > /etc/systemd/system/brivo-backend.service <<SVC
[Unit]
Description=BrivoMarketing FastAPI backend
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}/backend
EnvironmentFile=${APP_DIR}/backend/.env
ExecStart=${APP_DIR}/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port ${BACKEND_PORT} --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVC
systemctl daemon-reload
systemctl enable --now brivo-backend
systemctl restart brivo-backend
sleep 5
systemctl is-active brivo-backend
curl -s --max-time 8 http://127.0.0.1:${BACKEND_PORT}/api/ || echo "!! backend not answering yet — check journalctl -u brivo-backend !!"

# ---- 9. HTTPS (needs DNS at this box; Cloudflare must be DNS-only for now) ----
if certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
  echo "HTTPS ready."
else
  echo "!! certbot failed — set Cloudflare DNS to DNS-only (grey cloud) pointing at this box, then re-run. !!"
fi

echo "== Done. Check: https://${DOMAIN} and https://${DOMAIN}/api/ =="
