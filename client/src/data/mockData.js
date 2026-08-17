/**
 * Mock data for frontend to work without backend/MongoDB
 * Used as fallback when API calls fail
 */

export const MOCK_WARDS = [
  { wardId: 'W01', name: 'Sakkardara', zone: 'East', population: 182400, currentRiskScore: 87, currentRiskLevel: 'CRITICAL', centroid: { lat: 21.1558, lng: 79.1182 } },
  { wardId: 'W02', name: 'Manewada', zone: 'East', population: 145200, currentRiskScore: 65, currentRiskLevel: 'HIGH', centroid: { lat: 21.1458, lng: 79.1282 } },
  { wardId: 'W03', name: 'Nandanvan', zone: 'East', population: 132000, currentRiskScore: 52, currentRiskLevel: 'MODERATE', centroid: { lat: 21.1658, lng: 79.1082 } },
  { wardId: 'W04', name: 'Hudkeshwar', zone: 'East', population: 118500, currentRiskScore: 28, currentRiskLevel: 'LOW', centroid: { lat: 21.1758, lng: 79.0982 } },
  { wardId: 'W05', name: 'Wathoda', zone: 'East', population: 95000, currentRiskScore: 22, currentRiskLevel: 'LOW', centroid: { lat: 21.1858, lng: 79.1182 } },
  { wardId: 'W06', name: 'Ajni', zone: 'West', population: 128000, currentRiskScore: 35, currentRiskLevel: 'MODERATE', centroid: { lat: 21.1258, lng: 79.0582 } },
  { wardId: 'W07', name: 'Pratap Nagar', zone: 'West', population: 156000, currentRiskScore: 42, currentRiskLevel: 'MODERATE', centroid: { lat: 21.1158, lng: 79.0682 } },
  { wardId: 'W08', name: 'Indora', zone: 'West', population: 141000, currentRiskScore: 74, currentRiskLevel: 'HIGH', centroid: { lat: 21.1358, lng: 79.0782 } },
  { wardId: 'W09', name: 'Yashodhara Nagar', zone: 'Central', population: 98000, currentRiskScore: 45, currentRiskLevel: 'MODERATE', centroid: { lat: 21.1458, lng: 79.0882 } },
  { wardId: 'W10', name: 'Bhandewadi', zone: 'South', population: 87500, currentRiskScore: 71, currentRiskLevel: 'HIGH', centroid: { lat: 21.1058, lng: 79.1082 } },
  { wardId: 'W11', name: 'Kamptee Road', zone: 'North', population: 165000, currentRiskScore: 18, currentRiskLevel: 'LOW', centroid: { lat: 21.1758, lng: 79.0682 } },
  { wardId: 'W12', name: 'Rana Pratap Nagar', zone: 'North', population: 143500, currentRiskScore: 25, currentRiskLevel: 'LOW', centroid: { lat: 21.1658, lng: 79.0782 } },
  { wardId: 'W13', name: 'Pardi', zone: 'South', population: 112000, currentRiskScore: 30, currentRiskLevel: 'LOW', centroid: { lat: 21.0958, lng: 79.1182 } },
  { wardId: 'W14', name: 'Kalamna', zone: 'North', population: 124000, currentRiskScore: 20, currentRiskLevel: 'LOW', centroid: { lat: 21.1858, lng: 79.0882 } },
  { wardId: 'W15', name: 'Hingna', zone: 'West', population: 89000, currentRiskScore: 15, currentRiskLevel: 'LOW', centroid: { lat: 21.1558, lng: 79.0382 } },
  { wardId: 'W16', name: 'Manish Nagar', zone: 'South', population: 135000, currentRiskScore: 33, currentRiskLevel: 'MODERATE', centroid: { lat: 21.0858, lng: 79.0982 } },
  { wardId: 'W17', name: 'Dharampeth', zone: 'Central', population: 178000, currentRiskScore: 28, currentRiskLevel: 'LOW', centroid: { lat: 21.1358, lng: 79.0982 } },
  { wardId: 'W18', name: 'Sitabuldi', zone: 'Central', population: 92000, currentRiskScore: 22, currentRiskLevel: 'LOW', centroid: { lat: 21.1458, lng: 79.0982 } },
  { wardId: 'W19', name: 'Gandhibagh', zone: 'Central', population: 108500, currentRiskScore: 19, currentRiskLevel: 'LOW', centroid: { lat: 21.1558, lng: 79.0882 } },
  { wardId: 'W20', name: 'Itwari', zone: 'Central', population: 123000, currentRiskScore: 38, currentRiskLevel: 'MODERATE', centroid: { lat: 21.1458, lng: 79.0782 } },
  { wardId: 'W21', name: 'Nagpur Rural', zone: 'Periphery', population: 68000, currentRiskScore: 12, currentRiskLevel: 'LOW', centroid: { lat: 21.2058, lng: 79.0882 } },
  { wardId: 'W22', name: 'Butibori', zone: 'Periphery', population: 54000, currentRiskScore: 10, currentRiskLevel: 'LOW', centroid: { lat: 21.0658, lng: 79.0582 } },
];

export const MOCK_DASHBOARD = {
  totalCases: 1284,
  activeAlerts: 7,
  highRiskWards: 4,
  criticalWards: 2,
  activeInterventions: 12,
  diseasesMonitored: 6,
  facilitiesUnderPressure: 3,
  diseaseBreakdown: [
    { disease: 'Dengue', cases: 487 },
    { disease: 'Diarrheal Disease', cases: 312 },
    { disease: 'Malaria', cases: 198 },
    { disease: 'Influenza', cases: 143 },
    { disease: 'Typhoid', cases: 97 },
    { disease: 'Chikungunya', cases: 47 },
  ],
  recentAlerts: [
    { _id: 'a1', wardId: 'W01', wardName: 'Sakkardara', disease: 'Dengue', riskScore: 87, riskLevel: 'CRITICAL', status: 'ACTIVE' },
    { _id: 'a2', wardId: 'W08', wardName: 'Indora', disease: 'Malaria', riskScore: 74, riskLevel: 'HIGH', status: 'ACKNOWLEDGED' },
    { _id: 'a3', wardId: 'W10', wardName: 'Bhandewadi', disease: 'Typhoid', riskScore: 71, riskLevel: 'HIGH', status: 'ACTIVE' },
    { _id: 'a4', wardId: 'W02', wardName: 'Manewada', disease: 'Dengue', riskScore: 65, riskLevel: 'HIGH', status: 'ACTIVE' },
  ],
  wards: MOCK_WARDS,
};

export const MOCK_ALERTS = [
  {
    _id: 'a1', wardId: 'W01', wardName: 'Sakkardara', disease: 'Dengue',
    riskScore: 87, riskLevel: 'CRITICAL', currentCases: 49, previousCases: 31,
    growthPercent: 58, status: 'ACTIVE',
    reason: 'Dengue cases in Sakkardara ward have surged 58% in one week (31 → 49 cases), significantly exceeding the historical baseline of 12 cases/week.',
    riskBreakdown: { caseGrowth: 92, caseDensity: 76, historicalPattern: 84, neighborRisk: 72 },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'a2', wardId: 'W08', wardName: 'Indora', disease: 'Malaria',
    riskScore: 74, riskLevel: 'HIGH', currentCases: 35, previousCases: 22,
    growthPercent: 59, status: 'ACKNOWLEDGED',
    reason: 'Malaria cases rising sharply in Indora ward. Stagnant water breeding sites detected near Nag River tributary.',
    riskBreakdown: { caseGrowth: 82, caseDensity: 68, historicalPattern: 72, neighborRisk: 55 },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'a3', wardId: 'W10', wardName: 'Bhandewadi', disease: 'Typhoid',
    riskScore: 71, riskLevel: 'HIGH', currentCases: 32, previousCases: 19,
    growthPercent: 68, status: 'ACTIVE',
    reason: 'Sharp increase in typhoid cases in Bhandewadi. Water supply contamination suspected.',
    riskBreakdown: { caseGrowth: 78, caseDensity: 64, historicalPattern: 68, neighborRisk: 48 },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'a4', wardId: 'W02', wardName: 'Manewada', disease: 'Dengue',
    riskScore: 65, riskLevel: 'HIGH', currentCases: 28, previousCases: 18,
    growthPercent: 56, status: 'ACTIVE',
    reason: 'Dengue cases increasing in Manewada — likely spillover from neighboring Sakkardara outbreak.',
    riskBreakdown: { caseGrowth: 74, caseDensity: 58, historicalPattern: 65, neighborRisk: 80 },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'a5', wardId: 'W03', wardName: 'Nandanvan', disease: 'Dengue',
    riskScore: 52, riskLevel: 'MODERATE', currentCases: 19, previousCases: 13,
    growthPercent: 46, status: 'ACKNOWLEDGED',
    reason: 'Moderate dengue activity in Nandanvan. Monitor for potential escalation given proximity to Sakkardara.',
    riskBreakdown: { caseGrowth: 58, caseDensity: 44, historicalPattern: 52, neighborRisk: 72 },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
];

export const MOCK_WARD_DETAIL = {
  W01: {
    wardId: 'W01', name: 'Sakkardara', zone: 'East', population: 182400,
    area: 4.2, currentRiskScore: 87, currentRiskLevel: 'CRITICAL',
    centroid: { lat: 21.1558, lng: 79.1182 },
    neighborWards: ['W02', 'W03', 'W08', 'W09'],
    diseaseWeekly: {
      'Dengue':           [12, 18, 31, 49],
      'Malaria':          [3, 5, 8, 11],
      'Chikungunya':      [2, 2, 3, 5],
      'Typhoid':          [1, 2, 2, 3],
      'Influenza':        [3, 4, 5, 7],
      'Diarrheal Disease':[2, 3, 3, 4],
    },
    weeklyTotals: [23, 34, 52, 79],
    activeAlert: {
      _id: 'a1', disease: 'Dengue', riskScore: 87, riskLevel: 'CRITICAL',
      currentCases: 49, previousCases: 31, growthPercent: 58, status: 'ACTIVE',
      reason: 'Dengue cases surged 58% in one week.',
      riskBreakdown: { caseGrowth: 92, caseDensity: 76, historicalPattern: 84, neighborRisk: 72 }
    },
    neighbors: [
      { wardId: 'W02', name: 'Manewada', currentRiskScore: 65, currentRiskLevel: 'HIGH' },
      { wardId: 'W03', name: 'Nandanvan', currentRiskScore: 52, currentRiskLevel: 'MODERATE' },
      { wardId: 'W08', name: 'Indora', currentRiskScore: 74, currentRiskLevel: 'HIGH' },
      { wardId: 'W09', name: 'Yashodhara Nagar', currentRiskScore: 45, currentRiskLevel: 'MODERATE' },
    ],
    facilities: [
      { name: 'Urban PHC Sakkardara', type: 'PHC', beds: 30, availableBeds: 8, status: 'PRESSURE' },
      { name: 'NMC Urban Health Center Manewada', type: 'URBAN_HEALTH_CENTER', beds: 20, availableBeds: 6, status: 'PRESSURE' },
    ],
    interventions: [
      {
        _id: 'i1', title: 'Dengue Emergency Vector Control - Sakkardara',
        disease: 'Dengue', assignedTeam: 'Vector Control Team Alpha',
        priority: 'URGENT', status: 'IN_PROGRESS',
        tasks: [
          { label: 'Field inspection of breeding sites', completed: true },
          { label: 'Larval survey completed', completed: true },
          { label: 'Fogging operation in Zone A', completed: true },
          { label: 'Community advisory distributed', completed: false },
          { label: 'Follow-up surveillance day 7', completed: false },
        ]
      }
    ]
  }
};

export const MOCK_INTERVENTIONS = [
  {
    _id: 'i1', wardId: 'W01', wardName: 'Sakkardara', disease: 'Dengue',
    title: 'Dengue Emergency Vector Control', assignedTeam: 'Vector Control Team Alpha',
    priority: 'URGENT', status: 'IN_PROGRESS',
    tasks: [
      { label: 'Field inspection of breeding sites', completed: true },
      { label: 'Larval survey completed', completed: true },
      { label: 'Fogging operation in Zone A', completed: true },
      { label: 'Community advisory distributed', completed: false },
      { label: 'Follow-up surveillance day 7', completed: false },
      { label: 'ASHA worker mobilization', completed: false }
    ],
    notes: 'High-density breeding sites found near construction sites.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'i2', wardId: 'W08', wardName: 'Indora', disease: 'Malaria',
    title: 'Malaria RDT Drive - Indora', assignedTeam: 'Malaria Control Team Beta',
    priority: 'HIGH', status: 'IN_PROGRESS',
    tasks: [
      { label: 'RDT camp setup at PHC', completed: true },
      { label: 'Blood smear testing drive', completed: true },
      { label: 'Indoor residual spraying (IRS)', completed: false },
      { label: 'Bed net distribution', completed: false },
      { label: 'Follow-up case tracking', completed: false }
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'i3', wardId: 'W10', wardName: 'Bhandewadi', disease: 'Typhoid',
    title: 'Water Safety Inspection - Bhandewadi', assignedTeam: 'Sanitation & Water Safety Team',
    priority: 'URGENT', status: 'ASSIGNED',
    tasks: [
      { label: 'Water sample collection', completed: false },
      { label: 'Lab testing for contamination', completed: false },
      { label: 'Emergency chlorination', completed: false },
      { label: 'Boil-water advisory issued', completed: false },
    ],
    createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'i4', wardId: 'W02', wardName: 'Manewada', disease: 'Dengue',
    title: 'Dengue Containment - Manewada', assignedTeam: 'Vector Control Team Gamma',
    priority: 'HIGH', status: 'ASSIGNED',
    tasks: [
      { label: 'Boundary surveillance setup', completed: false },
      { label: 'Container survey', completed: false },
      { label: 'Preventive fogging', completed: false },
    ],
    createdAt: new Date(Date.now() - 0.3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'i5', wardId: 'W03', wardName: 'Nandanvan', disease: 'Dengue',
    title: 'Dengue Monitoring - Nandanvan', assignedTeam: 'Surveillance Team Delta',
    priority: 'ROUTINE', status: 'COMPLETED',
    tasks: [
      { label: 'Weekly case count review', completed: true },
      { label: 'School advisory issued', completed: true },
      { label: 'PHC briefed on dengue protocol', completed: true }
    ],
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
];

export const MOCK_FACILITIES = [
  { _id: 'f1', name: 'Urban PHC Sakkardara', type: 'PHC', wardId: 'W01', beds: 30, availableBeds: 8, doctors: 3, status: 'PRESSURE', phone: '0712-2631001', address: 'Near Gandhi Chowk, Sakkardara' },
  { _id: 'f2', name: 'NMC Urban Health Center Manewada', type: 'URBAN_HEALTH_CENTER', wardId: 'W02', beds: 20, availableBeds: 6, doctors: 2, status: 'PRESSURE', phone: '0712-2631002', address: 'Manewada Road, Nagpur' },
  { _id: 'f3', name: 'District Hospital (Daga)', type: 'DISTRICT_HOSPITAL', wardId: 'W18', beds: 350, availableBeds: 112, doctors: 45, status: 'NORMAL', phone: '0712-2640000', address: 'Sitabuldi, Nagpur' },
  { _id: 'f4', name: 'Government Medical College Hospital', type: 'DISTRICT_HOSPITAL', wardId: 'W17', beds: 800, availableBeds: 287, doctors: 120, status: 'NORMAL', phone: '0712-2748900', address: 'Dharampeth, Nagpur' },
  { _id: 'f5', name: 'Urban PHC Indora', type: 'PHC', wardId: 'W08', beds: 25, availableBeds: 7, doctors: 2, status: 'PRESSURE', phone: '0712-2631008', address: 'Indora, Nagpur' },
  { _id: 'f6', name: 'CHC Bhandewadi', type: 'CHC', wardId: 'W10', beds: 50, availableBeds: 18, doctors: 6, status: 'NORMAL', phone: '0712-2631010', address: 'Bhandewadi Road, Nagpur' },
  { _id: 'f7', name: 'NMC Dispensary Pratap Nagar', type: 'DISPENSARY', wardId: 'W07', beds: 10, availableBeds: 7, doctors: 2, status: 'NORMAL', phone: '0712-2631007', address: 'Pratap Nagar, Nagpur' },
  { _id: 'f8', name: 'Urban PHC Kamptee', type: 'PHC', wardId: 'W11', beds: 30, availableBeds: 21, doctors: 3, status: 'NORMAL', phone: '0712-2631011', address: 'Kamptee Road, Nagpur' },
  { _id: 'f9', name: 'Nandanvan PHC', type: 'PHC', wardId: 'W03', beds: 25, availableBeds: 14, doctors: 3, status: 'NORMAL', phone: '0712-2631003', address: 'Nandanvan, Nagpur' },
  { _id: 'f10', name: 'Sitabuldi Urban Health Center', type: 'URBAN_HEALTH_CENTER', wardId: 'W18', beds: 15, availableBeds: 11, doctors: 2, status: 'NORMAL', phone: '0712-2631018', address: 'Sitabuldi, Nagpur' },
];

export const MOCK_AI_PLAN = {
  summary: '🚨 HIGH OUTBREAK RISK DETECTED',
  disease: 'Dengue',
  wardName: 'Sakkardara',
  riskLevel: 'CRITICAL',
  priority: 'URGENT',
  priorityReasoning: 'Risk score 87/100 is CRITICAL. Cases surged 58% in one week. Immediate action required.',
  recommendedActions: [
    'Deploy vector-control team immediately to Sakkardara',
    'Inspect and eliminate mosquito breeding sites (stagnant water, containers)',
    'Conduct larval survey in all affected sub-zones',
    'Spray insecticides in high-density residential zones',
    'Coordinate surveillance with 2 neighboring high-risk wards (Manewada, Indora)',
    'Notify Urban PHC Sakkardara for potential patient surge'
  ],
  communityActions: [
    'Conduct community awareness campaigns on dengue prevention',
    'Mobilize ASHA workers for door-to-door screening'
  ],
  monitoringPlan: [
    'Daily fever surveillance at all PHCs in the ward',
    'Monitor NS1 antigen test positivity rates'
  ],
  keyInsights: [
    '⚠️ Case count has surged 58% in one week — significantly above acceptable threshold.',
    '🚨 Ward risk score is in the CRITICAL range. Outbreak probability is high without intervention.',
    '🦟 Dengue is vector-borne. Environmental control must be prioritized alongside treatment.',
    '🗺️ 2 neighboring wards also show elevated risk — potential geographic spread.'
  ],
  disclaimer: 'This is AI-assisted decision support. All interventions must be validated by qualified public health officers.',
  generatedBy: 'PulseAI Rule Engine'
};
