const express = require('express');
const router = express.Router();
const { downloadConsigmentExcel } = require('../controllers/excel.controller');


router.post('/download', downloadConsigmentExcel);


module.exports = router;