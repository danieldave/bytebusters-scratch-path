const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
  await pg.goto('http://localhost:3111/studio#/words'); await pg.waitForSelector('.wd');
  ok(await pg.locator('.wd').count() === 196, '196 words listed');
  await pg.fill('#wq', 'loop'); ok(await pg.locator('.wd').count() >= 3, 'search loop: ' + await pg.locator('.wd').count());
  ok((await pg.locator('.wd b').first().textContent()).toLowerCase().includes('loop'), 'best match first');
  await pg.fill('#wq', ''); await pg.click('.fchip[data-t=safety]'); ok(await pg.locator('.wd').count() === 18, 'safety filter ' + await pg.locator('.wd').count());
  await pg.screenshot({ path: '/tmp/words.png' });
  await pg.goto('http://localhost:3111/studio'); await pg.waitForSelector('.pcard'); ok((await pg.textContent('#app')).includes('Word of the day'), 'word of the day on home');
  await pg.goto('http://localhost:3111/studio-admin'); await pg.fill('#pin', '1234'); await pg.click('#go'); await pg.waitForSelector('#tw'); await pg.click('#tw'); await pg.waitForSelector('.item');
  await pg.click('#new'); await pg.fill('#f_w', 'Jollof'); await pg.fill('#f_d', 'A tasty rice dish.'); await pg.click('#save'); await pg.waitForSelector('.item');
  const c = await (await fetch('http://localhost:3111/api/content')).json(); ok(c.words.find(w => w.w === 'Jollof') && c.words.length === 197, 'new word served');
  console.log(errs); await b.close();
})();
