const { getDb } = require('../config/firebase');

const getAllWards = async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('wards').orderBy('wardId').get();
    const wards = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json({ success: true, data: wards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getWardById = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    // Get ward document
    const wardSnapshot = await db.collection('wards').where('wardId', '==', id).limit(1).get();
    if (wardSnapshot.empty) return res.status(404).json({ success: false, error: 'Ward not found' });
    
    const ward = { _id: wardSnapshot.docs[0].id, ...wardSnapshot.docs[0].data() };

    // Get disease reports for last 4 weeks
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const reportsSnapshot = await db.collection('diseaseReports')
      .where('wardId', '==', id)
      .where('date', '>=', fourWeeksAgo.toISOString())
      .get();

    const today = new Date();
    const diseaseWeekly = {};
    reportsSnapshot.docs.forEach(doc => {
      const r = doc.data();
      const reportDate = new Date(r.date);
      if (!diseaseWeekly[r.disease]) diseaseWeekly[r.disease] = [0, 0, 0, 0];
      const weeksAgo = Math.floor((today - reportDate) / (7 * 24 * 60 * 60 * 1000));
      const weekIdx = Math.min(3, Math.max(0, 3 - weeksAgo));
      diseaseWeekly[r.disease][weekIdx] += r.caseCount;
    });

    const weeklyTotals = [0, 0, 0, 0];
    Object.values(diseaseWeekly).forEach(weeks => {
      weeks.forEach((c, i) => { weeklyTotals[i] += c; });
    });

    // Active alert for this ward
    const alertSnapshot = await db.collection('alerts')
      .where('wardId', '==', id)
      .where('status', 'in', ['ACTIVE', 'ACKNOWLEDGED'])
      .limit(1)
      .get();
    const activeAlert = alertSnapshot.empty ? null : { _id: alertSnapshot.docs[0].id, ...alertSnapshot.docs[0].data() };

    // Facilities in this ward and neighbors
    const wardIds = [id, ...(ward.neighborWards || [])];
    const facilitiesSnapshot = await db.collection('facilities')
      .where('wardId', 'in', wardIds.slice(0, 10))
      .get();
    const facilities = facilitiesSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

    // Active interventions
    const interventionsSnapshot = await db.collection('interventions')
      .where('wardId', '==', id)
      .get();
    const interventions = interventionsSnapshot.docs
      .map(doc => ({ _id: doc.id, ...doc.data() }))
      .filter(i => i.status !== 'COMPLETED');

    // Neighbor wards
    const neighborIds = ward.neighborWards || [];
    let neighbors = [];
    if (neighborIds.length > 0) {
      const neighborsSnapshot = await db.collection('wards')
        .where('wardId', 'in', neighborIds.slice(0, 10))
        .get();
      neighbors = neighborsSnapshot.docs.map(doc => {
        const d = doc.data();
        return { wardId: d.wardId, name: d.name, currentRiskScore: d.currentRiskScore, currentRiskLevel: d.currentRiskLevel };
      });
    }

    res.json({
      success: true,
      data: {
        ...ward,
        diseaseWeekly,
        weeklyTotals,
        activeAlert,
        facilities,
        interventions,
        neighbors
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getWardAnalytics = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await db.collection('diseaseReports')
      .where('wardId', '==', id)
      .where('date', '>=', thirtyDaysAgo.toISOString())
      .get();

    const byDate = {};
    const byDisease = {};
    snapshot.docs.forEach(doc => {
      const r = doc.data();
      const dateStr = r.date.split('T')[0];
      if (!byDate[dateStr]) byDate[dateStr] = { date: dateStr, total: 0 };
      byDate[dateStr].total += r.caseCount;
      byDate[dateStr][r.disease] = (byDate[dateStr][r.disease] || 0) + r.caseCount;

      if (!byDisease[r.disease]) byDisease[r.disease] = 0;
      byDisease[r.disease] += r.caseCount;
    });

    const trend = Object.values(byDate);
    const distribution = Object.entries(byDisease).map(([name, value]) => ({ name, value }));

    res.json({ success: true, data: { trend, distribution } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAllWards, getWardById, getWardAnalytics };
