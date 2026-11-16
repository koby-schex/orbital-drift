# Orbital Drift — Release Candidate Gameplay Audit

This pass stabilizes long-session progression without changing save version, encounter probabilities, cosmetic prices, or progression balance.

## Changes
- Crew hydration removes duplicate member IDs, sanitizes XP/level/expedition totals and invalid uniforms/duties, and always restores starter crew.
- Legacy or incomplete expedition saves now get a safe visited-systems list and stage index, preventing travel objectives from throwing an error.
- Partial expedition stage progress is saved immediately, rather than waiting for unrelated autosaves or app suspension.
- Replayed expedition families are not duplicated indefinitely in the retired-family list.
- Failed save imports preserve the prior deleted-save/autosave state. Successful imports refresh the Continue metadata.
- Fleet return notifications have a stable fallback name if an old mission has lost its ship association.

## Test on iPhone
1. Complete one out of several objectives in an active expedition, close and reopen the app immediately, and verify progress is still credited.
2. Jump between systems in a multi-system expedition, including return visits: the same system should not double-count.
3. Level up a specialist, change uniform and duty, complete a crew-led expedition, and verify all records after relaunch.
4. Launch and claim several fleet missions, including one that completes while the app is closed; verify each reward is paid only once.
5. Equip ship, Pioneer, fleet and trail cosmetics; fully restart app and confirm equipped skins and owned entitlements.
6. Export a save, import it, verify the restored progress; also reject an intentionally incompatible file without losing existing progress.
7. Complete or archive repeated expedition arcs and confirm the board continues offering adventures.
8. Conduct an uninterrupted 20-minute flight with two+ system jumps, one Pioneer rescue and a planet upgrade.

GitHub CI checks source-level and regression behavior, not physical iPhone performance or App Store approval.
