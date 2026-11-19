const { cmd, P } = require('../lib/redis');
const ids = require('../lib/ids');
const { body, send, limited } = require('../lib/http');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    if (await limited(req, 'login', 40, 600)) return send(res, 429, { error: 'Too many tries. Wait a few minutes and try again.' });
    const id = ids.normalise(body(req).id);
    const v = ids.validate(id);
    if (v === 'format') return send(res, 400, { error: 'An ID looks like UHS-4K7M. Check the letters and numbers.' });
    if (v === 'check') return send(res, 400, { error: 'Almost! One letter or number is wrong. Check your ID card again.' });
    const raw = await cmd('HGET', P + 'roster', id);
    if (!raw) return send(res, 404, { error: 'This ID is not on the list yet. Ask your trainer.' });
    const learner = JSON.parse(raw);
    const prog = await cmd('HGETALL', P + 'prog:' + id);
    const progress = {};
    for (let i = 0; i < (prog || []).length; i += 2) progress[prog[i]] = JSON.parse(prog[i + 1]);
    await cmd('HSET', P + 'seen', id, Date.now());
    send(res, 200, { id, name: learner.name || '', school: learner.school || id.slice(0, 3), progress });
  } catch (e) { send(res, 500, { error: 'Something went wrong. Try again.' }); }
};
