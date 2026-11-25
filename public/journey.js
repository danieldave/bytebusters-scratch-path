/* ByteBusters Journey engine — one engine, two journeys:
   window.JMODE = 'code' → the official 4-year coding curriculum (Year 1 in Scratch Path, Years 2–4 here)
   window.JMODE = 'ai'   → the separate Generative AI Journey (Level 1 at /genai, Levels 2–4 here)
   Progress saves to the learner's access ID (keys like y2t1w3 / ai2w5) and unlocks the next term.
   A term counts as finished at PASS weeks done. Trainers can set a learner's starting point in Admin. */
(function () {
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
  el.innerHTML = ME ? esc((ME.name || ME.id).split(' ')[0]) + ' <button id="out">Out</button>' : '';
  var o = document.getElementById('out'); if (o) o.onclick = function () { ls('bb_id', null); lsj(PK, null); ME = null; PR = lsj(GK) || {}; home(); };
}
function ring(n, size) {
  var r = (size - 8) / 2, c = 2 * Math.PI * r, p = Math.min(1, n / 10);
  return '<svg width="' + size + '" height="' + size + '" style="transform:rotate(-90deg)"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke="var(--line)" stroke-width="6" fill="none"/><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke="' + (n >= PASS ? 'var(--green)' : 'var(--brand)') + '" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + c * (1 - p) + '"/></svg>';
}
function chips(cs) { return (cs || []).map(function (c) { return '<span class="chip ' + c + '">' + COL[c] + '</span>'; }).join(''); }

// ── HOME: the journey map ──
function nextStep() { // the furthest term that is unlocked and not finished yet (the learner's frontier)
  for (var i = LIST.length - 1; i >= 0; i--) { if (unlocked(i) && !finished(LIST[i]) && !PREVIEW) { var T = LIST[i]; for (var w = 1; w <= 10; w++) { var o = PR[wkKey(T, w)]; if (!(o && o.done)) return { i: i, w: w }; } } }
  return null;
}
function home() {
  who(); window.scrollTo(0, 0); history.replaceState(null, '', location.pathname);
  var h = '<h1>' + (MODE === 'ai' ? '🤖 The AI Journey' : '🗺 Your Coding Journey') + '</h1><p class="why">' + (MODE === 'ai'
    ? 'Four levels to become a safe, smart AI builder and leader. This journey is separate from the coding curriculum — you can do both.'
    : 'Four years, twelve terms — from your first Scratch sprite to a real capstone product. Finish ' + PASS + ' of 10 weeks in a term to unlock the next one.') + '</p>';
  var nx = nextStep();
  if (nx) { var T = LIST[nx.i]; h += '<div class="card cont"><div><div class="k">Continue</div><b>' + esc(label(T)) + ' · ' + esc(T.title) + '</b><br><span class="why">Week ' + nx.w + '</span></div><button class="btn" id="cont">Go →</button></div>'; }
  else if (doneIn(LIST[LIST.length - 1]) >= PASS) h += '<div class="card cont"><b>🎓 You finished the whole journey. Incredible.</b></div>';
  if (!ME) h += '<div class="card"><b>Have an access ID?</b> Type it so your journey follows you to any phone.<input type="text" id="id" placeholder="YWS-4K7M" style="margin-top:8px;text-transform:uppercase;letter-spacing:.12em;text-align:center"><p class="err" id="e"></p><button class="btn" id="go">Open my journey</button> <span class="why">or just explore — it saves on this phone.</span></div>';
  var groups = MODE === 'ai' ? [{ name: 'Levels', items: LIST.map(function (T, i) { return i; }) }] : [1, 2, 3, 4].map(function (y) { return { name: 'Year ' + y + ' · ' + ['Beginner', 'Intermediate', 'Intermediate', 'Advanced'][y - 1], items: LIST.map(function (T, i) { return T.y === y ? i : -1; }).filter(function (i) { return i >= 0; }) }; });
  groups.forEach(function (G, gi) {
    h += '<h2 class="yh">' + esc(G.name) + '</h2><div class="path">';
    G.items.forEach(function (i) {
      var T = LIST[i], n = doneIn(T), op = unlocked(i), fin = n >= PASS;
      h += '<a class="node ' + (fin ? 'fin' : op ? 'open' : 'lock') + '" data-i="' + i + '"><span class="rg">' + ring(n, 54) + '<span class="ic">' + (fin ? '✓' : op ? (MODE === 'ai' ? T.lv : T.t) : '🔒') + '</span></span><span class="tx"><span class="k">' + esc(label(T)) + '</span><b>' + esc(T.title) + '</b><small>' + (op ? n + ' of 10 weeks' + (T.ext ? ' · opens ' + (T.ext === '/' ? 'Scratch Path' : T.ext) : '') : esc(lockReason(i))) + '</small></span></a>';
      if (MODE === 'code' && T.id === 'y1t3') { var bn = doneIn(BRIDGE); h += '<a class="node side ' + (bn >= PASS ? 'fin' : 'open') + '" href="/webdev"><span class="rg">' + ring(bn, 46) + '<span class="ic">↗</span></span><span class="tx"><span class="k">Shortcut for Year 2 builders</span><b>Web Foundations Bridge</b><small>' + bn + ' of 10 · finishing it also unlocks Year 2</small></span></a>'; }
    });
    h += '</div>';
  });
  h += '<p class="why" style="margin-top:18px">' + (PREVIEW ? '👀 Trainer preview is on (everything open, nothing unlocks for real). <a href="#" id="pv">Turn off</a><br>' : '<a href="#" id="pv">Trainer preview: open everything</a><br>') + (MODE === 'ai' ? '<a href="/journey">See the coding journey →</a>' : '<a href="/ai-journey">See the separate AI Journey →</a> · <a href="/curriculum">Curriculum map</a>') + '</p>';
  app.innerHTML = h;
  [].forEach.call(app.querySelectorAll('[data-i]'), function (a) { a.onclick = function () { var i = +a.dataset.i; if (!unlocked(i)) return toast(lockReason(i)); var T = LIST[i]; if (T.ext) location.href = T.ext; else term(i); }; });
  document.getElementById('pv').onclick = function (e) { e.preventDefault(); try { if (PREVIEW) sessionStorage.removeItem('bbj_preview'); else { if (!confirm('Trainer preview opens every term so you can check the content. Learners should not use this. Continue?')) return; sessionStorage.setItem('bbj_preview', '1'); } } catch (x) {} location.reload(); };
  var c = document.getElementById('cont'); if (c) c.onclick = function () { var T = LIST[nx.i]; if (T.ext) location.href = T.ext; else week(nx.i, nx.w); };
  var g = document.getElementById('go'); if (g) g.onclick = function () { login(document.getElementById('id').value).then(function () { toast('Welcome ' + (ME.name || '').split(' ')[0] + '!'); home(); }).catch(function (e) { document.getElementById('e').textContent = e.message; }); };
}

// ── TERM page ──
function genBanner(D) { return D.generated ? '<div class="gen">🤖 <b>Designed by Claude (AI).</b> ' + esc(D.generatedNote || 'This part is not in the official curriculum and is offered for review.') + '</div>' : ''; }
function term(i) {
  var T = LIST[i];
  app.innerHTML = '<p>Loading…</p>';
  load(T).then(function (D) {
    history.replaceState(null, '', '#' + T.id); window.scrollTo(0, 0);
    var n = doneIn(T), h = '<p><a href="#" id="back">← Journey map</a></p><div class="k">' + esc(label(T)) + ' · ' + esc(D.level || '') + '</div><h1>' + esc(D.title) + '</h1>';
    h += '<div class="row"><span class="chip ' + (D.device === 'lab' ? 'grey' : 'green') + '">' + (D.device === 'lab' ? '💻 Lab-day term — needs a computer' : '📱 Works on a phone') + '</span> <span class="why">' + n + ' of 10 weeks · ' + PASS + ' unlock the next term</span> <a class="chip grey" href="/journey-trainer?t=' + T.id + '">Trainer cards</a></div>';
    h += genBanner(D) + '<p>' + esc(D.intro) + '</p>';
    if (D.termProject) h += '<div class="card" style="border:2px solid var(--brand)"><b>🏁 Term project</b><p style="margin:.3em 0 0">' + esc(D.termProject) + '</p></div>';
    var lastUnit = '';
    D.weeks.forEach(function (W) {
      if (W.unit !== lastUnit) { h += '<h3 class="unit">' + esc(W.unit) + '</h3>'; lastUnit = W.unit; }
      var o = PR[wkKey(T, W.week)] || {}, op = W.week === 1 || (PR[wkKey(T, W.week - 1)] || {}).done;
      h += '<div class="card"><a class="wk ' + (o.done ? 'done' : '') + (op ? '' : ' lock') + '" data-w="' + W.week + '"><span class="n">' + (o.done ? '✓' : op ? W.week : '🔒') + '</span><span><b>' + esc(W.title) + '</b>' + (W.generated ? ' <span class="chip grey">AI-designed</span>' : '') + '<small>' + (op ? esc(W.goal) : 'Finish Week ' + (W.week - 1) + ' first') + '</small>' + chips(W.colours) + '</span></a></div>';
    });
    if (D.projectBank) h += '<h2>💡 Capstone project bank</h2>' + D.projectBank.map(function (p) { return '<div class="card"><b>' + esc(p.title) + '</b><p class="why" style="margin:.3em 0">' + esc(p.problem) + '</p><small><b>Helps:</b> ' + esc(p.whoItHelps) + ' · <b>Stack:</b> ' + esc(p.suggestedStack) + '</small><p style="margin:.4em 0 0;font-size:.92em">' + esc(p.whyItsAGoodCapstone) + '</p>' + (p.stretchGoal ? '<small class="why">Stretch: ' + esc(p.stretchGoal) + '</small>' : '') + '</div>'; }).join('');
    if (D.assessment) h += '<h2>📋 How capstones are judged</h2><div style="overflow:auto"><table class="rub"><tr><th>Criterion</th><th>Excellent</th><th>Good</th><th>Developing</th></tr>' + D.assessment.map(function (a) { return '<tr><td><b>' + esc(a.criterion) + '</b></td><td>' + esc(a.excellent) + '</td><td>' + esc(a.good) + '</td><td>' + esc(a.developing) + '</td></tr>'; }).join('') + '</table></div>';
    app.innerHTML = h;
    document.getElementById('back').onclick = function (e) { e.preventDefault(); home(); };
    [].forEach.call(app.querySelectorAll('[data-w]'), function (a) { a.onclick = function () { var w = +a.dataset.w; if (w === 1 || (PR[wkKey(T, w - 1)] || {}).done) week(i, w); else toast('Finish Week ' + (w - 1) + ' first 🙂'); }; });
  }).catch(function () { app.innerHTML = '<p><a href="#" id="back">← Journey map</a></p><h1>' + esc(T.title) + '</h1><p class="why">This term is being prepared. Check back soon.</p>'; document.getElementById('back').onclick = function (e) { e.preventDefault(); home(); }; });
}

// ── WEEK page ──
function runnable(lang) { return lang === 'html' || lang === 'css' || lang === 'js' || (lang === 'php' && window.PHPLite); }
function runCode(lang, code, box) {
  if (lang === 'php') { var r = window.PHPLite.run(code); box.innerHTML = '<pre class="code out">' + esc(r.error ? '⚠️ ' + r.error.msg + (r.error.line ? ' (line ' + r.error.line + ')' : '') : r.out) + '</pre>'; return; }
  var src = /<html|<body|<div|<h1|<p|<script|<style|<!doctype/i.test(code) ? code : lang === 'css' ? '<style>' + code + '</style><p>Styled text</p>' : lang === 'js' ? '<script>' + code + '<\/script>' : code;
  box.innerHTML = ''; var f = document.createElement('iframe'); f.className = 'prev'; f.setAttribute('sandbox', 'allow-scripts'); f.srcdoc = src; box.appendChild(f);
}
function week(i, w) {
  var T = LIST[i];
  load(T).then(function (D) {
    var W = D.weeks[w - 1], k = wkKey(T, w), o = PR[k] || {}, steps = (o.steps || []).slice(), qa = (o.qa || []).slice(), answered = {};
    var notes = lsj('bbj_notes') || {}, mine = lsj('bbj_code') || {};
    history.replaceState(null, '', '#' + T.id + '-w' + w); window.scrollTo(0, 0);
    var h = '<p><a href="#" id="back">← ' + esc(D.title) + '</a></p><div class="k">' + esc(label(T)) + ' · Week ' + w + ' · ' + esc(W.unit) + '</div><h1>' + esc(W.title) + '</h1>' + chips(W.colours);
    if (W.generated) h += '<div class="gen">🤖 <b>Designed by Claude (AI)</b> — not in the official curriculum; offered for review.</div>';
    h += '<div class="sec"><h3>🎯 Goal</h3><p>' + esc(W.goal) + '</p></div>';
    if (W.safe) h += '<div class="card" style="border:2px solid var(--red)"><b>🛡 Safe-AI rule</b><p style="margin:.3em 0 0">' + esc(W.safe) + '</p></div>';
    h += '<div class="sec b"><h3>💡 Understand it</h3><p>' + esc(W.learn) + '</p></div>';
    h += '<div class="sec r"><h3>🔎 Go and find out</h3><p><b>' + esc(W.research.q) + '</b></p><p class="why">' + esc(W.research.tip) + '</p><textarea id="note" rows="3" placeholder="What did people tell you? (saved on this phone)">' + esc(notes[k] || '') + '</textarea><label style="display:block;margin-top:8px"><input type="checkbox" id="asked" ' + (steps[0] ? 'checked' : '') + '> I asked real people</label></div>';
    var B = W.build || {}, code = mine[k] != null ? mine[k] : (B.code || '');
    h += '<div class="sec c"><h3>🛠 Tiny build</h3><p><b>' + esc(B.task) + '</b></p><ol class="steps">' + (B.steps || []).map(function (s, j) { return '<li class="' + (steps[j + 1] ? 'on' : '') + '"><label><input type="checkbox" data-s="' + (j + 1) + '" ' + (steps[j + 1] ? 'checked' : '') + '> ' + esc(s) + '</label></li>'; }).join('') + '</ol>';
    if (B.code) {
      if (runnable(B.lang)) h += '<div class="lab"><div class="row"><b>✏️ Try it here</b><span class="sp"></span><button class="btn alt sm" id="reset">Reset</button> <button class="btn sm" id="run">▶ Run</button></div><textarea id="code" class="codebox" spellcheck="false">' + esc(code) + '</textarea><div id="runout"></div></div>';
      else h += '<details open><summary>' + (B.lang && B.lang !== 'none' ? 'The ' + esc(B.lang.toUpperCase()) + ' code' + (D.device === 'lab' ? ' — type it on a lab computer' : '') : 'Template') + '</summary><pre class="code">' + esc(B.code) + '</pre><button class="btn alt sm" id="cp">Copy</button></details>';
    }
    h += '</div>';
    if (W.try) h += '<div class="sec b"><h3>🧪 Prompt Checker</h3><p><b>' + esc(W.try.ask) + '</b></p><textarea id="tp" rows="4" placeholder="Write your prompt here…">' + esc((lsj('bbj_try') || {})[k] || '') + '</textarea><button class="btn" id="tpGo" style="margin-top:8px">Check my prompt</button><div id="tpOut"></div></div>';
    h += '<div class="sec"><h3>✅ Check before you move on</h3><p class="why">Get 2 of 3 right to finish the week.</p>' + W.check.map(function (Q, qi) { return '<div style="margin:10px 0"><b>' + (qi + 1) + '. ' + esc(Q.q) + '</b>' + Q.opts.map(function (t, kk) { return '<button class="opt" data-q="' + qi + '" data-k="' + kk + '">' + esc(t) + '</button>'; }).join('') + '</div>'; }).join('') + '</div>';
    h += '<div class="card" style="border:2px solid var(--brand)"><b>🗣 Say it like this</b><p>"' + esc(W.say) + '"</p></div><p id="fin"></p>';
    app.innerHTML = h;
    // bind
    document.getElementById('back').onclick = function (e) { e.preventDefault(); term(i); };
    document.getElementById('note').oninput = function () { notes[k] = this.value; lsj('bbj_notes', notes); };
    document.getElementById('asked').onchange = function () { steps[0] = this.checked; save(T, w, { steps: steps }); };
    [].forEach.call(app.querySelectorAll('[data-s]'), function (c) { c.onchange = function () { steps[+c.dataset.s] = c.checked; c.closest('li').className = c.checked ? 'on' : ''; save(T, w, { steps: steps }); }; });
    var run = document.getElementById('run');
    if (run) {
      var ta = document.getElementById('code'), out = document.getElementById('runout');
      ta.oninput = function () { mine[k] = ta.value; lsj('bbj_code', mine); };
      ta.onkeydown = function (e) { if (e.key === 'Tab') { e.preventDefault(); var s = ta.selectionStart; ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 2; } };
      run.onclick = function () { runCode(B.lang, ta.value, out); if (!steps[10]) { steps[10] = true; save(T, w, { steps: steps }); } };
      document.getElementById('reset').onclick = function () { if (confirm('Go back to the example code?')) { ta.value = B.code; delete mine[k]; lsj('bbj_code', mine); out.innerHTML = ''; } };
    }
    var cp = document.getElementById('cp'); if (cp) cp.onclick = function () { (navigator.clipboard ? navigator.clipboard.writeText(B.code) : Promise.reject()).then(function () { toast('Copied'); }).catch(function () { toast('Press and hold to copy'); }); };
    var tg = document.getElementById('tpGo'); if (tg) bindTry(W, k, T, w, steps);
    [].forEach.call(app.querySelectorAll('[data-q]'), function (b) { b.onclick = function () {
      var qi = +b.dataset.q, kk = +b.dataset.k, Q = W.check[qi]; if (answered[qi]) return; answered[qi] = 1; qa[qi] = kk === Q.a ? 1 : 0;
      [].forEach.call(app.querySelectorAll('[data-q="' + qi + '"]'), function (x) { var z = +x.dataset.k; x.className = 'opt' + (z === Q.a ? ' ok' : z === kk ? ' no' : ''); });
      if (kk !== Q.a) toast('Not quite — the green one is right.'); fin();
    }; });
    function fin() {
      var right = qa.filter(Boolean).length, el = document.getElementById('fin');
      if ((PR[k] || {}).done) el.innerHTML = '<span class="chip green">Week ' + w + ' done ✓</span> ' + (w < 10 ? '<button class="btn" id="nx">Next week →</button>' : '<button class="btn" id="nx">Back to the map →</button>');
      else el.innerHTML = '<button class="btn" id="dn" ' + (right >= 2 ? '' : 'disabled') + '>Finish Week ' + w + '</button> <span class="why">' + right + '/3 right</span>';
      var d = document.getElementById('dn'); if (d) d.onclick = function () {
        var ob = { done: true, quiz: right, qa: qa, steps: steps };
        var willFinish = doneIn(T) + 1 >= PASS && doneIn(T) < PASS; if (willFinish) ob.badges = [T.id];
        save(T, w, ob); toast(willFinish ? '🎖 ' + label(T) + ' complete — next term unlocked!' : '🎉 Week ' + w + ' done!'); fin();
      };
      var nx = document.getElementById('nx'); if (nx) nx.onclick = function () { if (w < 10) week(i, w + 1); else home(); };
    }
    fin();
  });
}
function bindTry(W, k, T, w, steps) {
  var ta = document.getElementById('tp');
  ta.oninput = function () { var d = lsj('bbj_try') || {}; d[k] = ta.value; lsj('bbj_try', d); };
  document.getElementById('tpGo').onclick = function () {
    var text = ta.value.trim(), out = document.getElementById('tpOut'); if (!text) return toast('Write a prompt first 🙂');
    var pv = []; if (/\d[\d\s-]{7,}\d/.test(text)) pv.push('a phone number'); if (/\S+@\S+\.\S+/.test(text)) pv.push('an email address'); if (/\b(i live at|my address is|my home address)\b/i.test(text)) pv.push('a home address');
    if (pv.length) { out.innerHTML = '<div class="card" style="border:2px solid var(--red)">🛑 <b>Stop!</b> Your prompt has ' + pv.join(' and ') + '. Private stays private — remove it and check again.</div>'; return; }
    var res = W.try.checks.map(function (c) { var r = c.rule || {}, t = text.toLowerCase();
      if (r.any && !r.any.some(function (x) { return t.indexOf(String(x).toLowerCase()) >= 0; })) return false;
      if (r.notRe && new RegExp(r.notRe, 'i').test(text)) return false; if (r.re && !new RegExp(r.re, 'i').test(text)) return false;
      if (r.minWords && text.split(/\s+/).filter(Boolean).length < r.minWords) return false; return true; });
    var n = res.filter(Boolean).length, all = n === res.length;
    out.innerHTML = '<div class="card">' + W.try.checks.map(function (c, j) { return '<div>' + (res[j] ? '✅' : '⬜') + ' ' + esc(c.label) + '</div>'; }).join('') + '<p style="margin:.6em 0 0"><b>' + (all ? '🌟 Brilliant prompt! ' : n ? '👍 Good start — fix the ⬜ ones. ' : 'Try again using the hints. ') + n + '/' + res.length + '</b></p>' + (all && W.try.best ? '<details><summary>Compare with an example</summary><p class="why">' + esc(W.try.best) + '</p></details>' : '') + '</div>';
    if (all) { steps[11] = true; save(T, w, { steps: steps }); }
  };
}

// ── boot ──
function route() {
  var m = /^#((?:y[1-4]t[1-3]|ai[2-4]))(?:-w(\d+))?$/.exec(location.hash);
  if (m) { var i = LIST.findIndex(function (T) { return T.id === m[1]; }); if (i >= 0 && unlocked(i)) { if (m[2] && (+m[2] === 1 || (PR[wkKey(LIST[i], +m[2] - 1)] || {}).done)) return week(i, +m[2]); return term(i); } }
  home();
}
var id = ls('bb_id');
if (id) login(id).then(route).catch(function (e) {
  if (e.http) { ls('bb_id', null); PR = lsj(GK) || {}; } else { var c = lsj(PK); if (c && c.id === id) { ME = { id: c.id, name: c.name, start: c.start }; PR = c.PR || {}; } }
  route();
});
else { PR = lsj(GK) || {}; route(); }
window.addEventListener('online', flush);
})();
