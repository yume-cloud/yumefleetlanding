import { chromium } from '/Users/sungat01/.nvm/versions/node/v24.15.0/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs';
const url = 'file:///tmp/yf/landing/scenes/perehod/preview.html';
const b = await chromium.launch({ executablePath: '/Users/sungat01/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const ctx = await b.newContext({ viewport: { width: 1200, height: 820 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(url); await p.waitForTimeout(900);
await p.screenshot({ path: 'shot-0-in.png' });
await p.waitForTimeout(1500);
await p.screenshot({ path: 'shot-1-busy.png' });
await p.waitForFunction(() => document.querySelector('[data-moveplay]').dataset.step === 'hold', null, { timeout: 8000 });
await p.waitForTimeout(600);
await p.screenshot({ path: 'shot-2-hold.png' });
const m = await p.evaluate(() => {
  const r = document.querySelector('[data-moveplay]').getBoundingClientRect();
  const rows = [...document.querySelectorAll('.moveplay__row')].map(e => { const q = e.getBoundingClientRect(); return { h: q.height, w: q.width }; });
  return { card: { x: r.x, w: r.width, h: r.height, bottom: r.bottom }, rows, docW: document.documentElement.scrollWidth, count: document.querySelector('[data-moveplay-count]').textContent, p: getComputedStyle(document.querySelector('[data-moveplay-bar]')).width };
});
console.log(JSON.stringify(m));
// reduced motion + narrow
const ctx2 = await b.newContext({ viewport: { width: 800, height: 900 }, reducedMotion: 'reduce' });
const p2 = await ctx2.newPage(); await p2.goto(url); await p2.waitForTimeout(400);
console.log(await p2.evaluate(() => ({ step: document.querySelector('[data-moveplay]').dataset.step, count: document.querySelector('[data-moveplay-count]').textContent, done: document.querySelectorAll('.is-done').length })));
await b.close();
