import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
function extract(name,next) {
  const a=html.indexOf("      function "+name+"(");
  const b=html.indexOf("      function "+next+"(",a+1);
  assert.ok(a>=0&&b>a,"Missing "+name+" or "+next);
  return html.slice(a,b);
}
const themes=[
  "Azure Frontier","Ember Reach","Verdant Expanse",
  "Violet Meridian","Golden Quiet","Glacial Verge",
].map(name=>({name}));
const visual=new Function("sectorVisualThemes",
 extract("systemVisualThemeIndex","sectorVisualTheme")+
 "\nreturn systemVisualThemeIndex;")(themes);
const archetypes=["innerForge","gasFrontier","crystalReach",
 "bioCluster","ancientArchive","voidRim"];
const indices=archetypes.map((key,i)=>visual({archetype:{key},seed:200+i}));
assert.equal(new Set(indices).size,6,"Six normal system families need six distinct sky identities");
assert.deepEqual(indices,[1,0,3,2,4,5]);
assert.equal(visual({archetype:{key:"innerForge"},seed:999}),1,
 "Visual family should track system type, not simply random seed");
assert.ok(visual({seed:42})>=0,"Legacy and unknown archetypes need a safe fallback");

const systems=archetypes.map((key,i)=>({
 seed:100+i,archetype:{key},modifier:{key:i%2?"quiet":"storm"},
 bodies:[
   {type:"star",color:["#ff8","#88f","#9f9","#f8f","#ddd","#777"][i]},
   ...Array.from({length:i===5?4:8},(_,n)=>({
     type:"planet",pattern:["lava","bands","crystal","continents","rings","storm"][i],
     name:key+"-"+n,
   })),
 ],
}));
systems.unshift({
 seed:1,archetype:{key:"tutorial"},modifier:{key:"calm"},
 bodies:[{type:"star",color:"#fd4"},{type:"planet",pattern:"continents"}],
 isTutorial:true
});
const game={system:systems[1],visitedSectors:[{index:1,lastVisit:100}]};
let randomValue=0;
const journey=new Function("systems","game","systemVisualThemeIndex","randomUnit",
 extract("systemJourneySignature","chooseUnchartedSystemIndex")+
 "\nreturn {systemJourneySignature,systemJourneySimilarity,routeVarietyScore};"
)(systems,game,visual,()=>randomValue);

const a=journey.systemJourneySignature(systems[1]);
const b=journey.systemJourneySignature(systems[2]);
assert.equal(a.archetype,"innerForge");
assert.notEqual(a.theme,b.theme);
assert.equal(journey.systemJourneySimilarity(a,a)>journey.systemJourneySimilarity(a,b),true,
 "Same-world-family journey must count as substantially more visually similar");

// A star system that differs in name or seed but not visual identity should
// lose against another archetype even if the random tiebreaker favors it.
const copy={
 ...systems[1],seed:5000,
 bodies:systems[1].bodies.map(b=>({...b,name:b.name+" copy"}))
};
randomValue=1;
const repetition=journey.routeVarietyScore({system:copy});
randomValue=0;
const contrast=journey.routeVarietyScore({system:systems[2]});
assert.ok(contrast>repetition+5,
 "Destination diversity must outweigh noise and discourage immediate lookalikes");

// Previous visits beyond the current system still count against repeated looks.
game.system=systems[2];
game.visitedSectors=[
 {index:2,lastVisit:200},
 {index:1,lastVisit:100}
];
randomValue=0;
const recentRepeat=journey.routeVarietyScore({system:copy});
const fresh=journey.routeVarietyScore({system:systems[4]});
assert.ok(fresh>recentRepeat,"Recent system families must influence later jumps");

// Only visual treatment and destination ordering may change; never mutate a
// saved system's name, orbits, resources, or bodies in scoring.
const before=JSON.stringify(systems);
journey.routeVarietyScore({system:systems[3]});
journey.systemJourneySignature(systems[3]);
assert.equal(JSON.stringify(systems),before,
 "Route scoring must not rewrite existing systems or save objects");

const themeCode=extract("sectorVisualTheme","applySectorVisualTheme");
assert.match(themeCode,/sectorVisualThemes\[systemVisualThemeIndex\(game\.system\)\]/);
assert.match(themeCode,/specialType === "parallel"/);
assert.match(themeCode,/specialType === "cosmicSpirit"/);
assert.match(themeCode,/rarity === "Mythic"/);
assert.match(themeCode,/rarity === "Exotic"/);
const cinematic=extract("cinematicSky","drawCinematicEnvironment");
assert.match(cinematic,/systemVisualThemeIndex\(game\.system\)/);
assert.match(cinematic,/composition = \[/);
assert.match(cinematic,/lightField\.addColorStop/);
assert.match(cinematic,/if \(kind === "deep" && !tutorial\)/,
 "Only ordinary unexplored systems should receive new cinematic grading");
console.log("Procedural route variety passed: six sky identities, recent lookalike avoidance, stable saved worlds, special-scene preservation.");
