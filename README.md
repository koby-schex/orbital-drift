# Orbital Drift

Orbital Drift is a portrait mobile gravity-exploration game. Pilot the Starling, use orbit locks and slingshot releases, capture and develop frontier worlds, construct the ODF Pioneer, dispatch fleet ships, record Echo routes, and discover rare anomaly systems.

## Run locally

The game has no build step. Serve the repository with any static web server and open `index.html` in a portrait browser viewport.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Validate

```bash
npm test
```

The test command runs static validation plus a functional release-readiness harness against the real game script. It covers all six first-upgrade tutorial paths, the fixed Sol start, Pioneer construction and rendezvous, repeat-safe Expedition Arcs, customizable crew progression, living-system events, major threats, non-linear multi-jump routes, fleet departure/return choreography, save migration and backup recovery, cosmetic equipping, responsive UI invariants, audio lifecycle hooks, and offline-app assets. The game also contains a browser-level `runTests()` suite used during release QA.

## Current systems

- Gravity flight, orbit locking, braking, thrust, fuel, recovery, and slingshot release
- Planet discovery, rarity tiers, capture capacity, upgrades, production, and codex records
- ODF Pioneer command hub, upgrades, refueling, sector travel, cosmetics, and living fleet operations
- Twelve self-contained Expedition Arc families with permanent history, similarity filtering, distinct objectives, final threats, and subject-matched rewards
- Six customizable Pioneer specialists with names, uniforms, duty assignments, experience, upgrades, role bonuses, and expedition leadership
- Living-system events with persistent choices and visual phenomena, plus preparation-driven major threats with safe retreat and retry
- Visible fleet formations outside the Starling orbit lane, with launch, deployment, return, and reward-ready states
- Adaptive Command Match fleet paint that inherits the equipped Starling and Pioneer palette, plus live escort previews
- Per-save randomized uncharted routes with anti-repetition scoring, unique generated system names, Cosmic Spirit systems, black-hole breaches, Parallel systems, and rare events
- Living systems with seeded ambient signatures, random visual phenomena, sector-specific palettes, nebulae, constellations, distant galaxies, and concealed unscanned worlds
- Dramatically distinct Exotic, Mythic, Cosmic Spirit, and Parallel backdrops with prismatic tides, mythic blooms, spirit light, and reality fractures
- Cinematic discovery reveals that visually distinguish planetary color, class, atmosphere, anomaly, and rarity
- Ten choice-driven Exploration Encounters with ship, fleet, resource, and reputation requirements
- Frontier Coalition, Wayfarer Guild, and Echo Collective reputation with permanent faction technologies
- Optional three-contact Silent Choir chronicle, consequential outcomes, and a Captain's Log decision archive
- Guided onboarding, objective tracking, automatic save recovery, portable save export/import, settings, touch-control calibration, audio, and performance scaling
- Seven-step fixed Earth/Sol tutorial with one active objective at a time; uncharted systems are generated only after the first outward journey
- Cleaner Pioneer Command navigation without duplicate flight controls, plus a standalone Cosmetic Hangar with exact in-game hull previews and direct equip controls
- Installable browser build with a manifest, home-screen icons, and offline shell support
