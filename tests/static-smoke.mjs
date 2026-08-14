import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
const markup = html.slice(0, html.indexOf("<script>"));

assert.equal(scripts.length, 1, "Expected one game script");
assert.doesNotThrow(
  () => new Function(scripts[0][1]),
  "Game script must parse",
);

const ids = [...markup.matchAll(/\bid=["']([^"']+)["']/g)].map(
  (match) => match[1],
);
assert.equal(ids.length, new Set(ids).size, "HTML ids must be unique");

const staticButtons = [...markup.matchAll(/<button\b([^>]*)>/gi)];
assert.ok(staticButtons.length > 20, "Expected the mobile control surface");
assert.ok(
  staticButtons.every((match) => /\btype=["']button["']/i.test(match[1])),
  "Every static button must declare type=button",
);

for (const required of [
  "function updateShip(",
  "function toggleOrbit(",
  "function capture(",
  "function jumpSystem(",
  "function jumpRandomSystem(",
  "function placeShipAtFrigate(",
  "function markIceWorldEncountered(",
  "function openExplorationEncounter(",
  "function resolveExplorationEncounter(",
  "function reputationHtml(",
  "function sectorVisualTheme(",
  "function drawVelocityField(",
  "function drawUnchartedBody(",
  "function tutorialObjective(",
  "function renderCosmetics(",
  "function renderSkinPreviews(",
  "function pioneerCommandHubHtml(",
  "function fleetFormationSlot(",
  "function fleetEscortMotion(",
  "function drawFleetShipVisual(",
  "function systemVisualProfile(",
  "function updateSystemVisualPhenomena(",
  "function drawRareSystemAura(",
  "function chooseUnchartedSystemIndex(",
  "function exportSaveFile(",
  "function importSaveFile(",
  "function registerOfflineSupport(",
  "function runTests(",
  "SAVE_VERSION = 16",
  'APP_VERSION = "0.18.0"',
  "SAVE_BACKUP_KEY",
  'key: "silent_choir_3"',
  "height: 100dvh",
  "prefers-reduced-motion",
  "discovery-stage",
  "command-vista",
  "menu-nav",
  'label: "Jump Outward"',
  "Jump to Random Uncharted System",
]) {
  assert.ok(
    html.includes(required),
    `Missing required implementation: ${required}`,
  );
}

assert.ok(
  !markup.includes('data-menu="flight"'),
  "Menu dock must not duplicate the on-screen flight controls",
);

assert.ok(
  !html.includes("ORBITAL DRIFT GAMEPLAY PATCH"),
  "Legacy monkey patch must stay removed",
);
assert.ok(
  !html.includes("window.ODGameplayPatch"),
  "Legacy runtime patch global must stay removed",
);

console.log(
  `Orbital Drift static smoke tests passed (${ids.length} unique ids).`,
);
