/* Prompt Lab: kids write a prompt, a checklist scores it, a SAFE practice AI (a simulator) answers.
   No live AI, no data leaves the phone. Replies are written by the trainer in the project. */
(function (root, f) { if (typeof module === 'object' && module.exports) module.exports = f(); else root.PromptLab = f(); })(this, function () {
  var TIER = [0, 0, 1, 2, 3];
  function has(t, s) { return t.indexOf(String(s).toLowerCase()) >= 0; }
  function ruleOk(r, text) {
    var t = text.toLowerCase();
    if (r.any && !r.any.some(function (s) { return has(t, s); })) return false;
    if (r.all && !r.all.every(function (s) { return has(t, s); })) return false;
    if (r.not && r.not.some(function (s) { return has(t, s); })) return false;
    if (r.notRe && new RegExp(r.notRe, 'i').test(text)) return false;
    if (r.re && !new RegExp(r.re, 'i').test(text)) return false;
    if (r.minWords && text.trim().split(/\s+/).filter(Boolean).length < r.minWords) return false;
    return true;
  }
  function privacy(text) {
    var out = [];
    if (/\d[\d\s-]{7,}\d/.test(text)) out.push('a phone number');
    if (/\S+@\S+\.\S+/.test(text)) out.push('an email address');
    if (/\b(i live at|my address is|my home address)\b/i.test(text)) out.push('your home address');
    return out;
  }
  function score(ai, text) {
    var res = ai.checks.map(function (c) { return !!(text && text.trim() && ruleOk(c.rule || {}, text)); });
    var passed = res.filter(Boolean).length;
    return { res: res, passed: passed, total: res.length, privacy: privacy(text || '') };
  }
  function replyFor(ai, sc) {
    if (sc.privacy.length) return '🛑 Stop! Your prompt has ' + sc.privacy.join(' and ') + '. Never share private details with an AI. Remove them and try again.';
    var n = ai.replies.length, idx = Math.min(n - 1, Math.round(sc.passed / Math.max(1, sc.total) * (n - 1) + (sc.passed === sc.total ? 0.4 : 0)));
    if (sc.passed === sc.total) idx = n - 1; else if (idx >= n - 1) idx = n - 2;
    return ai.replies[Math.max(0, idx)];
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mount(el, ai, ctx) {
    var sent = 0, last = null, peeked = false, tm;
    el.innerHTML = '<div class="pl"><div class="pl-scn">🎯 <b>Your mission</b><br>' + esc(ai.scenario) + '</div>' +
      '<label for="pl-t" style="font-weight:700">Your prompt</label><textarea id="pl-t" rows="5" maxlength="600" placeholder="Type your prompt here…"></textarea>' +
      '<div class="pl-meta"><span id="pl-w">0 words</span><span id="pl-pv" class="pl-warn"></span></div>' +
      '<div id="pl-ck"></div><div class="rowbtn"><button class="btn" id="pl-send">▶ Send to Practice AI</button><button class="btn alt" id="pl-ex" hidden>💡 Show an example prompt</button></div>' +
      '<div id="pl-out"></div></div>';
    var ta = el.querySelector('#pl-t'); ta.value = ctx.text || ai.start || '';
    function draw() {
      var sc = score(ai, ta.value); last = sc;
      el.querySelector('#pl-w').textContent = (ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0) + ' words';
      el.querySelector('#pl-pv').textContent = sc.privacy.length ? '⚠ Private info: ' + sc.privacy.join(', ') : '';
      el.querySelector('#pl-ck').innerHTML = '<ul class="pl-list">' + ai.checks.map(function (c, i) {
        return '<li class="' + (sc.res[i] ? 'ok' : '') + '"><span class="pl-i">' + (sc.res[i] ? '✓' : '○') + '</span><div><b>' + esc(c.k) + '</b> · ' + esc(c.say) + '<div class="pl-h" hidden>💡 ' + esc(c.hint) + '</div></div><button class="pl-hb" aria-label="Hint">💡</button></li>';
      }).join('') + '</ul>';
      [].forEach.call(el.querySelectorAll('.pl-hb'), function (b) { b.onclick = function () { var h = b.parentNode.querySelector('.pl-h'); h.hidden = !h.hidden; }; });
      clearTimeout(tm); tm = setTimeout(function () { ctx.onChange(ta.value, sc); }, 700);
    }
    ta.oninput = draw; draw();
    el.querySelector('#pl-send').onclick = function () {
      var sc = score(ai, ta.value); sent++;
      var out = el.querySelector('#pl-out'), r = replyFor(ai, sc), blocked = sc.privacy.length > 0;
      var bars = '■'.repeat(sc.passed) + '□'.repeat(sc.total - sc.passed);
      out.innerHTML = '<div class="pl-ai"><div class="pl-ah">🤖 Practice AI <i>(a safe simulator, not the real thing)</i></div><div class="pl-bub">' + esc(r).replace(/\n/g, '<br>') + '</div>' +
        (blocked ? '' : '<div class="pl-clar">Prompt clarity: <b>' + bars + '</b> ' + sc.passed + '/' + sc.total + (sc.passed === sc.total ? ' 🎉 Brilliant prompt!' : ' · tick more boxes for a better answer') + '</div>') + '</div>' +
        (!blocked && sc.passed > 0 && sc.passed < sc.total ? '<details class="pl-cmp"><summary>What would a lazy prompt get?</summary><div class="pl-bub">' + esc(ai.replies[0]).replace(/\n/g, '<br>') + '</div></details>' : '');
      if (sent >= 2 && sc.passed < sc.total) el.querySelector('#pl-ex').hidden = false;
      ctx.onChange(ta.value, sc);
      if (sc.passed === sc.total && !blocked) ctx.onWin();
    };
    el.querySelector('#pl-ex').onclick = function () {
      if (!peeked) { peeked = true; this.textContent = 'Tap again to be sure'; var b = this; setTimeout(function () { b.textContent = '💡 Show an example prompt'; peeked = false; }, 3000); return; }
      peeked = false; el.querySelector('#pl-out').insertAdjacentHTML('beforeend', '<div class="why"><b>Example prompt:</b><br>' + esc(ai.best) + '<br><small>Read it, then write your own version so it sticks.</small></div>');
    };
  }
  return { score: score, replyFor: replyFor, privacy: privacy, mount: mount };
});
