// A3: Story-swap thread — Halsey, Nebraska
// License: CC0-1.0 / MIT
// Plain ES2020, zero dependencies, offline-safe.
// API: weave(fromRect, toRect, { color, strands: 3, ms: 850 }) -> Promise<void>

(function (root) {
  'use strict';

  function prefersReducedMotion() {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function quadPoint(p0, p1, p2, t) {
    const u = 1 - t;
    return {
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    };
  }

  function quadTangent(p0, p1, p2, t) {
    const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
    const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function weave(fromRect, toRect, opts) {
    if (prefersReducedMotion() || typeof document === 'undefined' || !fromRect || !toRect) {
      return Promise.resolve();
    }

    const o = opts || {};
    const strands = Math.max(1, Math.min(5, o.strands ?? 3));
    const totalMs = Math.max(200, o.ms ?? 850);
    const baseColor = o.color || '#F4D35E';
    const strandColors = o.strandColors || [baseColor, '#E2B842', '#C8A464', '#D9CFC1', '#7FE3B5'];

    const start = {
      x: fromRect.left + fromRect.width * 0.5,
      y: fromRect.top + fromRect.height * 0.5,
    };
    const end = {
      x: toRect.left + toRect.width * 0.5,
      y: toRect.top + toRect.height * 0.5,
    };

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.hypot(dx, dy) || 1;
    const lift = Math.min(180, Math.max(55, dist * 0.28));

    // Outgoing arc curves gently upward; return arc curves slightly opposite for a woven figure
    const nx = -dy / dist;
    const ny = dx / dist;
    const outCtrl = {
      x: (start.x + end.x) * 0.5 + nx * lift * 0.45,
      y: (start.y + end.y) * 0.5 - lift,
    };
    const backCtrl = {
      x: (start.x + end.x) * 0.5 - nx * lift * 0.45,
      y: (start.y + end.y) * 0.5 + lift * 0.45,
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.cssText =
      'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    function drawBraid(p0, ctrl, p2, headT, tailT, phaseShift, alpha) {
      if (headT <= tailT) return;
      const steps = 44;
      const amp = 4.5;
      const twists = 5.5;

      for (let s = 0; s < strands; s++) {
        const strandPhase = (s * Math.PI * 2) / strands + phaseShift;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const frac = i / steps;
          const t = tailT + (headT - tailT) * frac;
          const pt = quadPoint(p0, ctrl, p2, t);
          const tan = quadTangent(p0, ctrl, p2, t);
          const perpX = -tan.y;
          const perpY = tan.x;
          // Taper braid cleanly at endpoints
          const envelope = Math.sin(t * Math.PI);
          const wave = Math.sin(t * Math.PI * 2 * twists + strandPhase) * amp * envelope;
          const x = pt.x + perpX * wave;
          const y = pt.y + perpY * wave;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = strandColors[s % strandColors.length];
        ctx.lineWidth = s === 0 ? 2.4 : 1.7;
        ctx.lineCap = 'round';
        ctx.globalAlpha = alpha * (s === 0 ? 0.95 : 0.78);
        ctx.stroke();
      }

      // Soft luminous knot at head
      const tip = quadPoint(p0, ctrl, p2, headT);
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = baseColor;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }

    return new Promise(function (resolve) {
      const t0 = performance.now();

      function frame(now) {
        const elapsed = now - t0;
        const p = Math.min(1, elapsed / totalMs);
        ctx.clearRect(0, 0, W, H);

        // Phase 1 (0 -> 0.52): Give story (fromRect -> toRect)
        if (p < 0.62) {
          const outP = easeInOutCubic(Math.min(1, p / 0.5));
          const fadeOut = p > 0.45 ? 1 - (p - 0.45) / 0.17 : 1;
          const tail = Math.max(0, outP - 0.55);
          drawBraid(start, outCtrl, end, outP, tail, elapsed * 0.008, fadeOut);
        }

        // Phase 2 (0.42 -> 1.0): Receive teller's story (toRect -> fromRect)
        if (p > 0.42) {
          const inP = easeInOutCubic(Math.min(1, (p - 0.42) / 0.52));
          const fadeIn = p > 0.86 ? 1 - (p - 0.86) / 0.14 : 1;
          const tail = Math.max(0, inP - 0.55);
          drawBraid(end, backCtrl, start, inP, tail, -elapsed * 0.009 + 1.1, fadeIn);
        }

        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          canvas.remove();
          resolve();
        }
      }

      requestAnimationFrame(frame);
    });
  }

  root.weave = weave;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { weave };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
