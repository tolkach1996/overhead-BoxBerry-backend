const express = require('express');
const router = express.Router();

const OrdersController = require('./orders.controller');

router.post('/', OrdersController.getOrdersByFilter);
router.get('/move', OrdersController.getOrdersMove);
router.get('/:id', OrdersController.getOrderByDocumentId);
router.patch('/:id', OrdersController.updateOrderById);


module.exports = router;
