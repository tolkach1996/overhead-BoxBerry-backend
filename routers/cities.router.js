const express = require('express');
const router = express.Router();

const CitiesController = require('../controllers/cities.controller');

router.get('/', CitiesController.getAll);
router.patch('/:id', CitiesController.updateOne)

module.exports = router;