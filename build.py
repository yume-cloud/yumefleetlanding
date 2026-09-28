# -*- coding: utf-8 -*-
"""Генерирует сайт Yume Fleet из content/CONTENT.md.
Запуск: python3 build.py. Пути относительные, чтобы сайт работал и на GitHub Pages, и на yumefleet.com."""
import re, os, html, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = open(os.path.join(ROOT, 'content', 'CONTENT.md'), encoding='utf-8').read()
SITE = 'https://yumefleet.com'
PHONE = '+7 777 947 99 90'
WA = 'https://wa.me/77779479990'
LOGIN = 'https://app.yumefleet.kz/'
LEAD = 'https://yume-cloud-zzydfr.vercel.app/api/lead/'

# ------------------------------------------------------------------ разбор markdown
TAGS = {'НОВОЕ': ('new', 'новое'), 'ЛУЧШЕ': ('better', 'лучше'), 'СКОРО': ('soon', 'скоро')}

def inline(t):
    """**жирный** → <strong>, [ТЕГ] → бейдж, [?] убираем."""
    t = html.escape(t, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'\s*\[\?\]', '', t)
    def tag(m):
        k = m.group(1)
        if k in TAGS:
            c, l = TAGS[k]; return f' <em class="tag tag--{c}">{l}</em>'
        return ''
    t = re.sub(r'\s*\[([А-ЯЁ]+)\]', tag, t)
    return t.strip()

def strip_md(t):
    t = re.sub(r'\*\*(.+?)\*\*', r'\1', t)
    t = re.sub(r'\s*\[[^\]]+\]', '', t)
    return t.strip()

def tags_of(t):
    return [TAGS[k] for k in re.findall(r'\[([А-ЯЁ]+)\]', t) if k in TAGS]

def parse_item(line):
    """- **Name** [ТЕГ] (→ /link/): text   |   - **Name** text (steps)   |   - «quote» — who"""
    m = re.match(r'-\s+\*\*(.+?)\*\*\s*(\[[^\]]+\])?\s*(?:\(→\s*([^)]+)\))?\s*:?\s*(.*)$', line)
    if m:
        name, tag, link, text = m.groups()
        return dict(name=name.strip(), tags=tags_of(tag or ''), link=(link or '').strip(), text=text.strip(), tag_html=inline(tag or ''))
    m = re.match(r'-\s+«(.+?)»\s*—\s*(.+)$', line)
    if m:
        who = [x.strip() for x in m.group(2).split(',')]
        return dict(quote=m.group(1), who=who[0], co=who[1] if len(who) > 1 else '', seg=who[2] if len(who) > 2 else '')
    m = re.match(r'-\s+Было:\s*(.+?)\s*→\s*Стало:\s*(.+)$', line)
    if m:
        return dict(was=m.group(1), now=m.group(2))
    m = re.match(r'-\s+✓\s*(.+)$', line)
    if m:
        return dict(check=m.group(1))
    return dict(text=line[1:].strip())

def parse():
    pages = []
    cur = None; sec = None
    for raw in SRC.split('\n'):
        line = raw.rstrip()
        if line.startswith('## Страница '):
            m = re.match(r'## Страница (\S+) — (.+)$', line)
            cur = dict(path=m.group(1), title=m.group(2).strip(), sections=[]); pages.append(cur); sec = None; continue
        if cur is None: continue
        if line.startswith('### '):
            m = re.match(r'### \[(\w+)\]\s*(.*)$', line)
            sec = dict(type=m.group(1), title=m.group(2).strip(), eyebrow='', paras=[], items=[], subitems=[], button='')
            cur['sections'].append(sec); continue
        if sec is None or not line.strip() or line.startswith('---') or line.startswith('>'): continue
        if line.startswith('Надзаголовок:'):
            sec['eyebrow'] = line.split(':', 1)[1].strip(); continue
        if line.startswith('Кнопка:'):
            sec['button'] = line.split(':', 1)[1].strip(); continue
        if line.startswith('  - ✓'):
            if sec['items']: sec['items'][-1].setdefault('checks', []).append(line.strip()[1:].strip().lstrip('✓').strip())
            continue
        if line.startswith('- '):
            sec['items'].append(parse_item(line)); continue
        sec['paras'].append(line.strip())
    return pages

PAGES = parse()
BY_PATH = {p['path']: p for p in PAGES}

NAV_FEATURES = [
 ('/features/rentals/', 'Карточка аренды', 'Посуточно, срок, график оплат', 'i-cal'),
 ('/features/buyout/', 'Аренда под выкуп', 'Взнос, ход выкупа, остаток', 'i-car'),
 ('/features/shifts/', 'Смены и сменщики', 'Два водителя на машине', 'i-user'),
 ('/features/drivers/', 'Водители', 'Долг, депозит, надёжность', 'i-shield'),
 ('/features/vehicles/', 'Машины', 'ТО, ремонты, склад, окупаемость', 'i-wrench'),
 ('/features/finance/', 'Деньги и долги', 'Начисления, оплаты, погашение', 'i-wallet'),
 ('/features/fines/', 'Штрафы ПДД и ущерб', 'Протокол, скидка, рассрочка', 'i-alert'),
 ('/features/documents/', 'Документы и подпись', 'Договоры, акты, eGov и SMS', 'i-doc'),
 ('/features/investors/', 'Субаренда и лизинг', 'Инвесторы, доли, кредиты', 'i-link'),
 ('/features/analytics/', 'Аналитика', 'P&L, cash flow, окупаемость', 'i-chart'),
 ('/features/leads/', 'WhatsApp и воронка', 'Заявки водителей до аренды', 'i-wa'),
 ('/features/settings/', 'Гибкие настройки', 'Правила, роли, несколько парков', 'i-cog'),
]
ICON_BY_PATH = {p: i for p, _, _, i in NAV_FEATURES}
ICON_BY_PATH.update({'/kaspi-pay/': 'i-link', '/kaspi/': 'i-wallet'})
INT_LOGO = {'Kaspi Pay': 'assets/img/int/kaspi.png', 'Kaspi Платежи': 'assets/img/int/kaspi.png', 'eGov mobile': 'assets/img/int/egov.png',
            'Штрафы ПДД, ЕРАП': 'assets/img/int/erap.svg', 'Штрафы ПДД и ЕРАП': 'assets/img/int/erap.svg', 'Реестр должников': 'assets/img/int/iin.svg',
            'GPS Wialon': 'assets/img/int/wialon.png', 'Wazzup': 'assets/img/int/wazzup.png', 'WhatsApp через Wazzup': 'assets/img/int/wazzup.png',
            'Яндекс Про': 'assets/img/int/yandex.svg', 'Чёрный список парков': 'assets/logo/tile-dark-yellow-mark.svg', 'ИИ-ассистент': 'assets/img/int/ai.svg',
            'Приложение водителя': 'assets/img/int/app.svg'}

# ------------------------------------------------------------------ каркас
SPRITE = open(os.path.join(ROOT, 'content', 'sprite.svg'), encoding='utf-8').read()

def rel(path):
    depth = path.strip('/').count('/') + (1 if path.strip('/') else 0)
    return '../' * depth if depth else './'

def href(path, R):
    if path.startswith('http') or path.startswith('#') or path.startswith('mailto') or path.startswith('tel'): return path
    return R + path.lstrip('/') if path != '/' else R

def nav(R, path):
    dd = ''.join(f'<a class="dd__i" href="{href(p, R)}"><svg><use href="#{i}"/></svg><div><b>{n}</b><small>{s}</small></div></a>' for p, n, s, i in NAV_FEATURES)
    act = lambda p: ' class="is-cur"' if p == path else ''
    return f'''<header class="nav">
  <div class="wrap">
    <a class="logo" href="{R}" aria-label="Yume Fleet"><i><svg><use href="#mark"/></svg></i><span><b>yume</b><em>fleet</em></span></a>
    <nav aria-label="Основное меню">
      <ul class="nav__menu">
        <li><a href="{R}"{act('/')}>Главная</a></li>
        <li class="has-dd"><a href="{href('/features/', R)}"{act('/features/')}>Возможности <svg><use href="#i-chev"/></svg></a><button class="dd__tgl" aria-label="Раскрыть возможности"><svg><use href="#i-chev"/></svg></button><div class="dd"><div class="dd__panel"><div class="dd__grid">{dd}</div><a class="dd__all" href="{href('/features/', R)}">Все возможности <svg><use href="#i-arrow"/></svg></a></div></div></li>
        <li><a href="{href('/integrations/', R)}"{act('/integrations/')}>Интеграции</a></li>
        <li><a href="{href('/perehod/', R)}"{act('/perehod/')}>Для клиентов Yume Cloud</a></li>
        <li><a href="{href('/contacts/', R)}"{act('/contacts/')}>Контакты</a></li>
        <li><a class="nav__cta-m" href="#demo">Записаться на демо</a></li>
      </ul>
    </nav>
    <div class="nav__actions">
      <a class="nav__login" href="{LOGIN}">Войти</a>
      <a class="btn btn--sm btn--yellow" href="#demo">Записаться на демо</a>
      <button class="nav__burger" aria-label="Меню"><span></span></button>
    </div>
  </div>
</header>'''

def footer(R):
    feats = ''.join(f'<li><a href="{href(p, R)}">{n}</a></li>' for p, n, _, _ in NAV_FEATURES[:6])
    return f'''<footer class="footer">
  <div class="wrap">
    <div class="footer__top">
      <div class="footer__brand">
        <a class="logo logo--dark" href="{R}"><i><svg><use href="#mark"/></svg></i><span><b>yume</b><em>fleet</em></span></a>
        <p>Платформа для управления таксопарком. ТОО «Yume.Cloud», Алматы, Казахстан.</p>
        <a href="tel:+77779479990">{PHONE}</a>
        <a href="mailto:sales@yume.cloud">sales@yume.cloud</a>
      </div>
      <div><h4>Возможности</h4><ul>{feats}<li><a href="{href('/features/', R)}">Все возможности</a></li></ul></div>
      <div><h4>Продукт</h4><ul><li><a href="{href('/kaspi-pay/', R)}">Оплата по ссылке Kaspi Pay</a></li><li><a href="{href('/kaspi/', R)}">Kaspi Платежи 2,5%</a></li><li><a href="{href('/integrations/', R)}">Интеграции</a></li><li><a href="{href('/perehod/', R)}">Для клиентов Yume Cloud</a></li><li><a href="{href('/contacts/', R)}">Контакты</a></li><li><a href="{LOGIN}" rel="noopener">Войти в систему</a></li></ul></div>
      <div><h4>Документы</h4><ul><li><a href="https://yume.cloud/privacy" rel="noopener">Политика конфиденциальности</a></li><li><a href="https://drive.google.com/file/d/1HC2aDhfN5nDlu2q_M73Km5yFUF7t05C7/view" rel="noopener">Публичная оферта</a></li><li><a href="https://drive.google.com/file/d/1ELSMnaksX3ROz7dSYNvOraV9-jUWjV78/view" rel="noopener">Пользовательское соглашение</a></li><li><a href="https://drive.google.com/file/d/13ipJMcnRsii1qyfn9vxxOvuGCjWjxFDX/view" rel="noopener">Рекуррентные платежи</a></li><li><a href="https://drive.google.com/file/d/1Ui87iIFScByKXF-4_j_0rTv3RfT9kr-E/view" rel="noopener">Отмена и возврат платежей</a></li><li><a href="https://drive.google.com/file/d/1WLziN6TzG7g-xHzFDxROyK8uxSaAM_3h/view" rel="noopener">Процедура оплаты</a></li><li><a href="https://yume.cloud/delete-account" rel="noopener">Удаление аккаунта</a></li></ul></div>
    </div>
    <div class="footer__bot">
      <div class="legal"><span>© ТОО «Yume.Cloud», 2026</span><a href="https://www.instagram.com/yumecloudx/" rel="noopener">Instagram</a><a href="https://t.me/yumefleet" rel="noopener">Telegram</a></div>
      <a class="cloud" href="https://yume.cloud"><i></i> Сдаёте инвентарь, а не машины? yume.cloud</a>
    </div>
  </div>
</footer>
<a class="wa-fab" href="{WA}" rel="noopener" aria-label="Написать в WhatsApp"><svg><use href="#i-wa"/></svg><span>Написать в WhatsApp</span></a>
<button class="to-top" aria-label="Наверх"><svg><use href="#i-up"/></svg></button>'''

def form(R):
    return f'''<form class="form" data-reveal="right" data-endpoint="{LEAD}" novalidate>
      <div class="field"><label for="name">Имя</label><input id="name" name="name" placeholder="Как к вам обращаться" required autocomplete="name"></div>
      <div class="field"><label for="phone">Телефон</label><input id="phone" name="phone" type="tel" placeholder="+7 777 000 00 00" required autocomplete="tel" inputmode="tel"></div>
      <div class="form__row">
        <div class="field"><label for="cars">Сколько машин в парке</label><select id="cars" name="cars"><option>до 10 машин</option><option>10–30 машин</option><option>30–100 машин</option><option>100+ машин</option></select></div>
        <div class="field"><label for="city">Город</label><input id="city" name="city" placeholder="Алматы" autocomplete="address-level2"></div>
      </div>
      <input type="text" name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
      <button class="btn btn--lg" type="submit">Записаться на демо</button>
      <label class="consent"><input type="checkbox" checked required> Согласен на обработку персональных данных в соответствии с <a href="https://yume.cloud/legal/privacy/" style="text-decoration:underline">политикой конфиденциальности</a></label>
      <div class="form__ok"><div><i><svg><use href="#i-check"/></svg></i><h3>Заявка отправлена</h3><p style="color:var(--muted);margin-top:8px">Перезвоним в течение 15 минут в рабочее время.</p></div></div>
    </form>'''

def cta(sec, R):
    title = strip_md(sec['title']) or 'Записаться на демо'
    lead = inline(' '.join(sec['paras'])) or 'Покажем систему за 20 минут на примере парка вашего размера.'
    return f'''<section class="section section--yellow cta" id="demo">
  <div class="wrap">
    <div data-reveal="left">
      <p class="eyebrow" style="color:var(--ink)">Демо</p>
      <h2>{html.escape(title)}</h2>
      <p class="lead" style="margin-top:18px;color:var(--ink);opacity:.8">{lead}</p>
      <ul class="cta__list">
        <li><svg><use href="#i-check"/></svg>Перезвоним в течение 15 минут в рабочее время</li>
        <li><svg><use href="#i-check"/></svg>Показываем на примере парка вашего размера</li>
        <li><svg><use href="#i-check"/></svg>Данные переносим мы, парк продолжает работать</li>
      </ul>
      <a class="cta__wa" href="{WA}" rel="noopener"><svg><use href="#i-wa"/></svg> Или напишите в WhatsApp: {PHONE}</a>
    </div>
    {form(R)}
  </div>
</section>'''

def page(p, body, R, desc):
    title = html.escape(p['title'])
    if not title.startswith('Yume Fleet'): title += ' — Yume Fleet'
    canon = SITE + p['path']
    return f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canon}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE}/assets/img/og.png">
<link rel="icon" href="{R}assets/logo/favicon.svg" type="image/svg+xml">
<link rel="preload" as="font" type="font/woff2" href="{R}assets/fonts/geist-800-cyrillic.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="{R}assets/fonts/geist-400-cyrillic.woff2" crossorigin>
<link rel="stylesheet" href="{R}assets/fonts/fonts.css">
<link rel="stylesheet" href="{R}css/styles.css?v=3">
</head>
<body>

{SPRITE}

{nav(R, p['path'])}

{body}

{footer(R)}

<script src="{R}js/main.js?v=2" defer></script>
</body>
</html>
'''

# ------------------------------------------------------------------ блоки
def eyebrow(sec, default=''):
    e = sec['eyebrow'] or default
    if not e: return ''
    return f'<p class="eyebrow">{inline(e)}</p>'

def head(sec, default_eyebrow='', center=False):
    lead = ''.join(f'<p class="lead" data-reveal style="--d:.1s">{inline(x)}</p>' for x in sec['paras'][:1])
    lead_c = ''.join(f'<p class="lead">{inline(x)}</p>' for x in sec['paras'][:1])
    if center:
        return f'<div class="sec-head sec-head--center" data-reveal><div>{eyebrow(sec, default_eyebrow)}<h2>{inline(sec["title"])}</h2>{lead_c}</div></div>'
    return f'<div class="sec-head"><div data-reveal>{eyebrow(sec, default_eyebrow)}<h2>{inline(sec["title"])}</h2></div>{lead}</div>'

def cards(sec, R, cols=None):
    items = sec['items']; n = len(items)
    cls = 'cards cards--%d' % (cols or (4 if n % 4 == 0 or n > 9 else 3 if n % 3 == 0 else 2 if n == 2 else 4 if n in (7, 5) else 3))
    out = ''
    for it in items:
        link = it.get('link', '')
        icon = ICON_BY_PATH.get(link, '')
        ic = f'<i class="card__i"><svg><use href="#{icon}"/></svg></i>' if icon else ''
        tag = it.get('tag_html', '')
        body = f'{ic}<h3>{inline(it["name"])}{tag}</h3><p>{inline(it.get("text", ""))}</p>'
        if link:
            out += f'<a class="card card--link" href="{href(link, R)}" data-reveal>{body}<span class="link">Подробнее <svg><use href="#i-arrow"/></svg></span></a>'
        else:
            out += f'<article class="card" data-reveal>{body}</article>'
    return f'<div class="{cls}">{out}</div>'

def ints(sec, R):
    out = ''
    for it in sec['items']:
        name = it['name']; logo = INT_LOGO.get(name)
        soon = any(c == 'soon' for c, _ in it['tags'])
        ic = f'<i><img src="{R}{logo}" alt="" width="42" height="42"></i>' if logo else f'<i><svg><use href="#i-link"/></svg></i>'
        inner = f'{ic}<div><b>{inline(name)}{it.get("tag_html", "")}</b><span>{strip_md(it.get("text", ""))}</span></div>'
        if it.get('link'):
            out += f'<a class="int" href="{href(it["link"], R)}">{inner}</a>'
        else:
            out += f'<div class="int{" int--soon" if soon else ""}">{inner}</div>'
    return f'<div class="ints" data-stagger>{out}</div>'

STEP_ICONS = ['i-cal', 'i-upload', 'i-doc', 'i-user', 'i-check', 'i-wallet']
def steps(sec, R):
    n = len(sec['items'])
    out = f'<div class="flow flow--{n}"><div class="flow__line"><i></i></div>'
    for k, it in enumerate(sec['items']):
        out += f'<div class="step" data-reveal style="--d:{k*.1:.1f}s"><div class="step__n"><svg><use href="#{STEP_ICONS[k % len(STEP_ICONS)]}"/></svg></div><small>ШАГ 0{k+1}</small><h3>{inline(it["name"])}</h3><p>{inline(it.get("text", ""))}</p></div>'
    return out + '</div>'

def faq(sec):
    out = ''
    for k, it in enumerate(sec['items']):
        out += f'<div class="q{" is-open" if k == 0 else ""}"><button>{inline(it["name"])}<i></i></button><div class="q__a"><div><p>{inline(it.get("text", ""))}</p></div></div></div>'
    return out

def quotes(sec):
    out = ''
    for it in sec['items']:
        ini = it['who'][:1]
        out += f'<article class="rev" data-reveal><q>{html.escape(it["quote"])}</q><div class="rev__who"><i>{ini}</i><div><b>{html.escape(it["who"])}</b><small>{html.escape(it["co"])}{(", " + it["seg"]) if it["seg"] else ""}</small></div></div></article>'
    return f'<div class="reviews" data-stagger>{out}</div>'

def shift(sec):
    rows = ''.join(f'<div class="shift__row"><div class="shift__was">{strip_md(it["was"])}</div><div class="shift__arr"><svg><use href="#i-arrow"/></svg></div><div class="shift__now">{inline(it["now"])}</div></div>' for it in sec['items'])
    return f'<div class="shift" data-reveal><div class="shift__row"><div>Было</div><div></div><div>Стало</div></div>{rows}</div>'

def checks(items, cls='debt__list'):
    return '<ul class="%s checks">%s</ul>' % (cls, ''.join(f'<li><i><svg><use href="#i-check"/></svg></i><span>{inline(it["check"])}</span></li>' for it in items if 'check' in it))

def text_block(sec, alt=False):
    paras = ''.join(f'<p>{inline(x)}</p>' for x in sec['paras'])
    return f'''<section class="section{" section--card" if alt else ""}">
  <div class="wrap prose" data-reveal>{eyebrow(sec)}<h2>{inline(sec["title"])}</h2><div class="prose__body">{paras}</div></div>
</section>'''

def generic_section(sec, R, alt):
    t = sec['type']
    cls = 'section section--card' if alt else 'section'
    if t == 'cards':
        return f'<section class="{cls}"><div class="wrap">{head(sec)}{cards(sec, R)}</div></section>'
    if t == 'steps':
        return f'<section class="{cls}"><div class="wrap">{head(sec, "Как это работает", center=True)}{steps(sec, R)}</div></section>'
    if t == 'text':
        return text_block(sec, alt)
    if t == 'faq':
        return f'<section class="{cls}" id="faq"><div class="wrap faq"><div data-reveal="left"><p class="eyebrow">FAQ</p><h2>{inline(sec["title"])}</h2><p class="lead" style="margin-top:18px">Остальное покажем на демо за 20 минут.</p></div><div class="faq__list" data-reveal="right">{faq(sec)}</div></div></section>'
    if t == 'table':
        return f'<section class="{cls}"><div class="wrap">{head(sec, center=True)}{shift(sec)}</div></section>'
    if t == 'quotes':
        return f'<section class="{cls}" id="reviews"><div class="wrap">{head(sec)}{quotes(sec)}</div></section>'
    if t == 'cta':
        return cta(sec, R)
    return ''

def phero(sec, crumbs, R, extra=''):
    lead = ''.join(f'<p class="lead">{inline(x)}</p>' for x in sec['paras'])
    return f'''<section class="phero">
  <div class="hero__checks"></div>
  <div class="wrap">
    <nav class="crumbs" aria-label="Хлебные крошки">{crumbs}</nav>
    {eyebrow(sec)}
    <h1>{inline(sec['title'])}</h1>
    {lead}
    <div class="hero__ctas" style="justify-content:flex-start;opacity:1;animation:none;margin-top:28px">
      <a class="btn btn--lg btn--yellow" href="#demo">Записаться на демо <svg><use href="#i-arrow"/></svg></a>
      <a class="btn btn--lg btn--ghost" href="{WA}" rel="noopener"><svg><use href="#i-wa"/></svg> Написать в WhatsApp</a>
    </div>{extra}
  </div>
</section>'''

# ------------------------------------------------------------------ главная
def home():
    p = BY_PATH['/']; R = './'
    S = {}
    for s in p['sections']:
        S.setdefault(s['type'], []).append(s)
    hero = S['hero'][0]
    out = f'''<section class="hero">
  <div class="hero__checks"></div>
  <div class="wrap">
    <div class="hero__inner">
      <div class="hero__pill"><b><svg width="14" height="6"><use href="#mark"/></svg> ТАКСОПАРКИ</b> {strip_md(hero['eyebrow'])}</div>
      <h1>Единая платформа для управления <span class="hl">таксопарком.</span></h1>
      <p class="lead">{inline(hero['paras'][0])}</p>
      <div class="hero__ctas">
        <a class="btn btn--lg btn--yellow" href="#demo">Записаться на демо <svg><use href="#i-arrow"/></svg></a>
        <a class="btn btn--lg btn--ghost" href="{LOGIN}">Войти</a>
      </div>
      <div class="hero__trust">
        <span><svg><use href="#i-check"/></svg> Посуточно и под выкуп</span>
        <span><svg><use href="#i-check"/></svg> Kaspi Pay без нашей комиссии</span>
        <span><svg><use href="#i-check"/></svg> Подпись через eGov</span>
      </div>
    </div>
    <div class="hero__stage">
      <div class="hero__frame">
        <img width="1800" height="1125" src="assets/screens/dashboard.webp" srcset="assets/screens/dashboard-960.webp 960w, assets/screens/dashboard.webp 1800w" sizes="(max-width: 1200px) 100vw, 1140px" alt="Главный экран Yume Fleet: выручка, машины в аренде, долги" fetchpriority="high">
        <div class="hero__fade"></div>
      </div>
      <div class="float float--1"><i><svg><use href="#i-alert"/></svg></i><div><b>Просрочено · 3 дня</b>Ерлан С. · Chevrolet Cobalt</div></div>
      <div class="float float--2"><i><svg><use href="#i-car"/></svg></i><div><b>Новый штраф ПДД</b>847 ABC 02 · привязан к водителю</div></div>
      <div class="float float--3"><i><svg><use href="#i-wallet"/></svg></i><div><b>Оплата через Kaspi Pay</b>+ 9 000 ₸ · зачислено в аренду</div></div>
    </div>
  </div>
</section>
'''
    # cards: что вы получаете с первого дня
    c0 = S['cards'][0]
    out += f'<div class="metrics"><div class="wrap" data-stagger>' + ''.join(f'<div class="metric"><b>{inline(it["name"])}{it.get("tag_html", "")}</b><span>{inline(it["text"])}</span></div>' for it in c0['items']) + '</div></div>\n'
    # tools
    t = S['tools'][0]
    icons = ['i-user', 'i-car', 'i-wallet']
    tools = ''.join(f'<article class="tool"><i><svg><use href="#{icons[k]}"/></svg></i><h3>{inline(it["name"])}</h3><p>{inline(it["text"])}</p><ul class="checks checks--sm">' + ''.join(f'<li><i><svg><use href="#i-check"/></svg></i><span>{inline(c)}</span></li>' for c in it.get('checks', [])) + '</ul></article>' for k, it in enumerate(t['items']))
    out += f'<section class="section" id="tools"><div class="wrap">{head(t)}<div class="tools" data-stagger>{tools}</div></div></section>\n'
    # text: история
    hist = S['text'][0]
    out += f'''<section class="section section--dark" id="story"><div class="wrap story"><div data-reveal="left">{eyebrow(hist)}<h2>{inline(hist['title'])}</h2></div><div class="story__body" data-reveal="right">{''.join(f'<p>{inline(x)}</p>' for x in hist['paras'])}</div></div></section>
'''
    # promo 1: оплаты — live ledger
    pr = S['promo']
    p1 = pr[0]
    out += f'''<section class="section" id="debt">
  <div class="wrap debt">
    <div data-reveal="left">{eyebrow(p1)}<h2>{inline(p1['title'])}</h2><p class="lead" style="margin-top:18px">{inline(p1['paras'][0])}</p>{checks(p1['items'])}<a class="btn" href="#demo">{p1['button'] or 'Записаться на демо'} <svg><use href="#i-arrow"/></svg></a></div>
    <div class="ledger" data-reveal="right">
      <div class="ledger__head"><b>Аренды · с просрочкой</b><span><i></i> <em class="ledger__event">обновляется в реальном времени</em></span></div>
      <table><thead><tr><th>Водитель</th><th>Машина</th><th>Ставка</th><th>Баланс</th></tr></thead><tbody></tbody></table>
      <div class="ledger__foot"><span>Долг по парку сегодня</span><b>33 500 ₸</b></div>
    </div>
  </div>
</section>
'''
    # promo 2: для водителя
    p2 = pr[1]
    paras = ''.join(f'<p class="lead" style="margin-top:14px">{inline(x)}</p>' for x in p2['paras'])
    out += f'''<section class="section section--card" id="driver">
  <div class="wrap drv">
    <div data-reveal="left">{eyebrow(p2)}<h2>{inline(p2['title'])}</h2>{paras}{checks(p2['items'], 'drv__list')}</div>
    <div class="drv__shots" data-reveal="scale">
      <figure class="drv__shot"><img src="assets/screens/pay-link.webp" width="1800" height="1125" alt="Страница оплаты аренды по ссылке Kaspi Pay" loading="lazy"><figcaption>Оплата по ссылке · уже сейчас</figcaption></figure>
      <figure class="drv__shot drv__shot--phone"><img src="assets/screens/driver-mobile.webp" width="840" height="2080" alt="Приложение водителя Yume Fleet" loading="lazy"><figcaption>Приложение водителя <em class="tag tag--soon">скоро</em></figcaption></figure>
    </div>
  </div>
</section>
'''
    # promo 3: выкуп — drawn card; promo 4: штрафы — screenshot
    p3, p4 = pr[2], pr[3]
    out += f'''<section class="section" id="buyout">
  <div class="wrap promo">
    <div class="promo__vis" data-reveal="scale">
      <div class="bcard">
        <div class="bcard__head"><span class="plate">847 ABC 02</span><b>Chevrolet Cobalt · 2022</b><em>Аренда под выкуп</em></div>
        <div class="bcard__sum"><small>Стоимость выкупа</small><b>7 200 000 ₸</b></div>
        <div class="bcard__bar"><i style="--p:.62"></i></div>
        <div class="bcard__row"><div><small>Накоплено</small><b class="pos">4 464 000 ₸</b></div><div><small>Осталось</small><b>2 736 000 ₸</b></div><div><small>Ближайший платёж</small><b>9 000 ₸ · завтра</b></div></div>
        <div class="bcard__steps"><span class="is-done">Взнос</span><span class="is-on">Выкуп</span><span>Выкуплено</span></div>
      </div>
    </div>
    <div data-reveal="right">{eyebrow(p3)}<h2>{inline(p3['title'])}</h2><p class="lead" style="margin-top:18px">{inline(p3['paras'][0])}</p>{checks(p3['items'])}<a class="link" href="features/buyout/">Подробнее про выкуп <svg><use href="#i-arrow"/></svg></a></div>
  </div>
</section>
<section class="section section--card" id="fines">
  <div class="wrap promo promo--rev">
    <div data-reveal="left">{eyebrow(p4)}<h2>{inline(p4['title'])}</h2><p class="lead" style="margin-top:18px">{inline(p4['paras'][0])}</p>{checks(p4['items'])}<a class="link" href="features/fines/">Подробнее про штрафы <svg><use href="#i-arrow"/></svg></a></div>
    <div class="promo__vis promo__vis--shot" data-reveal="scale"><img src="assets/screens/fines.webp" width="1800" height="1125" alt="Штрафы ПДД в Yume Fleet: протокол, водитель, срок скидки" loading="lazy"></div>
  </div>
</section>
'''
    # table: было/стало
    tb = S['table'][0]
    out += f'<section class="section" id="shift"><div class="wrap">{head(tb, center=True)}{shift(tb)}</div></section>\n'
    # cards 2: всё, чем живёт таксопарк
    c1 = S['cards'][1]
    out += f'<section class="section section--card" id="features"><div class="wrap">{head(c1)}{cards(c1, R, 4)}</div></section>\n'
    # cards 3: интеграции
    c2 = S['cards'][2]
    out += f'<section class="section" id="integrations"><div class="wrap">{head(c2)}{ints(c2, R)}<p class="more" data-reveal><a class="link" href="integrations/">Все интеграции <svg><use href="#i-arrow"/></svg></a></p></div></section>\n'
    # steps
    st = S['steps'][0]
    out += f'<section class="section section--card" id="start"><div class="wrap">{head(st, center=True)}{steps(st, R)}</div></section>\n'
    # quotes
    q = S['quotes'][0]
    out += f'<section class="section" id="reviews"><div class="wrap">{head(q)}{quotes(q)}</div></section>\n'
    # text: цена
    pr_ = S['text'][1]
    out += f'<section class="section section--card" id="price"><div class="wrap price" data-reveal>{eyebrow(pr_)}<h2>{inline(pr_["title"])}</h2><p class="lead">{inline(pr_["paras"][0])}</p><a class="btn btn--lg btn--yellow" href="#demo">Узнать цену на демо <svg><use href="#i-arrow"/></svg></a></div></section>\n'
    # faq
    out += generic_section(S['faq'][0], R, False) + '\n'
    out += cta(S['cta'][0], R)
    desc = strip_md(hero['paras'][0])
    write('/index.html', page(p, out, R, desc))

# ------------------------------------------------------------------ внутренние
def crumbs_for(p, R):
    path = p['path']
    parts = [f'<a href="{R}">Главная</a>']
    if path.startswith('/features/') and path != '/features/':
        parts.append(f'<a href="{href("/features/", R)}">Возможности</a>')
    short = {'/features/': 'Возможности', '/integrations/': 'Интеграции', '/perehod/': 'Для клиентов Yume Cloud', '/contacts/': 'Контакты', '/kaspi-pay/': 'Kaspi Pay', '/kaspi/': 'Kaspi Платежи'}
    name = short.get(path) or next((n for pp, n, _, _ in NAV_FEATURES if pp == path), strip_md(p['title']))
    parts.append(f'<b>{name}</b>')
    return '<span>/</span>'.join(parts)

def inner(p):
    R = rel(p['path'])
    secs = p['sections']
    hero = next((s for s in secs if s['type'] == 'hero'), None)
    body = ''
    if hero:
        body += phero(hero, crumbs_for(p, R), R)
        desc = strip_md(' '.join(hero['paras']))[:300]
    else:
        desc = strip_md(p['title'])
    alt = True
    for s in secs:
        if s['type'] == 'hero': continue
        if s['type'] == 'cards' and p['path'] == '/integrations/':
            body += f'<section class="section{" section--card" if alt else ""}"><div class="wrap">{head(s)}{ints(s, R)}</div></section>'
        else:
            body += generic_section(s, R, alt)
        if s['type'] != 'cta': alt = not alt
    if p['path'] == '/features/' and not hero:
        # индекс возможностей: заголовок из первой секции
        first = secs[0]
        body = phero(dict(title='Всё, чем живёт таксопарк', eyebrow='Возможности', paras=first['paras']), crumbs_for(p, R), R) + f'<section class="section section--card"><div class="wrap">{cards(first, R, 4)}</div></section>' + ''.join(generic_section(s, R, False) for s in secs[1:])
        desc = strip_md(' '.join(first['paras']))[:300]
    other = ''
    if p['path'].startswith('/features/') and p['path'] != '/features/':
        links = ''.join(f'<a class="chip" href="{href(pp, R)}"><svg><use href="#{i}"/></svg>{n}</a>' for pp, n, _, i in NAV_FEATURES if pp != p['path'])
        other = f'<section class="section section--card"><div class="wrap"><div class="sec-head"><div data-reveal><p class="eyebrow">Ещё</p><h2>Другие возможности Yume Fleet</h2></div></div><div class="chips" data-reveal>{links}</div></div></section>'
        body = body.replace('<section class="section section--yellow cta"', other + '<section class="section section--yellow cta"', 1)
    write(p['path'] + 'index.html', page(p, body, R, desc))

def contacts():
    p = BY_PATH['/contacts/']; R = rel('/contacts/'); hero = p['sections'][0]
    body = f'''<section class="phero">
  <div class="hero__checks"></div>
  <div class="wrap">
    <nav class="crumbs" aria-label="Хлебные крошки"><a href="{R}">Главная</a><span>/</span><b>Контакты</b></nav>
    {eyebrow(hero)}
    <h1>{inline(hero['title'])}</h1>
    <p class="lead">{inline(hero['paras'][0])}</p>
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap contacts">
    <div class="ccards" data-stagger>
      <a class="ccard ccard--wa" href="{WA}?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B4%D0%B5%D0%BC%D0%BE%20Yume%20Fleet" rel="noopener"><i><svg><use href="#i-wa"/></svg></i><div><small>WhatsApp, самый быстрый способ</small><b>{PHONE}</b><span>Демо, вопросы по продукту и переходу</span></div><svg class="ccard__arr"><use href="#i-arrow"/></svg></a>
      <a class="ccard" href="tel:+77779479990"><i><svg><use href="#i-phone"/></svg></i><div><small>Телефон</small><b>{PHONE}</b><span>Пн–Пт 9:00–19:00, Сб 10:00–16:00 по Алматы</span></div><svg class="ccard__arr"><use href="#i-arrow"/></svg></a>
      <a class="ccard" href="https://t.me/yumefleet" rel="noopener"><i><svg><use href="#i-inbox"/></svg></i><div><small>Telegram</small><b>@yumefleet</b><span>Канал поддержки и обновлений</span></div><svg class="ccard__arr"><use href="#i-arrow"/></svg></a>
      <a class="ccard" href="mailto:sales@yume.cloud"><i><svg><use href="#i-doc"/></svg></i><div><small>Продажи и партнёрство</small><b>sales@yume.cloud</b><span>Коммерческие предложения, интеграции, договоры</span></div><svg class="ccard__arr"><use href="#i-arrow"/></svg></a>
      <a class="ccard" href="mailto:support.cloud@yume.kz"><i><svg><use href="#i-shield"/></svg></i><div><small>Поддержка парков</small><b>support.cloud@yume.kz</b><span>Вопросы по работе системы</span></div><svg class="ccard__arr"><use href="#i-arrow"/></svg></a>
      <div class="ccard"><i><svg><use href="#i-pin"/></svg></i><div><small>Офис</small><b>Алматы, Казахстан</b><span>ТОО «Yume.Cloud». Встречи по договорённости, демо по видеосвязи.</span></div></div>
      <div class="ccard"><i><svg><use href="#i-user"/></svg></i><div><small>Вход для парков</small><b><a href="{LOGIN}" rel="noopener">app.yumefleet.kz</a></b><span>Кабинет парка</span></div></div>
    </div>
    <div class="contacts__form" data-reveal="right" id="demo">
      <h2 style="font-size:26px;margin-bottom:8px">Записаться на демо</h2>
      <p class="lead" style="font-size:15px;margin-bottom:22px">Покажем систему за 20 минут на примере парка вашего размера.</p>
      {form(R).replace(' data-reveal="right"', '')}
    </div>
  </div>
</section>'''
    write('/contacts/index.html', page(p, body, R, strip_md(hero['paras'][0])))

# ------------------------------------------------------------------ служебные
def write(path, content):
    full = os.path.join(ROOT, path.lstrip('/'))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8').write(content)
    print('wrote', path)

def service():
    today = datetime.date.today().isoformat()
    paths = [p['path'] for p in PAGES]
    urls = ''.join(f'  <url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod><priority>{"1.0" if u == "/" else "0.8"}</priority></url>\n' for u in paths)
    write('/sitemap.xml', f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    write('/robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n')
    p404 = dict(path='/404.html', title='Страница не найдена')
    body = '''<section class="phero" style="min-height:70vh;display:grid;align-items:center"><div class="hero__checks"></div><div class="wrap"><p class="eyebrow">Ошибка 404</p><h1>Такой страницы нет</h1><p class="lead">Возможно, ссылка устарела. Вот куда можно пойти дальше.</p><div class="hero__ctas" style="justify-content:flex-start;opacity:1;animation:none;margin-top:28px"><a class="btn btn--lg btn--yellow" href="./">На главную <svg><use href="#i-arrow"/></svg></a><a class="btn btn--lg btn--ghost" href="features/">Возможности</a></div></div></section>'''
    write('/404.html', page(p404, body, './', 'Страница не найдена.'))
    write('/.nojekyll', '')

home()
for p in PAGES:
    if p['path'] in ('/', '/contacts/'): continue
    inner(p)
contacts()
service()
