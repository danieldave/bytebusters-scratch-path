const { chromium } = require('playwright'); const C = require('../public/data/content.json');
(async () => {
  const b = await chromium.launch(); const ids = C.projects.filter(p => p.lab).map(p => p.id); const jobs = [];
  ids.forEach(id => ['starter', 'solution'].forEach(m => jobs.push({ id, m }))); const bad = []; let i = 0;
  async function worker() { const p = await (await b.newContext()).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    while (i < jobs.length) { const j = jobs[i++]; errs.length = 0; await p.goto(`http://localhost:3111/_wctest.html?id=${j.id}&mode=${j.m}`); let r;
      try { await p.waitForFunction(() => window.__done, null, { timeout: 20000 }); r = await p.evaluate(() => window.__res); } catch (e) { r = { err: 'timeout' }; }
      console.log(j.id.padEnd(26), j.m.padEnd(9), JSON.stringify(r));
      if (j.m === 'solution' && !(r && r.total && r.passed === r.total)) bad.push(j.id + ' solution ' + JSON.stringify(r) + errs);
      if (j.m === 'starter' && r && r.total && r.passed === r.total) bad.push(j.id + ' starter passes'); } }
  await Promise.all([worker(), worker(), worker()]); console.log('PROBLEMS', bad); await b.close(); })();
