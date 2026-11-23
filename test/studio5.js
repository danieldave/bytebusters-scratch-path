const { chromium } = require('playwright'); const C = require('../public/data/content.json');
(async () => {
  const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m); const id = 'MHS-24MH';
  await fetch('http://localhost:3111/api/admin', { method: 'POST', body: JSON.stringify({ pin: '1234', action: 'seed' }) });
  const P = C.projects.find(p => p.id === 'ask-like-a-pro');
  await pg.goto('http://localhost:3111/studio'); await pg.evaluate(i => localStorage.setItem('bb_id', i), id);
  await pg.goto('http://localhost:3111/studio#/p/ask-like-a-pro'); await pg.reload(); await pg.waitForSelector('#pl-t');
  await pg.fill('#pl-t', 'Tell me about rain.'); await pg.click('#pl-send'); await pg.waitForSelector('.pl-bub');
  const lazy = await pg.textContent('.pl-bub'); ok(/precipitation/i.test(lazy) || lazy.length > 10, 'lazy reply shown');
  await pg.screenshot({ path: '/tmp/ai1.png' });
  await pg.fill('#pl-t', P.ai.best); await pg.click('#pl-send'); await pg.waitForTimeout(300);
  ok((await pg.textContent('#pl-out')).includes('Brilliant'), 'brilliant on best prompt');
  ok(await pg.locator('.pl-list li.ok').count() === 4, '4 ticks');
  await pg.fill('#pl-t', 'my phone is 08012345678, explain rain'); await pg.click('#pl-send'); ok((await pg.textContent('#pl-out')).includes('Stop!'), 'privacy block');
  await pg.fill('#pl-t', P.ai.best); await pg.click('#pl-send'); await pg.waitForTimeout(1200);
  const r = await (await fetch('http://localhost:3111/api/studio', { method: 'POST', body: JSON.stringify({ id, action: 'get' }) })).json();
  ok(r.p['ask-like-a-pro'] && r.p['ask-like-a-pro'].l[0] === 4, 'server progress ' + JSON.stringify(r.p['ask-like-a-pro'].l)); ok(r.c['ask-like-a-pro'].code.includes('10-year-old'), 'prompt saved');
  await pg.screenshot({ path: '/tmp/ai2.png', fullPage: true });
  // spot puzzle renders plain
  await pg.goto('http://localhost:3111/studio#/puzzles/ai'); await pg.reload(); await pg.waitForSelector('.zbox');
  let sawSpot = false; for (let i = 0; i < 5; i++) { const typ = await pg.evaluate(() => document.querySelector('.zbox .opt') ? 'q' : 'f'); if (typ === 'f') { sawSpot = true; ok(await pg.locator('.zrow span').count() > 0, 'spot rows plain text'); await pg.locator('.zrow').nth(2).click(); } else await pg.locator('.opt').first().click(); await pg.waitForSelector('#nx'); await pg.click('#nx'); }
  ok(sawSpot, 'saw spot puzzle'); console.log(errs); await b.close();
})();
