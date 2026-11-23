# Coding menu for Gemini Neon

Pieces Neon can build on its own that plug straight into Halsey, Nebraska. Each item says what it's for, what to hand back, and how we'll know it works. Pick any; they're independent.

## The rules every piece follows

- **Plain JavaScript (ES2020), one file per item, no build step, no libraries, no network.** Everything runs offline inside a sandboxed page. No CDNs, no fetches to outside hosts.
- **Canvas pieces return an object** in the engine's shape: `make<Thing>(W, H, opts) → { step(dtMs, tMs), draw(ctx, tMs) }`. They take a `seed` and use their own seeded random (`mulberry32` or similar), never `Math.random`, so a run looks the same when replayed.
- **Sound pieces** take `(audioContext, destinationNode, startTime, opts)` and schedule Web Audio nodes. No audio files.
- **Reduced motion:** if `matchMedia('(prefers-reduced-motion: reduce)').matches`, animations draw a still frame.
- **Palette:** use these tokens (ours merged with Neon's):
  `sandhills_ochre #C8A464 · prairie_sage #6E7F5E · ogallala_sky #8BAAC2 · twilight_indigo #243044 · porch_yellow #E2B842 · limestone #D9CFC1 · silo_rust #9C4A33 · abundance_gold #F4D35E · ink #1F1B2E · paper #F1EBDC · river_blue #3F78AD · barn_red #A8352C · dusk_pink #D4577F · aurora_green #7FE3B5`
- **Type:** rules and numbers in Atkinson Hyperlegible; names and quotes in the designer's own font, Halsey Hand. Never put rules text directly on a photo.
- **Tone:** eerie and hopeful, kept and quiet. No solarpunk gadgets, no grime, nothing folksy. The world is a preserve held in a frozen, careful state, not a utopia under construction.
- **License:** hand everything back as CC0 or MIT.

## A. Visual code

| # | Piece | What it's for | Hand back | Done when |
|---|---|---|---|---|
| A1 | **Topographic contour generator** | Sandhills contour lines over map and card frames, seeded so every run's map differs | `makeTopo(W, H, {seed, density, palette})` that draws contour bands (marching squares over value noise) | 3 seeds give 3 distinct but same-family patterns; draws in under 20 ms at 960×640 |
| A2 | **Center-pivot mandala** | The draw-pile icon, and an alternate card back for a second deck | `drawPivot(ctx, size, {seed, rings, arms, palette})`: concentric crop rings, section-line cross, the pivot arm | Looks like Neon's C1 SVG, varies by seed, crisp at 32 px and at 600 px |
| A3 | **Story-swap thread** | The trade: a braided gold thread arcs from the card you give to the teller's portrait, then back with theirs | `weave(fromRect, toRect, {color, strands: 3, ms: 850})` that draws on a full-page overlay canvas and resolves a Promise when done | Works between any two DOM rects; 3 strands braid; skipped under reduced motion |
| A4 | **Prairie wind and pollen** | A quiet layer behind the hand | `makePollen(W, H, {seed, count: 25–40, wind})`, capped at 30 fps | Matches Neon's C4 spec; freezes under reduced motion |
| A5 | **Cloud shadows on the map** | Slow cloud shadows drifting across the map | `makeCloudShadows(W, H, {seed})`: soft blobs, multiply, about 28 s to cross | Never darker than 22%; text stays readable |
| A6 | **Weather layers** | Rain, snow, hail, fog and wind-blown grass for sittings and the "Weather coming" road event | `makeWeather(kind, W, H, {seed, strength})` | Each reads at a glance at phone size; under 2 ms a frame |
| A7 | **Card motion kit** | Juice for the hand: draw from pile to hand, tilt on hover, slap into the telling slot, fly to the told pile | `animateCard(el, fromRect, toRect, {kind})` using the Web Animations API | 60 fps on a mid phone; no layout jumps |
| A8 | **Aerial "Meridian" map backdrop** | A low-oblique aerial Nebraska for the map: section-line grid, pivots, dunes, braided Platte | `makeAerialMap(W, H, {seed, light: 'dawn'|'day'|'gold'|'night'})` | Reads as aerial farmland from far off; rivers sit where real ones do (see B1) |

## B. Data Neon is good at gathering

| # | Piece | Hand back | Done when |
|---|---|---|---|
| B1 | **Real rivers and towns, simplified** | `nebraska.json` holding the Niobrara, Dismal, Middle and North Loup, Platte, North and South Platte, Elkhorn and Missouri as simplified lat/lon polylines (about 40 points each), plus the 18 places in the game with lat/lon, from public-domain sources (USGS, Natural Earth) | Lines plot correctly over a Nebraska outline; the source of each is noted |
| B2 | **More public-domain images, verified** | Like Pool A, but every entry checked against the source's own license field (Commons `extmetadata`, the LoC rights field, NARA). Wanted: Sandhills ranches, the Bessey Nursery at Halsey, windmills, the Loup and Platte, sod houses beyond Custer County, 1930s FSA photos of Nebraska towns. 40 entries, each with title, date, maker, license, source page, direct image URL and a suggested card or place | Every license is the source's own statement, not an assumption |
| B3 | **Nebraska natural sounds, described** | Not recordings. Written descriptions of how the Western meadowlark, sandhill crane, upland sandpiper, coyote, cottonwood leaves and windmill creak sound: pitch range, rhythm and length, detailed enough to synthesize | Specific enough to drive C1 |

## C. Sound

| # | Piece | Hand back | Done when |
|---|---|---|---|
| C1 | **Bird and animal calls** | Web Audio functions for the meadowlark (the state bird), crane chorus, coyote, owl, upland sandpiper | Each is recognizable to someone from Nebraska; none uses audio files |
| C2 | **Place motifs** | Short melodic motifs (note lists in semitones with rhythm) for the Sandhills, the Platte, the Loup, the courthouse and the Missouri, written to sit over a drone in D | Each is 8–16 notes, pentatonic or modal, and distinct from the others |
| C3 | **Weather sound** | Rain on a tin roof, thunder far off, wind in pines, snow hush | Loops without clicks |

## D. Tools for the designer

| # | Piece | Hand back | Done when |
|---|---|---|---|
| D1 | **Card editor** | One page that loads `cards.json`, shows every card in the game's layout, and lets the designer edit title, quote, theme, place, era, event, cost, vivid and art, then copy out the JSON | Weight is not editable: it comes from the value budget (basic 6 / uncommon 10 / rare 14 per trust at cost 1; Find ×0.65, Chain ×0.85, Risk ×0.9, Spare ×0.9, Repeat ×1; Weight = budget × event ÷ Vivid) |
| D2 | **Balance dashboard** | One page that runs the playtest bot in the browser and charts win rate per map row and per teller, how often each card is taken or given, and final score bands | Uses `game.js` unchanged and runs 200 runs in under 10 s |

## E. Production port (later)

| # | Piece | Hand back | Done when |
|---|---|---|---|
| E1 | **Typed, immutable rules** | `game.ts` as pure reducers (the deckbuilder guide's own standard), with tests | Given the same seed and choices, produces exactly the same run as `game.js`; the bot's numbers match |

## Not needed from Neon

- **Pool B images (the Andrew Moore–inspired prompts).** These run through the existing Gemini pipeline here (`tools/gemini-render.py`), so send prompts, not images. We already avoid putting Moore's photographs anywhere in the game.
- **Saving and resuming a run** (sessions of an hour or more that can be put down) and **wiring every piece into the game.** Claude does these in the repo.
- **Story writing.** Stories, tellers and lines are the designer's call. Drafts are welcome, but they'll be rewritten.

## Notes on Neon's asset pool

- All 12 Pool A images were checked against Wikimedia's license metadata: every one is public domain or CC0, with makers matching (NARA and USDA aerial indexes, NASA, NPS, Kady B. Faulkner 1901–1977, and three uploaders who released their photos).
- The game bundles every image locally, so there are no outside hosts at play time and no need for fallback SVGs for missing images.
- Pool B's style suffix adds "subtle solarpunk post-abundance touches." That pulls against the world (kept and quiet, not built and shiny), so drop that clause when rendering.
- "Inclusion/incision into the abundance" isn't the game's language. The world's terms are the Easement, the Survey, testimony, the record, and signing or refusing the agreement.
