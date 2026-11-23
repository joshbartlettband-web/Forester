// A2: Center-pivot mandala — Halsey, Nebraska
// License: CC0-1.0 / MIT
// Plain ES2020, zero dependencies, offline-safe.
// API: drawPivot(ctx, size, { seed, rings, arms, palette })

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
    const str = String(s ?? 'pivot');
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function drawPivot(ctx, size, opts) {
    const o = opts || {};
    const seed = hashSeed(o.seed ?? 1903);
    const rand = mulberry32(seed);
    const pal = Object.assign({}, DEFAULT_PALETTE, o.palette || {});
    const isTiny = size <= 48;
    const rings = Math.max(2, Math.min(10, o.rings ?? (isTiny ? 3 : 5 + Math.floor(rand() * 3))));
    const arms = Math.max(1, Math.min(4, o.arms ?? 1));

    const cx = size * 0.5;
    const cy = size * 0.5;
    const pad = size * 0.08;
    const maxR = size * 0.5 - pad;
    const unit = Math.max(0.75, size / 240);

    ctx.save();
    ctx.translate(cx, cy);

    // 1. Subtle quarter-section square frame (section-line boundary)
    ctx.strokeStyle = pal.limestone;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = Math.max(0.8, unit * 1.1);
    ctx.strokeRect(-maxR, -maxR, maxR * 2, maxR * 2);

    // 2. Section-line crosshairs
    ctx.beginPath();
    ctx.moveTo(-maxR * 1.04, 0);
    ctx.lineTo(maxR * 1.04, 0);
    ctx.moveTo(0, -maxR * 1.04);
    ctx.lineTo(0, maxR * 1.04);
    ctx.strokeStyle = pal.ink;
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = Math.max(0.75, unit * 0.9);
    ctx.stroke();

    // 3. Seeded crop wedges (quiet prairie sage & ochre sectors)
    const wedgeCount = isTiny ? 2 : 3 + Math.floor(rand() * 3);
    const sectorColors = [pal.prairie_sage, pal.sandhills_ochre, pal.ogallala_sky, pal.limestone];
    for (let w = 0; w < wedgeCount; w++) {
      const a0 = rand() * Math.PI * 2;
      const span = (0.35 + rand() * 0.9) * Math.PI * 0.5;
      const rInner = maxR * (0.2 + rand() * 0.35);
      const rOuter = maxR * (0.68 + rand() * 0.28);
      ctx.beginPath();
      ctx.arc(0, 0, rOuter, a0, a0 + span);
      ctx.arc(0, 0, rInner, a0 + span, a0, true);
      ctx.closePath();
      ctx.fillStyle = sectorColors[Math.floor(rand() * sectorColors.length)];
      ctx.globalAlpha = 0.16 + rand() * 0.12;
      ctx.fill();
    }

    // 4. Concentric irrigation crop rings
    for (let i = 1; i <= rings; i++) {
      const t = i / rings;
      const r = maxR * (0.18 + t * 0.82);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = i === rings ? pal.ink : (i % 2 === 0 ? pal.prairie_sage : pal.sandhills_ochre);
      ctx.globalAlpha = i === rings ? 0.65 : 0.48;
      ctx.lineWidth = i === rings ? Math.max(1.1, unit * 1.6) : Math.max(0.75, unit * 1.05);
      if (!isTiny && i < rings && rand() > 0.55) {
        ctx.setLineDash([unit * 5, unit * 3.5]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 5. Pivot arm(s) with tower nodes
    const baseAngle = rand() * Math.PI * 2;
    for (let a = 0; a < arms; a++) {
      const angle = baseAngle + (a * Math.PI * 2) / arms + (a > 0 ? (rand() - 0.5) * 0.25 : 0);
      const armLen = maxR * 0.96;
      const ex = Math.cos(angle) * armLen;
      const ey = Math.sin(angle) * armLen;

      // Swept gold wake behind primary arm
      if (a === 0) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, armLen, angle - 0.28, angle);
        ctx.closePath();
        ctx.fillStyle = pal.abundance_gold;
        ctx.globalAlpha = 0.18;
        ctx.fill();
      }

      // Main truss arm
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = a === 0 ? pal.silo_rust : pal.ink;
      ctx.globalAlpha = a === 0 ? 0.92 : 0.55;
      ctx.lineWidth = Math.max(1.2, unit * (a === 0 ? 2.1 : 1.3));
      ctx.lineCap = 'round';
      ctx.stroke();

      // Tower / wheel dots along the arm
      if (!isTiny) {
        const towers = Math.min(rings, 5);
        for (let t = 1; t <= towers; t++) {
          const frac = t / (towers + 0.35);
          ctx.beginPath();
          ctx.arc(ex * frac, ey * frac, Math.max(1.4, unit * 2.2), 0, Math.PI * 2);
          ctx.fillStyle = pal.paper;
          ctx.globalAlpha = 1;
          ctx.fill();
          ctx.strokeStyle = pal.ink;
          ctx.lineWidth = Math.max(0.8, unit * 1.0);
          ctx.stroke();
        }
      }
    }

    // 6. Center wellhead hub
    const hubR = Math.max(2.2, size * 0.042);
    ctx.beginPath();
    ctx.arc(0, 0, hubR, 0, Math.PI * 2);
    ctx.fillStyle = pal.abundance_gold;
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = Math.max(1.0, unit * 1.4);
    ctx.stroke();

    ctx.restore();
  }

  root.drawPivot = drawPivot;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { drawPivot };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
