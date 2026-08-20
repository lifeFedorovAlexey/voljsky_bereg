#!/usr/bin/env bash
set -Eeuo pipefail

VERSION="${1:?release version is required}"
ARCHIVE="${2:?release archive is required}"
APP_ROOT="/opt/voljsky-bereg"
RELEASES_DIR="$APP_ROOT/releases"
MEDIA_DIR="$APP_ROOT/shared/media"
CURRENT_LINK="$APP_ROOT/current"
RELEASE_DIR="$RELEASES_DIR/$VERSION"
SERVICE="voljsky-bereg.service"
HEALTH_URL="http://127.0.0.1:3000/"
SEED_URL="http://127.0.0.1:3000/next/seed"
ENV_FILE="/etc/voljsky-bereg/production.env"

if [[ ! -f "$ARCHIVE" ]]; then
  echo "Release archive not found: $ARCHIVE" >&2
  exit 1
fi

mkdir -p "$RELEASES_DIR" "$MEDIA_DIR"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
tar -xzf "$ARCHIVE" -C "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR/public"
rm -rf "$RELEASE_DIR/public/media"
ln -s "$MEDIA_DIR" "$RELEASE_DIR/public/media"
if [[ ! -L "$RELEASE_DIR/public/media" || "$(readlink -f "$RELEASE_DIR/public/media")" != "$(readlink -f "$MEDIA_DIR")" ]]; then
  echo "Persistent media link is invalid for release $VERSION" >&2
  exit 1
fi
chown -R voljsky:voljsky "$RELEASE_DIR"
chown -R voljsky:voljsky "$MEDIA_DIR"

PREVIOUS=""
if [[ -L "$CURRENT_LINK" ]]; then
  PREVIOUS="$(readlink -f "$CURRENT_LINK")"
fi

ln -sfn "$RELEASE_DIR" "$APP_ROOT/current.next"
mv -Tf "$APP_ROOT/current.next" "$CURRENT_LINK"
systemctl restart "$SERVICE"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1091
  . "$ENV_FILE"
  set +a
fi

if [[ "${PAYLOAD_DB_PUSH:-}" == "true" && -n "${BOOTSTRAP_SEED_SECRET:-}" ]]; then
  seeded=0
  for attempt in $(seq 1 30); do
    if curl --fail --silent --show-error --max-time 5 \
      -X POST \
      -H "Authorization: Bearer $BOOTSTRAP_SEED_SECRET" \
      "$SEED_URL" >/dev/null; then
      seeded=1
      break
    fi
    sleep 2
  done

  if [[ "$seeded" -ne 1 ]]; then
    echo "Production seed failed for release $VERSION" >&2
    exit 1
  fi

  sed -i '/^PAYLOAD_DB_PUSH=/d' "$ENV_FILE"
  systemctl restart "$SERVICE"
fi

if grep -q '^PAYLOAD_DB_PUSH=' "$ENV_FILE"; then
  echo "One-time production schema/seed flag must not remain enabled" >&2
  exit 1
fi

healthy=0
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 5 "$HEALTH_URL" >/dev/null; then
    healthy=1
    break
  fi
  sleep 2
done

if [[ "$healthy" -ne 1 ]]; then
  echo "Healthcheck failed for release $VERSION" >&2
  if [[ -n "$PREVIOUS" && -d "$PREVIOUS" ]]; then
    ln -sfn "$PREVIOUS" "$APP_ROOT/current.next"
    mv -Tf "$APP_ROOT/current.next" "$CURRENT_LINK"
    systemctl restart "$SERVICE"
  fi
  exit 1
fi

rm -f "$ARCHIVE"
find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
  | sort -nr \
  | tail -n +6 \
  | cut -d' ' -f2- \
  | xargs -r rm -rf

echo "Deployed $VERSION successfully"
