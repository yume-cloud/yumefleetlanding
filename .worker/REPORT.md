# Отчёт: UTM-метки в заявке с сайта

## Итог
Все требования ТЗ успешно реализованы в полном объёме:
1. В `payload` отправки формы добавлены поля `utm` (объект с метками `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) и `referrer` (`document.referrer` первого захода).
2. При первом заходе на сайт метки из URL сохраняются в `sessionStorage` под ключом `'yf_utm'`. В `payload` берутся из URL, а при их отсутствии в URL — из `sessionStorage`.
3. Реферер первого захода сохраняется в `sessionStorage` под ключом `'yf_ref'` и не перезаписывается внутренними переходами между страницами сайта.
4. Валидация, пользовательские тексты и резервный маршрут через WhatsApp сохранены без изменений.
5. Проект пересобран через `python3 build.py`, обновлены хеши версий скрипта (`?v=694a0be6`) во всех сгенерированных HTML-страницах.
6. Выполнена автоматическая верификация через `node -e` скрипт: проверен первый переход с `?utm_source=ig&utm_campaign=test` и последующий переход без меток (чтение из `sessionStorage`).

---

## Сделано

1. **Хранение и извлечение UTM-меток**:
   - [js/main.js:31](file:///Users/sungat01/yumefleetlanding-wt/lead-utm/js/main.js#L31):
     ```javascript
     const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
     ```
   - [js/main.js:32-48](file:///Users/sungat01/yumefleetlanding-wt/lead-utm/js/main.js#L32-L48):
     ```javascript
     const getUtm = () => {
       let utm = {};
       try {
         const q = new URLSearchParams(location.search);
         const urlUtm = {};
         UTM_KEYS.forEach(k => { const v = q.get(k); if (v) urlUtm[k] = v; });
         if (Object.keys(urlUtm).length) {
           utm = urlUtm;
           sessionStorage.setItem('yf_utm', JSON.stringify(urlUtm));
         } else {
           const saved = sessionStorage.getItem('yf_utm');
           if (saved) utm = JSON.parse(saved);
         }
       } catch (e) {}
       Object.defineProperty(utm, 'toString', { value: function() { return JSON.stringify(this); }, enumerable: false });
       return utm;
     };
     ```

2. **Сохранение и извлечение реферера первого захода (`yf_ref`)**:
   - [js/main.js:50-59](file:///Users/sungat01/yumefleetlanding-wt/lead-utm/js/main.js#L50-L59):
     ```javascript
     const getRef = () => {
       try {
         if (sessionStorage.getItem('yf_ref') === null) {
           sessionStorage.setItem('yf_ref', document.referrer || '');
         }
         return sessionStorage.getItem('yf_ref') ?? document.referrer ?? '';
       } catch (e) {
         return document.referrer || '';
       }
     };
     ```

3. **Инициализация сохранения меток и реферера при первой загрузке любой страницы**:
   - [js/main.js:61-67](file:///Users/sungat01/yumefleetlanding-wt/lead-utm/js/main.js#L61-L67):
     ```javascript
     try {
       const q0 = new URLSearchParams(location.search);
       const u0 = {};
       UTM_KEYS.forEach(k => { const v = q0.get(k); if (v) u0[k] = v; });
       if (Object.keys(u0).length) sessionStorage.setItem('yf_utm', JSON.stringify(u0));
       if (sessionStorage.getItem('yf_ref') === null) sessionStorage.setItem('yf_ref', document.referrer || '');
     } catch (e) {}
     ```

4. **Добавление `utm` и `referrer` в `payload` формы заявки**:
   - [js/main.js:1434](file:///Users/sungat01/yumefleetlanding-wt/lead-utm/js/main.js#L1434):
     ```javascript
     const payload = { name: name.value.trim(), phone: phone.value.trim(), segment: [cars?.value, city?.value.trim()].filter(Boolean).join(' · '), page: location.pathname, source: 'yumefleet.com', website: $('input[name=website]', form)?.value || '', utm: getUtm(), referrer: getRef() };
     ```

5. **Пересборка статики сайта**:
   - Запущен `python3 build.py`, обновлён хеш версии скрипта `?v=694a0be6` во всех страницах:
   - [index.html:433](file:///Users/sungat01/yumefleetlanding-wt/lead-utm/index.html#L433):
     ```html
     <script src="./js/main.js?v=694a0be6" defer></script>
     ```

---

## Доказательства (команда и вывод)

### Команда проверки:
```bash
node -e "$(cat scripts/test_lead_utm.js)"
```

### Вывод проверки:
```
=== ЭТАП 1: Первый заход на сайт с UTM (?utm_source=ig&utm_campaign=test) ===
Состояние sessionStorage сразу после загрузки страницы:
  sessionStorage.getItem("yf_utm"): {"utm_source":"ig","utm_campaign":"test"}
  sessionStorage.getItem("yf_ref"): https://instagram.com/

Перехвачен вызов fetch к LEAD_ENDPOINT:
  URL: https://yumefleet.com/api/lead/
  Method: POST
  Тело запроса (URLSearchParams): {
  name: 'Тестовый Клиент',
  phone: '+7 705 123 45 67',
  segment: '10–30 машин · Алматы',
  page: '/',
  source: 'yumefleet.com',
  website: '',
  utm: '{"utm_source":"ig","utm_campaign":"test"}',
  referrer: 'https://instagram.com/'
}
  Тело запроса utm (объект): { utm_source: 'ig', utm_campaign: 'test' }
  Тело запроса referrer: https://instagram.com/

=== ЭТАП 2: Второй переход без UTM в адресе (страница /contacts/) ===
Состояние sessionStorage перед отправкой:
  sessionStorage.getItem("yf_utm"): {"utm_source":"ig","utm_campaign":"test"}
  sessionStorage.getItem("yf_ref"): https://instagram.com/

Перехвачен вызов fetch к LEAD_ENDPOINT на второй странице:
  URL: https://yumefleet.com/api/lead/
  Method: POST
  Тело запроса (URLSearchParams): {
  name: 'Тестовый Клиент',
  phone: '+7 705 123 45 67',
  segment: '10–30 машин · Алматы',
  page: '/contacts/',
  source: 'yumefleet.com',
  website: '',
  utm: '{"utm_source":"ig","utm_campaign":"test"}',
  referrer: 'https://instagram.com/'
}
  Тело запроса utm (взяты из sessionStorage): { utm_source: 'ig', utm_campaign: 'test' }
  Тело запроса referrer (первый заход из sessionStorage): https://instagram.com/
```

---

## Не сделано
Нет (всё запланированное по ТЗ реализовано в полном объёме).
