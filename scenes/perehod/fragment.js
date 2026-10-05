/* scene: perehod — /perehod/ hero. Scope: [data-moveplay] */
(() => {
  const root = document.querySelector('[data-moveplay]');
  if (!root) return;
  const bar = root.querySelector('[data-moveplay-bar]');
  const count = root.querySelector('[data-moveplay-count]');
  const rows = [...root.querySelectorAll('[data-moveplay-row]')];
  const kk = document.documentElement.lang === 'kk';
  const T = { queue: kk ? 'кезекте' : 'в очереди', busy: kk ? 'көшіру' : 'переносим', done: kk ? 'дайын' : 'готово' };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;
  const N = rows.length;

  let cur = 0, raf = 0;
  /* bar and counter travel together — never jump */
  const paint = v => {
    cur = v;
    bar.style.setProperty('--p', (v / N).toFixed(4));
    count.textContent = Math.floor(v + 1e-6);
  };
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
  const setRow = (li, st) => {
    li.classList.toggle('is-busy', st === 'busy');
    li.classList.toggle('is-done', st === 'done');
    li.querySelector('[data-moveplay-state]').textContent = T[st];
  };
  const step = s => { root.dataset.step = s; };

  const final = () => { step('hold'); rows.forEach(li => setRow(li, 'done')); paint(N); };
  if (still) { final(); return; }

  const run = async () => {
    while (true) {
      step('in'); rows.forEach(li => setRow(li, 'queue')); paint(0);
      await wait(700);
      for (let i = 0; i < N; i++) {
        step(rows[i].dataset.moveplayRow);          /* cars → drivers → rents */
        setRow(rows[i], 'busy');
        await tween(i + 1, 1100);                   /* полоса доезжает до следующей трети */
        setRow(rows[i], 'done');
        await wait(450);
      }
      step('hold'); await wait(3600);               /* финал держится дольше */
      step('reset'); await wait(550);
    }
  };
  let started = false;
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; run(); }
  }, { threshold: .35 }).observe(root);
})();
