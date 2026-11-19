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
