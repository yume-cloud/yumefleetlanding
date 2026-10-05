/* leads scene: WhatsApp message → lead card → cursor moves it to «Проверка» → registry checks come back */
(() => {
  const root = document.querySelector('[data-leadplay]');
  if (!root) return;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 900px)').matches;
  const sts = [...root.querySelectorAll('[data-leadplay-st]')];
  const fill = root.querySelector('[data-leadplay-fill]');
  const stage = root.querySelector('[data-leadplay-stage]');
  const c1 = root.querySelector('[data-leadplay-c1]'), c2 = root.querySelector('[data-leadplay-c2]');
  const cur = root.querySelector('.leadplay__cur');
  const names = ['Новая', 'Связались', 'Документы', 'Проверка'];

  /* stage i: buttons before it are done, bar fills to its centre (CSS transition, no jump) */
  const toStage = i => {
    sts.forEach((b, k) => { b.classList.toggle('is-done', k < i); b.classList.toggle('is-on', k === i); });
    if (fill) fill.style.setProperty('--p', ((i + .5) / 4 * 100) + '%');
    if (stage) stage.textContent = names[i];
  };
  const set = (step, ok1, ok2) => {
    root.dataset.step = step;
    c1?.classList.toggle('is-ok', !!ok1);
    c2?.classList.toggle('is-ok', !!ok2);
  };

  if (reduced || narrow) { toStage(3); set('done', true, true); if (cur) cur.style.display = 'none'; return; }

  /* cursor tip at the last letter of «Проверка»: right edge minus 18px */
  const aim = () => {
    const b = sts[3].getBoundingClientRect(), r = root.getBoundingClientRect();
    cur.style.left = (b.right - r.left - 18 - 5) + 'px'; /* svg tip sits 5px inside its box */
    cur.style.top = (b.top - r.top + b.height / 2 - 6) + 'px';
  };
  const park = () => {
    const r = root.getBoundingClientRect();
    cur.style.left = (r.width * .42) + 'px';
    cur.style.top = (r.height * .78) + 'px';
  };

  let started = false;
  const loop = async () => {
    while (true) {
      toStage(0); set('in'); cur.style.opacity = '0'; park();
      await wait(1100);
      set('msg');
      await wait(1300);
      set('lead');
      await wait(1500);
      set('aim'); aim(); cur.style.opacity = '1';
      await wait(780);
      root.dataset.press = '1'; sts[3].classList.add('is-press');
      await wait(160);
      root.dataset.press = '0'; sts[3].classList.remove('is-press');
      toStage(3); set('check');
      await wait(500); cur.style.opacity = '0';
      await wait(900); set('check', true);
      await wait(600); set('done', true, true);
      await wait(3600); /* final frame holds longest */
    }
  };
  new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .35 }).observe(root);
})();
