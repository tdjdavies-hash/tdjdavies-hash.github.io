/* Tom Davies: shared project page script.
   Draws a small pixel-art dusk scene behind each project hero, tinted with the page accent.
   Static when the visitor prefers reduced motion; pauses when off screen. */
(() => {
  'use strict';
  const c = document.querySelector('.proj-sky');
  if (!c) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const g = c.getContext('2d');
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const noise1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, 7.3) + (hash(i + 1, 7.3) - hash(i, 7.3)) * u; };
  const acc = (getComputedStyle(document.documentElement).getPropertyValue('--acc') || '#e0a458').trim();
  const rgb = (() => { const m = /^#?([0-9a-f]{6})$/i.exec(acc); const n = m ? parseInt(m[1], 16) : 0xe0a458; return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(','); })();
  let W = 0, H = 0, P = 3;
  const STARS = Array.from({ length: 80 }, (_, i) => [hash(i, 1), hash(1, i) * .55, hash(i, 9) * 6.28]);
  function size(){
    const r = c.getBoundingClientRect();
    P = r.width > 1400 ? 4 : r.width > 700 ? 3 : 2;
    W = Math.max(1, Math.ceil(r.width / P)); H = Math.max(1, Math.ceil(r.height / P));
    c.width = W; c.height = H; g.imageSmoothingEnabled = false;
  }
  function glow(x, y, r, a){ const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); q.addColorStop(1, 'rgba(' + rgb + ',0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = q; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalCompositeOperation = 'source-over'; }
  function draw(t){
    const q = g.createLinearGradient(0, 0, 0, H);
    q.addColorStop(0, '#120d22'); q.addColorStop(.5, '#2d2244'); q.addColorStop(.85, '#4a3a5a'); q.addColorStop(1, '#5b4566');
    g.fillStyle = q; g.fillRect(0, 0, W, H);
    STARS.forEach(([x, y, p]) => { const a = reduce ? .65 : .3 + .7 * Math.abs(Math.sin(t * .7 + p)); g.fillStyle = 'rgba(240,230,255,' + a.toFixed(2) + ')'; g.fillRect(Math.round(x * W), Math.round(y * H), 1, 1); });
    // moon
    const mx = Math.round(W * .86), my = Math.round(H * .22), mr = Math.max(4, Math.round(Math.min(W, H) * .06));
    const mg = g.createRadialGradient(mx, my, 0, mx, my, mr * 4); mg.addColorStop(0, 'rgba(240,220,200,.2)'); mg.addColorStop(1, 'rgba(240,220,200,0)');
    g.fillStyle = mg; g.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
    g.fillStyle = '#ece0cb'; g.beginPath(); g.arc(mx, my, mr, 0, 6.283); g.fill();
    // a slow cloud band
    const drift = reduce ? 0 : t * 1.5;
    g.fillStyle = 'rgba(143,108,125,.18)';
    for (let x = 0; x < W; x += 2){ const v = noise1((x + drift) * .03); if (v > .55) g.fillRect(x, Math.round(H * .34 + v * 6), 2, 2); }
    // hills
    [[H * .78, H * .3, .014, '#3d3157'], [H * .9, H * .2, .022, '#2b2242']].forEach(([base, amp, fr, col]) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W + 2; x += 2){ const v = x * fr + 40; g.lineTo(x, Math.round(base - (noise1(v) * .65 + noise1(v * 2.7 + 10) * .35) * amp)); }
      g.lineTo(W, H); g.closePath(); g.fill();
    });
    // a lantern post on the far ridge, lit in the page colour
    const lx = Math.round(W * .74), ly = Math.round(H * .9 - (noise1((lx) * .022 + 40) * .65 + noise1(((lx) * .022 + 40) * 2.7 + 10) * .35) * H * .2);
    g.fillStyle = '#1b1426'; g.fillRect(lx, ly - 10, 1, 10); g.fillRect(lx - 1, ly - 11, 3, 1);
    const p = reduce ? .8 : .65 + .35 * Math.sin(t * 1.6);
    g.fillStyle = 'rgb(' + rgb + ')'; g.fillRect(lx - 1, ly - 10, 3, 2);
    glow(lx, ly - 9, 14, .55 * p);
    // fireflies
    if (!reduce) for (let i = 0; i < 8; i++){ const a = t * (.2 + hash(i, 2) * .25) + i * 2.1, fx = Math.round(W * (.55 + .4 * hash(i, 5)) + Math.cos(a) * 14), fy = Math.round(H * .8 + Math.sin(a * 1.3) * 8), on = .5 + .5 * Math.sin(t * 2.3 + i * 3); if (on > .35){ g.fillStyle = 'rgba(255,230,140,' + on.toFixed(2) + ')'; g.fillRect(fx, fy, 1, 1); } }
    // keep the copy side readable and fade into the page
    const v = g.createLinearGradient(0, 0, W * .7, 0); v.addColorStop(0, 'rgba(12,8,20,.6)'); v.addColorStop(1, 'rgba(12,8,20,0)');
    g.fillStyle = v; g.fillRect(0, 0, W * .7, H);
    const m = g.createLinearGradient(0, H * .7, 0, H); m.addColorStop(0, 'rgba(20,16,31,0)'); m.addColorStop(1, 'rgba(20,16,31,.9)');
    g.fillStyle = m; g.fillRect(0, H * .7, W, H * .3);
  }
  let on = true;
  new IntersectionObserver(es => es.forEach(e => { on = e.isIntersecting; })).observe(c);
  size();
  window.addEventListener('resize', () => { size(); if (reduce) draw(2); });
  if (reduce){ draw(2); return; }
  const frame = now => { if (on) draw(now / 1000); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
})();
