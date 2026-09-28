# -*- coding: utf-8 -*-
"""Генерирует сайт Yume Fleet из content/CONTENT.md.
Запуск: python3 build.py. Пути относительные, чтобы сайт работал и на GitHub Pages, и на yumefleet.com."""
import re, os, html, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = open(os.path.join(ROOT, 'content', 'CONTENT.md'), encoding='utf-8').read()
SRC_KK = open(os.path.join(ROOT, 'content', 'CONTENT.kk.md'), encoding='utf-8').read()
GA_ID = ''      # счётчик Google Analytics для yumefleet.com, например G-XXXXXXX
FB_PIXEL = ''   # Meta Pixel ID для yumefleet.com
FONTS_CSS = open(os.path.join(ROOT, 'assets', 'fonts', 'fonts.css'), encoding='utf-8').read()
L = 'ru'
UI = {
 'ru': dict(home='Главная', features='Возможности', dd_open='Раскрыть возможности', all_features='Все возможности', integrations='Интеграции', perehod='Для клиентов Yume Cloud', contacts='Контакты', demo='Записаться на демо', login='Войти', menu='Основное меню', burger='Меню',
   footer_about='Платформа для управления таксопарком. ТОО «Yume.Cloud», Алматы, Казахстан.', product='Продукт', kaspi_pay='Оплата по ссылке Kaspi Pay', kaspi='Kaspi Платежи 2,5%', login_sys='Войти в систему', docs='Документы',
   doc_list=['Политика конфиденциальности', 'Публичная оферта', 'Пользовательское соглашение', 'Рекуррентные платежи', 'Отмена и возврат платежей', 'Процедура оплаты', 'Удаление аккаунта'], copy='© ТОО «Yume.Cloud», 2026', cloud='Сдаёте инвентарь, а не машины? yume.cloud', wa='Написать в WhatsApp', top='Наверх',
   f_name='Имя', f_name_ph='Как к вам обращаться', f_phone='Телефон', f_cars='Сколько машин в парке', f_cars_opts=['до 10 машин', '10–30 машин', '30–100 машин', '100+ машин'], f_city='Город', f_city_ph='Алматы', f_consent='Согласен на обработку персональных данных в соответствии с', f_policy='политикой конфиденциальности', f_ok='Заявка отправлена', f_ok_sub='Перезвоним в течение 15 минут в рабочее время.',
   cta_eyebrow='Демо', cta_list=['Перезвоним в течение 15 минут в рабочее время', 'Показываем на примере парка вашего размера', 'Данные переносим мы, парк продолжает работать'], cta_wa='Или напишите в WhatsApp', cta_default='Записаться на демо', cta_lead='Покажем систему за 20 минут на примере парка вашего размера.',
   more='Подробнее', step='ШАГ', how='Как это работает', faq_lead='Остальное покажем на демо за 20 минут.', faq_eyebrow='FAQ', wa_btn='Написать в WhatsApp',
   pill='ТАКСОПАРКИ', trust=['Посуточно и под выкуп', 'Kaspi Pay без нашей комиссии', 'Подпись через eGov'], hero_alt='Главный экран Yume Fleet: выручка, машины в аренде, долги',
   fl1=('Просрочено · 3 дня', 'Ерлан С. · Chevrolet Cobalt'), fl2=('Новый штраф ПДД', '847 ABC 02 · привязан к водителю'), fl3=('Оплата через Kaspi Pay', '+ 9 000 ₸ · зачислено в аренду'),
   ledger_head='Аренды · с просрочкой', ledger_live='обновляется в реальном времени', ledger_cols=['Водитель', 'Машина', 'Ставка', 'Баланс'], ledger_foot='Долг по парку сегодня',
   drv_cap1='Оплата по ссылке · уже сейчас', drv_cap2='Приложение водителя', drv_alt1='Страница оплаты аренды по ссылке Kaspi Pay', drv_alt2='Приложение водителя Yume Fleet', soon='скоро',
   bc_type='Аренда под выкуп', bc_price='Стоимость выкупа', bc_saved='Накоплено', bc_left='Осталось', bc_next='Ближайший платёж', bc_next_v='9 000 ₸ · завтра', bc_steps=['Взнос', 'Выкуп', 'Выкуплено'], more_buyout='Подробнее про выкуп', more_fines='Подробнее про штрафы', fines_alt='Штрафы ПДД в Yume Fleet: протокол, водитель, срок скидки',
   all_ints='Все интеграции', price_btn='Узнать цену на демо',
   c_wa='WhatsApp, самый быстрый способ', c_wa_sub='Демо, вопросы по продукту и переходу', c_phone='Телефон', c_phone_sub='Пн–Пт 9:00–19:00, Сб 10:00–16:00 по Алматы', c_tg='Telegram', c_tg_sub='Канал поддержки и обновлений', c_sales='Продажи и партнёрство', c_sales_sub='Коммерческие предложения, интеграции, договоры', c_sup='Поддержка парков', c_sup_sub='Вопросы по работе системы', c_office='Офис', c_city='Алматы, Казахстан', c_office_sub='ТОО «Yume.Cloud». Встречи по договорённости, демо по видеосвязи.', c_login='Вход для парков', c_login_sub='Кабинет парка', c_form_h='Записаться на демо', c_form_p='Покажем систему за 20 минут на примере парка вашего размера.', crumbs='Хлебные крошки',
   t404='Страница не найдена', h404='Такой страницы нет', p404='Возможно, ссылка устарела. Вот куда можно пойти дальше.', to_home='На главную'),
 'kk': dict(home='Басты бет', features='Мүмкіндіктер', dd_open='Мүмкіндіктерді ашу', all_features='Барлық мүмкіндіктер', integrations='Интеграциялар', perehod='Yume Cloud клиенттеріне', contacts='Байланыс', demo='Демоға жазылу', login='Кіру', menu='Негізгі мәзір', burger='Мәзір',
   footer_about='Таксопаркті басқаруға арналған платформа. «Yume.Cloud» ЖШС, Алматы, Қазақстан.', product='Өнім', kaspi_pay='Kaspi Pay сілтемесі арқылы төлем', kaspi='Kaspi Төлемдер 2,5%', login_sys='Жүйеге кіру', docs='Құжаттар',
   doc_list=['Құпиялылық саясаты', 'Жария оферта', 'Пайдаланушы келісімі', 'Рекурренттік төлемдер', 'Төлемдерді болдырмау және қайтару', 'Төлем тәртібі', 'Аккаунтты жою'], copy='© «Yume.Cloud» ЖШС, 2026', cloud='Көлік емес, мүкәммал жалға бересіз бе? yume.cloud', wa='WhatsApp-қа жазу', top='Жоғарыға',
   f_name='Аты', f_name_ph='Сізге қалай жүгінуге болады', f_phone='Телефон', f_cars='Паркте қанша көлік', f_cars_opts=['10 көлікке дейін', '10–30 көлік', '30–100 көлік', '100+ көлік'], f_city='Қала', f_city_ph='Алматы', f_consent='Жеке деректерімді өңдеуге келісемін,', f_policy='құпиялылық саясатына сәйкес', f_ok='Өтінім жіберілді', f_ok_sub='Жұмыс уақытында 15 минут ішінде қайта қоңырау шаламыз.',
   cta_eyebrow='Демо', cta_list=['Жұмыс уақытында 15 минут ішінде қайта қоңырау шаламыз', 'Сіздің парк көлеміндегі мысалда көрсетеміз', 'Деректерді біз көшіреміз, парк жұмысын жалғастырады'], cta_wa='Немесе WhatsApp-қа жазыңыз', cta_default='Демоға жазылу', cta_lead='Жүйені 20 минутта сіздің парк көлеміндегі мысалда көрсетеміз.',
   more='Толығырақ', step='ҚАДАМ', how='Қалай жұмыс істейді', faq_lead='Қалғанын 20 минуттық демода көрсетеміз.', faq_eyebrow='Сұрақ-жауап', wa_btn='WhatsApp-қа жазу',
   pill='ТАКСОПАРКТЕР', trust=['Тәуліктік және сатып алумен', 'Kaspi Pay біздің комиссиямызсыз', 'eGov арқылы қол қою'], hero_alt='Yume Fleet басты экраны: түсім, жалдаудағы көліктер, қарыздар',
   fl1=('Мерзімі өткен · 3 күн', 'Ерлан С. · Chevrolet Cobalt'), fl2=('Жаңа ЖҚЕ айыппұлы', '847 ABC 02 · жүргізушіге байланды'), fl3=('Kaspi Pay арқылы төлем', '+ 9 000 ₸ · жалдауға түсті'),
   ledger_head='Жалдаулар · мерзімі өткен', ledger_live='нақты уақытта жаңарады', ledger_cols=['Жүргізуші', 'Көлік', 'Ставка', 'Баланс'], ledger_foot='Парк бойынша бүгінгі қарыз',
   drv_cap1='Сілтеме арқылы төлем · қазірдің өзінде', drv_cap2='Жүргізуші қосымшасы', drv_alt1='Kaspi Pay сілтемесі арқылы жалдау төлемі беті', drv_alt2='Yume Fleet жүргізуші қосымшасы', soon='жақында',
   bc_type='Сатып алумен жалдау', bc_price='Сатып алу құны', bc_saved='Жиналды', bc_left='Қалды', bc_next='Келесі төлем', bc_next_v='9 000 ₸ · ертең', bc_steps=['Жарна', 'Сатып алу', 'Сатып алынды'], more_buyout='Сатып алу туралы толығырақ', more_fines='Айыппұлдар туралы толығырақ', fines_alt='Yume Fleet-тегі ЖҚЕ айыппұлдары: хаттама, жүргізуші, жеңілдік мерзімі',
   all_ints='Барлық интеграциялар', price_btn='Бағаны демода білу',
   c_wa='WhatsApp, ең жылдам тәсіл', c_wa_sub='Демо, өнім және көшу бойынша сұрақтар', c_phone='Телефон', c_phone_sub='Дс–Жм 9:00–19:00, Сб 10:00–16:00, Алматы уақыты', c_tg='Telegram', c_tg_sub='Қолдау және жаңартулар арнасы', c_sales='Сату және серіктестік', c_sales_sub='Коммерциялық ұсыныстар, интеграциялар, шарттар', c_sup='Парктерді қолдау', c_sup_sub='Жүйенің жұмысы бойынша сұрақтар', c_office='Кеңсе', c_city='Алматы, Қазақстан', c_office_sub='«Yume.Cloud» ЖШС. Кездесулер келісім бойынша, демо бейнебайланыс арқылы.', c_login='Парктер үшін кіру', c_login_sub='Парк кабинеті', c_form_h='Демоға жазылу', c_form_p='Жүйені 20 минутта сіздің парк көлеміндегі мысалда көрсетеміз.', crumbs='Нан үгінділері',
   t404='Бет табылмады', h404='Мұндай бет жоқ', p404='Сілтеме ескірген болуы мүмкін. Әрі қарай қайда баруға болады.', to_home='Басты бетке'),
}
NAV_KK = {'/features/rentals/': ('Жалдау карточкасы', 'Тәуліктік, мерзім, төлем кестесі'), '/features/buyout/': ('Сатып алумен жалдау', 'Жарна, барысы, қалдық'), '/features/shifts/': ('Ауысымдар', 'Бір көлікте екі жүргізуші'), '/features/drivers/': ('Жүргізушілер', 'Қарыз, депозит, сенімділік'), '/features/vehicles/': ('Көліктер', 'ТҚ, жөндеу, қойма, өтелімділік'), '/features/finance/': ('Ақша мен қарыздар', 'Есептеулер, төлемдер, өтеу'), '/features/fines/': ('ЖҚЕ айыппұлдары мен залал', 'Хаттама, жеңілдік, бөліп төлеу'), '/features/documents/': ('Құжаттар мен қол қою', 'Шарттар, актілер, eGov және SMS'), '/features/investors/': ('Субжалдау және лизинг', 'Инвесторлар, үлестер, кредиттер'), '/features/analytics/': ('Аналитика', 'P&L, cash flow, өтелімділік'), '/features/leads/': ('WhatsApp және воронка', 'Жүргізуші өтінімдері жалдауға дейін'), '/features/settings/': ('Икемді баптаулар', 'Ережелер, рөлдер, бірнеше парк')}
def T(k): return UI[L][k]
def nav_feats():
    return [(p, NAV_KK[p][0] if L == 'kk' else n, NAV_KK[p][1] if L == 'kk' else s, i) for p, n, s, i in NAV_FEATURES]
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

def parse(src=None):
    pages = []
    cur = None; sec = None
    for raw in (src or SRC).split('\n'):
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
PAGES_KK = parse(SRC_KK)
BY_PATH_KK = {p['path']: p for p in PAGES_KK}

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
FEATURE_IMG = {'/features/rentals/': ('screens/rent-card.webp', 'Карточка аренды в Yume Fleet'), '/features/buyout/': ('img/gen/F4.webp', 'Аренда под выкуп: машина, взнос и ключи'), '/features/shifts/': ('screens/rents.webp', 'Список аренд Yume Fleet'), '/features/drivers/': ('screens/driver-card.webp', 'Карточка водителя в Yume Fleet'), '/features/vehicles/': ('screens/vehicle-card.webp', 'Карточка машины в Yume Fleet'), '/features/finance/': ('screens/finance.webp', 'Финансы парка в Yume Fleet'), '/features/fines/': ('img/gen/F5.webp', 'Штраф ПДД: камера, протокол и срок скидки'), '/features/documents/': ('screens/waybills.webp', 'Документы и путевые листы в Yume Fleet'), '/features/investors/': ('screens/sublease.webp', 'Субаренда и инвесторы в Yume Fleet'), '/features/analytics/': ('screens/analytics.webp', 'Аналитика парка в Yume Fleet'), '/features/leads/': ('screens/drivers.webp', 'База водителей и кандидатов в Yume Fleet'), '/features/settings/': ('screens/settings.webp', 'Настройки парка в Yume Fleet'), '/kaspi-pay/': ('img/gen/F3.webp', 'Водитель платит за аренду с телефона'), '/kaspi/': ('screens/pay-link.webp', 'Оплата аренды через Kaspi'), '/integrations/': ('screens/pay-link.webp', 'Интеграции Yume Fleet'), '/perehod/': ('img/gen/F6.webp', 'Переход с Yume Cloud на Yume Fleet'), '/features/': ('img/gen/F1.webp', 'Таксопарк на платформе Yume Fleet')}
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
    dd = ''.join(f'<a class="dd__i" href="{href(p, R)}"><svg><use href="#{i}"/></svg><div><b>{n}</b><small>{s}</small></div></a>' for p, n, s, i in nav_feats())
    act = lambda p: ' class="is-cur"' if p == path else ''
    home_href = href('/kk/', R) if L == 'kk' else R
    alt = {'/': '/kk/', '/contacts/': '/kk/contacts/', '/kk/': '/', '/kk/contacts/': '/contacts/'}.get(path)
    lang = f'<a class="nav__lang" href="{href(alt, R)}" hreflang="{"ru" if L == "kk" else "kk"}" lang="{"ru" if L == "kk" else "kk"}">{"RU" if L == "kk" else "KZ"}</a>' if alt else ''
    contacts_href = href('/kk/contacts/' if L == 'kk' else '/contacts/', R)
    return f'''<header class="nav">
  <div class="wrap">
    <a class="logo" href="{home_href}"><i><svg><use href="#mark"/></svg></i><span><b>yume</b><em>fleet</em></span></a>
    <nav aria-label="{T("menu")}">
      <ul class="nav__menu">
        <li><a href="{home_href}"{act('/kk/' if L == 'kk' else '/')}>{T("home")}</a></li>
        <li class="has-dd"><a href="{href('/features/', R)}"{act('/features/')}>{T("features")} <svg><use href="#i-chev"/></svg></a><button class="dd__tgl" aria-label="{T("dd_open")}"><svg><use href="#i-chev"/></svg></button><div class="dd"><div class="dd__panel"><div class="dd__grid">{dd}</div><a class="dd__all" href="{href('/features/', R)}">{T("all_features")} <svg><use href="#i-arrow"/></svg></a></div></div></li>
        <li><a href="{href('/integrations/', R)}"{act('/integrations/')}>{T("integrations")}</a></li>
        <li><a href="{href('/perehod/', R)}"{act('/perehod/')}>{T("perehod")}</a></li>
        <li><a href="{contacts_href}"{act('/kk/contacts/' if L == 'kk' else '/contacts/')}>{T("contacts")}</a></li>
        <li><a class="nav__cta-m" href="#demo">{T("demo")}</a></li>
      </ul>
    </nav>
    <div class="nav__actions">
      {lang}<a class="nav__login" href="{LOGIN}">{T("login")}</a>
      <a class="btn btn--sm btn--yellow" href="#demo">{T("demo")}</a>
      <button class="nav__burger" aria-label="{T("burger")}"><span></span></button>
    </div>
  </div>
</header>'''

def footer(R):
    feats = ''.join(f'<li><a href="{href(p, R)}">{n}</a></li>' for p, n, _, _ in nav_feats()[:6])
    D = T("doc_list"); docs_urls = ['https://yume.cloud/legal/privacy/', 'https://yume.cloud/legal/oferta/', 'https://yume.cloud/legal/terms/', 'https://yume.cloud/legal/recurring/', 'https://yume.cloud/legal/refund/', 'https://yume.cloud/legal/payment/', 'https://yume.cloud/delete-account/']
    docs = ''.join(f'<li><a href="{u}" rel="noopener">{n}</a></li>' for n, u in zip(D, docs_urls))
    contacts_href = href('/kk/contacts/' if L == 'kk' else '/contacts/', R)
    return f'''<footer class="footer">
  <div class="wrap">
    <div class="footer__top">
      <div class="footer__brand">
        <a class="logo logo--dark" href="{R}"><i><svg><use href="#mark"/></svg></i><span><b>yume</b><em>fleet</em></span></a>
        <p>{T("footer_about")}</p>
        <a href="tel:+77779479990">{PHONE}</a>
        <a href="mailto:sales@yume.cloud">sales@yume.cloud</a>
      </div>
      <div><h4>{T("features")}</h4><ul>{feats}<li><a href="{href('/features/', R)}">{T("all_features")}</a></li></ul></div>
      <div><h4>{T("product")}</h4><ul><li><a href="{href('/kaspi-pay/', R)}">{T("kaspi_pay")}</a></li><li><a href="{href('/kaspi/', R)}">{T("kaspi")}</a></li><li><a href="{href('/integrations/', R)}">{T("integrations")}</a></li><li><a href="{href('/perehod/', R)}">{T("perehod")}</a></li><li><a href="{contacts_href}">{T("contacts")}</a></li><li><a href="{LOGIN}" rel="noopener">{T("login_sys")}</a></li></ul></div>
      <div><h4>{T("docs")}</h4><ul>{docs}</ul></div>
    </div>
    <div class="footer__bot">
      <div class="legal"><span>{T("copy")}</span><a href="https://www.instagram.com/yumecloudx/" rel="noopener">Instagram</a><a href="https://t.me/yumefleet" rel="noopener">Telegram</a></div>
      <a class="cloud" href="https://yume.cloud{'/kk/' if L == 'kk' else ''}"><i></i> {T("cloud")}</a>
    </div>
  </div>
</footer>
<a class="wa-fab" href="{WA}" rel="noopener" aria-label="{T("wa")}"><svg><use href="#i-wa"/></svg><span>{T("wa")}</span></a>
<button class="to-top" aria-label="{T("top")}"><svg><use href="#i-up"/></svg></button>
<a class="wa-fab" href="{WA}" rel="noopener" aria-label="Написать в WhatsApp"><svg><use href="#i-wa"/></svg><span>Написать в WhatsApp</span></a>
<button class="to-top" aria-label="Наверх"><svg><use href="#i-up"/></svg></button>'''

def form(R):
    opts = ''.join(f'<option>{o}</option>' for o in T("f_cars_opts"))
    return f'''<form class="form" data-reveal="right" data-endpoint="{LEAD}" novalidate>
      <div class="field"><label for="name">{T("f_name")}</label><input id="name" name="name" placeholder="{T("f_name_ph")}" required autocomplete="name"></div>
      <div class="field"><label for="phone">{T("f_phone")}</label><input id="phone" name="phone" type="tel" placeholder="+7 777 000 00 00" required autocomplete="tel" inputmode="tel"></div>
      <div class="form__row">
        <div class="field"><label for="cars">{T("f_cars")}</label><select id="cars" name="cars">{opts}</select></div>
        <div class="field"><label for="city">{T("f_city")}</label><input id="city" name="city" placeholder="{T("f_city_ph")}" autocomplete="address-level2"></div>
      </div>
      <input type="text" name="website" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
      <button class="btn btn--lg" type="submit">{T("demo")}</button>
      <label class="consent"><input type="checkbox" checked required> {T("f_consent")} <a href="https://yume.cloud/legal/privacy/" style="text-decoration:underline">{T("f_policy")}</a></label>
      <div class="form__ok"><div><i><svg><use href="#i-check"/></svg></i><h3>{T("f_ok")}</h3><p style="color:var(--muted);margin-top:8px">{T("f_ok_sub")}</p></div></div>
    </form>'''

def cta(sec, R):
    title = strip_md(sec['title']) or T("cta_default")
    lead = inline(' '.join(sec['paras'])) or T("cta_lead")
    lis = ''.join(f'<li><svg><use href="#i-check"/></svg>{x}</li>' for x in T("cta_list"))
    return f'''<section class="section section--yellow cta" id="demo">
  <div class="wrap">
    <div data-reveal="left">
      <p class="eyebrow" style="color:var(--ink)">{T("cta_eyebrow")}</p>
      <h2>{html.escape(title)}</h2>
      <p class="lead" style="margin-top:18px;color:var(--ink);opacity:.8">{lead}</p>
      <ul class="cta__list">{lis}</ul>
      <a class="cta__wa" href="{WA}" rel="noopener"><svg><use href="#i-wa"/></svg> {T("cta_wa")}: {PHONE}</a>
    </div>
    {form(R)}
  </div>
</section>'''

def ld(p, body):
    import json
    org = {'@context': 'https://schema.org', '@type': 'Organization', 'name': 'Yume Fleet', 'legalName': 'ТОО «Yume.Cloud»', 'url': SITE + '/', 'logo': SITE + '/assets/logo/tile.svg', 'telephone': '+77779479990', 'email': 'sales@yume.cloud', 'address': {'@type': 'PostalAddress', 'addressLocality': 'Алматы', 'addressCountry': 'KZ'}, 'sameAs': ['https://www.instagram.com/yumecloudx/', 'https://t.me/yumefleet']}
    blocks = [org]
    crumbs = re.findall(r'<nav class="crumbs"[^>]*>(.*?)</nav>', body, re.S)
    if crumbs:
        items = re.findall(r'<a href="([^"]+)">([^<]+)</a>|<b>([^<]+)</b>', crumbs[0])
        lst = []; pos = 1
        for h, n, b in items:
            lst.append({'@type': 'ListItem', 'position': pos, 'name': n or b, 'item': (SITE + p['path']) if b else (SITE + '/' + h.replace('../', '').replace('./', ''))}); pos += 1
        blocks.append({'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': lst})
    qs = re.findall(r'<div class="q(?: is-open)?"><button>(.*?)<i></i></button><div class="q__a"><div><p>(.*?)</p>', body, re.S)
    st = lambda x: re.sub(r'<[^>]+>', '', x).strip()
    if qs: blocks.append({'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': st(q), 'acceptedAnswer': {'@type': 'Answer', 'text': st(a)}} for q, a in qs]})
    if p['path'] in ('/', '/kk/'):
        blocks.append({'@context': 'https://schema.org', '@type': 'SoftwareApplication', 'name': 'Yume Fleet', 'applicationCategory': 'BusinessApplication', 'operatingSystem': 'Web', 'description': 'Платформа для управления таксопарком: аренда посуточно и под выкуп, долги, Kaspi Pay, штрафы ПДД, подписание через eGov.', 'url': SITE + '/', 'publisher': {'@type': 'Organization', 'name': 'Yume Fleet'}, 'offers': {'@type': 'Offer', 'priceCurrency': 'KZT', 'description': 'Цена по запросу, подписка за каждую машину'}})
    return ''.join('<script type="application/ld+json">' + json.dumps(b, ensure_ascii=False) + '</script>\n' for b in blocks)

def analytics():
    if not GA_ID and not FB_PIXEL: return ''
    ga = f"var g=document.createElement('script');g.async=true;g.src='https://www.googletagmanager.com/gtag/js?id={GA_ID}';document.head.appendChild(g);gtag('js',new Date());gtag('config','{GA_ID}');" if GA_ID else ''
    fb = f"var f=document.createElement('script');f.async=true;f.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(f);fbq('init','{FB_PIXEL}');fbq('track','PageView');" if FB_PIXEL else ''
    return ("<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}"
            "!function(f,b){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window,document);"
            "(function(){var done=false;function load(){if(done)return;done=true;" + ga + fb + "}"
            "['scroll','pointerdown','keydown','touchstart'].forEach(function(e){addEventListener(e,load,{once:true,passive:true})});setTimeout(load,4000);})();</script>\n")

def page(p, body, R, desc):
    title = html.escape(p['title'])
    if not title.startswith('Yume Fleet'): title += ' — Yume Fleet'
    canon = SITE + p['path']
    alt = {'/': '/kk/', '/contacts/': '/kk/contacts/', '/kk/': '/', '/kk/contacts/': '/contacts/'}.get(p['path'])
    ru = p['path'].replace('/kk', '', 1) if L == 'kk' else p['path']
    hreflang = f'<link rel="alternate" hreflang="ru" href="{SITE}{ru}">\n<link rel="alternate" hreflang="kk" href="{SITE}/kk{ru}">\n<link rel="alternate" hreflang="x-default" href="{SITE}{ru}">\n' if alt else ''
    preload = f'<link rel="preload" as="image" href="{R}assets/screens/dashboard.webp" imagesrcset="{R}assets/screens/dashboard-960.webp 960w, {R}assets/screens/dashboard.webp 1800w" imagesizes="(max-width: 1200px) 100vw, 1140px">\n' if p['path'] in ('/', '/kk/') else ''
    return f'''<!doctype html>
<html lang="{L}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canon}">
{hreflang}{preload}
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{R}assets/logo/favicon.svg" type="image/svg+xml">
<link rel="preload" as="font" type="font/woff2" href="{R}assets/fonts/geist-800-cyrillic.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="{R}assets/fonts/geist-400-cyrillic.woff2" crossorigin>
<style>{FONTS_CSS.replace('url(', 'url(' + R + 'assets/fonts/')}</style>
<link rel="stylesheet" href="{R}css/styles.css?v=9">
{ld(p, body)}{analytics()}</head>
<body>

{SPRITE}

{nav(R, p['path'])}

{body}

{footer(R)}

<script src="{R}js/main.js?v=4" defer></script>
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
            out += f'<a class="card card--link" href="{href(link, R)}" data-reveal>{body}<span class="link">{T("more")} <svg><use href="#i-arrow"/></svg></span></a>'
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

def int_acc(sec, R):
    out = ''
    for k, it in enumerate(sec['items']):
        name = it['name']; logo = INT_LOGO.get(name)
        soon = any(c == 'soon' for c, _ in it['tags'])
        ic = f'<i><img src="{R}{logo}" alt="" width="42" height="42"></i>' if logo else '<i><svg><use href="#i-link"/></svg></i>'
        link = f'<a class="link" href="{href(it["link"], R)}">{T("more")} <svg><use href="#i-arrow"/></svg></a>' if it.get('link') else ''
        parts = [x.strip() for x in strip_md(it.get('text', '')).split('.') if x.strip()]
        sub = parts[0] if len(parts) > 1 else ''
        out += (f'<div class="iacc{" iacc--soon" if soon else ""}{" is-open" if k == 0 else ""}">'
                f'<button type="button">{ic}<span><b>{inline(name)}{it.get("tag_html", "")}</b>{f'<small>{sub}</small>' if sub else ''}</span><i class="iacc__x"></i></button>'
                f'<div class="iacc__a"><div><p>{inline(it.get("text", ""))}</p>{link}</div></div></div>')
    return f'<div class="iaccs" data-reveal>{out}</div>'

STEP_ICONS = ['i-cal', 'i-upload', 'i-doc', 'i-user', 'i-check', 'i-wallet']
def steps(sec, R):
    n = len(sec['items'])
    out = f'<div class="flow flow--{n}"><div class="flow__line"><i></i></div>'
    for k, it in enumerate(sec['items']):
        out += f'<div class="step" data-reveal style="--d:{k*.1:.1f}s"><div class="step__n"><svg><use href="#{STEP_ICONS[k % len(STEP_ICONS)]}"/></svg></div><small>{T("step")} 0{k+1}</small><h3>{inline(it["name"])}</h3><p>{inline(it.get("text", ""))}</p></div>'
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
        return f'<section class="{cls}"><div class="wrap">{head(sec, T("how"), center=True)}{steps(sec, R)}</div></section>'
    if t == 'text':
        return text_block(sec, alt)
    if t == 'faq':
        return f'<section class="{cls}" id="faq"><div class="wrap faq"><div data-reveal="left"><p class="eyebrow">{T("faq_eyebrow")}</p><h2>{inline(sec["title"])}</h2><p class="lead" style="margin-top:18px">{T("faq_lead")}</p></div><div class="faq__list" data-reveal="right">{faq(sec)}</div></div></section>'
    if t == 'table':
        return f'<section class="{cls}"><div class="wrap">{head(sec, center=True)}{shift(sec)}</div></section>'
    if t == 'quotes':
        return f'<section class="{cls}" id="reviews"><div class="wrap">{head(sec)}{quotes(sec)}</div></section>'
    if t == 'cta':
        return cta(sec, R)
    return ''

def phero(sec, crumbs, R, extra='', img=None):
    lead = ''.join(f'<p class="lead">{inline(x)}</p>' for x in sec['paras'])
    shot = f'<div class="phero__vis" data-reveal="scale"><img src="{R}assets/{img[0]}" alt="{img[1]}" fetchpriority="high"></div>' if img else ''
    return f'''<section class="phero{" phero--grid" if img else ""}">
  <div class="hero__checks"></div>
  <div class="wrap">
    <div>
    <nav class="crumbs" aria-label="{T("crumbs")}">{crumbs}</nav>
    {eyebrow(sec)}
    <h1>{inline(sec['title'])}</h1>
    {lead}
    <div class="hero__ctas" style="justify-content:flex-start;opacity:1;animation:none;margin-top:28px">
      <a class="btn btn--lg btn--yellow" href="#demo">{T("demo")} <svg><use href="#i-arrow"/></svg></a>
      <a class="btn btn--lg btn--ghost" href="{WA}" rel="noopener"><svg><use href="#i-wa"/></svg> {T("wa_btn")}</a>
    </div>{extra}
    </div>{shot}
  </div>
</section>'''

# ------------------------------------------------------------------ главная
def home():
    p = (BY_PATH_KK if L == 'kk' else BY_PATH)['/kk/' if L == 'kk' else '/']; R = rel(p['path'])
    S = {}
    for s in p['sections']:
        S.setdefault(s['type'], []).append(s)
    hero = S['hero'][0]
    words = strip_md(hero['title']).split(' ')
    h1 = ' '.join(words[:-1]) + ' <span class="hl">' + words[-1] + '</span>'
    trust = ''.join(f'<span><svg><use href="#i-check"/></svg> {x}</span>' for x in T("trust"))
    out = f'''<section class="hero">
  <div class="hero__checks"></div>
  <div class="wrap">
    <div class="hero__inner">
      <div class="hero__pill"><b><svg width="14" height="6"><use href="#mark"/></svg> {T("pill")}</b> {strip_md(hero['eyebrow'])}</div>
      <h1>{h1}</h1>
      <p class="lead">{inline(hero['paras'][0])}</p>
      <div class="hero__ctas">
        <a class="btn btn--lg btn--yellow" href="#demo">{T("demo")} <svg><use href="#i-arrow"/></svg></a>
        <a class="btn btn--lg btn--ghost" href="{LOGIN}">{T("login")}</a>
      </div>
      <div class="hero__trust">{trust}</div>
    </div>
    <div class="hero__stage">
      <div class="hero__frame">
        <img width="1800" height="1125" src="{R}assets/screens/dashboard.webp" srcset="{R}assets/screens/dashboard-960.webp 960w, {R}assets/screens/dashboard.webp 1800w" sizes="(max-width: 1200px) 100vw, 1140px" alt="{T("hero_alt")}" fetchpriority="high">
        <div class="hero__fade"></div>
      </div>
      <div class="float float--1"><i><svg><use href="#i-alert"/></svg></i><div><b>{T("fl1")[0]}</b>{T("fl1")[1]}</div></div>
      <div class="float float--2"><i><svg><use href="#i-car"/></svg></i><div><b>{T("fl2")[0]}</b>{T("fl2")[1]}</div></div>
      <div class="float float--3"><i><svg><use href="#i-wallet"/></svg></i><div><b>{T("fl3")[0]}</b>{T("fl3")[1]}</div></div>
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
    <div data-reveal="left">{eyebrow(p1)}<h2>{inline(p1['title'])}</h2><p class="lead" style="margin-top:18px">{inline(p1['paras'][0])}</p>{checks(p1['items'])}<a class="btn" href="#demo">{p1['button'] or T("demo")} <svg><use href="#i-arrow"/></svg></a></div>
    <div class="ledger" data-reveal="right">
      <div class="ledger__head"><b>{T("ledger_head")}</b><span><i></i> <em class="ledger__event">{T("ledger_live")}</em></span></div>
      <table><thead><tr>{''.join(f'<th>{c}</th>' for c in T("ledger_cols"))}</tr></thead><tbody></tbody></table>
      <div class="ledger__foot"><span>{T("ledger_foot")}</span><b>33 500 ₸</b></div>
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
    <div class="drv__shots drv__shots--one" data-reveal="scale">
      <figure class="drv__shot"><img src="{R}assets/screens/pay-link.webp" width="1800" height="1125" alt="{T("drv_alt1")}" loading="lazy"><figcaption>{T("drv_cap1")}</figcaption></figure>
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
        <div class="bcard__head"><span class="plate">847 ABC 02</span><b>Chevrolet Cobalt · 2022</b><em>{T("bc_type")}</em></div>
        <div class="bcard__sum"><small>{T("bc_price")}</small><b>7 200 000 ₸</b></div>
        <div class="bcard__bar"><i style="--p:.62"></i></div>
        <div class="bcard__row"><div><small>{T("bc_saved")}</small><b class="pos">4 464 000 ₸</b></div><div><small>{T("bc_left")}</small><b>2 736 000 ₸</b></div><div><small>{T("bc_next")}</small><b>{T("bc_next_v")}</b></div></div>
        <div class="bcard__steps"><span class="is-done">{T("bc_steps")[0]}</span><span class="is-on">{T("bc_steps")[1]}</span><span>{T("bc_steps")[2]}</span></div>
      </div>
    </div>
    <div data-reveal="right">{eyebrow(p3)}<h2>{inline(p3['title'])}</h2><p class="lead" style="margin-top:18px">{inline(p3['paras'][0])}</p>{checks(p3['items'])}<a class="link" href="{R}features/buyout/">{T("more_buyout")} <svg><use href="#i-arrow"/></svg></a></div>
  </div>
</section>
<section class="section section--card" id="fines">
  <div class="wrap promo promo--rev">
    <div data-reveal="left">{eyebrow(p4)}<h2>{inline(p4['title'])}</h2><p class="lead" style="margin-top:18px">{inline(p4['paras'][0])}</p>{checks(p4['items'])}<a class="link" href="{R}features/fines/">{T("more_fines")} <svg><use href="#i-arrow"/></svg></a></div>
    <div class="promo__vis promo__vis--shot" data-reveal="scale"><img src="{R}assets/screens/fines.webp" width="1800" height="1125" alt="{T("fines_alt")}" loading="lazy"></div>
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
    out += f'<section class="section" id="integrations"><div class="wrap">{head(c2)}{ints(c2, R)}<p class="more" data-reveal><a class="link" href="{R}integrations/">{T("all_ints")} <svg><use href="#i-arrow"/></svg></a></p></div></section>\n'
    # steps
    st = S['steps'][0]
    out += f'<section class="section section--card" id="start"><div class="wrap">{head(st, center=True)}{steps(st, R)}</div></section>\n'
    # quotes
    q = S['quotes'][0]
    out += f'<section class="section" id="reviews"><div class="wrap">{head(q)}{quotes(q)}</div></section>\n'
    # text: цена
    pr_ = S['text'][1]
    out += f'<section class="section section--card" id="price"><div class="wrap price" data-reveal>{eyebrow(pr_)}<h2>{inline(pr_["title"])}</h2><p class="lead">{inline(pr_["paras"][0])}</p><a class="btn btn--lg btn--yellow" href="#demo">{T("price_btn")} <svg><use href="#i-arrow"/></svg></a></div></section>\n'
    # faq
    out += generic_section(S['faq'][0], R, False) + '\n'
    out += cta(S['cta'][0], R)
    desc = strip_md(hero['paras'][0])
    write(p['path'] + 'index.html', page(p, out, R, desc))

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
        body += phero(hero, crumbs_for(p, R), R, img=FEATURE_IMG.get(p['path']))
        desc = strip_md(' '.join(hero['paras']))[:300]
    else:
        desc = strip_md(p['title'])
    alt = True
    for s in secs:
        if s['type'] == 'hero': continue
        if s['type'] == 'cards' and p['path'] == '/integrations/':
            body += f'<section class="section{" section--card" if alt else ""}"><div class="wrap">{head(s)}{int_acc(s, R)}</div></section>'
        else:
            body += generic_section(s, R, alt)
        if s['type'] != 'cta': alt = not alt
    if p['path'] == '/features/' and not hero:
        # индекс возможностей: заголовок из первой секции
        first = secs[0]
        body = phero(dict(title='Всё, чем живёт таксопарк', eyebrow='Возможности', paras=first['paras']), crumbs_for(p, R), R, img=FEATURE_IMG.get('/features/')) + f'<section class="section section--card"><div class="wrap">{cards(first, R, 4)}</div></section>' + ''.join(generic_section(s, R, False) for s in secs[1:])
        desc = strip_md(' '.join(first['paras']))[:300]
    other = ''
    if p['path'].startswith('/features/') and p['path'] != '/features/':
        links = ''.join(f'<a class="chip" href="{href(pp, R)}"><svg><use href="#{i}"/></svg>{n}</a>' for pp, n, _, i in NAV_FEATURES if pp != p['path'])
        other = f'<section class="section section--card"><div class="wrap"><div class="sec-head"><div data-reveal><p class="eyebrow">Ещё</p><h2>Другие возможности Yume Fleet</h2></div></div><div class="chips" data-reveal>{links}</div></div></section>'
        body = body.replace('<section class="section section--yellow cta"', other + '<section class="section section--yellow cta"', 1)
    write(p['path'] + 'index.html', page(p, body, R, desc))

def contacts():
    p = (BY_PATH_KK if L == 'kk' else BY_PATH)['/kk/contacts/' if L == 'kk' else '/contacts/']; R = rel(p['path']); hero = p['sections'][0]
    body = f'''<section class="phero">
  <div class="hero__checks"></div>
  <div class="wrap">
    <nav class="crumbs" aria-label="{T("crumbs")}"><a href="{href('/kk/', R) if L == 'kk' else R}">{T("home")}</a><span>/</span><b>{T("contacts")}</b></nav>
    {eyebrow(hero)}
    <h1>{inline(hero['title'])}</h1>
    <p class="lead">{inline(hero['paras'][0])}</p>
  </div>
</section>
<section class="section" style="padding-top:0">
  <div class="wrap contacts">
    <div class="ccards" data-stagger>
      <a class="ccard ccard--wa" href="{WA}?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B4%D0%B5%D0%BC%D0%BE%20Yume%20Fleet" rel="noopener"><i><svg><use href="#i-wa"/></svg></i><div><small>{T("c_wa")}</small><b>{PHONE}</b><span>{T("c_wa_sub")}</span></div><svg class="ccard__arr"><use href="#i-arrow"/></svg></a>
      <a class="ccard" href="tel:+77779479990"><i><svg><use href="#i-phone"/></svg></i><div><small>{T("c_phone")}</small><b>{PHONE}</b><span>{T("c_phone_sub")}</span></div><svg class="ccard__arr"><use href="#i-arrow"/></svg></a>
      <a class="ccard" href="https://t.me/yumefleet" rel="noopener"><i><svg><use href="#i-inbox"/></svg></i><div><small>{T("c_tg")}</small><b>@yumefleet</b><span>{T("c_tg_sub")}</span></div><svg class="ccard__arr"><use href="#i-arrow"/></svg></a>
      <a class="ccard" href="mailto:sales@yume.cloud"><i><svg><use href="#i-doc"/></svg></i><div><small>{T("c_sales")}</small><b>sales@yume.cloud</b><span>{T("c_sales_sub")}</span></div><svg class="ccard__arr"><use href="#i-arrow"/></svg></a>
      <a class="ccard" href="mailto:support.cloud@yume.kz"><i><svg><use href="#i-shield"/></svg></i><div><small>{T("c_sup")}</small><b>support.cloud@yume.kz</b><span>{T("c_sup_sub")}</span></div><svg class="ccard__arr"><use href="#i-arrow"/></svg></a>
      <div class="ccard"><i><svg><use href="#i-pin"/></svg></i><div><small>{T("c_office")}</small><b>{T("c_city")}</b><span>{T("c_office_sub")}</span></div></div>
      <div class="ccard"><i><svg><use href="#i-user"/></svg></i><div><small>{T("c_login")}</small><b><a href="{LOGIN}" rel="noopener">app.yumefleet.kz</a></b><span>{T("c_login_sub")}</span></div></div>
    </div>
    <div class="contacts__form" data-reveal="right" id="demo">
      <h2 style="font-size:26px;margin-bottom:8px">{T("c_form_h")}</h2>
      <p class="lead" style="font-size:15px;margin-bottom:22px">{T("c_form_p")}</p>
      {form(R).replace(' data-reveal="right"', '')}
    </div>
  </div>
</section>'''
    write(p['path'] + 'index.html', page(p, body, R, strip_md(hero['paras'][0])))

# ------------------------------------------------------------------ служебные
def write(path, content):
    full = os.path.join(ROOT, path.lstrip('/'))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8').write(content)
    print('wrote', path)

def service():
    today = datetime.date.today().isoformat()
    paths = [p['path'] for p in PAGES] + [p['path'] for p in PAGES_KK]
    urls = ''.join(f'  <url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod><priority>{"1.0" if u == "/" else "0.8"}</priority></url>\n' for u in paths)
    write('/sitemap.xml', f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    write('/robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n')
    p404 = dict(path='/404.html', title=T("t404"))
    body = f'''<section class="phero" style="min-height:70vh;display:grid;align-items:center"><div class="hero__checks"></div><div class="wrap"><p class="eyebrow">404</p><h1>{T("h404")}</h1><p class="lead">{T("p404")}</p><div class="hero__ctas" style="justify-content:flex-start;opacity:1;animation:none;margin-top:28px"><a class="btn btn--lg btn--yellow" href="./">{T("to_home")} <svg><use href="#i-arrow"/></svg></a><a class="btn btn--lg btn--ghost" href="features/">{T("features")}</a></div></div></section>'''
    write('/404.html', page(p404, body, './', T("t404") + '.'))
    write('/.nojekyll', '')

home()
for p in PAGES:
    if p['path'] in ('/', '/contacts/'): continue
    inner(p)
contacts()
service()
L = 'kk'
home()
contacts()
