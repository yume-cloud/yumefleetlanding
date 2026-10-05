/* scene: ai — /integrations/ai/ hero. Question «У кого долг?» is typed, cursor clicks «Спросить», answer: Ерлан С., 2 дня, 18 000 ₸. Scope: [data-aiplay] */
(() => {
  const root = document.querySelector('[data-aiplay]');
  if (!root) return;
  const q = s => root.querySelector(s);
  const stage = q('[data-aiplay-stage]'), input = q('[data-aiplay-input]'), text = q('[data-aiplay-text]');
  const btn = q('[data-aiplay-btn]'), btnB = q('[data-aiplay-btn-b]');
  const daysEl = q('[data-aiplay-days]'), sumEl = q('[data-aiplay-sum]'), cur = q('.aiplay__cur');
  const chips = [q('[data-aiplay-s0]'), q('[data-aiplay-s1]'), q('[data-aiplay-s2]')];

  const RATE = 9000, DAYS = 2, DEBT = RATE * DAYS;                    /* 2 × 9 000 = 18 000 ₸ */
  const kk = document.documentElement.lang === 'kk';
  const QUESTION = kk ? 'Кімде қарыз бар?' : 'У кого долг?';
  const T = kk ? ['Сұрақ', 'Парк деректері', 'Жауап'] : ['Вопрос', 'Данные парка', 'Ответ'];
  const dayWord = n => kk ? n + ' күн' : (n === 1 ? '1 день' : n >= 2 && n <= 4 ? n + ' дня' : n + ' дней');
  const money = n => Math.round(n).toLocaleString('ru-RU') + ' ₸';
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;

  /* числа доезжают сами — без скачка */
  const tween = (from, to, ms, paint) => new Promise(res => {
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / ms), k = 1 - Math.pow(1 - p, 3);
      paint(from + (to - from) * k);
      p < 1 ? requestAnimationFrame(tick) : res();
    };
    requestAnimationFrame(tick);
  });
  const paintDays = v => { daysEl.textContent = dayWord(Math.round(v)); };
  const paintSum = v => { sumEl.textContent = money(v); };

  const setChips = n => {
    stage.textContent = T[Math.min(n, 2)];
    chips.forEach((c, i) => { c.classList.toggle('is-done', i < n); c.classList.toggle('is-on', i === n); });
  };
  const step = s => { root.dataset.step = s; };

  /* курсор: остриё у последней буквы подписи кнопки, не правее (right − 18) */
  const aim = (el, textEl) => {
    const r = root.getBoundingClientRect(), b = el.getBoundingClientRect(), t = (textEl || el).getBoundingClientRect();
    const x = Math.min(t.right - 6, b.right - 18);
    cur.style.left = (x - r.left) + 'px';
    cur.style.top = (t.top - r.top + t.height / 2 - 6) + 'px';
  };
  const park = () => {
    const r = root.getBoundingClientRect();
    cur.style.left = (r.width * .55) + 'px';
    cur.style.top = (r.height * .92) + 'px';
  };
  const press = async el => {
    root.dataset.press = '1'; el.classList.add('is-press');
    await wait(150);
    root.dataset.press = '0'; el.classList.remove('is-press');
  };
  const type = async s => {
    text.textContent = '';
    input.classList.add('has-text');
    for (const ch of s) { text.textContent += ch; await wait(ch === ' ' ? 120 : 70 + Math.random() * 50); }
  };

  const reset = () => {
    text.textContent = ''; input.classList.remove('has-text');
    paintDays(0); paintSum(0);
    cur.style.opacity = '0';
  };
  const final = () => {
    reset();
    text.textContent = QUESTION; input.classList.add('has-text');
    paintDays(DAYS); paintSum(DEBT);
    setChips(2); chips[2].classList.replace('is-on', 'is-done');
    step('hold');
  };

  if (still) { final(); return; }

  const run = async () => {
    while (true) {
      reset(); step('in'); setChips(0); park();
      await wait(800);
      step('type');                                   /* вопрос печатается */
      await type(QUESTION);
      await wait(350);
      step('aim'); aim(btn, btnB); cur.style.opacity = '1';   /* курсор к «Спросить» */
      await wait(720);
      await press(btn);
      cur.style.opacity = '0';
      step('think'); setChips(1);                     /* смотрит аренды и долги */
      await wait(1300);
      step('answer'); setChips(2);                    /* Ерлан С. · 2 дня · 18 000 ₸ */
      await wait(350);
      await Promise.all([tween(0, DAYS, 700, paintDays), tween(0, DEBT, 900, paintSum)]);
      step('hold'); chips[2].classList.replace('is-on', 'is-done');
      await wait(3800);                               /* финал держится дольше */
      step('reset'); await wait(550);
    }
  };
  let started = false;
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; run(); }
  }, { threshold: .35 }).observe(root);
})();
