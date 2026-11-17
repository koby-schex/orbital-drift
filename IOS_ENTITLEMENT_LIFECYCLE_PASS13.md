# Pass 13 — StoreKit entitlement lifecycle and release safety

## What changed
- The native StoreKit 2 plugin now observes Apple's transaction update stream for pending Ask to Buy approvals and other purchase changes. It notifies the game when verified known products change.
- It exposes a non-interactive current-entitlements method. Unlike explicit Restore Purchases, this does **not** open an Apple ID account synchronization prompt.
- The game refreshes verified Apple entitlements on launch, on save load, and when the plugin reports a transaction change. An authoritative snapshot updates paid cosmetics and permanent ad-removal ownership; revoked/refunded products are no longer counted as owned.
- A failed StoreKit entitlement query does **not** remove local entitlements: offline sessions retain what was last verified.
- The native Ads & Purchases screen keeps an accessible Restore Apple Purchases action even when ads are inactive or temporarily unavailable.
- CI adds regression tests for transaction updates, refund/removal, safe offline failure, paid cosmetics, and restore UI.

## Actual release blockers
App Store Connect must have all seven matching nonconsumable products and prices.
Run a signed TestFlight session with StoreKit Sandbox purchases, Ask to Buy
pending approval, refunds, restore after reinstall, offline relaunch, and
multi-device ownership. Native build compilation cannot validate Apple's live
transaction feed. Paid products and revenue must not be advertised as complete
until these sandbox tests and App Store privacy requirements pass.

Ads remain consent-gated, opt-in and out of flight. Passive banner inventory
has not been introduced; native phone safe-area tests should precede placement.
