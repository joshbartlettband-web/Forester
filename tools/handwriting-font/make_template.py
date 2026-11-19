"""Make the handwriting template PDF.

    python3 make_template.py            # writes template.pdf next to this file

Open the PDF on the Kobo, write one character in each box with the stylus,
then export the PDF with its handwritten notes.
"""
import os
import sys

from reportlab.lib.colors import Color
from reportlab.pdfgen import canvas

sys.path.insert(0, os.path.dirname(__file__))
import layout as L  # noqa: E402

GUIDE = Color(0.62, 0.76, 0.92)      # light blue: the builder ignores it
BORDER = Color(0.80, 0.80, 0.80)
LABEL = Color(0.70, 0.70, 0.70)
VARIANT_NOTE = {0: "", 1: "again", 2: "once more"}


def y(top):
    """reportlab measures from the bottom; the layout measures from the top."""
    return L.PAGE_H - top


def draw_page(c, page_cells, n, total):
    c.setFillColor(Color(0, 0, 0))
    for fx, fy in L.fiducials():
        c.rect(fx - L.FID / 2, y(fy) - L.FID / 2, L.FID, L.FID, stroke=0, fill=1)

    c.setFillColor(Color(0.25, 0.25, 0.25))
    c.setFont("Helvetica-Bold", 11)
    c.drawString(L.MARGIN + L.FID + 8, y(L.MARGIN + 10), "Halsey handwriting")
    c.setFont("Helvetica", 7.5)
    c.drawString(L.MARGIN + L.FID + 8, y(L.MARGIN + 22),
                 "Black pen, medium width. One character per box, sitting on the solid blue line.")
    c.drawString(L.MARGIN + L.FID + 8, y(L.MARGIN + 32),
                 "Write repeats naturally, not as copies. Small letters reach the dotted line; tall ones and capitals the top line.")
    c.drawRightString(L.PAGE_W - L.MARGIN - L.FID - 8, y(L.MARGIN + 10), f"page {n} of {total}")

    for i, (ch, v) in enumerate(page_cells):
        x0, t0, cw, chh = L.cell_rect(i)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.6)
        c.rect(x0, y(t0 + chh), cw, chh, stroke=1, fill=0)
        c.setStrokeColor(GUIDE)
        for frac, dash, wdt in [(L.ASCENDER, (1, 2), 0.5), (L.XHEIGHT, (2, 2), 0.6),
                                (L.BASELINE, None, 0.9), (L.DESCENDER, (1, 2), 0.5)]:
            c.setLineWidth(wdt)
            c.setDash(*dash) if dash else c.setDash()
            yy = y(t0 + chh * frac)
            c.line(x0 + 4, yy, x0 + cw - 4, yy)
        c.setDash()
        c.setFillColor(LABEL)
        c.setFont("Helvetica", 8)
        label = {" ": "space", '"': '" (double quote)', "'": "' (apostrophe)"}.get(ch, ch)
        c.drawString(x0 + 3, y(t0 + 9), label)
        if VARIANT_NOTE[v]:
            c.setFont("Helvetica-Oblique", 5.5)
            c.drawRightString(x0 + cw - 3, y(t0 + 8), VARIANT_NOTE[v])
    c.showPage()


def main(out=None):
    out = out or os.path.join(os.path.dirname(os.path.abspath(__file__)), "template.pdf")
    pgs = L.pages()
    c = canvas.Canvas(out, pagesize=(L.PAGE_W, L.PAGE_H))
    c.setTitle("Halsey handwriting template")
    for n, pc in enumerate(pgs, 1):
        draw_page(c, pc, n, len(pgs))
    c.save()
    print(f"wrote {out} ({len(pgs)} pages, {len(L.cells())} boxes)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
