// A5: Cloud shadows on the map — Halsey, Nebraska
// License: CC0-1.0 / MIT
// Plain ES2020, zero dependencies, offline-safe.
// API: makeCloudShadows(W, H, { seed, palette }) -> { step(dtMs, tMs), draw(ctx, tMs) }

(function (root) {
  'use strict';

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
    const str = String(s ?? 'clouds');
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

  function makeCloudShadows(W, H, opts) {
    const o = opts || {};
    const seed = hashSeed(o.seed ?? 1974);
    const rand = mulberry32(seed);
    const count = Math.max(3, Math.min(8, o.count ?? 5));
    const crossSeconds = o.crossSeconds ?? 28;
    const maxOpacity = Math.min(0.22, o.maxOpacity ?? 0.19); // strictly never darker than 22%
    const shadowHex = (o.palette && o.palette.twilight_indigo) || '#243044';

    const clouds = [];
    for (let i = 0; i < count; i++) {
      const rx = W * (0.14 + rand() * 0.16);
      const ry = rx * (0.48 + rand() * 0.24);
      const lobes = [];
      const lobeCount = 3 + Math.floor(rand() * 3);
      for (let j = 0; j < lobeCount; j++) {
        lobes.push({
          ox: (rand() - 0.5) * rx * 1.15,
          oy: (rand() - 0.5) * ry * 0.75,
          r: rx * (0.45 + rand() * 0.4),
        });
      }
      clouds.push({
        x: rand() * (W + rx * 2) - rx,
        y: rand() * H,
        rx,
        ry,
        vx: (W + rx * 2) / (crossSeconds * (0.88 + rand() * 0.24)),
        vy: (rand() - 0.5) * 4,
        alpha: maxOpacity * (0.65 + rand() * 0.35),
        lobes,
      });
    }

    return {
      step: function (dtMs, _tMs) {
        if (prefersReducedMotion()) return;
        const dt = Math.min(dtMs, 100) / 1000;
        for (let i = 0; i < clouds.length; i++) {
          const c = clouds[i];
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          if (c.x - c.rx * 1.6 > W) {
            c.x = -c.rx * 1.6;
          }
          if (c.y < -c.ry) c.y = H + c.ry;
          if (c.y > H + c.ry) c.y = -c.ry;
        }
      },
      draw: function (ctx, _tMs) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        for (let i = 0; i < clouds.length; i++) {
          const c = clouds[i];
          for (let j = 0; j < c.lobes.length; j++) {
            const lb = c.lobes[j];
            const gx = c.x + lb.ox;
            const gy = c.y + lb.oy;
            const grad = ctx.createRadialGradient(gx, gy, lb.r * 0.1, gx, gy, lb.r);
            grad.addColorStop(0, shadowHex);
            grad.addColorStop(1, 'rgba(36, 48, 68, 0)');
            ctx.globalAlpha = Math.min(0.22, c.alpha);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(gx, gy, lb.r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      },
    };
  }

  root.makeCloudShadows = makeCloudShadows;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { makeCloudShadows };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
