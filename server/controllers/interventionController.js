const { getDb } = require('../config/firebase');

const getAllInterventions = async (req, res) => {
  try {
    const db = getDb();
    const { status, wardId } = req.query;

    let snapshot = await db.collection('interventions').orderBy('createdAt', 'desc').get();
    let interventions = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

    if (status) interventions = interventions.filter(i => i.status === status);
    if (wardId) interventions = interventions.filter(i => i.wardId === wardId);

    res.json({ success: true, data: interventions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createIntervention = async (req, res) => {
  try {
    const db = getDb();
    const data = {
      ...req.body,
      createdAt: new Date().toISOString(),
      status: req.body.status || 'ASSIGNED'
    };
    const docRef = await db.collection('interventions').add(data);
    res.status(201).json({ success: true, data: { _id: docRef.id, ...data }, message: 'Intervention created' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const updateIntervention = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const update = { ...req.body };

    if (update.status === 'IN_PROGRESS' && !update.startedAt) {
      update.startedAt = new Date().toISOString();
    }
    if (update.status === 'COMPLETED' && !update.completedAt) {
      update.completedAt = new Date().toISOString();
    }

    const docRef = db.collection('interventions').doc(id);
    await docRef.update(update);
    const updated = await docRef.get();
    res.json({ success: true, data: { _id: updated.id, ...updated.data() }, message: 'Intervention updated' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const db = getDb();
    const { id, taskIndex } = req.params;
    const { completed } = req.body;

    const docRef = db.collection('interventions').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ success: false, error: 'Intervention not found' });

    const data = doc.data();
    const tasks = [...(data.tasks || [])];
    const idx = parseInt(taskIndex);
    if (tasks[idx] !== undefined) {
      tasks[idx] = { ...tasks[idx], completed };
    }

    const allCompleted = tasks.length > 0 && tasks.every(t => t.completed);
    const statusUpdate = {
      tasks,
      status: allCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      ...(allCompleted ? { completedAt: new Date().toISOString() } : {})
    };

    await docRef.update(statusUpdate);
    const updated = await docRef.get();
    res.json({ success: true, data: { _id: updated.id, ...updated.data() } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = { getAllInterventions, createIntervention, updateIntervention, updateTask };
