# Procedural Frontier Identity — Variation Pass

## Visual goal

Every ordinary frontier jump should *look and feel like a new destination*, especially during the opening exploration sequence. A change of world name or palette seed alone is not enough.

## New behavior

- Each of six existing procedural archetypes is associated with a distinct *sky identity*: Forge/Ember, Gas/Azure, Crystal/Violet, Bio/Verdant, Archive/Golden, and Void/Glacial.
- Within the already-bounded, cached cinematic background raster, frontier family changes select a different hue treatment, framing, and subdued light composition. This is performed when the scene asset is generated, **not on every animation frame**. No new texture downloads, memory budget increases or artwork assets.
- Outward jumps compare each potential candidate with the current system and up to four recent visits. Visual identity, dominant planet pattern, planetary density and modifier contribute, with the archetype and sky strongly weighted. The random component is now only a tie-breaker.
- Other procedural planet facts, gravity, special-system rarity, reward balance, planet colors, known system names and save schemas are unchanged.
- Exotic, Mythic, Parallel, and Cosmic Spirit environments retain their unique higher-priority backgrounds and special unlock rules.

## Physical iPhone review

1. Complete the Sol tutorial; visit at least six consecutive ordinary systems via **Jump Outward**.
2. Note whether the sky/horizon framing, warmth or coolness, dust/light, predominant planet silhouettes, and world distribution clearly change on each hop.
3. Check return visits from the Atlas: the same previously discovered system should retain its visual identity.
4. Confirm Cosmic Spirit and Parallel systems retain their dedicated atmospheres.
5. Check reduced motion, low graphics, landscape and background/resume. Watch for pauses on first arrival and memory growth during many jumps.
6. Test that full feature functionality (capture, survey, fleets, jumps, saves, import/export, cosmetics) is unchanged.

Automated tests measure visual-signature separation and route selection behavior; **they cannot prove subjective art quality or actual iPhone frame pacing**. More uniquely composed backgrounds and rare celestial set pieces remain a possible follow-up after hands-on device review.
