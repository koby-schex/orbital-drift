#!/usr/bin/env bash
set -euo pipefail
# Credential-gated manual TestFlight distribution. Never run on PRs.
ACTION="${1:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="${RUNNER_TEMP:-/tmp}/orbital-drift-distribution"
KEYCHAIN="$WORK/release.keychain-db"
KEYCHAIN_PASSWORD_FILE="$WORK/keychain-password"
CERT_FILE="$WORK/distribution.p12"
PROFILE_FILE="$WORK/distribution.mobileprovision"
PROFILE_PLIST="$WORK/profile.plist"
ARCHIVE="$WORK/OrbitalDrift.xcarchive"
EXPORT="$WORK/export"
EXPORT_OPTIONS="$WORK/ExportOptions.plist"

require_nonempty() {
  local key
  for key in "$@"; do
    if [[ -z "${!key:-}" ]]; then
      echo "::error::Required iOS release setting $key is missing. Configure the ios-release GitHub environment." >&2
      exit 1
    fi
  done
}

case "$ACTION" in
  preflight)
    require_nonempty IOS_TEAM_ID IOS_BUNDLE_ID IOS_DISTRIBUTION_CERTIFICATE_BASE64 IOS_DISTRIBUTION_CERTIFICATE_PASSWORD IOS_PROVISIONING_PROFILE_BASE64
    [[ "${GITHUB_REF:-}" == "refs/heads/main" ]] || { echo "::error::Distribution must run from main"; exit 1; }
    [[ "$IOS_TEAM_ID" =~ ^[A-Z0-9]{10}$ ]] || { echo "::error::Invalid Apple Team ID"; exit 1; }
    [[ "$IOS_BUNDLE_ID" =~ ^[a-zA-Z0-9.-]+$ ]] || { echo "::error::Invalid Bundle ID"; exit 1; }
    CONFIG_BUNDLE_ID="$(node -p 'JSON.parse(require("fs").readFileSync("capacitor.config.json","utf8")).appId')"
    [[ "$IOS_BUNDLE_ID" == "$CONFIG_BUNDLE_ID" ]] || {
      echo "::error::Registered Bundle ID must match capacitor.config.json ($CONFIG_BUNDLE_ID)"; exit 1;
    }
    echo "Signed distribution preflight passed for registered Bundle ID $IOS_BUNDLE_ID."
    ;;
  import)
    require_nonempty IOS_DISTRIBUTION_CERTIFICATE_BASE64 IOS_DISTRIBUTION_CERTIFICATE_PASSWORD IOS_PROVISIONING_PROFILE_BASE64
    mkdir -p "$WORK" "$HOME/Library/MobileDevice/Provisioning Profiles"
    chmod 700 "$WORK"
    printf '%s' "$IOS_DISTRIBUTION_CERTIFICATE_BASE64" | base64 --decode > "$CERT_FILE"
    printf '%s' "$IOS_PROVISIONING_PROFILE_BASE64" | base64 --decode > "$PROFILE_FILE"
    security cms -D -i "$PROFILE_FILE" > "$PROFILE_PLIST"
    PROFILE_TEAM=$(/usr/libexec/PlistBuddy -c 'Print :TeamIdentifier:0' "$PROFILE_PLIST")
    PROFILE_BUNDLE=$(/usr/libexec/PlistBuddy -c 'Print :Entitlements:application-identifier' "$PROFILE_PLIST")
    PROFILE_UUID=$(/usr/libexec/PlistBuddy -c 'Print :UUID' "$PROFILE_PLIST")
    [[ "$PROFILE_TEAM" == "$IOS_TEAM_ID" && "$PROFILE_BUNDLE" == "$IOS_TEAM_ID.$IOS_BUNDLE_ID" ]] || {
      echo "::error::Provisioning profile does not match this Apple team and exact Bundle ID"; exit 1;
    }
    python3 - "$PROFILE_PLIST" <<'PY'
import plistlib,sys,datetime
with open(sys.argv[1],"rb") as f: p=plistlib.load(f)
if p["ExpirationDate"] <= datetime.datetime.utcnow():
    raise SystemExit("::error::Provisioning profile has expired")
if p.get("ProvisionedDevices") or p.get("ProvisionsAllDevices"):
    raise SystemExit("::error::Expected an App Store distribution provisioning profile, not device/ad-hoc")
PY
    cp "$PROFILE_FILE" "$HOME/Library/MobileDevice/Provisioning Profiles/$PROFILE_UUID.mobileprovision"
    chmod 600 "$CERT_FILE" "$PROFILE_FILE"
    /usr/bin/uuidgen > "$KEYCHAIN_PASSWORD_FILE"
    chmod 600 "$KEYCHAIN_PASSWORD_FILE"
    security create-keychain -p "$(cat "$KEYCHAIN_PASSWORD_FILE")" "$KEYCHAIN"
    security set-keychain-settings -lut 21600 "$KEYCHAIN"
    security unlock-keychain -p "$(cat "$KEYCHAIN_PASSWORD_FILE")" "$KEYCHAIN"
    security import "$CERT_FILE" -k "$KEYCHAIN" -P "$IOS_DISTRIBUTION_CERTIFICATE_PASSWORD" -T /usr/bin/codesign
    security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$(cat "$KEYCHAIN_PASSWORD_FILE")" "$KEYCHAIN"
    security list-keychains -d user -s "$KEYCHAIN" "$HOME/Library/Keychains/login.keychain-db"
    security find-identity -v -p codesigning "$KEYCHAIN" | grep -F "Apple Distribution" >/dev/null || {
      echo "::error::Certificate is not an Apple Distribution signing identity"; exit 1;
    }
    printf '%s' "$PROFILE_UUID" > "$WORK/profile-uuid"
    echo "Distribution certificate and matching App Store provisioning profile imported."
    ;;
  archive)
    test -s "$WORK/profile-uuid"
    PROFILE_UUID="$(cat "$WORK/profile-uuid")"
    mkdir -p "$EXPORT"
    xcodebuild archive \
      -project ios/App/App.xcodeproj \
      -scheme App \
      -configuration Release \
      -destination 'generic/platform=iOS' \
      -archivePath "$ARCHIVE" \
      DEVELOPMENT_TEAM="$IOS_TEAM_ID" \
      CODE_SIGN_STYLE=Manual \
      CODE_SIGN_IDENTITY="Apple Distribution" \
      PROVISIONING_PROFILE_SPECIFIER="$PROFILE_UUID"
    test -d "$ARCHIVE/Products/Applications/App.app"
    /usr/libexec/PlistBuddy -c "Add :method string app-store-connect" "$EXPORT_OPTIONS"
    /usr/libexec/PlistBuddy -c "Add :signingStyle string manual" "$EXPORT_OPTIONS"
    /usr/libexec/PlistBuddy -c "Add :teamID string $IOS_TEAM_ID" "$EXPORT_OPTIONS"
    /usr/libexec/PlistBuddy -c "Add :provisioningProfiles dict" "$EXPORT_OPTIONS"
    /usr/libexec/PlistBuddy -c "Add :provisioningProfiles:$IOS_BUNDLE_ID string $PROFILE_UUID" "$EXPORT_OPTIONS"
    xcodebuild -exportArchive -archivePath "$ARCHIVE" -exportPath "$EXPORT" -exportOptionsPlist "$EXPORT_OPTIONS"
    shopt -s nullglob
    IPA_FILES=("$EXPORT"/*.ipa)
    [[ ${#IPA_FILES[@]} -eq 1 ]] || { echo "::error::Expected one signed IPA"; exit 1; }
    codesign --verify --deep --strict "$ARCHIVE/Products/Applications/App.app"
    echo "One distribution-signed IPA exported for private review."
    ;;
  upload)
    require_nonempty APPSTORE_API_KEY_ID APPSTORE_ISSUER_ID APPSTORE_API_PRIVATE_KEY
    [[ "${GITHUB_EVENT_NAME:-}" == "workflow_dispatch" && "${GITHUB_REF:-}" == "refs/heads/main" ]] || {
      echo "::error::TestFlight upload must be a manual main-branch dispatch"; exit 1;
    }
    mkdir -p "$HOME/.appstoreconnect/private_keys"
    umask 077
    printf '%s' "$APPSTORE_API_PRIVATE_KEY" > "$HOME/.appstoreconnect/private_keys/AuthKey_${APPSTORE_API_KEY_ID}.p8"
    shopt -s nullglob
    IPA_FILES=("$EXPORT"/*.ipa)
    [[ ${#IPA_FILES[@]} -eq 1 ]] || { echo "::error::No signed IPA available for upload"; exit 1; }
    xcrun altool --upload-app --type ios --file "${IPA_FILES[0]}" --apiKey "$APPSTORE_API_KEY_ID" --apiIssuer "$APPSTORE_ISSUER_ID"
    echo "Apple upload requested; verify processing in App Store Connect before inviting testers."
    ;;
  cleanup)
    if [[ -f "$KEYCHAIN_PASSWORD_FILE" ]]; then
      security delete-keychain "$KEYCHAIN" >/dev/null 2>&1 || true
    fi
    rm -rf "$WORK" "$HOME/.appstoreconnect/private_keys/AuthKey_${APPSTORE_API_KEY_ID:-unknown}.p8"
    echo "Temporary signing materials cleared."
    ;;
  *)
    echo "Usage: $0 {preflight|import|archive|upload|cleanup}" >&2
    exit 2
    ;;
esac
