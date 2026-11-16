import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
function gameFunction(name, next) {
  const a = html.indexOf("      function " + name + "(");
  const b = html.indexOf("      function " + next + "(", a + 1);
  assert.ok(a >= 0 && b > a, name + " must exist in the game");
  return html.slice(a, b);
}

let now = 1730000000000;
const fakeDate = { now: () => now };
const messages = [];
let saves = 0, fleetProgress = 0, completedDaily = 0;
let game = {
  resources: {Alloy: 1000, DataCores: 0},
  frigate: {built: true},
  fleet: {
    ships: [], missions: [], completed: [],
    available: [
      {id: "fm-1", type: "exploration", title: "Survey One"},
      {id: "fm-2", type: "exploration", title: "Survey Two"},
    ],
    stats: {built: 0, matched: 0, completed: 0},
    boosts: {},
  },
  captainLog: {fleetMissionsCompleted: 0},
  retention: {},
};
const fleetShipTypes = {probe: {name: "Survey Probe", mission: "exploration", cost: {Alloy: 50}}};
const commonNames = [
  "game", "ensureFleet", "toast", "fleetShipTypes",
  "canAfford", "spend", "saveGame", "renderMenu", "Date",
];
const commonValues = [
  game, () => {}, text => messages.push(text), fleetShipTypes,
  cost => Object.entries(cost).every(([key, amount]) => (game.resources[key] || 0) >= amount),
  cost => {for (const [key, value] of Object.entries(cost)) game.resources[key] -= value;},
  () => {saves++;}, () => {}, fakeDate,
];

const buildCode = gameFunction("buildFleetShip", "upgradeFleetShip");
const build = new Function(...commonNames, "fleetLimit", "fleetShipCost", "addActivity",
  "triggerUpgradeEffect", buildCode + "\nreturn buildFleetShip;")(
  ...commonValues, () => 3, type => fleetShipTypes[type].cost, () => {}, () => {}
);
build("probe");
build("probe"); // Same timestamp, even if a random generator repeats.
assert.equal(game.fleet.ships.length, 2);
const ids = game.fleet.ships.map(ship => ship.id);
assert.equal(new Set(ids).size, 2, "Same-millisecond ship builds require unique IDs");
assert.equal(game.resources.Alloy, 900, "Each built ship must have exactly one construction cost");
assert.equal(game.fleet.stats.built, 2);
assert.equal(saves, 2);

const launchCode = gameFunction("startFleetMission", "startFleetMissionPair");
const launch = new Function(...commonNames, "activeMissionLimit", "missionDuration",
  "missionReward", "addActivity", launchCode + "\nreturn startFleetMission;")(
  ...commonValues, () => 2, () => 10, () => ({DataCores: 7}), () => {}
);
launch("fm-1", ids[0]);
launch("fm-2", ids[1]);
assert.equal(game.fleet.missions.length, 2);
assert.notEqual(game.fleet.missions[0].id, game.fleet.missions[1].id);
assert.deepEqual(game.fleet.missions.map(run => run.shipId), ids);
assert.deepEqual(game.fleet.ships.map(ship => ship.status), ["launching", "launching"]);

// Simulate the serialized shape reloading before mission completion.
game.fleet = JSON.parse(JSON.stringify(game.fleet));
now += 11000;
game.fleet.ships.forEach(ship => ship.status = "ready");
const finishCode = gameFunction("completeFleetMission", "applyFleetBoosts");
const finish = new Function(
  ...commonNames, "applyFleetBoosts", "trackExpeditionProgress", "markMeaningfulMoment",
  "trackDaily", "playSound", "feedbackPulse", "showMissionPanel", "fmt",
  "fleetBoostSummary", "generateFleetMissions", "addActivity",
  finishCode + "\nreturn completeFleetMission;"
)(
  ...commonValues, () => {},
  (type, amount) => {if(type === "fleet") fleetProgress += amount;},
  () => {}, () => {completedDaily++;}, () => {}, () => {}, () => {},
  value => JSON.stringify(value), () => "", () => {}, () => {}
);
const firstRun = game.fleet.missions[0].id;
finish(firstRun);
assert.equal(game.fleet.missions.length, 1, "Claiming one mission must leave the other active");
assert.equal(game.fleet.ships[0].status, "idle");
assert.equal(game.fleet.ships[1].status, "ready");
assert.equal(game.resources.DataCores, 7, "Only claimed mission reward is granted");
assert.equal(fleetProgress, 1);
finish(firstRun);
assert.equal(game.resources.DataCores, 7, "Repeated claims cannot duplicate rewards");
finish(game.fleet.missions[0].id);
assert.equal(game.fleet.missions.length, 0);
assert.equal(game.resources.DataCores, 14);
assert.equal(game.fleet.stats.completed, 2);
assert.equal(fleetProgress, 2);
assert.equal(completedDaily, 2);
assert.ok(game.fleet.ships.every(ship => ship.status === "idle"));

// A previous run/ship ID should not collide with another build at the same clock value.
now = 1730000000000;
const previousIds = new Set(game.fleet.ships.map(ship => ship.id));
build("probe");
assert.ok(!previousIds.has(game.fleet.ships.at(-1).id));
console.log("Fleet journey integration passed: build, spend, launch, reload, return, claim once, and reuse.");
