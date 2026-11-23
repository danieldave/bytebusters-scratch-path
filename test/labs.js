const { chromium } = require('playwright');
const B = 'http://localhost:3111';
(async () => {
  const b = await chromium.launch(); const jobs = [];
  for (const term of ['t2']) for (let w = 5; w <= 6; w++) for (const s of ['MHS', 'UHS', 'YWS']) for (const mode of ['starter', 'solution']) jobs.push({ term, w, s, mode });
  const bad = []; let i = 0, done = 0;
  async function worker() {
    const ctx = await b.newContext(); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    while (i < jobs.length) {
      const j = jobs[i++]; errs.length = 0;
      await p.goto(`${B}/_labtest.html?term=${j.term}&w=${j.w}&s=${j.s}&mode=${j.mode}`);
      let r = null;
      try { await p.waitForFunction(() => window.__done, null, { timeout: 15000 }); r = await p.evaluate(() => window.__res); } catch (e) { r = { err: 'timeout' }; }
      const name = `${j.term} w${j.w} ${j.s} ${j.mode}`;
      if (j.mode === 'solution' && !(r && r.total && r.passed === r.total)) bad.push(name + ' => ' + JSON.stringify(r) + ' ' + errs.join('|'));
      if (j.mode === 'starter' && r && r.total && r.passed === r.total) bad.push(name + ' STARTER ALREADY PASSES');
      done++;
    }
    await ctx.close();
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  console.log('ran', done, 'jobs; problems:', bad.length); bad.forEach((x) => console.log(' ', x));
  await b.close();
})();
