const { execFileSync } = require('child_process'); const fs = require('fs');
const PL = require('../../public/php-lite.js'); let bad = 0;
const files = process.argv.slice(2);
const cases = files.length ? files.map((f) => fs.readFileSync(f, 'utf8')) : require('./cases.js');
cases.forEach((src, i) => {
  fs.writeFileSync('/tmp/_c.php', src);
  let real; try { real = execFileSync('php', ['-d', 'display_errors=0', '/tmp/_c.php']).toString(); } catch (e) { real = 'PHPFAIL ' + (e.stdout || '').toString(); }
  const mine = PL.run(src); const got = mine.out + (mine.error ? 'ERR:' + mine.error.msg : '');
  if (real !== got) { bad++; console.log('--- case', i, '\nREAL:', JSON.stringify(real), '\nMINE:', JSON.stringify(got)); }
});
console.log(cases.length - bad, '/', cases.length, 'match real PHP');
