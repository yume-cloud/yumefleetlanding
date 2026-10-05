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

  /* live ledger demo */
  const ledger = $('.ledger tbody');
  if (ledger) {
    const rows = [
      ['Ерлан Сапаров', 'Chevrolet Cobalt', '015 ADM 02', 9000, -27000],
      ['Асхат Жумабек', 'Hyundai Accent', '348 KBA 02', 8500, 0],
      ['Дамир Оспанов', 'Kia Rio', '762 SNA 01', 9500, 4200],
      ['Нурлан Ким', 'Chevrolet Onix', '209 TCA 02', 10000, 0],
      ['Айбек Тулеу', 'Kia K5', '581 MRA 02', 12000, -6500],
    ];
    const total = $('.ledger__foot b');
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
        const ev = $('.ledger__event');
        if (ev) { ev.classList.add('is-out'); await wait(420); ev.textContent = s.note; ev.classList.remove('is-out'); }
        if (k % script.length === 0) { await wait(3000); rows[0][4] = -27000; rows[1][4] = 0; rows[4][4] = -6500; render(rows); }
      }
    };
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; play(); } }, { threshold: .3 }).observe($('.ledger'));
  }

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
      new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .35 }).observe(pay);
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
      new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .35 }).observe(buy);
    }
  }

  /* rental kinds: daily, shifts, fixed term, buyout. Static on a phone. */
  const rent = $('[data-rentplay]');
  if (rent) {
    const kinds = $$('[data-rent-kind]', rent), facts = $$('[data-rent-fact]', rent);
    const narrow = matchMedia('(max-width: 900px)').matches;
    const set = i => { rent.dataset.kind = i; kinds.forEach(k => k.classList.toggle('is-on', k.dataset.rentKind === String(i))); facts.forEach(f => f.classList.toggle('is-on', f.dataset.rentFact === String(i))); };
    set(0);
    const title = document.querySelector('.phero h1');
    const vis = rent.closest('.phero__vis');
    const fit = () => {
      if (!title || !vis || matchMedia('(max-width: 900px)').matches) { if (vis) vis.style.marginTop = ''; return; }
      const wrap = title.closest('.wrap');
      vis.style.marginTop = (title.getBoundingClientRect().top - wrap.getBoundingClientRect().top) + 'px';
      rent.querySelector('.rcard').style.height = '';
    };
    fit(); addEventListener('resize', fit);
    kinds.forEach(k => k.addEventListener('click', () => set(Number(k.dataset.rentKind))));
    if (!(reduced || narrow)) {
      let n = 1, started = false;
      const cur = $('.rentcur', rent);
      const aim = i => { const b = kinds[i].getBoundingClientRect(), r = rent.getBoundingClientRect(); if (cur) { cur.style.left = (b.left - r.left + 18) + 'px'; cur.style.top = (b.top - r.top + 8) + 'px'; } };
      const loop = async () => { while (true) { const i = n % kinds.length; aim(i); cur && (cur.style.opacity = '1'); await wait(720); rent.dataset.press = '1'; kinds[i].classList.add('is-press'); await wait(160); set(i); rent.dataset.press = '0'; kinds[i].classList.remove('is-press'); n++; await wait(1100); } };
      new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .35 }).observe(rent);
    }
  }

  /* fine: protocol arrives, driver is found, amount joins his debt */
  const fine = $('[data-fineplay]');
  if (fine) {
    const who = $('[data-fine-who]', fine);
    const searching = who ? who.textContent : '';
    const found = document.documentElement.lang === 'kk' ? 'Ерлан С. · рульде болған' : 'Ерлан С. · был за рулём';
    const set = step => { fine.dataset.step = step; if (who) who.textContent = step === 'in' ? searching : found; };
    if (reduced) set('debt');
    else {
      const steps = [['in', 700], ['found', 1400], ['debt', 1800]];
      let n = 0, started = false;
      const loop = async () => { while (true) { const [step, pause] = steps[n % steps.length]; set(step); n++; await wait(pause); } };
      new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; loop(); } }, { threshold: .35 }).observe(fine);
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
