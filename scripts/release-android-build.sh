#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="${ROOT_DIR}/android"
KEYSTORE_PROPERTIES_PATH="${ANDROID_DIR}/keystore.properties"

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "[FAIL] Missing required environment variable: ${name}"
    exit 1
  fi
}

require_env "ANDROID_KEYSTORE_PATH"
require_env "ANDROID_KEYSTORE_PASSWORD"
require_env "ANDROID_KEY_ALIAS"
require_env "ANDROID_KEY_PASSWORD"

if [[ ! -f "${ANDROID_KEYSTORE_PATH}" ]]; then
  echo "[FAIL] Keystore file not found: ${ANDROID_KEYSTORE_PATH}"
  exit 1
fi

cat > "${KEYSTORE_PROPERTIES_PATH}" <<EOF2
storeFile=${ANDROID_KEYSTORE_PATH}
storePassword=${ANDROID_KEYSTORE_PASSWORD}
keyAlias=${ANDROID_KEY_ALIAS}
keyPassword=${ANDROID_KEY_PASSWORD}
EOF2

if [[ -n "${ANDROID_KEYSTORE_TYPE:-}" ]]; then
  cat >> "${KEYSTORE_PROPERTIES_PATH}" <<EOF2
storeType=${ANDROID_KEYSTORE_TYPE}
EOF2
fi

VERSION="$(node "${ROOT_DIR}/scripts/android-version.mjs" version)"
ARTIFACT_DIR="${ROOT_DIR}/dist/releases"
ARTIFACT_PATH="${ARTIFACT_DIR}/Wedding-v${VERSION}-release.apk"

unset ANDROID_KEYSTORE_PATH
unset ANDROID_KEYSTORE_PASSWORD
unset ANDROID_KEY_ALIAS
unset ANDROID_KEY_PASSWORD
unset ANDROID_KEYSTORE_TYPE

if [[ "${ANDROID_BUILD_DRY_RUN:-0}" == "1" ]]; then
  echo "[PASS] android-build dry-run: version=${VERSION} artifact=${ARTIFACT_PATH}"
  exit 0
fi

npm test
npm run lint
npm run android:prepare

(
  cd "${ANDROID_DIR}"
  ./gradlew assembleRelease
)

SOURCE_APK="${ANDROID_DIR}/app/build/outputs/apk/release/app-release.apk"
if [[ ! -f "${SOURCE_APK}" ]]; then
  echo "[FAIL] Release APK not found: ${SOURCE_APK}"
  exit 1
fi

mkdir -p "${ARTIFACT_DIR}"
cp "${SOURCE_APK}" "${ARTIFACT_PATH}"

echo "[PASS] Built Android release APK: ${ARTIFACT_PATH}"
