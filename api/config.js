// Which terms are open for learners. Term 1 is always open; the trainer opens Term 2 / 3 from /admin.
const { cmd, P } = require('../lib/redis');
const { send } = require('../lib/http');
module.exports = async (req, res) => {
  try {
    const h = (await cmd('HGETALL', P + 'cfg')) || [];
    const open = { t1: true, t2: false, t3: false };
    for (let i = 0; i < h.length; i += 2) if (h[i] in open) open[h[i]] = h[i + 1] === '1';
    open.t1 = true;
    send(res, 200, { open });
  } catch (e) { send(res, 200, { open: { t1: true, t2: false, t3: false } }); }
};
