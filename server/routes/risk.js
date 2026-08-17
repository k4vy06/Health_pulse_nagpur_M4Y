const express = require('express');
const router = express.Router();
const { analyzeRisk, getAIPlan, getSimulation, getDiseases, getAnalytics } = require('../controllers/riskController');

router.get('/diseases', getDiseases);
router.post('/risk/analyze', analyzeRisk);
router.post('/ai/response-plan', getAIPlan);
router.get('/simulation', getSimulation);
router.get('/analytics', getAnalytics);

module.exports = router;
