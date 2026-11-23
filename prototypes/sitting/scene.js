/* The place, alive: the collision demos brought into a sitting.
   The place is printed (code) over its Gemini photograph, your arch stands in it, creatures walk it,
   and your lantern (the pointer) develops the photograph. Light follows the journey east:
   dawn at Halsey, day in the Sandhills, gold in the middle, and night under your aurora near the river.
   Telling a story stamps its event into the scene; creatures that share the event react; moths gather.
   Uses engine.js (HE). Exposes window.HSCENE. */
"use strict";
window.HSCENE = (() => {
  const W = 960, H = 360;
  /* each teller's place: photo, arch, creatures, a flock by day */
  const PLACES = {
    halsey:     { img: 'halsey-rows', fy: .55, arch: { k: 'arch-red-blue', cx: .3, ground: .97, h: .62 }, beasts: ['critter', 'owl'] },
    thedford:   { img: 'thedford', fy: .5, arch: { k: 'arch-black', cx: .8, ground: .97, h: .42 }, beasts: ['jackrabbit', 'listener'], murmur: true },
    sandhills:  { img: 'sandhills-windmill', fy: .5, arch: { k: 'arch-black', cx: .24, ground: .95, h: .44 }, beasts: ['turtle', 'gatewalker'], murmur: true },
    dismal:     { img: 'dismal', fy: .5, arch: { k: 'arch-red-hook', cx: .86, ground: .98, h: .52 }, beasts: ['coyote', 'folded'] },
    brokenbow:  { img: 'broken-bow', fy: .55, arch: { k: 'arch-white', cx: .16, ground: .98, h: .58 }, beasts: ['jackrabbit'], murmur: true },
    loup:       { img: 'loup-fog', fy: .5, arch: { k: 'arch-celadon', cx: .12, ground: .98, h: .5 }, beasts: ['owl', 'crane'] },
    platte:     { img: 'platte-cranes', fy: .5, arch: { k: 'arch-celadon', cx: .16, ground: .98, h: .55 }, beasts: ['crane'] },
    archway:    { img: 'archway', fy: .5, arch: { k: 'arch-red-hook', cx: .88, ground: .98, h: .5 }, beasts: ['gatewalker', 'jackrabbit'], murmur: true },
    columbus:   { img: 'columbus', fy: .5, arch: { k: 'arch-white', cx: .12, ground: .98, h: .5 }, beasts: ['crane'], murmur: true },
    mainstreet: { img: 'mainstreet', fy: .6, arch: { k: 'arch-red-hook', cx: .5, ground: .99, h: .56 }, beasts: ['folded', 'owl'] },
    courthouse: { img: 'courthouse', fy: .5, arch: { k: 'arch-white', cx: .66, ground: .99, h: .66 }, beasts: ['listener'], indoor: true },
    bridge:     { img: 'bridge', fy: .5, arch: { k: 'arch-celadon', cx: .14, ground: .99, h: .48 }, beasts: ['gatewalker'] },
  };
  const BEASTS = {
    crane: { name: 'Sandhill crane', img: 'beast-crane', move: 'walk', speed: 14, h: .36, event: 'Chain' },
    coyote: { name: 'Coyote', img: 'beast-coyote', move: 'walk', speed: 34, h: .22, event: 'Risk' },
    owl: { name: 'Great horned owl', img: 'beast-owl', move: 'perch', h: .28, event: 'Find' },
    turtle: { name: 'Box turtle', img: 'beast-turtle', move: 'crawl', speed: 5, h: .12, event: 'Spare' },
    jackrabbit: { name: 'Jackrabbit', img: 'beast-jackrabbit', move: 'hop', speed: 60, h: .16, event: 'Chain' },
    listener: { name: 'The Listener', img: 'beast-bloom', move: 'still', h: .24, event: 'Spare' },
    folded: { name: 'The Folded', img: 'beast-crumple', move: 'still', h: .24, event: 'Find' },
    gatewalker: { name: 'Gatewalker', img: 'beast-archback', move: 'creep', speed: 10, h: .28, event: 'Repeat' },
    critter: { name: 'Long-legs', img: 'beast-critter', move: 'crawl', speed: 18, h: .24, event: 'Risk' },
  };
  /* the light of the journey, column by column (0 Halsey … 7 the bridge) */
  const LIGHT = c => c <= 1 ? 'dawn' : c <= 3 ? 'day' : c === 4 ? 'gold' : 'night';
  const ICONS = {}; for (const k of ['find', 'chain', 'risk', 'spare', 'repeat']) HE.load(`icons/${k}.svg`).then(i => ICONS[k] = i).catch(() => {});

  async function mount(canvas, T, node) {
    const P = PLACES[T.place] || PLACES.halsey, light = P.indoor ? 'lamp' : LIGHT(node.c);
    const night = light === 'night';
    const x = canvas.getContext('2d'), paper = HE.makePaper(W, H, node.c + 3);
    const im = await HE.load(`img/${night ? 'night-' : ''}${P.img}.jpg`).catch(() => HE.load(`img/${P.img}.jpg`));
    const photo = HE.cover(im, W, H, .5, P.fy);
    const A = await HE.archOf(P.arch.k).catch(() => null);
    const arch = A ? HE.bakeArch(photo, A, P.arch, night) : null;
    let sky = null;
    if (night) {
      const [au, mask] = await Promise.all([HE.load(`img/aurora-${1 + node.c % 3}.jpg`), HE.tryLoad(`img/sky-${P.img}.png`)]);
      if (mask) sky = HE.makeSky(W, H, au, HE.cover(mask, W, H, .5, P.fy), node.c * 13 + 1);
    }
    const print = night ? HE.separateNight(photo, node.c * 31 + 5) : HE.separate(photo, paper, node.c * 31 + 5);
    const beasts = await Promise.all(P.beasts.map((b, k) => HE.makeBeast(BEASTS[b], W, H, node.c * 7 + k + 1, night).catch(() => null))).then(a => a.filter(Boolean));
    const flock = P.murmur && !night ? HE.makeFlock(W, H, 110, node.c + 2) : null;
    const moths = night || light === 'gold' || light === 'lamp' ? HE.makeMoths(W, H, night ? 44 : 18, node.c + 3) : null;
    const maskC = HE.mk(W, H), mctx = maskC.getContext('2d'), maskF = HE.mk(W, H), mf = maskF.getContext('2d'), tmp = HE.mk(W, H), tx = tmp.getContext('2d'), bT = HE.mk(W, H), bx = bT.getContext('2d');
    const stamps = [], fx = [];
    let lantern = null, alive = true, last = performance.now(), t0 = performance.now();
    const toScene = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
    const onMove = e => { lantern = { ...toScene(e), r: 120 }; }, onLeave = () => { lantern = null; };
    canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerdown', onMove); canvas.addEventListener('pointerleave', onLeave);

    function grade(c) {   // the color of the hour
      c.save();
      if (light === 'dawn') { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,186,150,.42)'); g.addColorStop(.5, 'rgba(255,214,170,.12)'); g.addColorStop(1, 'rgba(255,214,170,0)'); c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(0, 0, W, H); }
      if (light === 'day') { const g = c.createLinearGradient(0, 0, 0, H * .6); g.addColorStop(0, 'rgba(120,170,230,.28)'); g.addColorStop(1, 'rgba(120,170,230,0)'); c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(0, 0, W, H); }
      if (light === 'gold') { c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(250,200,130,.2)'; c.fillRect(0, 0, W, H); const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,150,90,.32)'); g.addColorStop(1, 'rgba(255,140,80,0)'); c.globalCompositeOperation = 'screen'; c.fillStyle = g; c.fillRect(0, 0, W, H); }
      if (light === 'lamp') { const g = c.createRadialGradient(W * .5, H * .15, 20, W * .5, H * .2, W * .7); g.addColorStop(0, 'rgba(255,214,120,.45)'); g.addColorStop(1, 'rgba(60,30,20,.25)'); c.globalCompositeOperation = 'multiply'; c.fillStyle = g; c.fillRect(0, 0, W, H); }
      c.restore();
    }
    function frame(t) {
      if (!alive) return;
      const dt = Math.min(60, t - last); last = t;
      if (!canvas.isConnected || canvas.offsetParent === null) { requestAnimationFrame(frame); return; }
      const c = x; c.save();
      // arrival: the camera pulls back out of the arch's opening
      const intro = HE.RM ? 1 : Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - intro, 3);
      if (intro < 1 && arch) { const k = 1 + (1 - e) * 2.2, cx = arch.ox + (W / 2 - arch.ox) * e, cy = arch.oy + (H / 2 - arch.oy) * e; c.translate(W / 2, H / 2); c.scale(k, k); c.translate(-cx, -cy); }
      c.drawImage(print, 0, 0);
      mf.clearRect(0, 0, W, H); mf.drawImage(maskC, 0, 0); if (lantern) HE.soft(mf, lantern.x, lantern.y, lantern.r, .95);
      tx.clearRect(0, 0, W, H); tx.drawImage(maskF, 0, 0); tx.globalCompositeOperation = 'source-in'; tx.drawImage(photo, 0, 0); tx.globalCompositeOperation = 'source-over'; c.drawImage(tmp, 0, 0);
      if (sky) c.drawImage(sky.draw(t), 0, 0);
      grade(c);
      if (flock) { flock.step(dt, t); flock.draw(c); }
      if (beasts.length) {
        beasts.sort((a, b) => a.y - b.y);
        for (const b of beasts) { b.step(dt, t, lantern); b.shadow(c); b.draw(c, 'print'); }
        bx.clearRect(0, 0, W, H); for (const b of beasts) b.draw(bx, 'photo'); bx.globalCompositeOperation = 'destination-in'; bx.drawImage(maskF, 0, 0); bx.globalCompositeOperation = 'source-over'; c.drawImage(bT, 0, 0);
      }
      for (const s of stamps) { const im = ICONS[s.ev]; if (!im) continue; const age = Math.min(1, (t - s.born) / 260), sz = 48 * (1.8 - age * .8); c.save(); c.translate(s.x, s.y); c.rotate(s.rot); c.globalAlpha = .92 * age; c.globalCompositeOperation = night ? 'source-over' : 'multiply'; c.drawImage(im, -sz / 2, -sz / 2, sz, sz); c.restore(); }
      if (moths) { moths.step(dt, t); moths.draw(c, t); }
      for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i], p = Math.min(1, (t - f.t0) / f.dur); f.draw(c, p); if (p >= 1) fx.splice(i, 1); }
      if (lantern) { c.strokeStyle = night ? 'rgba(255,240,210,.55)' : 'rgba(31,27,46,.5)'; c.lineWidth = 1.5; c.setLineDash([3, 6]); c.beginPath(); c.arc(lantern.x, lantern.y, lantern.r * .62, 0, 6.2832); c.stroke(); c.setLineDash([]); }
      c.restore();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return {
      light, night,
      /* a story was told: stamp its event where a creature shares it, or on open ground */
      tell(event, total) {
        const host = beasts.find(b => b.def.event === event);
        const px = host ? host.x : W * (.2 + Math.random() * .6), py = host ? host.y - host.pose().h * .6 : H * (.62 + Math.random() * .25);
        if (event) stamps.push({ ev: event.toLowerCase(), x: px, y: py, rot: (Math.random() - .5) * .5, born: performance.now() });
        if (stamps.length > 9) stamps.shift();
        for (const b of beasts) if (b.def.event === event) b.react = 1;
        if (moths) moths.callTo(px, py, 5000);
        HE.soft(mctx, px, py, 40 + Math.min(120, total / 3), .5);   // the photograph develops where the story landed
        const t = performance.now(), big = Math.min(1, total / 300);
        fx.push({ t0: t, dur: 900, draw: (c, p) => { c.save(); c.strokeStyle = event ? { Find: '#f3c22f', Chain: '#e2486f', Risk: '#c4622c', Spare: '#6f9148', Repeat: '#3a78c3' }[event] : '#fff'; c.globalAlpha = 1 - p; c.lineWidth = 4 + big * 6; c.beginPath(); c.arc(px, py, 20 + (90 + big * 120) * p, 0, 6.2832); c.stroke(); c.restore(); } });
      },
      destroy() { alive = false; canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerdown', onMove); canvas.removeEventListener('pointerleave', onLeave); },
    };
  }
  return { mount, LIGHT, PLACES };
})();
