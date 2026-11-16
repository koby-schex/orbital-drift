# Premium gameplay pass 4 — iPhone flight & rescue QA

Pioneer distress recovery now completes in 116 simulation ticks rather than 359 (48 outbound, 18 refuel, 50 return). Inputs and flight dynamics are suspended during the rescue so the Starling cannot consume fuel or fight the animation. Orbit lock provides its intended destination to screen readers; the collapsed HUD shows a short system heading, with full details available on expansion. A rescue indicator appears in the fuel readout.

The save format, flight tuning, upgrades, capture, expedition rewards and system generation remain unchanged. Previously saved in-progress rescue phases remain readable.

## iPhone 14 checks
1. Approach a planet and Pioneer in turn: LOCK should select the reachable target, RELEASE should slingshot normally.
2. Confirm steering, thrust and braking feel unchanged during ordinary flight.
3. Run out of fuel with Pioneer built. Recovery should start once, finish rapidly, restore fuel, dock, and leave the player able to fly.
4. Close and reopen the game during recovery; confirm the saved rescue resumes.
5. With HUD minimized, check text and control overlap in portrait mode. Expand to inspect all telemetry.
6. Recheck new systems, loaded saves, reduced-motion and low-quality graphics.

Automated source checks do not replace real-device tests.
