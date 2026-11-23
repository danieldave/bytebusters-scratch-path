// Local test server: fake Upstash REST + the real API handlers + static files.
const http = require('http'), fs = require('fs'), path = require('path');
const store = new Map(); // key -> {t:'h'|'s', v}
function redis(a) {
  const [c, k, ...r] = a; const C = c.toUpperCase();
  const h = () => { if (!store.has(k)) store.set(k, { h: new Map() }); return store.get(k).h; };
  switch (C) {
    case 'HGET': return store.has(k) ? (store.get(k).h.get(r[0]) ?? null) : null;
    case 'HSET': { const m = h(); let n = 0; for (let i = 0; i < r.length; i += 2) { if (!m.has(r[i])) n++; m.set(r[i], r[i + 1]); } return n; }
    case 'HSETNX': { const m = h(); if (m.has(r[0])) return 0; m.set(r[0], r[1]); return 1; }
    case 'HGETALL': { if (!store.has(k)) return []; const o = []; for (const [x, y] of store.get(k).h) o.push(x, y); return o; }
    case 'HDEL': store.has(k) && store.get(k).h.delete(r[0]); return 1;
    case 'DEL': return store.delete(k) ? 1 : 0;
    case 'INCR': { const v = Number((store.get(k) || {}).s || 0) + 1; store.set(k, { s: v }); return v; }
    case 'EXPIRE': return 1;
    case 'HSETNX2': return 0;
    default: throw new Error('cmd ' + C);
  }
}
const up = http.createServer((q, s) => { let b = ''; q.on('data', (d) => b += d); q.on('end', () => { try { s.end(JSON.stringify({ result: redis(JSON.parse(b)) })); } catch (e) { s.end(JSON.stringify({ error: e.message })); } }); }).listen(0);
const port = up.address().port;
process.env.UPSTASH_REDIS_REST_URL = 'http://127.0.0.1:' + port; process.env.UPSTASH_REDIS_REST_TOKEN = 't';
process.env.TRAINER_PIN = process.env.TRAINER_PIN || '1234';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.sb3': 'application/octet-stream' };
const app = http.createServer((q, s) => {
  const u = new URL(q.url, 'http://x'); const p = u.pathname;
  if (p.startsWith('/api/')) {
    let b = ''; q.on('data', (d) => b += d); q.on('end', async () => {
      s.status = (c) => { s.statusCode = c; return s; }; s.json = (o) => { s.setHeader('Content-Type', 'application/json'); s.end(JSON.stringify(o)); };
      q.body = b; q.query = Object.fromEntries(u.searchParams); delete require.cache[require.resolve('../lib/redis')];
      try { await require('../api/' + p.slice(5).replace(/\W/g, ''))(q, s); } catch (e) { s.statusCode = 500; s.end(String(e)); }
    }); return;
  }
  let f = p === '/_labtest.html' ? path.join(__dirname, 'labtest.html') : path.join(__dirname, '../public', p === '/' ? 'index.html' : p); if (!path.extname(f)) f += '.html';
  fs.readFile(f, (e, d) => { if (e) { s.statusCode = 404; return s.end('nf'); } s.setHeader('Content-Type', MIME[path.extname(f)] || 'text/plain'); s.end(d); });
}).listen(Number(process.env.PORT || 3111), () => console.log('dev on', app.address().port));
