import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const getCode = (name, next) => {
  const start = html.indexOf("      function " + name + "(");
  const end = html.indexOf("      function " + next + "(", start + 1);
  assert.ok(start >= 0 && end > start, name + " must be found");
  return html.slice(start, end);
};

const templates = [
  {id:"pilot",name:"Pilot",starter:true},
  {id:"science",name:"Scientist",starter:false}
];
const uniforms = ["Standard", "Gold"];
const hydrateCrew = new Function("crewTemplates","newCrewMember","cleanName","clamp","crewUniforms",
  getCode("hydrateCrew","crewState")+"\nreturn hydrateCrew;")(
  templates,(template)=>({id:template.id,name:template.name,level:1,xp:0,uniform:"Standard",duty:"bridge",expeditions:0}),
  String,(v,low,high)=>Math.max(low,Math.min(high,v)),uniforms);
const crew = hydrateCrew({members:[
  {id:"pilot",level:Infinity,xp:Infinity,uniform:"Unknown",duty:"invalid",expeditions:Infinity},
  {id:"pilot",level:6,xp:9999},
  {id:"science",level:4,xp:80,uniform:"Gold",duty:"vault"}
]});
assert.deepEqual(crew.members.map(m=>m.id),["pilot","science"],"duplicate saved crew cannot stack bonuses");
assert.equal(crew.members[0].level,1);
assert.equal(crew.members[0].xp,0);
assert.equal(crew.members[0].uniform,"Standard");
assert.equal(crew.members[0].duty,"bridge");
assert.equal(crew.members[0].expeditions,0);
assert.equal(crew.members[1].level,4);
assert.equal(crew.members[1].xp,80);
assert.equal(crew.members[1].uniform,"Gold");
assert.equal(hydrateCrew({}).members[0].id,"pilot","starter crew still restored");

const hydrateExpeditions = new Function(getCode("hydrateExpeditions","expeditionState")+"\nreturn hydrateExpeditions;")();
const old = hydrateExpeditions({retiredFamilies:{invalid:true},active:{stages:[{type:"jump",goal:2,progress:1}],stageIndex:-1}});
assert.deepEqual(old.retiredFamilies,[]);
assert.deepEqual(old.active.systemsVisited,[]);
assert.equal(old.active.stageIndex,0);
const current = hydrateExpeditions({retiredFamilies:["rescue","rescue"],active:{systemsVisited:["A","A","B"]}});
assert.deepEqual(current.retiredFamilies,["rescue"]);
assert.deepEqual(current.active.systemsVisited,["A","B"]);

let saves=0, messages=[];
const game={system:{name:"B"},expeditions:{active:{name:"Test",systemsVisited:["A"],stageIndex:0,stages:[{type:"jump",goal:3,progress:0,label:"Chart sectors"}]}}};
const track = new Function("game","expeditionState","currentExpeditionStage","toast","saveGame",
  "grantCrewXp","markMeaningfulMoment","completeExpeditionArc","addActivity","spawnMajorThreat",
  getCode("trackExpeditionProgress","expeditionRewardMultiplier")+"\nreturn trackExpeditionProgress;")(
  game,()=>game.expeditions,()=>game.expeditions.active.stages[0],s=>messages.push(s),()=>saves++,
  ()=>{},()=>{},()=>{},()=>{},()=>{});
assert.equal(track("jump",1),true);
assert.equal(game.expeditions.active.stages[0].progress,1);
assert.equal(saves,1,"partial stage progress must save before quitting");
assert.equal(track("jump",1),false,"same-system jump cannot be counted twice");
assert.equal(saves,1);

const rewards = new Function("game","crewState",getCode("grantCrewXp","recruitCrew")+"\nreturn grantCrewXp;")(
  {crew:{members:[{id:"pilot",xp:0},{id:"science",xp:5}]}},
  function(){return this.crew;}.bind({crew:{members:[{id:"pilot",xp:0},{id:"science",xp:5}]}}));
assert.equal(typeof rewards,"function");

const importStart = html.indexOf("      async function importSaveFile(");
const importEnd = html.indexOf("      function deleteSave(", importStart);
assert.ok(importStart >= 0 && importEnd > importStart);
const importCode = html.slice(importStart, importEnd);
assert.match(importCode,/const previousDeletedState = saveDeletedUntilExplicitSave/);
assert.match(importCode,/saveDeletedUntilExplicitSave = previousDeletedState/);
assert.match(importCode,/localStorage\.setItem\(SAVE_KEY, JSON\.stringify\(data\)\)/);
assert.match(html,/if \(!state\.retiredFamilies\.includes\(offer\.family\)\)/);
console.log("Release candidate gameplay audit passed: crew, expeditions, partial progress, import rollback.");
