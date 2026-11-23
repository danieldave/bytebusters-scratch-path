const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
  const roster = JSON.parse(fs.readFileSync('data/roster.seed.json')); const id = (roster.ids || roster)[0].id || (roster.ids || roster)[0];
  await pg.goto('http://localhost:3111/studio'); await pg.waitForSelector('.pcard');
  ok(await pg.locator('.pcard').count() === 28, '28 project cards');
  await pg.click('button[data-k=show]'); ok(await pg.locator('.pcard').count() === 15, '15 showcase projects');
  await pg.click('button[data-k=show]');
  await pg.screenshot({ path: '/tmp/st_home.png' });
  await pg.click('a[href="#/p/honest-scale"]'); await pg.waitForSelector('.step');
  await pg.locator('#steps .step').nth(0).click(); await pg.locator('#steps .step').nth(1).click();
  ok((await pg.textContent('#ps')).includes('⭐'), 'star after steps');
  // sb3 check using real project
  const dir = '/tmp/sb/Real_vs_Fake'; 
  await pg.goto('http://localhost:3111/studio#/p/real-vs-fake'); await pg.waitForSelector('#sb3');
  await pg.setInputFiles('#sb3', '/mnt/user-data/outputs/Scratch_Path/Real vs Fake FINAL.sb3'); await pg.waitForSelector('#chk li', { timeout: 8000 });
  const t = await pg.textContent('#chk'); ok(/4 of 4 found/.test(t), 'sb3 checker 4/4: ' + t.slice(-60));
  await pg.screenshot({ path: '/tmp/st_proj.png', fullPage: true });
  // puzzles
  await pg.goto('http://localhost:3111/studio#/puzzles/scratch'); await pg.waitForSelector('.zbox');
  let seen = new Set();
  for (let i = 0; i < 5; i++) {
    const typ = await pg.evaluate(() => document.querySelector('.zbox .opt') ? 'opt' : document.querySelector('#rows .zrow') ? (document.querySelector('#ans') ? 'order' : 'fix') : '?'); seen.add(typ);
    if (typ === 'opt') await pg.locator('.opt').first().click();
    else if (typ === 'fix') await pg.locator('.zrow').first().click();
    else { for (let k = 0; k < 8 && await pg.locator('#rows .zrow').count(); k++) await pg.locator('#rows .zrow').first().click(); }
    await pg.waitForSelector('#nx'); if (i === 0) await pg.screenshot({ path: '/tmp/st_puz.png' });
    await pg.click('#nx');
  }
  ok((await pg.textContent('#pz')).includes('You got'), 'puzzle session finished, types: ' + [...seen]);
  // svg rendered?
  await pg.goto('http://localhost:3111/studio#/puzzles/daily'); await pg.waitForTimeout(1500);
  // find a read puzzle forcibly
  await pg.evaluate(() => { location.hash = '#/puzzles/scratch'; });
  // login and persistence
  await pg.goto('http://localhost:3111/studio#/me'); await pg.waitForSelector('#idin'); await pg.fill('#idin', id); await pg.click('#inb'); await pg.waitForSelector('#out', { timeout: 5000 });
  ok(true, 'signed in with ' + id);
  await pg.goto('http://localhost:3111/studio#/p/honest-scale'); await pg.waitForSelector('.step'); await pg.locator('#steps .step').nth(2).click();
  const r = await (await fetch('http://localhost:3111/api/studio', { method: 'POST', body: JSON.stringify({ id, action: 'get' }) })).json();
  ok(r.p['honest-scale'] && r.p['honest-scale'].s.length >= 1, 'server has progress ' + JSON.stringify(r.p['honest-scale']));
  ok(Object.keys(r.p).includes('real-vs-fake'), 'guest progress pushed up');
  console.log('errors:', errs); await b.close();
})();
