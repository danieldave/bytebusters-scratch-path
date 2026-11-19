const { chromium, devices } = require('playwright');
const B = 'http://localhost:3111', F = __dirname + '/../public/files/';
const J = (u, b) => fetch(B + u, { method: 'POST', body: JSON.stringify(b) }).then((r) => r.json());
(async () => {
  await J('/api/admin', { pin: '1234', action: 'seed' });
  const seed = require('../data/roster.seed.json').filter((r) => r.school === 'UHS');
  const id = seed[0].id;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ ...devices['Pixel 5'], serviceWorkers: 'allow' }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(B + '/'); await p.fill('#id', id); await p.click('#go'); await p.waitForSelector('.week');
  // term tabs
  await p.click('.tabs button >> nth=1'); console.log('term2 shown:', (await p.textContent('.card h2')).trim()); await p.click('.tabs button >> nth=0');
  // checker, week 3 (MM step2 -> step3)
  await p.goto(B + '/#w3'); await p.waitForSelector('#chk', { state: 'attached' });
  await p.setInputFiles('#chk', F + 'middleman-maze-step2-flag-hides.sb3'); await p.waitForSelector('#chkout h3');
  console.log('W3 with step2 file:', await p.textContent('#chkout h3'));
  await p.setInputFiles('#chk', F + 'middleman-maze-step3-title-play.sb3'); await p.waitForFunction(() => /6 of 6/.test(document.querySelector('#chkout h3')?.textContent || ''));
  console.log('W3 with step3 file:', await p.textContent('#chkout h3'), '|', (await p.locator('#chkout .add').textContent()).trim());
  await p.setInputFiles('#chk', F + 'middleman-maze-step1-starter.sb3'); await p.waitForTimeout(700);
  console.log('W3 with starter (hint list):', (await p.textContent('#chkout')).replace(/\s+/g, ' ').slice(0, 160));
  // wk5 full game -> blue/red/green
  await p.goto(B + '/#w5'); await p.waitForSelector('#chk', { state: 'attached' });
  await p.setInputFiles('#chk', F + 'middleman-maze-step5-finished.sb3'); await p.waitForTimeout(900);
  await p.goto(B + '/#'); await p.waitForSelector('.badge');
  console.log('badges on:', await p.locator('.badge.on').count());
  // player inside lesson
  await p.goto(B + '/#w4'); await p.click('#playbtn'); const fr = p.frameLocator('#playbox iframe'); await fr.locator('#f').waitFor({ timeout: 60000 });
  await p.waitForTimeout(4000); console.log('player msg:', await fr.locator('#m').textContent());
  // offline
  await p.goto(B + '/'); await p.waitForTimeout(1500); await ctx.setOffline(true);
  await p.goto(B + '/#w2'); await p.waitForSelector('#done', { timeout: 10000 }); console.log('offline lesson loaded:', await p.textContent('h1'));
  await p.click('#done'); await p.waitForTimeout(600);
  console.log('queued:', await p.evaluate(() => localStorage.getItem('bb_q')).then((s) => (JSON.parse(s) || []).length));
  await ctx.setOffline(false); await p.evaluate(() => window.dispatchEvent(new Event('online'))); await p.waitForTimeout(1200);
  const lg = await J('/api/login', { id }); console.log('server has w2 done after sync:', lg.progress.w2 && lg.progress.w2.done, '| badges:', lg.badges);
  // parent
  const pg = await ctx.newPage(); await pg.goto(B + '/parent?t=' + lg.share); await pg.waitForSelector('.card'); console.log('parent:', (await pg.textContent('h1')), '|', (await pg.textContent('.card')).replace(/\s+/g, ' ').slice(0, 60));
  console.log('parent bad token:', (await (await fetch(B + '/api/parent?t=zzz')).json()).error);
  // certificate
  for (let w = 1; w <= 10; w++) await J('/api/progress', { id, week: w, done: true });
  await p.goto(B + '/'); await p.reload(); await p.waitForSelector('a.btn[href="#cert"]'); await p.click('a.btn[href="#cert"]'); await p.waitForSelector('.cert.big');
  console.log('cert name:', await p.textContent('.cert .nm')); await p.screenshot({ path: '/tmp/cert.png', fullPage: true });
  // admin dashboard
  const ad = await ctx.newPage(); ad.on('pageerror', (e) => errs.push('admin ' + e.message)); await ad.goto(B + '/admin'); await ad.fill('#pin', '1234'); await ad.click('#in'); await ad.waitForSelector('#sum table');
  console.log('dash:', (await ad.textContent('#sum')).replace(/\s+/g, ' ').slice(0, 220)); await ad.screenshot({ path: '/tmp/admin.png', fullPage: true });
  console.log('errors:', errs); await b.close();
})();
