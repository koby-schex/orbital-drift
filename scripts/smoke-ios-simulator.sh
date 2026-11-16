#!/usr/bin/env bash
set -euo pipefail

: "${RUNNER_TEMP:?This script runs on a macOS GitHub Actions runner}"
APP_PATH="$RUNNER_TEMP/orbital-drift-derived-data/Build/Products/Debug-iphonesimulator/App.app"
EVIDENCE="$RUNNER_TEMP/orbital-drift-simulator-evidence"
mkdir -p "$EVIDENCE"
test -d "$APP_PATH"
test -f "$APP_PATH/Info.plist"

BUNDLE_ID=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$APP_PATH/Info.plist")
ORIENTATION=$(/usr/libexec/PlistBuddy -c 'Print :UISupportedInterfaceOrientations:0' "$APP_PATH/Info.plist")
test "$ORIENTATION" = "UIInterfaceOrientationPortrait"
test "$BUNDLE_ID" = "com.orbitaldrift.game"

# Choose a real available iPhone Simulator, not a generic simulator build target.
DEVICE_ID="$(xcrun simctl list devices available -j | python3 -c '
import json, sys
payload = json.load(sys.stdin)
devices = [(runtime, device) for runtime, entries in payload["devices"].items()
           if "iOS" in runtime for device in entries
           if device.get("isAvailable", True) and device.get("name","").startswith("iPhone")]
print(devices[0][1]["udid"] if devices else "")
')"
if [[ -z "$DEVICE_ID" ]]; then
  echo "No available iPhone Simulator runtime found on the runner" >&2
  exit 1
fi
echo "Simulator UUID: $DEVICE_ID" | tee "$EVIDENCE/device.txt"
echo "Bundle: $BUNDLE_ID" | tee -a "$EVIDENCE/device.txt"
echo "Orientation: $ORIENTATION" | tee -a "$EVIDENCE/device.txt"

cleanup() { xcrun simctl shutdown "$DEVICE_ID" >/dev/null 2>&1 || true; }
trap cleanup EXIT

xcrun simctl boot "$DEVICE_ID"
xcrun simctl bootstatus "$DEVICE_ID" -b
xcrun simctl install "$DEVICE_ID" "$APP_PATH"

# A successful native process launch verifies more than an unsigned compile.
xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID" | tee "$EVIDENCE/first-launch.txt"
sleep 8
xcrun simctl io "$DEVICE_ID" screenshot "$EVIDENCE/first-launch.png"
test -s "$EVIDENCE/first-launch.png"

# Exercise the native app's terminate/relaunch lifecycle without deleting app data.
xcrun simctl terminate "$DEVICE_ID" "$BUNDLE_ID"
xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID" | tee "$EVIDENCE/relaunch.txt"
sleep 5
xcrun simctl io "$DEVICE_ID" screenshot "$EVIDENCE/relaunch.png"
test -s "$EVIDENCE/relaunch.png"
echo "iPhone Simulator launch/relaunch smoke passed; inspect images for UI defects."
