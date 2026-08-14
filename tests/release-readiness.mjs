import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const script = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script, "Game script must exist");

class FakeClassList {
  constructor(initial = "") {
    this.values = new Set(String(initial).split(/\s+/).filter(Boolean));
  }
  add(...names) { names.forEach((name) => this.values.add(name)); }
  remove(...names) { names.forEach((name) => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const enabled = force === undefined ? !this.values.has(name) : !!force;
    enabled ? this.values.add(name) : this.values.delete(name);
    return enabled;
  }
}

const gradient = { addColorStop() {} };
const canvasContext = new Proxy(
  {
    canvas: { width: 1280, height: 800 },
    measureText: (text) => ({ width: String(text).length * 7 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createConicGradient: () => gradient,
    createPattern: () => ({}),
    getImageData: () => ({ data: new Uint8ClampedArray(16) }),
  },
  {
    get(target, prop) {
      if (prop in target) return target[prop];
      return () => {};
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  },
);

const attributeMap = new Map();
for (const match of html.matchAll(/<([a-z0-9-]+)\b([^>]*\bid=["']([^"']+)["'][^>]*)>/gi)) {
  const attrs = {};
  for (const attr of match[2].matchAll(/([\w:-]+)=["']([^"']*)["']/g))
    attrs[attr[1]] = attr[2];
  attributeMap.set(match[3], attrs);
}

class FakeElement {
  constructor(id = "", attrs = {}) {
    this.id = id;
    this.attrs = { ...attrs };
    this.className = attrs.class || "";
    this.classList = new FakeClassList(this.className);
    this.style = { setProperty() {}, removeProperty() {} };
    this.children = [];
    this.dataset = {};
    this.value = "";
    this.textContent = "";
    this.innerHTML = "";
    this.disabled = false;
    this.files = [];
  }
  getContext() { return canvasContext; }
  addEventListener(type, handler) { this[`on${type}`] = handler; }
  removeEventListener() {}
  appendChild(child) { this.children.push(child); return child; }
  prepend(child) { this.children.unshift(child); }
  removeChild(child) { this.children = this.children.filter((item) => item !== child); }
  remove() {}
  get firstChild() { return this.children[0] || null; }
  get lastChild() { return this.children.at(-1) || null; }
  click() { this.onclick?.({ target: this, preventDefault() {}, stopPropagation() {} }); }
  closest() { return null; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setPointerCapture() {}
  releasePointerCapture() {}
  getBoundingClientRect() {
    return { left: 0, top: 0, right: 100, bottom: 44, width: 100, height: 44 };
  }
}

const elements = new Map();
const getElement = (id) => {
  if (!elements.has(id)) elements.set(id, new FakeElement(id, attributeMap.get(id)));
  return elements.get(id);
};
const body = new FakeElement("body");
const documentElement = new FakeElement("html");
const document = {
  body,
  documentElement,
  hidden: false,
  fonts: { ready: Promise.resolve() },
  getElementById: getElement,
  createElement: (tag) => new FakeElement(tag),
  addEventListener() {},
  removeEventListener() {},
  querySelectorAll() { return []; },
  querySelector(selector) {
    if (selector === 'meta[name="viewport"]')
      return { content: "width=device-width,viewport-fit=cover" };
    if (selector === 'link[rel="manifest"]') return { href: "./manifest.webmanifest" };
    return null;
  },
};

const storage = new Map();
const localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};

const context = {
  console,
  document,
  localStorage,
  navigator: { vibrate() {} },
  location: { protocol: "file:" },
  crypto: webcrypto,
  innerWidth: 1280,
  innerHeight: 800,
  devicePixelRatio: 1,
  performance: { now: () => 1000 },
  requestAnimationFrame: () => 1,
  cancelAnimationFrame() {},
  addEventListener() {},
  removeEventListener() {},
  setTimeout: () => 1,
  clearTimeout() {},
  setInterval: () => 1,
  clearInterval() {},
  Blob,
  URL: { createObjectURL: () => "blob:test", revokeObjectURL() {} },
  Uint8ClampedArray,
  Uint32Array,
  Image: class {},
  Math,
  Date,
  JSON,
  Intl,
  structuredClone,
};
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(
  `${script}\n;globalThis.__releaseApi={
    get game(){return game}, get systems(){return systems},
    get currentSystemIndex(){return currentSystemIndex},
    get universeSeed(){return universeSeed},
    initGame, body, nearestBody, finishCapture, upgradeShip, upgradePlanet, updateShip,
    buildFrigate, frigatePosition, toggleOrbit, jumpSystem,
    chooseUnchartedSystemIndex, unchartedSystemCandidates,
    ensureSystemIndex, menuNavigationHtml, normalizeMenuName,
    fleetFormationSlot, fleetEscortMotion, fleetSkinForKey,
    startFleetMission, updateFleetMissions, completeFleetMission,
    systemVisualProfile, systemRarityClass, proc, parallelSystem,
    saveState, saveGame, loadGame, validSavePayload,
    setShipSkin, setFrigateSkin, owns, smartAction, releaseChecks,
    dismissPanels(){
      [ui.missionOverlay,ui.upgradeOverlay,ui.discoveryOverlay,ui.choiceOverlay,ui.confirmOverlay]
        .forEach((panel)=>panel?.classList.remove("show"));
      titleOpen=false; titleMenuMode=false; modalFreeze=false; paused=false;
    },
    get SAVE_KEY(){return SAVE_KEY}, get SAVE_BACKUP_KEY(){return SAVE_BACKUP_KEY},
    get SAVE_VERSION(){return SAVE_VERSION}, get APP_VERSION(){return APP_VERSION}
  };`,
  context,
  { filename: "index.html" },
);
const api = context.__releaseApi;
const checkpoint = (label) => {
  if (process.env.DEBUG_RELEASE_TESTS) console.error(`[release-test] ${label}`);
};
checkpoint("script initialized");

assert.equal(api.APP_VERSION, "0.18.0", "Expected release candidate version");
assert.equal(api.SAVE_VERSION, 16, "Expected current save schema");
assert.ok(api.universeSeed > 0, "New runs need a universe seed");
assert.equal(api.systems.length, 1, "New runs must begin with only the fixed tutorial system");
assert.equal(api.game.system.name, "Sol System", "Every pilot must start in Sol");
assert.equal(api.game.system.isTutorial, true, "Sol must remain the tutorial route");
assert.equal(
  new Set(api.systems.map((system) => system.name)).size,
  api.systems.length,
  "Generated systems must have unique names",
);

api.unchartedSystemCandidates(8);
const firstRunNames = api.systems.slice(1, 9).map((system) => system.name);
const firstRunSeed = api.universeSeed;
api.initGame(false);
checkpoint("second new run initialized");
assert.equal(api.systems.length, 1, "Restarting must not pre-chart random systems");
api.unchartedSystemCandidates(8);
const secondRunNames = api.systems.slice(1, 9).map((system) => system.name);
assert.notEqual(api.universeSeed, firstRunSeed, "Every new run needs a new seed");
assert.notDeepEqual(secondRunNames, firstRunNames, "New runs need different systems");
assert.ok(
  !api.menuNavigationHtml().includes('data-arg="&quot;flight&quot;"'),
  "Flight controls must not be duplicated in menu navigation",
);
assert.notEqual(api.normalizeMenuName("flight"), "flight", "Legacy Flight links must redirect");

for (const subsystem of ["thrust", "fuel", "brake", "accel", "handling", "cargo"]) {
  checkpoint(`tutorial path: ${subsystem}`);
  api.initGame(false);
  checkpoint(`${subsystem}: init complete`);
  api.finishCapture(api.body("Mars"));
  api.dismissPanels();
  checkpoint(`${subsystem}: capture complete`);
  assert.equal(api.game.missionStage, 1, `${subsystem}: Mars capture should advance training`);
  api.upgradeShip(subsystem);
  api.dismissPanels();
  checkpoint(`${subsystem}: ship upgrade complete`);
  assert.equal(api.game.missionStage, 2, `${subsystem}: first upgrade should advance training`);
  api.upgradePlanet();
  api.dismissPanels();
  checkpoint(`${subsystem}: planet upgrade complete`);
  assert.equal(api.game.missionStage, 3, `${subsystem}: Mars upgrade should advance training`);
  const venus = api.body("Venus");
  api.game.ship.orbitLocked = false;
  api.game.ship.lockBody = null;
  api.game.ship.x = venus.x + venus.radius + 4;
  api.game.ship.y = venus.y;
  api.game.ship.vx = venus.vx || 0;
  api.game.ship.vy = venus.vy || 0;
  checkpoint(`${subsystem}: nearest before survey ${api.nearestBody().body?.name}/${api.nearestBody().d}`);
  api.updateShip(0.001);
  checkpoint(`${subsystem}: survey complete`);
  assert.equal(api.game.missionStage, 4, `${subsystem}: Venus survey should advance training`);
  api.buildFrigate();
  checkpoint(`${subsystem}: frigate complete`);
  assert.equal(api.game.frigate.built, true, `${subsystem}: economy must fund Pioneer construction`);
}

api.initGame(false);
checkpoint("rendezvous path initialized");
api.finishCapture(api.body("Mars"));
api.dismissPanels();
api.upgradeShip("fuel");
api.dismissPanels();
api.upgradePlanet();
api.dismissPanels();
api.game.missionStage = 4;
api.buildFrigate();
const frigate = api.frigatePosition();
api.game.ship.orbitLocked = false;
api.game.ship.lockBody = null;
api.game.ship.x = frigate.x + frigate.radius + 70;
api.game.ship.y = frigate.y;
api.game.ship.vx = frigate.vx;
api.game.ship.vy = frigate.vy;
api.toggleOrbit();
assert.equal(api.game.missionStage, 6, "Pioneer rendezvous should arm the first jump");
assert.equal(api.smartAction().label, "Jump Outward", "Frigate orbit needs a direct travel action");

const visited = [];
const archetypes = new Set();
const modifiers = new Set();
for (let jump = 0; jump < 7; jump++) {
  checkpoint(`random jump: ${jump + 1}`);
  api.jumpSystem();
  visited.push(api.currentSystemIndex);
  archetypes.add(api.game.system.archetype?.key);
  modifiers.add(api.game.system.modifier?.key);
}
assert.equal(new Set(visited).size, visited.length, "Outward jumps must never revisit a charted system");
assert.ok(visited.some((index, position) => index !== position + 1), "Outward routing must not be a linear index walk");
assert.ok(archetypes.size >= 3, "Early jumps should expose multiple system archetypes");
assert.ok(modifiers.size >= 2, "Early jumps should expose multiple sector modifiers");

api.game.frigate.commandLevel = 5;
api.game.frigate.hangarLevel = 4;
api.game.resources = Object.fromEntries(Object.keys(api.game.resources).map((key) => [key, 9999]));
api.game.fleet.ships.push({
  id: "fleet-test-scout",
  type: "scout",
  level: 2,
  name: "Scout Test",
  status: "idle",
  missionId: null,
});
const slot = api.fleetFormationSlot(0);
assert.ok(Math.hypot(slot.x, slot.y) > 220, "Fleet formation must clear the Starling orbit lane");
const missionTemplate = api.game.fleet.available[0];
api.startFleetMission(missionTemplate.id, "fleet-test-scout");
const fleetShip = api.game.fleet.ships.find((ship) => ship.id === "fleet-test-scout");
assert.equal(fleetShip.status, "launching", "Expeditions must begin with a departure animation");
assert.ok(api.fleetEscortMotion(fleetShip, slot), "Departing escorts remain visible while flying out");
fleetShip.departureAt = Date.now() - 3000;
api.updateFleetMissions();
assert.equal(fleetShip.status, "mission", "Departed escorts must become deployed");
assert.equal(api.fleetEscortMotion(fleetShip, slot), null, "Deployed escorts must disappear from formation");
const fleetMission = api.game.fleet.missions.find((mission) => mission.shipId === fleetShip.id);
fleetMission.endAt = Date.now() - 10;
api.updateFleetMissions();
assert.equal(fleetShip.status, "returning", "Completed expeditions must fly back to base");
assert.ok(api.fleetEscortMotion(fleetShip, slot), "Returning escorts must be visible on approach");
fleetShip.returnStartedAt = Date.now() - 3000;
api.updateFleetMissions();
assert.equal(fleetShip.status, "ready", "Returned escorts must settle into formation before claiming");
api.completeFleetMission(fleetMission.id);
api.dismissPanels();
assert.equal(fleetShip.status, "idle", "Claimed escorts must resume formation duty");

const commandPalette = api.fleetSkinForKey("Command Match");
assert.equal(commandPalette.key, "Command Match", "Command Match must resolve a live palette");
assert.match(commandPalette.primary, /^#[0-9a-f]{6}$/i, "Adaptive fleet palettes need valid hull colors");
assert.notDeepEqual(
  api.systemVisualProfile(api.proc(41021)),
  api.systemVisualProfile(api.parallelSystem(41021)),
  "Parallel space must have a unique visual-event identity",
);
assert.equal(api.systemRarityClass(api.parallelSystem(41022)), "Parallel");

api.game.ownedShipSkins.add("Solar Flare");
api.setShipSkin("Solar Flare");
assert.equal(api.game.frigate.shipSkin, "Solar Flare", "Owned ship skin should equip");
api.game.ownedFrigateSkins.add("Abyss");
api.setFrigateSkin("Abyss");
assert.equal(api.game.frigate.skin, "Abyss", "Owned frigate skin should equip");
checkpoint("cosmetics equipped");

assert.equal(api.saveGame(false), true, "Primary save should succeed");
const saved = localStorage.getItem(api.SAVE_KEY);
assert.ok(api.validSavePayload(JSON.parse(saved)), "Current save should pass validation");
api.game.resources.Alloy = 999999;
assert.equal(api.loadGame(false), true, "Current save should load");
assert.notEqual(api.game.resources.Alloy, 999999, "Load should restore saved state");

api.saveGame(false);
localStorage.setItem(api.SAVE_KEY, "{damaged-json");
assert.equal(api.loadGame(false), true, "Damaged primary save should recover from backup");
assert.doesNotThrow(() => JSON.parse(localStorage.getItem(api.SAVE_KEY)));
checkpoint("backup recovered");

api.saveGame(false);
localStorage.setItem(api.SAVE_KEY, JSON.stringify({ version: 15, resources: {} }));
assert.equal(api.loadGame(false), true, "Structurally invalid primary save should recover from backup");
assert.ok(
  api.validSavePayload(JSON.parse(localStorage.getItem(api.SAVE_KEY))),
  "Recovered primary save should be structurally valid",
);

const migrated = api.saveState();
delete migrated.universeSeed;
migrated.version = 14;
const migratedNames = migrated.bodyStates.map((system) => system.name);
localStorage.setItem(api.SAVE_KEY, JSON.stringify(migrated));
assert.equal(api.loadGame(false), true, "Version 14 saves should migrate");
assert.ok(api.universeSeed > 0, "Migrated saves should receive randomized future routes");
assert.deepEqual(
  api.systems.slice(0, migratedNames.length).map((system) => system.name),
  migratedNames,
  "Save migration must preserve already-charted system names",
);
checkpoint("save migrated");

const readiness = api.releaseChecks();
assert.ok(readiness.length >= 16, "Release checklist should cover all critical groups");
assert.ok(readiness.every((check) => check.pass), `Runtime release checks failed: ${readiness.filter((check) => !check.pass).map((check) => check.label).join(", ")}`);

assert.match(html, /bottom:\s*calc\(var\(--miniMapSize\) \+ 30px/, "Desktop action must clear Nav Map");
assert.match(html, /@media \(max-width: 900px\)[\s\S]*?\.smart\s*\{[\s\S]*?bottom:\s*calc\(370px/, "Mobile action must clear controls and Nav Map");
assert.match(html, /--thrustSize:\s*76px/, "Primary touch control must remain large");
assert.match(html, /prefers-reduced-motion:\s*reduce/, "Reduced motion support must remain present");
assert.match(html, /Browser — No Charge|Browser test mode uses simulated unlocks/, "Browser purchases must be explicitly labeled as simulations");
assert.match(html, /audio\.ctx\.suspend/, "Backgrounding should suspend audio");
assert.match(html, /audio\.ctx\.resume/, "Returning should resume configured audio");

const manifest = JSON.parse(await readFile(new URL("manifest.webmanifest", root), "utf8"));
assert.equal(manifest.display, "standalone");
assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
for (const path of [
  "sw.js",
  "assets/orbital-drift-icon.svg",
  "assets/orbital-drift-icon-192.png",
  "assets/orbital-drift-icon-512.png",
]) await access(new URL(path, root));
const worker = await readFile(new URL("sw.js", root), "utf8");
assert.doesNotThrow(() => new Function(worker), "Service worker must parse");
assert.match(worker, /caches\.match/, "Service worker needs an offline fallback");

console.log(
  `Orbital Drift release readiness passed: tutorial economy (${Object.keys({ thrust: 1, fuel: 1, brake: 1, accel: 1, handling: 1, cargo: 1 }).length} paths), ${visited.length} unique randomized jumps, save migration/recovery, cosmetics, responsive invariants, audio lifecycle, and PWA assets.`,
);
