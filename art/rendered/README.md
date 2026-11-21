# Gemini renders

Made with `tools/gemini-render.py` from the batch files here (`prompts.json`, `batch-a.json` to `batch-c.json`). Then `tools/prepare-assets.py` turns them into game assets in `prototypes/collision/`.

- Places: `<place>.jpg` by day, `night-<place>.jpg` under the aurora (your aurora photo was the color reference), `sky-<place>.jpg` sky masks
- Tellers: `cast-<name>.jpg` photographs, `drawn-<name>.jpg` and `drawn2-<name>.jpg` pen drawings in your style (two passes; the looser one is used unless it moved the framing)
- `face1-3-photo.jpg`: photographs rendered from your own face drawings
- Creatures: `beast-<name>.jpg` on green, keyed out later; the strange ones are grown from your sculptures and critter drawing
- `cut-arch-*.jpg`: your arch sculptures isolated on green
- `omaha-flag.jpg`: Omaha with its flag corrected to a white circle on gray
