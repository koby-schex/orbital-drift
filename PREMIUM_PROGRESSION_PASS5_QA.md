# Pass 5 — progression and save lifecycle QA

## Changes
- Deleting a saved game suppresses automatic, background and unload saves for that session. Manual Save explicitly creates a new slot; New Game starts a new slot. This prevents deleted progress from reappearing during play.
- New Game now writes an initial save immediately after the player confirms replacement. Old saves remain protected by the existing confirmation screen.
- Saved fleet ships with no active mission are returned to idle, including old stranded reward-ready ships. Live missions and earned rewards are preserved.
- Expedition offers fall back to the full theme catalog when all families were recently played, and history is capped at 80 records.
- Save version and game economy remain unchanged.

## iPhone verification
1. Start a new journey over an existing save, close immediately, reopen: Continue should load the new journey.
2. Delete a saved game; keep playing, wait past autosave, background, reopen. Continue should remain unavailable until an explicit Manual Save.
3. After deletion, Manual Save and reopen: Continue should work.
4. Run fleet missions through departure, return and reward claiming with force-closes at each phase.
5. Complete/archive multiple expeditions and ensure new offers continue to generate.
6. Confirm saved crew progression, equipped cosmetics, ship upgrades, resources and planets survive relaunch.

Automated source tests do not substitute for full iPhone playtests.
