/* egov scene: driver's phone — contract waits for signature → cursor taps «Подписать в eGov mobile» → eGov sheet, bar travels 0 → 100 % → status «Подписан», PDF card grows in. No SMS code is shown. Scope: [data-egovplay] */
(() => {
  const root = document.querySelector('[data-egovplay]');
  if (!root) return;
  const q = s => root.querySelector(s);
  const btn = q('[data-egovplay-btn]'), btnA = q('[data-egovplay-btn-a]');
  const stEl = q('[data-egovplay-st]'), hintEl = q('[data-egovplay-hint]');
  const sheetSt = q('[data-egovplay-sheet-st]'), bar = q('[data-egovplay-bar]');
  const cur = q('.egovplay__cur');

  const kk = document.documentElement.lang === 'kk';
  const T = {
    wait: kk ? 'Қол қоюды күтеді' : 'Ожидает подписи',
    signed: kk ? 'Қол қойылды' : 'Подписан',
    hintA: kk ? 'Жүргізуші қол қояды, кеңсеге келу қажет емес' : 'Подписывает водитель, приезжать в офис не нужно',
    hintB: kk ? 'Қол қойылған PDF жүйеде' : 'Подписанный PDF в системе',
    shSign: kk ? 'Қол қою' : 'Подписание', shOk: kk ? 'Қол қойылды' : 'Подписано'
  };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;

  /* the bar travels — rAF tween, never a jump */
  const tween = (from, to, ms, paint) => new Promise(res => {
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / ms), k = 1 - Math.pow(1 - p, 3);
      paint(from + (to - from) * k);
      p < 1 ? requestAnimationFrame(tick) : res();
    };
    requestAnimationFrame(tick);
  });
  const step = s => { root.dataset.step = s; };

  /* cursor tip at the last letter of the caption, never right of (button right - 18) */
  const aim = (el, textEl) => {
    const r = root.getBoundingClientRect(), b = el.getBoundingClientRect();
    const rg = document.createRange(); rg.selectNodeContents(textEl || el);   /* the glyphs, not the full-width caption box */
    const t = rg.getBoundingClientRect();
    const x = Math.min(t.right - 6, b.right - 18);
    cur.style.left = (x - r.left) + 'px';
    cur.style.top = (b.top - r.top + b.height / 2 - 6) + 'px';
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

  const reset = () => {
    stEl.textContent = T.wait; hintEl.textContent = T.hintA; sheetSt.textContent = T.shSign;
    bar.style.setProperty('--p', '0');
    cur.style.opacity = '0';
  };
  const final = () => {
    reset();
    stEl.textContent = T.signed; hintEl.textContent = T.hintB; sheetSt.textContent = T.shOk;
    bar.style.setProperty('--p', '1');
    step('hold');
  };

  if (still) { final(); return; }

  const run = async () => {
    while (true) {
      reset(); step('in'); park();
      await wait(1000);

      /* cursor goes to the eGov button and taps */
      step('aim'); aim(btn, btnA); cur.style.opacity = '1';
      await wait(760);
      await press(btn);
      cur.style.opacity = '0';

      /* eGov mobile sheet: the signing bar travels */
      step('sign');
      await wait(650);
      await tween(0, 1, 1400, v => bar.style.setProperty('--p', v.toFixed(3)));
      sheetSt.textContent = T.shOk;
      await wait(550);

      /* sheet closes, status «Подписан», PDF card grows into the rental card */
      step('signed');
      stEl.textContent = T.signed;
      await wait(450);
      hintEl.textContent = T.hintB;
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
