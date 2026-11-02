import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const pkg = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
const config = JSON.parse(await readFile(new URL("capacitor.config.json", root), "utf8"));
const workflow = await readFile(new URL(".github/workflows/ios-project.yml", root), "utf8");
const ignore = await readFile(new URL(".gitignore", root), "utf8");
const guide = await readFile(new URL("MOBILE_RELEASE.md", root), "utf8");

assert.equal(config.appName, "Orbital Drift");
assert.equal(config.webDir, "dist", "Native app must package bundled game assets, not use a remote URL");
assert.match(config.appId, /^[A-Za-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$/);
assert.equal(config.server, undefined, "Release shell must not depend on a remote game server");
assert.equal(config.ios?.contentInset, "never", "Keep iOS viewport safe-area calculations in game CSS");
for (const name of ["@capacitor/core", "@capacitor/cli", "@capacitor/ios"]) {
  assert.equal(pkg.devDependencies?.[name], "8.6.0", `Pin ${name} to the same version`);
}
assert.equal(pkg.scripts?.["ios:sync"], "npm run build:mobile && cap sync ios");
assert.match(workflow, /workflow_dispatch:/, "Create iOS project only when intentionally requested");
assert.match(workflow, /macos-latest/, "Generate Xcode project on a macOS runner");
assert.match(workflow, /npm run build:mobile/);
assert.match(workflow, /npx cap add ios/);
assert.match(workflow, /npx cap sync ios/);
assert.match(workflow, /actions\/upload-artifact@v4/);
assert.match(ignore, /node_modules\//);
assert.match(guide, /provisional/i, "Do not imply Bundle ID is approved for production");
assert.match(guide, /TestFlight/, "Native device testing must remain an explicit gate");
console.log("iOS wrapper configuration passed: local assets, pinned tooling, manual macOS project export, and release safeguards.");
