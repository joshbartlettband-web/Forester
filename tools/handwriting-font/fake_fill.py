"""Test helper: fill the template with fake handwriting so the builder can be
checked without a real Kobo export.

    python3 fake_fill.py template.pdf filled-test.pdf [path/to/font.ttf]
"""
import os
import random
import sys

import pymupdf
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
import layout as L  # noqa: E402

src, dst = sys.argv[1], sys.argv[2]
font_path = sys.argv[3] if len(sys.argv) > 3 else "/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf"
DPI, S = 200, 200 / 72
rnd = random.Random(7)
out = []
for pi, (page, cells) in enumerate(zip(pymupdf.open(src), L.pages())):
    pix = page.get_pixmap(dpi=DPI)
    im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    for ci, (ch, v) in enumerate(cells):
        x0, t0, cw, chh = L.cell_rect(ci)
        size = int((L.BASELINE - L.ASCENDER) * chh * S * 1.25 * rnd.uniform(.9, 1.08))
        f = ImageFont.truetype(font_path, size)
        g = Image.new("L", (size * 2, size * 2), 0)  # baseline sits at 1.3 x size
        ImageDraw.Draw(g).text((size // 2, int(size * 1.3)), ch, font=f, fill=255, anchor="ls")
        g = g.rotate(rnd.uniform(-6, 6), resample=Image.BICUBIC, center=(size // 2, int(size * 1.3)))
        bx = int((x0 + cw * rnd.uniform(.32, .42)) * S) - size // 2
        by = int((t0 + chh * L.BASELINE) * S + rnd.uniform(-2, 2)) - int(size * 1.3)
        ink = Image.new("RGB", g.size, (20, 20, 20))
        im.paste(ink, (bx, by), g)
    out.append(im)
out[0].save(dst, save_all=True, append_images=out[1:], resolution=DPI)
print("wrote", dst)
