// Saves each child's Studio progress (steps, missions, puzzles) against their ID.
const { cmd, P } = require('../lib/redis');
const ids = require('../lib/ids');
const { body, send, limited } = require('../lib/http');
const ints = a => (Array.isArray(a) ? a.slice(0, 30).map(Number).filter(n => Number.isInteger(n) && n >= 0 && n < 30) : []);
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    if (await limited(req, 'studio', 600, 600)) return send(res, 429, { error: 'Slow down a little.' });
    const b = body(req);
    const id = ids.normalise(b.id);
    if (ids.validate(id) !== 'ok' || !(await cmd('HGET', P + 'roster', id))) return send(res, 403, { error: 'Unknown ID' });
    const key = P + 'sp:' + id;
    if (b.action === 'set') {
      const pid = String(b.pid || '');
      if (!/^[a-z0-9-]{2,50}$/.test(pid)) return send(res, 400, { error: 'Bad project' });
      await cmd('HSET', key, 'p:' + pid, JSON.stringify({ s: ints(b.s), m: ints(b.m), t: Date.now() }));
    } else if (b.action === 'z') {
      const zid = String(b.zid || '');
      if (!/^[a-z0-9-]{2,30}$/.test(zid)) return send(res, 400, { error: 'Bad puzzle' });
      const old = await cmd('HGET', key, 'z:' + zid);
      await cmd('HSET', key, 'z:' + zid, b.ok ? '1' : (old === '1' ? '1' : '0'));
    }
    const h = (await cmd('HGETALL', key)) || [];
    const out = { p: {}, z: {} };
    for (let i = 0; i < h.length; i += 2) {
      if (h[i].startsWith('p:')) { try { out.p[h[i].slice(2)] = JSON.parse(h[i + 1]); } catch (e) { } }
      else if (h[i].startsWith('z:')) out.z[h[i].slice(2)] = h[i + 1] === '1';
    }
    send(res, 200, out);
  } catch (e) { send(res, 500, { error: 'Could not save.' }); }
};
