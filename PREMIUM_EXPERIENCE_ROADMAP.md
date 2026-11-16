# Orbital Drift — Premium Mobile Experience Roadmap

## Approved design direction (November 2026)

- **Identity:** minimalist and cinematic, calm and premium rather than data-dense.
- **Gameplay:** retain satisfying gravity/flight physics; improve reliability rather than redesigning controls.
- **HUD:** essentials only, with subtle contextual indicators.
- **Navigation:** retain the familiar categories while drastically simplifying default views.
- **Disclosure:** a useful action or decision first; supporting numbers and mechanics only on request or where the action requires them.
- **Pioneer:** newcomers must immediately understand what to do; crew, fleet, expeditions, upgrades and cosmetics remain fully functional.
- **Rescue:** quick and natural, not lengthy or distracting.
- **Exploration:** relaxed, rewarding progression. Newly visited star systems should be visually unmistakable from recent systems, not just receive a different random tint.
- **Quality bar:** every menu, cosmetic, progression system, crew/fleet action and reward should feel integrated and reliable on an actual iPhone.

## Sequenced PR plan

1. **Pioneer Command clarity (current):** Replace the first-load telemetry dashboard with a cinematic identity preview, four clear next actions and optional base details. Keep seven established decks accessible; no gameplay or save changes.
2. **Unified menu language:** Consistent cards, navigation, tab/section hierarchy, action placement and readable typographic scale across worlds, cargo, upgrades, crew, fleet, vault, cosmetics and records. Collapse nonessential numeric explanations and use clear empty/locked states. Inspect 390×844 and narrow landscape.
3. **System-to-system visual variety:** Audit procedural seed selection, composition, palettes, planet distribution, sky lighting and unusual features. Introduce recent-system distinctiveness constraints, preserve deterministic saves/world identity and prevent repetitive systems within a journey. Add tests comparing successive routes, not just individual world seeds.
4. **Moment-to-moment flight polish:** Keep handling; recheck lock targets, rescue duration and animation, HUD density, actionable status feedback, safe area / touch interaction, and game-over/recovery pathways. Reduce cosmetic clutter during active flight, verify touch affordances.
5. **Premium systems and release QA:** Complete cross-feature paths for crew, fleet, rewards, cosmetics, expeditions, backups and offline use; tighten soft locks, reward pacing and visual feedback. Run iPhone web-app playtesting and native simulator builds; then prepare TestFlight/signing and monetization only after the gameplay pass.

Each PR must run existing gameplay regressions, bundle validation and iOS configuration checks. Relevant merges also trigger native iOS compilation. Automated tests are **not** a substitute for physical-device visual QA.

### Review criteria

- A new player can identify the next meaningful action within a few seconds.
- No required game function disappears behind the simplification.
- Default menus prioritize names, actions and consequences rather than raw statistics.
- Progress and rewards remain visible when relevant, without overwhelming flight controls.
- Each unfamiliar system feels like a new destination, and the game stays performant on the iPhone 14.
