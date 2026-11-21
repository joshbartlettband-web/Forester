/* Halsey drawing engine for the collisions: code-drawn paper and print, your drawings as ink,
   cut-out objects and creatures, the live aurora sky, flocks and lamp moths.
   Shared by collision.html and guide.html. Exposes window.HE. */
"use strict";
window.HE = (() => {
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const R = (a = 0, b = 1) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
const rng = seed => { let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PAPER = '#f1ebdc';
const INK = { pink: '#e2486f', blue: '#3a78c3', yellow: '#f3c22f', green: '#6f9148', rust: '#c4622c', ink: '#1f1b2e', plum: '#8a4e7a' };
const EVENTS = { Find: 'yellow', Chain: 'pink', Risk: 'rust', Spare: 'green', Repeat: 'blue' };

/* ---------- loading ---------- */
const cache = {};
const load = src => cache[src] || (cache[src] = new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('missing ' + src)); i.src = src; }));
const tryLoad = src => load(src).catch(() => null);
const inked = {};
/* a notebook drawing (white paper, dark lines) as ink of any color on transparent */
async function sketch(src, color = INK.ink) {
  const key = src + color; if (inked[key]) return inked[key];
  const im = await load(src.includes('/') ? src : 'sketches/' + src + '.png'), c = mk(im.width, im.height), x = c.getContext('2d'); x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data, [r, g, b] = hex(color);
  for (let i = 0; i < p.length; i += 4) { const a = 255 - (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11); p[i] = r; p[i + 1] = g; p[i + 2] = b; p[i + 3] = a < 14 ? 0 : Math.min(255, a * 1.15); }
  x.putImageData(d, 0, 0); return inked[key] = c;
}
function cover(im, w, h, fx = .5, fy = .5, zoom = 1) {
  const c = mk(w, h), x = c.getContext('2d'), s = Math.max(w / im.width, h / im.height) * zoom;
  x.drawImage(im, (w - im.width * s) * fx, (h - im.height * s) * fy, im.width * s, im.height * s); return c;
}
function contain(im, w, h, paper) {
  const c = mk(w, h), x = c.getContext('2d'), s = Math.min(w / im.width, h / im.height) * .94, iw = im.width * s, ih = im.height * s;
  x.drawImage(paper, 0, 0); x.save(); x.shadowColor = 'rgba(31,27,46,.35)'; x.shadowBlur = 14; x.shadowOffsetY = 5; x.drawImage(im, (w - iw) / 2, (h - ih) / 2, iw, ih); x.restore(); return c;
}

/* ---------- code: paper, separation, duotone ---------- */
function makePaper(w, h, seed) {
  const c = mk(w, h), x = c.getContext('2d'), r = rng(seed); x.fillStyle = PAPER; x.fillRect(0, 0, w, h);
  const id = x.getImageData(0, 0, w, h), p = id.data; for (let i = 0; i < p.length; i += 4) { const n = (r() - .5) * 16; p[i] += n; p[i + 1] += n; p[i + 2] += n * 1.15; } x.putImageData(id, 0, 0);
  x.lineWidth = 1; for (let i = 0; i < w * h / 1800; i++) { x.strokeStyle = `rgba(${r() < .5 ? '120,96,70' : '255,255,255'},${.05 + r() * .08})`; const a = r() * w, b = r() * h; x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + r() * 24 - 12, b + r() * 24 - 12, a + r() * 36 - 18, b + r() * 36 - 18); x.stroke(); }
  return c;
}
function specks(w, h, seed) { const c = mk(w, h), x = c.getContext('2d'), r = rng(seed); x.fillStyle = PAPER; for (let i = 0; i < w * h / 90; i++) { x.globalAlpha = .25 + r() * .6; x.fillRect(r() * w, r() * h, r() * 1.8 + .4, r() * 1.8 + .4); } return c; }
/* four-plate overprint halftone with loose registration. night: lifts the key plate so dark scenes stay open */
function separate(src, paper, seed, night = false) {
  const w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data, out = mk(w, h), o = out.getContext('2d'), r = rng(seed);
  o.drawImage(paper, 0, 0); const cell = Math.max(4, Math.round(w / 165)), diag = Math.hypot(w, h) / 2 + cell;
  const kc = night ? .5 : .34, plates = [['yellow', 0], ['blue', 15], ['pink', 75], ['ink', 45]];
  for (const [ink, ang] of plates) {
    const a = ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), L = mk(w, h), l = L.getContext('2d'); l.fillStyle = night && ink === 'ink' ? '#2a1f45' : INK[ink]; l.beginPath();
    for (let v = -diag; v < diag; v += cell) for (let u = -diag; u < diag; u += cell) {
      const x = w / 2 + u * ca - v * sa, y = h / 2 + u * sa + v * ca; if (x < -cell || y < -cell || x > w + cell || y > h + cell) continue;
      const i = (Math.min(h - 1, Math.max(0, y | 0)) * w + Math.min(w - 1, Math.max(0, x | 0))) * 4, c = 1 - d[i] / 255, m = 1 - d[i + 1] / 255, yy = 1 - d[i + 2] / 255, k = Math.min(c, m, yy);
      let val = ink === 'blue' ? c - k * .7 : ink === 'pink' ? m - k * .78 : ink === 'yellow' ? yy - k * .6 : (k - kc) * 1.5;
      val = Math.min(1, val * (ink === 'ink' ? 1 : .95)); if (val < .05) continue; const rad = cell * .66 * Math.sqrt(val); l.moveTo(x + rad, y); l.arc(x, y, rad, 0, 6.2832);
    }
    l.fill(); o.globalCompositeOperation = 'multiply'; o.globalAlpha = ink === 'ink' ? .8 : .88; o.drawImage(L, (r() - .5) * 5, (r() - .5) * 4);
  }
  o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; o.drawImage(specks(w, h, seed + 7), 0, 0); return out;
}
/* night: light inks screen-printed on dark stock, so the land glows a little under the aurora */
function separateNight(src, seed) {
  const w = src.width, h = src.height, d = src.getContext('2d').getImageData(0, 0, w, h).data, out = mk(w, h), o = out.getContext('2d'), r = rng(seed);
  o.fillStyle = '#1d1830'; o.fillRect(0, 0, w, h);
  const id = o.getImageData(0, 0, w, h), p = id.data; for (let i = 0; i < p.length; i += 4) { const n = (r() - .5) * 10; p[i] += n; p[i + 1] += n; p[i + 2] += n * 1.2; } o.putImageData(id, 0, 0);
  const cell = Math.max(4, Math.round(w / 165)), diag = Math.hypot(w, h) / 2 + cell;
  const plates = [['#efe2c4', 45, (R, G, B) => Math.pow((R * .3 + G * .59 + B * .11) / 255, .85) * 1.35],
                  ['#e2486f', 75, (R, G, B) => Math.max(0, R - G) / 255 * 2.4 + (R / 255) * .25],
                  ['#7fe3b5', 15, (R, G, B) => Math.max(0, G - R) / 255 * 3 + (G / 255) * .18]];
  o.globalCompositeOperation = 'screen';
  for (const [col, ang, f] of plates) {
    const a = ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), L = mk(w, h), l = L.getContext('2d'); l.fillStyle = col; l.beginPath();
    for (let v = -diag; v < diag; v += cell) for (let u = -diag; u < diag; u += cell) {
      const x = w / 2 + u * ca - v * sa, y = h / 2 + u * sa + v * ca; if (x < -cell || y < -cell || x > w + cell || y > h + cell) continue;
      const i = (Math.min(h - 1, Math.max(0, y | 0)) * w + Math.min(w - 1, Math.max(0, x | 0))) * 4, val = Math.min(1, f(d[i], d[i + 1], d[i + 2]));
      if (val < .06) continue; const rad = cell * .62 * Math.sqrt(val); l.moveTo(x + rad, y); l.arc(x, y, rad, 0, 6.2832);
    }
    l.fill(); o.globalAlpha = .9; o.drawImage(L, (r() - .5) * 5, (r() - .5) * 4); o.globalAlpha = 1;
  }
  o.globalCompositeOperation = 'source-over'; return out;
}
/* print a cut-out (creature, object) on transparent: halftone of it over paper, trimmed back to its own shape */
function printCutout(im, seed, night) {
  const w = im.width, h = im.height, flat = mk(w, h), f = flat.getContext('2d');
  f.fillStyle = PAPER; f.fillRect(0, 0, w, h); f.drawImage(im, 0, 0);
  if (night) { f.fillStyle = '#000'; f.fillRect(0, 0, w, h); f.drawImage(im, 0, 0); }
  const pr = night ? separateNight(flat, seed) : separate(flat, makePaper(w, h, seed), seed), x = pr.getContext('2d');
  x.globalCompositeOperation = 'destination-in'; x.drawImage(im, 0, 0); return pr;
}
function duotone(src, inkHex, paperHex = PAPER) {
  const w = src.width, h = src.height, c = mk(w, h), x = c.getContext('2d'); x.drawImage(src, 0, 0);
  const id = x.getImageData(0, 0, w, h), p = id.data, [ir, ig, ib] = hex(inkHex), [pr, pg, pb] = hex(paperHex), K = hex(INK.ink);
  for (let i = 0; i < p.length; i += 4) {
    const t = 1 - (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11) / 255, u = Math.min(1, t * 1.5), deep = Math.max(0, t - .62) * 1.6;
    p[i] = pr + (ir - pr) * u + (K[0] - ir) * deep; p[i + 1] = pg + (ig - pg) * u + (K[1] - ig) * deep; p[i + 2] = pb + (ib - pb) * u + (K[2] - ib) * deep;
  }
  x.putImageData(id, 0, 0); return c;
}
function torn(w, h, seed) {
  const r = rng(seed), pts = [], e = 6, side = (x0, y0, x1, y1, n) => { for (let i = 0; i < n; i++) { const t = i / n; pts.push([x0 + (x1 - x0) * t + (r() - .5) * e, y0 + (y1 - y0) * t + (r() - .5) * e]); } };
  side(e, e, w - e, e, 14); side(w - e, e, w - e, h - e, 10); side(w - e, h - e, e, h - e, 14); side(e, h - e, e, e, 10); return pts;
}
function soft(c, x, y, r, a = 1, rgb = '255,255,255') {
  const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(.6, `rgba(${rgb},${a * .7})`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
}

/* ---------- your arches, stood into a photograph (cast shadow, contact shadow; dimmed at night) ---------- */
const objMeta = fetch('objects/objects.json').then(r => r.json()).catch(() => ({}));
const OBJ = {};
async function archOf(k) { if (OBJ[k]) return OBJ[k]; const [im, op, meta] = await Promise.all([load('objects/' + k + '.png'), load('objects/' + k + '-opening.png'), objMeta]); return OBJ[k] = { im, op, o: (meta[k] || { opening: [.5, .7, .4] }).opening }; }
function bakeArch(photo, A, a, night) {
  const W = photo.width, H = photo.height, x = photo.getContext('2d'), h = a.h * H, w = h * A.im.width / A.im.height, left = a.cx * W - w / 2, top = a.ground * H - h;
  const sil = mk(A.im.width, A.im.height), s = sil.getContext('2d'); s.drawImage(A.im, 0, 0); s.globalCompositeOperation = 'source-in'; s.fillStyle = INK.ink; s.fillRect(0, 0, sil.width, sil.height);
  if (!night) { x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = .34; x.filter = 'blur(3px)'; x.translate(a.cx * W, a.ground * H); x.transform(1, 0, a.cx > .5 ? -.9 : .9, -.2, 0, 0); x.drawImage(sil, -w / 2, -h, w, h); x.restore(); }
  x.save(); const g = x.createRadialGradient(a.cx * W, a.ground * H, 2, a.cx * W, a.ground * H, w * .6); g.addColorStop(0, 'rgba(31,27,46,.45)'); g.addColorStop(1, 'rgba(31,27,46,0)');
  x.globalCompositeOperation = 'multiply'; x.fillStyle = g; x.beginPath(); x.ellipse(a.cx * W, a.ground * H, w * .6, h * .05, 0, 0, 6.2832); x.fill(); x.restore();
  if (night) { const t = mk(A.im.width, A.im.height), tx = t.getContext('2d'); tx.drawImage(A.im, 0, 0); tx.globalCompositeOperation = 'multiply'; tx.fillStyle = '#5a4274'; tx.fillRect(0, 0, t.width, t.height); tx.globalCompositeOperation = 'destination-in'; tx.drawImage(A.im, 0, 0); x.drawImage(t, left, top, w, h); }
  else x.drawImage(A.im, left, top, w, h);
  const openC = mk(W, H); openC.getContext('2d').drawImage(A.op, left, top, w, h);
  return { openC, ox: left + A.o[0] * w, oy: top + A.o[1] * h, ow: Math.max(40, A.o[2] * w), box: { x: left, y: top, w, h } };
}

/* ---------- the live night sky: your aurora photograph, waving, with coded curtains and stars, inside the sky mask ---------- */
function makeSky(W, H, auroraIm, maskIm, seed) {
  const r = rng(seed), plate = cover(auroraIm, W, Math.round(H * .75), .5, 0), mask = mk(W, H), mx = mask.getContext('2d');
  mx.drawImage(maskIm, 0, 0, W, H);   /* the mask file is grayscale: turn its brightness into alpha */
  const md = mx.getImageData(0, 0, W, H), mp = md.data; for (let i = 0; i < mp.length; i += 4) { mp[i + 3] = mp[i]; mp[i] = mp[i + 1] = mp[i + 2] = 255; } mx.putImageData(md, 0, 0);
  const out = mk(W, H), o = out.getContext('2d');
  const stars = Array.from({ length: 140 }, () => ({ x: r() * W, y: r() * H * .55, s: .5 + r() * 1.4, p: r() * 6.28, f: .6 + r() * 2 }));
  const curtains = Array.from({ length: 7 }, () => ({ x: r() * W, w: 40 + r() * 120, h: H * (.25 + r() * .35), y: H * (.02 + r() * .12), c: r() < .55 ? '120,255,190' : '255,90,190', p: r() * 6.28, sp: .00015 + r() * .0003 }));
  function draw(t) {
    o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, W, H);
    const strip = 12, ph = plate.height;
    for (let x = 0; x < W; x += strip) {
      const dx = RM ? 0 : Math.sin(t * .00035 + x * .012) * 16 + Math.sin(t * .0009 + x * .031) * 5, dy = RM ? 0 : Math.sin(t * .0006 + x * .02) * 6;
      o.drawImage(plate, Math.max(0, Math.min(W - strip, x + dx)), 0, strip, ph, x, dy, strip + 1, ph);
    }
    if (ph < H) { const g = o.createLinearGradient(0, ph - 40, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,50,1)'); o.fillStyle = g; o.fillRect(0, ph - 40, W, H - ph + 40); }
    o.globalCompositeOperation = 'screen';
    for (const c of curtains) {
      const a = RM ? .18 : .1 + .14 * (.5 + .5 * Math.sin(t * c.sp * 6 + c.p)), x = c.x + (RM ? 0 : Math.sin(t * c.sp + c.p) * 60);
      const g = o.createLinearGradient(0, c.y, 0, c.y + c.h); g.addColorStop(0, `rgba(${c.c},0)`); g.addColorStop(.25, `rgba(${c.c},${a})`); g.addColorStop(1, `rgba(${c.c},0)`);
      o.fillStyle = g; o.beginPath(); o.moveTo(x, c.y); for (let k = 0; k <= 8; k++) { const yy = c.y + c.h * k / 8; o.lineTo(x + Math.sin(k * .9 + t * c.sp * 3) * 14, yy); } for (let k = 8; k >= 0; k--) { const yy = c.y + c.h * k / 8; o.lineTo(x + c.w + Math.sin(k * .9 + t * c.sp * 3 + 1) * 14, yy); } o.fill();
    }
    o.fillStyle = '#fff';
    for (const s of stars) { o.globalAlpha = RM ? .7 : .35 + .65 * Math.abs(Math.sin(t * .001 * s.f + s.p)); o.fillRect(s.x, s.y, s.s, s.s); }
    o.globalAlpha = 1; o.globalCompositeOperation = 'destination-in'; o.drawImage(mask, 0, 0); o.globalCompositeOperation = 'source-over';
    return out;
  }
  return { draw, mask };
}

/* ---------- count birds: a starling murmuration, drawn as ink ticks ---------- */
function makeFlock(W, H, n = 150, seed = 3) {
  const r = rng(seed), cx = W * (.3 + r() * .4), cy = H * .2;
  const b = Array.from({ length: n }, () => ({ x: cx + (r() - .5) * 120, y: cy + (r() - .5) * 60, vx: (r() - .5) * 2, vy: (r() - .5) * 2 }));
  let goal = { x: W * .5, y: H * .2 }, gt = 0;
  function step(dt, t) {
    if (t - gt > 3500) { gt = t; goal = { x: W * (.15 + Math.random() * .7), y: H * (.08 + Math.random() * .25) }; }
    const k = Math.min(2, dt / 16);
    for (let i = 0; i < b.length; i++) {
      const p = b[i]; let ax = 0, ay = 0, cxs = 0, cys = 0, vxs = 0, vys = 0, nb = 0;
      for (let j = 0; j < b.length; j += 3) { const q = b[j]; if (q === p) continue; const dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy; if (d2 < 2500) { nb++; cxs += q.x; cys += q.y; vxs += q.vx; vys += q.vy; if (d2 < 90) { ax -= dx * .05; ay -= dy * .05; } } }
      if (nb) { ax += (cxs / nb - p.x) * .004 + (vxs / nb - p.vx) * .06; ay += (cys / nb - p.y) * .004 + (vys / nb - p.vy) * .06; }
      ax += (goal.x - p.x) * .0006; ay += (goal.y - p.y) * .0006;
      p.vx += ax * k; p.vy += ay * k; const sp = Math.hypot(p.vx, p.vy), mx = 3.2; if (sp > mx) { p.vx *= mx / sp; p.vy *= mx / sp; } if (sp < 1.2) { p.vx *= 1.2 / (sp || 1); p.vy *= 1.2 / (sp || 1); }
      p.x += p.vx * k; p.y += p.vy * k;
    }
  }
  function draw(c) {
    c.save(); c.strokeStyle = INK.ink; c.lineWidth = 1.4; c.globalAlpha = .8; c.beginPath();
    for (const p of b) { const sp = Math.hypot(p.vx, p.vy) || 1, ux = p.vx / sp, uy = p.vy / sp; c.moveTo(p.x - ux * 2.5 - uy * 2, p.y - uy * 2.5 + ux * 2); c.lineTo(p.x, p.y); c.lineTo(p.x - ux * 2.5 + uy * 2, p.y - uy * 2.5 - ux * 2); }
    c.stroke(); c.restore();
  }
  return { step, draw, birds: b };
}

/* ---------- lamp moths: glowing specks that gather where a story is told ---------- */
function makeMoths(W, H, n = 46, seed = 5) {
  const r = rng(seed), m = Array.from({ length: n }, () => ({ x: r() * W, y: H * (.45 + r() * .5), p: r() * 6.28, f: .5 + r() * 1.5, hx: 0, hy: 0 }));
  let gather = null;
  return {
    callTo(x, y, ms = 6000) { gather = { x, y, until: performance.now() + ms }; },
    step(dt, t) {
      const g = gather && t < gather.until ? gather : null, k = Math.min(2, dt / 16);
      for (const q of m) {
        const tx = g ? g.x + Math.cos(q.p * 3 + t * .001) * 40 : q.x, ty = g ? g.y + Math.sin(q.p * 2 + t * .0013) * 30 : q.y;
        q.hx += ((g ? tx : q.hx + Math.sin(t * .0007 * q.f + q.p) * 1.4) - q.hx) * (g ? .02 * k : 1);
        q.hy += ((g ? ty : q.hy + Math.cos(t * .0009 * q.f + q.p) * .9) - q.hy) * (g ? .02 * k : 1);
        if (!q.init) { q.hx = q.x; q.hy = q.y; q.init = 1; }
      }
    },
    draw(c, t) {
      c.save(); c.globalCompositeOperation = 'screen';
      for (const q of m) { const a = RM ? .7 : Math.max(0, Math.sin(t * .002 * q.f + q.p)); if (a < .05) continue; soft(c, q.hx, q.hy, 9, .5 * a, '255,214,90'); c.fillStyle = `rgba(255,246,200,${a})`; c.fillRect(q.hx - 1, q.hy - 1, 2, 2); }
      c.restore();
    },
  };
}

/* ---------- creatures: cut-outs that walk, crawl, hop, perch or creep, printed until the lantern finds them ---------- */
async function makeBeast(def, W, H, seed, night) {
  const im = await load('objects/' + def.img + '.png'), r = rng(seed);
  const printed = printCutout(im, seed, night);
  let photo = im;
  if (night) { const t = mk(im.width, im.height), x = t.getContext('2d'); x.drawImage(im, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = '#6b5488'; x.fillRect(0, 0, t.width, t.height); x.globalCompositeOperation = 'destination-in'; x.drawImage(im, 0, 0); photo = t; }
  const ground = def.move === 'perch' ? .62 + r() * .2 : .72 + r() * .22;
  const b = { def, im: photo, printed, x: W * (.15 + r() * .7), y: H * ground, dir: r() < .5 ? -1 : 1, ph: r() * 6.28, hopT: 0, react: 0, frozen: false, target: null };
  b.scale = () => { const base = def.h * H, persp = .65 + (b.y / H - .6) * 1.4; return base * Math.max(.5, persp) / im.height; };
  b.step = (dt, t, lantern) => {
    const k = dt / 1000, w = im.width * b.scale();
    if (RM) return;
    b.ph += k * (def.move === 'crawl' ? 6 : 4);
    if (def.move === 'walk' || def.move === 'crawl') { b.x += b.dir * def.speed * k; if (b.x < w * .5 || b.x > W - w * .5) b.dir *= -1; }
    if (def.move === 'hop') { b.hopT += k; if (b.hopT < .45) b.x += b.dir * def.speed * k * 2.2; if (b.hopT > 2.6) { b.hopT = 0; if (b.x < W * .15) b.dir = 1; if (b.x > W * .85) b.dir = -1; } }
    if (def.move === 'creep') {
      const near = lantern && Math.hypot(lantern.x - b.x, lantern.y - b.y) < 260; b.frozen = near;
      if (!near) { if (!b.target || Math.abs(b.target - b.x) < 4) b.target = W * (.1 + Math.random() * .8); b.x += Math.sign(b.target - b.x) * def.speed * k; }
    }
    if (def.move === 'perch' && Math.random() < k * .15) b.dir *= -1;
    b.react = Math.max(0, b.react - k);
  };
  b.pose = () => {
    const s = b.scale(), w = im.width * s, h = im.height * s;
    let x = b.x, y = b.y, rot = 0, sx = b.dir > 0 ? 1 : -1;
    if (def.move === 'walk') y += Math.abs(Math.sin(b.ph)) * -2;
    if (def.move === 'hop' && b.hopT < .45) y -= Math.sin(b.hopT / .45 * Math.PI) * h * .5;
    if (def.move === 'still' || def.move === 'perch') { const br = 1 + Math.sin(b.ph * .5) * .012; return { x, y, w: w * br, h: h * br, rot, sx }; }
    if (b.react > 0) y -= Math.sin(b.react * Math.PI) * h * .15;
    return { x, y, w, h, rot, sx };
  };
  b.draw = (c, which) => {
    const p = b.pose(), img = which === 'print' ? b.printed : b.im;
    c.save(); c.translate(p.x, p.y); c.scale(p.sx, 1);
    if (def.move === 'crawl' && !RM) {
      const n = 8, sw = img.width / n;
      for (let i = 0; i < n; i++) { const off = Math.sin(b.ph + i * .9) * p.h * .025; c.drawImage(img, i * sw, 0, sw, img.height, -p.w / 2 + i * p.w / n, -p.h + off, p.w / n + .6, p.h); }
    } else c.drawImage(img, -p.w / 2, -p.h, p.w, p.h);
    c.restore();
  };
  b.shadow = c => { const p = b.pose(); c.save(); c.globalCompositeOperation = 'multiply'; const g = c.createRadialGradient(p.x, b.y, 1, p.x, b.y, p.w * .5); g.addColorStop(0, 'rgba(31,27,46,.38)'); g.addColorStop(1, 'rgba(31,27,46,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(p.x, b.y, p.w * .5, Math.max(3, p.h * .06), 0, 0, 6.2832); c.fill(); c.restore(); };
  b.hit = (x, y) => { const p = b.pose(); return x > p.x - p.w / 2 && x < p.x + p.w / 2 && y > p.y - p.h && y < p.y; };
  return b;
}

/* ---------- the portrait: your drawing whose lines are made of the photograph, developing outward as trust grows ---------- */
async function makePortrait(T, PW = 360, PH = 480) {
  const [ink, mask, ph] = await Promise.all([sketch(T.drawing), sketch(T.drawing, '#ffffff'), load(T.photo)]);
  const photo = cover(ph, PW, PH), paper = makePaper(PW, PH, 3), print = separate(photo, paper, 9), maskC = mk(PW, PH);
  const P = { ink, mask, photo, print, paper, maskC, r: 0 };
  const fit = (c, im, dx = 0, dy = 0) => { const s = Math.max(PW / im.width, PH / im.height), iw = im.width * s, ih = im.height * s; c.drawImage(im, (PW - iw) / 2 + dx, (PH - ih) / 2 + dy, iw, ih); };
  /* trust 0..9; layers {photo, print, draw}; returns true while still easing */
  P.draw = (px, trust, layers = { photo: true, print: true, draw: true }) => {
    const goal = Math.max(0, trust - 1) * 6; P.r += (goal - P.r) * (RM ? 1 : .08); if (Math.abs(goal - P.r) < .2) P.r = goal;
    const m = P.maskC.getContext('2d'); m.clearRect(0, 0, PW, PH); m.globalCompositeOperation = 'source-over';
    const steps = P.r < 1 ? 0 : 12; for (const ring of [P.r, P.r * .5]) for (let i = 0; i < steps; i++) { const a = i / steps * 6.2832; m.globalAlpha = .5; fit(m, P.mask, Math.cos(a) * ring, Math.sin(a) * ring); }
    m.globalAlpha = 1; fit(m, P.mask); m.globalCompositeOperation = 'source-in'; m.drawImage(P.photo, 0, 0); m.globalCompositeOperation = 'source-over';
    px.globalAlpha = 1; px.globalCompositeOperation = 'source-over'; px.drawImage(P.paper, 0, 0);
    if (layers.print) { px.globalAlpha = .12 + trust * .07; px.drawImage(P.print, 0, 0); px.globalAlpha = 1; }
    if (layers.photo) px.drawImage(P.maskC, 0, 0);
    if (layers.draw) { px.globalCompositeOperation = 'multiply'; px.globalAlpha = Math.max(.25, 1 - trust / 11); fit(px, P.ink); px.globalAlpha = 1; px.globalCompositeOperation = 'source-over'; }
    return P.r !== goal;
  };
  return P;
}

return { mk, R, pick, rng, hex, RM, PAPER, INK, EVENTS, load, tryLoad, sketch, cover, contain, makePaper, specks, separate, separateNight, printCutout, duotone, torn, soft, archOf, bakeArch, makeSky, makeFlock, makeMoths, makeBeast, makePortrait };
})();
