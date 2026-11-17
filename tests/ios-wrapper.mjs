import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const pkg = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const config = JSON.parse(await readFile(new URL("capacitor.config.json", root), "utf8"));
const workflow = await readFile(new URL(".github/workflows/ios-project.yml", root), "utf8");
const ignore = await readFile(new URL(".gitignore", root), "utf8");
const guide = await readFile(new URL("MOBILE_RELEASE.md", root), "utf8");
const smoke = await readFile(new URL("scripts/smoke-ios-simulator.sh", root), "utf8");

assert.equal(config.appName, "Orbital Drift");
assert.equal(config.webDir, "dist", "Native app must package bundled game assets, not use a remote URL");
assert.match(config.appId, /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$/);
assert.equal(config.server, undefined, "Release shell must not depend on a remote game server");
assert.equal(config.ios?.contentInset, "never", "Keep iOS viewport safe-area calculations in game CSS");
for (const name of ["@capacitor/core", "@capacitor/cli", "@capacitor/ios"]) {
  assert.equal(pkg.devDependencies?.[name], "8.6.0", `Pin ${name} to the same version`);
}
assert.equal(pkg.scripts?.["ios:sync"], "npm run build:mobile && cap sync ios");
assert.match(workflow, /workflow_dispatch:/, "Permit manual iOS Simulator builds");
assert.match(workflow, /pull_request:/, "Verify native simulator launch before merging native changes");
assert.match(workflow, /push:\s*\n\s*branches:\s*\n\s*- main/, "Compile iOS after main merges");
assert.match(workflow, /\.github\/workflows\/ios-project\.yml/, "Workflow edits must trigger a native compile");
assert.match(workflow, /- index\.html/, "Gameplay changes must trigger a native compile");
assert.match(workflow, /- capacitor\.config\.json/, "Native shell changes must trigger a native compile");
assert.match(workflow, /runs-on:\s*macos-(?:latest|15|26)\b/, "Generate Xcode project on a supported macOS runner");
assert.match(workflow, /npm run build:mobile/);
assert.match(workflow, /npx cap add ios --packagemanager SPM/, "Use Capacitor 8 native SPM project");
assert.match(workflow, /npx cap sync ios/);
assert.match(workflow, /xcodebuild -version/, "Verify Xcode toolchain on macOS");
assert.match(workflow, /-project ios\/App\/App\.xcodeproj/, "Compile the generated native Xcode project");
assert.match(workflow, /-sdk iphonesimulator/, "Use an iOS Simulator build without Apple signing");
assert.match(workflow, /CODE_SIGNING_ALLOWED=NO/, "Never require developer secrets in unsigned CI");
assert.match(workflow, /Debug-iphonesimulator\/App\.app/, "Prove native app output exists");
assert.match(workflow, /actions\/upload-artifact@v4/);
assert.match(workflow, /bash scripts\/smoke-ios-simulator\.sh/, "Actually launch the app in iPhone Simulator");
assert.match(workflow, /simulator-smoke-evidence/, "Upload screenshot evidence from native app");
assert.match(smoke, /xcrun simctl bootstatus/, "Wait for simulator startup");
assert.match(smoke, /xcrun simctl install/, "Install the compiled app");
assert.match(smoke, /xcrun simctl launch/g, "Launch and relaunch native app");
assert.match(smoke, /xcrun simctl terminate/, "Exercise lifecycle recovery");
assert.match(smoke, /xcrun simctl io.*screenshot/, "Capture native screenshots");
assert.match(smoke, /UIInterfaceOrientationPortrait/, "Verify compiled app orientation");
assert.match(ignore, /node_modules\//);
assert.match(guide, /provisional/i, "Do not imply Bundle ID is approved for production");
assert.match(guide, /TestFlight/, "Native device testing must remain an explicit gate");
console.log("iOS wrapper configuration passed: local assets, pinned tooling, automatic main-branch macOS simulator compile, and release safeguards.");
