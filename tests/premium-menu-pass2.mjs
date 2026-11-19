import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html=await readFile(new URL("../index.html", import.meta.url),"utf8");
const fn=(name,next)=>{
  const a=html.indexOf("      function "+name+"("),
    b=html.indexOf("      function "+next+"(",a+1);
  assert.ok(a>=0&&b>a,"Missing "+name);
  return html.slice(a,b);
};
const detailsCode=fn("secondaryDetails","btn");
const secondaryDetails=new Function("esc",detailsCode+"\nreturn secondaryDetails;")(
  s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))
);
const sample=secondaryDetails("Cargo <details>",'<button type="button">Gather</button>');
assert.match(sample,/<details class="menu-secondary-details">/);
assert.match(sample,/<summary>Cargo &lt;details&gt;<\/summary>/);
assert.match(sample,/<button type="button">Gather<\/button>/,"Interactive content must remain available");
assert.match(html,/\.menu-secondary-details\s*>\s*summary:focus-visible/,
  "Native disclosures must have a visible keyboard focus state");

const hub=fn("renderHub","menuLabel");
for(const section of ["Explore","Pioneer","Cargo","Vessel & designs","Journey","Settings"])assert.ok(hub.includes(section),"Main directory must retain "+section);
assert.match(hub,/routeDirectory\(/);
assert.doesNotMatch(hub,/menu-card-ready|tab-count|<details class="menu-secondary-details">/);
const resources=fn("renderResources","resourceHint");
assert.match(resources,/secondaryDetails\("Colony Production Breakdown", rows\)/);
assert.match(resources,/data-action="claimProduction"|claimProduction/,
  "Gathering output must remain available on the initial cargo screen");

const planets=fn("renderPlanets","bodySurveyed");
assert.match(planets,/planetListHtml\(\)/);
assert.match(planets,/btn\("Set as Target"/);
assert.match(planets,/secondaryDetails\("Formation history", planetMemoryHtml\(s\)\)/);
assert.match(planets,/secondaryDetails\("Survey & Development Details", planetDetailsHtml\(s\)\)/);

const upgrades=fn("renderUpgrades","shipClassProgressHtml");
assert.match(upgrades,/activeTab\("upgrades","ship"\)/,"Dedicated ship and world upgrades must stay accessible");
assert.doesNotMatch(upgrades,/Ship System Levels:/,"No repeated summary wall");
assert.match(upgrades,/secondaryDetails\(\s*"Rename Starling"/);
assert.match(upgrades,/shipSubsystemsHtml\(\)/,"All ship systems retained");
assert.match(upgrades,/upgradeQuickSelectHtml\(\)/,"Planet upgrade selection remains");

const cosmetics=fn("renderCosmetics","storeHtml");
assert.match(cosmetics,/cosmeticPreviewHtml\("ship"/);
assert.match(cosmetics,/cosmeticPreviewHtml\("frigate"/);
assert.match(cosmetics,/cosmeticPreviewHtml\("trail"/);
for(const section of ["ship","frigate","trail","fleet","sets"])assert.ok(cosmetics.includes("cosmetics|"+section));
assert.match(cosmetics,/storeHtml\(tab\)/);
assert.match(cosmetics,/fleetSkinsHtml\(\)/);

const operations=fn("renderSystem","renderActivity");
assert.match(operations,/routeDirectory\(/);
for(const category of ["ops","travel","records","settings"]){
 assert.ok(new RegExp('tab\\s*===\\s*"'+category+'"').test(operations),"Retain Operations deck "+category);
}
for(const call of ["dailyOpsHtml()","atlasHtml()","settingsHtml(tab)","saveHtml()"]){
 assert.ok(operations.includes(call),"Retain functional operations "+call);
}
const pioneer=fn("renderFrigate","cosmeticPreviewHtml");
for(const tab of ["expeditions","crew","fleet","vault","upgrades","cosmetics"]){
 assert.ok(new RegExp('tab\\s*===\\s*"'+tab+'"').test(pioneer),"Preserve Pioneer "+tab);
}
console.log("Premium menu pass: accessible disclosure, readable priority screens and retained gameplay controls verified.");
