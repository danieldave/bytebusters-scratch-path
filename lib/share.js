const crypto = require('crypto');
const { cmd, P } = require('./redis');
const A = 'abcdefghjkmnpqrstuvwxyz23456789';
async function tokenFor(id) {
  let t = await cmd('HGET', P + 'share:rev', id);
  if (t) return t;
  t = Array.from(crypto.randomBytes(14), (x) => A[x % A.length]).join('');
  await cmd('HSET', P + 'share:tok', t, id);
  await cmd('HSET', P + 'share:rev', id, t);
  return t;
}
async function drop(id) {
  const t = await cmd('HGET', P + 'share:rev', id);
  if (t) { await cmd('HDEL', P + 'share:tok', t); await cmd('HDEL', P + 'share:rev', id); }
}
module.exports = { tokenFor, drop };
