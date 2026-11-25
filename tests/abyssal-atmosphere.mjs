import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const section=key=>html.split("// BEGIN "+key)[1].split("// END "+key)[0];
const moods=vm.runInNewContext(section("ABYSSAL REACH MOOD")+"\n({ABYSS_MOODS,abyssalProfile})");
const families=["innerForge","gasFrontier","crystalReach","bioCluster","ancientArchive","voidRim","parallel","cosmicSpirit","threshold"];
const signatures=new Set();
for(const key of families){
 const system={archetype:{key},seed:1141},a=moods.abyssalProfile(system,{graphics:"High"}),b=moods.abyssalProfile(system,{graphics:"High"});
 assert.equal(JSON.stringify(a),JSON.stringify(b),"Scene identity must be deterministic");
 signatures.add([a.motif,a.base,a.mid,a.focus.join(),a.stars].join(":"));
 assert.ok(a.starsCount>0 && a.starsCount<=300);
 assert.ok(a.detail>moods.abyssalProfile(system,{graphics:"Low"}).detail);
 assert.equal(moods.abyssalProfile(system,{motion:"Reduced"}).animate,false);
 assert.equal(moods.abyssalProfile(system,{performanceMode:"Battery Saver"}).animate,false);
 assert.notEqual(a.seed,moods.abyssalProfile({...system,seed:1142}).seed,"Different systems in one family still need unique compositions");
}
assert.equal(signatures.size,9,"All nine families need different compositional identities");
assert.equal(moods.abyssalProfile({isTutorial:true,seed:1}).key,"threshold");
assert.equal(moods.abyssalProfile({specialType:"parallel",seed:8}).key,"parallel");
assert.equal(moods.abyssalProfile({specialType:"cosmicSpirit",seed:8}).key,"cosmicSpirit");
const controls=vm.runInNewContext(section("CONTROL SAFE ZONES")+"\n({protectFuelFromJoystick})");
for(const [w,h] of [[320,568],[375,667],[390,844],[430,932],[768,1024]]){
 const lower=controls.protectFuelFromJoystick(18,h-58,110,110,w,h);
 assert.equal(lower.adjusted,true);
 assert.ok(lower.top+110 <=h-134,"Joystick must remain above the reserved fuel zone");
 assert.equal(controls.protectFuelFromJoystick(w-112,h-56,80,80,w,h).adjusted,false,"Independent right controls must not shift");
 assert.equal(controls.protectFuelFromJoystick(18,h-360,105,105,w,h).adjusted,false);
}
for(const integration of [
 "paintAbyssalReach(c,width,height,game.system,game.settings)",
 "drawAbyssMotion();","paintAbyssRim(ctx,b,p.x,p.y,r)",
 "paintAbyssRim(c,b,0,0,r)","protectFuelFromJoystick(left,top,w,h,W,H)",
 "ABYSS_MOODS"
])assert.ok(html.includes(integration),"Missing scene or layout integration: "+integration);
assert.match(html,/joystick: \{ left: 18, bottom: 126 \}/);
assert.match(html,/\.stick\{bottom:calc\(126px \+ var\(--safeBottom\)\)/);
assert.match(html,/\.menu \.route-row\{min-height:68px!important;border-radius:11px/);
assert.match(html,/body\.reduced-motion \.menu \*/);
assert.match(html,/SAVE_VERSION = 20/);
console.log("Abyssal reach mood: nine distinct seeded families, dynamic composition and quality budgets, joystick safe zones and menu style continuity passed.");
