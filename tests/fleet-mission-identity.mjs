import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const start = html.indexOf("      function startFleetMission(");
const end = html.indexOf("      function startFleetMissionPair(", start + 1);
assert.ok(start >= 0 && end > start, "Game must implement fleet mission launch");
const code = html.slice(start, end);

const game = {
  fleet: {
    available: [
      {id: "fm-alpha", type: "exploration", title: "Survey Alpha"},
      {id: "fm-beta", type: "exploration", title: "Survey Beta"},
      {id: "fm-gamma", type: "exploration", title: "Survey Gamma"},
    ],
    ships: [
      {id: "fs-a", type: "probe", name: "Survey Probe A", status: "idle"},
      {id: "fs-b", type: "probe", name: "Survey Probe B", status: "idle"},
    ],
    missions: [],
    completed: [],
    stats: {matched: 0},
  },
};
let saves = 0;
const fakeNow = 1730000000000;
const startMission = new Function(
  "game", "Date", "ensureFleet", "toast", "activeMissionLimit", "fleetShipTypes",
  "missionDuration", "missionReward", "addActivity", "saveGame", "renderMenu",
  code + "\nreturn startFleetMission;"
)(
  game, {now: () => fakeNow}, () => {}, () => {}, () => 3,
  {probe: {mission:"exploration"}}, () => 15, () => ({DataCores: 9}),
  () => {}, () => saves++, () => {}
);

startMission("fm-alpha", "fs-a");
startMission("fm-beta", "fs-b");
assert.equal(game.fleet.missions.length, 2, "Both missions should launch");
const [first, second] = game.fleet.missions;
assert.notEqual(first.id, second.id,
  "Different ships launching in the same millisecond need distinct run IDs");
assert.equal(game.fleet.ships[0].missionId, first.id);
assert.equal(game.fleet.ships[1].missionId, second.id);
assert.equal(new Set(game.fleet.missions.map(m => m.id)).size, 2);
assert.equal(saves, 2);

startMission("fm-gamma", "fs-a");
assert.equal(game.fleet.missions.length, 2,
  "Deploying a busy ship again must not create or overwrite another mission");

const collisionId = "run-" + fakeNow + "-fs-a";
game.fleet.missions = [];
game.fleet.ships[0].status = "idle";
game.fleet.completed.push({id: collisionId});
startMission("fm-gamma", "fs-a");
assert.equal(game.fleet.missions.length, 1);
assert.notEqual(game.fleet.missions[0].id, collisionId,
  "New mission IDs must avoid collision with previously completed runs");
assert.match(game.fleet.missions[0].id, /-fs-a-1$/);

console.log("Fleet run identity passed: simultaneous launches, busy ships, and historical ID collisions.");
