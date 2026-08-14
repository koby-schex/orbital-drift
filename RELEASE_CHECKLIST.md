# Orbital Drift release checklist

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
