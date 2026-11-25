const { chromium } = require('playwright'); const C = require('../public/data/content.json');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage(); await pg.goto('http://localhost:3111/studio'); await pg.waitForFunction(() => window.scratchblocks);
  const texts = []; C.puzzles.forEach(z => { if (z.type === 'read') texts.push([z.id, z.script]); if ((z.type === 'order' || z.type === 'fix') && z.track === 'scratch') z.blocks.forEach(l => texts.push([z.id, l])); });
  const bad = await pg.evaluate(t => { const out = []; t.forEach(([id, s]) => { const doc = window.scratchblocks.parse(s, { languages: ['en'] }); const walk = (n) => { if (!n) return; if (n.info && n.info.category === 'obsolete') out.push(id + ' :: ' + (n.info.id || '') + ' ' + JSON.stringify(s).slice(0, 80)); (n.children || []).forEach(walk); (n.blocks || []).forEach(walk); (n.scripts || []).forEach(walk); }; walk(doc); }); return out; }, texts);
  console.log('checked', texts.length, 'bad', bad.length); console.log(bad.slice(0, 20).join('\n')); await b.close();
})();
