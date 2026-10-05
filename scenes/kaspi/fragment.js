/* kaspi scene: driver's phone — debt 27 000 → picks two days → pays 18 000 in Kaspi → debt 9 000. Cursor clicks days and the pay button. Scope: [data-kpay] */
(() => {
  const root = document.querySelector('[data-kpay]');
  if (!root) return;
  const q = s => root.querySelector(s);
  const days = [...root.querySelectorAll('[data-kpay-day]')];
  const btn = q('[data-kpay-btn]'), btnB = q('[data-kpay-btn-b]'), sumEl = q('[data-kpay-sum]');
  const debtEl = q('[data-kpay-debt]'), noteEl = q('[data-kpay-debtnote]'), paidEl = q('[data-kpay-paid]');
  const sheetSum = q('[data-kpay-sheet-sum]'), sheetSt = q('[data-kpay-sheet-st]'), sheetBar = q('[data-kpay-sheet-bar]');
  const cur = q('.kpay__cur');

  const RATE = 9000, DAYS = 3, DEBT = RATE * DAYS, PAY_DAYS = 2, PAY = RATE * PAY_DAYS;
  const kk = document.documentElement.lang === 'kk';
  const T = {
    note3: kk ? '3 күн төленбеген' : '3 дня не оплачены',
    note1: kk ? '1 күн төленбеген' : '1 день не оплачен',
    stPay: kk ? 'Төлем' : 'Оплата', stOk: kk ? 'Төленді' : 'Оплачено'
  };
  const money = n => Math.round(n).toLocaleString('ru-RU') + ' ₸';
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;

  /* every number travels — rAF tween, never a jump */
  const tween = (from, to, ms, paint) => new Promise(res => {
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / ms), k = 1 - Math.pow(1 - p, 3);
      paint(from + (to - from) * k);
      p < 1 ? requestAnimationFrame(tick) : res();
    };
    requestAnimationFrame(tick);
  });
  let sum = 0, debt = DEBT;
  const paintSum = v => { sum = v; sumEl.textContent = money(v); };
  const paintDebt = v => { debt = v; debtEl.textContent = money(v); };
  const step = s => { root.dataset.step = s; };

  /* cursor tip at the last letter of the button caption, never right of (button right - 18) */
  const aim = (el, textEl) => {
    const r = root.getBoundingClientRect(), b = el.getBoundingClientRect(), t = (textEl || el).getBoundingClientRect();
    const x = Math.min(t.right - 6, b.right - 18);
    cur.style.left = (x - r.left) + 'px';
    cur.style.top = (t.top - r.top + t.height / 2 - 6) + 'px';   /* tip on the caption line itself */
  };
  const park = () => {
    const r = root.getBoundingClientRect();
    cur.style.left = (r.width * .55) + 'px';
    cur.style.top = (r.height * .9) + 'px';
  };
  const press = async el => {
    root.dataset.press = '1'; el.classList.add('is-press');
    await wait(150);
    root.dataset.press = '0'; el.classList.remove('is-press');
  };

  const reset = () => {
    days.forEach(d => d.classList.remove('is-on', 'is-paid', 'is-press'));
    paintSum(0); paintDebt(DEBT);
    noteEl.textContent = T.note3; sheetSt.textContent = T.stPay;
    sheetSum.textContent = money(PAY); paidEl.textContent = money(PAY);
    sheetBar.style.setProperty('--p', '0');
    cur.style.opacity = '0';
  };
  const final = () => {
    reset();
    days.forEach((d, i) => d.classList.toggle('is-paid', i < PAY_DAYS));
    paintSum(PAY); paintDebt(DEBT - PAY); noteEl.textContent = T.note1;
    step('hold');
  };

  if (still) { final(); return; }

  const run = async () => {
    while (true) {
      reset(); step('in'); park();
      await wait(900);

      /* cursor goes to the days: first 4 окт, then 5 окт — sum travels 0 → 9 000 → 18 000 */
      aim(days[0], days[0].firstElementChild); cur.style.opacity = '1';
      await wait(720);
      await press(days[0]); days[0].classList.add('is-on'); step('pick1');
      await tween(sum, RATE, 450, paintSum);
      await wait(200);
      aim(days[1], days[1].firstElementChild);
      await wait(620);
      await press(days[1]); days[1].classList.add('is-on'); step('pick2');
      await tween(sum, PAY, 450, paintSum);
      await wait(500);

      /* then the pay button */
      step('aim'); aim(btn, btnB);
      await wait(720);
      await press(btn);
      cur.style.opacity = '0';
      step('kaspi');
      await wait(650);
      await tween(0, 1, 1300, v => sheetBar.style.setProperty('--p', v.toFixed(3)));
      sheetSt.textContent = T.stOk;
      await wait(550);

      /* sheet closes, debt travels 27 000 → 9 000 */
      step('paid');
      days.forEach((d, i) => { d.classList.remove('is-on'); d.classList.toggle('is-paid', i < PAY_DAYS); });
      await wait(400);
      await tween(debt, DEBT - PAY, 900, paintDebt);
      noteEl.textContent = T.note1;
      step('hold');
      await wait(3600);                 /* final frame holds longest */
      step('reset'); await wait(550);
    }
  };
  let started = false;
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; run(); }
  }, { threshold: .35 }).observe(root);
})();
