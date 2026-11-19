import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const code=html.split("// BEGIN BETWEEN FIELD ARCHIVE")[1].split("// END BETWEEN FIELD ARCHIVE")[0];
const a=vm.runInNewContext(code+"\n({BETWEEN_NATIVE_RECORDS,BETWEEN_LIVING_EVENTS,BETWEEN_CULTURE_NOTES,BETWEEN_RESOURCE_NOTES,betweenStudy,betweenFieldRecord})");
assert.equal(a.BETWEEN_NATIVE_RECORDS.length,16);
assert.equal(new Set(a.BETWEEN_NATIVE_RECORDS.map(r=>r.key)).size,16);
const families=["innerForge","gasFrontier","crystalReach","bioCluster","ancientArchive","voidRim","parallel","cosmicSpirit"];
for(const f of families){
 const rows=a.BETWEEN_NATIVE_RECORDS.filter(r=>r.families.includes(f));
 assert.equal(rows.length,2);assert.equal(new Set(rows.map(r=>r.source)).size,2);
 assert.ok(a.betweenStudy(f)?.[1]);
}
const resources=new Set(Object.keys(a.BETWEEN_RESOURCE_NOTES));
for(const row of a.BETWEEN_NATIVE_RECORDS){assert.ok(["lifeform","artifact","phenomenon"].includes(row.kind));assert.ok(row.threat>=1&&row.threat<=6);assert.ok(!row.perk);assert.ok(row.colors.every(c=>/^#[0-9a-f]{6}$/i.test(c)));}
assert.equal(a.BETWEEN_LIVING_EVENTS.length,8);
assert.equal(new Set(a.BETWEEN_LIVING_EVENTS.map(e=>e.key)).size,8);
for(const e of a.BETWEEN_LIVING_EVENTS){assert.equal(e.choices.length,2);assert.notEqual(e.choices[0].label,e.choices[1].label);for(const choice of e.choices){assert.ok(choice.result);assert.ok(Object.entries(choice.reward).every(([k,v])=>resources.has(k)&&Number.isInteger(v)&&v>0&&v<=24));}}
for(const k of ["weavers","choirs","keepers","gardens","listeners","pilgrims"]){const n=a.BETWEEN_CULTURE_NOTES[k];assert.ok(n.history&&n.custom&&n.boundary);}
for(const k of ["ember-ray","storm-whale","prism-mantle","veil-medusa","choir-relic","null-seraph","aurora-pilgrim","mirror-leviathan"]){assert.ok(a.betweenFieldRecord(k));assert.ok(html.includes('"key":"'+k+'"'));}
assert.match(html,/\.\.\.BETWEEN_NATIVE_RECORDS/);assert.match(html,/\.\.\.BETWEEN_LIVING_EVENTS/);
assert.match(html,/SAVE_VERSION = 20/);assert.match(html,/function registerVaultDiscovery\(/);assert.match(html,/function completeCulturalCommitment\(/);
assert.match(html,/function resolveLivingSystemEvent\(/);assert.match(html,/state\.records\[key\]\) return state\.records\[key\]/);
console.log("Life Between the Nine: native catalog variety, bounded event rewards, culture and research coverage, stable IDs and event persistence passed.");
