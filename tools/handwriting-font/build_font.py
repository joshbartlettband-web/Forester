"""Build a font from a filled-in handwriting template.

    python3 build_font.py FILLED.pdf [--name "Halsey Hand"] [--out dist]

FILLED can be the exported PDF, a folder of page images, a .zip of page
images (Kobo cloud exports sometimes arrive this way), or several of these.
Pages must be in template order.

Output: an .otf and a .woff2 font, a specimen image, and report.txt, which
lists any boxes that were empty or that look wrong.
"""
import argparse
import io
import os
import sys
import zipfile

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
import layout as L  # noqa: E402

DPI = 300
SCALE = DPI / 72.0


# ---------------------------------------------------------------- input pages
def load_pages(paths):
    imgs = []
    for p in paths:
        if os.path.isdir(p):
            imgs += [Image.open(os.path.join(p, f)) for f in sorted(os.listdir(p))
                     if f.lower().endswith((".png", ".jpg", ".jpeg"))]
        elif p.lower().endswith(".zip"):
            with zipfile.ZipFile(p) as z:
                for n in sorted(z.namelist()):
                    if n.lower().endswith((".png", ".jpg", ".jpeg")):
                        imgs.append(Image.open(io.BytesIO(z.read(n))))
        elif p.lower().endswith(".pdf"):
            import pymupdf
            doc = pymupdf.open(p)
            for page in doc:
                pix = page.get_pixmap(dpi=DPI)
                imgs.append(Image.frombytes("RGB", (pix.width, pix.height), pix.samples))
        else:
            imgs.append(Image.open(p))
    return [im.convert("RGB") for im in imgs]


# ------------------------------------------------------- page registration
def find_fiducials(gray):
    """Find the four black corner squares. Returns template->image affine or None."""
    small = gray[::4, ::4]
    dark = small < 80
    h, w = dark.shape
    seen = np.zeros_like(dark, bool)
    blobs = []
    for sy, sx in zip(*np.nonzero(dark)):
        if seen[sy, sx]:
            continue
        stack, pts = [(sy, sx)], []
        seen[sy, sx] = True
        while stack:
            y, x = stack.pop()
            pts.append((y, x))
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= ny < h and 0 <= nx < w and dark[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    stack.append((ny, nx))
            if len(pts) > 20000:
                break
        ys, xs = zip(*pts)
        bh, bw = max(ys) - min(ys) + 1, max(xs) - min(xs) + 1
        fill = len(pts) / (bh * bw)
        if bh > 3 and bw > 3 and 0.7 < bh / bw < 1.4 and fill > 0.8:
            blobs.append(((min(xs) + max(xs)) / 2 * 4, (min(ys) + max(ys)) / 2 * 4, bw * 4))
    if len(blobs) < 4:
        return None
    H, W = gray.shape
    corners = [(0, 0), (W, 0), (0, H), (W, H)]
    chosen = []
    for cx, cy in corners:
        b = min(blobs, key=lambda b: (b[0] - cx) ** 2 + (b[1] - cy) ** 2)
        chosen.append(b[:2])
    src = np.array([[x, y, 1] for x, y in L.fiducials()])
    dst = np.array(chosen)
    A, *_ = np.linalg.lstsq(src, dst, rcond=None)   # 3x2
    return A


def mapper(gray):
    A = find_fiducials(gray)
    if A is None:
        H, W = gray.shape
        sx, sy = W / L.PAGE_W, H / L.PAGE_H
        return lambda x, y: (x * sx, y * sy), "no corner squares found; assuming the image is the whole page"
    return lambda x, y: tuple(np.array([x, y, 1.0]) @ A), None


# ---------------------------------------------------------------- tracing
def ink_mask(rgb):
    a = rgb.astype(np.float32) / 255
    lum = a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11
    sat = a.max(-1) - a.min(-1)
    guide_blue = (a[..., 2] - a[..., 0] > .12) & (lum > .55)
    return ((lum < .5) | ((sat > .35) & (lum < .7))) & ~guide_blue


def trace(mask):
    import potrace
    bm = potrace.Bitmap(~mask)   # potracer treats dark (False) pixels as ink
    return bm.trace(turdsize=12, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                    alphamax=1.0, opticurve=True, opttolerance=0.25)


def cell_glyph(img, gray, m, index):
    """Crop one cell, return (mask, px->unit info) or None when the box is empty."""
    x0, t0, cw, chh = L.cell_rect(index)
    inset = 0.06
    (ax, ay), (bx, by) = m(x0 + cw * inset, t0 + chh * 0.04), m(x0 + cw * (1 - inset), t0 + chh * (1 - inset * .6))
    ax, ay, bx, by = int(ax), int(ay), int(bx), int(by)
    crop = np.asarray(img)[ay:by, ax:bx]
    mask = ink_mask(crop)
    if mask.sum() < 40:
        return None
    _, base_y = m(x0, t0 + chh * L.BASELINE)
    _, asc_y = m(x0, t0 + chh * L.ASCENDER)
    _, desc_y = m(x0, t0 + chh * L.DESCENDER)
    upp = (L.UNITS_ASC - L.UNITS_DESC) / (desc_y - asc_y)
    return mask, base_y - ay, upp


def outline_to_pen(plist, pen, base_px, upp, left_px, lsb):
    def P(pt):
        x, y = (pt.x, pt.y) if hasattr(pt, "x") else pt
        return ((x - left_px) * upp + lsb, (base_px - y) * upp)
    for curve in plist:
        pen.moveTo(P(curve.start_point))
        for seg in curve.segments:
            if seg.is_corner:
                pen.lineTo(P(seg.c))
                pen.lineTo(P(seg.end_point))
            else:
                pen.curveTo(P(seg.c1), P(seg.c2), P(seg.end_point))
        pen.closePath()


# ---------------------------------------------------------------- font
def glyph_name(ch):
    from fontTools.agl import UV2AGL
    return UV2AGL.get(ord(ch), "uni%04X" % ord(ch))


def build(paths, family, out_dir, specimen_text):
    from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
    from fontTools.fontBuilder import FontBuilder
    from fontTools.pens.t2CharStringPen import T2CharStringPen
    from fontTools.ttLib import TTFont

    pages = load_pages(paths)
    expected = L.pages()
    notes = []
    if len(pages) != len(expected):
        notes.append(f"Found {len(pages)} pages; the template has {len(expected)}. Missing pages leave their characters out.")
    LSB = RSB = 45
    glyphs = {}          # name -> (charstring, advance)
    variants = {}        # char -> list of glyph names in variant order
    for pi, page_cells in enumerate(expected):
        if pi >= len(pages):
            break
        img = pages[pi]
        gray = np.asarray(img.convert("L"))
        m, warn = mapper(gray)
        if warn:
            notes.append(f"page {pi + 1}: {warn}")
        for ci, (ch, v) in enumerate(page_cells):
            got = cell_glyph(img, gray, m, ci)
            if got is None:
                notes.append(f"page {pi + 1}: box for '{ch}' (try {v + 1}) is empty")
                continue
            mask, base_px, upp = got
            cols = np.nonzero(mask.any(0))[0]
            left, right = cols.min(), cols.max()
            plist = trace(mask)
            width = round((right - left) * upp + LSB + RSB)
            name = glyph_name(ch) + ("" if v == 0 else f".alt{v}")
            pen = T2CharStringPen(width, None)
            outline_to_pen(plist, pen, base_px, upp, left, LSB)
            glyphs[name] = (pen.getCharString(), width)
            variants.setdefault(ch, []).append(name)
            rows = np.nonzero(mask.any(1))[0]
            top_u, bot_u = (base_px - rows.min()) * upp, (base_px - rows.max()) * upp
            if top_u > 1000 or bot_u < -420:
                notes.append(f"page {pi + 1}: '{ch}' (try {v + 1}) runs far outside its guide lines")

    # Every character needs a default glyph; promote the first variant found.
    for ch, names in variants.items():
        base = glyph_name(ch)
        if base not in glyphs:
            glyphs[base] = glyphs[names[0]]
    space_w = 270
    order = [".notdef", "space"] + sorted(glyphs)
    pen = T2CharStringPen(500, None)
    pen.moveTo((60, 0)); pen.lineTo((440, 0)); pen.lineTo((440, 700)); pen.lineTo((60, 700)); pen.closePath()
    pen.moveTo((110, 50)); pen.lineTo((110, 650)); pen.lineTo((390, 650)); pen.lineTo((390, 50)); pen.closePath()
    charstrings = {".notdef": pen.getCharString()}
    sp = T2CharStringPen(space_w, None)
    charstrings["space"] = sp.getCharString()
    metrics = {".notdef": (500, 60), "space": (space_w, 0)}
    for n, (cs, w) in glyphs.items():
        charstrings[n] = cs
        metrics[n] = (w, LSB)
    cmap = {32: "space"}
    for ch in variants:
        cmap[ord(ch)] = glyph_name(ch)
    cmap[0x2019] = cmap.get(ord("'"))        # curly apostrophe falls back to the straight one
    cmap = {k: v for k, v in cmap.items() if v}

    ps = family.replace(" ", "")
    fb = FontBuilder(1000, isTTF=False)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupCFF(ps + "-Regular", {"FullName": family, "FamilyName": family, "Weight": "Regular"}, charstrings, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=860, descent=-300)
    fb.setupNameTable({"familyName": family, "styleName": "Regular", "uniqueFontIdentifier": ps + "-Regular",
                       "fullName": family, "psName": ps + "-Regular", "version": "Version 1.0",
                       "copyright": "Handwriting by its owner. All rights reserved."})
    fb.setupOS2(sTypoAscender=860, sTypoDescender=-300, sTypoLineGap=120, usWinAscent=960, usWinDescent=360,
                sxHeight=round((L.BASELINE - L.XHEIGHT) / (L.DESCENDER - L.ASCENDER) * (L.UNITS_ASC - L.UNITS_DESC)),
                sCapHeight=int(L.UNITS_ASC), achVendID="HLSY")
    fb.setupPost()

    # Cycle through the variants so repeated letters never look stamped.
    l1 = [glyph_name(c) for c in L.LOWER if glyph_name(c) + ".alt1" in glyphs and glyph_name(c) + ".alt2" in glyphs]
    u1 = [glyph_name(c) for c in L.UPPER + L.DIGITS if glyph_name(c) + ".alt1" in glyphs]
    fea = ""
    if l1 or u1:
        cls = lambda names, suf="": "[" + " ".join(n + suf for n in names) + "]"
        alt1 = cls(l1, ".alt1")[:-1] + " " + cls(u1, ".alt1")[1:] if l1 and u1 else (cls(l1, ".alt1") if l1 else cls(u1, ".alt1"))
        D = "[" + " ".join(l1 + u1) + "]"
        rules = []
        if l1:
            rules += [f"ignore sub {cls(l1, '.alt2')} {cls(l1)}';", f"sub {alt1} {cls(l1)}' by {cls(l1, '.alt2')};",
                      f"sub {D} {cls(l1)}' by {cls(l1, '.alt1')};"]
        if u1:
            ign = alt1 if not l1 else alt1[:-1] + " " + cls(l1, '.alt2')[1:]
            rules += [f"ignore sub {ign} {cls(u1)}';", f"sub {D} {cls(u1)}' by {cls(u1, '.alt1')};"]
        fea = "lookup cycle {\n  " + "\n  ".join(rules) + "\n} cycle;\nfeature calt { lookup cycle; } calt;\n"
        addOpenTypeFeaturesFromString(fb.font, fea)

    os.makedirs(out_dir, exist_ok=True)
    otf = os.path.join(out_dir, ps + ".otf")
    fb.save(otf)
    f2 = TTFont(otf)
    f2.flavor = "woff2"
    f2.save(os.path.join(out_dir, ps + ".woff2"))

    # Specimen
    font = ImageFont.truetype(otf, 64)
    small = ImageFont.truetype(otf, 34)
    lines = [family, specimen_text, L.LOWER, L.UPPER, L.DIGITS + "  " + L.PUNCT, "the rows still run straight. tell me what you see."]
    im = Image.new("RGB", (1800, 120 + 110 * len(lines)), (245, 240, 228))
    d = ImageDraw.Draw(im)
    yy = 40
    for i, t in enumerate(lines):
        d.text((50, yy), t, font=font if i in (0, 1, 5) else small, fill=(30, 26, 22), features=["calt"] if i else None)
        yy += 110
    im.save(os.path.join(out_dir, "specimen.png"))
    found = sum(len(v) for v in variants.values())
    with open(os.path.join(out_dir, "report.txt"), "w") as fh:
        fh.write(f"{family}: {found} of {len(L.cells())} boxes traced, {len(variants)} characters.\n")
        fh.write("\n".join(notes) + ("\n" if notes else "No problems found.\n"))
    print(open(os.path.join(out_dir, "report.txt")).read())
    return otf


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("inputs", nargs="+")
    ap.add_argument("--name", default="Halsey Hand")
    ap.add_argument("--out", default="dist")
    ap.add_argument("--specimen", default="Where the rows end, near Halsey.")
    a = ap.parse_args()
    build(a.inputs, a.name, a.out, a.specimen)
