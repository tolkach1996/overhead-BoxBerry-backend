const express = require('express');
const router = express.Router();
const { postSelectedFilters, getOrderById, updateOrderById } = require('../controllers/ms.controller');

router.post('/orders', postSelectedFilters);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id', updateOrderById)


module.exports = router;
