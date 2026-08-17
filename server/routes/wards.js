const express = require('express');
const router = express.Router();
const { getAllWards, getWardById, getWardAnalytics } = require('../controllers/wardController');

router.get('/', getAllWards);
router.get('/:id', getWardById);
router.get('/:id/analytics', getWardAnalytics);

module.exports = router;
