const express = require('express');
const router = express.Router();
const { getFilterData } = require('../controllers/filter.controller');

router.get('/', getFilterData);


module.exports = router;