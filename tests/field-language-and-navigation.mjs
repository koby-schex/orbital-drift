import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const source=html.split("// BEGIN BETWEEN PRESENTATION CONTRACT")[1].split("// END BETWEEN PRESENTATION CONTRACT")[0],field=html.split("// BEGIN FIELD LANGUAGE")[1].split("// END FIELD LANGUAGE")[0];
const a=vm.runInNewContext(source+"\n"+field+"\n({FIELD_FORMATIONS,FIELD_REACHES,fieldBodyName,fieldVesselName,fieldReachProfile})");
assert.equal(Object.keys(a.FIELD_FORMATIONS).length,8);assert.equal(Object.keys(a.FIELD_REACHES).length,8);
assert.equal(a.fieldBodyName("Earth"),"First Anchorage");assert.equal(a.fieldBodyName("Mars"),"Redglass Shelf");assert.equal(a.fieldBodyName("Nyra Sol"),"Nyra Sol");
assert.equal(a.fieldVesselName("ODF Pioneer"),"Pioneer");assert.equal(a.fieldVesselName("Earth"),"Earth");
for(const [key,r] of Object.entries(a.FIELD_REACHES)){assert.equal(a.fieldReachProfile({archetype:{key}}).name,r.name);assert.ok(r.desc.length>20);}
assert.equal(a.fieldReachProfile({isTutorial:true}).name,"Threshold Anchorage");
const tutorial=html.split("const tutorialObjectives = ")[1].split("function tutorialObjective")[0];
const objectives=vm.runInNewContext(tutorial.slice(0,tutorial.lastIndexOf(";")));
assert.equal(JSON.stringify(objectives.map(x=>x.target)),JSON.stringify(["Mars","Earth","Mars","Venus","Earth","__FRIGATE__","__FRIGATE__"]));
assert.equal(objectives.length,7);assert.ok(objectives.every(x=>x.text.length>20));assert.doesNotMatch(objectives.map(x=>x.text).join(" "),/\b(?:Earth|Mars|Venus|Sol)\b/);
assert.match(html,/function fieldObservation\(b\)/);assert.match(html,/esc\(fieldObservation\(s\)\)/);assert.match(html,/SAVE_VERSION = 20/);
console.log("Field language: eight reach and formation records, seven unchanged tutorial targets and explicit display aliases passed.");

// Check authored milestone sources in addition to the initial objective array.
for (const marker of ["Mars Captured!","Venus Survey Complete!","Upgrade Mars outpost","Travel to Venus","Return to Earth Factory","Mars Outpost Upgraded!","Capture Mars."]) assert.ok(!html.includes(marker), "Obsolete tutorial copy: "+marker);
assert.match(html,/Redglass Shelf claimed/);assert.match(html,/Violet Furnace surveyed/);assert.match(html,/Redglass Shelf developed/);assert.match(html,/title-art-caption/);assert.match(html,/title-panel-kicker/);

 // Execute the actual flight canvas drawing function, not only the source copy.
const drawSource=html.slice(html.indexOf("function drawTargetPill("),html.indexOf("function drawRareSystemAura("));
const rendered=[],measurements=[];
const canvas={save(){},restore(){},measureText(s){measurements.push(s);return {width:s.length*6};},translate(){},beginPath(){},fill(){},stroke(){},fillText(s){rendered.push(s);}};
const draw=vm.runInNewContext(source+"\n"+field+"\n"+drawSource+"\n drawTargetPill",{ctx:canvas,W:390,H:844,clamp:(v,min,max)=>Math.max(min,Math.min(max,v)),rgba:c=>c,rr(){}});
for(const [id,display] of [["Mars","Redglass Shelf"],["Earth","First Anchorage"],["Venus","Violet Furnace"],["ODF Pioneer","Pioneer"],["Nyra Sol","Nyra Sol"]]){
 draw(100,200,id,42,"#fff");assert.equal(rendered.at(-1),display+" • 42 km");assert.ok(measurements.some(s=>s.startsWith(display+" •")));
}
draw(100,200,"An unusually long custom vessel name",123456,"#fff");assert.ok(rendered.at(-1).includes("…"));
const translate=vm.runInNewContext(source+"\n betweenDisplayText");
for(const prefix of ["Go to ","Objective: ","Manual target set: ","Nearest: ","Survey complete: "])assert.equal(translate(prefix+"Mars"),prefix+"Redglass Shelf");
assert.equal(translate("Nyra Sol"),"Nyra Sol");
