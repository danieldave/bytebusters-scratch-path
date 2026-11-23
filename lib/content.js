// Studio content = seed file in the repo + trainer edits stored in the database.
const { cmd, P } = require('./redis');
const seed = require('../public/data/content.json');
const KINDS = ['scratch', 'web', 'ai'];
const str = (v, n) => String(v == null ? '' : v).slice(0, n);
const arr = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
function cleanRule(r) {
  if (!r || typeof r !== 'object') return undefined;
  const o = {};
  if (typeof r.p === 'string') o.p = str(r.p, 20);
  if (typeof r.count === 'string') o.count = str(r.count, 20);
  if (r.min != null) o.min = Math.max(0, Math.min(99, Number(r.min) || 0));
  if (Array.isArray(r.any)) o.any = r.any.slice(0, 6).map(cleanRule).filter(Boolean);
  if (Array.isArray(r.all)) o.all = r.all.slice(0, 6).map(cleanRule).filter(Boolean);
  return Object.keys(o).length ? o : undefined;
}
function cleanProject(p) {
  const id = str(p.id, 50).toLowerCase();
  if (!/^[a-z0-9-]{2,50}$/.test(id)) throw new Error('ID must be lowercase letters, numbers and dashes.');
  if (!KINDS.includes(p.kind)) throw new Error('Kind must be scratch, web or ai.');
  if (!str(p.title, 80).trim()) throw new Error('Title is needed.');
  const out = {
    id, kind: p.kind, title: str(p.title, 80), emoji: str(p.emoji || '⭐', 8), level: Math.max(1, Math.min(3, Number(p.level) || 1)),
    themes: arr(p.themes, 4).map(t => str(t, 20)), hook: str(p.hook, 200), problem: str(p.problem, 400),
    learn: arr(p.learn, 6).map(t => str(t, 120)),
    steps: arr(p.steps, 14).map(s => ({ t: str(s.t, 80), b: str(s.b, 400) })).filter(s => s.t),
    missions: arr(p.missions, 10).map(m => { const o = { t: str(m && m.t, 120) }; const r = cleanRule(m && m.rule); if (r) o.rule = r; return o; }).filter(m => m.t),
    ask: str(p.ask, 300), remix: str(p.remix, 300), showcase: !!p.showcase,
  };
  if (p.school && ['MHS', 'UHS', 'YWS'].includes(p.school)) out.school = p.school;
  if (typeof p.link === 'string' && /^https:\/\//.test(p.link)) out.link = str(p.link, 300);
  if (!out.steps.length) throw new Error('Add at least one step.');
  return out;
}
function cleanPuzzle(z) {
  const id = str(z.id, 30).toLowerCase();
  if (!/^[a-z0-9-]{2,30}$/.test(id)) throw new Error('Puzzle ID must be lowercase letters, numbers and dashes.');
  const type = z.type;
  if (!['quiz', 'read', 'order', 'fix'].includes(type)) throw new Error('Type must be quiz, read, order or fix.');
  const o = { id, type, track: KINDS.includes(z.track) ? z.track : 'scratch', level: Math.max(1, Math.min(3, Number(z.level) || 1)), why: str(z.why, 400) };
  if (type === 'quiz' || type === 'read') {
    o.q = str(z.q, 300); o.o = arr(z.o, 5).map(t => str(t, 160)); o.a = Number(z.a);
    if (!o.q || o.o.length < 2 || !(o.a >= 0 && o.a < o.o.length)) throw new Error('Need a question, 2+ options and a right answer.');
    if (type === 'read') { o.script = str(z.script, 1500); if (!o.script) throw new Error('Script is needed.'); o.track = 'scratch'; }
  } else {
    o.title = str(z.title, 200); o.blocks = arr(z.blocks, 10).map(t => str(t, 120)).filter(Boolean);
    if (o.blocks.length < 2) throw new Error('Need at least 2 blocks.');
    if (type === 'fix') { o.bad = Number(z.bad); if (!(o.bad >= 0 && o.bad < o.blocks.length)) throw new Error('Pick which block is wrong.'); }
    o.track = 'scratch';
  }
  return o;
}
async function overrides() {
  const h = (await cmd('HGETALL', P + 'content')) || [];
  const m = {}; for (let i = 0; i < h.length; i += 2) m[h[i]] = h[i + 1];
  return m;
}
// includeHidden: for the trainer. Learners never see hidden items.
async function load(includeHidden) {
  let ov = {};
  try { ov = await overrides(); } catch (e) { /* database off: seed only */ }
  const mk = (list, pre) => {
    const map = new Map(list.map(x => [x.id, { ...x, src: 'seed' }]));
    for (const k of Object.keys(ov)) {
      if (k.startsWith(pre + ':')) { try { const o = JSON.parse(ov[k]); map.set(o.id, { ...o, src: map.has(o.id) ? 'edited' : 'new' }); } catch (e) { } }
    }
    const out = [];
    for (const x of map.values()) { x.hidden = ov['h:' + pre + ':' + x.id] === '1'; if (includeHidden || !x.hidden) out.push(x); }
    return out;
  };
  return { v: seed.v, projects: mk(seed.projects, 'p'), puzzles: mk(seed.puzzles, 'z') };
}
module.exports = { load, cleanProject, cleanPuzzle, seed };
