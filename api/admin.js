const crypto = require('crypto');
const { cmd, P } = require('../lib/redis');
const ids = require('../lib/ids');
const { body, send, limited } = require('../lib/http');
const SCHOOLS = { MHS: 'Methodist High School Arigbajo', UHS: 'Unity High School', YWS: 'Yewa College Ilaro' };
function pinOk(pin) {
  const want = process.env.TRAINER_PIN || '';
  if (!want || !pin) return false;
  const a = crypto.createHash('sha256').update(String(pin)).digest();
  const b = crypto.createHash('sha256').update(want).digest();
  return crypto.timingSafeEqual(a, b);
}
async function allRoster() {
  const h = (await cmd('HGETALL', P + 'roster')) || [];
  const out = [];
  for (let i = 0; i < h.length; i += 2) out.push({ id: h[i], ...JSON.parse(h[i + 1]) });
  return out.sort((x, y) => x.id.localeCompare(y.id));
}
async function newId(school) {
  for (let t = 0; t < 50; t++) {
    const id = ids.make(school);
    if (!(await cmd('HGET', P + 'roster', id))) return id;
  }
  throw new Error('no free id');
}
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    if (await limited(req, 'admin', 30, 600)) return send(res, 429, { error: 'Too many tries.' });
    const b = body(req);
    if (!process.env.TRAINER_PIN) return send(res, 500, { error: 'TRAINER_PIN is not set in Vercel yet.' });
    if (!pinOk(b.pin)) return send(res, 401, { error: 'Wrong PIN' });
    const a = b.action;
    if (a === 'list') {
      const roster = await allRoster();
      for (const r of roster) {
        const p = (await cmd('HGETALL', P + 'prog:' + r.id)) || [];
        let done = 0, stars = 0;
        for (let i = 0; i < p.length; i += 2) { const o = JSON.parse(p[i + 1]); if (o.done) done++; stars += o.quiz || 0; }
        r.done = done; r.stars = stars;
      }
      return send(res, 200, { roster });
    }
    if (a === 'seed') { // load the mock IDs from data/roster.seed.json (skips ones that exist)
      const seed = require('../data/roster.seed.json');
      let n = 0;
      for (const r of seed) {
        if (ids.validate(r.id) !== 'ok') continue;
        const ex = await cmd('HSETNX', P + 'roster', r.id, JSON.stringify({ name: r.name, school: r.school, mock: true }));
        n += Number(ex);
      }
      return send(res, 200, { added: n });
    }
    if (a === 'rename') { // set real name for an existing ID (keeps progress)
      const id = ids.normalise(b.id);
      const raw = await cmd('HGET', P + 'roster', id);
      if (!raw) return send(res, 404, { error: 'ID not found' });
      const o = JSON.parse(raw);
      o.name = String(b.name || '').trim().slice(0, 40); delete o.mock;
      await cmd('HSET', P + 'roster', id, JSON.stringify(o));
      return send(res, 200, { ok: true });
    }
    if (a === 'bulkrename') { // lines: "ID,Real Name"
      let n = 0, bad = [];
      for (const line of String(b.text || '').split(/\r?\n/)) {
        if (!line.trim()) continue;
        const k = line.indexOf(',');
        if (k < 0) { bad.push(line); continue; }
        const id = ids.normalise(line.slice(0, k)); const name = line.slice(k + 1).trim().slice(0, 40);
        const raw = await cmd('HGET', P + 'roster', id);
        if (!raw || !name) { bad.push(line); continue; }
        const o = JSON.parse(raw); o.name = name; delete o.mock;
        await cmd('HSET', P + 'roster', id, JSON.stringify(o)); n++;
      }
      return send(res, 200, { updated: n, skipped: bad });
    }
    if (a === 'add') { // names (one per line) -> brand-new IDs for a school
      const school = String(b.school || '').toUpperCase();
      if (!SCHOOLS[school]) return send(res, 400, { error: 'Pick a school' });
      const out = [];
      for (const nm of String(b.names || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean).slice(0, 200)) {
        const id = await newId(school);
        await cmd('HSET', P + 'roster', id, JSON.stringify({ name: nm.slice(0, 40), school }));
        out.push({ id, name: nm });
      }
      return send(res, 200, { added: out });
    }
    if (a === 'delete') {
      const id = ids.normalise(b.id);
      await cmd('HDEL', P + 'roster', id); await cmd('DEL', P + 'prog:' + id);
      return send(res, 200, { ok: true });
    }
    if (a === 'resetprogress') {
      await cmd('DEL', P + 'prog:' + ids.normalise(b.id));
      return send(res, 200, { ok: true });
    }
    return send(res, 400, { error: 'Unknown action' });
  } catch (e) { send(res, 500, { error: 'Server error: ' + e.message }); }
};
