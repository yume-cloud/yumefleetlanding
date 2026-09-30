# yumefleet.com — лендинг Yume Fleet

Статический сайт продукта Yume Fleet (учёт таксопарков): HTML, CSS, JavaScript. Хостинг: GitHub Pages из ветки `main`. Все пути относительные, поэтому сайт работает и по адресу проекта на github.io, и на корне домена yumefleet.com.

## Структура

- `build.py` — генерирует весь сайт из `content/CONTENT.md` (русская версия) и `content/CONTENT.kk.md` (казахская). Тексты правятся в CONTENT.md, а не в HTML.
- `index.html` и разделы — результат сборки, коммитятся вместе с исходником:
  - `/features/` и 12 страниц возможностей: `rentals`, `buyout`, `shifts`, `vehicles`, `drivers`, `finance`, `fines`, `documents`, `investors`, `leads`, `analytics`, `settings`
  - `/integrations/` и 8 страниц интеграций: `/kaspi-pay/` плюс `egov`, `erap`, `debtors`, `blacklist`, `wazzup`, `wialon`, `ai` внутри `/integrations/`
  - `/perehod/` (для клиентов Yume Cloud), `/contacts/`
  - `/kk/` и `/kk/contacts/` — казахская версия
  - `sitemap.xml`, `robots.txt`, `404.html`
- `css/styles.css` — стили. Токены бренда: жёлтый `#F0B100`, текст `#0D0D0D`, фон `#FAFAFA`, шрифт Geist.
- `js/main.js` — анимации, вкладки, живая таблица долгов, форма.
- `assets/logo/` — знак «шашки» и плитка, `assets/screens/` — экраны продукта из репозитория yume-fleet, `assets/fonts/` — Geist локально.

## Локально

```bash
python3 build.py
python3 -m http.server 4173
```

После правки текстов в `content/CONTENT.md` запускайте `build.py` и коммитьте сгенерированные файлы.

## Форма заявки

Заявки уходят POST-запросом на серверную функцию, адрес задан в атрибуте `data-endpoint` у `<form class="form">` (сейчас `https://yume-cloud-zzydfr.vercel.app/api/lead/`, та же функция, что у yume.cloud — `api/lead.js`). Если запрос не прошёл, форма открывает WhatsApp с заполненным текстом заявки.

## Аналитика

Счётчики подключаются двумя константами в начале `build.py`:

- `GA_ID` — Google Analytics 4 для yumefleet.com, например `G-XXXXXXX`
- `FB_PIXEL` — Meta Pixel

Пока обе пустые, и скрипты аналитики в страницы не попадают. Счётчик нужен отдельный от yume.cloud, иначе данные двух продуктов смешаются. После заполнения — пересобрать сайт.

## Вход в систему

Адрес кабинета задан константой `LOGIN` в `build.py`. Сейчас там дев-стенд `https://dev.yumefleet.kz/login` — перед запуском заменить на боевой адрес.

## Домен

Settings → Pages → Custom domain: `yumefleet.com`. У регистратора: A-записи корня на 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 и CNAME `www` → `yume-cloud.github.io`.
