const { load } = require('../lib/content');
const { send } = require('../lib/http');
module.exports = async (req, res) => {
  try { const c = await load(false); res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30'); res.status(200).json(c); }
  catch (e) { send(res, 500, { error: 'Could not load' }); }
};
