# Halsey: design notes

Working title **Halsey** (the repo is still named Forester). This is a living document of decisions made so far. Open questions are marked **Open**.

## Pitch

The government planted a forest in the Nebraska Sandhills. Then the government went away. The forest didn't.

Halsey is an encounter-driven roguelike for phones (and other platforms), set in a post-government, post-agricultural Nebraska with very little infrastructure left. You play a Forester tending what the old world left behind and travelling outward from the planted forest. Tone: **eerie and hopeful**. Not folksy.

## Setting

- **Starting point:** the Bessey Ranger District of the Nebraska National Forest, near Halsey, between the Dismal and Middle Loup rivers. It is a hand-planted forest of ponderosa pine, jack pine and eastern redcedar, planted from the early 1900s.
- **Why the forest spreads:** with no fire management and no farming, eastern redcedar keeps moving into the grassland. Nebraska already calls this the "green glacier". In the game it spreads unpredictably, especially along waterways like the Platte.
- **Real geography matters.** Rivers are the main routes and the main texture: the Platte, the Loup branches, the Dismal, the Niobrara and the Republican. Scenes and encounters draw on real places, and playing should teach the map.
- **Destinations vary per run:** east, west, north or south. Overgrown forest is where you start. The open prairie is its own kind of frightening.
- **Minimal infrastructure:** no power grid, rusting center pivots, grain elevators as landmarks and shelters, broken Interstate 80 overpasses along the Platte, rail lines and bridges with failed spans, fire lookouts, windmills that still pump, CB and ham radio, abandoned county offices.
- **Histories:** Nebraska and Native histories (Pawnee, Lakota, Ponca, Omaha, Otoe-Missouria, Ho-Chunk and others) inform encounters. This needs care and consultation; we should not borrow sacred figures as monsters.
- **Other folklore:** American logging-camp "fearsome critters" (the hidebehind and others), tall tales, real figures such as Johnny Appleseed. European forest myth is not the base layer.

## Core design (proposed, not locked)

- **Goal-based scoring, like Balatro:** each encounter has a target (provisions for the coming season). The score is Base × Mult. Seasons are the antes and runs last several years. Falling short means a lean winter that ends the run; there is no hit-point death spiral.
- **Modifiers work across every minigame through a shared event vocabulary.** Minigames report standard events (Chain, Risk, Find, Spare, and so on). Modifiers listen for events, never for a specific game, so one modifier works in a card game, a tracking puzzle and a barter alike.
- **Party:** companions fill the joker role. Slots are limited and order matters. Some companions unlock extra options inside encounters.
- **An encounter is Place × Goal × Mechanic × Twist × Stakes.** Each part is a swappable module.
- **Both kinds of encounter:** written story encounters and mechanical minigames.
- **Depth over breadth:** start with 4–6 deep, turn-based minigames and get variety from combining modules.
- **Sessions:** an hour or more, and easy to put down and pick up (the game saves at every encounter).

## Platform and tech (proposed)

- TypeScript, rendering with PixiJS (WebGL/WebGPU), installable as a web app from day one.
- Capacitor builds for the App Store and Google Play. **The target is store-ready.**
- All visuals are generated in code from a seed. Sound is generated too (Web Audio; plucked strings via Karplus-Strong synthesis).

## Look book

`prototypes/look-book/look-book.html` holds six art directions, each drawing the same seeded scenes: screen print, linocut, survey plate, signal (one-bit dither), pieced (quilt geometry) and fog. The file is the source of a published page, so it has no `<html>` or `<head>` wrapper of its own.

Round two added:

- **Screen print editions**, each a set of ink separations composited onto generated paper (fibers, flecks, tooth, deckle): rag paper, overprint (transparent inks that multiply), split fountain, black stock and newsprint.
- **Glass plate:** after Solomon Butcher's Custer County negatives, 1886–1912. People who move during the exposure become ghosts.
- **Trail cam:** an infrared game camera whose clock reset to 01/01/2000.
- **Expired film:** slide film with light leaks, in a cardboard mount.

Favorites so far: **screen print** (paper texture matters).

Round three added:

- **A print mixer.** Light model (dusk air, glass plate, trail cam, fog), ink set and paper are separate, swappable choices. Five curated mixes are included. The strongest are trail cam on black stock and trail cam in the weekly (newsprint).
- **Meridian:** after Andrew Moore's *Dirt Meridian* (aerials of the Sandhills along the 100th meridian, shot from a crop duster's plane). Low-altitude, early-light aerial views of dunes, ghost pivot circles, shelterbelts, the Bessey planting blocks and the braided Platte. This is the leading candidate for the travel map. Halsey sits at about 100.3°W, almost on the meridian.
- **Type sets.** All are SIL Open Font License, so they are fine to ship commercially: Wood type (Holtwood One SC, Goudy Bookletter 1911, Special Elite), Stencil and typewriter (Stardos Stencil, Courier Prime), Kitchen table (Sue Ellen Francisco), Letterpress (IM Fell). The device fonts on the radio and trail-cam screens stay as they are.

**Decided:** 2D for now. `prototypes/print-3d/print-3d.html` is a Three.js test that prints a 3D forest with the same ink-separation idea in a shader, kept for comparison.

**Open:** pick one look, or a blend of two.

### Barn quilt modifiers

Modifier art is a painted barn quilt.

- Common modifiers use traditional blocks: Pinwheel, Sawtooth Star, Dutchman's Puzzle, Broken Dishes, Mill Wheel, Log Cabin.
- Rarer ones get a block generated from the modifier's name, using symmetric half-square and quarter-square triangles plus quarter circles.
- Rare modifiers hang on point.
- Paint color shows which event the modifier listens for: Chain is red, Repeat is rust, Find is sky blue, Spare is green, Risk is gold, Season is plum and Hold is blue.

## Engine and 3D (discussion, not decided)

- Prototype the art and the core loop on the web (fast to iterate, opens on a phone from a link). Keep game rules as engine-independent data so a move to Godot stays cheap.
- Godot's strengths: native mobile and desktop exports, shaders, GPU particles, MultiMesh for thousands of trees, mixed 2D and 3D in one project.
- Godot's catch: its showpiece atmosphere features (volumetric fog, SDFGI) need the Forward+ renderer. Phones use the Mobile renderer and web builds use Compatibility, so those effects have to be faked there.
- If we go 3D: use 2.5D. Stylized 3D scenery with a print or paper post-process and a mostly fixed camera, with 2D for encounters and UI. Real terrain could come from public USGS elevation data.

## Open questions

- Final art direction.
- Name collision: "Halsey" is also a well-known musician's stage name. A subtitle may be needed for store search and trademark.
- Which 4–6 minigames come first.
- Who to consult on Native histories, and how.
