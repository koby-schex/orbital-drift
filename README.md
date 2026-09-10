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

## v0.25.1 stabilization

- The title-screen demonstration cannot save over an existing journey. Continue also recovers a backup when the primary slot is missing, and failed loads no longer start a replacement journey.
- Save imports validate reconstruction inputs, apply the candidate before writing it, and restore the current journey if loading or storage fails. Failed autosaves retry on the normal interval instead of every frame.
- Pioneer rescue phases and Starling frigate-orbit locks persist across reloads. Starting a fresh journey clears any old rescue.
- Escape dismisses the active panel or command menu. Typing and scrolling in menus cannot steer or zoom the ship, held inputs clear on pause, and backgrounding leaves flight paused.
- Offline navigation retains the working cached game when the server fails. Cache cleanup removes only Orbital Drift caches.
- Save schema remains 20; the rescue field is optional for older saves. The test command now includes the offline-recovery suite.

The live v0.25.0 title, onboarding, and command menus were inspected in the cloud browser; Escape failing to close the menu was reproduced. The patched local preview was blocked by the browser, so v0.25.1 changes are verified by the regression suites, not certified as a completed device playtest. Phone performance, full touch playthroughs, and progression pacing remain on the release checklist.

## v0.25.0 spacecraft art and hangar pass

The Starling, Pioneer, and all five escort roles now use shared, opaque hull models with extruded edges, raised decks, recessed drives, faceted command glass, material shading, and restrained running lights. The same artwork appears in flight, the title scene, shipyard thumbnails, and cosmetic previews.

- Every Starling and Pioneer skin changes physical architecture. Fleet skins apply solar radiators, pearl fins, or asymmetric drive structures across the five role-specific hulls.
- Individual subsystem indicators and bounded Pioneer upgrade modules remain visible. Existing unlocks, purchases, equipment, progression, flight handling, and save schema 20 remain compatible.
- Finished hull artwork is cached by geometry, palette, upgrade stage, and display density, with an independent 12 MiB LRU budget. Engines are drawn separately so thrust can change without rebuilding hulls.
- Fleet Operations shows the owned ships present with the Pioneer. Cosmetic previews show all five example roles in a non-overlapping layout; the shipyard displays the actual hull instead of a generic symbol.
- Previews use their actual canvas size, refresh on resize, and keep status badges above the art. Narrow cosmetic titles wrap without colliding with Premium badges.
- Idle escort motion follows simulation time, so opening a menu stops the idle formation animation.

Automated checks cover geometry uniqueness, raised-deck bounds, sprite reuse and eviction, display-density/palette changes, all fleet skins at 180/220/320/480 px preview widths, and ownership/deployment filtering. Direct native Canvas review covered all six Starling skins, seven Pioneer skins, and 25 fleet role/skin combinations. The existing browser/device release checklist remains required; these asset checks do not certify touch or full DOM layout.

## v0.24.0 visual and performance pass

- Seeded fractal nebula textures, dust lanes, distant galaxies, and slower stellar twinkle. Shooting stars now also appear in ordinary systems.
- Detailed spherical planet surfaces: terrain, clouds, polar ice, gas bands, craters, crystalline ice, and lava. Planet lighting faces the local star; atmospheric rims and occluded rings replace flat disc effects.
- Cleaner Starling, Pioneer, and fleet materials, with inset hull panels, restrained lights, faceted fleet canopies, and fewer overlapping decorative rings. Fleet previews scale to their available space.
- Background generation is spread across frames (eight raster rows per frame), with cancellation when a new system or quality setting supersedes it. Surface generation is limited to one new texture per frame and cached with a 12 MiB LRU budget.
- Off-screen planet culling, a six-million-pixel main-canvas budget, HUD updates at most every 80 ms, navigation-map updates every 66 ms, and reuse of unchanged mission markup.
- Hidden tabs skip rendering and simulation; returning resets frame timing and held flight inputs. Automatic quality changes now resize the actual canvas.
- Save schema 20 and existing saves remain compatible. No external image downloads or new runtime dependencies are required.

`npm test` includes deterministic texture pixels, cache reuse/eviction, staged sky generation/cancellation, viewport culling, HUD markup reuse, 4K resolution budgets, and hidden-tab suspension, in addition to gameplay regressions.

Visual QA used the actual drawing functions with a native Canvas renderer. The cloud browser blocked the local preview, so this update still requires Safari/Chrome device playtesting before App Store release; native Canvas timings are not browser or phone frame-rate certification.

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
- Living systems with seeded ambient signatures, random visual phenomena, sector-specific palettes, nebulae, distant galaxies, and concealed unscanned worlds
- Dramatically distinct Exotic, Mythic, Cosmic Spirit, and Parallel backdrops with prismatic tides, mythic blooms, spirit light, and reality fractures
- Cinematic discovery reveals that visually distinguish planetary color, class, atmosphere, anomaly, and rarity
- Ten choice-driven Exploration Encounters with ship, fleet, resource, and reputation requirements
- Frontier Coalition, Wayfarer Guild, and Echo Collective reputation with permanent faction technologies
- Optional three-contact Silent Choir chronicle, consequential outcomes, and a Captain's Log decision archive
- Guided onboarding, objective tracking, automatic save recovery, portable save export/import, settings, touch-control calibration, audio, and performance scaling
- Seven-step fixed Earth/Sol tutorial with one active objective at a time; uncharted systems are generated only after the first outward journey
- Cleaner Pioneer Command navigation without duplicate flight controls, plus a standalone Cosmetic Hangar with exact in-game hull previews and direct equip controls
- Installable browser build with a manifest, home-screen icons, and offline shell support
