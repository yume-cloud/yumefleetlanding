const fs = require('fs');
const vm = require('vm');

function createEnv(url, referrer, storage = {}) {
  const parsedUrl = new URL(url);

  const inputs = {
    '#name': { value: 'Тестовый Клиент', trim() { return this.value.trim(); }, focus() {}, classList: { add() {}, remove() {} }, addEventListener() {} },
    '#phone': { value: '+7 705 123 45 67', trim() { return this.value.trim(); }, focus() {}, classList: { add() {}, remove() {} }, addEventListener() {} },
    '#cars': { value: '10–30 машин' },
    '#city': { value: 'Алматы', trim() { return this.value.trim(); } },
    'input[name=website]': { value: '' },
    'button[type=submit]': { textContent: 'Отправить', disabled: false }
  };

  const form = {
    dataset: { endpoint: 'https://yumefleet.com/api/lead/', done: './spasibo/' },
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: (evt, handler) => { form._submitHandler = handler; },
    dispatchEvent: (evt) => { if (evt.type === 'submit' && form._submitHandler) form._submitHandler(evt); },
    querySelector: (sel) => {
      if (sel === 'button[type=submit]') return inputs['button[type=submit]'];
      if (inputs[sel]) return inputs[sel];
      return null;
    },
    querySelectorAll: () => []
  };

  const sessionStorageMock = {
    _data: storage,
    getItem(k) { return this._data[k] !== undefined ? this._data[k] : null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  };

  const localStorageMock = {
    _data: {},
    getItem(k) { return this._data[k] !== undefined ? this._data[k] : null; },
    setItem(k, v) { this._data[k] = String(v); }
  };

  let interceptedFetch = null;

  const sandbox = {
    window: {},
    document: {
      documentElement: { lang: 'ru' },
      referrer: referrer,
      querySelector: (sel) => {
        if (sel === '.form') return form;
        if (sel === '.nav') return { classList: { toggle() {} } };
        if (inputs[sel]) return inputs[sel];
        return null;
      },
      querySelectorAll: (sel) => {
        if (sel === '.form input') return [inputs['#name'], inputs['#phone']];
        return [];
      },
      addEventListener: () => {}
    },
    location: {
      search: parsedUrl.search,
      pathname: parsedUrl.pathname,
      hostname: parsedUrl.hostname,
      assign: () => {}
    },
    sessionStorage: sessionStorageMock,
    crypto,
    localStorage: localStorageMock,
    matchMedia: () => ({ matches: false }),
    addEventListener: () => {},
    fetch: async (endpoint, opts) => {
      interceptedFetch = { endpoint, opts };
      return { ok: true, json: async () => ({ ok: true }) };
    },
    URLSearchParams: URLSearchParams,
    URL: URL,
    console: console,
    scrollY: 0,
    scrollTo: () => {},
    setTimeout: (fn) => setTimeout(fn, 0),
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    requestAnimationFrame: (fn) => setTimeout(fn, 0)
  };
  sandbox.window = sandbox;

  const code = fs.readFileSync('js/main.js', 'utf8');
  vm.runInNewContext(code, sandbox);

  return { sandbox, form, inputs, getIntercepted: () => interceptedFetch };
}

// 1. Первый заход: с UTM в URL (?utm_source=ig&utm_campaign=test) и внешним referrer
console.log('=== ЭТАП 1: Первый заход на сайт с UTM (?utm_source=ig&utm_campaign=test) ===');
const sharedSessionStorage = {};
const session1 = createEnv('https://yumefleet.com/?utm_source=ig&utm_campaign=test', 'https://instagram.com/', sharedSessionStorage);

console.log('Состояние sessionStorage сразу после загрузки страницы:');
console.log('  sessionStorage.getItem("yf_utm"):', sharedSessionStorage['yf_utm']);
console.log('  sessionStorage.getItem("yf_ref"):', sharedSessionStorage['yf_ref']);

session1.form.dispatchEvent({ type: 'submit', preventDefault() {} });
const call1 = session1.getIntercepted();

console.log('\nПерехвачен вызов fetch к LEAD_ENDPOINT:');
console.log('  URL:', call1.endpoint);
console.log('  Method:', call1.opts.method);
console.log('  Тело запроса (URLSearchParams):', Object.fromEntries(call1.opts.body));
console.log('  Тело запроса utm_source / utm_campaign:', call1.opts.body.get('utm_source'), call1.opts.body.get('utm_campaign'));
if (call1.opts.body.get('utm_source') !== 'ig' || call1.opts.body.get('utm_campaign') !== 'test' || call1.opts.body.has('utm')) { console.error('FAIL: utm не плоскими полями'); process.exit(1); }
console.log('  Тело запроса referrer:', call1.opts.body.get('referrer'));

// 2. Второй переход: без UTM в URL (внутренний переход на страницу /contacts/)
console.log('\n=== ЭТАП 2: Второй переход без UTM в адресе (страница /contacts/) ===');
const session2 = createEnv('https://yumefleet.com/contacts/', 'https://yumefleet.com/?utm_source=ig&utm_campaign=test', sharedSessionStorage);

console.log('Состояние sessionStorage перед отправкой:');
console.log('  sessionStorage.getItem("yf_utm"):', sharedSessionStorage['yf_utm']);
console.log('  sessionStorage.getItem("yf_ref"):', sharedSessionStorage['yf_ref']);

session2.form.dispatchEvent({ type: 'submit', preventDefault() {} });
const call2 = session2.getIntercepted();

console.log('\nПерехвачен вызов fetch к LEAD_ENDPOINT на второй странице:');
console.log('  URL:', call2.endpoint);
console.log('  Method:', call2.opts.method);
console.log('  Тело запроса (URLSearchParams):', Object.fromEntries(call2.opts.body));
console.log('  Тело запроса utm_source (взят из sessionStorage):', call2.opts.body.get('utm_source'));
if (call2.opts.body.get('utm_source') !== 'ig') { console.error('FAIL: utm из sessionStorage потерян'); process.exit(1); }
console.log('  Тело запроса referrer (первый заход из sessionStorage):', call2.opts.body.get('referrer'));
