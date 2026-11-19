// Tiny Upstash REST client (no dependencies). Works with the Upstash env names
// or the names the Vercel Upstash/KV integration creates.
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
async function cmd(...args) {
  if (!URL_ || !TOKEN) throw new Error('Database not configured');
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(args.map(String)),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
// Every key starts with this prefix so we never touch your other projects' data.
const P = 'bbpath:';
module.exports = { cmd, P };
