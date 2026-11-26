/* ByteBusters Journey engine — one engine, two journeys:
   window.JMODE = 'code' → the official 4-year coding curriculum (Year 1 in Scratch Path, Years 2–4 here)
   window.JMODE = 'ai'   → the separate Generative AI Journey (Level 1 at /genai, Levels 2–4 here)
   Progress saves to the learner's access ID (keys like y2t1w3 / ai2w5) and unlocks the next term.
   A term counts as finished at PASS weeks done. Trainers can set a learner's starting point in Admin. */
(function () {
var LOCK = '<svg class="lk-i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-label="Locked"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>';
'use strict';
var MODE = window.JMODE || 'code', PASS = 8;
var app = document.getElementById('app');
var ME = null, PR = {}, CUR = null, CACHE = {};
var COL = { blue: 'Variables', red: 'Conditionals', green: 'Loops', purple: 'Events' };
var TN = ['First Term', 'Second Term', 'Third Term'];

// ── the journey order ──
// ext = lives on another page (progress still counted here); key = progress key prefix
var CODE = [
  { id: 'y1t1', y: 1, t: 1, key: 'w', ext: '/', title: 'Scratch Programming' },
  { id: 'y1t2', y: 1, t: 2, key: 't2w', ext: '/', title: 'HTML & CSS' },
  { id: 'y1t3', y: 1, t: 3, key: 't3w', ext: '/', title: 'JavaScript + PHP' },
  { id: 'y2t1', y: 2, t: 1, key: 'y2t1w', title: 'Advanced HTML & CSS' },
  { id: 'y2t2', y: 2, t: 2, key: 'y2t2w', title: 'Intermediate JavaScript' },
  { id: 'y2t3', y: 2, t: 3, key: 'y2t3w', title: 'PHP Forms & Databases + Intro to Python' },
  { id: 'y3t1', y: 3, t: 1, key: 'y3t1w', title: 'PHP Frameworks & APIs' },
  { id: 'y3t2', y: 3, t: 2, key: 'y3t2w', title: 'Python: Functions, Data & Files' },
  { id: 'y3t3', y: 3, t: 3, key: 'y3t3w', title: 'Advanced Python: OOP, Data & Flask' },
  { id: 'y4t1', y: 4, t: 1, key: 'y4t1w', title: 'Advanced Python: ML, Django & Automation' },
  { id: 'y4t2', y: 4, t: 2, key: 'y4t2w', title: 'Java' },
  { id: 'y4t3', y: 4, t: 3, key: 'y4t3w', title: 'Capstone Projects' }
];
var BRIDGE = { id: 'bridge', key: 'wdw', ext: '/webdev', title: 'Web Foundations Bridge' };
var AI = [
  { id: 'ai1', lv: 1, key: 'gaw', ext: '/genai', title: 'Safe AI Builder' },
  { id: 'ai2', lv: 2, key: 'ai2w', title: 'AI Creator' },
  { id: 'ai3', lv: 3, key: 'ai3w', title: 'AI App Builder' },
  { id: 'ai4', lv: 4, key: 'ai4w', title: 'AI Agents & Leadership' }
];
var LIST = MODE === 'ai' ? AI : CODE;

// ── helpers ──
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
function lsj(k, v) { if (v === undefined) { try { return JSON.parse(ls(k) || 'null'); } catch (e) { return null; } } ls(k, v === null ? null : JSON.stringify(v)); }
function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function toast(t) { var e = document.getElementById('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('on'); }, 2400); }
function post(u, o) { return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }).then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || 'Error'); e.http = r.status; throw e; } return j; }); }); }
var GK = 'bbj_guest', QK = 'bbj_q', PK = 'bbj_prof';
function queue(o) { var q = lsj(QK) || []; q.push(o); lsj(QK, q); }
function flush() { var q = lsj(QK) || []; if (!q.length) return; lsj(QK, []); q.forEach(function (o) { post('/api/progress', o).catch(function (e) { if (!e.http) queue(o); }); }); }

function doneIn(T) { var n = 0; for (var w = 1; w <= 10; w++) { var o = PR[T.key + w]; if (o && o.done) n++; } return n; }
function finished(T) { return doneIn(T) >= PASS; }
var PREVIEW = (function () { try { return sessionStorage.getItem('bbj_preview') === '1'; } catch (e) { return false; } })();
function startIndex() { // trainer-set starting point (Admin → Journey start). 'bridge' = Year 2 builder: basics first, the Bridge unlocks Year 2
  var s = ME && ME.start; if (!s || s === 'bridge') return 0;
  var i = LIST.findIndex(function (T) { return T.id === s; }); return i < 0 ? 0 : i;
}
function unlocked(i) {
  if (PREVIEW || i <= startIndex()) return true;
  if (MODE === 'code' && LIST[i].id === 'y2t1' && finished(BRIDGE)) return true;
  return finished(LIST[i - 1]);
}
function lockReason(i) {
  if (MODE === 'code' && LIST[i].id === 'y2t1') return 'Finish Year 1 Third Term (or the Web Foundations Bridge) — ' + PASS + ' of 10 weeks — to unlock.';
  var P = LIST[i - 1]; return 'Finish ' + label(P) + ' (' + PASS + ' of 10 weeks) to unlock. You have ' + doneIn(P) + '.';
}
function label(T) { return MODE === 'ai' ? 'Level ' + T.lv : 'Year ' + T.y + ' ' + TN[T.t - 1]; }
function wkKey(T, w) { return T.key + w; }

function save(T, w, o) {
  var k = wkKey(T, w), next = Object.assign({}, PR[k] || {}, o, { at: Date.now() }); PR[k] = next;
  if (!ME) { lsj(GK, PR); return; }
  lsj(PK, { id: ME.id, name: ME.name, start: ME.start, PR: PR });
  var p = { id: ME.id, term: T.id, week: w };
  ['done', 'quiz', 'qa', 'steps'].forEach(function (x) { if (o[x] !== undefined) p[x] = o[x]; });
  if (o.badges) p.badges = o.badges;
  post('/api/progress', p).catch(function (e) { if (!e.http) { queue(p); toast('Saved on this phone — it will sync when you are online.'); } else toast('Could not save. Try again.'); });
}
function login(id) {
  return post('/api/login', { id: id }).then(function (j) {
    ME = j; ls('bb_id', j.id); PR = Object.assign({}, j.progress || {});
    var g = lsj(GK); if (g) { Object.keys(g).forEach(function (k) { var m = /^((?:y[1-4]t[1-3]|ai[2-4]))w(\d+)$/.exec(k); if (m && g[k].done && !(PR[k] && PR[k].done)) { var T = LIST.filter(function (x) { return x.id === m[1]; })[0]; if (T) save(T, +m[2], g[k]); } }); lsj(GK, null); }
    lsj(PK, { id: ME.id, name: ME.name, start: ME.start, PR: PR }); flush();
  });
}
function load(T) {
  if (CACHE[T.id]) return Promise.resolve(CACHE[T.id]);
  return fetch('/data/journey/' + T.id + '.json').then(function (r) { if (!r.ok) throw new Error('missing'); return r.json(); }).then(function (d) { CACHE[T.id] = d; return d; });
}
function who() {
  var el = document.getElementById('who');
  el.innerHTML = ME ? '<span class="nm">' + esc((ME.name || ME.id).split(' ')[0]) + '</span> <button id="out" aria-label="Log out on this phone">Out</button>' : '';
  var o = document.getElementById('out'); if (o) o.onclick = function () { ls('bb_id', null); lsj(PK, null); ME = null; PR = lsj(GK) || {}; home(); };
}
function ring(n, size) {
  var sw = 3.5, r = (size - sw) / 2 - 1, c = 2 * Math.PI * r, p = Math.min(1, n / 10);
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="transform:rotate(-90deg)" aria-hidden="true"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke="var(--line-2)" stroke-width="' + sw + '" fill="none"/>' + (p > 0 ? '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke="' + (n >= PASS ? 'var(--bb-green)' : 'var(--bb-yellow)') + '" stroke-width="' + sw + '" fill="none" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + c * (1 - p) + '"/>' : '') + '</svg>';
}
function chips(cs) { return (cs || []).map(function (c) { return '<span class="chip ' + c + '">' + COL[c] + '</span>'; }).join(''); }
function wTitle(T, w) { var D = CACHE[T.id]; return D && D.weeks && D.weeks[w - 1] ? D.weeks[w - 1].title : ''; }
function weekOpen(T, w) { return PREVIEW || w === 1 || !!(PR[wkKey(T, w - 1)] || {}).done; }

// ── Ctrl/⌘K palette: continue, any unlocked term or week, trainer cards, curriculum, the other journey ──
function palette(cur) {
  if (!(window.ODS && ODS.cmdk)) return;
  var it = [], nx = nextStep();
  if (nx) it.push({ group: 'Continue', icon: '▶', title: 'Continue: ' + label(LIST[nx.i]) + ' · Week ' + nx.w, hint: LIST[nx.i].title + (wTitle(LIST[nx.i], nx.w) ? ' — ' + wTitle(LIST[nx.i], nx.w) : ''), keywords: 'continue next resume', run: function () { var T = LIST[nx.i]; if (T.ext) location.href = T.ext; else week(nx.i, nx.w); } });
  it.push({ group: 'Continue', icon: '🗺', title: MODE === 'ai' ? 'AI Journey map' : 'Journey map', hint: 'All ' + (MODE === 'ai' ? 'levels' : 'years and terms'), keywords: 'home map path', run: home });
  LIST.forEach(function (T, i) {
    if (!unlocked(i)) return;
    if (T.ext) { it.push({ group: MODE === 'ai' ? 'Levels' : 'Terms', icon: '↗', title: label(T) + ': ' + T.title, hint: 'Opens ' + (T.ext === '/' ? 'Scratch Path' : T.ext), keywords: 'term level ' + T.id, href: T.ext }); return; }
    it.push({ group: MODE === 'ai' ? 'Levels' : 'Terms', icon: MODE === 'ai' ? String(T.lv) : 'Y' + T.y, title: label(T) + ': ' + T.title, hint: doneIn(T) + ' of 10 weeks', keywords: 'term level ' + T.id, run: function () { term(i); } });
  });
  var ws = cur != null ? [cur] : LIST.map(function (T, i) { return i; }).filter(function (i) { return unlocked(i) && !LIST[i].ext; });
  ws.forEach(function (i) { var T = LIST[i]; for (var w = 1; w <= 10; w++) { if (!weekOpen(T, w)) break; (function (w) { var t = wTitle(T, w); it.push({ group: 'Weeks' + (cur != null ? ' · ' + label(T) : ''), icon: (PR[wkKey(T, w)] || {}).done ? '✓' : String(w), title: label(T) + ' · Week ' + w + (t ? ': ' + t : ''), hint: T.title, keywords: 'week ' + w + ' ' + T.id, run: function () { week(i, w); } }); })(w); } });
  var tc = cur != null && !LIST[cur].ext ? LIST[cur] : null;
  if (tc) it.push({ group: 'Trainer', icon: '🧑🏽‍🏫', title: 'Trainer cards: ' + label(tc), hint: 'Printable 20-minute session plans', keywords: 'trainer cards print', href: '/journey-trainer?t=' + tc.id });
  if (MODE === 'ai') it.push({ group: 'Trainer', icon: '🧑🏽‍🏫', title: 'Trainer cards: Level 1 (Gen AI)', hint: 'Printable session plans', keywords: 'trainer cards print genai', href: '/genai-trainer' });
  else it.push({ group: 'Trainer', icon: '🧑🏽‍🏫', title: 'Trainer cards: Web Foundations Bridge', hint: 'Printable session plans', keywords: 'trainer cards print webdev', href: '/webdev-trainer' });
  LIST.forEach(function (T) { if (!T.ext && T !== tc) it.push({ group: 'Trainer', icon: '🧑🏽‍🏫', title: 'Trainer cards: ' + label(T), hint: T.title, keywords: 'trainer cards print ' + T.id, href: '/journey-trainer?t=' + T.id }); });
  it.push({ group: 'Places', icon: '▦', title: 'Curriculum map', hint: 'All four years on one page', keywords: 'curriculum years plan', href: '/curriculum' });
  it.push(MODE === 'ai' ? { group: 'Places', icon: '🗺', title: 'The Coding Journey', hint: 'Four years, twelve terms', keywords: 'coding journey', href: '/journey' } : { group: 'Places', icon: '🤖', title: 'The AI Journey', hint: 'Four AI levels — separate path', keywords: 'ai genai journey', href: '/ai-journey' });
  if (MODE === 'code') it.push({ group: 'Places', icon: '💻', title: 'Web Foundations Bridge', hint: 'Shortcut for Year 2 builders', keywords: 'webdev bridge', href: '/webdev' });
  it.push({ group: 'Places', icon: '🏠', title: 'Scratch Path home', href: '/', keywords: 'home scratch' });
  ODS.cmdk(it);
}

// ── HOME: the journey map ──
function nextStep() { // the furthest term that is unlocked and not finished yet (the learner's frontier)
  for (var i = LIST.length - 1; i >= 0; i--) { if (unlocked(i) && !finished(LIST[i]) && !PREVIEW) { var T = LIST[i]; for (var w = 1; w <= 10; w++) { var o = PR[wkKey(T, w)]; if (!(o && o.done)) return { i: i, w: w }; } } }
  return null;
}
function home() {
  who(); window.scrollTo(0, 0); history.replaceState(null, '', location.pathname);
  var fins = LIST.filter(finished).length;
  var h = '<div class="jhero o-glow o-in"><span class="o-eyebrow">' + (MODE === 'ai' ? 'Four levels · separate from coding' : 'Four years · twelve terms') + '</span><h1>' + (MODE === 'ai' ? 'The AI Journey' : 'Your Coding Journey') + '</h1><p class="o-lead">' + (MODE === 'ai'
    ? 'Four levels to become a safe, smart AI builder and leader. This journey is separate from the coding curriculum — you can do both.'
    : 'From your first Scratch sprite to a real capstone product. Finish ' + PASS + ' of 10 weeks in a term to unlock the next one.') + '</p>';
  h += '<div class="meta"><span class="pill' + (fins ? ' ok' : '') + '"><span class="o-num">' + fins + ' of ' + LIST.length + '</span> ' + (MODE === 'ai' ? 'levels' : 'terms') + ' finished</span>' + (PREVIEW ? '<span class="pill warm">👀 Trainer preview</span>' : '') + '</div></div>';
  var nx = nextStep();
  if (nx) { var T = LIST[nx.i], wt = wTitle(T, nx.w); h += '<div class="card cont o-in"><div class="cx"><div class="k">' + (doneIn(T) || nx.w > 1 ? 'Continue' : 'Start here') + '</div><span class="ct">' + esc(label(T)) + ' · ' + esc(T.title) + '</span><span class="cw">Week ' + nx.w + (wt ? ' — ' + esc(wt) : '') + ' · ' + doneIn(T) + ' of 10 done</span></div><button class="btn" id="cont">Continue →</button></div>';
    if (!wt && !T.ext) load(T).then(function (D) { var cw = app.querySelector('.cont .cw'); if (cw && D.weeks[nx.w - 1]) { cw.textContent = 'Week ' + nx.w + ' — ' + D.weeks[nx.w - 1].title + ' · ' + doneIn(T) + ' of 10 done'; palette(); } }).catch(function () {}); }
  else if (doneIn(LIST[LIST.length - 1]) >= PASS) h += '<div class="card cont done"><div class="cx"><div class="k">Complete</div><span class="ct">🎓 You finished the whole journey. Incredible.</span></div></div>';
  if (!ME) h += '<div class="card glogin"><b>Have an access ID?</b><span class="why" style="margin:0">Type it so your journey follows you to any phone.</span><label for="id" class="o-eyebrow" style="margin-top:4px">Access ID</label><input type="text" id="id" placeholder="YWS-4K7M" autocapitalize="characters" autocomplete="off" spellcheck="false"><p class="err" id="e" role="alert"></p><div class="row"><button class="btn" id="go">Open my journey</button><span class="why">or just explore — it saves on this phone.</span></div></div>';
  var groups = MODE === 'ai' ? [{ name: 'Levels', items: LIST.map(function (T, i) { return i; }) }] : [1, 2, 3, 4].map(function (y) { return { name: 'Year ' + y + ' · ' + ['Beginner', 'Intermediate', 'Intermediate', 'Advanced'][y - 1], items: LIST.map(function (T, i) { return T.y === y ? i : -1; }).filter(function (i) { return i >= 0; }) }; });
  groups.forEach(function (G, gi) {
    var gf = G.items.filter(function (i) { return finished(LIST[i]); }).length;
    h += '<div class="yh"><h2>' + esc(G.name) + '</h2><span class="why">' + gf + ' of ' + G.items.length + ' finished</span></div><div class="path">';
    G.items.forEach(function (i, k) {
      var T = LIST[i], n = doneIn(T), op = unlocked(i), fin = n >= PASS, cur = nx && nx.i === i, prevFin = k > 0 && finished(LIST[G.items[k - 1]]);
      h += '<a class="node ' + (fin ? 'fin' : op ? 'open' : 'lock') + (cur ? ' cur' : '') + (prevFin ? ' lk' : '') + '" data-i="' + i + '" role="button" tabindex="0" aria-label="' + esc(label(T) + ': ' + T.title + (op ? '' : ' (locked)')) + '"><span class="rg">' + ring(n, 48) + '<span class="ic">' + (fin ? '✓' : op ? (MODE === 'ai' ? T.lv : T.t) : LOCK) + '</span></span><span class="tx"><span class="k">' + esc(label(T)) + (cur ? '<span class="tag">Up next</span>' : '') + '</span><b>' + esc(T.title) + '</b><small>' + (op ? '<span class="o-num">' + n + ' of 10</span> weeks' + (T.ext ? ' · opens ' + (T.ext === '/' ? 'Scratch Path' : T.ext) + ' ↗' : '') : esc(lockReason(i))) + '</small></span>' + (op ? '<span class="go" aria-hidden="true">›</span>' : '') + '</a>';
      if (MODE === 'code' && T.id === 'y1t3') { var bn = doneIn(BRIDGE); h += '<a class="node side ' + (bn >= PASS ? 'fin' : 'open') + '" href="/webdev"><span class="rg">' + ring(bn, 42) + '<span class="ic">' + (bn >= PASS ? '✓' : '↗') + '</span></span><span class="tx"><span class="k">Shortcut for Year 2 builders</span><b>Web Foundations Bridge</b><small><span class="o-num">' + bn + ' of 10</span> · finishing it also unlocks Year 2</small></span><span class="go" aria-hidden="true">›</span></a>'; }
    });
    h += '</div>';
  });
  h += '<div class="footnote">' + (PREVIEW ? '<span class="pv-on">👀 Trainer preview is on (everything open, nothing unlocks for real).</span> <a href="#" id="pv">Turn off</a>' : '<a href="#" id="pv">Trainer preview: open everything</a>') + (MODE === 'ai' ? '<a href="/journey">See the coding journey →</a>' : '<a href="/ai-journey">See the separate AI Journey →</a><a href="/curriculum">Curriculum map</a>') + '</div>';
  app.innerHTML = h; palette();
  [].forEach.call(app.querySelectorAll('[data-i]'), function (a) { a.onclick = function () { var i = +a.dataset.i; if (!unlocked(i)) return toast(lockReason(i)); var T = LIST[i]; if (T.ext) location.href = T.ext; else term(i); }; a.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.onclick(); } }; });
  document.getElementById('pv').onclick = function (e) { e.preventDefault(); try { if (PREVIEW) sessionStorage.removeItem('bbj_preview'); else { if (!confirm('Trainer preview opens every term so you can check the content. Learners should not use this. Continue?')) return; sessionStorage.setItem('bbj_preview', '1'); } } catch (x) {} location.reload(); };
  var c = document.getElementById('cont'); if (c) c.onclick = function () { var T = LIST[nx.i]; if (T.ext) location.href = T.ext; else week(nx.i, nx.w); };
  var g = document.getElementById('go'); if (g) { g.onclick = function () { login(document.getElementById('id').value).then(function () { toast('Welcome ' + (ME.name || '').split(' ')[0] + '!'); home(); }).catch(function (e) { document.getElementById('e').textContent = e.message; }); }; document.getElementById('id').onkeydown = function (e) { if (e.key === 'Enter') g.onclick(); }; }
}

// ── TERM page ──
function genBanner(D) { return D.generated ? '<div class="gen" role="note"><span class="gi" aria-hidden="true">🤖</span><span><b>Designed by Claude (AI).</b> ' + esc(D.generatedNote || 'This part is not in the official curriculum and is offered for review.') + '</span></div>' : ''; }
var SKEL = '<div class="o-skel" style="height:36px;width:150px;border-radius:99px;margin:14px 0 18px"></div><div class="o-skel" style="height:14px;width:30%;margin:0 0 10px"></div><div class="o-skel" style="height:34px;width:72%;margin:0 0 16px"></div><div class="o-skel" style="height:80px;margin:14px 0"></div><div class="o-skel" style="height:260px;margin:14px 0"></div>';
function backBtn(t) { return '<a href="#" id="back" class="crumb">← ' + esc(t) + '</a>'; }
function term(i) {
  var T = LIST[i];
  app.innerHTML = SKEL;
  load(T).then(function (D) {
    history.replaceState(null, '', '#' + T.id); window.scrollTo(0, 0);
    var n = doneIn(T), h = backBtn(MODE === 'ai' ? 'AI Journey map' : 'Journey map') + '<div class="jhero o-glow o-in" style="padding-top:16px"><div class="k">' + esc(label(T)) + (D.level ? ' · ' + esc(D.level) : '') + '</div><h1>' + esc(D.title) + '</h1>';
    h += '<div class="meta">' + (D.device === 'lab' ? '<span class="pill lab">💻 Lab-day term — needs a computer</span>' : '<span class="pill ok">📱 Works on a phone</span>') + '<span class="pill"><span class="o-num">' + n + ' of 10</span> weeks</span><span class="mbar" title="' + PASS + ' of 10 unlock the next term"><i style="width:' + n * 10 + '%"></i></span><a class="pill" href="/journey-trainer?t=' + T.id + '">🧑🏽‍🏫 Trainer cards</a></div></div>';
    h += genBanner(D) + '<p class="lead2">' + esc(D.intro) + '</p><p class="why" style="margin-top:0">' + PASS + ' of 10 weeks finished unlocks the next ' + (MODE === 'ai' ? 'level' : 'term') + '.</p>';
    if (D.termProject) h += '<div class="card proj"><b>🏁 Term project</b><p style="margin:.3em 0 0;color:var(--text-2)">' + esc(D.termProject) + '</p></div>';
    var lastUnit = null;
    D.weeks.forEach(function (W) {
      if (W.unit !== lastUnit) { h += (lastUnit !== null ? '</div>' : '') + '<h3 class="unit">' + esc(W.unit) + '</h3><div class="wlist">'; lastUnit = W.unit; }
      var o = PR[wkKey(T, W.week)] || {}, op = PREVIEW || W.week === 1 || (PR[wkKey(T, W.week - 1)] || {}).done;
      h += '<a class="wk ' + (o.done ? 'done' : '') + (op ? '' : ' lock') + '" data-w="' + W.week + '" role="button" tabindex="0"><span class="n">' + (o.done ? '✓' : op ? W.week : LOCK) + '</span><span class="wt"><b>' + esc(W.title) + '</b>' + (W.generated ? '<span class="aitag">AI-designed</span>' : '') + '<small>' + (op ? esc(W.goal) : 'Finish Week ' + (W.week - 1) + ' first') + '</small>' + chips(W.colours) + '</span></a>';
    });
    if (lastUnit !== null) h += '</div>';
    if (D.projectBank) h += '<div class="yh"><h2>💡 Capstone project bank</h2></div><div class="bank">' + D.projectBank.map(function (p) { return '<div class="card"><b>' + esc(p.title) + '</b><p class="why" style="margin:.3em 0">' + esc(p.problem) + '</p><small><b>Helps:</b> ' + esc(p.whoItHelps) + ' · <b>Stack:</b> ' + esc(p.suggestedStack) + '</small><p style="margin:.5em 0 0;font-size:.92em">' + esc(p.whyItsAGoodCapstone) + '</p>' + (p.stretchGoal ? '<small>Stretch: ' + esc(p.stretchGoal) + '</small>' : '') + '</div>'; }).join('') + '</div>';
    if (D.assessment) h += '<div class="yh"><h2>📋 How capstones are judged</h2></div><div class="rubw"><table class="rub"><tr><th>Criterion</th><th>Excellent</th><th>Good</th><th>Developing</th></tr>' + D.assessment.map(function (a) { return '<tr><td><b>' + esc(a.criterion) + '</b></td><td>' + esc(a.excellent) + '</td><td>' + esc(a.good) + '</td><td>' + esc(a.developing) + '</td></tr>'; }).join('') + '</table></div>';
    h += '<div style="height:32px"></div>';
    app.innerHTML = h; palette(i);
    document.getElementById('back').onclick = function (e) { e.preventDefault(); home(); };
    [].forEach.call(app.querySelectorAll('[data-w]'), function (a) { a.onclick = function () { var w = +a.dataset.w; if (PREVIEW || w === 1 || (PR[wkKey(T, w - 1)] || {}).done) week(i, w); else toast('Finish Week ' + (w - 1) + ' first 🙂'); }; a.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.onclick(); } }; });
  }).catch(function () { app.innerHTML = backBtn('Journey map') + '<div class="jhero"><div class="k">' + esc(label(T)) + '</div><h1>' + esc(T.title) + '</h1></div><div class="empty">🛠 This term is being prepared. Check back soon.</div>'; document.getElementById('back').onclick = function (e) { e.preventDefault(); home(); }; });
}

// ── WEEK page ──
function runnable(lang, device) { return lang === 'html' || lang === 'css' || lang === 'js' || (lang === 'php' && device !== 'lab' && window.PHPLite); }
function runCode(lang, code, box) {
  if (lang === 'php') { var r = window.PHPLite.run(code); box.innerHTML = '<pre class="code out">' + esc(r.error ? '⚠️ ' + r.error.msg + (r.error.line ? ' (line ' + r.error.line + ')' : '') : r.out) + '</pre>'; return; }
  var src = /<html|<body|<div|<h1|<p|<script|<style|<!doctype/i.test(code) ? code : lang === 'css' ? '<style>' + code + '</style><p>Styled text</p>' : lang === 'js' ? '<script>' + code + '<\/script>' : code;
  box.innerHTML = ''; var f = document.createElement('iframe'); f.className = 'prev'; f.setAttribute('sandbox', 'allow-scripts'); f.srcdoc = src; box.appendChild(f);
}
function sec(cls, icon, title, body) { return '<section class="sec ' + cls + '"><div class="sh"><span class="si" aria-hidden="true">' + icon + '</span><h3>' + title + '</h3></div>' + body + '</section>'; }
function week(i, w) {
  var T = LIST[i];
  app.innerHTML = SKEL;
  load(T).then(function (D) {
    var W = D.weeks[w - 1], k = wkKey(T, w), o = PR[k] || {}, steps = (o.steps || []).slice(), qa = (o.qa || []).slice(), answered = {};
    var notes = lsj('bbj_notes') || {}, mine = lsj('bbj_code') || {};
    history.replaceState(null, '', '#' + T.id + '-w' + w); window.scrollTo(0, 0);
    var h = '<article class="rd">' + backBtn(D.title) + '<div class="jhero o-glow o-in" style="padding-top:16px"><div class="k">' + esc(label(T)) + ' · Week ' + w + ' of 10 · ' + esc(W.unit) + '</div><h1>' + esc(W.title) + '</h1><div class="meta">' + (o.done ? '<span class="pill ok">✓ Done</span>' : '') + (D.device === 'lab' ? '<span class="pill lab">💻 Lab day</span>' : '<span class="pill">📱 Phone-friendly</span>') + chips(W.colours) + '</div></div>';
    if (W.generated) h += '<div class="gen" role="note"><span class="gi" aria-hidden="true">🤖</span><span><b>Designed by Claude (AI)</b> — not in the official curriculum; offered for review.</span></div>';
    h += sec('g', '🎯', 'Goal', '<p class="big">' + esc(W.goal) + '</p>');
    if (W.safe) h += '<div class="safe" role="note"><span aria-hidden="true">🛡</span><div><b>Safe-AI rule</b><p>' + esc(W.safe) + '</p></div></div>';
    h += sec('b', '💡', 'Understand it', '<p>' + esc(W.learn) + '</p>');
    h += sec('r', '🔎', 'Go and find out', '<p><b>' + esc(W.research.q) + '</b></p><p class="why">' + esc(W.research.tip) + '</p><label for="note" class="o-eyebrow" style="display:block;margin:10px 0 6px">Your notes</label><textarea id="note" rows="3" placeholder="What did people tell you? (saved on this phone)">' + esc(notes[k] || '') + '</textarea><label class="ask"><input type="checkbox" id="asked" ' + (steps[0] ? 'checked' : '') + '> I asked real people</label>');
    var B = W.build || {}, code = mine[k] != null ? mine[k] : (B.code || ''), lab = '';
    if (B.code) {
      if (runnable(B.lang, D.device)) lab = '<div class="jlab"><div class="lh"><b>✏️ Try it here</b><span class="lang">' + esc(B.lang) + '</span><span class="sp"></span><button class="btn alt sm" id="reset">Reset</button><button class="btn go sm" id="run">▶ Run</button></div><div class="lg"><div class="lp"><div class="pl"><span class="d"></span>Your code</div><textarea id="code" class="codebox" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code editor">' + esc(code) + '</textarea></div><div class="lp res"><div class="pl"><span class="d"></span>' + (B.lang === 'php' ? 'Output' : 'Preview') + '</div><div id="runout"></div></div></div></div>';
      else lab = (D.device === 'lab' && B.lang && B.lang !== 'none' ? '<div class="labday">💻 <span><b>Lab day.</b> Type this ' + esc(B.lang.toUpperCase()) + ' on a lab computer — read it here first.</span></div>' : '') + '<details class="cblock" open><summary>' + (B.lang && B.lang !== 'none' ? 'The ' + esc(B.lang.toUpperCase()) + ' code' : 'Template') + '<span class="sp"></span><button class="btn alt sm" id="cp" type="button">Copy</button></summary><pre class="code">' + esc(B.code) + '</pre></details>';
    }
    h += sec('c', '🛠', 'Tiny build', '<p><b>' + esc(B.task) + '</b></p><ol class="steps">' + (B.steps || []).map(function (s, j) { return '<li class="' + (steps[j + 1] ? 'on' : '') + '"><label><input type="checkbox" data-s="' + (j + 1) + '" ' + (steps[j + 1] ? 'checked' : '') + '> ' + esc(s) + '</label></li>'; }).join('') + '</ol>' + lab);
    if (W.try) h += sec('b', '🧪', 'Prompt Checker', '<p><b>' + esc(W.try.ask) + '</b></p><p class="why">No live AI — your prompt is checked on this phone and nothing leaves it.</p><textarea id="tp" rows="4" placeholder="Write your prompt here…" aria-label="Your prompt">' + esc((lsj('bbj_try') || {})[k] || '') + '</textarea><button class="btn" id="tpGo" style="margin-top:10px">Check my prompt</button><div id="tpOut" aria-live="polite"></div>');
    h += sec('', '✅', 'Check before you move on', '<p class="why">Get 2 of 3 right to finish the week.</p>' + W.check.map(function (Q, qi) { return '<div class="qz"><b>' + (qi + 1) + '. ' + esc(Q.q) + '</b>' + Q.opts.map(function (t, kk) { return '<button class="opt" data-q="' + qi + '" data-k="' + kk + '">' + esc(t) + '</button>'; }).join('') + '</div>'; }).join(''));
    h += '<div class="say"><span class="k">🗣 Say it like this</span><p>“' + esc(W.say) + '”</p></div><div id="fin" class="finbar" aria-live="polite"></div></article>';
    app.innerHTML = h; palette(i);
    // bind
    document.getElementById('back').onclick = function (e) { e.preventDefault(); term(i); };
    document.getElementById('note').oninput = function () { notes[k] = this.value; lsj('bbj_notes', notes); };
    document.getElementById('asked').onchange = function () { steps[0] = this.checked; save(T, w, { steps: steps }); };
    [].forEach.call(app.querySelectorAll('[data-s]'), function (c) { c.onchange = function () { steps[+c.dataset.s] = c.checked; c.closest('li').className = c.checked ? 'on' : ''; save(T, w, { steps: steps }); }; });
    var run = document.getElementById('run');
    if (run) {
      var ta = document.getElementById('code'), out = document.getElementById('runout');
      ta.oninput = function () { mine[k] = ta.value; lsj('bbj_code', mine); };
      ta.onkeydown = function (e) { if (e.key === 'Tab') { e.preventDefault(); var s = ta.selectionStart; ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 2; } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run.click(); } };
      run.onclick = function () { runCode(B.lang, ta.value, out); if (!steps[10]) { steps[10] = true; save(T, w, { steps: steps }); } };
      document.getElementById('reset').onclick = function () { if (confirm('Go back to the example code?')) { ta.value = B.code; delete mine[k]; lsj('bbj_code', mine); out.innerHTML = ''; } };
    }
    var cp = document.getElementById('cp'); if (cp) cp.onclick = function (e) { e.preventDefault(); e.stopPropagation(); (navigator.clipboard ? navigator.clipboard.writeText(B.code) : Promise.reject()).then(function () { toast('Copied'); }).catch(function () { toast('Press and hold to copy'); }); };
    var tg = document.getElementById('tpGo'); if (tg) bindTry(W, k, T, w, steps);
    [].forEach.call(app.querySelectorAll('[data-q]'), function (b) { b.onclick = function () {
      var qi = +b.dataset.q, kk = +b.dataset.k, Q = W.check[qi]; if (answered[qi]) return; answered[qi] = 1; qa[qi] = kk === Q.a ? 1 : 0;
      [].forEach.call(app.querySelectorAll('[data-q="' + qi + '"]'), function (x) { var z = +x.dataset.k; x.className = 'opt' + (z === Q.a ? ' ok' : z === kk ? ' no' : ''); x.disabled = true; });
      if (kk !== Q.a) toast('Not quite — the green one is right.'); fin();
    }; });
    function fin() {
      var right = qa.filter(Boolean).length, el = document.getElementById('fin'), dots = '<span class="dots" aria-hidden="true">' + [0, 1, 2].map(function (j) { return '<i class="' + (qa[j] ? 'y' : '') + '"></i>'; }).join('') + '</span>';
      if ((PR[k] || {}).done) { el.className = 'finbar ok'; el.innerHTML = '<span class="seal" aria-hidden="true">✓</span><span class="grow"><b>Week ' + w + ' done</b><br><span class="why">Saved' + (ME ? ' to your ID' : ' on this phone') + '.</span></span>' + (w < 10 ? '<button class="btn go" id="nx">Next week →</button>' : '<button class="btn go" id="nx">Back to the map →</button>'); }
      else { el.className = 'finbar'; el.innerHTML = '<span class="grow"><b>Finish Week ' + w + '</b><br><span class="why">' + dots + ' <span class="o-num">' + right + '/3</span> right · need 2</span></span><button class="btn" id="dn" ' + (right >= 2 ? '' : 'disabled') + '>Finish Week ' + w + '</button>'; }
      var d = document.getElementById('dn'); if (d) d.onclick = function () {
        var ob = { done: true, quiz: right, qa: qa, steps: steps };
        var willFinish = doneIn(T) + 1 >= PASS && doneIn(T) < PASS; if (willFinish) ob.badges = [T.id];
        save(T, w, ob); toast(willFinish ? '🎖 ' + label(T) + ' complete — next term unlocked!' : '🎉 Week ' + w + ' done!'); fin(); palette(i);
      };
      var nx = document.getElementById('nx'); if (nx) nx.onclick = function () { if (w < 10) week(i, w + 1); else home(); };
    }
    fin();
  }).catch(function () { app.innerHTML = backBtn('Journey map') + '<div class="empty" style="margin-top:20px">📡 Could not load this week. Check your internet and try again.</div>'; document.getElementById('back').onclick = function (e) { e.preventDefault(); home(); }; });
}
function bindTry(W, k, T, w, steps) {
  var ta = document.getElementById('tp');
  ta.oninput = function () { var d = lsj('bbj_try') || {}; d[k] = ta.value; lsj('bbj_try', d); };
  document.getElementById('tpGo').onclick = function () {
    var text = ta.value.trim(), out = document.getElementById('tpOut'); if (!text) return toast('Write a prompt first 🙂');
    var pv = []; if (/\d[\d\s-]{7,}\d/.test(text)) pv.push('a phone number'); if (/\S+@\S+\.\S+/.test(text)) pv.push('an email address'); if (/\b(i live at|my address is|my home address)\b/i.test(text)) pv.push('a home address');
    if (pv.length) { out.innerHTML = '<div class="pc-stop" role="alert">🛑 <b>Stop!</b> Your prompt has ' + pv.join(' and ') + '. Private stays private — remove it and check again.</div>'; return; }
    var res = W.try.checks.map(function (c) { var r = c.rule || {}, t = text.toLowerCase();
      if (r.any && !r.any.some(function (x) { return t.indexOf(String(x).toLowerCase()) >= 0; })) return false;
      if (r.notRe && new RegExp(r.notRe, 'i').test(text)) return false; if (r.re && !new RegExp(r.re, 'i').test(text)) return false;
      if (r.minWords && text.split(/\s+/).filter(Boolean).length < r.minWords) return false; return true; });
    var n = res.filter(Boolean).length, all = n === res.length;
    out.innerHTML = '<div class="pc-res' + (all ? ' all' : '') + '">' + W.try.checks.map(function (c, j) { return '<div class="ck ' + (res[j] ? 'y' : 'n') + '"><i aria-hidden="true">' + (res[j] ? '✓' : '') + '</i><span>' + esc(c.label) + '<span class="vh">' + (res[j] ? ' (done)' : ' (not yet)') + '</span></span></div>'; }).join('') + '<div class="sc">' + (all ? '🌟 Brilliant prompt!' : n ? '👍 Good start — fix the empty ones.' : 'Try again using the hints.') + '<span class="o-num">' + n + '/' + res.length + '</span></div>' + (all && W.try.best ? '<details style="margin-top:8px"><summary>Compare with an example</summary><p class="why">' + esc(W.try.best) + '</p></details>' : '') + '</div>';
    if (all) { steps[11] = true; save(T, w, { steps: steps }); }
  };
}

// ── boot ──
function route() {
  var m = /^#((?:y[1-4]t[1-3]|ai[2-4]))(?:-w(\d+))?$/.exec(location.hash);
  if (m) { var i = LIST.findIndex(function (T) { return T.id === m[1]; }); if (i >= 0 && unlocked(i)) { if (m[2] && (PREVIEW || +m[2] === 1 || (PR[wkKey(LIST[i], +m[2] - 1)] || {}).done)) return week(i, +m[2]); return term(i); } }
  home();
}
var id = ls('bb_id');
if (id) login(id).then(route).catch(function (e) {
  if (e.http) { ls('bb_id', null); PR = lsj(GK) || {}; } else { var c = lsj(PK); if (c && c.id === id) { ME = { id: c.id, name: c.name, start: c.start }; PR = c.PR || {}; } }
  route();
});
else { PR = lsj(GK) || {}; route(); }
window.addEventListener('online', flush);
var sb = document.getElementById('srch'); if (sb && window.ODS) { sb.onclick = function () { ODS.openCmdk(); }; var kk = sb.querySelector('.o-kbd'); if (kk && /Mac|iP/.test(navigator.platform)) kk.textContent = '⌘K'; }
})();
