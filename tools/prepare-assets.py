"""Turn renders in art/rendered and sources in art/instagram into web assets for prototypes/collision.

    python3 tools/prepare-assets.py

- places: day and night photos -> img/<name>.jpg, img/night-<name>.jpg (1200 px wide)
- sky masks -> img/sky-<name>.png (white = sky; only regions touching the top edge are kept,
  so water that reflects the sky is not mistaken for it)
- creatures rendered on green -> objects/beast-<name>.png (keyed to alpha, green spill removed)
- tellers: photo -> img/cast-<name>.jpg, drawing -> sketches/drawn-<name>.png (paper lifted to white)
- auroras -> img/aurora-<n>.jpg (the sky part of each photo)
"""
import json, os, glob
import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RD, IG, OUT = (os.path.join(ROOT, p) for p in ("art/rendered", "art/instagram", "prototypes/collision"))
OUT = os.environ.get("HALSEY_OUT", OUT)   # set to try the build somewhere else
os.makedirs(f"{OUT}/img", exist_ok=True); os.makedirs(f"{OUT}/objects", exist_ok=True); os.makedirs(f"{OUT}/sketches", exist_ok=True)

def jpg(src, dst, w=1200, q=84):
    im = Image.open(src).convert("RGB"); im.thumbnail((w, w)); im.save(dst, quality=q, optimize=True)

def key_green(src):
    im = np.asarray(Image.open(src).convert("RGB")).astype(float)
    R, G, B = im[..., 0], im[..., 1], im[..., 2]; d = G - np.maximum(R, B)
    border = np.concatenate([d[:8].ravel(), d[-8:].ravel(), d[:, :8].ravel(), d[:, -8:].ravel()])
    bg = max(20.0, float(np.median(border)))
    a = 1 - np.clip((d - .3 * bg) / (.62 * bg - .3 * bg), 0, 1)
    a = ndi.gaussian_filter(a, .7)
    keep = a > .5; lab, k = ndi.label(keep)
    if k:
        sizes = ndi.sum(keep, lab, range(1, k + 1)); big = lab == (1 + int(np.argmax(sizes)))
        others = [i + 1 for i, s in enumerate(sizes) if s > .02 * sizes.max()]
        big = np.isin(lab, others)
        a = a * ndi.binary_dilation(big, iterations=3)
    edge = (a < .98) & (a > 0); G2 = np.where(edge | (d > 0), np.minimum(G, np.maximum(R, B) + 4), G)
    rgba = np.dstack([R, G2, B, a * 255]).clip(0, 255).astype(np.uint8)
    ys, xs = np.where(a > .05); return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1])

def sky(src, dst):
    m = np.asarray(Image.open(src).convert("L").resize((600, 400))) > 127
    lab, k = ndi.label(m); top = set(np.unique(lab[0])) - {0}
    m = np.isin(lab, list(top)); m = ndi.binary_opening(m, iterations=1)
    Image.fromarray((ndi.gaussian_filter(m.astype(float), 1.2) * 255).astype(np.uint8)).save(dst, optimize=True)

def drawing(src, dst):
    im = Image.open(src).convert("L"); a = np.asarray(im).astype(float)
    paper = np.percentile(a, 92); a = np.clip(a / paper * 255, 0, 255)
    out = Image.fromarray(a.astype(np.uint8)); out.thumbnail((700, 700)); out.save(dst, optimize=True)

TIDY = {"tomas", "lou", "gus"}
meta = {"places": [], "beasts": [], "cast": []}
for f in sorted(glob.glob(f"{RD}/night-*.jpg")):
    name = os.path.basename(f)[6:-4]
    day = f"{RD}/omaha-flag.jpg" if name == "omaha" else f"{RD}/{name}.jpg"
    jpg(day, f"{OUT}/img/{name}.jpg"); jpg(f, f"{OUT}/img/night-{name}.jpg")
    if os.path.exists(f"{RD}/sky-{name}.jpg"): sky(f"{RD}/sky-{name}.jpg", f"{OUT}/img/sky-{name}.png")
    meta["places"].append(name)
for f in sorted(glob.glob(f"{RD}/beast-*.jpg")):
    name = os.path.basename(f)[:-4]; im = key_green(f); im.thumbnail((640, 640)); im.save(f"{OUT}/objects/{name}.png", optimize=True)
    meta["beasts"].append(name)
for f in sorted(glob.glob(f"{RD}/cast-*.jpg")):
    name = os.path.basename(f)[5:-4]; jpg(f, f"{OUT}/img/cast-{name}.jpg", 640)
    loose = name not in TIDY and os.path.exists(f"{RD}/drawn2-{name}.jpg")   # the looser second pass, unless it moved the framing
    d = f"{RD}/drawn2-{name}.jpg" if loose else f"{RD}/drawn-{name}.jpg"
    if os.path.exists(d): drawing(d, f"{OUT}/sketches/drawn-{name}.png")
    meta["cast"].append(name)
for n in range(1, 5):
    im = Image.open(f"{IG}/aurora-{n}.jpg").convert("RGB"); w, h = im.size
    im.crop((0, 0, w, int(h * .5))).resize((1200, 600)).save(f"{OUT}/img/aurora-{n}.jpg", quality=86)
print(json.dumps({k: len(v) for k, v in meta.items()}))
