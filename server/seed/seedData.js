/**
 * HealthPulse Nagpur - Firebase Firestore Seeder
 * Populates Firestore with synthetic demo data for the Sakkardara Dengue outbreak scenario.
 *
 * Usage:
 *   1. Set FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json in server/.env
 *   2. Run: node seed/seedData.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initializeFirebase } = require('../config/firebase');
const { WARDS, generatePolygon } = require('./wardData');
const { calculateRiskScore } = require('../services/riskEngine');

const DISEASES = ['Dengue', 'Malaria', 'Chikungunya', 'Typhoid', 'Influenza', 'Diarrheal Disease'];

const WARD_DISEASE_PARAMS = {
  'W01': { // Sakkardara — CRITICAL DENGUE OUTBREAK
    Dengue:              { base: 8,  growthFactor: 1.65, peak: 49, trend: [12, 18, 31, 49] },
    Malaria:             { base: 3,  growthFactor: 1.2,  peak: 15 },
    Chikungunya:         { base: 2,  growthFactor: 1.1,  peak: 8 },
    Typhoid:             { base: 2,  growthFactor: 1.0,  peak: 6 },
    Influenza:           { base: 4,  growthFactor: 1.05, peak: 12 },
    'Diarrheal Disease': { base: 3,  growthFactor: 1.0,  peak: 9 }
  },
  'W02': { // Manewada — HIGH dengue, spillover from W01
    Dengue:              { base: 5,  growthFactor: 1.35, peak: 28 },
    Malaria:             { base: 4,  growthFactor: 1.15, peak: 18 },
    Chikungunya:         { base: 2,  growthFactor: 1.1,  peak: 7 },
    Typhoid:             { base: 3,  growthFactor: 1.05, peak: 10 },
    Influenza:           { base: 5,  growthFactor: 1.0,  peak: 14 },
    'Diarrheal Disease': { base: 4,  growthFactor: 1.0,  peak: 11 }
  },
  'W03': { // Nandanvan — MODERATE dengue
    Dengue:              { base: 4,  growthFactor: 1.25, peak: 19 },
    Malaria:             { base: 5,  growthFactor: 1.2,  peak: 22 },
    Chikungunya:         { base: 3,  growthFactor: 1.15, peak: 12 },
    Typhoid:             { base: 2,  growthFactor: 1.05, peak: 8 },
    Influenza:           { base: 4,  growthFactor: 1.0,  peak: 11 },
    'Diarrheal Disease': { base: 3,  growthFactor: 1.0,  peak: 9 }
  },
  'W08': { // Indora — HIGH malaria
    Dengue:              { base: 3,  growthFactor: 1.15, peak: 12 },
    Malaria:             { base: 7,  growthFactor: 1.40, peak: 35 },
    Chikungunya:         { base: 2,  growthFactor: 1.1,  peak: 8 },
    Typhoid:             { base: 4,  growthFactor: 1.1,  peak: 14 },
    Influenza:           { base: 5,  growthFactor: 1.0,  peak: 13 },
    'Diarrheal Disease': { base: 5,  growthFactor: 1.1,  peak: 16 }
  },
  'W10': { // Bhandewadi — HIGH typhoid (water issue)
    Dengue:              { base: 2,  growthFactor: 1.1,  peak: 8 },
    Malaria:             { base: 3,  growthFactor: 1.1,  peak: 11 },
    Chikungunya:         { base: 2,  growthFactor: 1.05, peak: 6 },
    Typhoid:             { base: 6,  growthFactor: 1.5,  peak: 32 },
    Influenza:           { base: 4,  growthFactor: 1.0,  peak: 10 },
    'Diarrheal Disease': { base: 8,  growthFactor: 1.4,  peak: 38 }
  }
};

function getDefaultParams() {
  const params = {};
  DISEASES.forEach(d => {
    params[d] = { base: Math.floor(Math.random() * 4) + 1, growthFactor: 1 + Math.random() * 0.1, peak: Math.floor(Math.random() * 10) + 5 };
  });
  return params;
}

// Write a batch of documents with auto-generated IDs
async function batchWrite(db, collectionName, documents) {
  const BATCH_SIZE = 400; // Firestore max is 500
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = documents.slice(i, i + BATCH_SIZE);
    chunk.forEach(doc => {
      const ref = db.collection(collectionName).doc();
      batch.set(ref, doc);
    });
    await batch.commit();
    console.log(`  Wrote ${Math.min(i + BATCH_SIZE, documents.length)}/${documents.length} to ${collectionName}`);
  }
}

// Write named documents (with explicit IDs)
async function batchWriteNamed(db, collectionName, documents) {
  const BATCH_SIZE = 400;
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = documents.slice(i, i + BATCH_SIZE);
    chunk.forEach(({ id, data }) => {
      const ref = db.collection(collectionName).doc(id);
      batch.set(ref, data);
    });
    await batch.commit();
  }
}

// Delete all documents in a collection
async function clearCollection(db, collectionName) {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) return;
  const BATCH_SIZE = 400;
  for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    snapshot.docs.slice(i, i + BATCH_SIZE).forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
  console.log(`  Cleared ${snapshot.docs.length} docs from ${collectionName}`);
}

async function seedWards(db) {
  console.log('\n🏘️  Seeding wards...');
  await clearCollection(db, 'wards');

  const batch = db.batch();
  WARDS.forEach(w => {
    const ref = db.collection('wards').doc(w.wardId);
    batch.set(ref, {
      wardId: w.wardId,
      name: w.name,
      zone: w.zone,
      population: w.population,
      area: w.area,
      centroid: { lat: w.lat, lng: w.lng },
      neighborWards: w.neighborWards,
      currentRiskScore: 10,
      currentRiskLevel: 'LOW',
      createdAt: new Date().toISOString()
    });
  });
  await batch.commit();
  console.log(`✅ Seeded ${WARDS.length} wards`);
}

async function seedDiseaseReports(db) {
  console.log('\n🦠  Seeding disease reports (60 days)...');
  await clearCollection(db, 'diseaseReports');

  const reports = [];
  const today = new Date();

  for (const ward of WARDS) {
    const params = WARD_DISEASE_PARAMS[ward.wardId] || getDefaultParams();
    for (const disease of DISEASES) {
      const dp = params[disease] || { base: 2, growthFactor: 1.0, peak: 8 };
      for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);

        let cases;
        if (ward.wardId === 'W01' && disease === 'Dengue' && dp.trend) {
          const weekAgo = Math.floor(daysAgo / 7);
          if (weekAgo === 0) cases = 49 + Math.floor(Math.random() * 3) - 1;
          else if (weekAgo === 1) cases = 31 + Math.floor(Math.random() * 4) - 2;
          else if (weekAgo === 2) cases = 18 + Math.floor(Math.random() * 3) - 1;
          else if (weekAgo === 3) cases = 12 + Math.floor(Math.random() * 2);
          else cases = Math.max(0, dp.base + Math.floor(Math.random() * 4) - 2);
        } else {
          const progressFactor = (60 - daysAgo) / 60;
          const baseCases = Math.floor(dp.base * Math.pow(dp.growthFactor, progressFactor * 8));
          cases = Math.max(0, baseCases + Math.floor(Math.random() * 3) - 1);
        }

        if (cases > 0) {
          reports.push({
            wardId: ward.wardId,
            disease,
            date: date.toISOString(),
            caseCount: cases,
            ageGroup: 'All',
            severity: cases > 20 ? 'SEVERE' : cases > 10 ? 'MODERATE' : 'MILD',
            week: Math.floor(daysAgo / 7),
            month: date.getMonth() + 1,
            createdAt: new Date().toISOString()
          });
        }
      }
    }
  }

  await batchWrite(db, 'diseaseReports', reports);
  console.log(`✅ Seeded ${reports.length} disease reports`);
}

async function seedBaselines(db) {
  console.log('\n📊  Seeding disease baselines...');
  await clearCollection(db, 'diseaseBaselines');

  const baselines = [];
  for (const ward of WARDS) {
    for (const disease of DISEASES) {
      const params = (WARD_DISEASE_PARAMS[ward.wardId] || {})[disease] || { base: 2, peak: 8 };
      baselines.push({
        wardId: ward.wardId,
        disease,
        averageCases: params.base * 3,
        historicalPeak: params.peak * 0.6,
        expectedWeekly: params.base * 2,
        season: ['Dengue', 'Malaria', 'Chikungunya'].includes(disease) ? 'MONSOON' : 'ALL',
        createdAt: new Date().toISOString()
      });
    }
  }
  await batchWrite(db, 'diseaseBaselines', baselines);
  console.log(`✅ Seeded ${baselines.length} baselines`);
}

async function seedAlerts(db) {
  console.log('\n🚨  Seeding alerts...');
  await clearCollection(db, 'alerts');

  const now = new Date().toISOString();
  const alerts = [
    {
      id: 'a1', data: {
        wardId: 'W01', wardName: 'Sakkardara', disease: 'Dengue',
        riskScore: 87, riskLevel: 'CRITICAL', currentCases: 49, previousCases: 31, growthPercent: 58,
        reason: 'Dengue cases in Sakkardara ward have surged 58% in one week (31 → 49 cases), significantly exceeding the historical baseline of 12 cases/week. Vector breeding sites identified. Immediate intervention required.',
        status: 'ACTIVE', riskBreakdown: { caseGrowth: 92, caseDensity: 76, historicalPattern: 84, neighborRisk: 72 },
        createdAt: now
      }
    },
    {
      id: 'a2', data: {
        wardId: 'W08', wardName: 'Indora', disease: 'Malaria',
        riskScore: 74, riskLevel: 'HIGH', currentCases: 35, previousCases: 22, growthPercent: 59,
        reason: 'Malaria cases rising sharply in Indora ward. 35 confirmed cases this week vs 22 last week. Stagnant water breeding sites detected near Nag River tributary.',
        status: 'ACKNOWLEDGED', riskBreakdown: { caseGrowth: 82, caseDensity: 68, historicalPattern: 72, neighborRisk: 55 },
        createdAt: now
      }
    },
    {
      id: 'a3', data: {
        wardId: 'W10', wardName: 'Bhandewadi', disease: 'Typhoid',
        riskScore: 71, riskLevel: 'HIGH', currentCases: 32, previousCases: 19, growthPercent: 68,
        reason: 'Sharp increase in typhoid cases in Bhandewadi. Water supply contamination suspected. 32 cases this week vs 19 last week. Samples sent for analysis.',
        status: 'ACTIVE', riskBreakdown: { caseGrowth: 78, caseDensity: 64, historicalPattern: 68, neighborRisk: 48 },
        createdAt: now
      }
    },
    {
      id: 'a4', data: {
        wardId: 'W02', wardName: 'Manewada', disease: 'Dengue',
        riskScore: 65, riskLevel: 'HIGH', currentCases: 28, previousCases: 18, growthPercent: 56,
        reason: 'Dengue cases increasing in Manewada — likely spillover from neighboring Sakkardara outbreak.',
        status: 'ACTIVE', riskBreakdown: { caseGrowth: 74, caseDensity: 58, historicalPattern: 65, neighborRisk: 80 },
        createdAt: now
      }
    },
    {
      id: 'a5', data: {
        wardId: 'W03', wardName: 'Nandanvan', disease: 'Dengue',
        riskScore: 52, riskLevel: 'MODERATE', currentCases: 19, previousCases: 13, growthPercent: 46,
        reason: 'Moderate dengue activity in Nandanvan. Monitor for potential escalation given proximity to Sakkardara.',
        status: 'ACKNOWLEDGED', riskBreakdown: { caseGrowth: 58, caseDensity: 44, historicalPattern: 52, neighborRisk: 72 },
        createdAt: now
      }
    }
  ];

  await batchWriteNamed(db, 'alerts', alerts);
  console.log(`✅ Seeded ${alerts.length} alerts`);
}

async function seedFacilities(db) {
  console.log('\n🏥  Seeding health facilities...');
  await clearCollection(db, 'facilities');

  const now = new Date().toISOString();
  const facilities = [
    { id: 'f1', data: { name: 'Urban PHC Sakkardara', type: 'PHC', wardId: 'W01', address: 'Near Gandhi Chowk, Sakkardara, Nagpur', beds: 30, availableBeds: 8, doctors: 3, status: 'PRESSURE', phone: '0712-2631001', location: { lat: 21.1558, lng: 79.1182 }, createdAt: now } },
    { id: 'f2', data: { name: 'NMC Urban Health Center Manewada', type: 'URBAN_HEALTH_CENTER', wardId: 'W02', address: 'Manewada Road, Nagpur', beds: 20, availableBeds: 6, doctors: 2, status: 'PRESSURE', phone: '0712-2631002', location: { lat: 21.1458, lng: 79.1282 }, createdAt: now } },
    { id: 'f3', data: { name: 'District Hospital (Daga)', type: 'DISTRICT_HOSPITAL', wardId: 'W18', address: 'Sitabuldi, Nagpur', beds: 350, availableBeds: 112, doctors: 45, status: 'NORMAL', phone: '0712-2640000', specialties: ['Emergency', 'Medicine', 'Pediatrics', 'Gynecology'], location: { lat: 21.1458, lng: 79.0982 }, createdAt: now } },
    { id: 'f4', data: { name: 'Government Medical College Hospital', type: 'DISTRICT_HOSPITAL', wardId: 'W17', address: 'Dharampeth, Nagpur', beds: 800, availableBeds: 287, doctors: 120, status: 'NORMAL', phone: '0712-2748900', specialties: ['Emergency', 'ICU', 'Medicine', 'Surgery', 'Tropical Diseases'], location: { lat: 21.1358, lng: 79.0982 }, createdAt: now } },
    { id: 'f5', data: { name: 'Urban PHC Indora', type: 'PHC', wardId: 'W08', address: 'Indora, Nagpur', beds: 25, availableBeds: 7, doctors: 2, status: 'PRESSURE', phone: '0712-2631008', location: { lat: 21.1358, lng: 79.0782 }, createdAt: now } },
    { id: 'f6', data: { name: 'CHC Bhandewadi', type: 'CHC', wardId: 'W10', address: 'Bhandewadi Road, Nagpur', beds: 50, availableBeds: 18, doctors: 6, status: 'NORMAL', phone: '0712-2631010', location: { lat: 21.1058, lng: 79.1082 }, createdAt: now } },
    { id: 'f7', data: { name: 'NMC Dispensary Pratap Nagar', type: 'DISPENSARY', wardId: 'W07', address: 'Pratap Nagar, Nagpur', beds: 10, availableBeds: 7, doctors: 2, status: 'NORMAL', phone: '0712-2631007', location: { lat: 21.1158, lng: 79.0682 }, createdAt: now } },
    { id: 'f8', data: { name: 'Urban PHC Kamptee', type: 'PHC', wardId: 'W11', address: 'Kamptee Road, Nagpur', beds: 30, availableBeds: 21, doctors: 3, status: 'NORMAL', phone: '0712-2631011', location: { lat: 21.1758, lng: 79.0682 }, createdAt: now } },
    { id: 'f9', data: { name: 'Sitabuldi Urban Health Center', type: 'URBAN_HEALTH_CENTER', wardId: 'W18', address: 'Sitabuldi, Nagpur', beds: 15, availableBeds: 11, doctors: 2, status: 'NORMAL', phone: '0712-2631018', location: { lat: 21.1458, lng: 79.0882 }, createdAt: now } },
    { id: 'f10', data: { name: 'Nandanvan PHC', type: 'PHC', wardId: 'W03', address: 'Nandanvan, Nagpur', beds: 25, availableBeds: 14, doctors: 3, status: 'NORMAL', phone: '0712-2631003', location: { lat: 21.1658, lng: 79.1082 }, createdAt: now } }
  ];

  await batchWriteNamed(db, 'facilities', facilities);
  console.log(`✅ Seeded ${facilities.length} facilities`);
}

async function seedInterventions(db) {
  console.log('\n🚑  Seeding interventions...');
  await clearCollection(db, 'interventions');

  const now = new Date().toISOString();
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

  const interventions = [
    {
      id: 'i1', data: {
        wardId: 'W01', wardName: 'Sakkardara', disease: 'Dengue',
        title: 'Dengue Emergency Vector Control - Sakkardara',
        action: 'Emergency vector control and surveillance response for dengue outbreak',
        assignedTeam: 'Vector Control Team Alpha', priority: 'URGENT', status: 'IN_PROGRESS',
        tasks: [
          { label: 'Field inspection of breeding sites', completed: true },
          { label: 'Larval survey completed', completed: true },
          { label: 'Fogging operation in Zone A', completed: true },
          { label: 'Community advisory distributed', completed: false },
          { label: 'Follow-up surveillance day 7', completed: false },
          { label: 'ASHA worker mobilization', completed: false }
        ],
        notes: 'High-density breeding sites found near construction sites and waterlogged areas.',
        startedAt: twoDaysAgo, createdAt: twoDaysAgo, createdBy: 'Dr. Priya Sharma'
      }
    },
    {
      id: 'i2', data: {
        wardId: 'W08', wardName: 'Indora', disease: 'Malaria',
        title: 'Malaria RDT Drive - Indora',
        action: 'Rapid diagnostic testing and indoor residual spraying',
        assignedTeam: 'Malaria Control Team Beta', priority: 'HIGH', status: 'IN_PROGRESS',
        tasks: [
          { label: 'RDT camp setup at PHC', completed: true },
          { label: 'Blood smear testing drive', completed: true },
          { label: 'Indoor residual spraying (IRS)', completed: false },
          { label: 'Bed net distribution', completed: false },
          { label: 'Follow-up case tracking', completed: false }
        ],
        notes: 'Plasmodium vivax dominant. IRS planned for next 2 days.',
        startedAt: oneDayAgo, createdAt: oneDayAgo, createdBy: 'Dr. Rajesh Kumar'
      }
    },
    {
      id: 'i3', data: {
        wardId: 'W10', wardName: 'Bhandewadi', disease: 'Typhoid',
        title: 'Water Safety Inspection - Bhandewadi',
        action: 'Water supply inspection and chlorination',
        assignedTeam: 'Sanitation & Water Safety Team', priority: 'URGENT', status: 'ASSIGNED',
        tasks: [
          { label: 'Water sample collection', completed: false },
          { label: 'Lab testing for contamination', completed: false },
          { label: 'Emergency chlorination', completed: false },
          { label: 'Boil-water advisory issued', completed: false },
          { label: 'ORS distribution to households', completed: false }
        ],
        notes: 'Water supply suspected as source. Samples collected and sent to lab.',
        createdAt: now, createdBy: 'Health Officer Nagpur'
      }
    },
    {
      id: 'i4', data: {
        wardId: 'W02', wardName: 'Manewada', disease: 'Dengue',
        title: 'Dengue Containment - Manewada',
        action: 'Vector control and community surveillance to prevent Sakkardara spillover',
        assignedTeam: 'Vector Control Team Gamma', priority: 'HIGH', status: 'ASSIGNED',
        tasks: [
          { label: 'Boundary surveillance setup', completed: false },
          { label: 'Container survey', completed: false },
          { label: 'Preventive fogging', completed: false },
          { label: 'Community awareness camp', completed: false }
        ],
        createdAt: now, createdBy: 'Dr. Priya Sharma'
      }
    },
    {
      id: 'i5', data: {
        wardId: 'W03', wardName: 'Nandanvan', disease: 'Dengue',
        title: 'Dengue Monitoring - Nandanvan',
        action: 'Enhanced surveillance and preventive measures',
        assignedTeam: 'Surveillance Team Delta', priority: 'ROUTINE', status: 'COMPLETED',
        tasks: [
          { label: 'Weekly case count review', completed: true },
          { label: 'School advisory issued', completed: true },
          { label: 'PHC briefed on dengue protocol', completed: true }
        ],
        completedAt: oneDayAgo, createdAt: oneDayAgo, createdBy: 'Health Officer Nagpur'
      }
    }
  ];

  await batchWriteNamed(db, 'interventions', interventions);
  console.log(`✅ Seeded ${interventions.length} interventions`);
}

async function updateWardRiskScores(db) {
  console.log('\n🔄  Updating ward risk scores...');

  const riskOverrides = {
    'W01': { currentRiskScore: 87, currentRiskLevel: 'CRITICAL' },
    'W08': { currentRiskScore: 74, currentRiskLevel: 'HIGH' },
    'W10': { currentRiskScore: 71, currentRiskLevel: 'HIGH' },
    'W02': { currentRiskScore: 65, currentRiskLevel: 'HIGH' },
    'W03': { currentRiskScore: 52, currentRiskLevel: 'MODERATE' },
    'W09': { currentRiskScore: 45, currentRiskLevel: 'MODERATE' },
    'W07': { currentRiskScore: 42, currentRiskLevel: 'MODERATE' },
    'W20': { currentRiskScore: 38, currentRiskLevel: 'MODERATE' },
    'W06': { currentRiskScore: 35, currentRiskLevel: 'MODERATE' },
    'W16': { currentRiskScore: 33, currentRiskLevel: 'MODERATE' },
    'W13': { currentRiskScore: 30, currentRiskLevel: 'LOW' },
    'W04': { currentRiskScore: 28, currentRiskLevel: 'LOW' },
    'W17': { currentRiskScore: 28, currentRiskLevel: 'LOW' },
    'W12': { currentRiskScore: 25, currentRiskLevel: 'LOW' },
    'W14': { currentRiskScore: 20, currentRiskLevel: 'LOW' },
    'W18': { currentRiskScore: 22, currentRiskLevel: 'LOW' },
    'W05': { currentRiskScore: 22, currentRiskLevel: 'LOW' },
    'W19': { currentRiskScore: 19, currentRiskLevel: 'LOW' },
    'W11': { currentRiskScore: 18, currentRiskLevel: 'LOW' },
    'W15': { currentRiskScore: 15, currentRiskLevel: 'LOW' },
    'W21': { currentRiskScore: 12, currentRiskLevel: 'LOW' },
    'W22': { currentRiskScore: 10, currentRiskLevel: 'LOW' }
  };

  const batch = db.batch();
  Object.entries(riskOverrides).forEach(([wardId, data]) => {
    const ref = db.collection('wards').doc(wardId);
    batch.update(ref, data);
  });
  await batch.commit();
  console.log('✅ Ward risk scores updated');
}

async function seed() {
  console.log('\n🌱 HealthPulse Nagpur — Firebase Firestore Seeder');
  console.log('================================================');
  
  const db = initializeFirebase();
  if (!db) {
    console.error('\n❌ Firebase not initialized. Check your service account credentials in .env');
    console.error('   Set FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json');
    process.exit(1);
  }

  try {
    await seedWards(db);
    await seedDiseaseReports(db);
    await seedBaselines(db);
    await seedAlerts(db);
    await seedFacilities(db);
    await seedInterventions(db);
    await updateWardRiskScores(db);

    console.log('\n🎉 HealthPulse Nagpur Firestore seeded successfully!');
    console.log('📊 Demo scenario ready: Sakkardara Dengue Outbreak (Risk: 87/100 CRITICAL)');
    console.log('🔥 View data in Firebase Console: https://console.firebase.google.com\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
