// Access ID format:  SCHOOL-XXXX   e.g. UHS-4K7M
//   SCHOOL = MHS | UHS | YWS
//   XXXX   = 3 random characters + 1 check character (so typos are caught)
// Alphabet has no 0/O, 1/I/L so kids cannot mix them up.
const ALPHA = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
function check(body) { // body e.g. "UHS4K7"
  let s = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    const v = ALPHA.indexOf(c) >= 0 ? ALPHA.indexOf(c) : c.charCodeAt(0) % ALPHA.length;
    s += v * (i + 3);
  }
  return ALPHA[s % ALPHA.length];
}
function make(school, rnd = Math.random) {
  let b = '';
  for (let i = 0; i < 3; i++) b += ALPHA[Math.floor(rnd() * ALPHA.length)];
  const body = school + b;
  return school + '-' + b + check(body);
}
function normalise(s) {
  return String(s || '').toUpperCase().replace(/[\s_]/g, '').replace(/^([A-Z]{3})-?/, '$1-').slice(0, 8);
}
// returns 'ok' | 'format' | 'check'
function validate(id) {
  const m = /^([A-Z]{3})-([A-Z0-9]{3})([A-Z0-9])$/.exec(id);
  if (!m) return 'format';
  return check(m[1] + m[2]) === m[3] ? 'ok' : 'check';
}
module.exports = { make, check, validate, normalise, ALPHA };
