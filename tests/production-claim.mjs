import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const begin = html.indexOf("      function claimProduction(");
const end = html.indexOf("      function discoveryReward(", begin + 1);
assert.ok(begin >= 0 && end > begin, "Production claim function must be present");
const code = html.slice(begin, end);
function scenario(initial) {
  const game = {
    resources: { Alloy: 5, Crystal: 1, DataCores: 0 },
    captainLog: { productionClaimed: 0 },
  };
  const unclaimedProduction = {...initial};
  const effects = { messages: [], saves: 0, daily: [], activities: 0 };
  const run = new Function(
    "game", "unclaimedProduction", "toast", "label", "trackDaily",
    "addActivity", "checkAchievements", "saveGame", "renderMenu",
    code + "\nreturn claimProduction;",
  );
  const claimProduction = run(
    game, unclaimedProduction, message => effects.messages.push(message),
    key => key, (...args) => effects.daily.push(args),
    () => effects.activities++, () => {}, () => effects.saves++, () => {},
  );
  claimProduction();
  return {game, unclaimedProduction, effects};
}
const fractional = scenario({Alloy: 0.5, Crystal: 0.99, DataCores: 0.12});
assert.deepEqual(fractional.game.resources, {Alloy: 5, Crystal: 1, DataCores: 0},
  "Production below one unit must not grant resources");
assert.deepEqual(fractional.unclaimedProduction, {Alloy: 0.5, Crystal: 0.99, DataCores: 0.12},
  "Fractional output must be retained without resetting");
assert.equal(fractional.effects.saves, 0, "No-op collection should not save");
assert.equal(fractional.effects.daily.length, 0, "No-op collection should not advance objectives");
assert.match(fractional.effects.messages[0], /No planet production ready/);

const mixed = scenario({Alloy: 2.75, Crystal: 0.99, DataCores: 1.25});
assert.deepEqual(mixed.game.resources, {Alloy: 7, Crystal: 1, DataCores: 1});
assert.deepEqual(mixed.unclaimedProduction, {Alloy: 0.75, Crystal: 0.99, DataCores: 0.25});
assert.equal(mixed.game.captainLog.productionClaimed, 3);
assert.deepEqual(mixed.effects.daily, [["production", 3]]);
assert.equal(mixed.effects.saves, 1);
assert.ok(mixed.effects.messages[0].includes("2 Alloy"));
assert.ok(!mixed.effects.messages[0].includes("0 Crystal"));

const invalid = scenario({Alloy: NaN, Crystal: Infinity, DataCores: 0.5});
assert.equal(invalid.effects.saves, 0);
assert.deepEqual(invalid.game.resources, {Alloy: 5, Crystal: 1, DataCores: 0});

assert.match(html, /\.filter\(\(\[, v\]\) => Number\.isFinite\(v\) && v >= 1\)/,
  "Colony Output must not display zero-unit resources as ready");

console.log("Production claiming passed: fractional carry, whole-unit collection, and zero-unit UI safeguards.");
