const { getDb } = require('../config/firebase');

const getAllAlerts = async (req, res) => {
  try {
    const db = getDb();
    const { status, riskLevel } = req.query;
    
    let query = db.collection('alerts').orderBy('riskScore', 'desc');
    
    // Firestore doesn't support multiple inequality filters easily,
    // so we filter in memory for optional params
    const snapshot = await query.get();
    let alerts = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    
    if (status) alerts = alerts.filter(a => a.status === status);
    if (riskLevel) alerts = alerts.filter(a => a.riskLevel === riskLevel);
    
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getAlertById = async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('alerts').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ success: false, error: 'Alert not found' });
    res.json({ success: true, data: { _id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const acknowledgeAlert = async (req, res) => {
  try {
    const db = getDb();
    const { acknowledgedBy = 'Health Officer' } = req.body;
    const docRef = db.collection('alerts').doc(req.params.id);
    
    await docRef.update({
      status: 'ACKNOWLEDGED',
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString()
    });
    
    const updated = await docRef.get();
    res.json({ success: true, data: { _id: updated.id, ...updated.data() }, message: 'Alert acknowledged' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const resolveAlert = async (req, res) => {
  try {
    const db = getDb();
    const docRef = db.collection('alerts').doc(req.params.id);
    
    await docRef.update({
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString()
    });
    
    const updated = await docRef.get();
    res.json({ success: true, data: { _id: updated.id, ...updated.data() }, message: 'Alert resolved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAllAlerts, getAlertById, acknowledgeAlert, resolveAlert };
