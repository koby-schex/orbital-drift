import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
const a=html.indexOf("      function renderFrigate()");
const b=html.indexOf("      function cosmeticPreviewHtml(",a+1);
assert.ok(a>=0&&b>a,"Pioneer menu renderer must exist");
const render=html.slice(a,b);
const overviewStart=render.indexOf("        const overview =");
const upgradeStart=render.indexOf("        const upgradeRows =",overviewStart);
const overview=render.slice(overviewStart,upgradeStart);
assert.match(overview,/What would you like to do\?/);
for(const label of ["Explore a new system","Adventures","Fleet","Crew"]){
  assert.ok(overview.includes(label),"Pioneer landing must expose "+label);
}
assert.match(overview,/<details class="pioneer-command-details"/);
assert.match(overview,/<summary>Base details and settings<\/summary>/);
assert.match(overview,/id="frigateNameInput"/);
assert.match(overview,/data-action="renameFrigate"/);
assert.doesNotMatch(overview,/pioneer-hero-grid/,"Old four-metric command dashboard must not dominate the first screen");
assert.doesNotMatch(render,/Command Shortcuts/,"Avoid duplicated shortcut panel on the landing screen");
assert.doesNotMatch(render,/tabIntro\(/,"Decks should open directly, without repeated intro badges");
for(const tab of ['"overview"','"expeditions"','"crew"','"fleet"','"vault"','"upgrades"','"cosmetics"']){
  assert.ok(render.includes("activeTab") && (tab==='"overview"' || new RegExp("tab\\s*===\\s*"+tab).test(render)),"Retain Pioneer deck "+tab);
}
for(const call of ["expeditionsHtml()","crewHtml()","fleetOverviewHtml()","vaultHtml()","fleetMissionsHtml()","fleetShipyardHtml()","fleetHistoryHtml()"]){
  assert.ok(render.includes(call),"Must retain functional Pioneer content "+call);
}
assert.match(html,/\.pioneer-primary-actions\s*\{/);
assert.match(html,/@media \(max-width: 560px\)[\s\S]*?\.pioneer-primary-actions\s*\{\s*grid-template-columns:\s*1fr/);
assert.match(html,/\.pioneer-command-details summary/);
console.log("Pioneer Command simplicity and deck-preservation checks passed.");
