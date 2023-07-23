const express = require('express');
const router = express.Router();
const { sendConsigmentBoxBerry } = require('../controllers/boxberry.controller');

router.post('/consigment', sendConsigmentBoxBerry);

module.exports = router;