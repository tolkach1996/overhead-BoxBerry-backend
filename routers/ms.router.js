const express = require('express');
const router = express.Router();
const { postSelectedFilters, getOrderById } = require('../controllers/ms.controller');

router.post('/orders', postSelectedFilters);
router.get('/orders/:id', getOrderById);


module.exports = router;
