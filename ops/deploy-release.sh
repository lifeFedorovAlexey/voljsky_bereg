#!/usr/bin/env bash
set -Eeuo pipefail

VERSION="${1:?release version is required}"
ARCHIVE="${2:?release archive is required}"
APP_ROOT="/opt/voljsky-bereg"
RELEASES_DIR="$APP_ROOT/releases"
CURRENT_LINK="$APP_ROOT/current"
RELEASE_DIR="$RELEASES_DIR/$VERSION"
SERVICE="voljsky-bereg.service"
HEALTH_URL="http://127.0.0.1:3000/"

if [[ ! -f "$ARCHIVE" ]]; then
  echo "Release archive not found: $ARCHIVE" >&2
  exit 1
fi

mkdir -p "$RELEASES_DIR"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
tar -xzf "$ARCHIVE" -C "$RELEASE_DIR"
chown -R voljsky:voljsky "$RELEASE_DIR"

PREVIOUS=""
if [[ -L "$CURRENT_LINK" ]]; then
  PREVIOUS="$(readlink -f "$CURRENT_LINK")"
fi

ln -sfn "$RELEASE_DIR" "$APP_ROOT/current.next"
mv -Tf "$APP_ROOT/current.next" "$CURRENT_LINK"
systemctl restart "$SERVICE"

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
