import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const block=name=>html.split("// BEGIN "+name)[1].split("// END "+name)[0];
const a=vm.runInNewContext(block("IMMERSION SKY")+"\n"+block("DIMENSIONAL ART")+"\n({dimensionalShade,dimensionalPalette})");
const families=["innerForge","gasFrontier","crystalReach","bioCluster","ancientArchive","voidRim","parallel","cosmicSpirit","threshold"];
assert.equal(new Set(families.map(key=>JSON.stringify(a.dimensionalPalette({archetype:{key},seed:1})))).size,9);
for(let kind=0;kind<7;kind++){
 const vals=Array.from({length:100},(_,i)=>a.dimensionalShade(.2,i/50-1,.8,.3+i*.006,.4,kind,11));
 assert.ok(vals.every(v=>Number.isFinite(v)&&v>=.28&&v<=1.34));
 assert.ok(new Set(vals).size>40);
}
assert.match(html,/paintVolumetricField\(c,width,height,game.system,game.settings\)/);
assert.match(html,/paintFormationDepth\(ctx,b,p.x,p.y,r\)/);
assert.match(html,/mappedEarth = false/);
assert.match(html,/SAVE_VERSION = 20/);
console.log("Dimensional art: distinct reach palettes, stable bounded material shading, local formation textures and render integration passed.");
