import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const start = html.indexOf("      function scaleReward(");
const end = html.indexOf("      function makeDailyOps(", start + 1);
assert.ok(start >= 0 && end > start, "Game economy must define scaleReward");
const scaleReward = new Function(html.slice(start, end) + "\nreturn scaleReward;")();

assert.deepEqual(scaleReward({Alloy: 0, Titanium: 0, Helium3: 0}, 1.5), {},
  "Explicit zero-value resources must never be minted");
assert.deepEqual(scaleReward({Alloy: 8, Titanium: 0, Crystal: 4}, 1.5),
  {Alloy: 12, Crystal: 6}, "Positive rewards scale without inventing other resources");
assert.deepEqual(scaleReward({Alloy: 1, Crystal: 0}, 0.2), {Alloy: 1},
  "Positive fractional rewards retain minimum-one rounding");
assert.deepEqual(scaleReward({Alloy: 10, Crystal: 0}, 0), {},
  "Zero multiplier must yield no resources");
assert.deepEqual(scaleReward({Alloy: 10, Crystal: 0}, -2), {},
  "Negative multipliers must not mint resources");
assert.deepEqual(scaleReward({Alloy: -4, Titanium: NaN, Plasma: Infinity, BioGel: 2}, 2),
  {BioGel: 4}, "Invalid and nonpositive entries must be excluded");
assert.deepEqual(scaleReward(null, 2), {}, "Empty rewards should be harmless");

const game = {resources: {Alloy: 10, Crystal: 5}};
let activities = 0;
const grantStart = html.indexOf("      function grantReward(");
const grantEnd = html.indexOf("      function productionMult(", grantStart + 1);
assert.ok(grantStart >= 0 && grantEnd > grantStart);
const grantReward = new Function("game", "addActivity", "fmt",
  html.slice(grantStart, grantEnd) + "\nreturn grantReward;")(
  game, () => activities++, () => "granted");
const clean = grantReward(scaleReward({Alloy: 6, Crystal: 0}, 2), "Fleet supply");
assert.deepEqual(clean, {Alloy: 12});
assert.deepEqual(game.resources, {Alloy: 22, Crystal: 5},
  "Applying scaled rewards must never award zero-defined Crystal");
assert.equal(activities, 1);
grantReward(scaleReward({Crystal: 0}, 4), "Nothing");
assert.deepEqual(game.resources, {Alloy: 22, Crystal: 5});
assert.equal(activities, 1, "No-op rewards must not create an activity");

console.log("Economy scaling passed: zero and invalid rewards never mint resources, positive rewards retain scaling.");
