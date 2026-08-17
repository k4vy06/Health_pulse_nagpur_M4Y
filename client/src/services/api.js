import axios from 'axios';
import {
  MOCK_WARDS,
  MOCK_DASHBOARD,
  MOCK_ALERTS,
  MOCK_WARD_DETAIL,
  MOCK_INTERVENTIONS,
  MOCK_FACILITIES,
  MOCK_AI_PLAN
} from '../data/mockData';

const api = axios.create({
  baseURL: '/api',
  timeout: 4000,
  headers: { 'Content-Type': 'application/json' }
});

// Response interceptor
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    // Return structured error for graceful fallback handling
    return Promise.reject(err.response?.data || err);
  }
);

// In-memory state for mock mutation support
let localInterventions = [...MOCK_INTERVENTIONS];
let localAlerts = [...MOCK_ALERTS];

export const dashboardAPI = {
  getStats: async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res && res.success && res.data) return res.data;
      return MOCK_DASHBOARD;
    } catch {
      return MOCK_DASHBOARD;
    }
  },
};

export const wardsAPI = {
  getAll: async () => {
    try {
      const res = await api.get('/wards');
      if (res && res.success && Array.isArray(res.data)) return res.data;
      return MOCK_WARDS;
    } catch {
      return MOCK_WARDS;
    }
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/wards/${id}`);
      if (res && res.success && res.data) return res.data;
      return MOCK_WARD_DETAIL[id] || {
        ...MOCK_WARDS.find(w => w.wardId === id),
        diseaseWeekly: {
          'Dengue': [8, 12, 19, 28],
          'Malaria': [4, 6, 7, 9],
          'Chikungunya': [1, 2, 2, 4],
          'Typhoid': [2, 3, 3, 5],
          'Influenza': [5, 6, 8, 10],
          'Diarrheal Disease': [3, 4, 6, 8],
        },
        weeklyTotals: [23, 33, 45, 64],
        facilities: MOCK_FACILITIES.filter(f => f.wardId === id),
        interventions: localInterventions.filter(i => i.wardId === id),
        neighbors: MOCK_WARDS.filter(w => w.wardId !== id).slice(0, 4)
      };
    } catch {
      return MOCK_WARD_DETAIL[id] || {
        ...MOCK_WARDS.find(w => w.wardId === id),
        diseaseWeekly: {
          'Dengue': [8, 12, 19, 28],
          'Malaria': [4, 6, 7, 9],
          'Chikungunya': [1, 2, 2, 4],
          'Typhoid': [2, 3, 3, 5],
          'Influenza': [5, 6, 8, 10],
          'Diarrheal Disease': [3, 4, 6, 8],
        },
        weeklyTotals: [23, 33, 45, 64],
        facilities: MOCK_FACILITIES.filter(f => f.wardId === id),
        interventions: localInterventions.filter(i => i.wardId === id),
        neighbors: MOCK_WARDS.filter(w => w.wardId !== id).slice(0, 4)
      };
    }
  },
  getAnalytics: async (id) => {
    try {
      const res = await api.get(`/wards/${id}/analytics`);
      if (res && res.success && res.data) return res.data;
      throw new Error('Fallback to mock');
    } catch {
      const trend = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        trend.push({
          date: dateStr,
          total: Math.floor(Math.random() * 15) + 5,
          Dengue: Math.floor(Math.random() * 8) + 2,
          Malaria: Math.floor(Math.random() * 5) + 1,
          Typhoid: Math.floor(Math.random() * 3),
          'Diarrheal Disease': Math.floor(Math.random() * 4) + 1,
        });
      }
      return {
        trend,
        distribution: [
          { name: 'Dengue', value: 48 },
          { name: 'Malaria', value: 24 },
          { name: 'Typhoid', value: 14 },
          { name: 'Diarrheal Disease', value: 18 },
          { name: 'Influenza', value: 12 },
          { name: 'Chikungunya', value: 6 }
        ]
      };
    }
  },
};

export const alertsAPI = {
  getAll: async (params = {}) => {
    try {
      const res = await api.get('/alerts', { params });
      if (res && res.success && Array.isArray(res.data)) return res.data;
      return localAlerts;
    } catch {
      let filtered = [...localAlerts];
      if (params.status) filtered = filtered.filter(a => a.status === params.status);
      if (params.riskLevel) filtered = filtered.filter(a => a.riskLevel === params.riskLevel);
      return filtered;
    }
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/alerts/${id}`);
      if (res && res.success && res.data) return res.data;
      return localAlerts.find(a => a._id === id) || localAlerts[0];
    } catch {
      return localAlerts.find(a => a._id === id) || localAlerts[0];
    }
  },
  acknowledge: async (id, data = {}) => {
    try {
      const res = await api.post(`/alerts/${id}/acknowledge`, data);
      if (res && res.success) return res.data;
      throw new Error('Fallback');
    } catch {
      localAlerts = localAlerts.map(a => 
        a._id === id ? { ...a, status: 'ACKNOWLEDGED', acknowledgedBy: data.acknowledgedBy || 'Health Officer', acknowledgedAt: new Date().toISOString() } : a
      );
      return localAlerts.find(a => a._id === id);
    }
  },
  resolve: async (id) => {
    try {
      const res = await api.post(`/alerts/${id}/resolve`);
      if (res && res.success) return res.data;
      throw new Error('Fallback');
    } catch {
      localAlerts = localAlerts.map(a => 
        a._id === id ? { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : a
      );
      return localAlerts.find(a => a._id === id);
    }
  },
};

export const interventionsAPI = {
  getAll: async (params = {}) => {
    try {
      const res = await api.get('/interventions', { params });
      if (res && res.success && Array.isArray(res.data)) return res.data;
      return localInterventions;
    } catch {
      let filtered = [...localInterventions];
      if (params.status) filtered = filtered.filter(i => i.status === params.status);
      if (params.wardId) filtered = filtered.filter(i => i.wardId === params.wardId);
      return filtered;
    }
  },
  create: async (data) => {
    try {
      const res = await api.post('/interventions', data);
      if (res && res.success && res.data) return res.data;
      throw new Error('Fallback');
    } catch {
      const newIntervention = {
        _id: 'i' + (localInterventions.length + 1) + '_' + Date.now(),
        ...data,
        status: data.status || 'ASSIGNED',
        createdAt: new Date().toISOString(),
        tasks: data.tasks || [
          { label: 'Initial Field Inspection', completed: false },
          { label: 'Team Mobilization', completed: false },
          { label: 'Containment Action Execution', completed: false },
          { label: 'Post-intervention Surveillance', completed: false }
        ]
      };
      localInterventions = [newIntervention, ...localInterventions];
      return newIntervention;
    }
  },
  update: async (id, data) => {
    try {
      const res = await api.put(`/interventions/${id}`, data);
      if (res && res.success && res.data) return res.data;
      throw new Error('Fallback');
    } catch {
      localInterventions = localInterventions.map(i => i._id === id ? { ...i, ...data } : i);
      return localInterventions.find(i => i._id === id);
    }
  },
  updateTask: async (id, taskIndex, completed) => {
    try {
      const res = await api.patch(`/interventions/${id}/tasks/${taskIndex}`, { completed });
      if (res && res.success && res.data) return res.data;
      throw new Error('Fallback');
    } catch {
      localInterventions = localInterventions.map(i => {
        if (i._id === id && i.tasks && i.tasks[taskIndex] !== undefined) {
          const updatedTasks = [...i.tasks];
          updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], completed };
          const allCompleted = updatedTasks.every(t => t.completed);
          return {
            ...i,
            tasks: updatedTasks,
            status: allCompleted ? 'COMPLETED' : 'IN_PROGRESS',
            completedAt: allCompleted ? new Date().toISOString() : i.completedAt
          };
        }
        return i;
      });
      return localInterventions.find(i => i._id === id);
    }
  },
};

export const facilitiesAPI = {
  getAll: async (params = {}) => {
    try {
      const res = await api.get('/facilities', { params });
      if (res && res.success && Array.isArray(res.data)) return res.data;
      return MOCK_FACILITIES;
    } catch {
      return MOCK_FACILITIES;
    }
  },
};

export const riskAPI = {
  analyze: async (data) => {
    try {
      const res = await api.post('/risk/analyze', data);
      if (res && res.success && res.data) return res.data;
      throw new Error('Fallback');
    } catch {
      const currentCases = data.currentCases || 42;
      const previousCases = data.previousCases || 26;
      const growthPercent = Math.round(((currentCases - previousCases) / previousCases) * 100);
      return {
        score: Math.min(95, Math.max(20, Math.round(growthPercent * 0.8 + 30))),
        level: growthPercent > 50 ? 'CRITICAL' : growthPercent > 25 ? 'HIGH' : 'MODERATE',
        breakdown: {
          caseGrowth: Math.min(100, growthPercent * 1.2),
          caseDensity: 68,
          historicalPattern: 75,
          neighborRisk: 62
        },
        growthPercent,
        currentCases,
        previousCases
      };
    }
  },
  getAIPlan: async (data) => {
    try {
      const res = await api.post('/ai/response-plan', data);
      if (res && res.success && res.data) return res.data;
      return {
        ...MOCK_AI_PLAN,
        disease: data.disease || 'Dengue',
        wardName: data.wardName || 'Sakkardara',
        riskLevel: data.riskLevel || 'CRITICAL',
        priority: data.riskScore >= 80 ? 'URGENT' : 'HIGH'
      };
    } catch {
      return {
        ...MOCK_AI_PLAN,
        disease: data.disease || 'Dengue',
        wardName: data.wardName || 'Sakkardara',
        riskLevel: data.riskLevel || 'CRITICAL',
        priority: data.riskScore >= 80 ? 'URGENT' : 'HIGH'
      };
    }
  },
  getSimulation: async (params = {}) => {
    try {
      const res = await api.get('/simulation', { params });
      if (res && res.success && res.data) return res.data;
      throw new Error('Fallback');
    } catch {
      const current = parseFloat(params.currentCases || 49);
      const rate = parseFloat(params.growthRate || 58) / 100;
      const days = parseInt(params.days || 30);
      
      const withoutIntervention = [];
      const withIntervention = [];
      
      let c1 = current;
      let c2 = current;
      
      for (let d = 0; d <= days; d += 5) {
        withoutIntervention.push({
          day: d,
          label: d === 0 ? 'Today' : `Day ${d}`,
          cases: Math.round(c1)
        });
        withIntervention.push({
          day: d,
          label: d === 0 ? 'Today' : `Day ${d}`,
          cases: Math.round(c2)
        });
        c1 = c1 * (1 + rate * 0.7);
        c2 = c2 * (1 + rate * 0.12);
      }
      
      return { withoutIntervention, withIntervention, growthRate: rate * 100 };
    }
  },
};

export const analyticsAPI = {
  getAll: async () => {
    try {
      const res = await api.get('/analytics');
      if (res && res.success && res.data) return res.data;
      throw new Error('Fallback');
    } catch {
      const trendData = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        trendData.push({
          date: dateStr,
          Dengue: Math.floor(25 + Math.sin(i / 3) * 15 + Math.random() * 8),
          Malaria: Math.floor(15 + Math.cos(i / 4) * 8 + Math.random() * 5),
          Typhoid: Math.floor(10 + Math.sin(i / 5) * 5 + Math.random() * 3),
          Influenza: Math.floor(12 + Math.random() * 6),
          'Diarrheal Disease': Math.floor(18 + Math.sin(i / 2) * 10 + Math.random() * 5),
          Chikungunya: Math.floor(4 + Math.random() * 3),
        });
      }
      return {
        diseaseTrend: trendData,
        wardComparison: MOCK_WARDS.slice(0, 10).map(w => ({
          name: w.name,
          riskScore: w.currentRiskScore,
          level: w.currentRiskLevel
        })),
        alertTrend: trendData.slice(-14).map(t => ({
          date: t.date,
          count: Math.floor(Math.random() * 4) + 1
        })),
        interventionStats: [
          { status: 'COMPLETED', count: 18 },
          { status: 'IN_PROGRESS', count: 9 },
          { status: 'ASSIGNED', count: 5 },
          { status: 'CANCELLED', count: 1 }
        ]
      };
    }
  },
};

export default api;
