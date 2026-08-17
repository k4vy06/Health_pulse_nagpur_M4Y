const express = require('express');
const router = express.Router();
const { getAllAlerts, getAlertById, acknowledgeAlert, resolveAlert } = require('../controllers/alertController');

router.get('/', getAllAlerts);
router.get('/:id', getAlertById);
router.post('/:id/acknowledge', acknowledgeAlert);
router.post('/:id/resolve', resolveAlert);

module.exports = router;
