const express = require('express');
const router = express.Router();
const { downloadConsigmentExcel, downloadPriceList } = require('../controllers/excel.controller');


router.post('/download', downloadConsigmentExcel);
router.get('/price-list', downloadPriceList);


module.exports = router;