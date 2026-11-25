const crypto = require('crypto');
const { cmd, P } = require('../lib/redis');
const ids = require('../lib/ids');
const share = require('../lib/share');
const { body, send, limited } = require('../lib/http');
const content = require('../lib/content');
const SCHOOLS = { MHS: 'Methodist High School Arigbajo', UHS: 'Unity High School', YWS: 'Yewa College Ilaro' };
// Roster helpers: accept friendly names typed by the trainer.
function schoolCode(s) {
  const v = String(s || '').trim().toUpperCase();
  if (SCHOOLS[v]) return v;
  if (/YEWA|^YW/.test(v)) return 'YWS';
  if (/METH|^MH/.test(v)) return 'MHS';
  if (/UNITY|^UH/.test(v)) return 'UHS';
  return '';
}
function trackName(s) {
  const v = String(s || '').trim().toLowerCase().replace(/[\s_-]/g, '');
  if (!v || v.startsWith('scr')) return 'Scratch';
  if (v.startsWith('web') || v === 'wd') return 'Web';
  if (v.startsWith('gen') || v === 'ai' || v === 'genai') return 'GenAI';
  return '';
}
function splitLine(line) { // "Name, School, Track, Class" — commas or tabs (pasted from Excel/Sheets)
  return line.split(line.includes('\t') ? '\t' : ',').map((x) => x.trim());
}
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
      const seenH = (await cmd('HGETALL', P + 'seen')) || [];
      const seen = {}; for (let i = 0; i < seenH.length; i += 2) seen[seenH[i]] = Number(seenH[i + 1]);
      for (const r of roster) {
        const p = (await cmd('HGETALL', P + 'prog:' + r.id)) || [];
        let done = 0, stars = 0, last = 0; r.progress = {}; r.badges = [];
        for (let i = 0; i < p.length; i += 2) {
          if (p[i] === 'b') { r.badges = JSON.parse(p[i + 1]); continue; }
          const o = JSON.parse(p[i + 1]); r.progress[p[i]] = o;
          if (/^w\d+$/.test(p[i])) { if (o.done) done++; stars += o.quiz || 0; }
          else if (/^wdw\d+$/.test(p[i])) { r.wd = (r.wd || 0) + (o.done ? 1 : 0); }
          else if (/^t[23]w\d+$/.test(p[i])) { const tk = p[i].slice(0, 2); r[tk] = (r[tk] || 0) + (o.done ? 1 : 0); r[tk + 'lab'] = (r[tk + 'lab'] || 0) + ((o.lab && o.lab.total && o.lab.passed >= o.lab.total) ? 1 : 0); }
          last = Math.max(last, o.at || 0);
        }
        r.done = done; r.stars = stars; r.last = last; r.seen = seen[r.id] || 0; r.t2 = r.t2 || 0; r.t3 = r.t3 || 0; r.t2lab = r.t2lab || 0; r.t3lab = r.t3lab || 0; r.wd = r.wd || 0;
      }
      const cf = (await cmd('HGETALL', P + 'cfg')) || []; const open = { t1: true, t2: false, t3: false };
      for (let i = 0; i < cf.length; i += 2) if (cf[i] in open) open[cf[i]] = cf[i + 1] === '1';
      return send(res, 200, { roster, now: Date.now(), open });
    }
    if (a === 'setterm') {
      if (!['t2', 't3'].includes(b.term)) return send(res, 400, { error: 'Bad term' });
      await cmd('HSET', P + 'cfg', b.term, b.open ? '1' : '0');
      return send(res, 200, { ok: true });
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
    if (a === 'roster') { // lines "Name, School, Track, Class" -> brand-new IDs. dry:true only checks.
      const out = [], bad = [];
      const lines = String(b.text || '').split(/\r?\n/).filter((l) => l.trim()).slice(0, 400);
      for (const line of lines) {
        const [name, sch, tr, cls] = splitLine(line);
        if (/^name$/i.test(name || '')) continue; // header row
        const school = schoolCode(sch), track = trackName(tr);
        if (!name || !school || !track) { bad.push({ line, why: !name ? 'no name' : !school ? 'school not Yewa / Methodist / Unity' : 'track not Scratch / Web / GenAI' }); continue; }
        out.push({ name: name.slice(0, 40), school, track, cls: String(cls || '').slice(0, 20) });
      }
      if (b.dry) return send(res, 200, { ok: out, bad });
      const made = [];
      for (const r of out) {
        const id = await newId(r.school);
        await cmd('HSET', P + 'roster', id, JSON.stringify(r));
        made.push({ id, ...r });
      }
      return send(res, 200, { added: made, bad });
    }
    if (a === 'setinfo') { // change track / class of one ID (keeps progress)
      const id = ids.normalise(b.id);
      const raw = await cmd('HGET', P + 'roster', id);
      if (!raw) return send(res, 404, { error: 'ID not found' });
      const o = JSON.parse(raw);
      if (b.track !== undefined) { const t = trackName(b.track); if (!t) return send(res, 400, { error: 'Track must be Scratch, Web or GenAI' }); o.track = t; }
      if (b.cls !== undefined) o.cls = String(b.cls).trim().slice(0, 20);
      await cmd('HSET', P + 'roster', id, JSON.stringify(o));
      return send(res, 200, { ok: true });
    }
    if (a === 'clearmock') { // remove every unused mock ID (never logged in, no progress)
      const roster = await allRoster(); let n = 0;
      for (const r of roster) {
        if (!r.mock) continue;
        const seen = await cmd('HGET', P + 'seen', r.id);
        const prog = await cmd('HGETALL', P + 'prog:' + r.id);
        if (seen || (prog && prog.length)) continue;
        await cmd('HDEL', P + 'roster', r.id); n++;
      }
      return send(res, 200, { removed: n });
    }
    if (a === 'cget') return send(res, 200, await content.load(true));
    if (a === 'csave') {
      try {
        const kind = b.what === 'puzzle' ? 'z' : 'p';
        const item = kind === 'z' ? content.cleanPuzzle(b.item || {}) : content.cleanProject(b.item || {});
        await cmd('HSET', P + 'content', kind + ':' + item.id, JSON.stringify(item));
        return send(res, 200, { ok: true, item });
      } catch (e) { return send(res, 400, { error: e.message }); }
    }
    if (a === 'cvis') {
      const pre = b.what === 'puzzle' ? 'z' : 'p', id = String(b.itemId || '');
      if (!/^[a-z0-9-]{2,50}$/.test(id)) return send(res, 400, { error: 'Bad id' });
      if (b.hidden) await cmd('HSET', P + 'content', 'h:' + pre + ':' + id, '1'); else await cmd('HDEL', P + 'content', 'h:' + pre + ':' + id);
      return send(res, 200, { ok: true });
    }
    if (a === 'crevert') { // drop trainer edits of an item; seed version returns (new items are deleted)
      const pre = b.what === 'puzzle' ? 'z' : 'p', id = String(b.itemId || '');
      if (!/^[a-z0-9-]{2,50}$/.test(id)) return send(res, 400, { error: 'Bad id' });
      await cmd('HDEL', P + 'content', pre + ':' + id); await cmd('HDEL', P + 'content', 'h:' + pre + ':' + id);
      return send(res, 200, { ok: true });
    }
    if (a === 'sstats') { // Studio activity per child (fetched in parallel batches)
      const roster = await allRoster(); const out = {};
      for (let k = 0; k < roster.length; k += 20) {
        await Promise.all(roster.slice(k, k + 20).map(async r => {
          const h = (await cmd('HGETALL', P + 'sp:' + r.id)) || []; let p = 0, z = 0, st = 0, last = 0;
          for (let i = 0; i < h.length; i += 2) {
            if (h[i].startsWith('p:')) { try { const o = JSON.parse(h[i + 1]); if ((o.s || []).length || (o.l && o.l[0])) p++; if (o.l && o.l[1] && o.l[0] >= o.l[1]) st++; if (o.t > last) last = o.t; } catch (e) { } }
            else if (h[i].startsWith('z:') && h[i + 1] === '1') z++;
          }
          out[r.id] = { p, z, done: st, last };
        }));
      }
      return send(res, 200, { stats: out });
    }
    if (a === 'delete') {
      const id = ids.normalise(b.id);
      await cmd('HDEL', P + 'roster', id); await cmd('DEL', P + 'prog:' + id); await share.drop(id); await cmd('DEL', P + 'code:' + id); await cmd('DEL', P + 'sp:' + id);
      return send(res, 200, { ok: true });
    }
    if (a === 'resetprogress') {
      await cmd('DEL', P + 'prog:' + ids.normalise(b.id)); await cmd('DEL', P + 'sp:' + ids.normalise(b.id));
      return send(res, 200, { ok: true });
    }
    return send(res, 400, { error: 'Unknown action' });
  } catch (e) { send(res, 500, { error: 'Server error: ' + e.message }); }
};
