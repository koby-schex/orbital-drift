# Orbital Drift — iOS release candidate gates (Pass 7)

## Automated safeguards in this pass
- Missing native StoreKit bridge now rejects requests rather than fabricating verified transactions. The complimentary **browser edition** keeps its clearly labeled web-only cosmetic claim.
- Missing ad bridge reports that no ad completed. An absent ad cannot grant sponsored resources or progression.
- The native Capacitor app uses its packaged local files, without registering a second web service worker that could keep obsolete assets after an app update. Browser PWA offline caching remains enabled.
- Web manifest defaults to portrait. The macOS iOS build now sets **iPhone** supported orientation to portrait in the generated Info.plist before unsigned simulator compilation.
- CI tests validate all safeguards and preserve existing game, economy, purchase and offline tests.

## Remaining human / Apple setup (not done by this PR)
1. **Choose and register the final Bundle ID** (current `com.orbitaldrift.game` is provisional). Configure Apple Developer signing/certificates and App Store Connect.
2. Wire and verify production-capable **StoreKit 2** nonconsumable purchases and purchase restoration. Product IDs, signed transactions, prices and entitlement validation must be configured in App Store Connect. Never distribute the web-only free simulated purchase logic as if it were native StoreKit.
3. For optional unobtrusive ads, integrate a real iOS advertising SDK with test IDs, privacy/consent handling and required disclosures. Until then **the iOS build must show no ads and must not award fake rewarded-ad bonuses**.
4. Prepare public privacy policy/support URLs, App Store screenshots, descriptions, age rating and privacy labels matching the actual app and SDKs.
5. Use a signed iPhone build/TestFlight to verify launch, offline play, new/loaded saves, multitasking/background resume, safe areas, rotation, touch, audio and memory/performance.
6. Run a full game journey across the tutorial, several varied systems, crew, fleet, expedition, saved recovery, cosmetics and repeat sessions before marking production-ready.

## CI status expectations
The PR runs gameplay tests + web package checks. A merge to main also triggers a macOS unsigned **Simulator compilation** workflow. A passing simulator compile is not iPhone playtesting, a signed IPA or an approved App Store submission.
