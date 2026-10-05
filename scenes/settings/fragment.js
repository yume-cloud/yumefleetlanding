/* settings scene: park rules. Cursor flips one switch (Kaspi); the rental below picks up the rule. */
(() => {
  const root = document.querySelector('[data-setplay]');
  if (!root) return;
  const sw = root.querySelector('[data-setplay-kaspi]');
  const rate = root.querySelector('[data-setplay-rate]');
  const week = root.querySelector('[data-setplay-week]');
  const cur = root.querySelector('.setplay__cur');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 900px)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ') + ' ₸';

  /* number rolls from its current value to the target; no jumps */
  const roll = (el, to, ms) => {
    const from = Number(el.dataset.setplayNow || 0);
    if (ms <= 0 || from === to) { el.dataset.setplayNow = to; el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, Math.max(0, (now - t0) / ms)), e = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * e;
      el.dataset.setplayNow = v; el.textContent = fmt(v);
      if (p < 1) requestAnimationFrame(tick); else el.dataset.setplayNow = to;
    };
    requestAnimationFrame(tick);
  };

  const kaspi = on => { sw.classList.toggle('is-on', on); sw.setAttribute('aria-checked', String(on)); root.dataset.step = on ? '2' : '1'; };
  sw.addEventListener('click', () => kaspi(!sw.classList.contains('is-on')));

  if (reduced || narrow) {
    roll(rate, 9000, 0); roll(week, 63000, 0); kaspi(true);
    return;
  }

  /* cursor tip goes to the last letter of the control: right edge minus 18px */
  const aim = () => {
    const b = sw.getBoundingClientRect(), r = root.getBoundingClientRect();
    cur.style.left = (b.right - r.left - 18 - 5) + 'px';
    cur.style.top = (b.top - r.top + b.height / 2 - 3) + 'px';
  };

  let started = false;
  const loop = async () => {
    while (true) {
      /* reset without reverse animations, then step 0 → 1: rate and weekly sum roll up */
      root.dataset.reset = '1';
      root.dataset.step = '0'; sw.classList.remove('is-on'); sw.setAttribute('aria-checked', 'false');
      roll(rate, 0, 0); roll(week, 0, 0);
      void root.offsetWidth; /* commit the no-transition state before releasing it */
      await wait(60);
      root.dataset.reset = '0';
      await wait(400);
      root.dataset.step = '1';
      roll(rate, 9000, 900); roll(week, 63000, 1100);
      await wait(1700);
      /* cursor to the Kaspi switch, press */
      aim(); cur.style.opacity = '1';
      await wait(760);
      root.dataset.press = '1'; sw.classList.add('is-press');
      await wait(160);
      kaspi(true); root.dataset.press = '0'; sw.classList.remove('is-press');
      /* final step holds longest */
      await wait(4200);
      cur.style.opacity = '0';
      await wait(400);
    }
  };
  new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .35 }).observe(root);
})();
