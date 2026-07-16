const { Router } = require('express');
const { generateWallet, getWalletBalance } = require('../controllers/wallet.controller');

const router = Router();

router.post('/', generateWallet);
router.get('/:address', getWalletBalance);

module.exports = router;
