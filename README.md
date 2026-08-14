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

The static smoke suite checks JavaScript parsing, unique element IDs, explicit button behavior, required game systems, save-schema markers, and removal of legacy runtime monkey patches. The game also contains a browser-level `runTests()` suite used during release QA.

## Current systems

- Gravity flight, orbit locking, braking, thrust, fuel, recovery, and slingshot release
- Planet discovery, rarity tiers, capture capacity, upgrades, production, and codex records
- ODF Pioneer construction, upgrades, refueling, sector travel, cosmetics, and fleet missions
- Procedural sectors, Cosmic Spirit systems, black-hole breaches, Parallel systems, and rare events
- Celestial visual remaster with sector-specific palettes, nebulae, constellations, distant galaxies, cinematic velocity trails, and concealed unscanned worlds
- Cinematic discovery reveals that visually distinguish planetary color, class, atmosphere, anomaly, and rarity
- Ten choice-driven Exploration Encounters with ship, fleet, resource, and reputation requirements
- Frontier Coalition, Wayfarer Guild, and Echo Collective reputation with permanent faction technologies
- Three-part Silent Choir storyline, consequential outcomes, and a Captain's Log decision archive
- Guided onboarding, objective tracking, save/load, settings, touch-control calibration, audio, and performance scaling
- Seven-step Sol training flight with one active objective at a time, including Pioneer rendezvous and one-tap outward travel
- Persistent command navigation plus a standalone Cosmetic Hangar with exact in-game hull previews and direct equip controls
