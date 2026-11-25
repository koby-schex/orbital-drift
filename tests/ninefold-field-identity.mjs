import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const start="// BEGIN NINEFOLD FIELD IDENTITY",end="// END NINEFOLD FIELD IDENTITY";
assert.ok(html.includes(start)&&html.includes(end));
const section=html.split(start)[1].split(end)[0];
const context=vm.runInNewContext(section+"\n({ninefoldFieldTheme,NINEFOLD_FIELD_THEMES})");
const families=["threshold","innerForge","gasFrontier","crystalReach","bioCluster","ancientArchive","voidRim","parallel","cosmicSpirit"];
for(const key of families){
  const system=key==="threshold"?{isTutorial:true,archetype:{key:"innerForge"}}:
    ["parallel","cosmicSpirit"].includes(key)?{specialType:key,archetype:{key:"innerForge"}}:{archetype:{key}};
  const result=context.ninefoldFieldTheme(system);
  assert.equal(result.key,key);
  assert.equal(result.parts.length,3);
  assert.ok(result.parts[0].trim().length>=8,"Each reach needs a readable heading");
  assert.ok(result.parts.slice(1).every(x=>x.trim().length>20),"Each reach needs substantive observations and field guidance");
}
assert.equal(context.ninefoldFieldTheme({archetype:{key:"missing"}}).key,"threshold");
assert.equal(context.ninefoldFieldTheme(null).key,"threshold");
assert.match(html,/ninefold: renderNinefoldArchive/);
assert.match(html,/ninefold:"Ninefold Field Archive"/);
assert.match(html,/"ninefold",\s*\]\);/);
assert.match(html,/\["Ninefold Field Archive","The Nine Worlds/);
assert.match(html,/ninefoldIdentityBrief\(\)\+/);
assert.match(html,/Field note: " \+ ninefoldFieldTheme\(game\.system\)\.parts\[1\]/);
assert.match(html,/card\("Ninefold context"/);
assert.match(section,/independent cultures are people|Independent cultures are people/);
assert.match(section,/no new save keys/);
assert.match(html,/SAVE_VERSION = 20/);
console.log("Ninefold field identity: reach interpretation, menu routes, discovery and save safety passed.");
