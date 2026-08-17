require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeFirebase } = require('./config/firebase');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger in dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/wards', require('./routes/wards'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/interventions', require('./routes/interventions'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api', require('./routes/risk'));

// Health check
app.get('/api/health', (req, res) => {
  const { getDb } = require('./config/firebase');
  const db = getDb();
  res.json({
    status: 'OK',
    service: 'HealthPulse Nagpur API',
    version: '2.0.0',
    database: 'Firebase Firestore',
    timestamp: new Date().toISOString(),
    firestore: db ? 'Connected' : 'Not Connected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

// Server startup
const PORT = process.env.PORT || 5000;

// Initialize Firebase
const db = initializeFirebase();
if (db) {
  console.log('🔥 Firebase Firestore ready');
} else {
  console.log('⚠️ Firebase not connected — frontend will use mock data fallback');
}

app.listen(PORT, () => {
  console.log(`\n🚀 HealthPulse Nagpur API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Database: Firebase Firestore`);
});

module.exports = app;
