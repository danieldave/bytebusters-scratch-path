// Year 2 Web Development track — 10 weeks, progress saved to the learner's access ID (term "wd").
(function () {
var D = null, ME = null, PR = {}, app = document.getElementById('app');
var COL = { blue: 'Variables', red: 'Conditionals', green: 'Loops', purple: 'Events' };
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
function lsj(k, v) { if (v === undefined) { try { return JSON.parse(ls(k) || 'null'); } catch (e) { return null; } } ls(k, v === null ? null : JSON.stringify(v)); }
function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function toast(t) { var e = document.getElementById('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('on'); }, 2200); }
function post(u, o) { return fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }).then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || 'Error'); e.http = r.status; throw e; } return j; }); }); }

// offline queue
function queue(o) { var q = lsj('bbwd_q') || []; q.push(o); lsj('bbwd_q', q); }
function flush() { var q = lsj('bbwd_q') || []; if (!q.length) return; lsj('bbwd_q', []); q.forEach(function (o) { post('/api/progress', o).catch(function (e) { if (!e.http) queue(o); }); }); }

function key(w) { return 'wdw' + w; }
function get(w) { return PR[key(w)] || {}; }
function doneN() { var n = 0; for (var w = 1; w <= 10; w++) if (get(w).done) n++; return n; }
function open(w) { return w === 1 || !!get(w - 1).done; }

function save(w, o) {
  var cur = get(w), next = Object.assign({}, cur, o, { at: Date.now() });
  PR[key(w)] = next;
  if (!ME) { lsj('bbwd_guest', PR); return; }
  lsj('bbwd_prof', { id: ME.id, name: ME.name, PR: PR });
  var payload = { id: ME.id, term: 'wd', week: w };
  ['done', 'quiz', 'qa', 'steps'].forEach(function (k) { if (o[k] !== undefined) payload[k] = o[k]; });
  if (o.badges) payload.badges = o.badges;
  post('/api/progress', payload).catch(function (e) { if (!e.http) { queue(payload); toast('Saved on this phone. It will sync when you are online.'); } else toast('Could not save. Try again.'); });
}

function login(id) {
  return post('/api/login', { id: id }).then(function (j) {
    ME = j; ls('bb_id', j.id); PR = {};
    Object.keys(j.progress || {}).forEach(function (k) { if (/^wdw\d+$/.test(k)) PR[k] = j.progress[k]; });
    // carry over anything done as a guest
    var g = lsj('bbwd_guest'); if (g) { Object.keys(g).forEach(function (k) { if (g[k] && g[k].done && !(PR[k] && PR[k].done)) { var w = +k.slice(3); PR[k] = g[k]; save(w, { done: true, quiz: g[k].quiz, qa: g[k].qa, steps: g[k].steps }); } }); lsj('bbwd_guest', null); }
    lsj('bbwd_prof', { id: ME.id, name: ME.name, PR: PR }); flush();
  });
}
function who() { document.getElementById('who').innerHTML = ME ? esc((ME.name || ME.id).split(' ')[0]) + ' <button id="out">Out</button>' : ''; var o = document.getElementById('out'); if (o) o.onclick = function () { ls('bb_id', null); lsj('bbwd_prof', null); ME = null; PR = lsj('bbwd_guest') || {}; home(); }; }
function chips(cs) { return (cs || []).map(function (c) { return '<span class="chip ' + c + '">' + COL[c] + '</span>'; }).join(''); }

function home() {
  who(); window.scrollTo(0, 0); location.hash = '';
  var n = doneN(), h = '<h1>' + esc(D.title) + '</h1><p class="why">' + esc(D.intro) + '</p>';
  h += '<div class="prog" style="margin:10px 0 4px"><i style="width:' + n * 10 + '%"></i></div><p class="why">' + n + ' of 10 weeks done' + (n === 10 ? ' — 🎖 Web Developer badge!' : '') + '</p>';
  if (!ME) h += '<div class="card"><b>Have an access ID?</b> Type it so your progress follows you to any phone.<input type="text" id="id" placeholder="YWS-4K7M" style="margin-top:8px;text-transform:uppercase;letter-spacing:.12em;text-align:center"><p class="err" id="e"></p><button class="btn" id="go">Save my progress</button> <span class="why">or just start — it saves on this phone.</span></div>';
  h += '<h2>Our real sites (your examples)</h2><div class="ex">' + Object.keys(D.projects).map(function (k) { var p = D.projects[k]; return '<a class="chip grey" style="font-size:14px;padding:6px 12px" href="' + esc(p.url) + '" target="_blank" rel="noopener">↗ ' + esc(p.name) + '</a>'; }).join('') + '</div>';
  h += '<h2>The 10 weeks</h2>';
  D.weeks.forEach(function (W) {
    var o = get(W.week), op = open(W.week);
    h += '<div class="card"><a class="wk ' + (o.done ? 'done' : '') + (op ? '' : ' lock') + '" data-w="' + W.week + '"><span class="n">' + (o.done ? '✓' : op ? W.week : '🔒') + '</span><span><span class="part">' + esc(W.part) + ' · ' + esc(D.projects[W.project].name) + '</span><br><b>' + esc(W.title) + '</b><small>' + (op ? esc(W.goal) : 'Finish Week ' + (W.week - 1) + ' to open this') + '</small>' + chips(W.colours) + '</span></a></div>';
  });
  app.innerHTML = h;
  [].forEach.call(app.querySelectorAll('[data-w]'), function (a) { a.onclick = function () { var w = +a.dataset.w; if (open(w)) week(w); else toast('Finish Week ' + (w - 1) + ' first 🙂'); }; });
  var g = document.getElementById('go'); if (g) g.onclick = function () { var v = document.getElementById('id').value; login(v).then(function () { toast('Welcome ' + (ME.name || '').split(' ')[0] + '!'); home(); }).catch(function (e) { document.getElementById('e').textContent = e.message; }); };
}

function week(w) {
  var W = D.weeks[w - 1], P = D.projects[W.project], o = get(w);
  var steps = (o.steps || []).slice(), qa = (o.qa || []).slice();
  var notes = lsj('bbwd_notes') || {};
  location.hash = 'w' + w; window.scrollTo(0, 0);
  var h = '<p><a href="#" id="back">← All weeks</a></p><div class="part">Week ' + w + ' · ' + esc(W.part) + '</div><h1>' + esc(W.title) + '</h1>' + chips(W.colours);
  h += '<div class="sec"><h3>🎯 Goal</h3><p>' + esc(W.goal) + '</p></div>';
  h += '<div class="sec b"><h3>👀 Look at a real site</h3><p>' + esc(W.look) + '</p><a class="btn alt" href="' + esc(P.url) + '" target="_blank" rel="noopener">Open ' + esc(P.name) + ' ↗</a><p class="why">' + esc(P.job) + '</p></div>';
  h += '<div class="sec r"><h3>🔎 Go and find out</h3><p><b>' + esc(W.research.q) + '</b></p><p class="why">' + esc(W.research.tip) + '</p><textarea id="note" rows="3" placeholder="What did people tell you? (saved on this phone)">' + esc(notes[w] || '') + '</textarea><label style="display:block;margin-top:8px"><input type="checkbox" id="asked" ' + (steps[0] ? 'checked' : '') + '> I asked real people</label></div>';
  h += '<div class="sec c"><h3>🛠 Tiny build</h3><p><b>' + esc(W.build.task) + '</b></p><ol class="steps">' + W.build.steps.map(function (s, i) { return '<li class="' + (steps[i + 1] ? 'on' : '') + '"><label><input type="checkbox" data-s="' + (i + 1) + '" ' + (steps[i + 1] ? 'checked' : '') + '> ' + esc(s) + '</label></li>'; }).join('') + '</ol>';
  if (W.build.code) h += '<details><summary>See the example code</summary><pre class="code" id="code">' + esc(W.build.code) + '</pre><button class="btn alt" id="cp">Copy code</button></details>';
  h += '<p class="why">Try it in the <a href="/studio">Studio Web Creator</a> or any code app.</p></div>';
  h += '<div class="sec"><h3>✅ Check before you move on</h3><p class="why">Get 2 of 3 right to finish the week.</p>' + W.check.map(function (Q, i) { return '<div style="margin:10px 0"><b>' + (i + 1) + '. ' + esc(Q.q) + '</b>' + Q.opts.map(function (t, k) { var cls = qa[i] !== undefined && o.picked && o.picked[i] === k ? (k === Q.a ? ' ok' : ' no') : ''; return '<button class="opt' + cls + '" data-q="' + i + '" data-k="' + k + '">' + esc(t) + '</button>'; }).join('') + '</div>'; }).join('') + '</div>';
  h += '<div class="card" style="border:2px solid var(--brand)"><b>🗣 Say it like this</b><p>"' + esc(W.say) + '"</p></div>';
  h += '<p id="fin"></p>';
  app.innerHTML = h;
  var answered = {};
  function drawFin() {
    var right = qa.filter(Boolean).length, n = Object.keys(answered).length + (o.qa ? o.qa.length : 0);
    var el = document.getElementById('fin');
    if (get(w).done) el.innerHTML = '<span class="chip green">Week ' + w + ' done ✓</span> ' + (w < 10 ? '<button class="btn" id="nx">Next week →</button>' : '<b>🎖 You finished the Web Development track!</b>');
    else el.innerHTML = '<button class="btn" id="done" ' + (right >= 2 ? '' : 'disabled') + '>Finish Week ' + w + '</button> <span class="why">' + right + '/3 right</span>';
    var d = document.getElementById('done'); if (d) d.onclick = function () {
      var ob = { done: true, quiz: right, qa: qa, steps: steps }; if (w === 10) ob.badges = ['webdev'];
      save(w, ob); toast(w === 10 ? '🎖 Web Developer badge!' : '🎉 Week ' + w + ' done!'); drawFin();
    };
    var nx = document.getElementById('nx'); if (nx) nx.onclick = function () { week(w + 1); };
  }
  document.getElementById('back').onclick = function (e) { e.preventDefault(); home(); };
  document.getElementById('note').oninput = function () { notes[w] = this.value; lsj('bbwd_notes', notes); };
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
  drawFin();
}

fetch('/data/webdev.json').then(function (r) { return r.json(); }).then(function (d) {
  D = d;
  var id = ls('bb_id'), start = function () { var m = /^#w(\d+)$/.exec(location.hash); if (m && open(+m[1])) week(+m[1]); else home(); };
  if (id) login(id).then(start).catch(function (e) {
    if (e.http) { ls('bb_id', null); PR = lsj('bbwd_guest') || {}; }
    else { var c = lsj('bbwd_prof'); if (c && c.id === id) { ME = { id: c.id, name: c.name }; PR = c.PR || {}; } }
    start();
  });
  else { PR = lsj('bbwd_guest') || {}; start(); }
}).catch(function () { app.innerHTML = '<p>Could not load. Check your internet and try again.</p>'; });
window.addEventListener('online', flush);
})();
