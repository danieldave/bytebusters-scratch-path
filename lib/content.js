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
function cleanLab(l) {
  if (!l || typeof l !== 'object') return undefined;
  const o = { kind: l.kind === 'js' ? 'js' : 'html', chips: arr(l.chips, 6).map(t => str(t, 20)),
    shelf: arr(l.shelf, 12).map(x => ({ l: str(x && x.l, 30), i: str(x && x.i, 300) })).filter(x => x.l),
    starter: str(l.starter, 8000), solution: str(l.solution, 8000),
    missions: arr(l.missions, 8).map(m => ({ say: str(m && m.say, 200), hint: str(m && m.hint, 300), test: str(m && m.test, 700) })).filter(m => m.say && m.test) };
  if (!o.starter || !o.missions.length) throw new Error('A builder needs starter code and at least one mission with a test.');
  return o;
}
function cleanAi(a) {
  if (!a || typeof a !== 'object') return undefined;
  const rule = r => { const o = {}; ['any', 'all', 'not'].forEach(k => { if (Array.isArray(r && r[k])) o[k] = r[k].slice(0, 30).map(x => str(x, 40)); });
    ['notRe', 're'].forEach(k => { if (r && typeof r[k] === 'string') { try { new RegExp(r[k]); o[k] = str(r[k], 80); } catch (e) { } } });
    if (r && r.minWords) o.minWords = Math.min(60, Number(r.minWords) || 0); return o; };
  const o = { scenario: str(a.scenario, 300), start: str(a.start, 400), best: str(a.best, 500),
    checks: arr(a.checks, 6).map(c => ({ k: str(c && c.k, 30), say: str(c && c.say, 160), hint: str(c && c.hint, 200), rule: rule(c && c.rule) })).filter(c => c.say),
    replies: arr(a.replies, 6).map(t => str(t, 900)) };
  if (!o.scenario || o.checks.length < 2 || o.replies.length < 2) throw new Error('A prompt lab needs a scenario, 2+ checks and 2+ replies.');
  return o;
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
  if (p.ai) { out.ai = cleanAi(p.ai); out.creator = true; out.missions = out.ai.checks.map(c => ({ t: c.say })); }
  if (p.lab) { out.lab = cleanLab(p.lab); out.creator = true; out.missions = out.lab.missions.map(m => ({ t: m.say })); }
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
    o.track = type === 'fix' && KINDS.includes(z.track) ? z.track : 'scratch';
  }
  return o;
}
function cleanWord(w) {
  const o = { w: str(w.w, 40).trim(), d: str(w.d, 220).trim(), e: str(w.e, 160).trim(), t: ['basics', 'scratch', 'web', 'ai', 'safety'].includes(w.t) ? w.t : 'basics' };
  if (!o.w || !o.d) throw new Error('A word and its meaning are needed.');
  o.id = (str(w.id, 50) || o.w).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
  if (o.id.length < 2) throw new Error('Word is too short.');
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
  return { v: seed.v, projects: mk(seed.projects, 'p'), puzzles: mk(seed.puzzles, 'z'), words: mk(seed.words || [], 'w') };
}
module.exports = { load, cleanProject, cleanPuzzle, cleanWord, seed };
