# Release candidate: physical iPhone QA

Current source includes the native Capacitor wrapper, simulator launch/relaunch, StoreKit, AdMob integration and protected signed TestFlight workflow. Older roadmap documents are historical; do not interpret prior implementation gaps as current status. No signed distribution or real-device result is inferred from CI.

## Pass 21
- Flight-only frame interval sampling, excluding interruptions over 250 ms. Constant-memory session totals (available in existing developer debug copy); not a thermal or battery measurement.
- Battery Saver decreases HUD and radar refresh frequency; Low/Medium reduce title artwork density on Retina.
- Native inactive state blocks simulation, audio scheduling and rendering even if document visibility lags.
- Sustained slow frames, rather than stale smoothed FPS, trigger the existing one-step automatic quality reduction; reduced-motion CSS follows the setting. Pauses reset the accumulation.

## Required device checks (record build, device, OS, graphics mode, observed issue and reproduction)
1. Fresh launch, tutorial to Pioneer and first outbound jump. Check touch, safe areas, portraits, menus, text and audio.
2. Play 30 minutes with multiple jumps, fleet and crew missions, rescue, planet capture and customization. Note heat, battery change, stutter and crashes; repeat in Battery Saver under comparable conditions.
3. Background for 30 seconds during flight/rescue, return, verify paused controls and saved state. Repeat with lock screen, phone interruption and force-close/relaunch. Verify mission rewards are not duplicated.
4. Export and reimport a save; reject invalid imports without loss. Test offline launch, flight and existing entitlement behavior.
5. Check Auto, High/Medium/Low and reduced motion. Confirm no controls are obscured and the game feels responsive on iPhone 14.
6. On a signed TestFlight build, verify StoreKit sandbox purchases/restoration, test ads, consent and no-fill/offline behavior; do not use live ads for QA.

## Release gates
- [ ] Gameplay and simulator CI green for the candidate commit.
- [ ] Physical iPhone QA completed and blocking defects resolved.
- [ ] Final bundle ID, App Store Connect listing, protected signing configuration and signed TestFlight build verified.
- [ ] Native purchase and ad behavior and privacy disclosures verified for actual shipped SDKs.
- [ ] Store metadata, screenshots, age rating, support/privacy URLs and submission review complete.

No automatic public release. Current pass does not change gameplay progression or save schema.
