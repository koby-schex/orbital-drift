import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const restoreStart = html.indexOf("      function restoreGame(");
const restoreEnd = html.indexOf("      function saveMeta(", restoreStart + 1);
assert.ok(restoreStart >= 0 && restoreEnd > restoreStart);
const restore = html.slice(restoreStart, restoreEnd);
function position(needle) {
  const index = restore.indexOf(needle);
  assert.ok(index >= 0, "Restore must include " + needle);
  return index;
}
const reconcileAt = position("refreshSkins(false);");
for (const field of [
  "game.echoStats =",
  "game.captainLog =",
  "game.vault =",
  "game.crew =",
  "game.unlockedAchievements =",
  "game.ownedShipSkins =",
  "game.ownedFrigateSkins =",
  "game.ownedFleetSkins =",
  "game.ownedTrailSkins =",
]) assert.ok(position(field) < reconcileAt,
  field + " must be restored before cosmetic unlock reconciliation");
assert.equal(restore.slice(0, reconcileAt).includes("ensureSkins();"), false,
  "Earlier cosmetic reconciliation could reset an earned equipped design");

const sectionStart = position("game.unlockedAchievements =");
const sectionEnd = position("unclaimedProduction = {");
const section = restore.slice(sectionStart, sectionEnd);
function hydrate({ship = "Cosmic Warp", frigate = "Spirit Voyager", fleet = "Spirit Wing",
  ownedShip = [], ownedFrigate = [], ownedFleet = []} = {}) {
  const game = {
    frigate: { shipSkin: ship, skin: frigate, fleetSkin: fleet },
    fleet: { skin: fleet },
    ownedShipSkins: new Set(ownedShip),
    ownedFrigateSkins: new Set(ownedFrigate),
    ownedFleetSkins: new Set(ownedFleet),
  };
  let refreshCount = 0, refreshShow = null;
  const restoreCosmetics = new Function("game", "d", "refreshSkins",
    "owns", "ownsFleetSkin", section);
  restoreCosmetics(game, {unlockedAchievements: ["cosmic"]}, show => {
    refreshCount++; refreshShow = show;
    // In the real game this refresh uses the newly hydrated expedition,
    // vault and captain log progress to re-grant earned skins.
    game.ownedShipSkins.add("Cosmic Warp");
    game.ownedFrigateSkins.add("Spirit Voyager");
    game.ownedFleetSkins.add("Spirit Wing");
  }, (kind, key) => (kind === "ship" ? game.ownedShipSkins : game.ownedFrigateSkins).has(key),
  key => game.ownedFleetSkins.has(key));
  return {game, refreshCount, refreshShow};
}
const earned = hydrate();
assert.equal(earned.refreshCount, 1);
assert.equal(earned.refreshShow, false, "Loading must not show unlock popups");
assert.equal(earned.game.frigate.shipSkin, "Cosmic Warp");
assert.equal(earned.game.frigate.skin, "Spirit Voyager");
assert.equal(earned.game.fleet.skin, "Spirit Wing");
assert.equal(earned.game.frigate.fleetSkin, "Spirit Wing");

const invalid = hydrate({ship:"Unavailable Ship",frigate:"Unavailable Frigate",fleet:"Unavailable Fleet"});
assert.equal(invalid.game.frigate.shipSkin, "High Tech");
assert.equal(invalid.game.frigate.skin, "Frigate Standard");
assert.equal(invalid.game.fleet.skin, "Command Match");
assert.equal(invalid.game.frigate.fleetSkin, "Command Match");

console.log("Cosmetic save hydration passed: progress is restored before unlocks, equipped designs persist, invalid selections safely reset.");
