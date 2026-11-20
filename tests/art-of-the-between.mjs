import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const code=html.split("// BEGIN BETWEEN ART PROFILES")[1].split("// END BETWEEN ART PROFILES")[0];
const a=vm.runInNewContext(code+"\n({betweenReachArt,betweenLifeArt,betweenArtBudget,betweenPetalPoints})");
const motifs=new Set();
for(let i=0;i<6;i++){let p=a.betweenReachArt({seed:17},i);motifs.add(p.motif);assert.equal(JSON.stringify(p),JSON.stringify(a.betweenReachArt({seed:17},i)));}
for(const specialType of ["parallel","cosmicSpirit"])motifs.add(a.betweenReachArt({seed:17,specialType},0).motif);
assert.equal(motifs.size,8);
const ids=["ember-ray","storm-whale","prism-mantle","veil-medusa","choir-relic","null-seraph","aurora-pilgrim","mirror-leviathan"];
assert.equal(new Set(ids.map(catalogKey=>a.betweenLifeArt({catalogKey}).kind)).size,8);
for(const settings of [{graphics:"Low"},{performanceMode:"Battery Saver"},{motion:"Reduced"}]){assert.equal(a.betweenArtBudget(settings).animate,false);assert.equal(a.betweenArtBudget(settings).aperture,0);}
assert.ok(a.betweenArtBudget({graphics:"High"}).layers>a.betweenArtBudget({graphics:"Low"}).layers);
for(let n=3;n<10;n++){const p=a.betweenPetalPoints(n,10,.63);assert.equal(p.length,n*2);assert.ok(p.every(([x,y])=>Math.hypot(x,y)<=10.00001));}
assert.ok(html.split("paintBetweenReach(").length>=2,"Reach art remains integrated into the flight background");
assert.match(html,/threshold-vista\.svg/,"Title now uses dedicated illustration");
for(const name of ["paintBetweenRelief","paintBetweenLife","paintBetweenDistrict"])assert.ok(html.split(name+"(").length>=3,name);
assert.match(html,/SAVE_VERSION = 20/);assert.match(html,/function completeCulturalCommitment\(/);assert.match(html,/function charterConcordWorld\(/);
assert.match(html,/if\(frame.rays\)/);assert.match(html,/paintBetweenReach\(c,width,height/);
console.log("Art of the Between: eight deterministic reach and entity identities, bounded district geometry, integration and quality budgets passed.");
