const { getDb } = require('../config/firebase');

const getAllFacilities = async (req, res) => {
  try {
    const db = getDb();
    const { wardId, status } = req.query;

    const snapshot = await db.collection('facilities').get();
    let facilities = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

    if (wardId) facilities = facilities.filter(f => f.wardId === wardId);
    if (status) facilities = facilities.filter(f => f.status === status);

    res.json({ success: true, data: facilities });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAllFacilities };
