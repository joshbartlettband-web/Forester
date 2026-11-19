"""Shared layout for the Halsey handwriting template.

Both the template generator and the font builder import this file, so a cell
on the printed page and a cell the builder reads are always the same box.
All measurements are in PDF points (1/72 inch).
"""

PAGE_W, PAGE_H = 432.0, 576.0          # 6 x 8 in, a 3:4 page that fits Kobo screens
MARGIN = 22.0
FID = 14.0                              # corner registration squares
HEADER = 46.0                           # space for the title and instructions
FOOTER = 26.0
COLS, ROWS = 5, 6

# Guide lines inside each cell, as a fraction of cell height from the top.
ASCENDER = 0.20     # tops of capitals and tall letters (b, d, h, k, l)
XHEIGHT = 0.44      # tops of small letters (a, c, e, m, n...)
BASELINE = 0.70     # every letter sits here
DESCENDER = 0.90    # tails of g, j, p, q, y

# Font units: baseline = 0, ascender line = 720, descender line = -240.
UNITS_ASC, UNITS_DESC = 720.0, -240.0

LOWER = "abcdefghijklmnopqrstuvwxyz"
UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
DIGITS = "0123456789"
PUNCT = ".,;:!?'\"-()&/@#$%*+="


def cells():
    """Every cell in writing order: (char, variant index)."""
    out = []
    for ch in LOWER:
        out += [(ch, v) for v in range(3)]
    for ch in UPPER:
        out += [(ch, v) for v in range(2)]
    for ch in DIGITS:
        out += [(ch, v) for v in range(2)]
    for ch in PUNCT:
        out.append((ch, 0))
    return out


PER_PAGE = COLS * ROWS


def pages():
    c = cells()
    return [c[i:i + PER_PAGE] for i in range(0, len(c), PER_PAGE)]


def grid_box():
    """The area that holds the cells: x0, y0 (top), width, height."""
    x0 = MARGIN
    y0 = MARGIN + HEADER
    w = PAGE_W - 2 * MARGIN
    h = PAGE_H - MARGIN - HEADER - FOOTER - MARGIN
    return x0, y0, w, h


def cell_rect(index):
    """Rectangle of the nth cell on a page, y measured from the top."""
    x0, y0, w, h = grid_box()
    cw, ch = w / COLS, h / ROWS
    r, c = divmod(index, COLS)
    return x0 + c * cw, y0 + r * ch, cw, ch


def fiducials():
    """Centers of the four corner squares, y from the top: TL, TR, BL, BR."""
    a = MARGIN - FID / 2 + FID / 2
    return [(a, a), (PAGE_W - a, a), (a, PAGE_H - a), (PAGE_W - a, PAGE_H - a)]
