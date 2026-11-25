# Weight: how Halsey's interface should feel

The interface felt thin, so this is the research behind the rebuild and the rules it follows. Every surface is now a slab of glazed clay sitting on a dark table. The rules live at the top of the `<style>` block in `prototypes/sitting/sitting.html`, and any new screen or Neon piece should follow them.

## What felt thin

Seen in screenshots of the old build, at 390 × 844 and 1280 × 860:

- **The game sat on pale paper.** The cards, panels and background were all cream, so nothing stood forward.
- **Every edge was a 1.5–2 px line** with a 3 px offset shadow. At phone size that reads as a drawing of a card, not a card.
- **No object had thickness.** Buttons, cards and panels were flat outlines, and pressing a button didn't move it.
- **Numbers were small boxes** that looked the same as labels.
- **The map was washed out.** Pale nodes, faint dashed paths, and labels at low contrast.

## What the phone-first deck builders do

I studied store screenshots of 18 card games, at full size, cropping in on their frames and buttons: Balatro, Slay the Spire 1 and 2, Wildfrost, Inscryption, Monster Train 2, Dicey Dungeons, Luck be a Landlord, Cobalt Core, Marvel Snap, Griftlands, Card Crawl Adventure, Pirates Outlaws, Dungeon Clawler, Peglin, Night of the Full Moon, Roguebook and Cultist Simulator. I also read design write-ups. What they share:

1. **A dark or saturated table, light objects on it.** Balatro uses green felt and dark slate panels, Slay the Spire and Monster Train dark scenes, Marvel Snap deep space. The cards are the brightest thing on screen, so they come forward.
2. **Objects have a visible edge, not a soft shadow.**
   - Balatro's panels and buttons each have a darker band along the bottom, the thickness of the slab, and its cards cast a hard, flat shadow.
   - Dicey Dungeons' cards have a 5–6 px darker lip.
   - Wildfrost and Slay the Spire 2 frame every card in a thick rim (wood, teal metal) with a dark outline outside it and an inner keyline.
3. **Nested frames.** An outer dark keyline, a colored rim, an inner keyline, then a recessed well for the art or text. Balatro does this with panels inside panels, each a shade darker.
4. **Badges break the frame.** Cost gems, health hearts and attack values sit over a card's corner or edge (Slay the Spire, Monster Train, Wildfrost). That makes them read first and makes the card feel built, not printed.
5. **Titles on a plate or banner** across the art (Wildfrost, Slay the Spire 2, Monster Train).
6. **Color is a label.** In Balatro chips are always blue and mult always red, and the hex values in [a design study of Balatro](https://blakecrosley.com/guides/design/balatro) make the same point. The structure stays neutral, so the values pop.
7. **Feedback stacks.** Balatro layers motion, sound, number roll, screen shake and particles on each score, scaled to the size of the moment. [Indie Klem's look at interface games](https://indieklem.substack.com/p/20-a-look-at-100-interface-games) calls this "everything synced," with each animation paired with a sound pitched by value.
8. **Physical, not flat.** Hearthstone's team moved from a flat parchment UI to a physical one because it made objects feel valuable. They described cards that tilt as you move them and a board that throws up dust ([GDC 2015, "How to Create an Immersive User Interface"](https://www.gdcvault.com/play/1022036/Hearthstone-How-to-Create-an)). Inscryption makes the table itself the interface.
9. **Touch.** The original Slay the Spire on phones is criticized for small targets and cards hidden under the finger ([Android Central](https://www.androidcentral.com/slay-spire-android-game-week), [TouchArcade](https://toucharcade.com/2020/06/15/slay-the-spire-ios-review-iphone-ipad-performance-icloud-megacrit-humble-games/)). Apple's guidance is that a control feels dead without a visual press state, and to pair it with sound and haptics ([Human Interface Guidelines, game controls](https://developer.apple.com/design/human-interface-guidelines/game-controls)).
10. **Thick borders need balance.** Nielsen Norman's review of neobrutalism (thick borders, hard offset shadows) says it works when type stays readable, colors meet contrast, the palette stays to two or three loud colors, and whitespace offsets the weight ([NN/g](https://www.nngroup.com/articles/neobrutalism/)).

## What your own work says

From the Instagram pulls in `art/instagram/`:

- **The slab edge.** The red-and-blue arch is a thick slab whose cut edge shows a different color, red outside and cobalt inside. That is the model for every object's thickness, and it is why Weight is cobalt and Vivid is red.
- **The drawn frame.** The yellow desert drawing sits in a heavy brown frame with a wobbly edge, an ink outline and an inner keyline. The scene now sits in a frame like that: a wood rim, a gold fillet, an ink line.
- **Speckled stoneware.** The cream clay pieces are flecked with iron. Every bisque surface carries a faint speckle.
- **Gold leaf.** The red hook arch has a band of gold leaf. Rare stories now carry a gold-leaf band across their title.
- **Technical desert.** A thick lilac border on hot pink paper, cracks glowing mint. These are the accent colors: lilac for arches on the map, mint for "on."
- **Glazes.** Celadon, terracotta, black glaze and white bisque are the colors of the rings that tell the kinds of map stops apart.

## The rules

1. **One keyline weight.** 3 px of ink around every object you can touch, and 2 px on small tags. Inner keylines are 1.5–2 px.
2. **Objects have thickness.** Under each one is a hard lip in ink (5 px on a big screen, 4 px on a phone), plus a darker band inside its bottom edge and a thin highlight along its top. No soft blur shadows, except a faint cast shadow under cards and frames.
3. **Pressing pushes the object into its lip.** Buttons, map stops, page arrows and keepsake choices all move down when pressed. A disabled button is already pushed in and desaturated.
4. **Values sit in wells or on pills.**
   - Wells are sunk into the slab: the credibility track, empty story slots, the score.
   - Pills are raised: blue for Weight, red for Vivid, pink for trust, ink with gold numerals for the total.
   - Numbers are bold and tabular, with a hard 2 px shadow in the pill's darker tone.
5. **Badges break the frame.** The cost medallion sits over the card's top-left corner. Weight and Vivid are chunky pills at the bottom of the face.
6. **Color is a label.**
   - A card's rim is its theme's glaze.
   - A map stop's ring is its kind: terracotta for a sitting, black glaze for a holdout, celadon for the road, lilac for an arch, gold for the courthouse, cobalt for the bridge.
   - The header of "Today they" is its kind: cobalt for asks, terracotta for doubt, celadon for "tells one of theirs," violet for quiet.
   - Everything structural is bisque and ink.
7. **A dark table under everything,** tinted by the hour of the journey: dawn terracotta, day prairie blue, gold, lamp brown, aurora night. It has a vignette and a fine grain. Text that sits on the table is cream, with a hard ink shadow.
8. **Feedback scales with the moment.**
   - A telling shakes the sitting harder the bigger it was against the threshold, and a glint runs along the credibility bar.
   - New cards deal in one after another, 60 ms apart.
   - A story dropping into a slot lands with a small overshoot.
   - The sum's pills pop.
   - Everything uses one overshoot curve, `cubic-bezier(.34,1.56,.64,1)`.
9. **Sound and touch with every press.**
   - Clay sounds: a short knock on buttons, a lift and a low thock when a story goes to the tray, a paper flick when cards deal.
   - A buzzer for a card you can't afford.
   - A low thud under every telling, louder for big ones.
   - Each sound varies slightly in pitch so it never nags.
   - Phones that allow it get a matching buzz: 6–8 ms for a touch, a longer pattern for doubt.
   - Under reduced motion, the shakes, deals, pops and buzzes all stop.
10. **Restraint.** Only gold and the value colors are loud. Rules text stays at 13.5 px or more on the card, nothing goes under 12 px, and the phone still never scrolls.

## Tokens

| Token | Value | Used for |
|---|---|---|
| `--k` | 3px | keyline |
| `--lip` | 5px (phone 4px) | thickness under objects |
| `--ink` | `#1f1b2e` | keylines, lips |
| `--bisque` / `--bisque-d` | `#f3e8cf` / `#d8c49b` | surfaces and their bottom band |
| `--weight` / `-d` | `#2f6fc0` / `#1c4a87` | Weight pills |
| `--vivid` / `-d` | `#c63a2e` / `#8a2219` | Vivid pills |
| `--trust` / `-d` | `#e2486f` / `#a12a4c` | cost medallions, trust |
| `--gold` / `-d` | `#f2c230` / `#b8860f` | the next thing to do, the score, selection glow |
| `--leaf` | `#d4a73a` | rare stories, courthouse ring |
| `--celadon`, `--lilac`, `--terracotta`, `--cobalt`, `--glaze-black` | | kind rings and intent plates |
| `--pop` | `cubic-bezier(.34,1.56,.64,1)` | landing motion |
| `--speck` | inline SVG | iron speckle on clay |
| `--grain` | inline SVG | the table's grain |

## Where it shows

| Piece | Before | Now |
|---|---|---|
| Table | pale peach gradient | dark, by the hour, with vignette and grain |
| Card | cream slip, 2px line, thin top band | glazed rim around a speckled bisque face, ink keylines inside and out, cost medallion over the corner, chunky W/V pills, gold leaf on rares |
| Buttons | yellow with a 3px shadow | slabs with a lip and a bottom band; they press down |
| Scene | 2px border | wood frame, gold fillet, ink line |
| Portrait | 2px border | bisque mat, ink frame, lip |
| Today they | plain panel | slab with a colored header by kind |
| Credibility | thin bar | glazed fill in a sunk dark track, glint when it rises |
| Tray | dashed outline | slab with sunk slots; filled slots wear their theme on the left edge |
| Top strip | loose text | a dark panel with a health bar in a well, and the score in a well |
| Map | pale nodes, faint paths | a survey plat in a heavy frame; stops are medallions with kind rings and lips; trails dotted in ink; the walked path inked pink; rivers cut in with a dark edge |
| Sheets | plain panel | speckled slab; on a phone a gold rim along the top, and the map peek has a grabber |

## Not done yet

- A truly hand-drawn, scalloped frame for the scene, like your drawing, as an image instead of CSS.
- Card tilt toward the finger (Hearthstone), and parallax on rare cards.
- Particles from a telling to the score (Balatro's trails). The thread from your stories to the portrait does some of this.
- Landscape phones (U12 in `docs/neon-ui-menu.md`).
