import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
function functionBlock(name, nextName) {
  const begin = html.indexOf("      function " + name + "(");
  const end = html.indexOf("      function " + nextName + "(", begin + 1);
  assert.ok(begin >= 0 && end > begin, "Missing expedition functions: " + name);
  return html.slice(begin, end);
}
const code = functionBlock("expeditionSimilarity", "acceptExpedition");
const themes = Array.from({ length: 12 }, (_, i) => ({
  key: "arc-" + i,
  family: "family-" + i,
  name: "Expedition " + i,
  hook: "Adventure " + i,
  color: "#ffffff",
  leadRole: "Navigator",
  stages: [["unique-" + i, 1, "Survey " + i], ["threat", 1, "Final encounter"]],
  threat: "threat-" + i,
  reward: {DataCores: 10 + i},
  vaultKey: "vault-" + i,
  rewardText: "Reward " + i,
}));
const game = { expeditions: null };
const build = new Function("game", "expeditionThemes", "structuredClone", "rand", "mixSeed",
  "vaultStringSeed", "universeSeed", "defaultExpeditions",
  "expeditionState", code + "\nreturn { generateExpeditionOffers, expeditionSimilarity };");
const helpers = build(
  game, themes, structuredClone,
  n => (Math.abs(Math.sin(n * 0.001 + 0.12345)) % 1),
  (...parts) => parts.reduce((a, b) => (a * 37 + Number(b)) >>> 0, 101),
  key => [...key].reduce((a, c) => a + c.charCodeAt(0), 0),
  2026,
  () => ({offers: [], active: null, history: [], retiredFamilies: [], offerSeed: 1, completed: 0}),
  () => game.expeditions
);
function state(retiredFamilies = [], history = []) {
  game.expeditions = {offers: [], active: null, history, retiredFamilies, offerSeed: 1, completed: history.length};
  return game.expeditions;
}
state();
const first = helpers.generateExpeditionOffers();
assert.ok(first.length > 0 && first.length <= 3, "New saves receive expedition offers");
assert.equal(new Set(first.map(x => x.family)).size, first.length);
state(themes.slice(0, 10).map(x => x.family), themes.slice(0, 10).map(x => ({
  family: x.family, themeKey: x.key, stages: x.stages.map(([type]) => ({type}))
})));
const newContent = helpers.generateExpeditionOffers();
assert.ok(newContent.length > 0, "Unplayed families should remain offered");
assert.ok(newContent.every(x => !game.expeditions.retiredFamilies.includes(x.family)),
  "Replay must not crowd out unplayed story families");

const completedHistory = themes.map(x => ({
  family: x.family, themeKey: x.key, stages: x.stages.map(([type]) => ({type})),
  status: "completed",
}));
const finished = state(themes.map(x => x.family), completedHistory);
const renewed = helpers.generateExpeditionOffers();
assert.ok(renewed.length > 0 && renewed.length <= 3,
  "After all 12 stories are finished, expeditions must remain available");
const recent = new Set(completedHistory.slice(0, 3).map(x => x.family));
assert.ok(renewed.every(x => !recent.has(x.family)),
  "Recently completed adventures must not immediately repeat");
assert.equal(finished.completed, 12, "Offering repeat expeditions must not reset completed stats");
assert.equal(finished.retiredFamilies.length, 12,
  "Previously completed family records must survive replay");
assert.deepEqual(helpers.generateExpeditionOffers(), renewed,
  "Opening the board again must not reroll or change an accepted offer");

finished.offers = [];
finished.offerSeed++;
const refreshed = helpers.generateExpeditionOffers(true);
assert.ok(refreshed.length > 0, "Refreshing the endgame board must still offer adventures");
assert.ok(refreshed.every(x => !recent.has(x.family)),
  "Refreshing must not bypass immediate-repeat protection");

console.log("Expedition offer lifecycle passed: first-time stories, exhausted families, safe replays, and stable refreshes.");
