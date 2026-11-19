"""Cut one drawing out of a page image and add it to the sketch library.

    python3 cut.py PAGE.png X0 Y0 X1 Y1 NAME --kind creature --habitat river \
        --source "Tasks, May 2025" [--erase X0 Y0 X1 Y1 ...]

Coordinates are fractions of the page (read them off intake.py's contact
sheets). The crop is tightened to the ink automatically.

Writes:
  art/sketches/NAME.png                      grayscale crop (the archive copy)
  prototypes/look-book/sketches/NAME.png     alpha version: ink darkness = opacity
  both manifest.json files                   kind, habitat, source, aspect ratio

Kinds the game understands: portrait, creature, character, landmark, emblem, plate.
Habitats steer where a drawing can appear: pines, prairie, river, lane, ridge,
sandbar, sky, card, quilt, any.
"""
import argparse
import json
import os

import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ARCHIVE = os.path.join(ROOT, "art", "sketches")
GAME = os.path.join(ROOT, "prototypes", "look-book", "sketches")
KINDS = {"portrait", "creature", "character", "landmark", "emblem", "plate"}


def load_manifest(folder):
    p = os.path.join(folder, "manifest.json")
    return json.load(open(p)) if os.path.exists(p) else {}


def save_manifest(folder, m):
    with open(os.path.join(folder, "manifest.json"), "w") as f:
        json.dump(dict(sorted(m.items())), f, indent=1)


def cut(page, box, name, kind, habitat, source, erase=(), max_side=720, keep_alpha=True):
    im = Image.open(page).convert("L")
    W, H = im.size
    im = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
    a = np.array(im)
    cw, ch = a.shape[1], a.shape[0]
    for e in erase:  # erase boxes are fractions of the crop, applied before tightening
        a[int(e[1] * ch):int(e[3] * ch), int(e[0] * cw):int(e[2] * cw)] = 255
    ys, xs = np.nonzero(a < 230)
    if len(xs) == 0:
        raise SystemExit("no ink found in that box")
    a = a[max(0, ys.min() - 6):ys.max() + 7, max(0, xs.min() - 6):xs.max() + 7]
    im = Image.fromarray(a)
    im.thumbnail((max_side, max_side))
    os.makedirs(ARCHIVE, exist_ok=True)
    os.makedirs(GAME, exist_ok=True)
    im.save(os.path.join(ARCHIVE, name + ".png"), optimize=True)
    if keep_alpha:
        l = np.asarray(im).astype(np.float32) / 255
        al = np.clip((.95 - l) / .75, 0, 1) ** .8
        rgba = np.zeros(l.shape + (4,), np.uint8)
        rgba[..., 3] = (al * 255).astype(np.uint8)
        Image.fromarray(rgba, "RGBA").save(os.path.join(GAME, name + ".png"), optimize=True)
    entry = {"kind": kind, "habitat": habitat, "source": source, "ar": round(im.width / im.height, 4)}
    for folder in (ARCHIVE, GAME):
        m = load_manifest(folder)
        m[name] = entry
        save_manifest(folder, m)
    return entry


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("page")
    ap.add_argument("box", nargs=4, type=float)
    ap.add_argument("name")
    ap.add_argument("--kind", required=True, choices=sorted(KINDS))
    ap.add_argument("--habitat", nargs="+", default=["any"])
    ap.add_argument("--source", default="")
    ap.add_argument("--erase", nargs="+", type=float, default=[])
    a = ap.parse_args()
    er = [a.erase[i:i + 4] for i in range(0, len(a.erase), 4)]
    print(a.name, cut(a.page, a.box, a.name, a.kind, a.habitat, a.source, er))


if __name__ == "__main__":
    main()
