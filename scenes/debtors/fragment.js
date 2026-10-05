/* debtors scene: request → registry check by IIN (bar travels) → "Чисто" with date → issue unlocks. No cursor: nothing is clicked. Scope: [data-debtplay] */
(() => {
  const root = document.querySelector('[data-debtplay]');
  if (!root) return;
  const bar = root.querySelector('[data-debtplay-bar]');
  const dateEl = root.querySelector('[data-debtplay-date]');

  const kk = document.documentElement.lang === 'kk';
  const MONTHS = kk
    ? ['қаң', 'ақп', 'нау', 'сәу', 'мам', 'мау', 'шіл', 'там', 'қыр', 'қаз', 'қар', 'жел']
    : ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  /* the date in the card is "today": the check happens on the request, not in the past */
  const now = new Date();
  dateEl.textContent = now.getDate() + ' ' + MONTHS[now.getMonth()] + ', ' +
    String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;
  const step = s => { root.dataset.step = s; };
  const paint = v => bar.style.setProperty('--p', v.toFixed(3));

  /* the bar travels — rAF tween, never a jump */
  const tween = (from, to, ms) => new Promise(res => {
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / ms), k = 1 - Math.pow(1 - p, 3);
      paint(from + (to - from) * k);
      p < 1 ? requestAnimationFrame(tick) : res();
    };
    requestAnimationFrame(tick);
  });

  if (still) { paint(1); step('hold'); return; }

  const run = async () => {
    while (true) {
      paint(0); step('in');
      await wait(800);
      step('check');                       /* "Проверяем…" with spinner */
      await tween(0, .72, 1400);
      await wait(350);                     /* registry answers a beat later */
      await tween(.72, 1, 500);
      step('clean');                       /* ✓ Чисто, date, issue unlocks */
      await wait(600);
      step('hold');
      await wait(3800);                    /* final frame holds longest */
      step('reset'); await wait(550);
    }
  };
  let started = false;
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; run(); }
  }, { threshold: .35 }).observe(root);
})();
