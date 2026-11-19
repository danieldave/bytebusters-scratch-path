// node scripts/gen-ids.js [perSchool=40]
// Makes data/roster.seed.json (mock IDs) and data/ID-CARDS.csv (print sheet).
const fs = require('fs'); const ids = require('../lib/ids');
const per = Number(process.argv[2] || 40);
const S = { MHS: 'Methodist High School Arigbajo', UHS: 'Unity High School', YWS: 'Yewa College Ilaro' };
let seed = 1; const rnd = () => { seed = (seed * 48271) % 2147483647; return seed / 2147483647; }; // repeatable
const seen = new Set(), out = [];
for (const [code, nm] of Object.entries(S)) for (let i = 1; i <= per; i++) {
  let id; do id = ids.make(code, rnd); while (seen.has(id)); seen.add(id);
  out.push({ id, school: code, name: 'Learner ' + code + '-' + String(i).padStart(2, '0') });
}
fs.writeFileSync(__dirname + '/../data/roster.seed.json', JSON.stringify(out, null, 1));
fs.writeFileSync(__dirname + '/../data/ID-CARDS.csv', 'ID,School,Mock name,REAL NAME (write here)\n' + out.map((r) => [r.id, S[r.school], r.name, ''].join(',')).join('\n') + '\n');
console.log(out.length + ' mock IDs written');
