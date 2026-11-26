// Year 2 Generative AI track — 10 weeks, safety first, progress saved to the learner's access ID (term "ga").
(function () {
var LOCK = '<svg class="lk-i" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-label="Locked"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>';
var D = null, ME = null, PR = {}, app = document.getElementById('app');
var COL = { blue: 'Variables', red: 'Conditionals', green: 'Loops', purple: 'Events' };
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
function lsj(k, v) { if (v === undefined) { try { return JSON.parse(ls(k) || 'null'); } catch (e) { return null; } } ls(k, v === null ? null : JSON.stringify(v)); }
function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function toast(t) { var e = document.getElementById('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('on'); }, 2200); }
function post(u, o) { return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }).then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || 'Error'); e.http = r.status; throw e; } return j; }); }); }

// offline queue
function queue(o) { var q = lsj('bbga_q') || []; q.push(o); lsj('bbga_q', q); }
function flush() { var q = lsj('bbga_q') || []; if (!q.length) return; lsj('bbga_q', []); q.forEach(function (o) { post('/api/progress', o).catch(function (e) { if (!e.http) queue(o); }); }); }

function key(w) { return 'gaw' + w; }
function get(w) { return PR[key(w)] || {}; }
function doneN() { var n = 0; for (var w = 1; w <= 10; w++) if (get(w).done) n++; return n; }
function open(w) { return w === 1 || !!get(w - 1).done; }

function save(w, o) {
  var cur = get(w), next = Object.assign({}, cur, o, { at: Date.now() });
  PR[key(w)] = next;
  if (!ME) { lsj('bbga_guest', PR); return; }
  lsj('bbga_prof', { id: ME.id, name: ME.name, PR: PR });
  var payload = { id: ME.id, term: 'ga', week: w };
  ['done', 'quiz', 'qa', 'steps'].forEach(function (k) { if (o[k] !== undefined) payload[k] = o[k]; });
  if (o.badges) payload.badges = o.badges;
  post('/api/progress', payload).catch(function (e) { if (!e.http) { queue(payload); toast('Saved on this phone. It will sync when you are online.'); } else toast('Could not save. Try again.'); });
}

function login(id) {
  return post('/api/login', { id: id }).then(function (j) {
    ME = j; ls('bb_id', j.id); PR = {};
    Object.keys(j.progress || {}).forEach(function (k) { if (/^gaw\d+$/.test(k)) PR[k] = j.progress[k]; });
    // carry over anything done as a guest
    var g = lsj('bbga_guest'); if (g) { Object.keys(g).forEach(function (k) { if (g[k] && g[k].done && !(PR[k] && PR[k].done)) { var w = +k.slice(3); PR[k] = g[k]; save(w, { done: true, quiz: g[k].quiz, qa: g[k].qa, steps: g[k].steps }); } }); lsj('bbga_guest', null); }
    lsj('bbga_prof', { id: ME.id, name: ME.name, PR: PR }); flush();
  });
}
function who() { document.getElementById('who').innerHTML = ME ? '<span class="nm">' + esc((ME.name || ME.id).split(' ')[0]) + '</span> <button id="out" aria-label="Log out on this phone">Out</button>' : ''; var o = document.getElementById('out'); if (o) o.onclick = function () { ls('bb_id', null); lsj('bbga_prof', null); ME = null; PR = lsj('bbga_guest') || {}; home(); }; }
function chips(cs) { return (cs || []).map(function (c) { return '<span class="chip ' + c + '">' + COL[c] + '</span>'; }).join(''); }

function nextW() { for (var w = 1; w <= 10; w++) if (!get(w).done) return w; return 0; }
function palette() {
  if (!(window.ODS && ODS.cmdk)) return;
  var it = [], nx = nextW();
  if (nx) it.push({ group: 'Continue', icon: '▶', title: (doneN() ? 'Continue' : 'Start') + ': Week ' + nx, hint: D.weeks[nx - 1].title, keywords: 'continue next resume', run: function () { week(nx); } });
  it.push({ group: 'Continue', icon: '☰', title: 'All 10 weeks', hint: D.title, keywords: 'home weeks list', run: home });
  D.weeks.forEach(function (W) { if (open(W.week)) it.push({ group: 'Weeks', icon: get(W.week).done ? '✓' : String(W.week), title: 'Week ' + W.week + ': ' + W.title, hint: W.part, keywords: 'week ' + W.week + ' ' + W.part, run: function () { week(W.week); } }); });
  Object.keys(D.projects).forEach(function (k) { var p = D.projects[k]; it.push({ group: 'Example AI apps', icon: '↗', title: p.name, hint: p.job, href: p.url, keywords: 'example app site' }); });
  it.push({ group: 'Trainer', icon: '🧑🏽‍🏫', title: 'Trainer cards', hint: 'Printable 20-minute session plans', keywords: 'trainer cards print', href: '/genai-trainer' });
  it.push({ group: 'Places', icon: '🤖', title: 'The AI Journey map', hint: 'Levels 2–4', href: '/ai-journey', keywords: 'ai journey levels' });
  it.push({ group: 'Places', icon: '🎮', title: 'Studio Prompt Lab', hint: 'Safe practice AI', href: '/studio', keywords: 'studio prompt lab' });
  it.push({ group: 'Places', icon: '▦', title: 'Curriculum map', href: '/curriculum', keywords: 'curriculum' });
  it.push({ group: 'Places', icon: '🗺', title: 'The Coding Journey', href: '/journey', keywords: 'coding journey' });
  ODS.cmdk(it);
}
function home() {
  who(); window.scrollTo(0, 0); location.hash = '';
  var n = doneN(), nx = nextW(), h = '<div class="jhero o-glow o-in"><span class="o-eyebrow">AI Journey · Level 1</span><h1>' + esc(D.title) + '</h1><p class="o-lead">' + esc(D.intro) + '</p><div class="meta"><span class="pill' + (n ? ' ok' : '') + '"><span class="o-num">' + n + ' of 10</span> weeks done</span><span class="mbar"><i style="width:' + n * 10 + '%"></i></span>' + (n === 10 ? '<span class="pill warm">🎖 Safe AI Builder badge</span>' : '') + '</div></div>';
  if (nx) { var NW = D.weeks[nx - 1]; h += '<div class="card cont o-in"><div class="cx"><div class="k">' + (n ? 'Continue' : 'Start here') + '</div><span class="ct">Week ' + nx + ' · ' + esc(NW.title) + '</span><span class="cw">' + esc(NW.part) + ' · ' + esc(D.projects[NW.project].name) + '</span></div><button class="btn" id="cont">' + (n ? 'Continue' : 'Start') + ' →</button></div>'; }
  else h += '<div class="card cont done"><div class="cx"><div class="k">Complete</div><span class="ct">🎖 All 10 weeks done — Safe AI Builder!</span></div></div>';
  if (!ME) h += '<div class="card glogin"><b>Have an access ID?</b><span class="why" style="margin:0">Type it so your progress follows you to any phone.</span><label for="id" class="o-eyebrow" style="margin-top:4px">Access ID</label><input type="text" id="id" placeholder="YWS-4K7M" autocapitalize="characters" autocomplete="off" spellcheck="false"><p class="err" id="e" role="alert"></p><div class="row"><button class="btn" id="go">Save my progress</button><span class="why">or just start — it saves on this phone.</span></div></div>';
  h += '<div class="yh"><h2>Our real AI apps (your examples)</h2></div><div class="exlink">' + Object.keys(D.projects).map(function (k) { var p = D.projects[k]; return '<a class="pill" href="' + esc(p.url) + '" target="_blank" rel="noopener">↗ ' + esc(p.name) + '</a>'; }).join('') + '</div>';
  var lastP = null;
  D.weeks.forEach(function (W) {
    if (W.part !== lastP) { h += (lastP !== null ? '</div>' : '') + '<h3 class="unit">' + esc(W.part) + '</h3><div class="wlist">'; lastP = W.part; }
    var o = get(W.week), op = open(W.week);
    h += '<a class="wk ' + (o.done ? 'done' : '') + (op ? '' : ' lock') + '" data-w="' + W.week + '" role="button" tabindex="0"><span class="n">' + (o.done ? '✓' : op ? W.week : LOCK) + '</span><span class="wt"><b>' + esc(W.title) + '</b><small>' + esc(D.projects[W.project].name) + ' · ' + (op ? esc(W.goal) : 'Finish Week ' + (W.week - 1) + ' to open this') + '</small>' + chips(W.colours) + '</span></a>';
  });
  h += '</div><div class="footnote"><a href="/ai-journey">The AI Journey map →</a><a href="/studio">Studio Prompt Lab</a><a href="/curriculum">Curriculum map</a></div>';
  app.innerHTML = h; palette();
  [].forEach.call(app.querySelectorAll('[data-w]'), function (a) { a.onclick = function () { var w = +a.dataset.w; if (open(w)) week(w); else toast('Finish Week ' + (w - 1) + ' first 🙂'); }; a.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); a.onclick(); } }; });
  var c = document.getElementById('cont'); if (c) c.onclick = function () { week(nx); };
  var g = document.getElementById('go'); if (g) { g.onclick = function () { var v = document.getElementById('id').value; login(v).then(function () { toast('Welcome ' + (ME.name || '').split(' ')[0] + '!'); home(); }).catch(function (e) { document.getElementById('e').textContent = e.message; }); }; document.getElementById('id').onkeydown = function (e) { if (e.key === 'Enter') g.onclick(); }; }
}


// Prompt Checker — scores the child's prompt with the week's rules. No live AI; nothing leaves the phone.
function tryBox(W, o) {
  if (!W.try) return '';
  var drafts = lsj('bbga_try') || {};
  return '<section class="sec b"><div class="sh"><span class="si" aria-hidden="true">🧪</span><h3>Prompt Checker</h3></div><p><b>' + esc(W.try.ask) + '</b></p><p class="why">No live AI — your prompt is checked on this phone and nothing leaves it.</p><textarea id="tp" rows="4" placeholder="Write your prompt here…" aria-label="Your prompt">' + esc(drafts[W.week] || '') + '</textarea><button class="btn" id="tpGo" style="margin-top:10px">Check my prompt</button><div id="tpOut" aria-live="polite"></div></section>';
}
function rule(r, text) {
  var t = text.toLowerCase();
  if (r.any && !r.any.some(function (x) { return t.indexOf(x) >= 0; })) return false;
  if (r.notRe && new RegExp(r.notRe, 'i').test(text)) return false;
  if (r.re && !new RegExp(r.re, 'i').test(text)) return false;
  if (r.minWords && text.trim().split(/\s+/).filter(Boolean).length < r.minWords) return false;
  return true;
}
function privacyOf(text) {
  var out = [];
  if (/\d[\d\s-]{7,}\d/.test(text)) out.push('a phone number');
  if (/\S+@\S+\.\S+/.test(text)) out.push('an email address');
  if (/\b(i live at|my address is|my home address)\b/i.test(text)) out.push('a home address');
  return out;
}
function bindTry(W, steps, w) {
  var b = document.getElementById('tpGo'); if (!b) return;
  var ta = document.getElementById('tp');
  ta.oninput = function () { var d = lsj('bbga_try') || {}; d[W.week] = ta.value; lsj('bbga_try', d); };
  b.onclick = function () {
    var text = ta.value.trim(), out = document.getElementById('tpOut');
    if (!text) { toast('Write a prompt first 🙂'); return; }
    var pv = privacyOf(text);
    if (pv.length && W.week !== 2) { out.innerHTML = '<div class="pc-stop" role="alert">🛑 <b>Stop!</b> Your prompt has ' + pv.join(' and ') + '. Private stays private — remove it and check again.</div>'; return; }
    var res = W.try.checks.map(function (c) { return rule(c.rule || {}, text); }), n = res.filter(Boolean).length, all = n === res.length;
    out.innerHTML = '<div class="pc-res' + (all ? ' all' : '') + '">' + W.try.checks.map(function (c, i) { return '<div class="ck ' + (res[i] ? 'y' : 'n') + '"><i aria-hidden="true">' + (res[i] ? '✓' : '') + '</i><span>' + esc(c.label) + '<span class="vh">' + (res[i] ? ' (done)' : ' (not yet)') + '</span></span></div>'; }).join('') +
      '<div class="sc">' + (all ? '🌟 Brilliant prompt!' : n ? '👍 Good start — fix the empty ones.' : 'Try again using the hints above.') + '<span class="o-num">' + n + '/' + res.length + '</span></div>' +
      (all ? '<details style="margin-top:8px"><summary>Compare with an example</summary><p class="why">' + esc(W.try.best) + '</p><p class="why">Yours is yours — different is fine if it ticks every box.</p></details>' : '') + '</div>';
    if (all) { steps[11] = true; save(w, { steps: steps }); toast('🌟 Prompt passed!'); }
  };
}

function week(w) {
  var W = D.weeks[w - 1], P = D.projects[W.project], o = get(w);
  var steps = (o.steps || []).slice(), qa = (o.qa || []).slice();
  var notes = lsj('bbga_notes') || {};
  location.hash = 'w' + w; window.scrollTo(0, 0);
  var h = '<article class="rd"><a href="#" id="back" class="crumb">← All weeks</a><div class="jhero o-glow o-in" style="padding-top:16px"><div class="part">Week ' + w + ' of 10 · ' + esc(W.part) + '</div><h1>' + esc(W.title) + '</h1><div class="meta">' + (o.done ? '<span class="pill ok">✓ Done</span>' : '') + '<span class="pill">' + esc(P.name) + '</span>' + chips(W.colours) + '</div></div>';
  h += '<section class="sec g"><div class="sh"><span class="si" aria-hidden="true">🎯</span><h3>Goal</h3></div><p class="big">' + esc(W.goal) + '</p></section>';
  h += '<div class="safe" role="note"><span aria-hidden="true">🛡</span><div><b>Safe-AI rule</b><p>' + esc(W.safe) + '</p></div></div>';
  h += '<section class="sec b"><div class="sh"><span class="si" aria-hidden="true">👀</span><h3>Look at a real AI app</h3></div><p>' + esc(W.look) + '</p><div class="exlink"><a class="btn alt" href="' + esc(P.url) + '" target="_blank" rel="noopener">Open ' + esc(P.name) + ' ↗</a><span class="why">' + esc(P.job) + '</span></div></section>';
  h += '<section class="sec r"><div class="sh"><span class="si" aria-hidden="true">🔎</span><h3>Go and find out</h3></div><p><b>' + esc(W.research.q) + '</b></p><p class="why">' + esc(W.research.tip) + '</p><label for="note" class="o-eyebrow" style="display:block;margin:10px 0 6px">Your notes</label><textarea id="note" rows="3" placeholder="What did people tell you? (saved on this phone)">' + esc(notes[w] || '') + '</textarea><label class="ask"><input type="checkbox" id="asked" ' + (steps[0] ? 'checked' : '') + '> I asked real people</label></section>';
  h += '<section class="sec c"><div class="sh"><span class="si" aria-hidden="true">🛠</span><h3>Tiny build</h3></div><p><b>' + esc(W.build.task) + '</b></p><ol class="steps">' + W.build.steps.map(function (s, i) { return '<li class="' + (steps[i + 1] ? 'on' : '') + '"><label><input type="checkbox" data-s="' + (i + 1) + '" ' + (steps[i + 1] ? 'checked' : '') + '> ' + esc(s) + '</label></li>'; }).join('') + '</ol>';
  if (W.build.code) h += '<details class="cblock"><summary>See the example<span class="sp"></span><button class="btn alt sm" id="cp" type="button">Copy</button></summary><pre class="code" id="code">' + esc(W.build.code) + '</pre></details>';
  h += '<p class="why">Practise more in the <a href="/studio">Studio Prompt Lab</a> (safe practice AI, nothing leaves the phone).</p></section>' + tryBox(W, o) + '';
  h += '<section class="sec "><div class="sh"><span class="si" aria-hidden="true">✅</span><h3>Check before you move on</h3></div><p class="why">Get 2 of 3 right to finish the week.</p>' + W.check.map(function (Q, i) { return '<div class="qz"><b>' + (i + 1) + '. ' + esc(Q.q) + '</b>' + Q.opts.map(function (t, k) { var cls = qa[i] !== undefined && o.picked && o.picked[i] === k ? (k === Q.a ? ' ok' : ' no') : ''; return '<button class="opt' + cls + '" data-q="' + i + '" data-k="' + k + '">' + esc(t) + '</button>'; }).join('') + '</div>'; }).join('') + '</section>';
  h += '<div class="say"><span class="k">🗣 Say it like this</span><p>“' + esc(W.say) + '”</p></div>';
  h += '<div id="fin" class="finbar" aria-live="polite"></div></article>';
  app.innerHTML = h; palette();
  var answered = {};
  function drawFin() {
    var right = qa.filter(Boolean).length, n = Object.keys(answered).length + (o.qa ? o.qa.length : 0);
    var el = document.getElementById('fin');
    var dots = '<span class="dots" aria-hidden="true">' + [0, 1, 2].map(function (j) { return '<i class="' + (qa[j] ? 'y' : '') + '"></i>'; }).join('') + '</span>';
    if (get(w).done) { el.className = 'finbar ok'; el.innerHTML = '<span class="seal" aria-hidden="true">✓</span><span class="grow"><b>Week ' + w + ' done</b><br><span class="why">Saved' + (ME ? ' to your ID' : ' on this phone') + '.</span></span>' + (w < 10 ? '<button class="btn go" id="nx">Next week →</button>' : '<b>🎖 You finished the Generative AI track — Safe AI Builder!</b>'); }
    else { el.className = 'finbar'; el.innerHTML = '<span class="grow"><b>Finish Week ' + w + '</b><br><span class="why">' + dots + ' <span class="o-num">' + right + '/3</span> right · need 2</span></span><button class="btn" id="done" ' + (right >= 2 ? '' : 'disabled') + '>Finish Week ' + w + '</button>'; }
    var d = document.getElementById('done'); if (d) d.onclick = function () {
      var ob = { done: true, quiz: right, qa: qa, steps: steps }; if (w === 10) ob.badges = ['genai'];
      save(w, ob); palette(); toast(w === 10 ? '🎖 Safe AI Builder badge!' : '🎉 Week ' + w + ' done!'); drawFin();
    };
    var nx = document.getElementById('nx'); if (nx) nx.onclick = function () { week(w + 1); };
  }
  document.getElementById('back').onclick = function (e) { e.preventDefault(); home(); };
  document.getElementById('note').oninput = function () { notes[w] = this.value; lsj('bbga_notes', notes); };
  document.getElementById('asked').onchange = function () { steps[0] = this.checked; save(w, { steps: steps }); };
  [].forEach.call(app.querySelectorAll('[data-s]'), function (c) { c.onchange = function () { steps[+c.dataset.s] = c.checked; c.closest('li').className = c.checked ? 'on' : ''; save(w, { steps: steps }); }; });
  var cp = document.getElementById('cp'); if (cp) cp.onclick = function (e) { e.preventDefault(); e.stopPropagation(); var t = W.build.code; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('Copied'); }).catch(function () { toast('Press and hold the code to copy'); }); };
  [].forEach.call(app.querySelectorAll('[data-q]'), function (b) { b.onclick = function () {
    var i = +b.dataset.q, k = +b.dataset.k, Q = W.check[i];
    if (answered[i]) return; answered[i] = 1; qa[i] = k === Q.a ? 1 : 0;
    [].forEach.call(app.querySelectorAll('[data-q="' + i + '"]'), function (x) { var kk = +x.dataset.k; x.className = 'opt' + (kk === Q.a ? ' ok' : kk === k ? ' no' : ''); x.disabled = true; });
    if (k !== Q.a) toast('Not quite — the green one is right.');
    drawFin();
  }; });
  bindTry(W, steps, w);
  drawFin();
}

fetch('/data/genai.json').then(function (r) { return r.json(); }).then(function (d) {
  D = d;
  var id = ls('bb_id'), start = function () { var m = /^#w(\d+)$/.exec(location.hash); if (m && open(+m[1])) week(+m[1]); else home(); };
  if (id) login(id).then(start).catch(function (e) {
    if (e.http) { ls('bb_id', null); PR = lsj('bbga_guest') || {}; }
    else { var c = lsj('bbga_prof'); if (c && c.id === id) { ME = { id: c.id, name: c.name }; PR = c.PR || {}; } }
    start();
  });
  else { PR = lsj('bbga_guest') || {}; start(); }
}).catch(function () { app.innerHTML = '<div class="empty" style="margin-top:28px">📡 Could not load. Check your internet and try again.<br><br><button class="btn" onclick="location.reload()">Try again</button></div>'; });
window.addEventListener('online', flush);
var sb = document.getElementById('srch'); if (sb && window.ODS) { sb.onclick = function () { ODS.openCmdk(); }; var kk = sb.querySelector('.o-kbd'); if (kk && /Mac|iP/.test(navigator.platform)) kk.textContent = '⌘K'; }
})();
