#!/usr/bin/env bash
set -Eeuo pipefail

PUBLIC_URL="${1:-http://127.0.0.1}"
PUBLIC_KEY_FILE="${2:-/tmp/voljsky-bereg-deploy.pub}"
APP_ROOT="/opt/voljsky-bereg"
ENV_DIR="/etc/voljsky-bereg"
ENV_FILE="$ENV_DIR/production.env"
APP_USER="voljsky"
DEPLOY_USER="deploy"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this script as root." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl gnupg nginx openssl postgresql postgresql-contrib rsync

if ! command -v node >/dev/null 2>&1 || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]]; then
  curl --fail --silent --show-error https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

id "$APP_USER" >/dev/null 2>&1 || useradd --system --create-home --home-dir "$APP_ROOT" --shell /usr/sbin/nologin "$APP_USER"
id "$DEPLOY_USER" >/dev/null 2>&1 || useradd --create-home --shell /bin/bash "$DEPLOY_USER"

install -d -o "$APP_USER" -g "$APP_USER" -m 750 "$APP_ROOT" "$APP_ROOT/releases"
install -d -o root -g root -m 750 "$ENV_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  DB_PASSWORD="$(openssl rand -hex 24)"
  PAYLOAD_SECRET="$(openssl rand -hex 32)"
  CRON_SECRET="$(openssl rand -hex 24)"
  PREVIEW_SECRET="$(openssl rand -hex 24)"
  cat > "$ENV_FILE" <<EOF
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=3000
NEXT_PUBLIC_SERVER_URL=$PUBLIC_URL
DATABASE_URL=postgresql://voljsky:$DB_PASSWORD@127.0.0.1:5432/voljsky_bereg
PAYLOAD_SECRET=$PAYLOAD_SECRET
CRON_SECRET=$CRON_SECRET
PREVIEW_SECRET=$PREVIEW_SECRET
YCLIENTS_DEMO_MODE=true
YCLIENTS_DEMO_COMPANY_ID=4564
YCLIENTS_NATIVE_FLOW=true
EOF
  chmod 600 "$ENV_FILE"
fi

DB_PASSWORD="$(sed -n 's/^DATABASE_URL=postgresql:\/\/voljsky:\([^@]*\)@.*/\1/p' "$ENV_FILE")"
if [[ -z "$DB_PASSWORD" ]]; then
  echo "DATABASE_URL in $ENV_FILE has an unexpected format." >&2
  exit 1
fi

systemctl enable --now postgresql
runuser -u postgres -- psql -v ON_ERROR_STOP=1 -c "DO \\$\\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'voljsky') THEN CREATE ROLE voljsky LOGIN PASSWORD '$DB_PASSWORD'; ELSE ALTER ROLE voljsky WITH LOGIN PASSWORD '$DB_PASSWORD'; END IF; END \\$\\$;"
if ! runuser -u postgres -- psql -tAc "SELECT 1 FROM pg_database WHERE datname='voljsky_bereg'" | grep -q 1; then
  runuser -u postgres -- createdb -O "$APP_USER" voljsky_bereg
fi

install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 700 "/home/$DEPLOY_USER/.ssh"
if [[ -f "$PUBLIC_KEY_FILE" ]]; then
  install -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 600 "$PUBLIC_KEY_FILE" "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi
cat > "/etc/sudoers.d/voljsky-bereg" <<EOF
$DEPLOY_USER ALL=(root) NOPASSWD: /usr/local/sbin/voljsky-bereg-deploy *
EOF
chmod 440 "/etc/sudoers.d/voljsky-bereg"

if [[ -f /tmp/voljsky-bereg-deploy.sh ]]; then
  install -o root -g root -m 750 /tmp/voljsky-bereg-deploy.sh /usr/local/sbin/voljsky-bereg-deploy
fi

cat > /etc/systemd/system/voljsky-bereg.service <<EOF
[Unit]
Description=Voljsky Bereg Next.js application
After=network-online.target postgresql.service
Wants=network-online.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_ROOT/current
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/node $APP_ROOT/current/server.js
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/nginx/sites-available/voljsky-bereg <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
ln -sfn /etc/nginx/sites-available/voljsky-bereg /etc/nginx/sites-enabled/voljsky-bereg
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl daemon-reload
systemctl enable nginx
systemctl restart nginx
systemctl enable voljsky-bereg.service

echo "Bootstrap complete. Node: $(node --version)"
