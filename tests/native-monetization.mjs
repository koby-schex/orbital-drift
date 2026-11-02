import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
function extract(startName, endName) {
  const start = html.indexOf("      function " + startName + "(");
  const end = html.indexOf("      function " + endName + "(", start + 1);
  assert.ok(start >= 0 && end > start, "Expected adjacent game functions " + startName);
  return html.slice(start, end);
}
const readinessCode = extract("updateAdManager", "monetizationStatusText");
function readiness(win) {
  const game = { monetization: { storeKitReady: true, adMobReady: true } };
  const execute = new Function("window", "game", "hydrateMonetization", "restoreMonetization",
    readinessCode + "\nupdateAdManager();");
  execute(win, game, () => {}, (value) => ({ ...value }));
  return game.monetization;
}
const shell = { Capacitor: { isNativePlatform: () => true, getPlatform: () => "ios", Plugins: {} } };
assert.equal(readiness(shell).storeKitReady, false, "Capacitor alone is not a StoreKit bridge");
assert.equal(readiness(shell).adMobReady, false, "Capacitor alone is not an ad bridge");
assert.equal(readiness({}).storeKitReady, false, "Web edition has no native StoreKit");
assert.equal(readiness({}).adMobReady, false, "Web edition has no native ads");
assert.equal(readiness({ Capacitor: { Plugins: {
  OrbitalDriftStoreKit: { purchase: () => Promise.resolve() },
  OrbitalDriftAdMob: { showRewarded: () => Promise.resolve() },
} } }).storeKitReady, true, "Recognize an installed purchase plugin");
assert.equal(readiness({ Capacitor: { Plugins: {
  OrbitalDriftStoreKit: { purchase: () => Promise.resolve() },
  OrbitalDriftAdMob: { showRewarded: () => Promise.resolve() },
} } }).adMobReady, true, "Recognize an installed ad plugin");
assert.equal(readiness({ webkit: { messageHandlers: { storeKit: { postMessage() {} }, adMob: { postMessage() {} } } } }).adMobReady, true);
assert.equal(readiness({ OrbitalDriftNative: { purchase() {}, ads: { showRewarded() {} } } }).storeKitReady, true);

const purchaseCode = extract("requestPurchase", "completePurchase");
function runPurchase(win, nativeReady) {
  const messages = [];
  let confirms = 0;
  const game = { monetization: { storeKitReady: nativeReady } };
  const call = new Function("window", "game", "productById", "hasPurchasedProduct",
    "toast", "confirmAction", "nativePurchase", "completePurchase",
    purchaseCode + "\nreturn requestPurchase;");
  const purchase = call(win, game, {}, () => false,
    (message) => messages.push(message), () => { confirms++; },
    () => Promise.resolve({}), () => {});
  purchase("orbitaldrift.ship.solarflare");
  return { messages, confirms };
}
const noBridge = runPurchase(shell, false);
assert.equal(noBridge.confirms, 0, "Native app must not offer unimplemented StoreKit purchases");
assert.match(noBridge.messages[0] || "", /unavailable/i);
assert.equal(runPurchase({}, false).confirms, 1,
  "Preserve intentional no-charge Web Edition cosmetic claims");
assert.equal(runPurchase(shell, true).confirms, 1,
  "A native app with a working StoreKit bridge may present purchases");

console.log("Native monetization bridge tests passed: web, unconfigured iOS, and installed SDK flows.");
