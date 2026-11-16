# Pass 11 — StoreKit 2 native purchase bridge

## Implemented
- Real **StoreKit 2** purchase calls for the seven existing Orbital Drift non-consumable product IDs.
- Apple's verified transactions only, matching product IDs, nonconsumable product type, and rejecting revoked or unverified transactions.
- Apple cancellation/pending approval returns unsuccessful states; pending, cancelled and missing products never unlock paid cosmetics.
- `AppStore.sync()` and Apple's **current entitlements** for Restore Purchases. Restores are revalidated by StoreKit, not a simulated local receipt.
- Local Capacitor 8 iOS bridge registration during native Xcode project generation, supported in both macOS Simulator and protected distribution workflows.
- Native purchase confirmation never states a hardcoded USD price; the Apple purchase sheet displays the actual App Store price.
- Browser-only complimentary Web Edition designs continue to work as before.
- Ads remain safely disabled: no native ad SDK is introduced or simulated.

## Required Apple setup before real purchases work
Create all seven **non-consumable** products in App Store Connect with these exact IDs:
`orbitaldrift.removeads.permanent`, `orbitaldrift.ship.solarflare`,
`orbitaldrift.frigate.abyss`, `orbitaldrift.fleet.solarconvoy`,
`orbitaldrift.trail.solarribbon`, `orbitaldrift.trail.relicember`,
`orbitaldrift.combo.ancienthunter`.

Set pricing, localization, review screenshots and tax/banking agreements.
Run purchases in the Apple Sandbox on a signed development/TestFlight build.
Verify cancellation, Ask To Buy pending approvals, purchases, reinstallation,
restoration, refunds/revocations and purchases while offline.

## Important limitations
- App Store Connect product configuration cannot be done through this repository.
- Successful native compilation does **not** verify live purchase transactions or App Store approval.
- Existing app-save and local purchase history may not reflect refunds until
  users explicitly restore purchases. Before public release, consider a
  transaction-update listener with entitlement reconciliation and full offline
  grace behavior; avoid clearing permanent purchase entitlements solely because
  a device is temporarily offline.
- Actual AdMob banner/rewarded ads, privacy/ATT consent and support/reporting
  workflows are separate release blockers.
