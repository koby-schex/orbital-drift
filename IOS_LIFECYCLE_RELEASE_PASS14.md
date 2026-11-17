# Orbital Drift — Release Pass 14: iPhone lifecycle and save safety

## Implemented in code
- Native Capacitor iOS lifecycle bridge forwards `willResignActive`, `didEnterBackground` and `didBecomeActive` to the existing game. Web pagehide and visibilitychange remain fallback signals.
- Backgrounding stops held flight controls, pauses playable journeys, suspends audio, resets the frame-time accumulator, and synchronously saves progress **without an intrusive toast**.
- Multiple native and browser events arriving during one transition coalesce into a single save (1200ms guard), avoiding unnecessary serialization and overwriting the useful backup several times.
- Returning to the app does **not** automatically resume thrust or gameplay. Audio follows the player’s existing enabled sound/music settings.
- Explicitly deleted saves and inactive title-screen sessions are never silently rewritten by a background event.
- Failed save imports now attempt to roll back **both** the primary save and its backup if either was changed, rather than leaving an imported primary in storage after reporting failure.

## iPhone / TestFlight QA matrix (manual, required)
1. Launch a fresh install, begin tutorial, advance, background and terminate; confirm Continue Game restores at the last safe point.
2. Hold thrust while app-switching; return and verify ship is paused and does not accelerate until explicitly resumed.
3. Repeat with orbit lock, low fuel, active rescue and fleet mission timers; verify no artificial time jump or lost objectives.
4. Repeat background/resume cycles rapidly, including Control Center, incoming call and screen lock; confirm no unusual battery drain or repeated autosave messages.
5. Delete a save, background the app, force quit, reopen; ensure the deleted slot does not reappear.
6. Import valid and damaged save files, use insufficient storage where possible; confirm previous journey/backup survives unsuccessful import.
7. Complete progress in offline mode, force quit, relaunch and reconnect; ensure progression and cosmetic entitlements do not disappear.
8. Check background audio remains stopped until the player explicitly resumes activity.
9. Perform a signed TestFlight update in-place and verify saved journey, skins, fleet and mission continuity.
10. Validate native privacy forms and opt-in ad completion on a physical iPhone; no ads should obstruct flight controls.

## Release blockers
Real signed TestFlight/device testing, configured Apple IAP products, AdMob production IDs and privacy configuration, App Store Connect listing and the final Apple signing setup are not verified by this PR. The unsigned Simulator smoke test verifies compilation, launch/relaunch and screenshots, not actual iPhone suspensions.
