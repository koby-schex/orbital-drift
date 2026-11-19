import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const code=html.split("// BEGIN REACH DISCOVERIES")[1].split("// END REACH DISCOVERIES")[0];
const a=vm.runInNewContext(code+"\n({REACH_DISCOVERY_RECORDS,REACH_DISCOVERY_EVENTS,REACH_DISCOVERY_FORMS,reachDiscoveryContact,reachEventPool})");
assert.equal(a.REACH_DISCOVERY_RECORDS.length,16);
assert.equal(new Set(a.REACH_DISCOVERY_RECORDS.map(x=>x.key)).size,16);
assert.equal(a.REACH_DISCOVERY_EVENTS.length,8);
const families=["innerForge","gasFrontier","crystalReach","bioCluster","ancientArchive","voidRim","parallel","cosmicSpirit"];
for(const family of families){
 const records=a.REACH_DISCOVERY_RECORDS.filter(r=>r.families.includes(family));
 assert.equal(records.length,2);
 assert.equal(new Set(records.map(x=>x.source)).size,2);
 const c=a.reachDiscoveryContact({seed:99,specialType:family},family);
 assert.equal(c.catalogKey,records.find(x=>x.source==="space").key);
 assert.ok(a.REACH_DISCOVERY_FORMS[c.catalogKey]);
 assert.ok(Math.hypot(c.x,c.y)>=879&&Math.hypot(c.x,c.y)<=1300);
 assert.equal(JSON.stringify(c),JSON.stringify(a.reachDiscoveryContact({seed:99,specialType:family},family)));
 assert.equal(a.reachDiscoveryContact({isTutorial:true},family),null);
 const pool=a.reachEventPool(a.REACH_DISCOVERY_EVENTS,family,new Set());
 assert.equal(pool.length,1);
 for(const choice of pool[0].choices)assert.ok(Object.values(choice.reward).every(v=>v>0&&v<=24));
}
assert.match(html,/contacts.push\(field\)/);
assert.match(html,/\.\.\.REACH_DISCOVERY_RECORDS/);
assert.match(html,/\.\.\.REACH_DISCOVERY_EVENTS/);
assert.match(html,/SAVE_VERSION = 20/);
console.log("Reach discoveries: 16 records, 8 observation events, stable contact identities and family selection passed.");
