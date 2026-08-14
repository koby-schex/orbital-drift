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
  focus() {}
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
    initGame, body, nearestBody, capture, finishCapture, captureLimit, captureCapacityUsed,
    upgradeShip, upgradePlanet, updateShip, scanPlanet,
    buildFrigate, frigatePosition, frigateHomePosition, toggleOrbit, jumpSystem,
    startPioneerRescue, updatePioneerRescue, updateDrift, shipStats, refuel,
    chooseUnchartedSystemIndex, unchartedSystemCandidates,
    ensureSystemIndex, menuNavigationHtml, normalizeMenuName,
    fleetFormationSlot, fleetEscortMotion, fleetSkinForKey,
    startFleetMission, updateFleetMissions, completeFleetMission,
    systemVisualProfile, systemRarityClass, proc, parallelSystem, cosmicSpiritSystem,
    saveState, saveGame, loadGame, validSavePayload,
    setShipSkin, setFrigateSkin, owns, smartAction, releaseChecks,
    generateContracts, makeDailyOps, settingsHtml, storeHtml,
    monetizationStatusText,
    discoveryMysteries, discoveryCollections, discoveryState,
    systemMysteryProfile, currentMysteryRecord, scanSectorMystery,
    discoveryCollectionProgress, checkDiscoveryCollections,
    vaultCatalog, vaultState, vaultCapacity, vaultContainment,
    vaultSecuredEntries, registerVaultDiscovery, secureVaultEntry,
    unlockVaultSkin, vaultHtml, frigateSkins, frigateBenefit,
    crewTemplates, crewUniforms, crewState, crewMember, crewUpgradeCost,
    crewXpNeeded, recruitCrew, renameCrew, cycleCrewUniform, setCrewDuty,
    grantCrewXp, upgradeCrew, crewHtml,
    expeditionThemes, expeditionState, expeditionSimilarity,
    makeExpeditionOffer, generateExpeditionOffers, acceptExpedition,
    assignCrewToExpedition, trackExpeditionProgress, expeditionsHtml,
    livingEventTemplates, worldEventState, currentLivingSystemEvent,
    ensureLivingSystemEvent, resolveLivingSystemEvent, livingSystemEventHtml,
    majorThreatTemplates, spawnMajorThreat, prepareMajorThreat,
    resolveMajorThreat, majorThreatHtml, journeyPulseHtml,
    resolveExplorationEncounter,
    closeUpgradePanel, closeMissionPanel, settleOverlayPause,
    dismissPanels(){
      [ui.missionOverlay,ui.upgradeOverlay,ui.discoveryOverlay,ui.choiceOverlay,ui.confirmOverlay]
        .forEach((panel)=>panel?.classList.remove("show"));
      titleOpen=false; titleMenuMode=false; modalFreeze=false; paused=false;
    },
    prepareDiscoveryTest(seed=424242){
      const testSystem=proc(seed);
      systems=[sol(),testSystem]; currentSystemIndex=1; game.system=testSystem;
      updateBodies(game.system); resetShip(); game.sectorEvent=createSectorEvent(1);
      game.ship.x=game.sectorEvent.x; game.ship.y=game.sectorEvent.y;
      return game.sectorEvent;
    },
    prepareVaultTest(seed=626262){
      const testSystem=proc(seed);
      systems=[sol(),testSystem]; currentSystemIndex=1; game.system=testSystem;
      updateBodies(game.system); resetShip(); game.vault=defaultVault();
      Object.assign(game.frigate,{built:true,vaultLevel:0});
      game.ship.orbitLocked=true; game.ship.lockBody="__FRIGATE__";
      return testSystem;
    },
    get keys(){return keys}, get specialSystemOdds(){return specialSystemOdds},
    get pioneerRescue(){return pioneerRescue},
    get paused(){return paused}, get modalFreeze(){return modalFreeze},
    get upgradePanelOpen(){return ui.upgradeOverlay.classList.contains("show")},
    get missionPanelOpen(){return ui.missionOverlay.classList.contains("show")},
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

assert.equal(api.APP_VERSION, "0.22.2", "Expected release candidate version");
assert.equal(api.SAVE_VERSION, 20, "Expected current save schema");
assert.ok(api.universeSeed > 0, "New runs need a universe seed");
assert.equal(api.systems.length, 1, "New runs must begin with only the fixed tutorial system");
assert.equal(api.game.system.name, "Sol System", "Every pilot must start in Sol");
assert.equal(api.game.system.isTutorial, true, "Sol must remain the tutorial route");
assert.equal(api.captureLimit(), 3, "A new flight must begin with three frontier capture slots");
assert.equal(api.captureCapacityUsed(), 0, "Protected Earth must not consume a frontier capture slot");
for (const worldName of ["Mars", "Venus", "Uranus"]) {
  api.game.ship.orbitLocked = true;
  api.game.ship.lockBody = worldName;
  api.capture();
  api.dismissPanels();
}
assert.equal(api.captureCapacityUsed(), 3, "All three starting frontier slots must be usable");
assert.equal(api.game.captured.size, 4, "Earth plus three frontier worlds must remain captured");
api.game.ship.orbitLocked = true;
api.game.ship.lockBody = "Neptune";
api.capture();
assert.equal(api.game.captured.has("Neptune"), false, "A fourth frontier capture must open replacement flow");
assert.equal(api.captureCapacityUsed(), 3, "A blocked fourth capture must preserve the existing network");
api.dismissPanels();
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

for (let seed = 1; seed <= 24; seed++) {
  api.generateContracts(seed);
  assert.equal(
    new Set(api.game.contracts.map((contract) => contract.type)).size,
    api.game.contracts.length,
    `Frontier contracts must not repeat for seed ${seed}`,
  );
}
const dailyOps = api.makeDailyOps().ops;
assert.equal(
  new Set(dailyOps.map((operation) => operation.type)).size,
  dailyOps.length,
  "Daily Operations must offer distinct objectives",
);

api.game.monetization.storeKitReady = false;
api.game.monetization.adMobReady = false;
const playerFacingCopy = [
  api.monetizationStatusText(),
  api.settingsHtml(),
  api.storeHtml(),
].join(" ");
assert.doesNotMatch(
  playerFacingCopy,
  /StoreKit|AdMob|placeholder|product\s?id|test unlock|browser test|procedural|seed|route pool/i,
  "Player-facing menus must not expose implementation language",
);
assert.match(
  playerFacingCopy,
  /Web Edition has no advertisements or payments/,
  "Web players need an accurate commerce status",
);
assert.doesNotMatch(
  api.settingsHtml(),
  /Reset Save \+ Run/,
  "Destructive actions need player-facing language",
);

api.prepareVaultTest(515151);
api.game.resources = Object.fromEntries(
  Object.keys(api.game.resources).map((key) => [key, 9999]),
);
const offers = api.generateExpeditionOffers(true);
assert.equal(offers.length, 3, "The Pioneer should present three distinct expedition leads");
assert.equal(
  new Set(offers.map((offer) => offer.family)).size,
  offers.length,
  "An expedition board must not repeat a subject family",
);
for (let left = 0; left < offers.length; left++) {
  for (let right = left + 1; right < offers.length; right++) {
    assert.ok(
      api.expeditionSimilarity(offers[left], offers[right]) < 0.72,
      "Expedition leads on the same board must not use similar objective routes",
    );
  }
}
for (const theme of api.expeditionThemes) {
  const vaultName = api.vaultCatalog.find((entry) => entry.key === theme.vaultKey)?.name;
  assert.ok(vaultName, `${theme.name} needs a real Vault discovery reward`);
  assert.match(
    theme.rewardText,
    new RegExp(vaultName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    `${theme.name} must describe its matching Vault reward`,
  );
  assert.equal(
    api.majorThreatTemplates.filter((entry) => entry.key === theme.threat).length,
    1,
    `${theme.name} needs one matching final threat`,
  );
}
const accepted = offers[0];
assert.equal(api.acceptExpedition(accepted.id), true, "A Pioneer-orbit expedition should be accepted");
assert.equal(api.expeditionState().active.family, accepted.family);
api.expeditionState().active = null;
api.expeditionState().offers = [];
const nextOffers = api.generateExpeditionOffers(true);
assert.ok(
  nextOffers.every((offer) => offer.family !== accepted.family),
  "Accepted expedition families must remain retired even when progress is abandoned",
);

const starterCrew = api.crewState().members;
assert.equal(starterCrew.length, 3, "The Pioneer should launch with three core specialists");
assert.equal(new Set(starterCrew.map((member) => member.role)).size, 3);
const marshalTemplate = api.crewTemplates.find((entry) => entry.id === "tactical");
assert.equal(api.recruitCrew(marshalTemplate.id), true, "Recruitable specialists should join at Pioneer orbit");
const marshal = api.crewMember(marshalTemplate.id);
const firstUniform = marshal.uniform;
api.cycleCrewUniform(marshal.id);
assert.notEqual(marshal.uniform, firstUniform, "Crew uniforms should be customizable");
getElement(`crewName-${marshal.id}`).value = "Sera Horizon";
api.renameCrew(marshal.id);
assert.equal(marshal.name, "Sera Horizon", "Crew names should be customizable");
api.setCrewDuty(`${marshal.id}|fleet`);
assert.equal(marshal.duty, "fleet", "Crew duties should be assignable");
api.grantCrewXp(api.crewXpNeeded(marshal) + 5, marshal.id);
assert.equal(api.upgradeCrew(marshal.id), true, "Experienced crew should advance through training");
assert.equal(marshal.level, 2, "Crew training should raise specialist level");
assert.match(api.crewHtml(), /Sera Horizon/, "Crew customization must appear on the Pioneer deck");
assert.match(api.expeditionsHtml(), /Independent adventures/, "Expeditions must be presented as open adventures");

const livingEvent = api.ensureLivingSystemEvent(api.game.system, true);
assert.equal(livingEvent.status, "active", "A forced living-system event should become active");
api.resolveLivingSystemEvent(0);
assert.equal(livingEvent.status, "resolved", "Living-system choices should persist their resolution");
assert.ok(livingEvent.reward && Object.keys(livingEvent.reward).length, "Living-system decisions need themed rewards");

api.game.majorThreat = null;
const threat = api.spawnMajorThreat("thermal-burrower", "ambient");
const hullBeforeRetreat = api.game.ship.hull;
assert.equal(api.resolveMajorThreat("engineering"), false, "An unprepared major threat should force a safe retreat");
assert.ok(api.game.ship.hull < hullBeforeRetreat, "A retreat should carry a recoverable hull setback");
api.game.fleet.ships = [{ id: "threat-screen", type: "scout", status: "idle" }];
api.prepareMajorThreat("crew");
api.prepareMajorThreat("fleet");
api.prepareMajorThreat("systems");
assert.equal(api.resolveMajorThreat("engineering"), true, "Preparation and the right crew role should resolve a major threat");
assert.equal(threat.status, "resolved", "Resolved threats must enter the journey record");
assert.match(api.journeyPulseHtml(), /Major Threats/, "The open-journey record should include major threats");

const featureCopy = [api.expeditionsHtml(), api.crewHtml(), api.livingSystemEventHtml(), api.journeyPulseHtml()].join(" ");
assert.doesNotMatch(
  featureCopy,
  /procedural generation|random seed|similarity threshold|telemetry|retention system|developer|main campaign/i,
  "New player-facing systems must avoid implementation language",
);
assert.equal(api.saveState().crew.members.length, 4, "Crew progression must be included in saves");
assert.ok(api.saveState().expeditions.retiredFamilies.includes(accepted.family), "Expedition history must be included in saves");
assert.ok(Object.keys(api.saveState().worldEvents.records).length, "Living-system records must be included in saves");
assert.equal(api.saveGame(false), true, "Open-journey progress should save");
api.game.crew.members = [];
api.game.expeditions.retiredFamilies = [];
api.game.worldEvents.records = {};
assert.equal(api.loadGame(false), true, "Open-journey progress should load");
assert.equal(api.crewState().members.length, 4, "Customized crew must survive save/load");
assert.ok(api.expeditionState().retiredFamilies.includes(accepted.family), "Retired expedition leads must survive save/load");
assert.ok(Object.keys(api.worldEventState().records).length, "Living-system decisions must survive save/load");

assert.equal(api.discoveryMysteries.length, 8, "Every system family needs a mystery profile");
assert.equal(
  new Set(api.discoveryMysteries.map((mystery) => mystery.archetype)).size,
  api.discoveryMysteries.length,
  "Mystery profiles must be unique by system family",
);
assert.ok(api.discoveryCollections.length >= 12, "Discovery Depth needs a substantial collection board");

const discoveryEvent = api.prepareDiscoveryTest(112233);
const mysteryProfile = api.systemMysteryProfile();
for (const key of Object.keys(api.game.resources)) api.game.resources[key] = 999;
api.game.shipSystems = { thrust: 6, fuel: 6, brake: 6, accel: 6, handling: 6, cargo: 6 };
Object.assign(api.game.frigate, {
  built: true,
  scannerLevel: 4,
  reactorLevel: 4,
  hangarLevel: 4,
  capacityLevel: 4,
  commandLevel: 4,
});
api.game.fleet.ships = [{ id: "qa-scout", type: "scout", status: "idle" }];
api.game.echoStats.harvested = 3;
api.game.encounters.reputation = { coalition: 5, wayfarers: 5, echo: 5 };
api.scanSectorMystery();
const scannedMystery = api.currentMysteryRecord();
assert.equal(discoveryEvent.mysteryScanned, true, "Nearby mysteries should become decoded");
assert.equal(scannedMystery?.name, mysteryProfile.name, "Decoded mystery must match the system family");
assert.ok(scannedMystery?.clue, "Decoded mysteries need a persistent clue");
api.resolveExplorationEncounter(mysteryProfile.insightChoice);
assert.equal(api.currentMysteryRecord()?.resolved, true, "Encounter choices must resolve the mystery record");
assert.equal(api.currentMysteryRecord()?.usedInsight, true, "Decoded choices must apply their discovery advantage");

api.initGame(false);
api.game.codex = Object.fromEntries(
  ["A", "B", "C"].map((name) => [
    name,
    { name, archetypeKey: "innerForge", rarity: "Common" },
  ]),
);
const collectionRewardBefore = api.game.resources.Titanium;
api.checkDiscoveryCollections();
assert.ok(
  api.discoveryState().claimedCollections.has("forgeSurvey"),
  "Completing a themed Codex set must claim its collection",
);
assert.ok(
  api.game.resources.Titanium > collectionRewardBefore,
  "Codex collections must grant their listed rewards",
);

api.prepareVaultTest();
assert.ok(api.vaultCatalog.length >= 24, "Vault needs a substantial discovery catalog");
assert.ok(
  api.vaultCatalog.some((entry) => entry.kind === "artifact") &&
    api.vaultCatalog.some((entry) => entry.kind === "lifeform") &&
    api.vaultCatalog.some((entry) => entry.kind === "phenomenon"),
  "Vault catalog must include artifacts, lifeforms, and phenomena",
);
assert.ok(
  api.vaultCatalog.some((entry) => entry.source === "planet") &&
    api.vaultCatalog.some((entry) => entry.source === "space"),
  "Discoveries must come from planets and space",
);
assert.equal(api.vaultCapacity(0), 4, "Base Vault should begin with four secure slots");
assert.equal(api.vaultCapacity(6), 28, "Fully upgraded Vault should hold 28 discoveries");
assert.equal(api.vaultContainment(0), 1, "Base Vault should contain Benign discoveries");
assert.equal(api.vaultContainment(5), 6, "High-level Vault should contain Reality-Bending discoveries");
const dangerousFind = api.registerVaultDiscovery(
  "planet",
  "QA Ruins",
  true,
  "absence-glass",
);
assert.equal(dangerousFind.status, "pending", "Dangerous finds must enter quarantine");
api.game.frigate.vaultLevel = 3;
assert.equal(api.secureVaultEntry(dangerousFind.id), true, "Upgraded containment must secure quarantined finds");
assert.equal(dangerousFind.status, "secured", "Secured find must persist its new state");
assert.match(api.vaultHtml(), /Absence Glass/, "Vault UI must show visual discovery records");
assert.match(api.vaultHtml(), /Threat 4 • Volatile/, "Vault UI must explain threat ratings");

api.prepareVaultTest(737373);
api.game.frigate.vaultLevel = 6;
api.vaultCatalog.slice(0, 18).forEach((template, index) => {
  const entry = api.registerVaultDiscovery(
    template.source,
    `QA Site ${index}`,
    true,
    template.key,
  );
  assert.equal(entry?.status, "secured", `Vault specimen ${index + 1} should be secured`);
});
assert.equal(api.vaultSecuredEntries().length, 18, "Rare hull goal must require 18 secured finds");
assert.equal(api.unlockVaultSkin(false), false, "Threshold unlock should be idempotent");
assert.ok(
  api.game.ownedFrigateSkins.has("Astral Archaeologist"),
  "Eighteen secured discoveries must unlock Astral Archaeologist",
);
assert.equal(
  api.frigateSkins.find((skin) => skin.key === "Astral Archaeologist")?.rarity,
  "Rare",
  "Astral Archaeologist must be a Rare frigate skin",
);
assert.match(
  api.frigateBenefit("vault", 2).stat,
  /slots.*Hazardous.*Volatile/,
  "Vault upgrades must describe both capacity and containment gains",
);
assert.equal(api.saveState().vault.entries.length, 18, "Vault entries must be included in saves");
assert.equal(api.saveGame(false), true, "Vault progress save should succeed");
api.game.vault.entries = [];
api.game.ownedFrigateSkins.delete("Astral Archaeologist");
assert.equal(api.loadGame(false), true, "Vault progress save should load");
assert.equal(api.vaultSecuredEntries().length, 18, "Vault entries must survive save/load");
assert.ok(
  api.game.ownedFrigateSkins.has("Astral Archaeologist"),
  "Vault reward must remain unlocked after load",
);

api.initGame(false);

api.finishCapture(api.body("Mars"));
api.dismissPanels();
api.upgradeShip("thrust");
assert.equal(api.upgradePanelOpen, true, "First subsystem upgrade should show its result panel");
assert.equal(api.missionPanelOpen, true, "First subsystem upgrade should also show the next tutorial step");
assert.equal(api.paused, true, "Stacked upgrade panels should pause gameplay");
api.closeMissionPanel();
assert.equal(api.paused, true, "Closing the tutorial panel first must keep the remaining upgrade panel paused");
assert.equal(api.modalFreeze, true, "The remaining upgrade panel must retain modal freeze");
api.closeUpgradePanel();
assert.equal(api.paused, false, "Closing the final stacked panel must always resume gameplay");
assert.equal(api.modalFreeze, false, "No stale modal freeze may remain after stacked panels close");

api.initGame(false);
api.finishCapture(api.body("Mars"));
api.dismissPanels();
api.upgradeShip("fuel");
api.closeUpgradePanel();
assert.equal(api.paused, true, "Closing the upgrade panel first must preserve the tutorial panel pause");
api.closeMissionPanel();
assert.equal(api.paused, false, "Closing stacked panels in reverse order must also resume gameplay");

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
  assert.equal(venus.discoveryRewardClaimed, false, `${subsystem}: flyby must not auto-complete survey`);
  assert.equal(api.game.missionStage, 3, `${subsystem}: flyby should preserve training until scan`);
  api.scanPlanet("Venus");
  api.dismissPanels();
  checkpoint(`${subsystem}: survey complete`);
  assert.equal(api.game.missionStage, 4, `${subsystem}: Venus survey should advance training`);
  Object.keys(api.game.resources).forEach((resource) => {
    api.game.resources[resource] = 0;
  });
  api.buildFrigate();
  checkpoint(`${subsystem}: frigate complete`);
  assert.equal(api.game.frigate.built, true, `${subsystem}: Earth reserve must guarantee Pioneer construction`);
  assert.ok(
    Object.values(api.game.resources).every((amount) => amount >= 0),
    `${subsystem}: reserve-backed construction must never create negative resources`,
  );
  assert.ok(
    api.game.activity.some((entry) => entry.title === "Pioneer reserve released"),
    `${subsystem}: the construction reserve must be visible in the activity log`,
  );
}

assert.ok(
  api.specialSystemOdds.cosmicSpirit <= 0.005 && api.specialSystemOdds.blackHole <= 0.005,
  "Cosmic Spirit and Parallel gateways must remain extremely rare",
);
const spiritNaming = api.cosmicSpiritSystem(848484);
assert.ok(
  spiritNaming.bodies.filter((b) => b.type !== "star").every((b) => !/^Cosmic Spirit\b/i.test(b.name) && !/^Cosmic Spirit\b/i.test(b.biome)),
  "Cosmic Spirit worlds need distinct names and biome language",
);
assert.equal(
  new Set(spiritNaming.bodies.map((b) => b.name)).size,
  spiritNaming.bodies.length,
  "Special-system world names must be unique",
);

api.initGame(false);
api.game.frigate.built = true;
api.game.ship.orbitLocked = false;
api.game.ship.lockBody = null;
api.game.ship.fuel = 0;
assert.equal(api.startPioneerRescue(), true, "A built Pioneer should answer a fuel distress call");
for (let i = 0; i < 330 && api.pioneerRescue; i++) api.updatePioneerRescue(1);
assert.equal(api.pioneerRescue, null, "Pioneer rescue should complete its return to stellar orbit");
assert.equal(api.game.ship.lockBody, "__FRIGATE__", "Recovered Starling should orbit the Pioneer");
assert.equal(api.game.ship.fuel, api.game.ship.maxFuel, "Pioneer rescue should fully refuel the Starling");

api.game.ship.orbitLocked = false;
api.game.ship.vx = 2.4;
api.game.ship.vy = 0;
api.game.ship.angle = Math.PI / 2;
api.game.ship.driftCharge = 0;
api.keys.add("d");
api.updateDrift(1, api.shipStats());
api.keys.clear();
assert.ok(api.game.ship.driftCharge > 0, "High-speed steering should engage orbital drift");

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
assert.match(html, /Web Edition designs are complimentary and never require payment/, "Web commerce copy must be accurate and player-facing");
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
  `Orbital Drift release readiness passed: tutorial economy (${Object.keys({ thrust: 1, fuel: 1, brake: 1, accel: 1, handling: 1, cargo: 1 }).length} paths), ${visited.length} unique randomized jumps, Discovery Depth, Pioneer Vault progression, save migration/recovery, cosmetics, responsive invariants, audio lifecycle, and PWA assets.`,
);
