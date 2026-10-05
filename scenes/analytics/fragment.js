/* analytics scene: revenue bars → ring of cars in rent → debt with breakdown. No cursor: nothing is clicked. */
(() => {
  const ana = document.querySelector('[data-anaplay]');
  if (!ana) return;
  const nums = [...ana.querySelectorAll('[data-anaplay-num]')];
  const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const show = (el, v) => { el.textContent = fmt(v) + (el.dataset.anaplaySuffix || ''); };
  const ease = t => 1 - Math.pow(1 - t, 3);
  const timers = new Map();
  const count = (el, ms) => {
    cancelAnimationFrame(timers.get(el));
    const to = Number(el.dataset.anaplayNum), t0 = performance.now();
    const tick = now => { const p = Math.max(0, Math.min(1, (now - t0) / ms)); show(el, to * ease(p)); if (p < 1) timers.set(el, requestAnimationFrame(tick)); };
    timers.set(el, requestAnimationFrame(tick));
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 900px)').matches;
  if (reduced || narrow) {
    ana.dataset.step = 'debt';
    nums.forEach(el => show(el, Number(el.dataset.anaplayNum)));
    return;
  }
  const steps = [['0', 420], ['rev', 1500], ['load', 1400], ['debt', 3200]];
  const set = step => {
    ana.dataset.step = step;
    if (step === '0') { nums.forEach(el => { cancelAnimationFrame(timers.get(el)); show(el, 0); }); return; }
    nums.filter(el => el.dataset.anaplayAt === step).forEach(el => count(el, step === 'load' ? 900 : 1100));
  };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let n = 0, started = false;
  const loop = async () => { while (true) { const [step, pause] = steps[n % steps.length]; set(step); n++; await wait(pause); } };
  new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .35 }).observe(ana);
})();
