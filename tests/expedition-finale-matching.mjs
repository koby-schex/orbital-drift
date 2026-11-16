import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const begin = html.indexOf("      function resolveMajorThreat(");
const end = html.indexOf("      function systemMysteryProfile(", begin + 1);
assert.ok(begin > 0 && end > begin, "Could not locate actual threat-resolution implementation");
const source = html.slice(begin, end);

const template = {
  key: "finale-beast", rating: 3,
  strategies: [{ key: "science", label: "Calm the beast", role: "Xenologist" }],
};
function scenario({sourceKind, threatKey = "finale-beast", expedition = true, stageType = "threat"}) {
  const active = expedition ? {
    threatKey: "finale-beast", leadCrewId: null, stageIndex: 3,
    stages: [{type: "jump"}, {type: "survey"}, {type: "event"}, {type: stageType, progress: 0, goal: 1}],
  } : null;
  const game = {
    majorThreat: {
      templateKey: threatKey, source: sourceKind,
      name: "Encounter", rating: 3, status: "active",
      readiness: 50, setbacks: 0, strategies: template.strategies,
    },
    fleet: { ships: [] },
    ship: { hull: 100 },
    captainLog: { threatsResolved: 0 },
    expeditions: { active },
  };
  const effects = { progress: 0, spawned: [], rewards: 0, saves: 0, activities: 0, history: [] };
  const runner = new Function("game", "threatTemplate", "crewRolePower", "crewMember",
    "expeditionState", "worldEventState", "structuredClone", "grantCrewXp",
    "scaleReward", "crewDutyPower", "grantReward", "showMissionPanel",
    "fmt", "markMeaningfulMoment", "addActivity", "trackExpeditionProgress",
    "currentExpeditionStage", "spawnMajorThreat", "saveGame", "renderMenu", "toast",
    "HULL_MAX", source + "\nreturn resolveMajorThreat;");
  const fn = runner(game, key => key === threatKey ? template : null,
    () => 0, () => null, () => game.expeditions,
    () => ({history: effects.history}), structuredClone, () => {},
    x => x, () => 0, () => {effects.rewards++;}, () => {}, () => "reward",
    () => {}, () => {effects.activities++;},
    () => {effects.progress++;}, a => a?.stages?.[a.stageIndex] || null,
    (key, kind) => {
      effects.spawned.push({key, kind});
      game.majorThreat = {templateKey:key, source:kind, status:"active"};
    },
    () => {effects.saves++;}, () => {}, () => {}, 100);
  const result = fn("science");
  return {result, game, effects};
}
const ambientDuringFinale = scenario({sourceKind:"ambient"});
assert.equal(ambientDuringFinale.result, true);
assert.equal(ambientDuringFinale.effects.progress, 0,
  "Ambient threats must not complete expedition final objectives");
assert.deepEqual(ambientDuringFinale.effects.spawned, [{key:"finale-beast",kind:"expedition"}],
  "After resolving ambient interference, spawn the actual expedition finale");
assert.equal(ambientDuringFinale.effects.rewards, 1,
  "Ambient encounters may still grant their normal one-time reward");
assert.equal(ambientDuringFinale.game.majorThreat.source, "expedition");

const finale = scenario({sourceKind:"expedition"});
assert.equal(finale.effects.progress, 1, "Matching expedition threat must count");
assert.equal(finale.effects.spawned.length, 0, "Successful finales must not spawn another threat");

const wrongKey = scenario({sourceKind:"expedition", threatKey:"unrelated-beast"});
assert.equal(wrongKey.effects.progress, 0, "Unrelated expedition threat must not finish active arc");

const notAtFinale = scenario({sourceKind:"expedition", stageType:"survey"});
assert.equal(notAtFinale.effects.progress, 0, "Threats must not advance other expedition stages");
const noExpedition = scenario({sourceKind:"ambient", expedition:false});
assert.equal(noExpedition.effects.progress, 0);
assert.equal(noExpedition.effects.spawned.length, 0);
assert.equal(noExpedition.game.majorThreat, null);

console.log("Expedition finale matching passed: ambient obstruction, correct finale, unrelated threats and no active arc.");
