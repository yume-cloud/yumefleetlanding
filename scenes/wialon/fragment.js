/* wialon scene: trail draws to the pin → mileage counts up → footer. No cursor: nothing is clicked. */
(() => {
  const gps = document.querySelector('[data-gpsplay]');
  if (!gps) return;
  const nums = [...gps.querySelectorAll('[data-gpsplay-num]')];
  const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const show = (el, v) => { el.textContent = fmt(v) + (el.dataset.gpsplaySuffix || ''); };
  const ease = t => 1 - Math.pow(1 - t, 3);
  const timers = new Map();
  const count = (el, ms) => {
    cancelAnimationFrame(timers.get(el));
    const to = Number(el.dataset.gpsplayNum), t0 = performance.now();
    const tick = now => { const p = Math.max(0, Math.min(1, (now - t0) / ms)); show(el, to * ease(p)); if (p < 1) timers.set(el, requestAnimationFrame(tick)); };
    timers.set(el, requestAnimationFrame(tick));
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 900px)').matches;
  if (reduced || narrow) {
    gps.dataset.step = 'done';
    nums.forEach(el => show(el, Number(el.dataset.gpsplayNum)));
    return;
  }
  const steps = [['0', 420], ['map', 1700], ['odo', 1500], ['done', 3400]];
  const set = step => {
    gps.dataset.step = step;
    if (step === '0') { nums.forEach(el => { cancelAnimationFrame(timers.get(el)); show(el, 0); }); return; }
    nums.filter(el => el.dataset.gpsplayAt === step).forEach(el => count(el, 1200));
  };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let n = 0, started = false;
  const loop = async () => { while (true) { const [step, pause] = steps[n % steps.length]; set(step); n++; await wait(pause); } };
  new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .35 }).observe(gps);
})();
