import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const section=(name)=>html.split("// BEGIN "+name)[1].split("// END "+name)[0];
const relief=html.slice(html.indexOf("function immersionReliefProfile("),html.indexOf("function paintBetweenRelief("));
const ctx=vm.runInNewContext(section("BETWEEN PRESENTATION CONTRACT")+"\n"+relief+"\n"+section("IMMERSION SKY")+"\n({immersionReliefProfile,immersionSkyProfile})");
const forms=Array.from({length:200},(_,i)=>({name:"site"+i,featureSeed:i}));
assert.equal(new Set(forms.map(b=>ctx.immersionReliefProfile(b).kind)).size,7);
for(const b of forms){const a=ctx.immersionReliefProfile(b);assert.equal(a.seed,ctx.immersionReliefProfile(b).seed);assert.ok(ctx.immersionReliefProfile(b,{graphics:"Low"}).count<a.count);}
const types=["innerForge","gasFrontier","crystalReach","bioCluster","ancientArchive","voidRim","parallel","cosmicSpirit","threshold"];
assert.equal(new Set(types.map(key=>ctx.immersionSkyProfile({archetype:{key},seed:7}).index)).size,9);
assert.match(html,/paintImmersionSky\(c,width,height,game.system,sectorVisualTheme\(\),game.settings\)/);
assert.match(html,/SAVE_VERSION = 20/);
assert.doesNotMatch(html,/A generation habitat has lost its navigation star/);
console.log("Ninefold immersion: seeded profiles, quality budgets and field language passed.");
