/* scene: buyout — /features/buyout/ hero. Scope: [data-bopage] */
(() => {
  const root = document.querySelector('[data-bopage]');
  if (!root) return;
  const q = s => root.querySelector(s);
  const bar = q('[data-bopage-bar]'), saved = q('[data-bopage-saved]'), left = q('[data-bopage-left]');
  const payline = q('[data-bopage-payline]'), stage = q('[data-bopage-stage]'), s0 = q('[data-bopage-s0]'), s1 = q('[data-bopage-s1]');

  const PRICE = 7200000, DOWN = 1500000, RATE = 9000;
  const kk = document.documentElement.lang === 'kk';
  const T = { down: kk ? 'Жарна' : 'Взнос', buy: kk ? 'Сатып алу' : 'Выкуп',
    nextDown: kk ? 'Келесі төлем · 9 000 ₸ · жарнаға' : 'Ближайший платёж · 9 000 ₸ · во взнос',
    nextBuy: kk ? 'Келесі төлем · 9 000 ₸ · сатып алуға' : 'Ближайший платёж · 9 000 ₸ · в выкуп',
    paid: kk ? 'Kaspi · 9 000 ₸ · сатып алуға' : 'Kaspi · 9 000 ₸ · в выкуп' };
  const money = n => Math.round(n).toLocaleString('ru-RU') + ' ₸';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;

  let cur = 0, raf = 0;
  const paint = v => {
    cur = v;
    saved.textContent = money(v);
    left.textContent = money(PRICE - v);
    bar.style.setProperty('--p', (v / PRICE).toFixed(4));
  };
  /* numbers and bar travel together — never jump */
  const tween = (to, ms) => new Promise(res => {
    cancelAnimationFrame(raf);
    const from = cur, t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / ms), k = 1 - Math.pow(1 - p, 3);
      paint(from + (to - from) * k);
      p < 1 ? (raf = requestAnimationFrame(tick)) : res();
    };
    raf = requestAnimationFrame(tick);
  });
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const setStage = buy => {
    stage.textContent = buy ? T.buy : T.down;
    s0.classList.toggle('is-on', !buy); s0.classList.toggle('is-done', buy);
    s1.classList.toggle('is-on', buy);
    payline.textContent = buy ? T.nextBuy : T.nextDown;
  };
  const step = s => { root.dataset.step = s; };

  const final = () => { step('hold'); setStage(true); payline.textContent = T.paid; paint(DOWN + RATE); };

  if (still) { final(); return; }

  const run = async () => {
    while (true) {
      step('in'); setStage(false); paint(0);
      await wait(700);
      step('grow'); await tween(DOWN, 1700);          /* полоса копится до взноса */
      await wait(350);
      step('stage'); setStage(true);                  /* этап меняется сам */
      await wait(1000);
      step('pay'); payline.textContent = T.paid; await tween(DOWN + RATE, 650);     /* остаток −9 000 */
      step('hold'); await wait(3400);                 /* финал держится дольше */
      step('reset'); await wait(550);
    }
  };
  let started = false;
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; run(); }
  }, { threshold: .35 }).observe(root);
})();
