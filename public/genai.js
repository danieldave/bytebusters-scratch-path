// Year 2 Generative AI track — 10 weeks, safety first, progress saved to the learner's access ID (term "ga").
(function () {
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
function who() { document.getElementById('who').innerHTML = ME ? esc((ME.name || ME.id).split(' ')[0]) + ' <button id="out">Out</button>' : ''; var o = document.getElementById('out'); if (o) o.onclick = function () { ls('bb_id', null); lsj('bbga_prof', null); ME = null; PR = lsj('bbga_guest') || {}; home(); }; }
function chips(cs) { return (cs || []).map(function (c) { return '<span class="chip ' + c + '">' + COL[c] + '</span>'; }).join(''); }

function home() {
  who(); window.scrollTo(0, 0); location.hash = '';
  var n = doneN(), h = '<h1>' + esc(D.title) + '</h1><p class="why">' + esc(D.intro) + '</p>';
  h += '<div class="prog" style="margin:10px 0 4px"><i style="width:' + n * 10 + '%"></i></div><p class="why">' + n + ' of 10 weeks done' + (n === 10 ? ' — 🎖 Safe AI Builder badge!' : '') + '</p>';
  if (!ME) h += '<div class="card"><b>Have an access ID?</b> Type it so your progress follows you to any phone.<input type="text" id="id" placeholder="YWS-4K7M" style="margin-top:8px;text-transform:uppercase;letter-spacing:.12em;text-align:center"><p class="err" id="e"></p><button class="btn" id="go">Save my progress</button> <span class="why">or just start — it saves on this phone.</span></div>';
  h += '<h2>Our real AI apps (your examples)</h2><div class="ex">' + Object.keys(D.projects).map(function (k) { var p = D.projects[k]; return '<a class="chip grey" style="font-size:14px;padding:6px 12px" href="' + esc(p.url) + '" target="_blank" rel="noopener">↗ ' + esc(p.name) + '</a>'; }).join('') + '</div>';
  h += '<h2>The 10 weeks</h2>';
  D.weeks.forEach(function (W) {
    var o = get(W.week), op = open(W.week);
    h += '<div class="card"><a class="wk ' + (o.done ? 'done' : '') + (op ? '' : ' lock') + '" data-w="' + W.week + '"><span class="n">' + (o.done ? '✓' : op ? W.week : '🔒') + '</span><span><span class="part">' + esc(W.part) + ' · ' + esc(D.projects[W.project].name) + '</span><br><b>' + esc(W.title) + '</b><small>' + (op ? esc(W.goal) : 'Finish Week ' + (W.week - 1) + ' to open this') + '</small>' + chips(W.colours) + '</span></a></div>';
  });
  app.innerHTML = h;
  [].forEach.call(app.querySelectorAll('[data-w]'), function (a) { a.onclick = function () { var w = +a.dataset.w; if (open(w)) week(w); else toast('Finish Week ' + (w - 1) + ' first 🙂'); }; });
  var g = document.getElementById('go'); if (g) g.onclick = function () { var v = document.getElementById('id').value; login(v).then(function () { toast('Welcome ' + (ME.name || '').split(' ')[0] + '!'); home(); }).catch(function (e) { document.getElementById('e').textContent = e.message; }); };
}


// Prompt Checker — scores the child's prompt with the week's rules. No live AI; nothing leaves the phone.
function tryBox(W, o) {
  if (!W.try) return '';
  var drafts = lsj('bbga_try') || {};
  return '<div class="sec b"><h3>🧪 Prompt Checker</h3><p><b>' + esc(W.try.ask) + '</b></p><textarea id="tp" rows="4" placeholder="Write your prompt here…">' + esc(drafts[W.week] || '') + '</textarea><button class="btn" id="tpGo" style="margin-top:8px">Check my prompt</button><div id="tpOut"></div></div>';
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
    if (pv.length && W.week !== 2) { out.innerHTML = '<div class="card" style="border:2px solid var(--red)">🛑 <b>Stop!</b> Your prompt has ' + pv.join(' and ') + '. Private stays private — remove it and check again.</div>'; return; }
    var res = W.try.checks.map(function (c) { return rule(c.rule || {}, text); }), n = res.filter(Boolean).length, all = n === res.length;
    out.innerHTML = '<div class="card">' + W.try.checks.map(function (c, i) { return '<div>' + (res[i] ? '✅' : '⬜') + ' ' + esc(c.label) + '</div>'; }).join('') +
      '<p style="margin:.6em 0 0"><b>' + (all ? '🌟 Brilliant prompt! ' : n ? '👍 Good start — fix the ⬜ ones. ' : 'Try again using the hints above. ') + n + '/' + res.length + '</b></p>' +
      (all ? '<details><summary>Compare with an example</summary><p class="why">' + esc(W.try.best) + '</p><p class="why">Yours is yours — different is fine if it ticks every box.</p></details>' : '') + '</div>';
    if (all) { steps[11] = true; save(w, { steps: steps }); toast('🌟 Prompt passed!'); }
  };
}

function week(w) {
  var W = D.weeks[w - 1], P = D.projects[W.project], o = get(w);
  var steps = (o.steps || []).slice(), qa = (o.qa || []).slice();
  var notes = lsj('bbga_notes') || {};
  location.hash = 'w' + w; window.scrollTo(0, 0);
  var h = '<p><a href="#" id="back">← All weeks</a></p><div class="part">Week ' + w + ' · ' + esc(W.part) + '</div><h1>' + esc(W.title) + '</h1>' + chips(W.colours);
  h += '<div class="sec"><h3>🎯 Goal</h3><p>' + esc(W.goal) + '</p></div>';
  h += '<div class="card" style="border:2px solid var(--red);margin:12px 0"><b>🛡 Safe-AI rule</b><p style="margin:.3em 0 0">' + esc(W.safe) + '</p></div>';
  h += '<div class="sec b"><h3>👀 Look at a real AI app</h3><p>' + esc(W.look) + '</p><a class="btn alt" href="' + esc(P.url) + '" target="_blank" rel="noopener">Open ' + esc(P.name) + ' ↗</a><p class="why">' + esc(P.job) + '</p></div>';
  h += '<div class="sec r"><h3>🔎 Go and find out</h3><p><b>' + esc(W.research.q) + '</b></p><p class="why">' + esc(W.research.tip) + '</p><textarea id="note" rows="3" placeholder="What did people tell you? (saved on this phone)">' + esc(notes[w] || '') + '</textarea><label style="display:block;margin-top:8px"><input type="checkbox" id="asked" ' + (steps[0] ? 'checked' : '') + '> I asked real people</label></div>';
  h += '<div class="sec c"><h3>🛠 Tiny build</h3><p><b>' + esc(W.build.task) + '</b></p><ol class="steps">' + W.build.steps.map(function (s, i) { return '<li class="' + (steps[i + 1] ? 'on' : '') + '"><label><input type="checkbox" data-s="' + (i + 1) + '" ' + (steps[i + 1] ? 'checked' : '') + '> ' + esc(s) + '</label></li>'; }).join('') + '</ol>';
  if (W.build.code) h += '<details><summary>See the example</summary><pre class="code" id="code">' + esc(W.build.code) + '</pre><button class="btn alt" id="cp">Copy</button></details>';
  h += '<p class="why">Practise more in the <a href="/studio">Studio Prompt Lab</a> (safe practice AI, nothing leaves the phone).</p></div>' + tryBox(W, o) + '';
  h += '<div class="sec"><h3>✅ Check before you move on</h3><p class="why">Get 2 of 3 right to finish the week.</p>' + W.check.map(function (Q, i) { return '<div style="margin:10px 0"><b>' + (i + 1) + '. ' + esc(Q.q) + '</b>' + Q.opts.map(function (t, k) { var cls = qa[i] !== undefined && o.picked && o.picked[i] === k ? (k === Q.a ? ' ok' : ' no') : ''; return '<button class="opt' + cls + '" data-q="' + i + '" data-k="' + k + '">' + esc(t) + '</button>'; }).join('') + '</div>'; }).join('') + '</div>';
  h += '<div class="card" style="border:2px solid var(--brand)"><b>🗣 Say it like this</b><p>"' + esc(W.say) + '"</p></div>';
  h += '<p id="fin"></p>';
  app.innerHTML = h;
  var answered = {};
  function drawFin() {
    var right = qa.filter(Boolean).length, n = Object.keys(answered).length + (o.qa ? o.qa.length : 0);
    var el = document.getElementById('fin');
    if (get(w).done) el.innerHTML = '<span class="chip green">Week ' + w + ' done ✓</span> ' + (w < 10 ? '<button class="btn" id="nx">Next week →</button>' : '<b>🎖 You finished the Generative AI track — Safe AI Builder!</b>');
    else el.innerHTML = '<button class="btn" id="done" ' + (right >= 2 ? '' : 'disabled') + '>Finish Week ' + w + '</button> <span class="why">' + right + '/3 right</span>';
    var d = document.getElementById('done'); if (d) d.onclick = function () {
      var ob = { done: true, quiz: right, qa: qa, steps: steps }; if (w === 10) ob.badges = ['genai'];
      save(w, ob); toast(w === 10 ? '🎖 Safe AI Builder badge!' : '🎉 Week ' + w + ' done!'); drawFin();
    };
    var nx = document.getElementById('nx'); if (nx) nx.onclick = function () { week(w + 1); };
  }
  document.getElementById('back').onclick = function (e) { e.preventDefault(); home(); };
  document.getElementById('note').oninput = function () { notes[w] = this.value; lsj('bbga_notes', notes); };
  document.getElementById('asked').onchange = function () { steps[0] = this.checked; save(w, { steps: steps }); };
  [].forEach.call(app.querySelectorAll('[data-s]'), function (c) { c.onchange = function () { steps[+c.dataset.s] = c.checked; c.closest('li').className = c.checked ? 'on' : ''; save(w, { steps: steps }); }; });
  var cp = document.getElementById('cp'); if (cp) cp.onclick = function () { var t = W.build.code; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('Copied'); }).catch(function () { toast('Press and hold the code to copy'); }); };
  [].forEach.call(app.querySelectorAll('[data-q]'), function (b) { b.onclick = function () {
    var i = +b.dataset.q, k = +b.dataset.k, Q = W.check[i];
    if (answered[i]) return; answered[i] = 1; qa[i] = k === Q.a ? 1 : 0;
    [].forEach.call(app.querySelectorAll('[data-q="' + i + '"]'), function (x) { var kk = +x.dataset.k; x.className = 'opt' + (kk === Q.a ? ' ok' : kk === k ? ' no' : ''); });
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
}).catch(function () { app.innerHTML = '<p>Could not load. Check your internet and try again.</p>'; });
window.addEventListener('online', flush);
})();
