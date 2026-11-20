import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const block=n=>html.split("// BEGIN "+n)[1].split("// END "+n)[0];
const api=vm.runInNewContext(block("IMMERSION SKY")+"\n"+block("CINEMATIC DEPTH PROFILES")+"\n({reachDepthProfile,shelfMesh})");
const families=["innerForge","gasFrontier","crystalReach","bioCluster","ancientArchive","voidRim","parallel","cosmicSpirit","threshold"];
const kinds=new Set();
for(const key of families){
 const system={archetype:{key},seed:147};const hi=api.reachDepthProfile(system,{graphics:"High"}),low=api.reachDepthProfile(system,{graphics:"Low"});
 kinds.add(hi.kind);assert.ok(hi.layers>low.layers);assert.ok(hi.vertices>low.vertices);assert.ok(hi.cap>low.cap);assert.equal(low.parallax,false);
 assert.equal(api.reachDepthProfile(system,{motion:"Reduced"}).parallax,false);
 const mesh=api.shelfMesh(hi,147,hi.vertices);assert.equal(mesh.rim.length,hi.vertices);assert.equal(mesh.shoulder.length,hi.vertices);assert.equal(mesh.base.length,hi.vertices);
 for(const list of [mesh.rim,mesh.shoulder,mesh.base])assert.ok(list.every(p=>p.every(v=>Number.isFinite(v)&&Math.abs(v)<1.5)));
 assert.equal(JSON.stringify(mesh),JSON.stringify(api.shelfMesh(hi,147,hi.vertices)));
 assert.notEqual(JSON.stringify(mesh),JSON.stringify(api.shelfMesh(hi,148,hi.vertices)));
}
assert.equal(kinds.size,9);
for(const call of ["drawReachDepth();","paintMineralSections(ctx,b,p.x,p.y,r,game.settings)","paintMineralSections(c,b,0,0,r,game.settings)","paintCrossingSeam(ctx,p.x,p.y,r"])assert.ok(html.includes(call),call);
assert.match(html,/for\(const old of reachDepthCache.layers\)old.width=old.height=1/);
assert.match(html,/SAVE_VERSION = 20/);
console.log("Cinematic exploration: nine depth motifs, deterministic shelf meshes, bounded cache and reduced-motion settings, in-flight rendering integration passed.");
