#!/usr/bin/env node
// Apply production-facing metadata and the game's artwork to a newly-generated
// Capacitor iOS project. This must run AFTER cap add/sync and BEFORE xcodebuild.
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = path.join(root, "ios/App/App");
const catalog = path.join(app, "Assets.xcassets/AppIcon.appiconset");
const contentsPath = path.join(catalog, "Contents.json");
const source = path.join(root, "assets/orbital-drift-icon-512.png");
const plist = path.join(app, "Info.plist");
const version = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")).version;
const build = process.env.GITHUB_RUN_NUMBER || "1";
if (!/^\d+\.\d+\.\d+$/.test(version) || !/^\d+$/.test(build))
  throw new Error("Invalid iOS release version/build number");
await access(source);
await access(plist);
await mkdir(catalog, { recursive: true });
const plistBuddy = (command) => execFileSync("/usr/libexec/PlistBuddy", ["-c", command, plist], { stdio: "pipe" }).toString().trim();
function setPlist(key, type, value) {
  try { plistBuddy(`Set :${key} ${value}`); }
  catch { plistBuddy(`Add :${key} ${type} ${value}`); }
}
setPlist("CFBundleDisplayName", "string", "Between the Nine");
setPlist("CFBundleShortVersionString", "string", version);
setPlist("CFBundleVersion", "string", build);
// The source file is the official game icon, not Capacitor's template art.
const imagePath = path.join(catalog, "OrbitalDrift-AppIcon-1024.png");
execFileSync("swift", [path.join(root, "scripts/render-ios-app-icon.swift"), source, imagePath], { stdio: "inherit" });
// Render on an opaque navy canvas, then strip the PNG alpha channel through
// a temporary JPEG. App Store icons must not contain an alpha channel.
const opaqueJpeg = path.join(catalog, "OrbitalDrift-opaque-temporary.jpg");
execFileSync("sips", ["-s", "format", "jpeg", imagePath, "--out", opaqueJpeg], { stdio: "pipe" });
execFileSync("sips", ["-s", "format", "png", opaqueJpeg, "--out", imagePath], { stdio: "pipe" });
await import("node:fs/promises").then(({ unlink }) => unlink(opaqueJpeg));
const contents = JSON.parse(await readFile(contentsPath, "utf8"));
if (!Array.isArray(contents.images) || !contents.images.length)
  throw new Error("Capacitor generated an unexpected AppIcon catalog");
for (const img of contents.images) {
  if (img.platform === "ios" && img.size === "1024x1024") {
    img.filename = path.basename(imagePath);
    continue;
  }
  const size = Number(String(img.size || "").split("x")[0]);
  const scale = Number(String(img.scale || "1").replace("x",""));
  if (!size || !scale) continue;
  const pixels = Math.round(size * scale);
  img.filename = `OrbitalDrift-${pixels}-${String(img.idiom || "ios").replace(/[^a-zA-Z0-9]/g, "")}.png`;
  execFileSync("sips", ["-z", String(pixels), String(pixels), imagePath, "--out", path.join(catalog,img.filename)], { stdio: "pipe" });
}
await writeFile(contentsPath, JSON.stringify(contents, null, 2) + "\n");
console.log(`iOS branding applied: Between the Nine ${version} (${build}), real game AppIcon`);

// StoreKit classes are compiled into the generated native App target.
execFileSync(process.execPath, [path.join(root, "scripts/install-ios-storekit.mjs")], { stdio: "inherit" });

const appId = process.env.IOS_ADMOB_APP_ID || "";
const rewardedUnitId = process.env.IOS_ADMOB_REWARDED_UNIT_ID || "";
if (Boolean(appId) !== Boolean(rewardedUnitId))
  throw new Error("Configure both IOS_ADMOB_APP_ID and IOS_ADMOB_REWARDED_UNIT_ID or neither.");
if (appId && (!/^ca-app-pub-[0-9]{16}~[0-9]{10}$/.test(appId) ||
              !/^ca-app-pub-[0-9]{16}\/[0-9]{10}$/.test(rewardedUnitId)))
  throw new Error("Invalid AdMob application or rewarded-ad unit identifier.");
// Default builds are test-only or entirely ad-free. Never ship test units as
// live ads in the signed release workflow.
const unsignedSimulator = process.env.GITHUB_WORKFLOW === "Verify iOS Simulator Build";
setPlist("GADApplicationIdentifier", "string",
  appId || "ca-app-pub-3940256099942544~1458002511");
setPlist("OrbitalDriftRewardedUnitID", "string",
  rewardedUnitId || "ca-app-pub-3940256099942544/1712485313");
setPlist("OrbitalDriftAdsEnabled", "bool",
  appId ? "true" : unsignedSimulator ? "true" : "false");
execFileSync(process.execPath, [path.join(root, "scripts/link-ios-ads-sdk.mjs")], { stdio: "inherit" });
