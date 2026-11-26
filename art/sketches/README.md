# Sketch library

Hand drawings from the Kobo notebooks (*Sketches*, *Tasks* and *Sketch 2*), cropped for use in Halsey. The game is "both and": places, light and layout are generated, while people, creatures and some landmarks are drawn by hand. Each drawing becomes one more ink layer, so it prints in whatever look, inks, paper and texture a scene uses.

| File | From | Use |
|---|---|---|
| `face1.png` | Sketches | Portrait (the "funny" face) |
| `face2.png` | Tasks | Portrait |
| `face3.png` | Tasks | Portrait |
| `tower.png` | Sketches | Landmark: the tower in the planted forest |
| `cranes.png` | Tasks | Creatures: cranes on the Platte |
| `critter.png` | Sketches | Creature: the thing on the ridge |
| `ridge.png` | Sketches | Gray-marker landscape (gradient-mapped plate) |
| `grass.png` | Tasks | Grass study |
| `doodles.png` | Tasks | Burrs and stars, candidate modifier art |
| `traveler.png` | Tasks (May) | Character: a traveler in a wheelchair, on the firebreak lane |
| `bulb.png` | Tasks (May) | Modifier art: Public Power (Nebraska is the only state served entirely by public power) |
| `medallion.png`, `checker.png`, `starburst.png`, `petal.png`, `stars.png` | Tasks | Emblems painted on barn quilt modifiers |
| `mainstreet.png` | Tasks | Landmark: a Main Street of storefronts on a Sandhills ridge |
| `chandelier.png` | Sketch 2 | Creature: the Chandelier, a beaded, dripping bell. Rendered as a live creature (`beast-chandelier`) at the Dismal and Tech High; art for "My aunt heard it count" |
| `bird-woman.png` | Sketch 2 | Portrait under two birds; art for "The shape over Thedford" |
| `bin-walker.png` | Sketch 2 | Character taking out the trash; art for "Sweeping the elevator on Sundays" |
| `faint-figure.png` | Sketch 2 | Character, very light pencil; in the library, not yet used |

`manifest.json` lists each drawing's kind, habitat, source and aspect ratio. Add new drawings with `tools/sketch-intake/`.

These are grayscale crops. The look book uses alpha versions in `prototypes/look-book/sketches/`, where ink darkness becomes opacity.

Only the drawings are kept here. The notebook pages themselves (the work notes) stay out of the repo.
