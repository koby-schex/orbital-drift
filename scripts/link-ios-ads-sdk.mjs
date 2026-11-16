#!/usr/bin/env node
// Capacitor 8's native Xcode target uses a local CapApp-SPM package.
// Add pinned ad libraries to THAT package so Xcode actually resolves them.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = path.join(root, "ios/App/CapApp-SPM/Package.swift");
let content = await readFile(manifest, "utf8");
if (!content.includes('name: "CapApp-SPM"') ||
    !content.includes('package: "capacitor-swift-pm"'))
  throw new Error("Unexpected Capacitor Swift Package manifest");
if (content.includes("swift-package-manager-google-mobile-ads.git"))
  throw new Error("Google ad dependencies already linked");

const capacitorDependency=/\.package\(url: "https:\/\/github\.com\/ionic-team\/capacitor-swift-pm\.git"[^\n]*\)/;
const match=content.match(capacitorDependency);
if (!match) throw new Error("Capacitor SPM dependency not found");
content=content.replace(match[0],
  match[0]+',\n        .package(url: "https://github.com/googleads/swift-package-manager-google-mobile-ads.git", exact: "13.12.0"),\n        .package(url: "https://github.com/googleads/swift-package-manager-google-user-messaging-platform.git", exact: "3.1.0")');
const cordovaDependency=/\.product\(name: "Cordova", package: "capacitor-swift-pm"\)/;
if(!cordovaDependency.test(content))throw new Error("Cordova SPM target dependency not found");
content=content.replace(cordovaDependency,
 '.product(name: "Cordova", package: "capacitor-swift-pm"),\n            .product(name: "GoogleMobileAds", package: "swift-package-manager-google-mobile-ads"),\n            .product(name: "GoogleUserMessagingPlatform", package: "swift-package-manager-google-user-messaging-platform")');
await writeFile(manifest, content);
console.log("Added pinned GoogleMobileAds 13.12.0 and UMP 3.1.0 to Capacitor local SPM package.");
