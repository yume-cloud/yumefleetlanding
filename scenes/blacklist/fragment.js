/* scene: blacklist — /integrations/blacklist/ hero. Scope: [data-blplay] */
(() => {
  const root = document.querySelector('[data-blplay]');
  if (!root) return;
  const q = s => root.querySelector(s);
  const row = k => q(`[data-blplay-row="${k}"]`), bar = k => q(`[data-blplay-bar="${k}"]`), res = k => q(`[data-blplay-res="${k}"]`);
  const status = q('[data-blplay-status]');

  const kk = document.documentElement.lang === 'kk';
  const T = { wait: kk ? 'іздейміз…' : 'ищем…', clean: kk ? 'таза' : 'чисто',
    hit: kk ? '1 жазба' : '1 запись',
    checking: kk ? 'Тексеру' : 'Проверяем', done: kk ? 'Тексерілді' : 'Проверено' };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;

  const cur = { debt: 0, list: 0 }, raf = { debt: 0, list: 0 };
  const paint = (k, v) => { cur[k] = v; bar(k).style.setProperty('--p', v.toFixed(4)); };
  /* полоса поиска доезжает сама, скачка нет */
  const tween = (k, to, ms) => new Promise(done => {
    cancelAnimationFrame(raf[k]);
    const from = cur[k], t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      paint(k, from + (to - from) * e);
      p < 1 ? (raf[k] = requestAnimationFrame(tick)) : done();
    };
    raf[k] = requestAnimationFrame(tick);
  });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const step = s => { root.dataset.step = s; };

  const clear = () => {
    ['debt', 'list'].forEach(k => { row(k).className = 'blplay__check'; res(k).textContent = T.wait; paint(k, 0); });
    status.textContent = T.checking;
  };
  const markClean = () => { row('debt').classList.add('is-clean'); res('debt').textContent = T.clean; };
  const markHit = () => { row('list').classList.add('is-hit'); res('list').textContent = T.hit; status.textContent = T.done; };

  const final = () => { clear(); paint('debt', 1); paint('list', 1); markClean(); markHit(); step('hold'); };
  if (still) { final(); return; }

  const run = async () => {
    while (true) {
      step('in'); clear();
      await wait(700);
      step('scan');
      /* обе проверки идут одновременно; реестр должников доезжает раньше и сразу «чисто» */
      await Promise.all([tween('debt', 1, 1500).then(markClean), tween('list', 1, 2300)]);
      await wait(250);
      step('hit'); markHit();                     /* чёрный список: запись другого парка */
      await wait(900);
      step('hold'); await wait(3600);             /* финал держится дольше */
      step('reset'); await wait(550);
    }
  };
  let started = false;
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && !started) { started = true; run(); }
  }, { threshold: .35 }).observe(root);
})();
