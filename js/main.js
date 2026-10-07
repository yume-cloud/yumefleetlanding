/* yumefleet.com — interactions (no dependencies) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const fmt = n => Math.round(n).toLocaleString('ru-RU');

  /* nav */
  const nav = $('.nav');
  const onScroll = () => { nav.classList.toggle('is-scrolled', scrollY > 24); $('.to-top')?.classList.toggle('is-on', scrollY > 900); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('.nav__burger')?.addEventListener('click', () => nav.classList.toggle('is-open'));
  $$('.nav__menu a').forEach(a => a.addEventListener('click', () => nav.classList.remove('is-open')));
  $$('.dd__tgl').forEach(b => b.addEventListener('click', e => { e.preventDefault(); const li = b.closest('.has-dd'); const open = li.classList.contains('is-open'); $$('.has-dd.is-open').forEach(x => x.classList.remove('is-open')); if (!open) li.classList.add('is-open'); }));
  $$('.float').forEach(f => f.addEventListener('animationend', () => f.classList.add('is-live'), { once: true }));
  $$('.btn').forEach(b => b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', `${e.clientX - r.left}px`); b.style.setProperty('--my', `${e.clientY - r.top}px`); }));

  /* reveal */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));
  $$('[data-stagger]').forEach(g => $$(':scope > *', g).forEach((c, i) => { c.setAttribute('data-reveal', g.dataset.stagger || ''); c.style.setProperty('--d', `${i * .09}s`); io.observe(c); }));

  /* counters */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', t0 = performance.now();
    const tick = t => { const p = Math.min(1, (t - t0) / 1500), k = 1 - Math.pow(1 - p, 3); el.textContent = pre + fmt(to * k) + suf; if (p < 1) requestAnimationFrame(tick); };
    reduced ? (el.textContent = pre + fmt(to) + suf) : requestAnimationFrame(tick);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* flow line */
  $$('.flow').forEach(flow => {
    const line = $('.flow__line i', flow), steps = $$('.step', flow);
    const upd = () => { const r = flow.getBoundingClientRect(), vh = innerHeight; const p = Math.min(1, Math.max(0, (vh * .8 - r.top) / (r.height + vh * .2))); line.style.setProperty('--p', p); steps.forEach((s, i) => s.classList.toggle('is-on', p >= (i + .5) / steps.length)); };
    addEventListener('scroll', upd, { passive: true }); upd();
  });

  /* tabs */
  const tabs = $$('.tab'), panes = $$('.pane');
  if (tabs.length) {
    let cur = 0, timer;
    const show = i => { cur = i; tabs.forEach((t, k) => t.classList.toggle('is-active', k === i)); panes.forEach((p, k) => p.classList.toggle('is-active', k === i)); };
    const auto = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => show((cur + 1) % tabs.length), 6000); };
    tabs.forEach((t, i) => t.addEventListener('click', () => { show(i); auto(); }));
    const featEl = $('.feat'); if (featEl) new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? auto() : clearInterval(timer)), { threshold: .3 }).observe(featEl);
    show(0);
  }

  /* live ledger: homepage and the finance page share one scene */
  $$('.ledger tbody').forEach(ledger => {
    const box = ledger.closest('.ledger');
    const rows = [
      ['Ерлан Сапаров', 'Chevrolet Cobalt', '015 ADM 02', 9000, -27000],
      ['Асхат Жумабек', 'Hyundai Accent', '348 KBA 02', 8500, 0],
      ['Дамир Оспанов', 'Kia Rio', '762 SNA 01', 9500, 4200],
      ['Нурлан Ким', 'Chevrolet Onix', '209 TCA 02', 10000, 0],
      ['Айбек Тулеу', 'Kia K5', '581 MRA 02', 12000, -6500],
    ];
    const total = $('.ledger__foot b', box);
    const render = (rs, newIdx = -1) => {
      ledger.innerHTML = rs.map(([n, car, plate, price, bal], i) => `<tr${i === newIdx ? ' class="is-new"' : ''}><td><b>${n}</b><small>${car}</small></td><td><span class="plate">${plate}</span></td><td>${fmt(price)} ₸/сут</td><td class="${bal < 0 ? 'neg' : bal > 0 ? 'pos' : 'zero'}">${bal > 0 ? '+' : ''}${fmt(bal)} ₸</td></tr>`).join('');
      const debt = rs.filter(r => r[4] < 0).reduce((s, r) => s - r[4], 0);
      if (total) total.textContent = fmt(debt) + ' ₸';
    };
    render(rows);
    const kk = document.documentElement.lang === 'kk';
    const script = [
      { i: 0, bal: -18000, note: kk ? 'Kaspi: Ерланнан +9 000 ₸' : 'Kaspi: +9 000 ₸ от Ерлана' },
      { i: 1, bal: -8500, note: kk ? 'Жаңа күн: 8 500 ₸ есептелді' : 'Новый день: начислено 8 500 ₸' },
      { i: 4, bal: 5500, note: kk ? 'Kaspi: Айбектен +12 000 ₸' : 'Kaspi: +12 000 ₸ от Айбека' },
      { i: 0, bal: -9000, note: kk ? 'Kaspi: Ерланнан +9 000 ₸' : 'Kaspi: +9 000 ₸ от Ерлана' },
      { i: 1, bal: 0, note: kk ? 'Қолма-қол: 8 500 ₸ менеджер белгіледі' : 'Наличные: 8 500 ₸ отметил менеджер' },
    ];
    let started = false;
    const play = async () => {
      let k = 0;
      while (true) {
        await wait(reduced ? 3000 : 3400);
        const s = script[k % script.length]; k++;
        rows[s.i][4] = s.bal; render(rows, s.i);
        const ev = $('.ledger__event', box);
        if (ev) { ev.classList.add('is-out'); await wait(420); ev.textContent = s.note; ev.classList.remove('is-out'); }
        if (k % script.length === 0) { await wait(3000); rows[0][4] = -27000; rows[1][4] = 0; rows[4][4] = -6500; render(rows); }
      }
    };
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; play(); } }, { threshold: .3 }).observe(box);
  });

  /* driver pay scene: debt → pick days → Kaspi → posted */
  const pay = $('[data-payplay]');
  if (pay) {
    const sum = $('[data-pay-sum]', pay), cap = $('[data-pay-cap]', pay), btn = $('[data-pay-btn]', pay);
    const days = $$('[data-day]', pay);
    const caps = (pay.dataset.caps || '').split('|');
    const set = step => {
      pay.dataset.step = step;
      const picked = step !== 'debt';
      days.forEach((d, i) => d.classList.toggle('is-on', picked && i < 2));
      if (sum) sum.textContent = picked ? '12 000 ₸' : '18 000 ₸';
      if (btn) btn.textContent = picked ? pay.dataset.kaspi : pay.dataset.pick;
      if (cap) cap.textContent = caps[step === 'debt' ? 0 : step === 'days' ? 1 : 2] || '';
    };
    if (reduced) set('days');
    else {
      const steps = ['debt', 'days', 'kaspi', 'ok'];
      let n = 0, started = false;
      const loop = async () => { while (true) { set(steps[n % steps.length]); n++; await wait(n % steps.length === 0 ? 2800 : 2200); } };
      new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(pay);
    }
  }

  /* buyout: form fills → card opens → bar grows → Kaspi payment */
  const buy = $('[data-buyplay]');
  if (buy) {
    const bar = $('[data-buy-bar]', buy), saved = $('[data-buy-saved]', buy), left = $('[data-buy-left]', buy), next = $('[data-buy-next]', buy), type = $('[data-buy-type]', buy);
    const s0 = $('[data-buy-s0]', buy), s1 = $('[data-buy-s1]', buy);
    const fields = $$('[data-buy-field]', buy);
    fields.forEach((f, i) => f.style.setProperty('--i', i));
    const money = n => fmt(n) + ' ₸';
    const typeOn = document.documentElement.lang === 'kk' ? 'Сатып алумен жалдау' : 'Аренда под выкуп';
    const nextOn = document.documentElement.lang === 'kk' ? '9 000 ₸ · ертең' : '9 000 ₸ · завтра';
    const set = (step, filled) => {
      buy.dataset.step = step;
      fields.forEach((f, i) => f.classList.toggle('is-in', i < filled));
      const card = step !== 'form' && step !== 'open';
      const grown = step === 'grow' || step === 'pay' || step === 'done';
      const paid = step === 'pay' || step === 'done';
      if (bar) bar.style.setProperty('--p', !card ? '0' : paid ? '.62' : grown ? '.61875' : '0');
      if (saved) saved.textContent = money(!card ? 0 : paid ? 4464000 : grown ? 4455000 : 0);
      if (left) left.textContent = money(!card ? 7200000 : paid ? 2736000 : grown ? 2745000 : 7200000);
      if (next) next.textContent = card && grown ? nextOn : '—';
      if (type) type.textContent = typeOn;
      s0?.classList.toggle('is-done', grown);
      s1?.classList.toggle('is-on', grown);
    };
    if (reduced) { set('done', fields.length); }
    else {
      const script = [['form', 0, 250], ['form', 6, 700], ['aim', 6, 850], ['open', 6, 520], ['card', 6, 400], ['grow', 6, 1500], ['pay', 6, 750], ['done', 6, 1800]];
      let n = 0, started = false;
      const loop = async () => { while (true) { const [step, filled, pause] = script[n % script.length]; set(step, filled); n++; await wait(pause); } };
      new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(buy);
    }
  }

  /* driver overview: cursor opens Долг, then Документы */
  const ov = $('[data-driverplay]');
  if (ov) {
    const tabs = $$('[data-drv-tab]', ov), panes = $$('[data-drv-pane]', ov);
    const order = [0, 2, 4];
    const set = i => { const shown = panes.some(p => p.dataset.drvPane === String(i)) ? i : 0; ov.dataset.tab = shown; tabs.forEach(t => t.classList.toggle('is-on', t.dataset.drvTab === String(shown))); panes.forEach(p => p.classList.toggle('is-on', p.dataset.drvPane === String(shown))); };
    set(0);
    const title = ov.closest('.phero')?.querySelector('h1');
    const vis = ov.closest('.phero__vis');
    const fit = () => {
      if (!title || !vis || matchMedia('(max-width: 980px)').matches) { if (vis) vis.style.marginTop = ''; return; }
      vis.style.marginTop = (title.getBoundingClientRect().top - title.closest('.wrap').getBoundingClientRect().top) + 'px';
    };
    fit(); addEventListener('resize', fit);
    tabs.forEach(t => t.addEventListener('click', () => set(Number(t.dataset.drvTab))));
    if (!(reduced || matchMedia('(max-width: 900px)').matches)) {
      const cur = $('.ovcur', ov);
      let n = 1, started = false;
      const aim = i => { const b = tabs.find(t => t.dataset.drvTab === String(i)).getBoundingClientRect(), r = ov.getBoundingClientRect(); if (cur) { cur.style.left = (b.right - r.left - 18) + 'px'; cur.style.top = (b.top - r.top + 6) + 'px'; } };
      const loop = async () => { while (true) { const i = order[n % order.length]; aim(i); cur && (cur.style.opacity = '1'); await wait(700); ov.dataset.press = '1'; await wait(150); set(i); ov.dataset.press = '0'; n++; await wait(1600); } };
      new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(ov);
    }
  }

  /* vehicle card: cursor opens ТО, then Доход */
  const veh = $('[data-vehplay]');
  if (veh) {
    const tabs = $$('[data-veh-tab]', veh), panes = $$('[data-veh-pane]', veh);
    const order = [0, 1, 2, 3, 4];
    const set = i => { const shown = panes.some(p => p.dataset.vehPane === String(i)) ? i : 0; veh.dataset.tab = shown; tabs.forEach(t => t.classList.toggle('is-on', t.dataset.vehTab === String(shown))); panes.forEach(p => p.classList.toggle('is-on', p.dataset.vehPane === String(shown))); };
    set(0);
    const title = veh.closest('.phero')?.querySelector('h1');
    const vis = veh.closest('.phero__vis');
    const fit = () => { if (!title || !vis || matchMedia('(max-width: 980px)').matches) { if (vis) vis.style.marginTop = ''; return; } vis.style.marginTop = (title.getBoundingClientRect().top - title.closest('.wrap').getBoundingClientRect().top) + 'px'; };
    fit(); addEventListener('resize', fit);
    tabs.forEach(t => t.addEventListener('click', () => set(Number(t.dataset.vehTab))));
    if (!(reduced || matchMedia('(max-width: 900px)').matches)) {
      const cur = $('.ovcur', veh);
      let n = 1, started = false;
      const aim = i => { const b = tabs.find(t => t.dataset.vehTab === String(i)).getBoundingClientRect(), r = veh.getBoundingClientRect(); if (cur) { cur.style.left = (b.right - r.left - 18) + 'px'; cur.style.top = (b.top - r.top + 6) + 'px'; } };
      const loop = async () => { while (true) { const i = order[n % order.length]; aim(i); cur && (cur.style.opacity = '1'); await wait(700); veh.dataset.press = '1'; await wait(150); set(i); veh.dataset.press = '0'; n++; await wait(1600); } };
      new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(veh);
    }
  }

    /* scene documents */
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
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(doc);
  })();
  /* scene investors */
  /* investors: investor link card — income counts, share bar fills, lease chart draws */
  (() => {
    const inv = document.querySelector('[data-invplay]');
    if (!inv) return;
    const $ = (s) => inv.querySelector(s);
    const income = $('[data-inv-income]'), share = $('[data-inv-share]'), share2 = $('[data-inv-share2]'), park = $('[data-inv-park]');
    const bar = $('[data-inv-bar]'), left = $('[data-inv-left]'), paid = $('[data-inv-paid]');
    const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸';
    const INCOME = 270000, SHARE = 135000, TOTAL = 7200000, DOWN = 1500000; // доход за 30 дней; доля 50 %; выкуп; взнос
    const shown = el => { const t = (el && el.textContent || '').replace(/[^\d]/g, ''); return t ? Number(t) : 0; };
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tweens = new Map();
    const tween = (el, to, ms) => {
      if (!el) return;
      cancelAnimationFrame(tweens.get(el));
      const from = el._v == null ? shown(el) : el._v;
      if (still || ms === 0) { el._v = to; el.textContent = fmt(to); return; }
      const t0 = performance.now();
      const tick = (now) => {
        const k = ease(Math.min(1, (now - t0) / ms));
        const v = from + (to - from) * k;
        el._v = v; el.textContent = fmt(v);
        if (k < 1) tweens.set(el, requestAnimationFrame(tick));
      };
      tweens.set(el, requestAnimationFrame(tick));
    };
    const set = (step) => {
      inv.dataset.step = step;
      const i = ['income', 'share', 'lease', 'done'].indexOf(step);
      const ms = still ? 0 : 1100;
      tween(income, i >= 0 ? INCOME : 0, ms);
      const s = i >= 1;
      tween(share, s ? SHARE : 0, ms); tween(share2, s ? SHARE : 0, ms); tween(park, s ? INCOME - SHARE : 0, ms);
      if (bar) bar.style.setProperty('--p', s ? String(SHARE / INCOME) : '0');
      const l = i >= 2;
      tween(left, l ? TOTAL - DOWN : TOTAL, still ? 0 : 1500);
      tween(paid, l ? DOWN : 0, still ? 0 : 1500);
    };
    if (still) { set('done'); return; }
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const script = [['income', 1500], ['share', 1700], ['lease', 2100], ['done', 3600]];
    let n = 0, started = false;
    const loop = async () => { while (true) { const [step, pause] = script[n % script.length]; set(step); n++; await wait(pause); } };
    new IntersectionObserver((es) => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: 0.05 }).observe(inv);
  })();
  /* scene buyout */
  /* scene: buyout — /features/buyout/ hero. Scope: [data-bopage] */
  (() => {
    const root = document.querySelector('[data-bopage]');
    if (!root) return;
    const q = s => root.querySelector(s);
    const bar = q('[data-bopage-bar]'), saved = q('[data-bopage-saved]'), left = q('[data-bopage-left]');
    const payline = q('[data-bopage-payline]'), stage = q('[data-bopage-stage]'), s0 = q('[data-bopage-s0]'), s1 = q('[data-bopage-s1]');

    const PRICE = 7200000, DOWN = 1500000, RATE = 9000;
    const kk = document.documentElement.lang === 'kk';
    const T = { down: kk ? 'Жарна' : 'Взнос', buy: kk ? 'Сатып алу' : 'Выкуп',
      nextDown: kk ? 'Келесі төлем · 9 000 ₸ · жарнаға' : 'Ближайший платёж · 9 000 ₸ · во взнос',
      nextBuy: kk ? 'Келесі төлем · 9 000 ₸ · сатып алуға' : 'Ближайший платёж · 9 000 ₸ · в выкуп',
      paid: kk ? 'Kaspi · 9 000 ₸ · сатып алуға' : 'Kaspi · 9 000 ₸ · в выкуп' };
    const money = n => Math.round(n).toLocaleString('ru-RU') + ' ₸';
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;

    let cur = 0, raf = 0;
    const paint = v => {
      cur = v;
      saved.textContent = money(v);
      left.textContent = money(PRICE - v);
      bar.style.setProperty('--p', (v / PRICE).toFixed(4));
    };
    /* numbers and bar travel together — never jump */
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

    const setStage = buy => {
      stage.textContent = buy ? T.buy : T.down;
      s0.classList.toggle('is-on', !buy); s0.classList.toggle('is-done', buy);
      s1.classList.toggle('is-on', buy);
      payline.textContent = buy ? T.nextBuy : T.nextDown;
    };
    const step = s => { root.dataset.step = s; };

    const final = () => { step('hold'); setStage(true); payline.textContent = T.paid; paint(DOWN + RATE); };
    const land = v => { cancelAnimationFrame(raf); paint(v); };

    if (still) { final(); return; }

    const run = async () => {
      while (true) {
        step('in'); setStage(false); paint(0);
        await wait(700);
        step('grow'); await tween(DOWN, 1700);          /* полоса копится до взноса */
        await wait(350);
        step('stage'); setStage(true);                  /* этап меняется сам */
        await wait(1000);
        step('pay'); payline.textContent = T.paid; await tween(DOWN + RATE, 650); land(DOWN + RATE);  /* остаток ровно −9 000 */
        step('hold'); await wait(3400);                 /* финал держится дольше */
        step('reset'); await wait(550);
      }
    };
    let started = false;
    new IntersectionObserver(es => {
      if (es[0].isIntersecting && !started) { started = true; run(); }
    }, { threshold: .35 }).observe(root);
  })();
  /* scene shifts */
  /* shifts scene: one car, two rentals. Cursor switches the shift; debt of one never lands on the other. */
  (() => {
    const root = document.querySelector('[data-shiftplay]');
    if (!root) return;
    const tabs = [...root.querySelectorAll('[data-shiftplay-tab]')];
    const facts = [...root.querySelectorAll('[data-shiftplay-fact]')];
    const cur = root.querySelector('.shiftplay__cur');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrow = matchMedia('(max-width: 900px)').matches;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ') + ' ₸';

    /* number rolls from its current value to the target; no jumps */
    const roll = (el, to, ms) => {
      const from = Number(el.dataset.shiftplayNow || 0);
      if (ms <= 0 || from === to) { el.dataset.shiftplayNow = to; el.textContent = fmt(to); return; }
      const t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3);
        const v = from + (to - from) * e;
        el.dataset.shiftplayNow = v; el.textContent = fmt(v);
        if (p < 1) requestAnimationFrame(tick); else el.dataset.shiftplayNow = to;
      };
      requestAnimationFrame(tick);
    };

    const set = (i, instant) => {
      root.dataset.step = i;
      tabs.forEach(t => t.classList.toggle('is-on', t.dataset.shiftplayTab === String(i)));
      facts.forEach(f => f.classList.toggle('is-on', f.dataset.shiftplayFact === String(i)));
      const sum = facts[i].querySelector('[data-shiftplay-sum]');
      if (sum) roll(sum, Number(sum.dataset.shiftplaySum), instant ? 0 : 900);
      const h = facts[i].offsetHeight; if (h) root.querySelector('.shiftplay__facts').style.minHeight = h + 'px';
    };

    tabs.forEach(t => t.addEventListener('click', () => set(Number(t.dataset.shiftplayTab))));

    if (reduced || narrow) { set(1, true); return; }

    set(0, true);
    /* cursor tip goes to the last letter of the button text, never right of (button right - 18) */
    const aim = i => {
      const b = tabs[i].getBoundingClientRect(), r = root.getBoundingClientRect();
      const rng = document.createRange(); rng.selectNodeContents(tabs[i]);
      const t = rng.getBoundingClientRect();
      const x = Math.min(t.right - 4, b.right - 18);
      cur.style.left = (x - r.left - 5) + 'px';
      cur.style.top = (b.top - r.top + b.height / 2 - 3) + 'px';
    };
    const steps = [[1, 3600], [0, 2200]]; /* [tab to click, hold after click]; final step (Асан) holds longer */
    let n = 0, started = false;
    const loop = async () => {
      while (true) {
        const [i, hold] = steps[n % steps.length];
        aim(i); cur.style.opacity = '1';
        await wait(760);
        root.dataset.press = '1'; tabs[i].classList.add('is-press');
        await wait(160);
        set(i); root.dataset.press = '0'; tabs[i].classList.remove('is-press');
        n++;
        await wait(hold);
      }
    };
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(root);
  })();
  /* scene analytics */
  /* analytics scene: revenue bars → ring of cars in rent → debt with breakdown. No cursor: nothing is clicked. */
  (() => {
    const ana = document.querySelector('[data-anaplay]');
    if (!ana) return;
    const nums = [...ana.querySelectorAll('[data-anaplay-num]')];
    const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const show = (el, v) => { el.textContent = fmt(v) + (el.dataset.anaplaySuffix || ''); };
    const ease = t => 1 - Math.pow(1 - t, 3);
    const timers = new Map();
    const count = (el, ms) => {
      cancelAnimationFrame(timers.get(el));
      const to = Number(el.dataset.anaplayNum), t0 = performance.now();
      const tick = now => { const p = Math.max(0, Math.min(1, (now - t0) / ms)); show(el, to * ease(p)); if (p < 1) timers.set(el, requestAnimationFrame(tick)); };
      timers.set(el, requestAnimationFrame(tick));
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrow = matchMedia('(max-width: 900px)').matches;
    if (reduced || narrow) {
      ana.dataset.step = 'debt';
      nums.forEach(el => show(el, Number(el.dataset.anaplayNum)));
      return;
    }
    const steps = [['0', 420], ['rev', 1500], ['load', 1400], ['debt', 3200]];
    const set = step => {
      ana.dataset.step = step;
      if (step === '0') { nums.forEach(el => { cancelAnimationFrame(timers.get(el)); show(el, 0); }); return; }
      nums.filter(el => el.dataset.anaplayAt === step).forEach(el => count(el, step === 'load' ? 900 : 1100));
    };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let n = 0, started = false;
    const loop = async () => { while (true) { const [step, pause] = steps[n % steps.length]; set(step); n++; await wait(pause); } };
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(ana);
  })();
  /* scene leads */
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
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(root);
  })();
  /* scene settings */
  /* settings scene: park rules. Cursor flips one switch (Kaspi); the rental below picks up the rule. */
  (() => {
    const root = document.querySelector('[data-setplay]');
    if (!root) return;
    const sw = root.querySelector('[data-setplay-kaspi]');
    const rate = root.querySelector('[data-setplay-rate]');
    const week = root.querySelector('[data-setplay-week]');
    const cur = root.querySelector('.setplay__cur');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrow = matchMedia('(max-width: 900px)').matches;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ') + ' ₸';

    /* number rolls from its current value to the target; no jumps */
    const roll = (el, to, ms) => {
      const from = Number(el.dataset.setplayNow || 0);
      if (ms <= 0 || from === to) { el.dataset.setplayNow = to; el.textContent = fmt(to); return; }
      const t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, Math.max(0, (now - t0) / ms)), e = 1 - Math.pow(1 - p, 3);
        const v = from + (to - from) * e;
        el.dataset.setplayNow = v; el.textContent = fmt(v);
        if (p < 1) requestAnimationFrame(tick); else el.dataset.setplayNow = to;
      };
      requestAnimationFrame(tick);
    };

    const kaspi = on => { sw.classList.toggle('is-on', on); sw.setAttribute('aria-checked', String(on)); root.dataset.step = on ? '2' : '1'; };
    sw.addEventListener('click', () => kaspi(!sw.classList.contains('is-on')));

    if (reduced || narrow) {
      roll(rate, 9000, 0); roll(week, 63000, 0); kaspi(true);
      return;
    }

    /* cursor tip goes to the last letter of the control: right edge minus 18px */
    const aim = () => {
      const b = sw.getBoundingClientRect(), r = root.getBoundingClientRect();
      cur.style.left = (b.right - r.left - 18 - 5) + 'px';
      cur.style.top = (b.top - r.top + b.height / 2 - 3) + 'px';
    };

    let started = false;
    const loop = async () => {
      while (true) {
        /* reset without reverse animations, then step 0 → 1: rate and weekly sum roll up */
        root.dataset.reset = '1';
        root.dataset.step = '0'; sw.classList.remove('is-on'); sw.setAttribute('aria-checked', 'false');
        roll(rate, 0, 0); roll(week, 0, 0);
        void root.offsetWidth; /* commit the no-transition state before releasing it */
        await wait(60);
        root.dataset.reset = '0';
        await wait(400);
        root.dataset.step = '1';
        roll(rate, 9000, 900); roll(week, 63000, 1100);
        await wait(1700);
        /* cursor to the Kaspi switch, press */
        aim(); cur.style.opacity = '1';
        await wait(760);
        root.dataset.press = '1'; sw.classList.add('is-press');
        await wait(160);
        kaspi(true); root.dataset.press = '0'; sw.classList.remove('is-press');
        /* final step holds longest */
        await wait(4200);
        cur.style.opacity = '0';
        await wait(400);
      }
    };
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(root);
  })();
  /* scene kaspi */
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
  /* scene hub */
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
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(hub);
  })();
  /* scene egov */
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
  /* scene erap */
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
  /* scene debtors */
  /* debtors scene: request → registry check by IIN (bar travels) → "Чисто" with date → issue unlocks. No cursor: nothing is clicked. Scope: [data-debtplay] */
  (() => {
    const root = document.querySelector('[data-debtplay]');
    if (!root) return;
    const bar = root.querySelector('[data-debtplay-bar]');
    const dateEl = root.querySelector('[data-debtplay-date]');

    const kk = document.documentElement.lang === 'kk';
    const MONTHS = kk
      ? ['қаң', 'ақп', 'нау', 'сәу', 'мам', 'мау', 'шіл', 'там', 'қыр', 'қаз', 'қар', 'жел']
      : ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    /* the date in the card is "today": the check happens on the request, not in the past */
    const now = new Date();
    dateEl.textContent = now.getDate() + ' ' + MONTHS[now.getMonth()] + ', ' +
      String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    const wait = ms => new Promise(r => setTimeout(r, ms));
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 900px)').matches;
    const step = s => { root.dataset.step = s; };
    const paint = v => bar.style.setProperty('--p', v.toFixed(3));

    /* the bar travels — rAF tween, never a jump */
    const tween = (from, to, ms) => new Promise(res => {
      const t0 = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - t0) / ms), k = 1 - Math.pow(1 - p, 3);
        paint(from + (to - from) * k);
        p < 1 ? requestAnimationFrame(tick) : res();
      };
      requestAnimationFrame(tick);
    });

    if (still) { paint(1); step('hold'); return; }

    const run = async () => {
      while (true) {
        paint(0); step('in');
        await wait(800);
        step('check');                       /* "Проверяем…" with spinner */
        await tween(0, .72, 1400);
        await wait(350);                     /* registry answers a beat later */
        await tween(.72, 1, 500);
        step('clean');                       /* ✓ Чисто, date, issue unlocks */
        await wait(600);
        step('hold');
        await wait(3800);                    /* final frame holds longest */
        step('reset'); await wait(550);
      }
    };
    let started = false;
    new IntersectionObserver(es => {
      if (es[0].isIntersecting && !started) { started = true; run(); }
    }, { threshold: .35 }).observe(root);
  })();
  /* scene blacklist */
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
  /* scene wazzup */
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
  /* scene wialon */
  /* wialon scene: trail draws to the pin → mileage counts up → footer. No cursor: nothing is clicked. */
  (() => {
    const gps = document.querySelector('[data-gpsplay]');
    if (!gps) return;
    const nums = [...gps.querySelectorAll('[data-gpsplay-num]')];
    const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const show = (el, v) => { el.textContent = fmt(v) + (el.dataset.gpsplaySuffix || ''); };
    const ease = t => 1 - Math.pow(1 - t, 3);
    const timers = new Map();
    const count = (el, ms) => {
      cancelAnimationFrame(timers.get(el));
      const to = Number(el.dataset.gpsplayNum), t0 = performance.now();
      const tick = now => { const p = Math.max(0, Math.min(1, (now - t0) / ms)); show(el, to * ease(p)); if (p < 1) timers.set(el, requestAnimationFrame(tick)); };
      timers.set(el, requestAnimationFrame(tick));
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrow = matchMedia('(max-width: 900px)').matches;
    if (reduced || narrow) {
      gps.dataset.step = 'done';
      nums.forEach(el => show(el, Number(el.dataset.gpsplayNum)));
      return;
    }
    const steps = [['0', 420], ['map', 1700], ['odo', 1500], ['done', 3400]];
    const set = step => {
      gps.dataset.step = step;
      if (step === '0') { nums.forEach(el => { cancelAnimationFrame(timers.get(el)); show(el, 0); }); return; }
      nums.filter(el => el.dataset.gpsplayAt === step).forEach(el => count(el, 1200));
    };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let n = 0, started = false;
    const loop = async () => { while (true) { const [step, pause] = steps[n % steps.length]; set(step); n++; await wait(pause); } };
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(gps);
  })();
  /* scene ai */
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
  /* scene perehod */
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

  /* camera photographs the car, then the fine appears in the system */
  (() => {
    document.querySelectorAll('[data-camplay]').forEach(root => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrow = matchMedia('(max-width: 900px)').matches;
    if (motion || narrow) { root.dataset.step = 'who'; return; }
    const steps = ['shot', 'card', 'who'];
    const holds = [1600, 1100, 2400];
    let index = 0, armed = false;
    const go = name => {
      root.dataset.step = name;
      if (name === 'shot') { root.classList.remove('camplay--flash'); void root.offsetWidth; root.classList.add('camplay--flash'); }
      else root.classList.remove('camplay--flash');
      setTimeout(() => { index = (index + 1) % steps.length; go(steps[index]); }, holds[index]);
    };
    new IntersectionObserver(es => { if (armed || !es[0].isIntersecting) return; armed = true; go(steps[0]); }, { threshold: .05 }).observe(root);
    });
  })();

  /* fine card: arrives → linked to driver → discount visible */
  const fine = $('[data-fineplay]');
  if (fine) {
    const kk = document.documentElement.lang === 'kk';
    const st = $('[data-fine-st]', fine), who = $('[data-fine-who]', fine), pill = $('[data-fine-pill]', fine);
    const copy = {
      in: [kk ? 'Жаңа' : 'Новый', kk ? 'әлі байланбаған' : 'ещё не привязан', kk ? 'Күту' : 'Ждёт'],
      link: [kk ? 'Байланды' : 'Привязан', kk ? 'рульде болды' : 'был за рулём', kk ? 'Қарызда' : 'В долг'],
      disc: [kk ? 'Жеңілдік' : 'Скидка', kk ? 'рульде болды' : 'был за рулём', kk ? '−50%' : '−50%'],
    };
    const set = step => { fine.dataset.step = step; const c = copy[step]; if (st) st.textContent = c[0]; if (who) who.textContent = c[1]; if (pill) pill.textContent = c[2]; };
    if (reduced || matchMedia('(max-width: 900px)').matches) set('disc');
    else {
      const steps = ['in', 'link', 'disc'];
      let n = 0, started = false;
      const loop = async () => { while (true) { set(steps[n % 3]); n++; await wait(steps[(n - 1) % 3] === 'disc' ? 2200 : 1600); } };
      new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(fine);
    }
  }

  /* driver check: three checks, then "can issue". Static on a phone. */
  const drv = $('[data-drvplay]');
  if (drv) {
    const rows = $$('[data-drv-row]', drv);
    const kk = document.documentElement.lang === 'kk';
    const narrow = matchMedia('(max-width: 900px)').matches;
    const set = n => { drv.dataset.step = n; rows.forEach((r, i) => { const on = i < n; r.classList.toggle('is-on', on); const b = $('b', r); if (b) b.textContent = on ? (kk ? 'таза' : 'чисто') : ''; }); };
    if (reduced || narrow) set(3);
    else {
      let n = 0, started = false;
      const loop = async () => { while (true) { set(n % 4); n++; await wait(n % 4 === 0 ? 1800 : 700); } };
      new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(drv);
    }
  }

  /* rental kinds: daily, shifts, fixed term, buyout. Static on a phone. */
  const rent = $('[data-rentplay]');
  if (rent) {
    const kinds = $$('[data-rent-kind]', rent), facts = $$('[data-rent-fact]', rent);
    const narrow = matchMedia('(max-width: 900px)').matches;
    const set = i => { rent.dataset.kind = i; kinds.forEach(k => k.classList.toggle('is-on', k.dataset.rentKind === String(i))); facts.forEach(f => f.classList.toggle('is-on', f.dataset.rentFact === String(i))); rent.querySelector('.rcard__facts').style.minHeight = (facts[i].offsetHeight || 148) + 'px'; };
    set(0);
    const title = document.querySelector('.phero h1');
    const vis = rent.closest('.phero__vis');
    const fit = () => {
      if (!title || !vis || matchMedia('(max-width: 980px)').matches) { if (vis) vis.style.marginTop = ''; return; }
      vis.style.marginTop = (title.getBoundingClientRect().top - title.closest('.wrap').getBoundingClientRect().top) + 'px';
    };
    fit(); addEventListener('resize', fit);
    kinds.forEach(k => k.addEventListener('click', () => set(Number(k.dataset.rentKind))));
    if (!(reduced || narrow)) {
      let n = 1, started = false;
      const cur = $('.rentcur', rent);
      const aim = i => { const b = kinds[i].getBoundingClientRect(), r = rent.getBoundingClientRect(); if (cur) { cur.style.left = (b.left - r.left + 18) + 'px'; cur.style.top = (b.top - r.top + 8) + 'px'; } };
      const loop = async () => { while (true) { const i = n % kinds.length; aim(i); cur && (cur.style.opacity = '1'); await wait(720); rent.dataset.press = '1'; kinds[i].classList.add('is-press'); await wait(160); set(i); rent.dataset.press = '0'; kinds[i].classList.remove('is-press'); n++; await wait(1100); } };
      new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .05 }).observe(rent);
    }
  }

  /* faq */
  $$('.iacc button').forEach(b => b.addEventListener('click', () => { const it = b.parentElement, open = it.classList.contains('is-open'); $$('.iacc.is-open').forEach(x => x.classList.remove('is-open')); if (!open) it.classList.add('is-open'); }));
  $$('.q button').forEach(b => b.addEventListener('click', () => { const q = b.parentElement, open = q.classList.contains('is-open'); $$('.q.is-open').forEach(x => x.classList.remove('is-open')); if (!open) q.classList.add('is-open'); }));

  /* form: POST to endpoint if configured, else WhatsApp with prefilled text */
  const form = $('.form');
  const LEAD_ENDPOINT = form?.dataset.endpoint || '', DONE_URL = form?.dataset.done || '';
  $('#phone')?.addEventListener('input', e => {
    let d = e.target.value.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11); if (d && d[0] !== '7') d = '7' + d;
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    e.target.value = d ? '+7' + (p[0] ? ' ' + p[0] : '') + (p[1] ? ' ' + p[1] : '') + (p[2] ? ' ' + p[2] : '') + (p[3] ? ' ' + p[3] : '') : '';
  });
  $$('.form input').forEach(i => i.addEventListener('input', () => i.classList.remove('is-invalid')));
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button[type=submit]', form), name = $('#name', form), phone = $('#phone', form), cars = $('#cars', form), city = $('#city', form);
    if (!name.value.trim()) { name.focus(); name.classList.add('is-invalid'); return; }
    if (phone.value.replace(/\D/g, '').length < 11) { phone.focus(); phone.classList.add('is-invalid'); return; }
    const payload = { name: name.value.trim(), phone: phone.value.trim(), segment: [cars?.value, city?.value.trim()].filter(Boolean).join(' · '), page: location.pathname, source: 'yumefleet.com', website: $('input[name=website]', form)?.value || '' };
    const label = btn.textContent; btn.disabled = true; btn.textContent = document.documentElement.lang === 'kk' ? 'Жіберілуде…' : 'Отправляем…';
    let sent = false;
    if (LEAD_ENDPOINT) {
      try { const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const j = await r.json().catch(() => ({})); sent = r.ok && j.ok; } catch (x) { sent = false; }
    }
    if (!sent) {
      const msg = `Здравствуйте! Хочу демо Yume Fleet.\nИмя: ${payload.name}\nТелефон: ${payload.phone}\nПарк: ${payload.segment}`;
      window.open('https://wa.me/77779479990?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    }
    form.classList.add('is-done'); btn.disabled = false; btn.textContent = label;
    try { window.gtag && gtag('event', 'generate_lead', { product: 'fleet' }); } catch (x) {}
    // заявка ушла на сервер — уводим на страницу «спасибо».
    // если сервер не ответил, человек остаётся здесь: у него открыт WhatsApp с текстом заявки
    if (sent && DONE_URL) setTimeout(() => location.assign(DONE_URL), 250);
  });

  $('.to-top')?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
})();
