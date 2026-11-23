// Saves a child's lab code against their ID so they can continue on any phone.
const { cmd, P } = require('../lib/redis');
const ids = require('../lib/ids');
const { body, send, limited } = require('../lib/http');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    if (await limited(req, 'code', 400, 600)) return send(res, 429, { error: 'Slow down a little.' });
    const b = body(req);
    const id = ids.normalise(b.id);
    if (ids.validate(id) !== 'ok' || !(await cmd('HGET', P + 'roster', id))) return send(res, 403, { error: 'Unknown ID' });
    const key = String(b.key || '');
    if (!/^(w|t[23]w)(10|[1-9])$/.test(key)) return send(res, 400, { error: 'Bad key' });
    if (b.action === 'get') {
      const raw = await cmd('HGET', P + 'code:' + id, key);
      return send(res, 200, raw ? JSON.parse(raw) : {});
    }
    const code = String(b.code == null ? '' : b.code).slice(0, 20000);
    await cmd('HSET', P + 'code:' + id, key, JSON.stringify({ code, t: Date.now() }));
    send(res, 200, { ok: true });
  } catch (e) { send(res, 500, { error: 'Could not save.' }); }
};
