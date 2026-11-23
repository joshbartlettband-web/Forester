// A1: Topographic contour generator — Halsey, Nebraska
// License: CC0-1.0 / MIT
// Plain ES2020, zero dependencies, offline-safe.
// API: makeTopo(W, H, { seed, density, palette }) -> { step(dtMs, tMs), draw(ctx, tMs) }

(function (root) {
  'use strict';

  const DEFAULT_PALETTE = {
    sandhills_ochre: '#C8A464',
    prairie_sage: '#6E7F5E',
    ogallala_sky: '#8BAAC2',
    twilight_indigo: '#243044',
    porch_yellow: '#E2B842',
    limestone: '#D9CFC1',
    silo_rust: '#9C4A33',
    abundance_gold: '#F4D35E',
    ink: '#1F1B2E',
    paper: '#F1EBDC',
    river_blue: '#3F78AD',
    barn_red: '#A8352C',
    dusk_pink: '#D4577F',
    aurora_green: '#7FE3B5',
  };

  function mulberry32(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashSeed(s) {
    if (typeof s === 'number' && Number.isFinite(s)) return s >>> 0;
    const str = String(s ?? 'halsey');
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function makeValueNoise2D(seed) {
    const rand = mulberry32(seed);
    const SIZE = 256;
    const table = new Float32Array(SIZE * SIZE);
    for (let i = 0; i < table.length; i++) table[i] = rand();

    function smooth(t) {
      return t * t * (3 - 2 * t);
    }

    return function sample(x, y) {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = smooth(x - xi);
      const yf = smooth(y - yi);
      const x0 = ((xi % SIZE) + SIZE) % SIZE;
      const x1 = (x0 + 1) % SIZE;
      const y0 = ((yi % SIZE) + SIZE) % SIZE;
      const y1 = (y0 + 1) % SIZE;

      const v00 = table[y0 * SIZE + x0];
      const v10 = table[y0 * SIZE + x1];
      const v01 = table[y1 * SIZE + x0];
      const v11 = table[y1 * SIZE + x1];

      const vx0 = v00 + (v10 - v00) * xf;
      const vx1 = v01 + (v11 - v01) * xf;
      return vx0 + (vx1 - vx0) * yf;
    };
  }

  // Marching squares edge lookup: pairs of edges [e1, e2] where
  // 0=top, 1=right, 2=bottom, 3=left
  const MS_TABLE = [
    [],
    [[3, 2]],
    [[2, 1]],
    [[3, 1]],
    [[0, 1]],
    [[0, 3], [2, 1]],
    [[0, 2]],
    [[0, 3]],
    [[0, 3]],
    [[0, 2]],
    [[0, 1], [3, 2]],
    [[0, 1]],
    [[3, 1]],
    [[2, 1]],
    [[3, 2]],
    [],
  ];

  function interp(a, b, level) {
    const d = b - a;
    if (Math.abs(d) < 1e-6) return 0.5;
    const t = (level - a) / d;
    return t < 0 ? 0 : t > 1 ? 1 : t;
  }

  function makeTopo(W, H, opts) {
    const o = opts || {};
    const seed = hashSeed(o.seed ?? 1903);
    const density = Math.max(4, Math.min(24, o.density ?? 11));
    const pal = Object.assign({}, DEFAULT_PALETTE, o.palette || {});
    const lineColor = o.lineColor || pal.sandhills_ochre;
    const majorColor = o.majorColor || pal.ink;
    const baseAlpha = o.alpha ?? 0.34;
    const majorEvery = o.majorEvery ?? 4;

    // Grid resolution tuned so 960x640 generates & draws well under 20 ms
    const cell = Math.max(8, Math.round(Math.min(W, H) / 48));
    const cols = Math.ceil(W / cell) + 1;
    const rows = Math.ceil(H / cell) + 1;
    const field = new Float32Array(cols * rows);

    const rand = mulberry32(seed);
    const noise = makeValueNoise2D(seed ^ 0x9E3779B9);
    const ox = rand() * 50;
    const oy = rand() * 50;
    // Slight WNW-ESE dune grain typical of the Nebraska Sandhills
    const freqX = 2.6 / Math.max(W, 1);
    const freqY = 4.2 / Math.max(H, 1);

    let minV = Infinity;
    let maxV = -Infinity;
    for (let r = 0; r < rows; r++) {
      const py = r * cell;
      for (let c = 0; c < cols; c++) {
        const px = c * cell;
        // 3-octave fBm
        const nx = px * freqX + ox;
        const ny = py * freqY + oy;
        const v =
          noise(nx, ny) * 0.62 +
          noise(nx * 2.05 + 11.3, ny * 2.05 + 5.7) * 0.27 +
          noise(nx * 4.1 + 23.1, ny * 4.1 + 17.9) * 0.11;
        field[r * cols + c] = v;
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
      }
    }

    const span = Math.max(maxV - minV, 1e-4);

    // Precompute line segments per contour level
    const levels = [];
    for (let i = 1; i <= density; i++) {
      const level = minV + (i / (density + 1)) * span;
      const segs = [];
      for (let r = 0; r < rows - 1; r++) {
        const y0 = r * cell;
        const y1 = y0 + cell;
        const row0 = r * cols;
        const row1 = (r + 1) * cols;
        for (let c = 0; c < cols - 1; c++) {
          const tl = field[row0 + c];
          const tr = field[row0 + c + 1];
          const br = field[row1 + c + 1];
          const bl = field[row1 + c];

          const idx =
            (tl >= level ? 8 : 0) |
            (tr >= level ? 4 : 0) |
            (br >= level ? 2 : 0) |
            (bl >= level ? 1 : 0);

          const pairs = MS_TABLE[idx];
          if (pairs.length === 0) continue;

          const x0 = c * cell;
          const x1 = x0 + cell;

          for (let p = 0; p < pairs.length; p++) {
            const pair = pairs[p];
            for (let k = 0; k < 2; k++) {
              const edge = pair[k];
              if (edge === 0) {
                segs.push(x0 + interp(tl, tr, level) * cell, y0);
              } else if (edge === 1) {
                segs.push(x1, y0 + interp(tr, br, level) * cell);
              } else if (edge === 2) {
                segs.push(x0 + interp(bl, br, level) * cell, y1);
              } else {
                segs.push(x0, y0 + interp(tl, bl, level) * cell);
              }
            }
          }
        }
      }
      levels.push({
        major: i % majorEvery === 0,
        segs: new Float32Array(segs),
      });
    }

    // Bake once to an offscreen canvas if available in browser so draw() is < 1 ms
    let baked = null;
    function renderTo(ctx) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 0; i < levels.length; i++) {
        const lv = levels[i];
        const s = lv.segs;
        if (s.length === 0) continue;
        ctx.beginPath();
        for (let j = 0; j < s.length; j += 4) {
          ctx.moveTo(s[j], s[j + 1]);
          ctx.lineTo(s[j + 2], s[j + 3]);
        }
        ctx.strokeStyle = lv.major ? majorColor : lineColor;
        ctx.globalAlpha = lv.major ? Math.min(1, baseAlpha * 1.15) : baseAlpha;
        ctx.lineWidth = lv.major ? 1.35 : 0.85;
        ctx.stroke();
      }
      ctx.restore();
    }

    if (typeof document !== 'undefined' && W > 0 && H > 0) {
      baked = document.createElement('canvas');
      baked.width = W;
      baked.height = H;
      const bctx = baked.getContext('2d');
      if (bctx) renderTo(bctx);
    }

    return {
      step: function (_dtMs, _tMs) {
        // Static topographic contours; no per-frame mutation needed.
      },
      draw: function (ctx, _tMs) {
        if (baked) {
          ctx.drawImage(baked, 0, 0, W, H);
        } else {
          renderTo(ctx);
        }
      },
    };
  }

  root.makeTopo = makeTopo;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { makeTopo };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
