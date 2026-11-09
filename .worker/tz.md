# ТЗ: UTM-метки в заявке с сайта (Antigravity, спринт 1 офиса)

Репозиторий сайта Yume Fleet, дерево /Users/sungat01/yumefleetlanding-wt/lead-utm, ветка feat/lead-utm-1109. Перед коммитом `pwd && git branch --show-current`. Уложись в 30 минут, ответь таблицей даже при неполном результате. Не пушить, не мержить.

Сейчас форма (js/main.js около строки 1370, `const payload = {...}`) шлёт name, phone, segment, page, source, website. Нужно добавить в payload:
- utm: объект с utm_source, utm_medium, utm_campaign, utm_content, utm_term из адреса страницы;
- метки должны пережить переход по страницам сайта: при первом заходе с utm_* в адресе сохранить их в sessionStorage (ключ 'yf_utm'), в payload брать из адреса, иначе из sessionStorage;
- referrer: document.referrer (первый заход, тоже в sessionStorage, ключ 'yf_ref').
Ничего больше не менять: валидация, тексты, запасной путь через WhatsApp остаются как есть.
Если js/main.js собирается из build.py или копируется в страницы — найди источник и правь его, затем пересобери так, как описано в README.md.

Проверка (вывод в отчёт): `node -e` скрипт или открыть страницу локально (python3 -m http.server) с `?utm_source=ig&utm_campaign=test`, перехватить fetch и показать тело запроса с utm; второй переход без utm — метки взяты из sessionStorage.
Отчёт: .worker/REPORT.md — Итог / Сделано / Доказательства (команда и вывод) / Не сделано; рядом с каждым файл:строка цитата строки. Коммит в свою ветку.
