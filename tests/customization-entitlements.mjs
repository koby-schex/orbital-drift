import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
function extract(start, end) {
  const a = html.indexOf("      function " + start + "(");
  const b = html.indexOf("      function " + end + "(", a + 1);
  assert.ok(a >= 0 && b > a, "Missing game functions " + start + "/" + end);
  return html.slice(a, b);
}
const purchaseCode = extract("completePurchase", "syncPurchasesFromHistory");
const product = "orbitaldrift.ship.solarflare";
const other = "orbitaldrift.frigate.abyss";
function purchase(tx, win = {}, storeKitReady = true) {
  const changes = { callbacks: 0, syncs: 0, saves: 0, activities: 0, renders: 0, messages: [] };
  const game = { monetization: { storeKitReady, purchaseHistory: [] } };
  const make = new Function("window", "game", "restoreMonetization",
    "toast", "syncPurchasesFromHistory", "persistMonetization", "addActivity",
    "productById", "saveGame", "renderMenu",
    purchaseCode + "\nreturn completePurchase;");
  const fn = make(win, game, value => ({...value}),
    message => changes.messages.push(message),
    () => changes.syncs++, () => {},
    () => changes.activities++, { [product]: {label:"Solar Flare"} },
    () => changes.saves++, () => changes.renders++);
  changes.result = fn(product, tx, {onVerified: () => changes.callbacks++});
  changes.history = game.monetization.purchaseHistory;
  return changes;
}
for (const tx of [
  {},
  { verified:false, productId:product },
  { verified:true, productId:other },
  { verified:true, productId:product, cancelled:true },
  { verified:true, productId:product, completed:false },
  { verified:true, productId:product, environment:"web-placeholder" },
]) {
  const result = purchase(tx);
  assert.equal(result.result, false, "Rejected/cancelled/mismatched purchases must fail");
  assert.equal(result.history.length, 0, "Rejected transactions must not become entitlements");
  assert.equal(result.callbacks, 0, "Rejected transactions must not unlock skins");
  assert.equal(result.saves, 0, "Rejected transactions must not write a save");
}
const valid = purchase({ verified:true, productId:product, transactionId:"apple-transaction-123" });
assert.equal(valid.result, true);
assert.equal(valid.history.length, 1);
assert.equal(valid.history[0].transactionId, "apple-transaction-123");
assert.equal(valid.callbacks, 1);
assert.equal(valid.saves, 1);
const complimentary = purchase({
  verified:true, productId:product, environment:"web-placeholder"
}, {}, false);
assert.equal(complimentary.result, true, "Complimentary browser cosmetics must remain available");
assert.equal(purchase({verified:true, environment:"web-placeholder"},
  {Capacitor:{getPlatform:()=> "ios"}}, false).result, false,
  "Unsigned iOS builds must not grant Web Edition purchases");

const restoreCode = extract("restorePurchases", "nativeShowRewardedAd");
async function restore(list) {
  const game = { monetization:{ purchaseHistory:[] } };
  let messages = [], saves = 0, syncs = 0;
  const run = new Function("game", "nativeRestorePurchases", "restoreMonetization",
    "syncPurchasesFromHistory", "persistMonetization", "toast", "saveGame", "renderMenu", "productById",
    restoreCode + "\nreturn restorePurchases;");
  const fn = run(game, async()=>list, value=>({...value}),
    ()=>syncs++, ()=>{}, msg=>messages.push(msg),
    ()=>saves++, ()=>{}, {[product]:{},[other]:{}});
  fn();
  await new Promise(resolve=>setImmediate(resolve));
  return {history:game.monetization.purchaseHistory, messages, saves, syncs};
}
const restored = await restore([
  { productId:product, verified:false },
  { productId:other, verified:true, cancelled:true },
  { productId:"unknown.product", verified:true },
  { id:product, verified:true },
  { productId:product, verified:true, transactionId:"restored-123" },
]);
assert.deepEqual(restored.history.map(item=>item.productId), [product],
  "Only recognized verified purchases may be restored");
assert.equal(restored.history[0].transactionId, "restored-123");
assert.match(restored.messages[0], /Purchases restored: 1/);
const rejectedRestore = await restore([{productId:product,verified:false}]);
assert.equal(rejectedRestore.history.length, 0);
assert.match(rejectedRestore.messages[0], /No native purchases/);
console.log("Customization entitlements passed: rejected transactions cannot unlock cosmetics or restore purchases.");
