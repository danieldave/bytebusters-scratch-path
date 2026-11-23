/* PHP-lite: a small, honest PHP practice runner for ByteBusters (runs in the browser, no server).
   Supports the beginner subset taught in Term 3: echo/print, variables, strings, numbers, booleans,
   arrays (list + key=>value), if/elseif/else, while, for, foreach, functions (defaults, return),
   common built-in functions, and HTML outside <?php ... ?>. Anything else gives a clear message. */
(function (root) {
'use strict';
function PErr(msg, line) { this.msg = msg; this.line = line; }
function PArr() { this.k = []; this.m = new Map(); this.n = 0; }
PArr.prototype.set = function (key, v) { key = normKey(key); if (key === null) { key = this.n; } if (!this.m.has(key)) this.k.push(key); this.m.set(key, v); if (typeof key === 'number' && key >= this.n) this.n = key + 1; };
PArr.prototype.push = function (v) { this.set(null, v); };
PArr.prototype.get = function (key) { return this.m.get(normKey(key)); };
PArr.prototype.has = function (key) { return this.m.has(normKey(key)); };
PArr.prototype.clone = function () { var a = new PArr(); for (var i = 0; i < this.k.length; i++) { var v = this.m.get(this.k[i]); a.set(this.k[i], v instanceof PArr ? v.clone() : v); } a.n = this.n; return a; };
PArr.prototype.values = function () { var s = this; return this.k.map(function (x) { return s.m.get(x); }); };
function normKey(k) { if (k === null) return null; if (typeof k === 'boolean') return k ? 1 : 0; if (typeof k === 'string' && /^(0|-?[1-9]\d*)$/.test(k)) return Number(k); if (typeof k === 'number') return Math.trunc(k); return String(k); }

/* ---------- tokenizer ---------- */
var KW = { 'if': 1, 'else': 1, 'elseif': 1, 'while': 1, 'for': 1, 'foreach': 1, 'as': 1, 'function': 1, 'return': 1, 'echo': 1, 'print': 1, 'break': 1, 'continue': 1, 'true': 1, 'false': 1, 'null': 1, 'and': 1, 'or': 1, 'array': 1 };
var OPS = ['===', '!==', '<=>', '**=', '...', '<<=', '>>=', '==', '!=', '<>', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '.=', '%=', '=>', '->', '**', '??', '+', '-', '*', '/', '%', '.', '=', '<', '>', '!', '?', ':', ';', ',', '(', ')', '{', '}', '[', ']'];
function lex(src) {
  var toks = [], i = 0, line = 1, n = src.length;
  function add(t, v, extra) { var o = { t: t, v: v, line: line }; if (extra) for (var k in extra) o[k] = extra[k]; toks.push(o); }
  while (i < n) {
    var c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (c === '#' || (c === '/' && src[i + 1] === '/')) { while (i < n && src[i] !== '\n') { if (src[i] === '?' && src[i + 1] === '>') break; i++; } continue; }
    if (c === '/' && src[i + 1] === '*') { var e = src.indexOf('*/', i + 2); if (e < 0) throw new PErr('Comment never closed. Add */ at the end.', line); for (var q = i; q < e; q++) if (src[q] === '\n') line++; i = e + 2; continue; }
    if (c === '$' && /[A-Za-z_]/.test(src[i + 1] || '')) { var j = i + 1; while (j < n && /\w/.test(src[j])) j++; add('var', src.slice(i + 1, j)); i = j; continue; }
    if (/\d/.test(c) || (c === '.' && /\d/.test(src[i + 1] || ''))) { var m = /^(\d+\.?\d*(e[+-]?\d+)?|\.\d+)/i.exec(src.slice(i)); add('num', parseFloat(m[0]), { int: !/[.e]/i.test(m[0]) }); i += m[0].length; continue; }
    if (/[A-Za-z_]/.test(c)) { var j2 = i; while (j2 < n && /\w/.test(src[j2])) j2++; var w = src.slice(i, j2); var lw = w.toLowerCase(); add(KW[lw] ? 'kw' : 'id', KW[lw] ? lw : w); i = j2; continue; }
    if (c === "'") { var s = '', j3 = i + 1; while (j3 < n && src[j3] !== "'") { if (src[j3] === '\\' && (src[j3 + 1] === "'" || src[j3 + 1] === '\\')) { s += src[j3 + 1]; j3 += 2; continue; } if (src[j3] === '\n') line++; s += src[j3++]; } if (j3 >= n) throw new PErr("A quote ' was never closed.", line); add('str', s); i = j3 + 1; continue; }
    if (c === '"') { var j4 = i + 1, raw = '', startLine = line; while (j4 < n && src[j4] !== '"') { if (src[j4] === '\\') { raw += src[j4] + (src[j4 + 1] || ''); j4 += 2; continue; } if (src[j4] === '\n') line++; raw += src[j4++]; } if (j4 >= n) throw new PErr('A quote " was never closed.', startLine); toks.push({ t: 'tpl', v: raw, line: startLine }); i = j4 + 1; continue; }
    var op = null; for (var k2 = 0; k2 < OPS.length; k2++) if (src.substr(i, OPS[k2].length) === OPS[k2]) { op = OPS[k2]; break; }
    if (!op) throw new PErr('I do not understand the character "' + c + '".', line);
    add('op', op); i += op.length;
  }
  toks.push({ t: 'eof', v: '', line: line });
  return toks;
}

/* ---------- parser ---------- */
function Parser(toks, lineOffset) { this.t = toks; this.p = 0; }
Parser.prototype.peek = function () { return this.t[this.p]; };
Parser.prototype.next = function () { return this.t[this.p++]; };
Parser.prototype.isOp = function (v) { var x = this.peek(); return x.t === 'op' && x.v === v; };
Parser.prototype.isKw = function (v) { var x = this.peek(); return x.t === 'kw' && x.v === v; };
function show(x) { return x.t === 'eof' ? 'end of file' : x.t === 'var' ? 'variable "$' + x.v + '"' : x.t === 'str' || x.t === 'tpl' ? 'string' : x.t === 'num' ? 'number' : 'token "' + x.v + '"'; }
Parser.prototype.expectOp = function (v) { var x = this.peek(); if (x.t === 'op' && x.v === v) return this.next(); var prev = this.t[this.p - 1]; throw new PErr('Parse error: unexpected ' + show(x) + ', expecting "' + v + '"' + (v === ';' ? ' (did you forget a ; at the end of the line above?)' : ''), v === ';' && prev ? prev.line : x.line); };
Parser.prototype.program = function (stopAtEof) { var out = []; while (this.peek().t !== 'eof') out.push(this.statement()); return out; };
Parser.prototype.block = function () { if (this.isOp('{')) { this.next(); var b = []; while (!this.isOp('}')) { if (this.peek().t === 'eof') throw new PErr('A { was never closed. Add a } at the end.', this.peek().line); b.push(this.statement()); } this.next(); return b; } return [this.statement()]; };
Parser.prototype.statement = function () {
  var x = this.peek(), line = x.line;
  if (x.t === 'op' && x.v === '{') return { k: 'block', b: this.block(), line: line };
  if (x.t === 'op' && x.v === ';') { this.next(); return { k: 'nop', line: line }; }
  if (x.t === 'kw') {
    if (x.v === 'echo') { this.next(); var list = [this.expr()]; while (this.isOp(',')) { this.next(); list.push(this.expr()); } this.endStmt(); return { k: 'echo', l: list, line: line }; }
    if (x.v === 'print') { this.next(); var e = this.expr(); this.endStmt(); return { k: 'echo', l: [e], line: line }; }
    if (x.v === 'if') return this.ifStmt();
    if (x.v === 'while') { this.next(); this.expectOp('('); var c = this.expr(); this.expectOp(')'); return { k: 'while', c: c, b: this.block(), line: line }; }
    if (x.v === 'for') { this.next(); this.expectOp('('); var init = this.isOp(';') ? null : this.expr(); this.expectOp(';'); var cond = this.isOp(';') ? null : this.expr(); this.expectOp(';'); var step = this.isOp(')') ? null : this.expr(); this.expectOp(')'); return { k: 'for', i: init, c: cond, s: step, b: this.block(), line: line }; }
    if (x.v === 'foreach') { this.next(); this.expectOp('('); var arr = this.expr(); if (!this.isKw('as')) throw new PErr('Parse error: foreach needs the word "as". Example: foreach ($list as $item)', this.peek().line); this.next(); var a = this.next(); if (a.t !== 'var') throw new PErr('Parse error: after "as" put a variable like $item', a.line); var kv = null, vv = a.v; if (this.isOp('=>')) { this.next(); var b2 = this.next(); if (b2.t !== 'var') throw new PErr('Parse error: after => put a variable like $value', b2.line); kv = a.v; vv = b2.v; } this.expectOp(')'); return { k: 'foreach', a: arr, kv: kv, vv: vv, b: this.block(), line: line }; }
    if (x.v === 'function') { this.next(); var nm = this.next(); if (nm.t !== 'id') throw new PErr('Parse error: a function needs a name, like function greet()', nm.line); this.expectOp('('); var params = []; while (!this.isOp(')')) { var pv = this.next(); if (pv.t !== 'var') throw new PErr('Parse error: a function parameter starts with $, like ($name)', pv.line); var def = null; if (this.isOp('=')) { this.next(); def = this.expr(); } params.push({ n: pv.v, d: def }); if (this.isOp(',')) this.next(); else break; } this.expectOp(')'); var body = this.block(); return { k: 'func', n: nm.v.toLowerCase(), p: params, b: body, line: line }; }
    if (x.v === 'return') { this.next(); var rv = null; if (!this.isOp(';') && this.peek().t !== 'eof') rv = this.expr(); this.endStmt(); return { k: 'return', e: rv, line: line }; }
    if (x.v === 'break' || x.v === 'continue') { this.next(); this.endStmt(); return { k: x.v, line: line }; }
  }
  var ex = this.expr(); this.endStmt(); return { k: 'expr', e: ex, line: line };
};
Parser.prototype.endStmt = function () { if (this.isOp(';')) { this.next(); return; } if (this.peek().t === 'eof' || this.peek().t === 'close') return; this.expectOp(';'); };
Parser.prototype.ifStmt = function () {
  var line = this.next().line; this.expectOp('('); var c = this.expr(); this.expectOp(')'); var then = this.block(), els = null;
  if (this.isKw('elseif')) { els = [this.ifStmt()]; }
  else if (this.isKw('else')) { this.next(); if (this.isKw('if')) els = [this.ifStmt()]; else els = this.block(); }
  return { k: 'if', c: c, t: then, e: els, line: line };
};
var BIN = [['or'], ['and'], ['??'], ['||'], ['&&'], ['==', '!=', '===', '!==', '<>', '<=>'], ['<', '>', '<=', '>='], ['.'], ['+', '-'], ['*', '/', '%']];
Parser.prototype.expr = function () { return this.assign(); };
Parser.prototype.assign = function () {
  var left = this.ternary(), x = this.peek();
  if (x.t === 'op' && /^(=|\+=|-=|\*=|\/=|\.=|%=|\*\*=)$/.test(x.v)) {
    if (!(left.k === 'var' || left.k === 'idx')) throw new PErr('Parse error: you can only put a value into a variable like $price', x.line);
    this.next(); var right = this.assign(); return { k: 'assign', op: x.v, l: left, r: right, line: x.line };
  }
  return left;
};
Parser.prototype.ternary = function () {
  var c = this.bin(0);
  if (this.isOp('?')) { var line = this.next().line; var a = this.isOp(':') ? null : this.assign(); this.expectOp(':'); var b = this.assign(); return { k: 'tern', c: c, a: a, b: b, line: line }; }
  return c;
};
Parser.prototype.bin = function (lvl) {
  if (lvl >= BIN.length) return this.unary();
  var left = this.bin(lvl + 1);
  for (;;) { var x = this.peek(), hit = (x.t === 'op' || x.t === 'kw') && BIN[lvl].indexOf(x.v) >= 0; if (!hit) break; this.next(); var right = (x.v === '??') ? this.bin(lvl) : this.bin(lvl + 1); left = { k: 'bin', o: x.v, l: left, r: right, line: x.line }; }
  return left;
};
Parser.prototype.unary = function () {
  var x = this.peek();
  if (x.t === 'op' && (x.v === '!' || x.v === '-' || x.v === '+')) { this.next(); return { k: 'un', o: x.v, e: this.unary(), line: x.line }; }
  if (x.t === 'op' && (x.v === '++' || x.v === '--')) { this.next(); var t = this.unary(); return { k: 'assign', op: x.v === '++' ? '+=' : '-=', l: t, r: { k: 'lit', v: 1 }, line: x.line }; }
  return this.pow();
};
Parser.prototype.pow = function () { var b = this.postfix(); if (this.isOp('**')) { var line = this.next().line; return { k: 'bin', o: '**', l: b, r: this.unary(), line: line }; } return b; };
Parser.prototype.postfix = function () {
  var e = this.primary();
  for (;;) {
    var x = this.peek();
    if (x.t === 'op' && x.v === '[') { this.next(); var ix = null; if (!this.isOp(']')) ix = this.expr(); this.expectOp(']'); e = { k: 'idx', a: e, i: ix, line: x.line }; continue; }
    if (x.t === 'op' && (x.v === '++' || x.v === '--') && (e.k === 'var' || e.k === 'idx')) { this.next(); e = { k: 'post', op: x.v, l: e, line: x.line }; continue; }
    break;
  }
  return e;
};
Parser.prototype.args = function () { this.expectOp('('); var a = []; while (!this.isOp(')')) { a.push(this.expr()); if (this.isOp(',')) this.next(); else break; } this.expectOp(')'); return a; };
Parser.prototype.primary = function () {
  var x = this.next();
  switch (x.t) {
    case 'num': return { k: 'lit', v: x.v, int: x.int };
    case 'str': return { k: 'lit', v: x.v };
    case 'tpl': return { k: 'tpl', parts: interp(x.v, x.line), line: x.line };
    case 'var': return { k: 'var', n: x.v, line: x.line };
    case 'kw':
      if (x.v === 'true') return { k: 'lit', v: true };
      if (x.v === 'false') return { k: 'lit', v: false };
      if (x.v === 'null') return { k: 'lit', v: null };
      if (x.v === 'array') { this.expectOp('('); return this.arrayLit(')', x.line); }
      throw new PErr('Parse error: unexpected "' + x.v + '"', x.line);
    case 'id': if (this.isOp('(')) { return { k: 'call', n: x.v.toLowerCase(), a: this.args(), line: x.line }; } return { k: 'const', n: x.v, line: x.line };
    case 'op':
      if (x.v === '(') { var e = this.expr(); this.expectOp(')'); return e; }
      if (x.v === '[') return this.arrayLit(']', x.line);
  }
  throw new PErr('Parse error: unexpected ' + show(x), x.line);
};
Parser.prototype.arrayLit = function (close, line) {
  var items = [];
  while (!this.isOp(close)) { var a = this.expr(), k = null; if (this.isOp('=>')) { this.next(); k = a; a = this.expr(); } items.push({ k: k, v: a }); if (this.isOp(',')) this.next(); else break; }
  this.expectOp(close); return { k: 'arr', items: items, line: line };
};
function interp(raw, line) {
  var parts = [], buf = '', i = 0;
  function flush() { if (buf) parts.push(buf); buf = ''; }
  while (i < raw.length) {
    var c = raw[i];
    if (c === '\\') { var d = raw[i + 1]; var map = { n: '\n', t: '\t', r: '\r', '\\': '\\', '"': '"', '$': '$' }; if (d in map) { buf += map[d]; } else buf += '\\' + d; i += 2; continue; }
    if (c === '{' && raw[i + 1] === '$') { var depth = 1, j = i + 1; while (j < raw.length && depth) { j++; if (raw[j] === '{') depth++; else if (raw[j] === '}') depth--; } flush(); parts.push(new Parser(lex(raw.slice(i + 1, j))).expr()); i = j + 1; continue; }
    if (c === '$' && /[A-Za-z_]/.test(raw[i + 1] || '')) {
      var j2 = i + 1; while (j2 < raw.length && /\w/.test(raw[j2])) j2++; var node = { k: 'var', n: raw.slice(i + 1, j2), line: line };
      var m = /^\[([A-Za-z_]\w*|\d+|'[^']*')\]/.exec(raw.slice(j2));
      if (m) { var key = m[1]; var kn = /^\d+$/.test(key) ? { k: 'lit', v: Number(key) } : key[0] === "'" ? { k: 'lit', v: key.slice(1, -1) } : { k: 'lit', v: key }; node = { k: 'idx', a: node, i: kn, line: line }; j2 += m[0].length; }
      flush(); parts.push(node); i = j2; continue;
    }
    buf += c; i++;
  }
  flush(); return parts;
}

/* ---------- values ---------- */
function isNumStr(s) { return typeof s === 'string' && /^\s*[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?\s*$/i.test(s); }
function toStr(v) {
  if (v === null || v === undefined || v === false) return '';
  if (v === true) return '1';
  if (typeof v === 'number') { if (!isFinite(v)) return isNaN(v) ? 'NAN' : (v > 0 ? 'INF' : '-INF'); if (Number.isInteger(v) && Math.abs(v) < 1e15) return String(v); var s = String(Number(v.toPrecision(14))); return s.replace('e+', 'E+').replace('e-', 'E-'); }
  if (v instanceof PArr) return 'Array';
  return String(v);
}
function toNum(v) { if (typeof v === 'number') return v; if (v === true) return 1; if (v === null || v === false || v === undefined) return 0; if (typeof v === 'string') { var m = /^\s*[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(v); return m ? parseFloat(m[0]) : 0; } if (v instanceof PArr) return v.k.length ? 1 : 0; return 0; }
function truthy(v) { if (v === null || v === undefined || v === false || v === 0 || v === '' || v === '0') return false; if (v instanceof PArr) return v.k.length > 0; return true; }
function looseEq(a, b) {
  if (a === null || a === undefined) a = null; if (b === null || b === undefined) b = null;
  if (typeof a === 'boolean' || typeof b === 'boolean' || a === null || b === null) { if (a === null && typeof b === 'string') return b === ''; if (b === null && typeof a === 'string') return a === ''; return truthy(a) === truthy(b); }
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  if (typeof a === 'string' && typeof b === 'string') { if (isNumStr(a) && isNumStr(b)) return parseFloat(a) === parseFloat(b); return a === b; }
  if (typeof a === 'number' && typeof b === 'string') return isNumStr(b) ? a === parseFloat(b) : String(a) === b;
  if (typeof a === 'string' && typeof b === 'number') return isNumStr(a) ? parseFloat(a) === b : a === String(b);
  return false;
}
function strictEq(a, b) { if (a instanceof PArr && b instanceof PArr) { if (a.k.length !== b.k.length) return false; for (var i = 0; i < a.k.length; i++) { if (a.k[i] !== b.k[i] || !strictEq(a.m.get(a.k[i]), b.m.get(b.k[i]))) return false; } return true; } if ((a === undefined ? null : a) === (b === undefined ? null : b)) return true; return false; }
function cmp(a, b) { if (typeof a === 'string' && typeof b === 'string' && !(isNumStr(a) && isNumStr(b))) return a < b ? -1 : a > b ? 1 : 0; var x = toNum(a), y = toNum(b); return x < y ? -1 : x > y ? 1 : 0; }
function typeName(v) { if (v === null || v === undefined) return 'NULL'; if (typeof v === 'boolean') return 'boolean'; if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'double'; if (typeof v === 'string') return 'string'; return 'array'; }
function dump(v, ind) { ind = ind || ''; if (v === null || v === undefined) return 'NULL'; if (typeof v === 'boolean') return 'bool(' + v + ')'; if (typeof v === 'number') return Number.isInteger(v) ? 'int(' + v + ')' : 'float(' + toStr(v) + ')'; if (typeof v === 'string') return 'string(' + new TextEncoder().encode(v).length + ') "' + v + '"'; var out = 'array(' + v.k.length + ') {\n'; v.k.forEach(function (k) { out += ind + '  [' + (typeof k === 'number' ? k : '"' + k + '"') + ']=>\n' + ind + '  ' + dump(v.m.get(k), ind + '  ') + '\n'; }); return out + ind + '}'; }

/* ---------- built-in functions ---------- */
function mkArr(list) { var a = new PArr(); list.forEach(function (x) { a.push(x); }); return a; }
var FN = {
  strlen: function (s) { return new TextEncoder().encode(toStr(s)).length; },
  strtoupper: function (s) { return toStr(s).toUpperCase(); }, strtolower: function (s) { return toStr(s).toLowerCase(); },
  ucfirst: function (s) { s = toStr(s); return s.charAt(0).toUpperCase() + s.slice(1); },
  ucwords: function (s) { return toStr(s).replace(/(^|\s)(\S)/g, function (m, a, b) { return a + b.toUpperCase(); }); },
  trim: function (s) { return toStr(s).trim(); }, str_repeat: function (s, n) { return toStr(s).repeat(Math.max(0, toNum(n))); },
  strrev: function (s) { return toStr(s).split('').reverse().join(''); }, str_replace: function (a, b, s) { return toStr(s).split(toStr(a)).join(toStr(b)); },
  substr: function (s, st, ln) { s = toStr(s); st = toNum(st); if (st < 0) st = Math.max(0, s.length + st); return ln === undefined || ln === null ? s.slice(st) : (toNum(ln) < 0 ? s.slice(st, s.length + toNum(ln)) : s.substr(st, toNum(ln))); },
  strpos: function (h, n) { var i = toStr(h).indexOf(toStr(n)); return i < 0 ? false : i; },
  str_contains: function (h, n) { return toStr(h).indexOf(toStr(n)) >= 0; },
  count: function (a) { return a instanceof PArr ? a.k.length : 1; }, sizeof: function (a) { return FN.count(a); },
  implode: function (g, a) { if (g instanceof PArr) { var t = g; g = a === undefined ? '' : a; a = t; } return a.values().map(toStr).join(toStr(g)); },
  explode: function (d, s) { return mkArr(toStr(s).split(toStr(d))); },
  in_array: function (n, a) { return a.values().some(function (v) { return looseEq(v, n); }); },
  array_sum: function (a) { return a.values().reduce(function (s, v) { return s + toNum(v); }, 0); },
  array_keys: function (a) { return mkArr(a.k.slice()); }, array_values: function (a) { return mkArr(a.values()); },
  array_push: function (a, v) { a.push(v); return a.k.length; }, array_reverse: function (a) { return mkArr(a.values().reverse()); },
  array_key_exists: function (k, a) { return a.has(k); },
  max: function () { var l = arguments.length === 1 && arguments[0] instanceof PArr ? arguments[0].values() : [].slice.call(arguments); return l.reduce(function (m, v) { return cmp(v, m) > 0 ? v : m; }); },
  min: function () { var l = arguments.length === 1 && arguments[0] instanceof PArr ? arguments[0].values() : [].slice.call(arguments); return l.reduce(function (m, v) { return cmp(v, m) < 0 ? v : m; }); },
  abs: function (n) { return Math.abs(toNum(n)); }, round: function (n, p) { p = toNum(p || 0); var f = Math.pow(10, p), x = toNum(n) * f; var r = Math.sign(x) * Math.round(Math.abs(x) + 1e-12); return r / f; },
  floor: function (n) { return Math.floor(toNum(n)); }, ceil: function (n) { return Math.ceil(toNum(n)); }, sqrt: function (n) { return Math.sqrt(toNum(n)); }, pow: function (a, b) { return Math.pow(toNum(a), toNum(b)); },
  intval: function (v) { return Math.trunc(toNum(v)); }, floatval: function (v) { return toNum(v); }, strval: function (v) { return toStr(v); },
  is_numeric: function (v) { return typeof v === 'number' || isNumStr(v); }, is_string: function (v) { return typeof v === 'string'; }, is_int: function (v) { return typeof v === 'number' && Number.isInteger(v); }, is_array: function (v) { return v instanceof PArr; }, is_bool: function (v) { return typeof v === 'boolean'; },
  gettype: typeName, isset: function (v) { return v !== null && v !== undefined; }, empty: function (v) { return !truthy(v); },
  number_format: function (n, d, dp, ts) { d = toNum(d || 0); dp = dp === undefined ? '.' : toStr(dp); ts = ts === undefined ? ',' : toStr(ts); var x = FN.round(n, d).toFixed(d); var parts = x.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ts); return parts.join(parts[1] !== undefined ? dp : ''); },
  var_dump: null, print_r: null, date: function (f) { var d = new Date(); var p = function (x) { return (x < 10 ? '0' : '') + x; }; return toStr(f).replace(/Y/g, d.getFullYear()).replace(/m/g, p(d.getMonth() + 1)).replace(/d/g, p(d.getDate())); },
  rand: function (a, b) { a = toNum(a); b = toNum(b); return a + Math.floor(Math.random() * (b - a + 1)); }, mt_rand: function (a, b) { return FN.rand(a, b); },
  htmlspecialchars: function (s) { return toStr(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
};
var CONSTS = { PHP_EOL: '\n', PHP_INT_MAX: 9007199254740991, M_PI: Math.PI, E_ALL: 32767, NAN: NaN, INF: Infinity };

/* ---------- interpreter ---------- */
function run(src, opts) {
  opts = opts || {}; var out = '', steps = 0, LIMIT = opts.limit || 300000, funcs = {};
  function echo(s) { out += s; if (out.length > 200000) throw new PErr('That prints too much. Check your loop.', 0); }
  function tick(line) { if (++steps > LIMIT) throw new PErr('This loop never stops! Check the condition of your while/for loop.', line); }
  var BRK = { b: 1 }, CNT = { c: 1 };
  function RET(v) { this.v = v; }
  function lookup(scope, n, line) { if (n in scope) return scope[n]; echo('\nWarning: Undefined variable $' + n + ' on line ' + line + '\n'); return null; }
  function ev(e, sc) {
    switch (e.k) {
      case 'lit': return e.v;
      case 'tpl': return e.parts.map(function (p) { return typeof p === 'string' ? p : toStr(ev(p, sc)); }).join('');
      case 'var': return lookup(sc, e.n, e.line);
      case 'const': if (e.n in CONSTS) return CONSTS[e.n]; if (/^(true|false|null)$/i.test(e.n)) return null; throw new PErr('Error: Undefined constant "' + e.n + '". If it is text, put it in quotes.', e.line);
      case 'arr': { var a = new PArr(); e.items.forEach(function (it) { var v = ev(it.v, sc); if (v instanceof PArr) v = v.clone(); if (it.k) a.set(ev(it.k, sc), v); else a.push(v); }); return a; }
      case 'idx': { var base = ev(e.a, sc); if (e.i === null) throw new PErr('Fatal error: Cannot use [] for reading', e.line); var ix = ev(e.i, sc); if (base instanceof PArr) { if (!base.has(ix)) { echo('\nWarning: Undefined array key ' + (typeof ix === 'string' ? '"' + ix + '"' : toStr(ix)) + ' on line ' + e.line + '\n'); return null; } return base.get(ix); } if (typeof base === 'string') { return base.charAt(toNum(ix)); } return null; }
      case 'un': { var v2 = ev(e.e, sc); if (e.o === '!') return !truthy(v2); if (e.o === '-') return -toNum(v2); return toNum(v2); }
      case 'tern': { var c = ev(e.c, sc); if (e.a === null) return truthy(c) ? c : ev(e.b, sc); return truthy(c) ? ev(e.a, sc) : ev(e.b, sc); }
      case 'bin': return binop(e, sc);
      case 'assign': return assign(e, sc);
      case 'post': { var old = ev(e.l, sc); assignTo(e.l, toNum(old) + (e.op === '++' ? 1 : -1), sc); return old; }
      case 'call': return call(e, sc);
    }
    throw new PErr('Unsupported code', e.line);
  }
  function binop(e, sc) {
    var o = e.o;
    if (o === '&&' || o === 'and') return truthy(ev(e.l, sc)) && truthy(ev(e.r, sc));
    if (o === '||' || o === 'or') return truthy(ev(e.l, sc)) || truthy(ev(e.r, sc));
    if (o === '??') { var l0 = nullsafe(e.l, sc); return l0 !== null && l0 !== undefined ? l0 : ev(e.r, sc); }
    var l = ev(e.l, sc), r = ev(e.r, sc);
    switch (o) {
      case '.': return toStr(l) + toStr(r);
      case '+': case '-': case '*': case '/': case '%': case '**':
        if ((typeof l === 'string' && !isNumStr(l) && l.trim() !== '' && !/^\s*[+-]?\d/.test(l)) || (typeof r === 'string' && !isNumStr(r) && r.trim() !== '' && !/^\s*[+-]?\d/.test(r))) throw new PErr('Fatal error: Unsupported operand types: "' + (typeof l === 'string' && !/^\s*[+-]?\d/.test(l) ? l : r) + '" is not a number. Use . to join text.', e.line);
        var a = toNum(l), b = toNum(r);
        if (o === '+') return a + b; if (o === '-') return a - b; if (o === '*') return a * b; if (o === '**') return Math.pow(a, b);
        if (o === '/') { if (b === 0) throw new PErr('Fatal error: Uncaught DivisionByZeroError: Division by zero', e.line); return a / b; }
        if (Math.trunc(b) === 0) throw new PErr('Fatal error: Uncaught DivisionByZeroError: Modulo by zero', e.line); return Math.trunc(a) % Math.trunc(b);
      case '==': return looseEq(l, r); case '!=': case '<>': return !looseEq(l, r);
      case '===': return strictEq(l, r); case '!==': return !strictEq(l, r);
      case '<': return cmp(l, r) < 0; case '>': return cmp(l, r) > 0; case '<=': return cmp(l, r) <= 0; case '>=': return cmp(l, r) >= 0; case '<=>': return cmp(l, r);
    }
  }
  function nullsafe(e, sc) { if (e.k === 'var') return e.n in sc ? sc[e.n] : null; if (e.k === 'idx') { var b = nullsafe(e.a, sc); if (b instanceof PArr) { var ix = ev(e.i, sc); return b.has(ix) ? b.get(ix) : null; } return null; } return ev(e, sc); }
  function assign(e, sc) {
    var v = ev(e.r, sc); if (v instanceof PArr) v = v.clone();
    if (e.op !== '=') { var cur = e.l.k === 'var' ? (e.l.n in sc ? sc[e.l.n] : lookup(sc, e.l.n, e.line)) : ev(e.l, sc); var op = e.op.slice(0, -1); v = binop({ o: op, l: { k: 'lit', v: cur }, r: { k: 'lit', v: v }, line: e.line }, sc); }
    assignTo(e.l, v, sc); return v;
  }
  function assignTo(t, v, sc) {
    if (t.k === 'var') { sc[t.n] = v; return; }
    if (t.k === 'idx') { var holder = container(t.a, sc); if (t.i === null) holder.push(v); else holder.set(ev(t.i, sc), v); return; }
    throw new PErr('You can only put a value into a variable.', t.line);
  }
  function container(t, sc) {
    if (t.k === 'var') { var cur = sc[t.n]; if (!(cur instanceof PArr)) { cur = new PArr(); sc[t.n] = cur; } return cur; }
    if (t.k === 'idx') { var up = container(t.a, sc), key = t.i === null ? null : ev(t.i, sc), inner = key === null ? undefined : up.get(key); if (!(inner instanceof PArr)) { inner = new PArr(); if (key === null) up.push(inner); else up.set(key, inner); } return inner; }
    throw new PErr('Cannot use this as an array.', t.line);
  }
  function call(e, sc) {
    var n = e.n;
    if (n === 'isset') return e.a.every(function (x) { var v = nullsafe(x, sc); return v !== null && v !== undefined; });
    if (n === 'empty') return !truthy(nullsafe(e.a[0], sc));
    if (n === 'var_dump') { e.a.forEach(function (x) { echo(dump(ev(x, sc)) + '\n'); }); return null; }
    if (n === 'print_r') { var pv = ev(e.a[0], sc); echo(pv instanceof PArr ? printR(pv, '') : toStr(pv)); return true; }
    if (n === 'sort' || n === 'rsort') { var ar = container(e.a[0], sc), vals = ar.values().sort(cmp); if (n === 'rsort') vals.reverse(); var na = mkArr(vals); ar.k = na.k; ar.m = na.m; ar.n = na.n; return true; }
    if (n === 'ksort') { var ak = container(e.a[0], sc), ks = ak.k.slice().sort(function (a, b) { return cmp(a, b); }), nm = new Map(); ks.forEach(function (k) { nm.set(k, ak.m.get(k)); }); ak.k = ks; ak.m = nm; return true; }
    if (n === 'array_push') { var ap = container(e.a[0], sc); for (var i = 1; i < e.a.length; i++) ap.push(ev(e.a[i], sc)); return ap.k.length; }
    if (funcs[n]) return callUser(funcs[n], e.a.map(function (x) { var v = ev(x, sc); return v instanceof PArr ? v.clone() : v; }), e.line);
    if (FN[n]) { var args = e.a.map(function (x) { return ev(x, sc); }); return FN[n].apply(null, args); }
    throw new PErr('Fatal error: Call to undefined function ' + e.n + '(). Check the spelling, or this PHP-lite practice runner may not have it yet.', e.line);
  }
  function printR(a, ind) { var s = 'Array\n' + ind + '(\n'; a.k.forEach(function (k) { var v = a.m.get(k); s += ind + '    [' + k + '] => ' + (v instanceof PArr ? printR(v, ind + '        ') : toStr(v)) + '\n'; }); return s + ind + ')\n'; }
  function callUser(f, args, line) {
    if (args.length > f.p.length && false) return null;
    var sc = {}; if (args.length < f.p.filter(function (p) { return !p.d; }).length) throw new PErr('Fatal error: Too few arguments to function ' + f.n + '(): expected ' + f.p.filter(function (p) { return !p.d; }).length + ', got ' + args.length, line);
    f.p.forEach(function (p, i) { sc[p.n] = i < args.length ? args[i] : ev(p.d, {}); });
    var r = exec(f.b, sc); return r instanceof RET ? r.v : null;
  }
  function exec(list, sc) {
    for (var i = 0; i < list.length; i++) { var r = stmt(list[i], sc); if (r) return r; }
    return null;
  }
  function stmt(s, sc) {
    tick(s.line);
    switch (s.k) {
      case 'nop': return null;
      case 'html': echo(s.v); return null;
      case 'echo': s.l.forEach(function (x) { echo(toStr(ev(x, sc))); }); return null;
      case 'expr': ev(s.e, sc); return null;
      case 'block': return exec(s.b, sc);
      case 'func': funcs[s.n] = s; return null;
      case 'return': return new RET(s.e ? ev(s.e, sc) : null);
      case 'break': return BRK; case 'continue': return CNT;
      case 'if': if (truthy(ev(s.c, sc))) return exec(s.t, sc); else if (s.e) return exec(s.e, sc); return null;
      case 'while': while (truthy(ev(s.c, sc))) { tick(s.line); var r = exec(s.b, sc); if (r === BRK) break; if (r instanceof RET) return r; } return null;
      case 'for': if (s.i) ev(s.i, sc); while (s.c ? truthy(ev(s.c, sc)) : true) { tick(s.line); var r2 = exec(s.b, sc); if (r2 === BRK) break; if (r2 instanceof RET) return r2; if (s.s) ev(s.s, sc); } return null;
      case 'foreach': { var arr = ev(s.a, sc); if (!(arr instanceof PArr)) { echo('\nWarning: foreach() needs an array on line ' + s.line + '\n'); return null; } var ks = arr.k.slice(); for (var i = 0; i < ks.length; i++) { tick(s.line); if (s.kv) sc[s.kv] = ks[i]; var v = arr.m.get(ks[i]); sc[s.vv] = v instanceof PArr ? v.clone() : v; var r3 = exec(s.b, sc); if (r3 === BRK) break; if (r3 instanceof RET) return r3; } return null; }
    }
    throw new PErr('Unsupported statement', s.line);
  }
  try {
    var items = split(src), prog = [], hoist = [];
    items.forEach(function (it) { if (it.html !== undefined) { if (it.html) prog.push({ k: 'html', v: it.html, line: it.line }); } else { var ps = new Parser(it.toks); var list = ps.program(); if (it.echo) { prog.push({ k: 'echo', l: [list[0].e], line: it.line }); } else list.forEach(function (x) { if (x.k === 'func') hoist.push(x); prog.push(x); }); } });
    hoist.forEach(function (f) { funcs[f.n] = f; });
    exec(prog, {});
    return { out: out, error: null };
  } catch (e) {
    if (e instanceof PErr) return { out: out, error: { msg: e.msg, line: e.line } };
    return { out: out, error: { msg: 'Something went wrong: ' + (e && e.message), line: 0 } };
  }
}
/* split the file into HTML text and <?php ... ?> code pieces */
function split(src) {
  var items = [], i = 0, line = 1;
  while (i < src.length) {
    var o = src.indexOf('<?', i), isEcho = false;
    if (o < 0) { items.push({ html: src.slice(i), line: line }); break; }
    if (o > i) { items.push({ html: src.slice(i, o), line: line }); for (var q = i; q < o; q++) if (src[q] === '\n') line++; }
    var codeStart;
    if (src.substr(o, 5).toLowerCase() === '<?php') codeStart = o + 5; else if (src.substr(o, 3) === '<?=') { codeStart = o + 3; isEcho = true; } else { items.push({ html: '<?', line: line }); i = o + 2; continue; }
    var end = findClose(src, codeStart), code = src.slice(codeStart, end < 0 ? src.length : end);
    var toks = lex(code); toks.forEach(function (t) { t.line += line - 1; }); items.push({ toks: toks, echo: isEcho, line: line });
    for (var q2 = o; q2 < (end < 0 ? src.length : end); q2++) if (src[q2] === '\n') line++;
    if (end < 0) break; i = end + 2; if (src[i] === '\n') { i++; line++; }
  }
  return items;
}
function findClose(src, from) { // find ?> that is not inside a string or comment
  var i = from, q = null;
  while (i < src.length) { var c = src[i]; if (q) { if (c === '\\') { i += 2; continue; } if (c === q) q = null; i++; continue; } if (c === '"' || c === "'") { q = c; i++; continue; } if (c === '/' && src[i + 1] === '/' || c === '#') { while (i < src.length && src[i] !== '\n' && !(src[i] === '?' && src[i + 1] === '>')) i++; continue; } if (c === '/' && src[i + 1] === '*') { var e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 2; continue; } if (c === '?' && src[i + 1] === '>') return i; i++; }
  return -1;
}
var api = { run: run };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PHPLite = api;
})(typeof self !== 'undefined' ? self : this);
