// A4: Prairie wind and pollen — Halsey, Nebraska
// License: CC0-1.0 / MIT
// Plain ES2020, zero dependencies, offline-safe.
// API: makePollen(W, H, { seed, count: 25..40, wind, palette }) -> { step(dtMs, tMs), draw(ctx, tMs) }

(function (root) {
  'use strict';

  const DEFAULT_PALETTE = {
    sandhills_ochre: '#C8A464',
    porch_yellow: '#E2B842',
    limestone: '#D9CFC1',
    abundance_gold: '#F4D35E',
    paper: '#F1EBDC',
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
    const str = String(s ?? 'pollen');
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function prefersReducedMotion() {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function makePollen(W, H, opts) {
    const o = opts || {};
    const seed = hashSeed(o.seed ?? 1950);
    const rand = mulberry32(seed);
    const count = Math.max(10, Math.min(60, o.count ?? 32));
    const wind = o.wind ?? 18; // px per second baseline horizontal drift
    const pal = Object.assign({}, DEFAULT_PALETTE, o.palette || {});
    const colors = [pal.abundance_gold, pal.porch_yellow, pal.sandhills_ochre, pal.limestone, pal.paper];

    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: rand() * W,
        y: rand() * H,
        r: 1.1 + rand() * 2.1,
        vx: (0.65 + rand() * 0.7) * wind,
        vy: -3 + rand() * 7,
        phase: rand() * Math.PI * 2,
        wobbleAmp: 4 + rand() * 10,
        wobbleFreq: 0.4 + rand() * 0.8,
        alpha: 0.22 + rand() * 0.45,
        color: colors[Math.floor(rand() * colors.length)],
      });
    }

    const FRAME_MS = 1000 / 30; // 30 fps cap
    let accMs = 0;

    return {
      step: function (dtMs, tMs) {
        if (prefersReducedMotion()) return;
        accMs += dtMs;
        if (accMs < FRAME_MS) return;
        const dt = Math.min(accMs, 100) / 1000;
        accMs = accMs % FRAME_MS;
        const t = (tMs || 0) / 1000;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const gust = Math.sin(t * 0.35 + p.phase) * 0.25 + 1;
          p.x += p.vx * gust * dt;
          p.y += (p.vy + Math.sin(t * p.wobbleFreq + p.phase) * p.wobbleAmp) * dt;

          if (p.x > W + 8) p.x = -8;
          if (p.x < -8) p.x = W + 8;
          if (p.y > H + 8) p.y = -8;
          if (p.y < -8) p.y = H + 8;
        }
      },
      draw: function (ctx, _tMs) {
        ctx.save();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        }
        ctx.restore();
      },
    };
  }

  root.makePollen = makePollen;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { makePollen };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
