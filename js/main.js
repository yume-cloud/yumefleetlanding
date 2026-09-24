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
  const flow = $('.flow');
  if (flow) {
    const line = $('.flow__line i', flow), steps = $$('.step', flow);
    const upd = () => { const r = flow.getBoundingClientRect(), vh = innerHeight; const p = Math.min(1, Math.max(0, (vh * .8 - r.top) / (r.height + vh * .2))); line.style.setProperty('--p', p); steps.forEach((s, i) => s.classList.toggle('is-on', p >= (i + .5) / steps.length)); };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* tabs */
  const tabs = $$('.tab'), panes = $$('.pane');
  if (tabs.length) {
    let cur = 0, timer;
    const show = i => { cur = i; tabs.forEach((t, k) => t.classList.toggle('is-active', k === i)); panes.forEach((p, k) => p.classList.toggle('is-active', k === i)); };
    const auto = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => show((cur + 1) % tabs.length), 6000); };
    tabs.forEach((t, i) => t.addEventListener('click', () => { show(i); auto(); }));
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? auto() : clearInterval(timer)), { threshold: .3 }).observe($('.feat'));
    show(0);
  }

  /* live ledger demo */
  const ledger = $('.ledger tbody');
  if (ledger) {
    const rows = [
      ['Ерлан Сапаров', 'Chevrolet Cobalt', '847 ABC 02', 9000, -27000],
      ['Асхат Жумабек', 'Hyundai Accent', '123 KZA 02', 8500, 0],
      ['Дамир Оспанов', 'Kia Rio', '555 BBB 01', 9500, 4200],
      ['Нурлан Ким', 'Chevrolet Onix', '214 ACB 02', 10000, 0],
      ['Айбек Тулеу', 'Kia K5', '777 AAA 02', 12000, -6500],
    ];
    const total = $('.ledger__foot b');
    const render = (rs, newIdx = -1) => {
      ledger.innerHTML = rs.map(([n, car, plate, price, bal], i) => `<tr${i === newIdx ? ' class="is-new"' : ''}><td><b>${n}</b><small>${car}</small></td><td><span class="plate">${plate}</span></td><td>${fmt(price)} ₸/сут</td><td class="${bal < 0 ? 'neg' : bal > 0 ? 'pos' : 'zero'}">${bal > 0 ? '+' : ''}${fmt(bal)} ₸</td></tr>`).join('');
      const debt = rs.filter(r => r[4] < 0).reduce((s, r) => s - r[4], 0);
      if (total) total.textContent = fmt(debt) + ' ₸';
    };
    render(rows);
    const script = [
      { i: 0, bal: -18000, note: 'Kaspi: +9 000 ₸ от Ерлана' },
      { i: 1, bal: -8500, note: 'Новый день: начислено 8 500 ₸' },
      { i: 4, bal: 5500, note: 'Kaspi: +12 000 ₸ от Айбека' },
      { i: 0, bal: -9000, note: 'Kaspi: +9 000 ₸ от Ерлана' },
      { i: 1, bal: 0, note: 'Наличные: 8 500 ₸ отметил менеджер' },
    ];
    let started = false;
    const play = async () => {
      let k = 0;
      while (true) {
        await wait(reduced ? 3000 : 2600);
        const s = script[k % script.length]; k++;
        rows[s.i][4] = s.bal; render(rows, s.i);
        const ev = $('.ledger__event'); if (ev) { ev.textContent = s.note; ev.classList.remove('is-flash'); void ev.offsetWidth; ev.classList.add('is-flash'); }
        if (k % script.length === 0) { await wait(3000); rows[0][4] = -27000; rows[1][4] = 0; rows[4][4] = -6500; render(rows); }
      }
    };
    new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; play(); } }, { threshold: .3 }).observe($('.ledger'));
  }

  /* faq */
  $$('.q button').forEach(b => b.addEventListener('click', () => { const q = b.parentElement, open = q.classList.contains('is-open'); $$('.q.is-open').forEach(x => x.classList.remove('is-open')); if (!open) q.classList.add('is-open'); }));

  /* form: POST to endpoint if configured, else WhatsApp with prefilled text */
  const form = $('.form');
  const LEAD_ENDPOINT = form?.dataset.endpoint || '';
  $('#phone')?.addEventListener('input', e => {
    let d = e.target.value.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11); if (d && d[0] !== '7') d = '7' + d;
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    e.target.value = d ? '+7' + (p[0] ? ' ' + p[0] : '') + (p[1] ? ' ' + p[1] : '') + (p[2] ? ' ' + p[2] : '') + (p[3] ? ' ' + p[3] : '') : '';
  });
  $$('.form input').forEach(i => i.addEventListener('input', () => i.classList.remove('is-invalid')));
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button[type=submit]', form), name = $('#name', form), phone = $('#phone', form), cars = $('#cars', form);
    if (!name.value.trim()) { name.focus(); name.classList.add('is-invalid'); return; }
    if (phone.value.replace(/\D/g, '').length < 11) { phone.focus(); phone.classList.add('is-invalid'); return; }
    const payload = { name: name.value.trim(), phone: phone.value.trim(), segment: cars?.value || '', page: location.pathname, source: 'yumefleet.com', website: $('input[name=website]', form)?.value || '' };
    const label = btn.textContent; btn.disabled = true; btn.textContent = 'Отправляем…';
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
  });

  $('.to-top')?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
})();
