const express = require('express');
const router = express.Router();
const { postSelectedFilters } = require('../controllers/ms.controller');

router.post('/orders', postSelectedFilters);


module.exports = router;
