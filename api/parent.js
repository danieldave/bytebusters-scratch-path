// Read-only parent page data. Needs the secret link token, never shows the access ID.
const { cmd, P } = require('../lib/redis');
const { send, limited } = require('../lib/http');
module.exports = async (req, res) => {
  try {
    if (await limited(req, 'parent', 60, 600)) return send(res, 429, { error: 'Too many tries.' });
    const t = String((req.query && req.query.t) || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
    const id = t && (await cmd('HGET', P + 'share:tok', t));
    if (!id) return send(res, 404, { error: 'This link is not valid.' });
    const raw = await cmd('HGET', P + 'roster', id);
    if (!raw) return send(res, 404, { error: 'This link is not valid.' });
    const l = JSON.parse(raw);
    const prog = (await cmd('HGETALL', P + 'prog:' + id)) || [];
    const weeks = {}; let badges = [], last = 0;
    for (let i = 0; i < prog.length; i += 2) {
      if (prog[i] === 'b') { badges = JSON.parse(prog[i + 1]); continue; }
      const o = JSON.parse(prog[i + 1]);
      if (/^(t[23])?w\d+$/.test(prog[i])) weeks[prog[i]] = { done: !!o.done, quiz: o.quiz == null ? null : o.quiz, lab: !!(o.lab && o.lab.total && o.lab.passed >= o.lab.total) };
      last = Math.max(last, o.at || 0);
    }
    send(res, 200, { first: String(l.name || 'Your child').split(' ')[0], school: l.school || id.slice(0, 3), weeks, badges, last });
  } catch (e) { send(res, 500, { error: 'Try again later.' }); }
};
