const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 420, height: 900 } })).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
  await pg.goto('http://localhost:3111/studio-admin'); await pg.fill('#pin', '1234'); await pg.click('#go'); await pg.waitForSelector('.item');
  ok(await pg.locator('.item').count() === 28, '28 projects listed');
  await pg.click('#new'); await pg.fill('#f_id', 'my-test-game'); await pg.fill('#f_title', 'Test Game'); await pg.fill('#f_hook', 'Hello');
  await pg.fill('#f_steps', 'One :: do a thing\nTwo :: do another'); await pg.fill('#f_missions', 'Use a loop :: loop\nTwo sprites :: sprites>=2\nTell a friend');
  await pg.click('#save'); await pg.waitForSelector('.item');
  ok(await pg.locator('.item').count() === 29, 'new project saved');
  let c = await (await fetch('http://localhost:3111/api/content')).json(); const np = c.projects.find(p => p.id === 'my-test-game');
  ok(np && np.missions[0].rule.p === 'loop' && np.missions[1].rule.count === 'sprites' && !np.missions[2].rule, 'learner API serves it with rules');
  // hide seed project
  await pg.locator('.item', { hasText: 'Shrinking Naira' }).locator('[data-a=vis]').click(); await pg.waitForTimeout(500);
  c = await (await fetch('http://localhost:3111/api/content')).json(); ok(!c.projects.find(p => p.id === 'shrinking-naira') && c.projects.length === 28, 'hidden project gone from learners');
  // edit seed project title
  await pg.locator('.item', { hasText: 'Space Jollof' }).locator('[data-a=edit]').click(); await pg.fill('#f_title', 'Space Jollof EDITED'); await pg.click('#save'); await pg.waitForSelector('.item');
  c = await (await fetch('http://localhost:3111/api/content')).json(); ok(c.projects.find(p => p.id === 'space-jollof').title.includes('EDITED'), 'seed edit overrides');
  // puzzle create (read)
  await pg.click('#tz'); await pg.click('#new'); await pg.fill('#f_id', 'zz-test'); await pg.selectOption('#f_type', 'fix'); await pg.fill('#f_title', 'Find it'); await pg.fill('#f_blocks', 'when green flag clicked\nhide\nshow'); await pg.fill('#f_bad', '3'); await pg.click('#save'); await pg.waitForSelector('.item');
  c = await (await fetch('http://localhost:3111/api/content')).json(); ok(c.puzzles.find(p => p.id === 'zz-test').bad === 2, 'puzzle saved');
  // bad input rejected
  await pg.click('#new'); await pg.fill('#f_id', 'x'); await pg.click('#save'); await pg.waitForSelector('#msg.err'); ok(true, 'bad input shows message: ' + await pg.textContent('#msg'));
  // wrong pin
  const r = await fetch('http://localhost:3111/api/admin', { method: 'POST', body: JSON.stringify({ pin: 'no', action: 'csave', item: {} }) }); ok(r.status === 401, 'wrong pin rejected');
  console.log(errs); await b.close();
})();
