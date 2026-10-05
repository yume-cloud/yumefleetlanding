/* investors: investor link card — income counts, share bar fills, lease chart draws */
(() => {
  const inv = document.querySelector('[data-invplay]');
  if (!inv) return;
  const $ = (s) => inv.querySelector(s);
  const income = $('[data-inv-income]'), share = $('[data-inv-share]'), share2 = $('[data-inv-share2]'), park = $('[data-inv-park]');
  const bar = $('[data-inv-bar]'), left = $('[data-inv-left]'), paid = $('[data-inv-paid]');
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸';
  const INCOME = 270000, SHARE = 135000, TOTAL = 7200000, DOWN = 1500000; // доход за 30 дней; доля 50 %; выкуп; взнос
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const tweens = new Map();
  const tween = (el, to, ms) => {
    if (!el) return;
    cancelAnimationFrame(tweens.get(el));
    const from = el._v || 0;
    if (still || ms === 0) { el._v = to; el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const tick = (now) => {
      const k = ease(Math.min(1, (now - t0) / ms));
      const v = from + (to - from) * k;
      el._v = v; el.textContent = fmt(v);
      if (k < 1) tweens.set(el, requestAnimationFrame(tick));
    };
    tweens.set(el, requestAnimationFrame(tick));
  };
  const set = (step) => {
    inv.dataset.step = step;
    const i = ['income', 'share', 'lease', 'done'].indexOf(step);
    const ms = still ? 0 : 1100;
    tween(income, i >= 0 ? INCOME : 0, ms);
    const s = i >= 1;
    tween(share, s ? SHARE : 0, ms); tween(share2, s ? SHARE : 0, ms); tween(park, s ? INCOME - SHARE : 0, ms);
    if (bar) bar.style.setProperty('--p', s ? String(SHARE / INCOME) : '0');
    const l = i >= 2;
    tween(left, l ? TOTAL - DOWN : TOTAL, still ? 0 : 1500);
    tween(paid, l ? DOWN : 0, still ? 0 : 1500);
  };
  if (still) { set('done'); return; }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const script = [['open', 500], ['income', 1500], ['share', 1700], ['lease', 2100], ['done', 3600]];
  let n = 0, started = false;
  const loop = async () => { while (true) { const [step, pause] = script[n % script.length]; set(step); n++; await wait(pause); } };
  new IntersectionObserver((es) => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: 0.35 }).observe(inv);
})();
