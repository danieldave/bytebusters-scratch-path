const { chromium } = require('playwright'); const C = require('../public/data/content.json');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
  await fetch('http://localhost:3111/api/admin', { method: 'POST', body: JSON.stringify({ pin: '1234', action: 'seed' }) });
  const id = 'MHS-24MH'; const P = C.projects.find(p => p.id === 'birthday-card');
  await pg.goto('http://localhost:3111/studio'); await pg.evaluate(i => localStorage.setItem('bb_id', i), id); await pg.goto('http://localhost:3111/studio#/p/birthday-card'); await pg.reload();
  await pg.waitForSelector('#ed', { timeout: 8000 });
  ok(await pg.locator('.pcard').count() === 0, 'on project page');
  await pg.fill('#ed', P.lab.solution); await pg.waitForFunction(() => /4\/4/.test(document.getElementById('mcount').textContent), null, { timeout: 15000 });
  ok(true, 'missions 4/4 in Studio editor');
  await pg.waitForTimeout(3500);
  const r = await (await fetch('http://localhost:3111/api/studio', { method: 'POST', body: JSON.stringify({ id, action: 'get' }) })).json();
  ok(r.p['birthday-card'] && r.p['birthday-card'].l[0] === 4, 'server lab progress ' + JSON.stringify(r.p['birthday-card']));
  ok(r.c['birthday-card'] && r.c['birthday-card'].code.includes('gold'), 'server has code');
  await pg.screenshot({ path: '/tmp/st_lab.png', fullPage: false });
  await pg.goto('http://localhost:3111/studio#/'); await pg.reload(); await pg.waitForSelector('.pcard');
  const txt = await pg.locator('.pcard', { hasText: 'Birthday Card' }).textContent(); ok(txt.includes('⭐⭐⭐'), '3 stars on card');
  // new device: clear local, code restored from server
  await pg.evaluate(() => { Object.keys(localStorage).filter(k => k !== 'bb_id').forEach(k => localStorage.removeItem(k)); });
  await pg.goto('http://localhost:3111/studio#/p/birthday-card'); await pg.reload(); await pg.waitForSelector('#ed'); await pg.waitForTimeout(1500);
  ok((await pg.inputValue('#ed')).includes('gold'), 'code restored on new phone');
  console.log(errs); await b.close();
})();
