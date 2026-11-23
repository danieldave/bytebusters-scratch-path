/* Scratch project checker rules. Rules are plain data, so the trainer can write them in the Studio.
   rule = {p:'loop', min:1} | {count:'sprites', min:3} | {any:[rule,...]} | {all:[rule,...]} */
(function (root, f) { if (typeof module === 'object' && module.exports) module.exports = f(); else root.SRules = f(); })(this, function () {
  var S = function (a) { return a.split(' '); };
  var PRESETS = {
    var: { label: 'uses a variable', ops: S('data_setvariableto data_changevariableby data_showvariable') },
    if: { label: 'uses if / else', ops: S('control_if control_if_else') },
    loop: { label: 'uses a loop', ops: S('control_forever control_repeat control_repeat_until') },
    broadcast: { label: 'uses broadcast AND receive', all: [S('event_broadcast event_broadcastandwait'), S('event_whenbroadcastreceived')] },
    timer: { label: 'uses wait or a timer', ops: S('control_wait sensing_timer sensing_resettimer') },
    costume: { label: 'changes costume', ops: S('looks_nextcostume looks_switchcostumeto') },
    backdrop: { label: 'changes backdrop', ops: S('looks_switchbackdropto looks_nextbackdrop') },
    sound: { label: 'plays a sound', ops: S('sound_play sound_playuntildone music_playDrumForBeats music_playNoteForBeats') },
    click: { label: 'uses "when this sprite clicked"', ops: S('event_whenthisspriteclicked event_whenstageclicked') },
    key: { label: 'uses a key press', ops: S('event_whenkeypressed sensing_keypressed') },
    ask: { label: 'uses ask and answer', ops: S('sensing_askandwait') },
    random: { label: 'uses random', ops: S('operator_random') },
    touch: { label: 'uses touching', ops: S('sensing_touchingobject event_whentouchingobject sensing_touchingcolor') },
    say: { label: 'makes a sprite talk', ops: S('looks_say looks_sayforsecs looks_think looks_thinkforsecs') },
    hide: { label: 'uses hide', ops: S('looks_hide') },
    move: { label: 'moves a sprite', ops: S('motion_movesteps motion_glidesecstoxy motion_glideto motion_changexby motion_changeyby motion_gotoxy motion_setx motion_sety') },
    mouse: { label: 'follows the mouse', ops: S('sensing_mousex sensing_mousey motion_goto motion_pointtowards') },
    pen: { label: 'uses the pen', ops: S('pen_penDown pen_stamp') },
    clone: { label: 'uses clones', ops: S('control_create_clone_of control_start_as_clone') }
  };
  var COUNTS = { sprites: 'sprites', backdrops: 'backdrops', variables: 'variables used', costumes: 'costumes', scripts: 'scripts', blocks: 'blocks' };
  function stats(pj) {
    var st = { ops: {}, sprites: 0, backdrops: 0, costumes: 0, scripts: 0, blocks: 0, vars: {} };
    (pj.targets || []).forEach(function (t) {
      if (t.isStage) st.backdrops = (t.costumes || []).length; else { st.sprites++; st.costumes += (t.costumes || []).length; }
      var B = t.blocks || {};
      Object.keys(B).forEach(function (k) {
        var b = B[k]; if (!b || Array.isArray(b) || !b.opcode || b.shadow) return;
        st.ops[b.opcode] = (st.ops[b.opcode] || 0) + 1; st.blocks++;
        if (b.topLevel && /^(event_when|control_start_as_clone)/.test(b.opcode)) st.scripts++;
        if (/^data_(setvariableto|changevariableby|showvariable)/.test(b.opcode) && b.fields && b.fields.VARIABLE) st.vars[b.fields.VARIABLE[0]] = 1;
      });
    });
    st.variables = Object.keys(st.vars).length;
    return st;
  }
  function cnt(st, ops) { var n = 0; ops.forEach(function (o) { n += st.ops[o] || 0; }); return n; }
  function evalRule(r, st) {
    if (!r) return true;
    var min = r.min == null ? 1 : r.min;
    if (r.any) return r.any.some(function (x) { return evalRule(x, st); });
    if (r.all) return r.all.every(function (x) { return evalRule(x, st); });
    if (r.count) return (st[r.count] || 0) >= min;
    if (r.p && PRESETS[r.p]) {
      var P = PRESETS[r.p];
      if (P.all) return P.all.every(function (g) { return cnt(st, g) >= 1; });
      return cnt(st, P.ops) >= min;
    }
    return true;
  }
  return { PRESETS: PRESETS, COUNTS: COUNTS, stats: stats, evalRule: evalRule };
});
