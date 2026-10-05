/* wazzup scene: driver asks in WhatsApp → manager answers from the park number → debt beside the chat lights up. No cursor. Scope: [data-wazplay] */
(() => {
  const root = document.querySelector('[data-wazplay]');
  if (!root) return;
  const debtEl = root.querySelector('[data-wazplay-debt]');
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;

  const RATE = 9000, DAYS = 3, DEBT = RATE * DAYS; /* 27 000 ₸, same figure as in the reply bubble */
  const money = n => Math.round(n).toLocaleString('ru-RU') + ' ₸';
  const step = s => { root.dataset.step = s; };

  /* the number travels — rAF tween, never a jump */
  const tween = (from, to, ms) => new Promise(res => {
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / ms), k = 1 - Math.pow(1 - p, 3);
      debtEl.textContent = money(from + (to - from) * k);
      p < 1 ? requestAnimationFrame(tick) : res();
    };
    requestAnimationFrame(tick);
  });

  if (still) { debtEl.textContent = money(DEBT); step('hold'); return; }

  const run = async () => {
    while (true) {
      debtEl.textContent = money(0); step('in');
      await tween(0, DEBT, 900);          /* panel is live: debt counts up to 27 000 */
      step('typing');                     /* Ерлан is typing; «3 дня не оплачены» shows now that the number has arrived */
      await wait(1300);
      step('msg');                        /* his question lands */
      await wait(1500);
      step('reply');                      /* manager answers from the park number, debt row highlights */
      await wait(900);
      step('hold');                       /* final frame holds longest */
      await wait(3800);
      step('reset'); await wait(550);
    }
  };

  let started = false;
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; run(); }
  }, { threshold: .35 }).observe(root);
})();
