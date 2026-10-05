/* documents: contract fills from the rental, cursor signs it in eGov */
(() => {
  const doc = document.querySelector('[data-docplay]');
  if (!doc) return;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 900px)').matches;
  const btn = doc.querySelector('[data-docplay-btn]');
  const cur = doc.querySelector('.docplay__cur');
  const set = step => { doc.dataset.step = step; };
  if (reduced || narrow) { set('signed'); if (cur) cur.style.display = 'none'; return; }
  const aim = () => {
    const b = btn.getBoundingClientRect(), r = doc.getBoundingClientRect();
    cur.style.left = (b.right - r.left - 18) + 'px';
    cur.style.top = (b.top - r.top + b.height / 2 - 6) + 'px';
  };
  const park = () => {
    const r = doc.getBoundingClientRect();
    cur.style.left = (r.width * .45) + 'px';
    cur.style.top = (r.height * .55) + 'px';
  };
  let started = false;
  const loop = async () => {
    while (true) {
      set('empty'); cur.style.opacity = '0'; park();
      await wait(700);
      set('filled');
      await wait(1500);
      aim(); cur.style.opacity = '1';
      await wait(760);
      doc.dataset.press = '1'; btn.classList.add('is-press');
      await wait(160);
      doc.dataset.press = '0'; btn.classList.remove('is-press');
      set('signed');
      await wait(500); cur.style.opacity = '0';
      await wait(2800);
    }
  };
  new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .35 }).observe(doc);
})();
