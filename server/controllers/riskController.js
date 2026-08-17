const { calculateRiskScore, projectOutbreak } = require('../services/riskEngine');
const { getAIResponsePlan } = require('../services/pulseAI');
const { getDb } = require('../config/firebase');

const analyzeRisk = async (req, res) => {
  try {
    const db = getDb();
    const { wardId, disease } = req.body;

    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Get ward
    const wardSnap = await db.collection('wards').where('wardId', '==', wardId).limit(1).get();
    if (wardSnap.empty) return res.status(404).json({ success: false, error: 'Ward not found' });
    const ward = wardSnap.docs[0].data();

    // Get current week disease reports
    const [currentSnap, prevSnap] = await Promise.all([
      db.collection('diseaseReports')
        .where('wardId', '==', wardId)
        .where('disease', '==', disease)
        .where('date', '>=', oneWeekAgo.toISOString())
        .get(),
      db.collection('diseaseReports')
        .where('wardId', '==', wardId)
        .where('disease', '==', disease)
        .where('date', '>=', twoWeeksAgo.toISOString())
        .where('date', '<', oneWeekAgo.toISOString())
        .get()
    ]);

    const currentCases = currentSnap.docs.reduce((s, d) => s + (d.data().caseCount || 0), 0);
    const previousCases = prevSnap.docs.reduce((s, d) => s + (d.data().caseCount || 0), 0);

    // Neighbor risk
    const neighborIds = ward.neighborWards || [];
    let neighborAvgRisk = 0;
    if (neighborIds.length > 0) {
      const neighborsSnap = await db.collection('wards')
        .where('wardId', 'in', neighborIds.slice(0, 10))
        .get();
      const scores = neighborsSnap.docs.map(d => d.data().currentRiskScore || 0);
      neighborAvgRisk = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    }

    // Get baseline
    const baselineSnap = await db.collection('diseaseBaselines')
      .where('wardId', '==', wardId)
      .where('disease', '==', disease)
      .limit(1)
      .get();
    const baseline = baselineSnap.empty ? null : baselineSnap.docs[0].data();

    const result = calculateRiskScore({
      currentCases,
      previousCases,
      population: ward.population,
      baselineAvg: baseline?.averageCases || previousCases * 1.5,
      baselinePeak: baseline?.historicalPeak || 20,
      neighborAvgRisk
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getAIPlan = async (req, res) => {
  try {
    const plan = await getAIResponsePlan(req.body);
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getSimulation = async (req, res) => {
  try {
    const { currentCases = 49, growthRate = 58, days = 30 } = req.query;
    const cases = parseFloat(currentCases);
    const rate = parseFloat(growthRate) / 100;
    const d = parseInt(days);

    const withoutIntervention = projectOutbreak(cases, rate, d, false);
    const withIntervention = projectOutbreak(cases, rate, d, true);

    res.json({ success: true, data: { withoutIntervention, withIntervention, growthRate: rate * 100 } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getDiseases = async (req, res) => {
  const diseases = ['Dengue', 'Malaria', 'Chikungunya', 'Typhoid', 'Influenza', 'Diarrheal Disease'];
  res.json({ success: true, data: diseases });
};

const getAnalytics = async (req, res) => {
  try {
    const db = getDb();
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    const [reportsSnap, wardsSnap, alertsSnap, interventionsSnap] = await Promise.all([
      db.collection('diseaseReports').where('date', '>=', thirtyDaysAgoStr).get(),
      db.collection('wards').get(),
      db.collection('alerts').where('createdAt', '>=', thirtyDaysAgoStr).get(),
      db.collection('interventions').get()
    ]);

    // Disease trend grouped by date + disease
    const dateMap = {};
    reportsSnap.docs.forEach(doc => {
      const r = doc.data();
      const dateStr = r.date.split('T')[0];
      if (!dateMap[dateStr]) dateMap[dateStr] = { date: dateStr };
      dateMap[dateStr][r.disease] = (dateMap[dateStr][r.disease] || 0) + r.caseCount;
    });
    const diseaseTrend = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);

    // Ward comparison
    const wardComparison = wardsSnap.docs
      .map(doc => {
        const d = doc.data();
        return { name: d.name.split(' ')[0], riskScore: d.currentRiskScore, level: d.currentRiskLevel };
      })
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    // Alert trend
    const alertDateMap = {};
    alertsSnap.docs.forEach(doc => {
      const a = doc.data();
      const dateStr = (a.createdAt || '').split('T')[0];
      if (dateStr) alertDateMap[dateStr] = (alertDateMap[dateStr] || 0) + 1;
    });
    const alertTrend = Object.entries(alertDateMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

    // Intervention stats
    const interventionMap = {};
    interventionsSnap.docs.forEach(doc => {
      const s = doc.data().status;
      interventionMap[s] = (interventionMap[s] || 0) + 1;
    });
    const interventionStats = Object.entries(interventionMap).map(([status, count]) => ({ status, count }));

    res.json({
      success: true,
      data: { diseaseTrend, wardComparison, alertTrend, interventionStats }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { analyzeRisk, getAIPlan, getSimulation, getDiseases, getAnalytics };
