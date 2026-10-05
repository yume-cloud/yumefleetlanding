/* hub: five Kazakhstan services light up one by one around rental 015 ADM 02, no cursor */
(() => {
  const hub = document.querySelector('[data-hubplay]');
  if (!hub) return;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = matchMedia('(max-width: 900px)').matches;
  const rows = [...hub.querySelectorAll('.hubplay__row')];
  const num = hub.querySelector('[data-hubplay-n]');
  const set = n => {
    hub.dataset.step = String(n);
    hub.style.setProperty('--n', n);
    num.textContent = String(n);
    rows.forEach((r, i) => r.classList.toggle('is-on', i < n));
  };
  if (reduced || narrow) { hub.classList.add('is-static'); set(5); return; }
  let started = false;
  const loop = async () => {
    while (true) {
      set(0);
      await wait(900);
      for (let n = 1; n <= 5; n++) { set(n); await wait(n === 5 ? 3400 : 720); }
    }
  };
  new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .35 }).observe(hub);
})();
