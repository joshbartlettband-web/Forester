"""Build a handwriting font from free-form notebook pages (no template).

Step 1, extract:   python3 from_notes.py extract PAGES... --work DIR
    Finds every separate pen mark, estimates its line's baseline and x-height
    from its neighbours, normalizes it, and groups similar shapes with k-means.
    Writes DIR/clusters-N.png sheets (one row per group, several examples each).

Step 2, label:     write DIR/labels.json  {"12": "a", "40": "R", "7": null, ...}
    A person (or Claude, reading the sheets) names the letter in each row.
    null skips a mixed or non-letter group. "a|o" style splits are not supported;
    skip mixed groups instead.

Step 3, build:     python3 from_notes.py build --work DIR --name "Halsey Hand" --out dist
    Picks the most typical examples of each letter (up to 3), traces them, and
    builds the font with build_font.make_font (contextual alternates included).

PAGES can be PDFs (embedded page images are used at full resolution), zips of
page images, folders or single images.
"""
import argparse
import io
import json
import os
import pickle
import sys
import zipfile

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

sys.path.insert(0, os.path.dirname(__file__))

INK = 110          # 0-255: darker than this is pen ink (gray marker is ignored)
GRID = 48          # feature bitmap size


def page_images(paths):
    for p in paths:
        if os.path.isdir(p):
            for f in sorted(os.listdir(p)):
                if f.lower().endswith((".png", ".jpg", ".jpeg")):
                    yield f"{p}/{f}", Image.open(os.path.join(p, f))
        elif p.lower().endswith(".zip"):
            with zipfile.ZipFile(p) as z:
                for n in sorted(z.namelist()):
                    if n.lower().endswith((".png", ".jpg", ".jpeg")) and not n.startswith(("/", "..")):
                        yield f"{p}:{n}", Image.open(io.BytesIO(z.read(n)))
        elif p.lower().endswith(".pdf"):
            import pymupdf
            doc = pymupdf.open(p)
            for i, page in enumerate(doc):
                imgs = page.get_images()
                if len(imgs) == 1:
                    yield f"{p}#{i + 1}", Image.open(io.BytesIO(doc.extract_image(imgs[0][0])["image"]))
                else:
                    pix = page.get_pixmap(dpi=300)
                    yield f"{p}#{i + 1}", Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        else:
            yield p, Image.open(p)


def components(gray):
    ink = gray < INK
    ink = ndimage.binary_closing(ink, iterations=1)
    lab, n = ndimage.label(ink, structure=np.ones((3, 3)))
    objs = ndimage.find_objects(lab)
    out = []
    for i, sl in enumerate(objs, 1):
        if sl is None:
            continue
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        area = int((lab[sl] == i).sum())
        out.append({"id": i, "box": [x0, y0, x1, y1], "area": area})
    return lab, out


def merge_marks(comps, xh):
    """Join dots and short strokes to the mark below/across them (i, j, !, ?, =, :, ;)."""
    n = len(comps)
    B = np.array([c["box"] for c in comps], float)
    A = np.array([c["area"] for c in comps], float)
    parent = list(range(n))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i
    small = A < 2500                      # only small marks (dots, bars) get joined to neighbours
    for i in np.nonzero(small)[0]:
        x0, y0, x1, y1 = B[i]
        ov = np.minimum(x1, B[:, 2]) - np.maximum(x0, B[:, 0])
        sw = np.minimum(x1 - x0, B[:, 2] - B[:, 0])
        vgap = np.maximum(B[:, 1] - y1, y0 - B[:, 3])
        cand = np.nonzero((ov > 0.5 * sw) & (vgap < 0.75 * xh) & (np.arange(n) != i))[0]
        if len(cand):
            j = cand[np.argmin(np.abs((B[cand, 1] + B[cand, 3]) / 2 - (y0 + y1) / 2))]
            parent[find(i)] = find(j)
    groups = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)
    merged = []
    for g in groups.values():
        merged.append({"ids": [comps[i]["id"] for i in g],
                       "box": [B[g, 0].min(), B[g, 1].min(), B[g, 2].max(), B[g, 3].max()],
                       "area": float(A[g].sum())})
    return merged


def extract(paths, work):
    os.makedirs(work, exist_ok=True)
    samples = []
    for src, im in page_images(paths):
        gray = np.asarray(im.convert("L"))
        lab, comps = components(gray)
        hs = np.array([c["box"][3] - c["box"][1] for c in comps if 30 < c["area"] < 20000])
        if len(hs) < 20:
            continue
        xh_page = float(np.median(hs))
        marks = merge_marks([c for c in comps if c["area"] > 25], xh_page)
        boxes = np.array([m["box"] for m in marks], float)
        cy = (boxes[:, 1] + boxes[:, 3]) / 2
        cx = (boxes[:, 0] + boxes[:, 2]) / 2
        hgt = boxes[:, 3] - boxes[:, 1]
        wid = boxes[:, 2] - boxes[:, 0]
        for k, m in enumerate(marks):
            near = (np.abs(cy - cy[k]) < 0.7 * xh_page) & (np.abs(cx - cx[k]) < 10 * xh_page) & (hgt < 3 * xh_page) & (hgt > 0.3 * xh_page)
            if near.sum() < 4:
                continue
            base = float(np.median(boxes[near, 3]))
            nh = hgt[near]
            xh = float(np.median(nh[nh < 1.4 * np.median(nh)]))
            h, w = hgt[k], wid[k]
            if not (0.35 * xh < h < 2.8 * xh and 0.12 * xh < w < 2.4 * xh):
                continue
            x0, y0, x1, y1 = [int(v) for v in m["box"]]
            mask = np.isin(lab[y0:y1, x0:x1], m["ids"])
            samples.append({"src": src, "box": [x0, y0, x1, y1], "base": base, "xh": xh, "mask": np.packbits(mask), "shape": mask.shape})
        print(f"{src}: {len(marks)} marks, {len(samples)} samples so far", flush=True)
    feats = np.array([feature(s) for s in samples], np.float32)
    from sklearn.cluster import KMeans
    from sklearn.decomposition import PCA
    z = PCA(48, random_state=0).fit_transform(feats)
    k = int(min(160, max(20, len(samples) // 60)))
    km = KMeans(k, n_init=4, random_state=0).fit(z)
    d = np.linalg.norm(z - km.cluster_centers_[km.labels_], axis=1)
    for s, l, dd in zip(samples, km.labels_, d):
        s["cluster"], s["dist"] = int(l), float(dd)
    with open(os.path.join(work, "samples.pkl"), "wb") as f:
        pickle.dump(samples, f)
    sheets(samples, k, work)
    print(f"{len(samples)} samples in {k} groups")


def unpack(s):
    return np.unpackbits(s["mask"])[: s["shape"][0] * s["shape"][1]].reshape(s["shape"]).astype(bool)


def feature(s):
    """Place the mark in a baseline-relative 48x48 window so size and position count."""
    m = unpack(s)
    x0, y0, x1, y1 = s["box"]
    sc = 13.0 / s["xh"]                      # x-height -> 13 px
    top = s["base"] - 2.3 * s["xh"]          # window: 2.3 x-heights above baseline, 1.4 below
    h, w = m.shape
    img = Image.fromarray((m * 255).astype(np.uint8)).resize((max(1, int(w * sc)), max(1, int(h * sc))), Image.BILINEAR)
    canvas = Image.new("L", (GRID, GRID), 0)
    canvas.paste(img, (int(GRID / 2 - img.width / 2), int((y0 - top) * sc)))
    a = np.asarray(canvas, np.float32) / 255
    a = ndimage.gaussian_filter(a, 1.0)
    return a.ravel()


def thumb(s, size=56):
    m = unpack(s)
    x0, y0, x1, y1 = s["box"]
    sc = 18.0 / s["xh"]
    top = s["base"] - 2.3 * s["xh"]
    h, w = m.shape
    img = Image.fromarray(((~m) * 255).astype(np.uint8)).resize((max(1, int(w * sc)), max(1, int(h * sc))), Image.BILINEAR)
    c = Image.new("L", (size, size + 8), 255)
    c.paste(img, (int(size / 2 - img.width / 2), int((y0 - top) * sc)))
    d = ImageDraw.Draw(c)
    by = int((s["base"] - top) * sc)
    d.line([(0, by), (4, by)], fill=150)
    d.line([(size - 4, by), (size, by)], fill=150)
    return c


def sheets(samples, k, work, per_sheet=24, per_row=9):
    by = {}
    for s in samples:
        by.setdefault(s["cluster"], []).append(s)
    order = sorted(by, key=lambda c: -len(by[c]))
    for sh in range(0, len(order), per_sheet):
        rows = order[sh:sh + per_sheet]
        W, H = 70 + per_row * 58, len(rows) * 66
        img = Image.new("L", (W, H), 255)
        d = ImageDraw.Draw(img)
        for r, c in enumerate(rows):
            mem = sorted(by[c], key=lambda s: s["dist"])
            pick = mem[:per_row - 3] + mem[len(mem) // 2: len(mem) // 2 + 3] if len(mem) > per_row else mem
            d.text((4, r * 66 + 20), f"{c}", fill=0)
            d.text((4, r * 66 + 36), f"n={len(mem)}", fill=110)
            for j, s in enumerate(pick[:per_row]):
                img.paste(thumb(s), (70 + j * 58, r * 66))
            d.line([(0, r * 66 + 65), (W, r * 66 + 65)], fill=210)
        img.save(os.path.join(work, f"clusters-{sh // per_sheet + 1}.png"))


def even_pen(mask, xh, weight=0.085):
    """Redraw a mark with one consistent pen: thin it to its centre line, then
    thicken it to `weight` x-heights, so letters from different pens match."""
    from skimage.morphology import disk, skeletonize
    m = ndimage.binary_closing(mask, iterations=1)
    sk = skeletonize(m)
    r = max(1, int(round(weight * xh / 2)))
    pad = r + 2
    sk = np.pad(sk, pad)
    out = ndimage.binary_dilation(sk, structure=disk(r))
    return out, pad


def synth(ch, xh=60):
    """Simple pen marks for punctuation the notes didn't supply. Returns (mask, base_row, xh)."""
    W, H = int(xh * 1.6), int(xh * 3.2)
    im = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(im)
    base = int(H * 0.7)
    w = max(2, int(0.085 * xh))
    R = np.random.default_rng(ord(ch))
    j = lambda: float(R.normal(0, xh * 0.03))
    if ch == ".":
        d.ellipse([W / 2 - w, base - 2 * w, W / 2 + w, base], fill=255)
    elif ch == ",":
        d.line([(W / 2 + j(), base - w), (W / 2 - xh * 0.15, base + xh * 0.35)], fill=255, width=w)
    elif ch == "-":
        d.line([(xh * 0.1, base - xh * 0.45 + j()), (xh * 0.75, base - xh * 0.48 + j())], fill=255, width=w)
    elif ch == "'":
        d.line([(W / 2, base - xh * 1.55), (W / 2 - xh * 0.06, base - xh * 1.1)], fill=255, width=w)
    elif ch == '"':
        for dx in (-xh * 0.13, xh * 0.13):
            d.line([(W / 2 + dx, base - xh * 1.55), (W / 2 + dx - xh * 0.06, base - xh * 1.1)], fill=255, width=w)
    elif ch == ";":
        d.ellipse([W / 2 - w, base - xh * 0.8 - 2 * w, W / 2 + w, base - xh * 0.8], fill=255)
        d.line([(W / 2, base - w), (W / 2 - xh * 0.15, base + xh * 0.35)], fill=255, width=w)
    elif ch == "*":
        cx, cy = W / 2, base - xh * 1.1
        for ang in (90, 30, 150):
            dx, dy = np.cos(np.radians(ang)) * xh * 0.32, np.sin(np.radians(ang)) * xh * 0.32
            d.line([(cx - dx + j(), cy - dy), (cx + dx, cy + dy + j())], fill=255, width=w)
    elif ch == "#":
        for dx in (0.3, 0.62):
            d.line([(xh * (dx + 0.08), base - xh * 1.25), (xh * (dx - 0.06), base + xh * 0.05)], fill=255, width=w)
        for yy in (0.82, 0.38):
            d.line([(xh * 0.05, base - xh * yy + j()), (xh * 0.95, base - xh * yy + j())], fill=255, width=w)
    elif ch == "%":
        d.ellipse([xh * 0.05, base - xh * 1.3, xh * 0.35, base - xh * 0.95], outline=255, width=w)
        d.line([(xh * 0.85, base - xh * 1.35), (xh * 0.1, base)], fill=255, width=w)
        d.ellipse([xh * 0.6, base - xh * 0.38, xh * 0.9, base - xh * 0.03], outline=255, width=w)
    elif ch == "=":
        for yy in (0.32, 0.6):
            d.line([(xh * 0.1, base - xh * yy + j()), (xh * 0.8, base - xh * yy + j())], fill=255, width=w)
    else:
        return None
    return np.asarray(im) > 0, base, xh


PEN_UNITS = 46          # stroke width of the redrawn pen, in font units

# Where each kind of letter sits, in font units: (bottom, top). Baseline 0, x-height 450.
BOXES = {**{c: (0, 450) for c in "acemnorsuvwxz"}, **{c: (0, 720) for c in "bdfhkl"}, "t": (0, 610), "i": (0, 640),
         **{c: (-250, 450) for c in "gpqy"}, "j": (-250, 640), "CAP": (0, 700),
         "?": (0, 700), "!": (0, 700), ":": (0, 430), "(": (-160, 740), ")": (-160, 740), "/": (-120, 740), "+": (60, 520)}


def build(work, family, out_dir, specimen, picks_file=None):
    from build_font import make_font
    samples = pickle.load(open(os.path.join(work, "samples.pkl"), "rb"))
    chosen = {}
    if picks_file:                       # hand-picked examples: {"a": [sample ids], ...}
        for ch, ids in json.load(open(picks_file)).items():
            chosen[ch] = [samples[i] for i in ids]
    else:                                # whole labelled groups
        labels = json.load(open(os.path.join(work, "labels.json")))
        for s in samples:
            ch = labels.get(str(s["cluster"]))
            if ch:
                chosen.setdefault(ch, []).append(s)
        for ch in chosen:
            chosen[ch] = sorted(chosen[ch], key=lambda s: s["dist"])[:3]
    items = []
    for ch, picks in sorted(chosen.items()):
        for v, s in enumerate(picks[:3]):
            from skimage.morphology import disk, skeletonize
            sk = skeletonize(ndimage.binary_closing(unpack(s), iterations=1))
            rows = np.nonzero(sk.any(1))[0]
            box = BOXES.get(ch) or (BOXES["CAP"] if ch.isupper() or ch.isdigit() else None)
            if box:                        # size by letter type instead of the guessed baseline
                bot, top = box
                upp = (top - bot) / max(1, rows.max() - rows.min())
                base_row = rows.max() + bot / upp
            else:
                upp, base_row = 450.0 / s["xh"], s["base"] - s["box"][1]
            r = max(1, int(round(PEN_UNITS / 2 / upp)))   # same pen width in font units for every letter
            pad = r + 2
            m = ndimage.binary_dilation(np.pad(sk, pad), structure=disk(r))
            base = base_row + pad
            items.append((ch, v, m, base, upp))
    for ch in ".,-'\";=*#%":
        if ch not in chosen:
            m, base, xh = synth(ch)
            items.append((ch, 0, m, base, 450.0 / xh))
    return make_font(items, family, out_dir, specimen, notes=[f"{len(chosen)} characters taken from the notes"])


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("step", choices=["extract", "build"])
    ap.add_argument("pages", nargs="*")
    ap.add_argument("--work", required=True)
    ap.add_argument("--name", default="Halsey Hand")
    ap.add_argument("--out", default="dist")
    ap.add_argument("--specimen", default="Where the rows end, near Halsey.")
    ap.add_argument("--picks", help="JSON of hand-picked sample ids per character")
    a = ap.parse_args()
    if a.step == "extract":
        extract(a.pages, a.work)
    else:
        build(a.work, a.name, a.out, a.specimen, a.picks)
