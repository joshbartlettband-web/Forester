"""Draw Halsey's mechanic icons as hand-wobbled SVGs.

    python3 tools/make-icons.py      # writes art/icons/*.svg and art/icons/icons.json

Every icon is ink line work over one flat quilt color, printed a little off
register. Shapes live on a 48x48 grid. The wobble is seeded per icon, so the
same icon always comes out the same.
"""
import json
import math
import os
import random

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "art", "icons")
INK = "#1f1b2e"
PAINT = {"red": "#a8352c", "rust": "#c4622c", "sky": "#8fbad6", "green": "#6f9148", "gold": "#e0a83a",
         "plum": "#8a4e7a", "blue": "#4a79a5", "pink": "#e2486f", "yellow": "#f3c22f", "cream": "#efe6cf"}


class Pen:
    def __init__(self, seed):
        self.r = random.Random(seed)
        self.ink, self.fill = [], []

    def j(self, a=0.55):
        return (self.r.random() - 0.5) * 2 * a

    def path(self, pts, closed=False, step=4.0, amp=0.55):
        out = []
        seg = list(zip(pts, pts[1:] + ([pts[0]] if closed else [])))
        for (x1, y1), (x2, y2) in seg:
            n = max(1, int(math.hypot(x2 - x1, y2 - y1) / step))
            for i in range(n):
                t = i / n
                out.append((x1 + (x2 - x1) * t + self.j(amp), y1 + (y2 - y1) * t + self.j(amp)))
        out.append((pts[0] if closed else pts[-1]))
        d = f"M{out[0][0]:.1f} {out[0][1]:.1f}" + "".join(f" L{x:.1f} {y:.1f}" for x, y in out[1:])
        return d + (" Z" if closed else "")

    def line(self, *pts, closed=False):
        self.ink.append(self.path(list(pts), closed))

    def ellipse_pts(self, cx, cy, rx, ry, rot=0, a0=0, a1=360, n=28):
        pts = []
        for i in range(n + 1):
            a = math.radians(a0 + (a1 - a0) * i / n)
            x, y = rx * math.cos(a), ry * math.sin(a)
            c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
            pts.append((cx + x * c - y * s, cy + x * s + y * c))
        return pts

    def ellipse(self, cx, cy, rx, ry, rot=0, a0=0, a1=360, fill=None):
        pts = self.ellipse_pts(cx, cy, rx, ry, rot, a0, a1)
        amp = min(0.55, 0.06 * max(rx, ry))
        whole = a1 - a0 >= 360
        if fill:
            self.fill.append((self.path(pts[:-1] if whole else pts, closed=True, amp=0.3), fill))
        self.ink.append(self.path(pts[:-1] if whole else pts, closed=whole, step=3, amp=amp))

    def shape(self, pts, fill=None, ink=True):
        if fill:
            self.fill.append((self.path(pts, closed=True, amp=0.3), fill))
        if ink:
            self.ink.append(self.path(pts, closed=True))

    def svg(self, title):
        f = "".join(f'<path d="{d}" fill="{c}" stroke="none"/>' for d, c in self.fill)
        k = "".join(f'<path d="{d}"/>' for d in self.ink)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="{title}">'
                f'<title>{title}</title><g transform="translate(1.6 1.1)" opacity=".9" style="mix-blend-mode:multiply">{f}</g>'
                f'<g fill="none" stroke="{INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{k}</g></svg>')


def chain(p):
    p.ellipse(17, 26, 13, 8, -35, fill=PAINT["red"])
    p.ellipse(31, 22, 13, 8, -35, fill=PAINT["rust"])
    p.ellipse(17, 26, 13, 8, -35, 160, 230)  # redraw the front of the first ring over the second

def find(p):  # lantern
    p.ellipse(24, 8, 4, 3)
    p.shape([(16, 13), (32, 13), (30, 17), (18, 17)], fill=PAINT["gold"])
    p.shape([(17, 17), (31, 17), (31, 36), (17, 36)], fill=PAINT["sky"])
    p.line((24, 17), (24, 36))
    p.shape([(21, 31), (24, 23), (27, 31), (24, 33)], fill=PAINT["yellow"])
    p.shape([(15, 36), (33, 36), (33, 40), (15, 40)], fill=PAINT["gold"])

def risk(p):  # lit match
    p.shape([(9, 41), (12, 44), (31, 22), (28, 19)], fill=PAINT["cream"])
    p.ellipse(31, 18, 4.5, 5.5, 45, fill=PAINT["red"])
    p.shape([(31, 13), (26, 7), (30, 2), (33, 6), (37, 3), (39, 10), (35, 14)], fill=PAINT["gold"])

def spare(p):  # canning jar
    p.shape([(16, 8), (32, 8), (32, 13), (16, 13)], fill=PAINT["gold"])
    p.shape([(17, 13), (31, 13), (34, 18), (34, 38), (31, 41), (17, 41), (14, 38), (14, 18)], fill=PAINT["green"])
    for x, y in [(20, 30), (25, 34), (28, 28), (22, 36)]:
        p.ellipse(x, y, 1.6, 1.1)

def repeat(p):  # center pivot seen from above: a round field and its arm
    p.ellipse(24, 24, 17, 17, fill=PAINT["green"])
    p.ellipse(24, 24, 10, 10)
    p.line((24, 24), (40, 17))
    for t in (0.35, 0.65):
        x, y = 24 + 16 * t, 24 - 7 * t
        p.line((x, y), (x + 1, y + 3))
    p.ellipse(24, 24, 2, 2, fill=INK)

def thread(p):  # needle with a thread through its eye
    p.line((7, 42), (36, 9))
    p.ellipse(38, 7, 2.6, 4.2, 42, fill=PAINT["cream"])
    p.ink.append(p.path([(38, 7), (42, 13), (40, 22), (30, 26), (22, 33), (27, 40), (38, 39)], step=2.5, amp=.35))
    p.fill.append((p.path([(37, 9), (5, 44), (9, 44)], closed=True, amp=.3), PAINT["red"]))

def witnesses(p):  # two quote marks
    for dx, col in ((0, PAINT["blue"]), (17, PAINT["sky"])):
        p.ellipse(13 + dx, 20, 7, 7, fill=col)
        p.line((20 + dx, 21), (18 + dx, 32), (10 + dx, 38))

def era(p):  # a clock with no hands
    p.ellipse(24, 24, 17, 17, fill=PAINT["plum"])
    for i in range(4):
        a = math.radians(i * 90)
        p.line((24 + math.cos(a) * 10, 24 + math.sin(a) * 10), (24 + math.cos(a) * 14, 24 + math.sin(a) * 14))
    p.ellipse(24, 24, 1.8, 1.8, fill=INK)

def trust(p):  # coffee cup
    p.shape([(12, 22), (32, 22), (30, 38), (14, 38)], fill=PAINT["pink"])
    p.ellipse(34, 28, 4.5, 5, 0, -90, 90)
    p.line((9, 41), (37, 41))
    for x in (17, 23):
        p.line((x, 18), (x + 2, 14), (x, 10), (x + 2, 6))

def detail(p):  # pencil
    p.shape([(30, 7), (39, 16), (17, 38), (8, 29)], fill=PAINT["yellow"])
    p.line((8, 29), (5, 41), (17, 38))
    p.line((26, 11), (35, 20))
    p.shape([(5.5, 38.5), (5, 41), (7.5, 40.5)], fill=INK)

def vivid(p):  # star
    pts = []
    for i in range(10):
        a = math.radians(-90 + i * 36)
        r = 17 if i % 2 == 0 else 7.5
        pts.append((24 + math.cos(a) * r, 25 + math.sin(a) * r))
    p.shape(pts, fill=PAINT["yellow"])

def story(p):  # folded note
    p.shape([(10, 8), (32, 8), (38, 14), (38, 41), (10, 41)], fill=PAINT["cream"])
    p.line((32, 8), (32, 14), (38, 14))
    for y in (20, 26, 32):
        p.line((15, y), (32 if y < 30 else 26, y))

def filing(p):  # rubber stamp
    p.ellipse(24, 9, 5, 4.5, fill=PAINT["pink"])
    p.line((24, 13), (24, 22))
    p.shape([(14, 22), (34, 22), (34, 28), (14, 28)], fill=PAINT["pink"])
    p.shape([(11, 28), (37, 28), (37, 32), (11, 32)])
    p.line((10, 40), (38, 40))

def sign(p):  # pen nib on a signature line
    p.shape([(30, 6), (38, 14), (24, 30), (18, 30), (18, 24)], fill=PAINT["blue"])
    p.line((18, 30), (13, 35))
    p.ellipse(29, 17, 1.8, 1.8)
    p.line((6, 42), (12, 37), (16, 42), (21, 38), (25, 42), (42, 41))

def holdout(p):  # a shut gate
    p.line((8, 10), (8, 42))
    p.line((40, 10), (40, 42))
    p.shape([(12, 16), (36, 16), (36, 36), (12, 36)], fill=PAINT["gold"])
    p.line((12, 26), (36, 26))
    p.line((12, 36), (36, 16))

def drift(p):  # feather
    p.shape([(36, 6), (40, 12), (30, 30), (16, 38), (20, 24)], fill=PAINT["plum"])
    p.line((38, 8), (10, 42))
    for t in (0.3, 0.5, 0.7):
        x, y = 38 - 28 * t, 8 + 34 * t
        p.line((x, y), (x + 5, y + 1))

def keepsake(p):  # a pinwheel quilt block
    p.shape([(8, 8), (40, 8), (40, 40), (8, 40)], fill=PAINT["cream"])
    for tri in ([(24, 24), (8, 8), (24, 8)], [(24, 24), (40, 8), (40, 24)],
                [(24, 24), (40, 40), (24, 40)], [(24, 24), (8, 40), (8, 24)]):
        p.shape(tri, fill=PAINT["red"])
    p.line((24, 8), (24, 40))
    p.line((8, 24), (40, 24))

def place(p):  # a surveyed section with a dot
    p.shape([(8, 8), (40, 8), (40, 40), (8, 40)], fill=PAINT["green"])
    p.line((24, 8), (24, 40))
    p.line((8, 24), (40, 24))
    p.ellipse(31, 17, 2.6, 2.6, fill=INK)

def ties(p):  # two people, linked
    for cx, col in ((14, PAINT["sky"]), (34, PAINT["pink"])):
        p.ellipse(cx, 15, 5, 5, fill=col)
        p.line((cx - 7, 38), (cx - 5, 26), (cx + 5, 26), (cx + 7, 38))
    p.ellipse(24, 30, 6, 4, 0, 0, 180)

ICONS = {
    "chain": (chain, "Chain", "event", "Doing the same kind of thing again, right away"),
    "find": (find, "Find", "event", "Turning up something hidden"),
    "risk": (risk, "Risk", "event", "Pushing when it could go wrong"),
    "spare": (spare, "Spare", "event", "Holding back: unused turns, looks, patience"),
    "repeat": (repeat, "Repeat", "event", "Coming back around to the same thing"),
    "thread": (thread, "Thread", "hand", "Stories linked by people who know each other"),
    "witnesses": (witnesses, "Witnesses", "hand", "Stories on the same theme"),
    "era": (era, "Era", "hand", "When a place is kept; the clock stopped there"),
    "place": (place, "Place", "hand", "Where a story happened (a surveyed section)"),
    "ties": (ties, "Ties", "people", "People you know, and who knows them"),
    "trust": (trust, "Trust", "listening", "How willing someone is to keep talking"),
    "detail": (detail, "Detail", "listening", "What you've managed to write down"),
    "vivid": (vivid, "Vivid", "story", "How well a story is told (adds Mult)"),
    "story": (story, "Story", "story", "A story card: what someone agreed to tell"),
    "drift": (drift, "Drift", "story", "Embellishment: a better story than what happened"),
    "filing": (filing, "Filing", "courthouse", "Filing testimony at a Register of Deeds"),
    "sign": (sign, "Sign", "agreement", "Accepting the agreement at the river"),
    "holdout": (holdout, "Holdout", "agreement", "Living outside the agreement"),
    "keepsake": (keepsake, "Keepsake", "modifier", "A barn quilt that changes the rules"),
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    meta = {}
    for i, (name, (fn, title, group, meaning)) in enumerate(ICONS.items()):
        p = Pen(1000 + i)
        fn(p)
        with open(os.path.join(OUT, name + ".svg"), "w") as f:
            f.write(p.svg(title))
        meta[name] = {"title": title, "group": group, "meaning": meaning}
    with open(os.path.join(OUT, "icons.json"), "w") as f:
        json.dump(meta, f, indent=1)
    print(len(meta), "icons ->", OUT)
