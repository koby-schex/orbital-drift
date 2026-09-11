# Cinematic universe artwork — v0.26.0

Original imagery generated with OpenAI image generation for this game. WebP conversion, compression and Earth-map downsampling are the only offline raster transformations. Runtime code adds spherical projection, seeded color grading, framing, lighting and parallax. These are artistic environments and an illustrative Earth map, not scientific survey data.

| Asset | Use |
| --- | --- |
| deep-field.webp | Ordinary space, title and survey backdrops |
| parallel-rift.webp | Parallel realm |
| spirit-nebula.webp | Cosmic Spirit realm |
| earth-albedo.webp | Earth surface projected onto a sphere |

All four assets are precached for offline play. Gameplay does not wait for them: procedural rendering remains available during a pending or failed load. Keep the background's central flight region dark and do not add text, foreground planets, or ships to these environment files.

## Generation prompts

### Deep field

Use case: stylized-concept. Asset type: production background texture for a high-quality space exploration video game named Orbital Drift. Create one ultra-detailed cinematic deep-space nebula panorama, landscape 3:2 aspect, ideally 1536x1024 or larger. This will be used as an actual parallax backdrop behind moving planets and ships, not a game screenshot. Near-photoreal NASA deep-field meets premium science-fiction matte painting. Enormous wispy billowing molecular cloud formations, sculptural black dust pillars and translucent turquoise ionized gas, a luminous warm amber stellar nursery toward the upper left, dim violet wisps toward the right, a faint diagonal galactic dust lane. Sense of immense depth and scale. Inky blue-black negative space covers at least half of the image, especially the central and lower-center flight area so small gameplay ships remain readable. Intricate organic volumetric filaments with delicate scattered pinprick stars, no huge lens flare. Physically rich light scattering, soft fine-grain photographic texture, high dynamic range but restrained bright regions. Very dark outer edges blend naturally into deep space. Absolutely NO foreground planets, spacecraft, horizon, asteroids, text, logos, borders, diagrams, interface, rings or geometric lines. This is a finished game environment texture; polished and breathtaking, not cartoon, not flat colored smoke.

### Parallel rift

Production game background, cinematic photoreal deep space, landscape 1536x1024. A breathtaking rare other-dimensional realm: gigantic gravitational rift in the upper right, like the dark silhouette of an immense eye formed by swirling violet molecular clouds and silver accretion light, organic warped nebula dust bending around a black void. Flowing blue-violet luminous filaments extend from upper right toward far left, bronze starlight flecks within. Sophisticated Interstellar-quality astrophotography matte painting, ultra fine natural wispy dust and layered gas, incredible scale and deep blacks. The lower half and center-left MUST remain very dark near-black open space suitable for game ships and small planets to be drawn in front. Restrained light, no bright white band across center. Dark outer edges. This is a finished background environment texture, NOT a game screenshot. No foreground planets, ships, interface, text, grids, straight lines, icons, geometric polygons or decorative concentric rings. Not cartoon. This should feel mysterious, elegant, and overwhelmingly vast.

### Spirit nebula

Asset: ultra-detailed cinematic deep-space background texture for a professional space exploration game. Landscape 1536x1024. Rare Cosmic Spirit realm. Ethereal colossal pale jade and warm champagne-gold nebula pillars resembling a vast living aurora, flowing gracefully from upper left across the very top and down right edge, tiny diamond stars embedded in thin translucent clouds. Cathedral-like scale with deep near-black voids, photographic molecular dust, cream-gold filaments, hints of teal. Center and bottom two-thirds are predominantly inky black negative space for gameplay. Emotional, serene, impossibly beautiful, highly realistic astronomical matte painting with subtly supernatural organic forms. Spectacular detail in cloud edges without excessive brightness. No planet, spaceship, person, human face, creature outline, text, border, UI, grid, geometrical drawings or hard rings. Use refined subtle luminance with one small luminous star in upper-left clouds. Dark outer edges; keep gameplay center dark.

### Earth albedo

Production game texture map, NOT an illustration or a globe. Create a seamless equirectangular surface albedo map of planet Earth, full rectangular canvas completely covered with Earth's ocean and continents, width ideally twice height. Geographic continents recognizable: Americas toward left, Africa and Europe near center, Asia to right, Antarctica continuous along bottom. Photoreal satellite surface detail: deep navy blue oceans, brilliant shallow teal coastlines, forested green lowlands, tan Sahara and Arabia, rocky mountain chains, snow over Himalayas and polar ice. Delicate scattered spiral white cloud systems and thin wispy atmospheric clouds cover about 20% of map, enough land is visible. Even diffuse lighting across the ENTIRE texture; absolutely NO baked sun direction, NO shadowed hemisphere, NO globe outline, NO perspective, NO borders or labels, NO space or stars. High-frequency photographic terrain and fine fractal coastal detail. This texture will be wrapped mathematically around a 3D sphere in a real video game, so every edge must be filled with map texture. Crisp natural detail, sophisticated true-color satellite photography.
