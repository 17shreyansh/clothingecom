const express = require('express');
const router = express.Router();
const { getPackingTime } = require('../controllers/packingTime');

router.get('/', getPackingTime);

module.exports = router;