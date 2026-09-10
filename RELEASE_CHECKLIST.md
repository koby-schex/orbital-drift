# Orbital Drift release checklist

## v0.25.2 travel and rendering cleanup

- [x] Pending signals retain their encounter identity across visits; completed signals remain resolved after travel and save/load.
- [x] Current-system and invalid Atlas targets cannot grant jump progress or generate extra systems.
- [x] Rescue blocks normal and black-hole travel; travel/load/new journeys clear unfinished Echo recordings.
- [x] Frequent fleet reads reuse state objects and retain custom/migrated values.
- [x] Title drawing performs zero save-storage reads; storage events refresh Continue.
- [x] Simulated 120 Hz scheduling produces 30 title/menu/Battery Saver draws per second and retains 120 active-flight draw opportunities.
- [x] Camera following matches across equal elapsed time at 60 and 120 Hz.
- [x] Same-millisecond upgrade panels have independent dismissal timers.
- [ ] Verify these changes in a deployed browser and on phones, including paused menus, high-refresh displays, and Battery Saver. No new device-performance claims are made by this pass.


## v0.25.1 stabilization

- [x] Title-screen unload, pagehide, and visibility events preserve existing primary and backup saves.
- [x] Continue restores a backup-only journey; failed Continue keeps saved files.
- [x] Malformed reconstruction inputs are rejected; import storage failures retain the current journey and save slots.
- [x] Save failures respect the autosave interval instead of retrying every frame.
- [x] Outbound, service, and returning rescue phases reload correctly; frigate orbit lock survives reload.
- [x] Escape closes menus; keyboard and wheel input stay out of flight while menus are open; focus loss/backgrounding releases controls and pauses.
- [x] Offline navigation handles HTTP errors, disconnection, cache refresh, and quota failure; updates preserve unrelated caches.
- [x] Existing tutorial, travel, collection, crew, fleet, cosmetics, rendering-budget, and save-migration regression suites pass.
- [x] Live v0.25.0 desktop title/onboarding/command menus inspected; Escape defect reproduced.
- [ ] Playtest the patched v0.25.1 build in a real browser after deployment. Local-preview navigation returned ERR_BLOCKED_BY_CLIENT.
- [ ] Complete a full iPhone/Android journey and long-session performance pass below; measure early progression/reward pacing before changing balance.


## v0.25.0 spacecraft review

- [x] Six distinct Starling skin geometries and seven distinct Pioneer skin geometries.
- [x] Five role-specific escort hulls, reviewed across all five fleet skins.
- [x] All raised decks and sidewalls fit their cached sprite bounds.
- [x] Skin color, upgrade stage, and display density correctly select or regenerate hull artwork.
- [x] Warm hulls reuse sprites; eviction releases old canvases within the 12 MiB hull-art budget.
- [x] Fleet cosmetic silhouettes fit without intersecting at 180, 220, 320, and 480 px preview widths.
- [x] Fleet command previews exclude unowned and deployed ships; shipyard thumbnails identify their actual hull type.
- [x] Native Canvas asset review: all skins, narrow fleet previews, and Pioneer formation composition.
- [x] Existing gameplay, tutorial reserves, fleet/rescue lifecycle, cosmetics, saves, and pause regressions pass.
- [ ] Complete the real-browser/device checks below with v0.25.0, including landscape resize, cosmetic card text, and title artwork. The cloud browser's local-preview restriction remains unresolved.

## v0.24.0 rendering checks

- [x] Deterministic planet pixels; rendering does not alter universe seeds or resources.
- [x] One new surface texture per frame, reuse of warm textures, and 12 MiB LRU eviction.
- [x] Incremental sky work and cancellation of stale jobs after graphics changes.
- [x] Off-screen planet culling retains visible stellar corona edges.
- [x] Main-canvas resolution respects the pixel budget on a 4K display.
- [x] Unchanged HUD markup is reused; hidden tabs do not simulate or draw.
- [x] Direct Canvas rendering reviewed for planet surfaces, Earth, rings, ships, and flight.
- [ ] Run the updated build on iOS Safari and Android Chrome for 15 minutes, including repeated jumps and background/resume, watching for heat, memory growth, or sustained frame drops.
- [ ] Check the full DOM interface, skin previews, and touch controls at 390×844, 360×740, and landscape layouts in actual browsers. Cloud browser local preview was blocked in this pass.
- [ ] Confirm first-view texture refinement and nebula fade feel smooth on the oldest supported phone; check High, Medium, Low, and Reduced Motion.

## Automated on every pull request

- [x] Game JavaScript parses without syntax errors.
- [x] Static controls have unique IDs, explicit button types, and required accessibility labels.
- [x] All six possible first subsystem upgrades can complete the Sol training economy.
- [x] Mars capture, first upgrade, Mars outpost upgrade, Venus survey, Pioneer build, and Pioneer rendezvous advance in order.
- [x] Pioneer orbit exposes the one-tap outward jump action.
- [x] Expedition offers never repeat a retired family, reject similar history, and preserve theme-matched objectives, threats, Vault finds, and resources.
- [x] Crew recruitment, renaming, uniform selection, duty assignment, field experience, training, and save/load persistence work from Pioneer orbit.
- [x] Living-system events persist by system, avoid recent event types, present clear decisions, and trigger matching visual phenomena.
- [x] Major threats support preparation, role-based responses, safe underprepared retreats, retry, resolution, and expedition completion.
- [x] Every new game begins with only the fixed Earth/Sol tutorial; random systems are generated after departure.
- [x] Flight controls are absent from the menu and legacy Flight links redirect to a relevant section.
- [x] New games receive different universe seeds and generated system sets.
- [x] Outward travel selects unvisited systems instead of advancing numerical indexes.
- [x] Early routes avoid repetitive system archetypes and sector modifiers.
- [x] Generated system names remain unique.
- [x] Fleet escorts form outside the Starling orbit lane, depart visibly, disappear while deployed, return visibly, and settle before rewards unlock.
- [x] Command Match resolves a valid adaptive fleet palette and Parallel systems expose a distinct visual profile.
- [x] Owned ship and frigate cosmetics can be equipped.
- [x] Current saves reload, damaged primary saves recover from backup, and v14 saves migrate without renaming charted systems.
- [x] Browser purchases are clearly marked as simulated, no-charge unlocks.
- [x] Responsive control-clearance, reduced-motion, and audio background/resume hooks remain present.
- [x] Web app manifest, icons, and service worker parse and reference valid assets.

Run the complete suite with:

```bash
npm test
```

## Manual device pass before a public release

- [ ] Complete the tutorial once on a narrow phone viewport and once on desktop.
- [ ] Build every fleet hull and confirm its formation slot, role silhouette, and equipped paint remain readable at gameplay zoom.
- [ ] Launch and complete an expedition while watching the Pioneer; verify the full fly-out, absence, fly-in, and formation sequence.
- [ ] Complete one full Expedition Arc, confirm every stage advances through normal play, and verify the final reward matches its subject.
- [ ] Customize, train, save, and reload at least two crew specialists; confirm duties and expedition lead assignment persist.
- [ ] Resolve a living-system event and a major threat on both phone and desktop viewports.
- [ ] Visit standard, Exotic, Mythic, Cosmic Spirit, and Parallel systems and confirm each visual identity is immediately distinguishable.
- [ ] Confirm the smart action never overlaps the Nav Map at the device's smallest supported height.
- [ ] Test touch thrust, brake, orbit lock/release, pause, and menu navigation on iOS Safari and Android Chrome.
- [ ] Listen for clean music/SFX transitions through backgrounding, resuming, muting, and low-power mode.
- [ ] Install from the browser, launch from the home screen, then confirm the game shell opens once while offline.
- [ ] Export a save on one browser profile and import it into another.
- [ ] Verify native-store prices and purchase restoration only in the packaged mobile build; browser builds must remain explicitly no-charge.
