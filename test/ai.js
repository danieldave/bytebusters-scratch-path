const PL = require('../public/promptlab.js'); const C = require('../public/data/content.json');
let bad = 0;
for (const p of C.projects.filter(p => p.ai)) {
  const b = PL.score(p.ai, p.ai.best), s = PL.score(p.ai, p.ai.start), e = PL.score(p.ai, '');
  const okBest = b.passed === b.total && !b.privacy.length, okStart = s.passed < s.total, okEmpty = e.passed === 0;
  const startRe = PL.replyFor(p.ai, s), bestRe = PL.replyFor(p.ai, b);
  if (!(okBest && okStart && okEmpty && bestRe === p.ai.replies[p.ai.replies.length - 1])) { bad++; console.log('BAD', p.id, b.passed, s.passed, e.passed); }
  console.log(p.id.padEnd(26), 'best', b.passed + '/' + b.total, 'start', s.passed + '/' + s.total);
}
const pv = PL.score({ checks: [{ rule: {} }], replies: ['a', 'b'] }, 'call me 0801 234 5678 or a@b.com'); console.log('privacy', pv.privacy);
console.log(bad ? 'PROBLEMS ' + bad : 'ALL OK');
