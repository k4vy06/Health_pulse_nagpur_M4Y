/**
 * PulseRisk Engine
 * Calculates ward-level disease outbreak risk scores.
 * 
 * Risk Score Formula:
 * 40% Case Growth + 25% Case Density + 20% Historical Pattern + 15% Neighbor Risk
 */

const RISK_WEIGHTS = {
  caseGrowth: 0.40,
  caseDensity: 0.25,
  historicalPattern: 0.20,
  neighborRisk: 0.15
};

const RISK_LEVELS = {
  LOW: { min: 0, max: 30, label: 'LOW', color: '#22c55e' },
  MODERATE: { min: 31, max: 60, label: 'MODERATE', color: '#f59e0b' },
  HIGH: { min: 61, max: 80, label: 'HIGH', color: '#f97316' },
  CRITICAL: { min: 81, max: 100, label: 'CRITICAL', color: '#ef4444' }
};

/**
 * Calculate risk score for a ward/disease combination
 */
function calculateRiskScore(params) {
  const {
    currentCases,
    previousCases,
    population,
    baselineAvg,
    baselinePeak,
    neighborAvgRisk = 0,
    weeklyTrend = []
  } = params;

  // 1. Case Growth Score (0-100)
  let caseGrowthScore = 0;
  if (previousCases > 0) {
    const growthRate = ((currentCases - previousCases) / previousCases) * 100;
    if (growthRate <= 0) caseGrowthScore = 0;
    else if (growthRate >= 200) caseGrowthScore = 100;
    else caseGrowthScore = Math.min(100, (growthRate / 200) * 100);
  } else if (currentCases > 0) {
    caseGrowthScore = 80; // New emergence
  }

  // 2. Case Density Score (cases per 10,000 population)
  let caseDensityScore = 0;
  if (population > 0) {
    const density = (currentCases / population) * 10000;
    if (density >= 10) caseDensityScore = 100;
    else caseDensityScore = Math.min(100, (density / 10) * 100);
  }

  // 3. Historical Pattern Score
  let historicalPatternScore = 0;
  if (baselineAvg > 0) {
    const ratio = currentCases / baselineAvg;
    if (ratio <= 1) historicalPatternScore = 0;
    else if (ratio >= 5) historicalPatternScore = 100;
    else historicalPatternScore = Math.min(100, ((ratio - 1) / 4) * 100);
  } else if (currentCases > 5) {
    historicalPatternScore = 50;
  }

  // Also check if approaching historical peak
  if (baselinePeak > 0 && currentCases / baselinePeak > 0.7) {
    historicalPatternScore = Math.max(historicalPatternScore, 70);
  }

  // 4. Neighbor Risk Score
  const neighborRiskScore = Math.min(100, neighborAvgRisk);

  // Weighted total
  const totalScore = Math.round(
    (caseGrowthScore * RISK_WEIGHTS.caseGrowth) +
    (caseDensityScore * RISK_WEIGHTS.caseDensity) +
    (historicalPatternScore * RISK_WEIGHTS.historicalPattern) +
    (neighborRiskScore * RISK_WEIGHTS.neighborRisk)
  );

  const finalScore = Math.max(0, Math.min(100, totalScore));
  const riskLevel = getRiskLevel(finalScore);
  const growthPercent = previousCases > 0 
    ? Math.round(((currentCases - previousCases) / previousCases) * 100)
    : currentCases > 0 ? 100 : 0;

  return {
    score: finalScore,
    level: riskLevel,
    breakdown: {
      caseGrowth: Math.round(caseGrowthScore),
      caseDensity: Math.round(caseDensityScore),
      historicalPattern: Math.round(historicalPatternScore),
      neighborRisk: Math.round(neighborRiskScore)
    },
    growthPercent,
    currentCases,
    previousCases
  };
}

function getRiskLevel(score) {
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MODERATE';
  if (score <= 80) return 'HIGH';
  return 'CRITICAL';
}

function getRiskColor(level) {
  const colors = {
    LOW: '#22c55e',
    MODERATE: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#ef4444'
  };
  return colors[level] || '#6b7280';
}

function shouldGenerateAlert(riskScore, previousScore) {
  // Alert conditions
  if (riskScore >= 81) return true; // CRITICAL
  if (riskScore >= 61 && riskScore > (previousScore || 0) + 15) return true; // Rapid HIGH spike
  return false;
}

/**
 * Simulate outbreak projection
 */
function projectOutbreak(currentCases, growthRate, days, withIntervention = false) {
  const projection = [];
  let cases = currentCases;
  const effectiveRate = withIntervention ? growthRate * 0.15 : growthRate; // Intervention reduces 85%

  for (let d = 0; d <= days; d += 7) {
    projection.push({
      day: d,
      label: d === 0 ? 'Today' : `Day ${d}`,
      cases: Math.round(cases)
    });
    cases = cases * (1 + effectiveRate);
  }

  return projection;
}

module.exports = {
  calculateRiskScore,
  getRiskLevel,
  getRiskColor,
  shouldGenerateAlert,
  projectOutbreak,
  RISK_LEVELS
};
