# Gemini Neon, pack 1

Code from Gemini Neon, built to `docs/neon-menu.md`. License: CC0-1.0 / MIT. Plain ES2020, no dependencies, seeded, reduced-motion safe. `demo.html` is Neon's own test page for these files.

| File | Menu item | Where it is in the game |
|---|---|---|
| `A1-topo.js` | Topographic contours | Under the map, seeded by the run so every run's land is different. Rust and ink lines, multiplied over the aerial indexes. |
| `A2-pivot.js` | Center-pivot mandala | The draw-pile icon at the foot of the page, a new pivot each run. |
| `A3-story-swap-thread.js` | Story-swap thread | Each telling sends a thread from the telling slots to the teller's portrait, in the color of the story's event. Each trade braids from the story you give to the teller and back. |
| `A4-pollen.js` | Prairie wind and pollen | Behind your hand during a sitting: pollen by day, fireflies at night, dust under the courthouse lamp. |
| `A5-cloud-shadows.js` | Cloud shadows | Drifting over the map, about 36 seconds to cross. |
| `C2-place-motifs.js` | Place motifs | Each sitting plays its place's tune when you arrive (Sandhills, Loup, Platte, courthouse, Missouri), in the current music key. The porch guitar rests while it plays. Courthouses play the courthouse tune. |
| `../editor.html` | D1 card editor | Linked from the game's footer. It opens on the current cards. `node tools/export-cards.js` refreshes both `cards.json` and the editor's built-in copy. |

## Changes made here

- **`C2-place-motifs.js`:** added a `transpose` option in semitones, because Halsey's music key moves as you travel east (D, then E, G, A). Nothing else in Neon's files was changed.
- **`editor.html` (a copy of `D1-card-editor.html`):**
  - Weight is at least 2, the same as `game.js`.
  - Shows the Vivid cap by rarity and warns when a card goes over it.
  - Shows each card's actual art, with the drawing overlaid on renders.
  - Adds the `painting` art kind.
  - Fixes the form overflowing its panel.
  - Loads the current card set: 70 cards.
