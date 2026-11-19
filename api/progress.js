const { cmd, P } = require('../lib/redis');
const ids = require('../lib/ids');
const { body, send, limited } = require('../lib/http');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    if (await limited(req, 'prog', 300, 600)) return send(res, 429, { error: 'Slow down a little.' });
    const b = body(req);
    const id = ids.normalise(b.id);
    if (ids.validate(id) !== 'ok' || !(await cmd('HGET', P + 'roster', id))) return send(res, 403, { error: 'Unknown ID' });
    const week = Number(b.week);
    if (!(week >= 1 && week <= 10)) return send(res, 400, { error: 'Bad week' });
    const old = await cmd('HGET', P + 'prog:' + id, 'w' + week);
    const cur = old ? JSON.parse(old) : {};
    const next = {
      ...cur,
      done: b.done === undefined ? !!cur.done : !!b.done,
      quiz: b.quiz === undefined ? cur.quiz : Math.max(0, Math.min(3, Number(b.quiz) | 0)),
      steps: Array.isArray(b.steps) ? b.steps.slice(0, 12).map((x) => !!x) : cur.steps,
      at: Date.now(),
    };
    await cmd('HSET', P + 'prog:' + id, 'w' + week, JSON.stringify(next));
    send(res, 200, { ok: true, week, saved: next });
  } catch (e) { send(res, 500, { error: 'Could not save. Try again.' }); }
};
