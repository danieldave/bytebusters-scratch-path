const { chromium } = require('playwright');
(async () => {
  await fetch('http://localhost:3111/api/admin', { method: 'POST', body: JSON.stringify({ pin: '1234', action: 'seed' }) });
  const id = (await (await fetch('http://localhost:3111/api/admin', { method: 'POST', body: JSON.stringify({ pin: '1234', action: 'list' }) })).json()).roster[0].id;
  await fetch('http://localhost:3111/api/studio', { method: 'POST', body: JSON.stringify({ id, action: 'set', pid: 'honest-scale', s: [0, 1], m: [] }) });
  await fetch('http://localhost:3111/api/studio', { method: 'POST', body: JSON.stringify({ id, action: 'z', zid: 'z001', ok: 1 }) });
  const b = await chromium.launch(); const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:3111/admin'); await pg.fill('#pin', '1234'); await pg.click('#in'); await pg.waitForSelector('#tb tr td');
  await pg.waitForFunction(() => /proj/.test(document.getElementById('tb').textContent), null, { timeout: 15000 });
  const row = await pg.locator('#tb tr', { hasText: id }).textContent(); console.log(row); console.log(errs); await b.close();
})();
