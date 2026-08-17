const { getDb } = require('../config/firebase');

const getDashboardStats = async (req, res) => {
  try {
    const db = getDb();
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString();

    // Parallel Firestore reads
    const [wardsSnap, alertsSnap, interventionsSnap, facilitiesSnap, reportsSnap] = await Promise.all([
      db.collection('wards').get(),
      db.collection('alerts').get(),
      db.collection('interventions').get(),
      db.collection('facilities').get(),
      db.collection('diseaseReports').where('date', '>=', oneWeekAgoStr).get()
    ]);

    const wards = wardsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    const allAlerts = alertsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    const allInterventions = interventionsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    const allFacilities = facilitiesSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    const recentReports = reportsSnap.docs.map(doc => doc.data());

    // Filter in memory
    const activeAlerts = allAlerts.filter(a => ['ACTIVE', 'ACKNOWLEDGED'].includes(a.status));
    const activeInterventions = allInterventions.filter(i => !['COMPLETED', 'CANCELLED'].includes(i.status));
    const highRiskWards = wards.filter(w => ['HIGH', 'CRITICAL'].includes(w.currentRiskLevel));
    const criticalWards = wards.filter(w => w.currentRiskLevel === 'CRITICAL');
    const facilitiesUnderPressure = allFacilities.filter(f => ['PRESSURE', 'CRITICAL'].includes(f.status));

    // Sum weekly cases
    const totalCases = recentReports.reduce((sum, r) => sum + (r.caseCount || 0), 0);

    // Disease breakdown
    const diseaseMap = {};
    recentReports.forEach(r => {
      diseaseMap[r.disease] = (diseaseMap[r.disease] || 0) + r.caseCount;
    });
    const diseaseBreakdown = Object.entries(diseaseMap)
      .map(([disease, cases]) => ({ disease, cases }))
      .sort((a, b) => b.cases - a.cases);

    res.json({
      success: true,
      data: {
        totalCases,
        activeAlerts: activeAlerts.length,
        highRiskWards: highRiskWards.length,
        criticalWards: criticalWards.length,
        activeInterventions: activeInterventions.length,
        diseasesMonitored: 6,
        facilitiesUnderPressure: facilitiesUnderPressure.length,
        wards: wards.map(w => ({
          wardId: w.wardId,
          name: w.name,
          zone: w.zone,
          population: w.population,
          currentRiskScore: w.currentRiskScore,
          currentRiskLevel: w.currentRiskLevel,
          centroid: w.centroid
        })),
        diseaseBreakdown,
        recentAlerts: activeAlerts.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getDashboardStats };
