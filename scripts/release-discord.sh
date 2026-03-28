#!/usr/bin/env bash
set -euo pipefail

TITLE="${1:-Wedding release}"
VERSION="${2:-}"
NOTES_FILE="${3:-}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

source /Users/jihun/StudioProjects/dash/.env
WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-${OMC_DISCORD_WEBHOOK_URL:-}}"

if [[ -z "$WEBHOOK_URL" ]]; then
  echo "ERR_NO_WEBHOOK"
  exit 1
fi

if [[ -z "$VERSION" ]]; then
  VERSION="$(git -C "$ROOT_DIR" describe --tags --abbrev=0 2>/dev/null || true)"
fi

if [[ -z "$VERSION" ]]; then
  echo "[FAIL] version is required"
  exit 1
fi

if [[ -z "$NOTES_FILE" ]]; then
  NOTES_FILE="${ROOT_DIR}/dist/releases/wedding_${VERSION}_release_notes.md"
fi

if [[ ! -f "$NOTES_FILE" ]]; then
  echo "[FAIL] release notes file not found: $NOTES_FILE"
  exit 1
fi

COMMIT="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"
PROJECT_NAME="$(basename "$ROOT_DIR")"
ORIGIN_URL="$(git -C "$ROOT_DIR" config --get remote.origin.url 2>/dev/null || true)"

REPO_URL="$ORIGIN_URL"
if [[ "$REPO_URL" == git@github.com:* ]]; then
  REPO_URL="https://github.com/${REPO_URL#git@github.com:}"
fi
REPO_URL="${REPO_URL%.git}"
RELEASE_URL="${REPO_URL}/releases/tag/${VERSION}"

SUMMARY_LINES="$(awk '
  /^## Summary/ { in_summary=1; next }
  /^## / && in_summary { exit }
  in_summary && /^- / { sub(/^- /, "", $0); print; count++; if (count == 3) exit }
' "$NOTES_FILE")"

if [[ -z "$SUMMARY_LINES" ]]; then
  SUMMARY_LINES="변경 요약은 릴리즈 노트를 확인해주세요."
fi

MSG=$(cat <<EOF2
[${PROJECT_NAME}] ${TITLE}

- 커밋: ${COMMIT}
- 변경 요약
$(printf '%s\n' "$SUMMARY_LINES" | sed 's/^/  - /')
- 버전: ${VERSION}
- 릴리스: ${RELEASE_URL}
EOF2
)

PAYLOAD=$(python3 -c 'import json,sys; print(json.dumps({"content": sys.stdin.read()}))' <<< "$MSG")
HTTP_CODE=$(curl -sS -o /tmp/discord_resp.txt -w "%{http_code}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" "$WEBHOOK_URL")

echo "HTTP_CODE=${HTTP_CODE}"

if [[ "$HTTP_CODE" != "204" ]]; then
  cat /tmp/discord_resp.txt
  exit 1
fi
