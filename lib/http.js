const { cmd, P } = require('./redis');
function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}
function send(res, code, obj) {
  res.status(code).setHeader('Cache-Control', 'no-store');
  res.json(obj);
}
// Very small rate limit: max `n` tries per `secs` per IP+bucket.
async function limited(req, bucket, n, secs) {
  const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
  const k = P + 'rl:' + bucket + ':' + ip;
  const c = Number(await cmd('INCR', k));
  if (c === 1) await cmd('EXPIRE', k, secs);
  return c > n;
}
module.exports = { body, send, limited };
