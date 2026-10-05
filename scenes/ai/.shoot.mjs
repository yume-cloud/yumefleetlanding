import { chromium } from '/private/tmp/edits0110-pw/node_modules/playwright-core/index.mjs';
const out = '/tmp/yf/landing/scenes/ai/';
const url = 'file:///tmp/yf/landing/scenes/ai/preview.html';
const b = await chromium.launch({ headless: true, executablePath: '/Users/sungat01/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
const check = async (p) => p.evaluate(() => {
  const r = document.querySelector('[data-aiplay]');
  const card = r.querySelector('.aiplay__card').getBoundingClientRect();
  const over = [...r.querySelectorAll('.aiplay__card *')].filter(e => { const x = e.getBoundingClientRect(); return x.width && (x.right > card.right + 1 || x.left < card.left - 1); }).map(e => e.className.baseVal ?? e.className);
  const clipped = [...r.querySelectorAll('.aiplay__steps span,.aiplay__num,.aiplay__input')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim());
  const cur = r.querySelector('.aiplay__cur').getBoundingClientRect(), btn = r.querySelector('[data-aiplay-btn]').getBoundingClientRect(), bb = r.querySelector('[data-aiplay-btn-b]').getBoundingClientRect();
  const curOp = getComputedStyle(r.querySelector('.aiplay__cur')).opacity;
  return { step: r.dataset.step, text: r.querySelector('[data-aiplay-text]').textContent, days: r.querySelector('[data-aiplay-days]').textContent, sum: r.querySelector('[data-aiplay-sum]').textContent,
    hscroll: document.documentElement.scrollWidth > innerWidth, over, clipped, curOp, curTip: [Math.round(cur.left), Math.round(cur.top)], btnRight18: Math.round(btn.right - 18), captionRight: Math.round(bb.right), captionY: [Math.round(bb.top), Math.round(bb.bottom)], cardH: Math.round(card.height) };
});
let p = await b.newPage({ viewport: { width: 1200, height: 820 } });
await p.goto(url);
await p.waitForTimeout(1500); console.log('type', JSON.stringify(await check(p))); await p.screenshot({ path: out + 'shot-1-type.png' });
await p.waitForTimeout(1300); console.log('aim', JSON.stringify(await check(p))); await p.screenshot({ path: out + 'shot-2-aim.png' });
await p.waitForTimeout(1400); console.log('think', JSON.stringify(await check(p))); await p.screenshot({ path: out + 'shot-3-think.png' });
await p.waitForTimeout(2200); console.log('hold', JSON.stringify(await check(p))); await p.screenshot({ path: out + 'shot-4-hold.png' });
await p.close();
p = await b.newPage({ viewport: { width: 800, height: 900 }, reducedMotion: 'reduce' });
await p.goto(url); await p.waitForTimeout(400); console.log('rm800', JSON.stringify(await check(p))); await p.screenshot({ path: out + 'shot-5-rm800.png', fullPage: true });
await b.close();
