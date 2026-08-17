/**
 * PulseAI - AI Response Recommendation Engine
 * Primary: Google Gemini API
 * Fallback: Rule-based deterministic engine
 */

const DISEASE_PROTOCOLS = {
  Dengue: {
    vectorControl: true,
    primaryActions: [
      'Deploy vector-control team immediately',
      'Inspect and eliminate mosquito breeding sites (stagnant water, containers)',
      'Conduct larval survey in affected areas',
      'Spray insecticides in high-density zones',
      'Distribute mosquito nets and repellents',
      'Issue targeted public advisory on dengue prevention'
    ],
    monitoring: [
      'Daily fever surveillance at all PHCs',
      'Monitor platelet counts at district hospitals',
      'Track NS1 antigen test positivity rates'
    ],
    communityActions: [
      'Conduct community awareness campaigns',
      'Mobilize ASHA workers for door-to-door screening',
      'Coordinate with schools and workplaces'
    ]
  },
  Malaria: {
    vectorControl: true,
    primaryActions: [
      'Deploy malaria rapid diagnostic testing (RDT) teams',
      'Conduct indoor residual spraying (IRS)',
      'Distribute insecticide-treated bed nets',
      'Test and treat all fever cases with antimalarials',
      'Eliminate breeding sites (stagnant water)',
      'Deploy ASHA workers for active case finding'
    ],
    monitoring: [
      'Daily blood smear testing',
      'Track treatment compliance',
      'Monitor Plasmodium species distribution'
    ],
    communityActions: [
      'Conduct malaria awareness drives',
      'Screen migrant workers and high-risk groups'
    ]
  },
  Chikungunya: {
    vectorControl: true,
    primaryActions: [
      'Deploy vector-control team for Aedes mosquito control',
      'Eliminate water storage containers and breeding sites',
      'Conduct fogging in affected areas',
      'Provide symptomatic treatment guidelines to PHCs',
      'Issue advisory on joint pain management'
    ],
    monitoring: [
      'Track fever and arthralgia cases',
      'Confirm diagnosis with serological testing',
      'Monitor for chronic cases'
    ],
    communityActions: [
      'Community awareness on prevention',
      'ASHA mobilization for case finding'
    ]
  },
  Typhoid: {
    vectorControl: false,
    primaryActions: [
      'Inspect water supply and sanitation infrastructure',
      'Collect and test water samples from affected areas',
      'Deploy chlorination teams to water sources',
      'Initiate mass prophylactic treatment if indicated',
      'Trace source of contamination',
      'Coordinate with Water Supply Department'
    ],
    monitoring: [
      'Track Widal test positivity rates',
      'Monitor antibiotic resistance patterns',
      'Trace food and water exposure history'
    ],
    communityActions: [
      'Issue boil-water advisory',
      'Community hygiene and sanitation drives',
      'Distribute ORS and safe water tablets'
    ]
  },
  Influenza: {
    vectorControl: false,
    primaryActions: [
      'Activate influenza surveillance protocol',
      'Issue influenza vaccine advisory for high-risk groups',
      'Provide antiviral treatment guidelines to PHCs',
      'Implement respiratory hygiene measures in public spaces',
      'Alert schools and workplaces for absenteeism tracking'
    ],
    monitoring: [
      'Track ILI (Influenza-Like Illness) cases daily',
      'Conduct nasopharyngeal swab testing',
      'Monitor ICU admissions for severe cases'
    ],
    communityActions: [
      'Mass awareness on hand hygiene and masking',
      'Coordinate with schools and colleges',
      'Target vaccination for elderly and children'
    ]
  },
  'Diarrheal Disease': {
    vectorControl: false,
    primaryActions: [
      'Inspect water supply and sanitation in affected areas',
      'Test water samples for fecal contamination',
      'Set up Oral Rehydration Therapy (ORT) centers',
      'Deploy rapid response team for dehydration cases',
      'Chlorinate water supply immediately',
      'Issue food safety advisory to restaurants and vendors'
    ],
    monitoring: [
      'Track severe dehydration and hospitalization cases',
      'Collect stool samples for microbiological analysis',
      'Identify common exposure sources (food/water)'
    ],
    communityActions: [
      'Distribute ORS packets door-to-door',
      'Community sanitation drives',
      'FSSAI coordination for food safety'
    ]
  }
};

function generateRuleBasedPlan(params) {
  const {
    disease,
    wardName,
    currentCases,
    previousCases,
    growthPercent,
    riskScore,
    nearbyHighRiskWards = 0,
    facilityPressure = false
  } = params;

  const protocol = DISEASE_PROTOCOLS[disease] || DISEASE_PROTOCOLS['Dengue'];
  const riskLevel = riskScore >= 81 ? 'CRITICAL' : riskScore >= 61 ? 'HIGH' : riskScore >= 31 ? 'MODERATE' : 'LOW';
  
  // Determine priority
  let priority = 'ROUTINE';
  let priorityReasoning = '';
  
  if (riskScore >= 81) {
    priority = 'URGENT';
    priorityReasoning = `Risk score ${riskScore}/100 is CRITICAL. Immediate action required.`;
  } else if (riskScore >= 61) {
    priority = 'HIGH';
    priorityReasoning = `Risk score ${riskScore}/100 is HIGH. Rapid response needed.`;
  } else if (riskScore >= 31) {
    priority = 'ROUTINE';
    priorityReasoning = `Risk score ${riskScore}/100 is MODERATE. Enhanced monitoring required.`;
  }

  // Build recommended actions
  const actions = [...protocol.primaryActions.slice(0, 4)];
  
  if (nearbyHighRiskWards >= 2) {
    actions.push(`Coordinate surveillance with ${nearbyHighRiskWards} neighboring high-risk wards`);
  } else if (nearbyHighRiskWards === 1) {
    actions.push('Monitor neighboring ward for disease spread');
  }

  if (facilityPressure) {
    actions.push('Alert district hospital for potential surge — expand capacity');
  } else {
    actions.push('Notify nearby health facilities about case surge');
  }

  if (growthPercent >= 50) {
    actions.push('Escalate to State Disease Control Division');
  }

  // Community actions
  const communityActions = protocol.communityActions.slice(0, 2);

  // Monitoring plan
  const monitoringPlan = protocol.monitoring.slice(0, 2);

  // Timeline
  const timeline = [];
  if (priority === 'URGENT') {
    timeline.push({ phase: 'Immediate (0-24h)', tasks: [actions[0], actions[1]] });
    timeline.push({ phase: 'Short-term (1-7 days)', tasks: [actions[2], actions[3], ...communityActions] });
    timeline.push({ phase: 'Medium-term (7-30 days)', tasks: monitoringPlan });
  } else {
    timeline.push({ phase: 'Immediate (0-48h)', tasks: [actions[0], actions[1]] });
    timeline.push({ phase: 'Short-term (3-14 days)', tasks: [...actions.slice(2), ...communityActions] });
    timeline.push({ phase: 'Ongoing Monitoring', tasks: monitoringPlan });
  }

  return {
    summary: `${riskLevel} OUTBREAK RISK DETECTED`,
    disease,
    wardName,
    riskLevel,
    priority,
    priorityReasoning,
    recommendedActions: actions,
    communityActions,
    monitoringPlan,
    timeline,
    keyInsights: generateInsights(params, protocol),
    disclaimer: 'This is AI-assisted decision support. All interventions must be validated by qualified public health officers.',
    generatedBy: 'PulseAI Rule Engine'
  };
}

function generateInsights(params, protocol) {
  const { disease, growthPercent, riskScore, currentCases, previousCases, nearbyHighRiskWards } = params;
  const insights = [];

  if (growthPercent >= 50) {
    insights.push(`⚠️ Case count has surged ${growthPercent}% in one week — significantly above acceptable threshold.`);
  }

  if (riskScore >= 81) {
    insights.push('🚨 Ward risk score is in the CRITICAL range. Outbreak probability is high without intervention.');
  }

  if (protocol.vectorControl) {
    insights.push(`🦟 ${disease} is vector-borne. Environmental control must be prioritized alongside treatment.`);
  } else {
    insights.push(`💧 ${disease} is likely water/food-borne. Source investigation is critical.`);
  }

  if (nearbyHighRiskWards >= 2) {
    insights.push(`🗺️ ${nearbyHighRiskWards} neighboring wards also show elevated risk — potential geographic spread.`);
  }

  return insights;
}

async function getAIResponsePlan(params) {
  // Try Gemini first if API key available
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are PulseAI, a public health outbreak response assistant for Nagpur Municipal Corporation.

Disease Surveillance Alert:
- Disease: ${params.disease}
- Ward: ${params.wardName}  
- Current Week Cases: ${params.currentCases}
- Previous Week Cases: ${params.previousCases}
- Growth: ${params.growthPercent}%
- Risk Score: ${params.riskScore}/100
- Nearby High-Risk Wards: ${params.nearbyHighRiskWards}

Generate a structured public health response plan. Format as JSON with these exact fields:
{
  "summary": "brief risk assessment",
  "priority": "URGENT|HIGH|ROUTINE",
  "priorityReasoning": "why this priority",
  "recommendedActions": ["action1", "action2", "action3", "action4", "action5"],
  "communityActions": ["action1", "action2"],
  "monitoringPlan": ["monitor1", "monitor2"],
  "keyInsights": ["insight1", "insight2"],
  "disclaimer": "This is AI-assisted decision support..."
}

Be specific, actionable, and appropriate for an Indian municipal public health context.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { ...parsed, generatedBy: 'Gemini AI', disease: params.disease, wardName: params.wardName };
      }
    } catch (err) {
      console.log('Gemini API unavailable, using rule engine:', err.message);
    }
  }

  // Fallback to rule-based engine
  return generateRuleBasedPlan(params);
}

module.exports = { getAIResponsePlan, generateRuleBasedPlan };
