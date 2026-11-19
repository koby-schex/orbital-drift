import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import vm from "node:vm";
const root=new URL("../",import.meta.url),html=readFileSync(new URL("index.html",root),"utf8");
const source=html.split("// BEGIN BETWEEN PRESENTATION CONTRACT")[1].split("// END BETWEEN PRESENTATION CONTRACT")[0];
const api=vm.runInNewContext(source+"\n({betweenDisplayText,betweenSectorName,betweenTranslateNode,betweenFormationProfile,betweenContourPoints,BETWEEN_BODY_LABELS})");
assert.equal(api.betweenDisplayText("Orbit Earth, then capture Mars."),"Orbit First Anchorage, then claim Redglass Shelf.");
assert.equal(api.betweenDisplayText("Between the Nine Worlds: World Five and World Nine."),"Between the Nine Worlds: World Five and World Nine.");
assert.equal(api.betweenDisplayText("Ship Systems"),"Ship Systems");
assert.equal(api.betweenDisplayText("Nyra Sol"),"Nyra Sol");
assert.equal(api.betweenSectorName("Nacre System"),"Nacre Reach");
assert.equal(api.betweenDisplayText("Sol System"),"First Reach");
for(const text of ["Capture Earth","Orbital Drift: Sol","Solar systems","The Nine Worlds","Cosmic Spirit","Black Hole","Mars captured","ODF Pioneer","World One"]){
  const display=api.betweenDisplayText(text);
  assert.equal(api.betweenDisplayText(display),display);
}
const option={tagName:"OPTION",value:"Earth",hasAttribute:()=>false,setAttribute:(k,v)=>{option[k]=v;}};
const textNode={nodeType:3,nodeValue:"Earth",parentElement:option};
api.betweenTranslateNode(textNode);
assert.equal(textNode.nodeValue,"First Anchorage");assert.equal(option.value,"Earth");
const input={nodeType:3,nodeValue:"Earth",parentElement:{tagName:"TEXTAREA"}};
api.betweenTranslateNode(input);assert.equal(input.nodeValue,"Earth");
const shapes=new Set();
for(let i=0;i<500;i++){
  const body={name:"formation-"+i,featureSeed:i*19};const p=api.betweenContourPoints(body,100);shapes.add(api.betweenFormationProfile(body).name);
  assert.equal(JSON.stringify(p),JSON.stringify(api.betweenContourPoints(body,100)));
  assert.ok(p.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&Math.hypot(x,y)<=100.0001));
}
assert.ok(shapes.size>=7);assert.equal(api.betweenFormationProfile({name:"Earth"}).name,"Terraced shelf");
assert.equal(api.betweenFormationProfile({name:"Mars"}).name,"Split strata");
const manifest=JSON.parse(readFileSync(new URL("manifest.webmanifest",root),"utf8")),config=JSON.parse(readFileSync(new URL("capacitor.config.json",root),"utf8"));
assert.equal(manifest.name,"Ninefold: Between the Nine");assert.equal(config.appName,"Between the Nine");
assert.equal(config.appId,"com.orbitaldrift.game");
const sw=readFileSync(new URL("sw.js",root),"utf8");
for(const name of ["between-shelves.svg","between-fold.svg","between-veil.svg","between-anchorage.svg"]){
  assert.ok(existsSync(new URL("assets/"+name,root)));assert.ok(sw.includes(name));assert.ok(html.includes(name));
}
for(const s of ['SAVE_VERSION = 20','SAVE_KEY = "orbital-drift-save-v12"','name: "Sol System"','name: "Earth"','name: "Mars"','function toggleOrbit(','function completeCulturalCommitment(','function charterConcordWorld(','function jumpSystem(','function orbitMomentum('])assert.ok(html.includes(s),s);
assert.match(html,/Your vessel has already passed through a crossing near World Five/);
console.log("Between the Nine presentation: stable identities, deterministic bounded geometry, canonical wording safeguards, offline assets and new brand metadata passed.");
