const express = require('express');
const router = express.Router();
const { getAllInterventions, createIntervention, updateIntervention, updateTask } = require('../controllers/interventionController');

router.get('/', getAllInterventions);
router.post('/', createIntervention);
router.put('/:id', updateIntervention);
router.patch('/:id/tasks/:taskIndex', updateTask);

module.exports = router;
