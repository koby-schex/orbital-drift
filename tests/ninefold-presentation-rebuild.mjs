import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const code=html.split("// BEGIN BETWEEN PRESENTATION CONTRACT")[1].split("// END BETWEEN PRESENTATION CONTRACT")[0];
const a=vm.runInNewContext(code+"\n({betweenDisplayText,betweenSectorName,betweenContourPoints})");
assert.equal(a.betweenDisplayText("The Nine Worlds are distinct worlds."),"The Nine Worlds are distinct worlds.");
assert.equal(a.betweenDisplayText("Nyra Sol"),"Nyra Sol");
assert.equal(a.betweenDisplayText("World Five"),"World Five");
assert.equal(a.betweenDisplayText("Ship Systems"),"Ship Systems");
assert.equal(a.betweenDisplayText("Orbit Earth, then capture Mars."),"Orbit First Anchorage, then claim Redglass Shelf.");
assert.equal(a.betweenDisplayText("Jump Outward"),"Cross Outward");
assert.equal(a.betweenSectorName("Nacre System"),"Nacre Reach");
assert.doesNotMatch(code,/new MutationObserver/);
assert.match(html,/betweenTranslateNode\(ui.menuContent\)/);
assert.match(html,/NINEFOLD DESIGN SYSTEM/);
assert.match(html,/drawTitleVistaVessel\(c,w,h,shipSkin\)/);
for(let i=0;i<200;i++){const p=a.betweenContourPoints({name:"site"+i,featureSeed:i},100);assert.ok(p.length>=36);assert.ok(p.every(([x,y])=>Math.hypot(x,y)<=100.0001));}
for(const f of ["between-shelves.svg","between-fold.svg","between-veil.svg"]){const x=readFileSync(new URL("../assets/"+f,import.meta.url),"utf8");assert.ok(x.includes("clipPath")&&x.includes("feTurbulence")&&x.length>25000);}
assert.match(html,/SAVE_VERSION = 20/);
console.log("Ninefold presentation: scoped copy, lore-safe phrases, bounded contours, title and matte art integration passed.");
