import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const swift=readFileSync(new URL("../native/ios/OrbitalDriftStoreKitPlugin.swift",import.meta.url),"utf8");
assert.match(swift,/Transaction\.updates/);
assert.match(swift,/notifyListeners\("entitlementsChanged"/);
assert.match(swift,/currentEntitlements\(_ call: CAPPluginCall\)/);
assert.match(swift,/Transaction\.currentEntitlements/);
assert.match(source,/registerNativePurchaseUpdates\(\);/);
assert.match(source,/refreshNativeEntitlements\(\);/);
assert.match(source,/Restore Apple Purchases/);
const start=source.indexOf("      let nativeEntitlementSyncPending = false;");
const end=source.indexOf("      function nativeShowRewardedAd(",start);
assert.ok(start>0&&end>start);
const chunk=source.slice(start,end);
const solar="orbitaldrift.ship.solarflare", remove="orbitaldrift.removeads.permanent";
const game={
  monetization:{purchaseHistory:[{productId:solar,transactionId:"old",verified:true,environment:"app-store"},{productId:remove,transactionId:"remove-old",verified:true,environment:"app-store"}],removeAds:true},
  ownedShipSkins:new Set(["High Tech","Solar Flare"]),
  ownedFrigateSkins:new Set(["Frigate Standard"]),
  ownedTrailSkins:new Set(["Ion Wake"]),
  ownedFleetSkins:new Set(["Command Match"]),
};
let saveCount=0,persistCount=0;
let fetchImpl=async()=>({purchases:[{productId:solar,transactionId:"new",verified:true,environment:"app-store"}]});
const window={Capacitor:{Plugins:{OrbitalDriftStoreKit:{
  currentEntitlements:()=>fetchImpl(),
  addListener:async(name,callback)=>{assert.equal(name,"entitlementsChanged");window.onEntitlementChange=callback;}
}}}};
const run = new Function("window","game","restoreMonetization","productById","monetizationProducts","syncPurchasesFromHistory","persistMonetization","hasActiveJourney","saveGame","ui","renderMenu",
chunk+"\nreturn {refreshNativeEntitlements,registerNativePurchaseUpdates};");
const f=run(window,game,v=>({...v}),
 {[solar]:{},[remove]:{}},{removeAds:{id:remove}},
 ()=>{},()=>persistCount++,true,()=>saveCount++,{menu:{classList:{contains:()=>false}}},()=>{});
assert.equal(await f.refreshNativeEntitlements(),true);
assert.equal(game.monetization.removeAds,false,"Revoked Remove Ads entitlement must be reflected");
assert.equal(game.monetization.purchaseHistory.length,1);
assert.equal(game.monetization.purchaseHistory[0].transactionId,"new");
assert.ok(game.ownedShipSkins.has("Solar Flare"),"Retain current paid skin");
assert.equal(persistCount,1);
assert.equal(saveCount,1);
fetchImpl=async()=>{throw Error("offline");};
assert.equal(await f.refreshNativeEntitlements(),false);
assert.equal(game.monetization.purchaseHistory.length,1,"Offline StoreKit failures must not revoke access");
fetchImpl=async()=>({purchases:[{productId:solar,verified:false,transactionId:"fake",environment:"app-store"},{productId:"unknown",verified:true,transactionId:"bad",environment:"app-store"}]});
assert.equal(await f.refreshNativeEntitlements(),true);
assert.equal(game.monetization.purchaseHistory.length,0,"Invalid or revoked entitlements must not survive authoritative refresh");
assert.ok(!game.ownedShipSkins.has("Solar Flare"));
assert.ok(game.ownedShipSkins.has("High Tech"),"Starter skin survives revocation");
f.registerNativePurchaseUpdates();
await new Promise(resolve=>setImmediate(resolve));
assert.equal(typeof window.onEntitlementChange,"function");
console.log("StoreKit lifecycle passed: authoritative refresh, refunds, offline safety, native events, and restore access.");
