/* scene: erap — /integrations/erap/ hero. Scope: [data-erapplay] */
(() => {
  const root = document.querySelector('[data-erapplay]');
  if (!root) return;
  const q = s => root.querySelector(s);
  const stage = q('[data-erapplay-stage]'), mark = q('[data-erapplay-mark]'), segA = q('[data-erapplay-seg-a]');
  const amount = q('[data-erapplay-amount]');
  const chips = [q('[data-erapplay-s0]'), q('[data-erapplay-s1]'), q('[data-erapplay-s2]'), q('[data-erapplay-s3]')];

  const FINE = 21625;
  /* 14:32 на шкале 08:00–08:00 (24 ч): (14.533 − 8) / 24 */
  const MARK_X = ((14 + 32 / 60) - 8) / 24;
  const kk = document.documentElement.lang === 'kk';
  const T = kk ? ['Хаттама', 'Мемнөмір', 'Жүргізуші', 'Қарызға'] : ['Протокол', 'Госномер', 'Водитель', 'В долг'];
  const money = n => '+' + Math.round(n).toLocaleString('ru-RU') + ' ₸';
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;

  let cur = 0, raf = 0;
  const paint = v => { cur = v; amount.textContent = money(v); };
  /* сумма доезжает сама — без скачка */
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

  const setChips = n => {
    stage.textContent = T[Math.min(n, 3)];
    chips.forEach((c, i) => { c.classList.toggle('is-done', i < n); c.classList.toggle('is-on', i === n); });
  };
  const step = s => { root.dataset.step = s; };

  const final = () => {
    step('hold'); setChips(3); chips[3].classList.replace('is-on', 'is-done');
    mark.style.setProperty('--x', MARK_X.toFixed(4)); segA.classList.add('is-on'); paint(FINE);
  };

  if (still) { final(); return; }

  const run = async () => {
    while (true) {
      step('in'); setChips(0); paint(0);
      mark.style.setProperty('--x', '0'); segA.classList.remove('is-on');
      await wait(900);
      step('car'); setChips(1);                               /* госномер → машина */
      await wait(1000);
      step('who'); setChips(2);                               /* метка едет к 14:32 */
      await wait(60); mark.style.setProperty('--x', MARK_X.toFixed(4));
      await wait(1150); segA.classList.add('is-on');
      await wait(250);
      step('found');                                          /* «Ерлан С. был за рулём» */
      await wait(900);
      step('debt'); setChips(3); await tween(FINE, 900);      /* +21 625 ₸ к долгу */
      step('hold'); chips[3].classList.replace('is-on', 'is-done');
      await wait(3600);                                       /* финал держится дольше */
      step('reset'); await wait(550);
    }
  };
  let started = false;
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; run(); }
  }, { threshold: .35 }).observe(root);
})();
