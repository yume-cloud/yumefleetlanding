/* shifts scene: one car, two rentals. Cursor switches the shift; debt of one never lands on the other. */
(() => {
  const root = document.querySelector('[data-shiftplay]');
  if (!root) return;
  const tabs = [...root.querySelectorAll('[data-shiftplay-tab]')];
  const facts = [...root.querySelectorAll('[data-shiftplay-fact]')];
  const cur = root.querySelector('.shiftplay__cur');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 900px)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ') + ' ₸';

  /* number rolls from its current value to the target; no jumps */
  const roll = (el, to, ms) => {
    const from = Number(el.dataset.shiftplayNow || 0);
    if (ms <= 0 || from === to) { el.dataset.shiftplayNow = to; el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * e;
      el.dataset.shiftplayNow = v; el.textContent = fmt(v);
      if (p < 1) requestAnimationFrame(tick); else el.dataset.shiftplayNow = to;
    };
    requestAnimationFrame(tick);
  };

  const set = (i, instant) => {
    root.dataset.step = i;
    tabs.forEach(t => t.classList.toggle('is-on', t.dataset.shiftplayTab === String(i)));
    facts.forEach(f => f.classList.toggle('is-on', f.dataset.shiftplayFact === String(i)));
    const sum = facts[i].querySelector('[data-shiftplay-sum]');
    if (sum) roll(sum, Number(sum.dataset.shiftplaySum), instant ? 0 : 900);
    const h = facts[i].offsetHeight; if (h) root.querySelector('.shiftplay__facts').style.minHeight = h + 'px';
  };

  tabs.forEach(t => t.addEventListener('click', () => set(Number(t.dataset.shiftplayTab))));

  if (reduced || narrow) { set(1, true); return; }

  set(0, true);
  /* cursor tip goes to the last letter of the button text, never right of (button right - 18) */
  const aim = i => {
    const b = tabs[i].getBoundingClientRect(), r = root.getBoundingClientRect();
    const rng = document.createRange(); rng.selectNodeContents(tabs[i]);
    const t = rng.getBoundingClientRect();
    const x = Math.min(t.right - 4, b.right - 18);
    cur.style.left = (x - r.left - 5) + 'px';
    cur.style.top = (b.top - r.top + b.height / 2 - 3) + 'px';
  };
  const steps = [[1, 3600], [0, 2200]]; /* [tab to click, hold after click]; final step (Асан) holds longer */
  let n = 0, started = false;
  const loop = async () => {
    while (true) {
      const [i, hold] = steps[n % steps.length];
      aim(i); cur.style.opacity = '1';
      await wait(760);
      root.dataset.press = '1'; tabs[i].classList.add('is-press');
      await wait(160);
      set(i); root.dataset.press = '0'; tabs[i].classList.remove('is-press');
      n++;
      await wait(hold);
    }
  };
  new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .35 }).observe(root);
})();
