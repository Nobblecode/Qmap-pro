

const kycService = require('../server/services/kycService');
const fraudService = require('../server/services/fraudService');
const currencyService = require('../server/services/currencyService');

const appServer = require('../server/appServer');

async function handleRequest(req, res) {
  try {
    const { type, payload } = req.body;

    switch (type) {
      case 'KYC':
        return res.json(await kycService.verify(payload));

      case 'FRAUD':
        return res.json(await fraudService.check(payload));

      case 'CURRENCY':
        return res.json(await currencyService.convert(payload));

      // Route to App Server for business logic
      case 'AFFILIATE':
        return res.json(await appServer.handleAffiliate(payload));

      case 'PRODUCT':
        return res.json(await appServer.handleProduct(payload));

      default:
        return res.status(400).json({ error: 'Unknown request type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { handleRequest };
