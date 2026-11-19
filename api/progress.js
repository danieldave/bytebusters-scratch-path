const { cmd, P } = require('../lib/redis');
const ids = require('../lib/ids');
const { body, send, limited } = require('../lib/http');
const TERMS = ['t1', 't2', 't3'];
const BADGES = ['blue', 'red', 'green', 'purple', 'builder'];
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    if (await limited(req, 'prog', 300, 600)) return send(res, 429, { error: 'Slow down a little.' });
    const b = body(req);
    const id = ids.normalise(b.id);
    if (ids.validate(id) !== 'ok' || !(await cmd('HGET', P + 'roster', id))) return send(res, 403, { error: 'Unknown ID' });
    const term = TERMS.includes(b.term) ? b.term : 't1';
    const week = Number(b.week);
    if (!(week >= 1 && week <= 10)) return send(res, 400, { error: 'Bad week' });
    const key = (term === 't1' ? 'w' : term + 'w') + week;
    const old = await cmd('HGET', P + 'prog:' + id, key);
    const cur = old ? JSON.parse(old) : {};
    const next = {
      ...cur,
      done: b.done === undefined ? !!cur.done : !!b.done,
      quiz: b.quiz === undefined ? cur.quiz : Math.max(0, Math.min(5, Number(b.quiz) | 0)),
      qa: Array.isArray(b.qa) ? b.qa.slice(0, 5).map((x) => (x ? 1 : 0)) : cur.qa,
      steps: Array.isArray(b.steps) ? b.steps.slice(0, 12).map((x) => !!x) : cur.steps,
      at: Date.now(),
    };
    if (b.check && typeof b.check === 'object') {
      const c = b.check, n = (x) => Math.max(0, Math.min(999, Number(x) | 0));
      next.check = { found: n(c.found), total: n(c.total), newFound: n(c.newFound), newTotal: n(c.newTotal), at: Date.now() };
    }
    await cmd('HSET', P + 'prog:' + id, key, JSON.stringify(next));
    let badges = [];
    const ob = await cmd('HGET', P + 'prog:' + id, 'b');
    badges = ob ? JSON.parse(ob) : [];
    if (Array.isArray(b.badges)) {
      const add = b.badges.filter((x) => BADGES.includes(x) && !badges.includes(x));
      if (add.length) { badges = badges.concat(add); await cmd('HSET', P + 'prog:' + id, 'b', JSON.stringify(badges)); }
    }
    send(res, 200, { ok: true, week, term, saved: next, badges });
  } catch (e) { send(res, 500, { error: 'Could not save. Try again.' }); }
};
