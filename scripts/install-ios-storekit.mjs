#!/usr/bin/env node
// Install a local Capacitor 8 StoreKit plugin into the generated SPM app.
// AppDelegate.swift is already compiled in the generated App target, so keeping
// these classes in that translation unit avoids brittle .pbxproj modifications.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const app=path.join(root,"ios/App/App");
const appDelegate=path.join(app,"AppDelegate.swift");
const storyboard=path.join(app,"Base.lproj/Main.storyboard");
const original=await readFile(appDelegate,"utf8");
const plugin=await readFile(path.join(root,"native/ios/OrbitalDriftStoreKitPlugin.swift"),"utf8");
const controller=await readFile(path.join(root,"native/ios/OrbitalDriftBridgeViewController.swift"),"utf8");
const adsPlugin=await readFile(path.join(root,"native/ios/OrbitalDriftAdMobPlugin.swift"),"utf8");
const lifecyclePlugin=await readFile(path.join(root,"native/ios/OrbitalDriftLifecyclePlugin.swift"),"utf8");
if (!original.includes("class AppDelegate") || !original.includes("import UIKit"))
  throw new Error("Unknown generated Capacitor AppDelegate source");
if (original.includes("class OrbitalDriftStoreKitPlugin") ||
    original.includes("class OrbitalDriftBridgeViewController"))
  throw new Error("StoreKit plugin was already installed");
const scene=await readFile(storyboard,"utf8");
const pattern=/customClass="CAPBridgeViewController"\s+customModule="Capacitor"/;
if (!pattern.test(scene)) throw new Error("Generated Capacitor storyboard changed; cannot safely register StoreKit plugin");
await writeFile(appDelegate,original.trimEnd()+"\n\n"+plugin.trim()+"\n\n"+adsPlugin.trim()+"\n\n"+lifecyclePlugin.trim()+"\n\n"+controller.trim()+"\n");
await writeFile(storyboard,scene.replace(pattern,'customClass="OrbitalDriftBridgeViewController" customModule="App"'));
console.log("Registered verified StoreKit 2 Capacitor plugin in generated iOS application");
