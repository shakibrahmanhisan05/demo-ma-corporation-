/* Hero port scene: crane lifts a container from the ship onto an
   Alliance Transport truck, which drives it off. Synced status card. */
(function () {
  'use strict';
  const svg = document.querySelector('[data-port-scene]');
  if (!svg) return;
  const q = (id) => svg.getElementById ? svg.getElementById(id) : svg.querySelector('#' + id);
  const trolley = q('ps-trolley'), spreader = q('ps-spreader'), box = q('ps-box'), truck = q('ps-truck');
  const cableL = q('ps-cableL'), cableR = q('ps-cableR'), latchL = q('ps-latchL'), latchR = q('ps-latchR');
  const card = document.querySelector('[data-status-card]');
  const steps = card ? Array.from(card.querySelectorAll('.status-steps li')) : [];
  const bar = card ? card.querySelector('.status-card__bar i') : null;

  const X_SHIP = 169, X_TRUCK = 381, Y_UP = 160, Y_SHIP = 235, Y_TRUCK = 413, T = 11.5;
  const TRUCK_IN = -470, TRUCK_OUT = 330;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeIn = (t) => t * t * t;
  const seg = (t, a, b, fn = ease) => (t <= a ? 0 : t >= b ? 1 : fn((t - a) / (b - a)));
  const lerp = (a, b, p) => a + (b - a) * p;

  // [time when done]
  const STEP_DONE = [0.4, 1.6, 3.2, 7.4, 10.6];

  function frame(t) {
    // trolley x
    let tx;
    if (t < 1.7) tx = lerp(X_TRUCK, X_SHIP, seg(t, 0.1, 1.7));
    else if (t < 4.3) tx = X_SHIP;
    else tx = lerp(X_SHIP, X_TRUCK, seg(t, 4.3, 6.1));

    // container-top height under the spreader
    let c;
    if (t < 1.7) c = Y_UP;
    else if (t < 2.8) c = lerp(Y_UP, Y_SHIP, seg(t, 1.7, 2.8));
    else if (t < 3.2) c = Y_SHIP;
    else if (t < 4.3) c = lerp(Y_SHIP, Y_UP, seg(t, 3.2, 4.3));
    else if (t < 6.1) c = Y_UP;
    else if (t < 7.3) c = lerp(Y_UP, Y_TRUCK, seg(t, 6.1, 7.3));
    else if (t < 7.7) c = Y_TRUCK;
    else c = lerp(Y_TRUCK, Y_UP, seg(t, 7.7, 8.8));

    // truck
    let off;
    if (t < 2.6) off = lerp(TRUCK_IN, 0, seg(t, 0, 2.6, easeOut));
    else if (t < 8.6) off = 0;
    else off = lerp(0, TRUCK_OUT, seg(t, 8.6, 10.8, easeIn));

    // box
    let bx, by, bo = 1;
    if (t < 3.0) { bx = X_SHIP; by = Y_SHIP; bo = Math.min(1, t / 0.6); }
    else if (t < 7.5) { bx = tx; by = c; }
    else { bx = X_TRUCK + off; by = Y_TRUCK; }
    const latched = t >= 2.9 && t < 7.5;

    trolley.setAttribute('transform', `translate(${tx.toFixed(2)} 0)`);
    spreader.setAttribute('transform', `translate(${tx.toFixed(2)} ${(c - 4).toFixed(2)})`);
    box.setAttribute('transform', `translate(${bx.toFixed(2)} ${by.toFixed(2)})`);
    box.setAttribute('opacity', bo.toFixed(2));
    truck.setAttribute('transform', `translate(${(X_TRUCK + off).toFixed(2)} 426)`);
    const sy = (c - 4).toFixed(2);
    cableL.setAttribute('x1', (tx - 9).toFixed(2)); cableL.setAttribute('y1', 138); cableL.setAttribute('x2', (tx - 24).toFixed(2)); cableL.setAttribute('y2', sy);
    cableR.setAttribute('x1', (tx + 9).toFixed(2)); cableR.setAttribute('y1', 138); cableR.setAttribute('x2', (tx + 24).toFixed(2)); cableR.setAttribute('y2', sy);
    const lc = latched ? '#3ddc84' : '#ff8c42';
    latchL.setAttribute('fill', lc); latchR.setAttribute('fill', lc);

    if (steps.length) {
      let done = 0;
      STEP_DONE.forEach((d) => { if (t >= d) done++; });
      steps.forEach((li, i) => {
        li.classList.toggle('is-done', i < done);
        li.classList.toggle('is-active', i === done);
      });
      if (bar) bar.style.width = (done / steps.length * 100) + '%';
    }
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    frame(7.6);
    return;
  }

  let elapsed = 0, last = 0, raf = 0, running = false;
  const loop = (now) => {
    if (!last) last = now;
    elapsed += Math.min(0.1, (now - last) / 1000);
    last = now;
    frame(elapsed % T);
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (running) return; running = true; last = 0; raf = requestAnimationFrame(loop); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  let inView = true;
  frame(0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((e) => { inView = e.isIntersecting; inView ? start() : stop(); }), { threshold: 0.05 }).observe(svg);
  } else start();
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (inView) start(); });
})();
