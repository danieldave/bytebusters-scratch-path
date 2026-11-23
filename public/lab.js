/* ByteBusters Code Lab: phone-friendly editor, live preview, auto-checked missions.
   Used by Terms 2 and 3. Tests run in a hidden sandboxed frame (HTML), a Web Worker (JavaScript) or the
   PHP-lite runner, so a child's code can never touch the site, and a never-ending loop can be stopped. */
(function () {
'use strict';
var BB = null; // helpers from app.js
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fill(s, th) {
  if (s == null) return s;
  var sum = th.items.reduce(function (a, x) { return a + x[1]; }, 0);
  var map = { SHOP: th.SHOP, TAG: th.TAG, CLR: th.CLR, PSUM: sum };
  th.items.forEach(function (it, i) { map['I' + (i + 1)] = it[0]; map['P' + (i + 1)] = '₦' + it[1]; map['P' + (i + 1) + 'n'] = it[1]; });
  return String(s).replace(/\{\{(\w+)\}\}/g, function (m, k) { return k in map ? map[k] : m; });
}

/* ---------------- runner code that lives INSIDE the sandboxed frame ---------------- */
function frameRunner() {
  var OUT = [], ERR = [], SRC = '', VIS = window.__BBVIS, pend = {};
  function fmt(a) { return [].map.call(a, function (x) { if (typeof x === 'string') return x; try { return typeof x === 'object' ? JSON.stringify(x) : String(x); } catch (e) { return String(x); } }).join(' '); }
  function send(o) { o.bb = 1; parent.postMessage(o, '*'); }
  ['log', 'info', 'warn', 'error'].forEach(function (k) { console[k] = function () { var s = fmt(arguments); OUT.push(s); if (VIS) send({ type: 'log', level: k, text: s }); }; });
  window.addEventListener('error', function (e) { var m = e.message || 'Error'; ERR.push(m); if (VIS) send({ type: 'error', msg: m, line: e.lineno }); });
  window.addEventListener('unhandledrejection', function (e) { var m = String(e.reason && e.reason.message || e.reason); ERR.push(m); if (VIS) send({ type: 'error', msg: m, line: 0 }); });
  var AF = Object.getPrototypeOf(async function () { }).constructor;
  function mkT() {
    var t = { src: window.__BBSRC || '', out: OUT, errors: ERR, error: null, doc: document, w: window };
    t.$ = function (s) { return document.querySelector(s); };
    t.all = function (s) { return [].slice.call(document.querySelectorAll(s)); };
    t.has = function (s) { return !!t.$(s); };
    t.count = function (s) { return t.all(s).length; };
    t.text = function (s) { var e = t.$(s); return e ? e.textContent.trim() : ''; };
    t.attr = function (s, a) { var e = t.$(s); return e ? e.getAttribute(a) : null; };
    t.css = function (s, p) { var e = t.$(s); return e ? getComputedStyle(e).getPropertyValue(p).trim() : ''; };
    t.num = function (s, p) { return parseFloat(t.css(s, p)) || 0; };
    t.mq = function () { var r = []; [].forEach.call(document.styleSheets, function (ss) { try { [].forEach.call(ss.cssRules, function (x) { if (x.type === 4) r.push(x.conditionText || x.media.mediaText); }); } catch (e) { } }); return r; };
    t.wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    t.click = async function (s) { var e = t.$(s); if (e) e.click(); await t.wait(30); };
    t.type = function (s, v) { var e = t.$(s); if (!e) return; e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
    t.submit = async function (s) { var f = t.$(s); if (!f) return false; var ev = new Event('submit', { bubbles: true, cancelable: true }); f.dispatchEvent(ev); await t.wait(30); return ev.defaultPrevented; };
    t.v = function (n) { try { return (0, eval)(n); } catch (e) { return undefined; } };
    t.call = function (n) { var a = [].slice.call(arguments, 1); try { return (0, eval)(n).apply(null, a); } catch (e) { return undefined; } };
    t.at = function (w, fn) { return new Promise(function (res) { var rid = Math.random(); pend[rid] = function () { setTimeout(async function () { var r; try { r = await fn(); } catch (e) { r = false; } var rid2 = Math.random(); pend[rid2] = function () { res(r); }; send({ type: 'resize', w: null, rid: rid2 }); }, 80); }; send({ type: 'resize', w: w, rid: rid }); }); };
    return t;
  }
  window.addEventListener('message', async function (ev) {
    var d = ev.data; if (!d || !d.bb) return;
    if (d.type === 'resized') { var f = pend[d.rid]; delete pend[d.rid]; if (f) f(); return; }
    if (d.type === 'runtests') {
      var t = mkT(), res = [];
      for (var i = 0; i < d.tests.length; i++) { var ok = false, err = ''; try { ok = !!(await new AF('t', d.tests[i].code)(t)); } catch (e) { err = String(e && e.message || e); } res.push({ ok: ok, err: err }); }
      send({ type: 'results', res: res, id: d.id });
    }
  });
  window.addEventListener('load', function () { setTimeout(function () { send({ type: 'ready' }); }, 120); });
}
function oneLine(fn) { return '(' + fn.toString().replace(/\s*\n\s*/g, ' ') + ')();'; }

/* ---------------- Worker code for plain JavaScript labs ---------------- */
function workerCode() {
  var OUT = [], ERR = [];
  function fmt(a) { return [].map.call(a, function (x) { if (typeof x === 'string') return x; try { return typeof x === 'object' ? JSON.stringify(x) : String(x); } catch (e) { return String(x); } }).join(' '); }
  ['log', 'info', 'warn', 'error'].forEach(function (k) { console[k] = function () { OUT.push(fmt(arguments)); }; });
  var AF = Object.getPrototypeOf(async function () { }).constructor;
  self.onmessage = async function (ev) {
    var d = ev.data, err = null;
    try { importScripts(URL.createObjectURL(new Blob([d.code], { type: 'text/javascript' }))); }
    catch (e) { var m = /:(\d+):\d+/.exec(String(e && e.stack || '')); err = { msg: String(e && e.message || e), line: m ? Number(m[1]) : 0 }; ERR.push(err.msg); }
    var t = { src: d.code, out: OUT, errors: ERR, error: err };
    t.v = function (n) { try { return (0, eval)(n); } catch (e) { return undefined; } };
    t.call = function (n) { var a = [].slice.call(arguments, 1); try { return (0, eval)(n).apply(null, a); } catch (e) { return undefined; } };
    t.wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var res = [];
    for (var i = 0; i < d.tests.length; i++) { var ok = false, er = ''; try { ok = !!(await new AF('t', d.tests[i].code)(t)); } catch (e) { er = String(e && e.message || e); } res.push({ ok: ok, err: er }); }
    postMessage({ out: OUT, err: err, res: res });
  };
}
var WORKER_URL = null;
function workerUrl() { if (!WORKER_URL) WORKER_URL = URL.createObjectURL(new Blob(['(' + workerCode.toString() + ')();'], { type: 'text/javascript' })); return WORKER_URL; }

/* ---------------- page builders ---------------- */
function absAssets(code) { var o = location.origin; return code.replace(/(src|href)=(["'])assets\//g, '$1=$2' + o + '/assets/').replace(/url\((["']?)assets\//g, 'url($1' + o + '/assets/'); }
function buildHtml(code, visible) {
  var inj = '<script>window.__BBVIS=' + (visible ? 'true' : 'false') + ';window.__BBSRC=' + JSON.stringify(code).replace(/</g, '\\u003c') + ';</script><script>' + oneLine(frameRunner) + '</script>';
  var src = absAssets(code), m = /^\s*<!doctype[^>]*>/i.exec(src);
  return m ? src.slice(0, m[0].length) + inj + src.slice(m[0].length) : inj + src;
}
function buildPhpPage(out) { return '<!doctype html><meta charset="utf-8"><body style="font:16px monospace;white-space:pre-wrap;padding:8px">' + esc(out); }

/* ---------------- the lab UI ---------------- */
var SYMS = ['<', '>', '/', '=', '"', "'", '(', ')', '{', '}', '[', ']', ';', ':', '.', ',', '#', '$', '&&', '||', '!', '+', '*', '%', '\\n', 'Tab'];
var SYMS_BY = { html: ['<', '>', '/', '=', '"', '{', '}', ':', ';', '#', '.', '(', ')', '[', ']', "'", '+', 'Tab'], js: ['(', ')', '{', '}', '[', ']', '"', "'", '`', '${}', ';', '=', '+', '-', '*', '/', '%', '<', '>', '&&', '||', '!', '.', ',', 'Tab'], php: ['$', ';', '(', ')', '{', '}', '[', ']', '"', "'", '.', '=', '>', '<', '+', '-', '*', '%', '!', '&&', '||', '\\n', ',', 'Tab'] };

function renderLab(root, term, L, theme, ctx) {
  var key = (term === 't1' ? 'w' : term + 'w') + L.week, kind = L.kind;
  var starter = fill(L.starter, theme), solution = fill(L.solution, theme);
  var missions = L.missions.map(function (m) { return { say: fill(m.say, theme), hint: fill(m.hint, theme), code: fill(m.test, theme) }; });
  var responsive = L.chips.indexOf('Responsive') >= 0;
  var h = '';
  h += '<section class="lab" id="lab">';
  h += '<div class="lab-head"><b>🧪 Code Lab</b><span class="mcount" id="mcount">0/' + missions.length + '</span><span class="sp"></span>' +
    '<button class="mini" id="run">▶ Run</button><button class="mini" id="reset" title="Back to the starting code">↺</button><button class="mini" id="save" title="Save as a file">⬇</button></div>';
  h += '<div class="lab-tabs" id="tabs"><button data-p="code" class="on">✏️ Code</button><button data-p="result">👀 ' + (kind === 'html' ? 'Page' : 'Output') + '</button><button data-p="miss">✅ Missions <i id="tabm">0/' + missions.length + '</i></button></div>';
  h += '<div class="lab-grid" id="grid" data-p="code">';
  h += '<div class="pane pcode"><div class="shelf" id="shelf">' + L.shelf.map(function (s, i) { return '<button class="chipbtn" data-i="' + i + '">' + esc(s.l) + '</button>'; }).join('') + '</div>' +
    '<div class="edwrap"><pre class="gut" id="gut" aria-hidden="true">1</pre><textarea id="ed" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" wrap="off" aria-label="Code editor"></textarea></div>' +
    '<div class="syms" id="syms">' + (SYMS_BY[kind] || SYMS).map(function (s) { return '<button data-s="' + esc(s) + '">' + (s === '\\n' ? '\\n' : esc(s)) + '</button>'; }).join('') + '</div>' +
    '<div class="errbar" id="errbar" role="status"></div></div>';
  h += '<div class="pane presult">';
  if (kind === 'html') {
    h += (responsive ? '<div class="wsel" id="wsel"><button data-w="360" class="on">📱 360</button><button data-w="600">▭ 600</button><button data-w="900">💻 900</button></div>' : '') +
      '<div class="frame-box" id="fbox"><iframe id="vis" sandbox="allow-scripts" title="Your page"></iframe></div>' +
      '<details class="cons"><summary>Console <i id="ncons">0</i></summary><pre id="cons">Nothing yet. console.log("hi") shows here.</pre></details>';
  } else h += '<pre class="outbox" id="outbox">Press Run.</pre>';
  h += '</div>';
  h += '<div class="pane pmiss"><ol class="missions" id="mlist">' + missions.map(function (m, i) {
    return '<li data-i="' + i + '"><span class="mi" aria-hidden="true">○</span><div class="mt"><div>' + esc(m.say) + '</div><button class="hintbtn" data-h="' + i + '">💡 Hint</button><div class="hint" id="hint' + i + '" hidden>' + esc(m.hint) + '</div></div></li>';
  }).join('') + '</ol><div id="win" class="win" hidden>🎉 <b>Lab complete!</b> Every mission is green.</div>' +
    '<div class="peek"><button class="btn alt" id="peek" hidden>I am stuck: show me the answer</button><div id="peekbox" hidden><p class="why">Read it, then type it yourself so it sticks. You can also copy it in.</p><pre class="answer" id="answer"></pre><button class="btn alt" id="copyin">Copy it into my editor</button></div></div></div>';
  h += '</div></section><iframe id="hid" sandbox="allow-scripts" title="checker" aria-hidden="true" tabindex="-1" style="position:fixed;left:-10000px;top:0;width:400px;height:700px;border:0;visibility:hidden"></iframe>';
  root.innerHTML = h;

  var $ = function (i) { return root.querySelector('#' + i); };
  var ed = $('ed'), gut = $('gut'), grid = $('grid'), vis = $('vis'), hid = $('hid'), errbar = $('errbar');
  var passes = missions.map(function () { return false; }), runs = 0, peeked = false, token = 0, timer = null, saveTimer = null, lastPassed = -1, everWon = false;
  var P = ctx.progress() || {}; if (P.lab && P.lab.peeked) peeked = true;

  /* ----- load code: local first, then server ----- */
  var LS = 'bbcode:' + ctx.id + ':' + key;
  function lget() { try { return JSON.parse(localStorage.getItem(LS) || 'null'); } catch (e) { return null; } }
  function lset(code) { try { localStorage.setItem(LS, JSON.stringify({ c: code, t: Date.now() })); } catch (e) { } }
  var loc = lget(); ed.value = loc ? loc.c : starter; renderGut();
  ctx.loadServer(key).then(function (s) { if (s && s.code && (!loc || s.t > loc.t) && s.code !== ed.value) { ed.value = s.code; lset(s.code); renderGut(); schedule(0); } }).catch(function () { });

  function renderGut() { var n = ed.value.split('\n').length, a = []; for (var i = 1; i <= n; i++) a.push(i); gut.textContent = a.join('\n'); gut.scrollTop = ed.scrollTop; }
  ed.addEventListener('scroll', function () { gut.scrollTop = ed.scrollTop; });
  ed.addEventListener('input', function () { renderGut(); lset(ed.value); schedule(800); syncServer(); });
  ed.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') { e.preventDefault(); insert('  '); return; }
    if (e.key === 'Enter') { var v = ed.value, s = ed.selectionStart, ls = v.lastIndexOf('\n', s - 1) + 1, ind = /^[ \t]*/.exec(v.slice(ls, s))[0]; var prev = v.slice(ls, s).trim(); if (/[{(\[>]$/.test(prev) && !/^<(\/|!|meta|link|img|br|input)/.test(prev) && /\{$|\($|\[$/.test(prev)) ind += '  '; e.preventDefault(); insert('\n' + ind); }
  });
  function insert(text) {
    var caret = text.indexOf('|'); if (caret >= 0 && text.charAt(caret) === '|') { var t2 = text.slice(0, caret) + text.slice(caret + 1); } else { caret = -1; t2 = text; }
    var s = ed.selectionStart, e = ed.selectionEnd, v = ed.value;
    ed.value = v.slice(0, s) + t2 + v.slice(e);
    var pos = s + (caret >= 0 ? caret : t2.length); ed.setSelectionRange(pos, pos);
    renderGut(); lset(ed.value); schedule(800); syncServer();
  }
  // snippet shelf and symbol bar: pointerdown + preventDefault keeps the phone keyboard open
  $('shelf').addEventListener('pointerdown', function (e) { var b = e.target.closest('button'); if (!b) return; e.preventDefault(); ed.focus(); insert(L.shelf[+b.dataset.i].i.replace(/\\n/g, '\n')); });
  $('syms').addEventListener('pointerdown', function (e) {
    var b = e.target.closest('button'); if (!b) return; e.preventDefault(); ed.focus(); var s = b.dataset.s;
    if (s === 'Tab') insert('  '); else if (s === '\\n') insert('\\n'); else if (s === '${}') insert('${|}'); else if (s === '"' || s === "'" || s === '`') insert(s + '|' + s); else if (s === '(') insert('(|)'); else if (s === '{') insert('{|}'); else if (s === '[') insert('[|]'); else insert(s);
  });

  /* ----- tabs (phone) ----- */
  $('tabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; setTab(b.dataset.p); });
  function setTab(p) { grid.dataset.p = p; [].forEach.call($('tabs').children, function (x) { x.className = x.dataset.p === p ? 'on' : ''; }); if (p === 'result' && kind === 'html') fit(); }
  var wsel = $('wsel'), vw = responsive ? 360 : 0;
  if (wsel) wsel.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; vw = +b.dataset.w; [].forEach.call(wsel.children, function (x) { x.className = x === b ? 'on' : ''; }); fit(); });
  function fit() {
    if (kind !== 'html') return; var box = $('fbox'), cw = box.clientWidth || 320, w = vw || cw, s = Math.min(1, cw / w);
    vis.style.width = w + 'px'; vis.style.height = Math.round(380 / s) + 'px'; vis.style.transform = 'scale(' + s + ')'; vis.style.transformOrigin = '0 0'; box.style.height = Math.round(380) + 'px';
  }
  window.addEventListener('resize', fit);

  /* ----- run ----- */
  function schedule(ms) { clearTimeout(timer); timer = setTimeout(run, ms); }
  $('run').onclick = function () { clearTimeout(timer); run(); if (matchMedia('(max-width: 899px)').matches) setTab('result'); };
  $('reset').onclick = function () { var b = $('reset'); if (b.dataset.c !== '1') { b.dataset.c = '1'; b.textContent = 'Sure?'; setTimeout(function () { b.dataset.c = ''; b.textContent = '↺'; }, 2500); return; } b.dataset.c = ''; b.textContent = '↺'; ed.value = starter; renderGut(); lset(starter); schedule(0); syncServer(); };
  $('save').onclick = function () { var ext = kind === 'php' ? 'php' : kind === 'js' ? 'js' : 'html'; var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ed.value], { type: 'text/plain' })); a.download = 'my-' + key + '.' + ext; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); };

  var logs = []; function showCons() { var c = $('cons'); if (!c) return; c.textContent = logs.length ? logs.join('\n') : 'Nothing yet. console.log("hi") shows here.'; $('ncons').textContent = logs.length; }
  function showErr(msg, line) { errbar.innerHTML = msg ? '⚠️ ' + (line ? 'Line ' + line + ': ' : '') + esc(msg) : ''; errbar.className = 'errbar' + (msg ? ' on' : ''); }
  function apply(res, phase) {
    runs++;
    res.forEach(function (r, i) { passes[i] = !!r.ok; });
    var n = passes.filter(Boolean).length;
    [].forEach.call($('mlist').children, function (li, i) { var ok = passes[i]; li.className = ok ? 'ok' : ''; var ic = li.querySelector('.mi'); var was = ic.textContent; ic.textContent = ok ? '✓' : '○'; if (ok && was !== '✓') li.classList.add('pop'); });
    $('mcount').textContent = n + '/' + missions.length; $('tabm').textContent = n + '/' + missions.length;
    var won = n === missions.length; $('win').hidden = !won;
    $('peek').hidden = !(runs >= 2 && !won);
    if (n !== lastPassed) { lastPassed = n; ctx.onLab({ passed: n, total: missions.length, peeked: peeked }, won && !everWon); if (won) everWon = true; }
  }
  function run() {
    var code = ed.value, my = ++token; showErr('');
    if (kind === 'php') {
      var r = window.PHPLite.run(code); var out = r.out, err = r.error;
      $('outbox').innerHTML = (out ? esc(out) : '<span class="why">Nothing printed yet. Use echo to print.</span>') + (err ? '\n<span class="oerr">' + esc(err.msg) + (err.line ? ' (line ' + err.line + ')' : '') + '</span>' : '');
      showErr(err ? err.msg : '', err ? err.line : 0);
      var t = { src: code, out: out, lines: out.split('\n'), error: err ? err.msg : null };
      t.eval = function (extra) { var x = window.PHPLite.run(code + '\n?>@@S@@<?php ' + extra); return x.error ? '' : x.out.split('@@S@@').pop().trim(); };
      var res = missions.map(function (m) { try { return { ok: !!(new Function('t', m.code)(t)) }; } catch (e) { return { ok: false, err: String(e) }; } });
      apply(res); return;
    }
    if (kind === 'js') {
      var box = $('outbox'); box.textContent = 'Running…';
      var w = new Worker(workerUrl()), done = false;
      var kill = setTimeout(function () { if (done) return; done = true; w.terminate(); if (my !== token) return; box.innerHTML = '<span class="oerr">Your code ran for too long. Maybe a loop never stops? Check the condition and make sure something changes inside it.</span>'; showErr('This looks like a loop that never stops.', 0); apply(missions.map(function () { return { ok: false }; })); }, 2500);
      w.onmessage = function (ev) { if (done) return; done = true; clearTimeout(kill); w.terminate(); if (my !== token) return; var d = ev.data; box.innerHTML = (d.out.length ? esc(d.out.join('\n')) : '<span class="why">Nothing printed yet. Use console.log(...).</span>') + (d.err ? '\n<span class="oerr">' + esc(d.err.msg) + '</span>' : ''); showErr(d.err ? d.err.msg : '', d.err ? d.err.line : 0); apply(d.res); };
      w.onerror = function (e) { if (done) return; done = true; clearTimeout(kill); w.terminate(); box.innerHTML = '<span class="oerr">' + esc(e.message || 'Error') + '</span>'; showErr(e.message || 'Error', e.lineno); apply(missions.map(function () { return { ok: false }; })); e.preventDefault && e.preventDefault(); };
      w.postMessage({ code: code, tests: missions.map(function (m) { return { code: m.code }; }) });
      return;
    }
    // html: visible frame + hidden checker frame
    logs = []; showCons(); fit();
    vis.srcdoc = buildHtml(code, true);
    hid.style.width = '400px'; hid.srcdoc = buildHtml(code, false); hid._ready = false;
    hid._tok = my; hid._run = function () { hid.contentWindow.postMessage({ bb: 1, type: 'runtests', id: my, tests: missions.map(function (m) { return { code: m.code }; }) }, '*'); };
    clearTimeout(hid._kill); hid._kill = setTimeout(function () { if (my === token && !hid._got) apply(missions.map(function () { return { ok: false }; })); }, 6000); hid._got = false;
  }
  function onMsg(ev) {
    var d = ev.data; if (!d || !d.bb) return;
    if (ev.source === vis.contentWindow) {
      if (d.type === 'log') { logs.push(d.text); if (logs.length > 200) logs.shift(); showCons(); }
      if (d.type === 'error') { showErr(d.msg, d.line ? Math.max(1, d.line - lineOffset()) : 0); logs.push('⚠ ' + d.msg); showCons(); }
    } else if (ev.source === hid.contentWindow) {
      if (d.type === 'ready' && !hid._ready) { hid._ready = true; if (hid._tok === token) hid._run(); }
      else if (d.type === 'results' && d.id === token) { hid._got = true; clearTimeout(hid._kill); apply(d.res); }
      else if (d.type === 'resize') { hid.style.width = (d.w || 400) + 'px'; setTimeout(function () { hid.contentWindow.postMessage({ bb: 1, type: 'resized', rid: d.rid }, '*'); }, 30); }
    }
  }
  function lineOffset() { return 0; }
  window.addEventListener('message', onMsg); root._off = function () { window.removeEventListener('message', onMsg); window.removeEventListener('resize', fit); };

  /* ----- hints, answer reveal ----- */
  $('mlist').addEventListener('click', function (e) { var b = e.target.closest('.hintbtn'); if (!b) return; var hb = $('hint' + b.dataset.h); hb.hidden = !hb.hidden; });
  $('peek').onclick = function () { var b = $('peek'); if (b.dataset.c !== '1') { b.dataset.c = '1'; b.textContent = 'Tap again to be sure'; setTimeout(function () { b.dataset.c = ''; b.textContent = 'I am stuck: show me the answer'; }, 3000); return; } peeked = true; $('peekbox').hidden = false; $('answer').textContent = solution; b.hidden = true; ctx.onLab({ passed: passes.filter(Boolean).length, total: missions.length, peeked: true }, false); };
  $('copyin').onclick = function () { ed.value = solution; renderGut(); lset(solution); schedule(0); syncServer(); setTab('code'); };

  /* ----- sync code to the server so the child can continue on any phone ----- */
  function syncServer() { clearTimeout(saveTimer); saveTimer = setTimeout(function () { ctx.saveServer(key, ed.value); }, 2500); }
  window.addEventListener('pagehide', function () { if (saveTimer) ctx.saveServer(key, ed.value); });

  schedule(250);
  if (!window.matchMedia('(max-width: 899px)').matches) setTab('code');
}

window.BBLab = {
  init: function (api) { BB = api; },
  fill: fill, renderLab: renderLab, buildHtml: buildHtml
};
})();
