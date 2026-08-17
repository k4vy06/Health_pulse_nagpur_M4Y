/**
 * Firebase Admin SDK initialization
 * Uses service account credentials for Firestore access
 */
const admin = require('firebase-admin');

let db;

function initializeFirebase() {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    return db;
  }

  try {
    // Option 1: Service account JSON file path
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (serviceAccountPath) {
      const path = require('path');
      // Resolve relative to server root (one level up from config/)
      const absolutePath = path.resolve(__dirname, '..', serviceAccountPath);
      const serviceAccount = require(absolutePath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('✅ Firebase initialized with service account file');
    }
    // Option 2: Service account JSON string in env
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('✅ Firebase initialized with service account env');
    }
    // Option 3: Default credentials (for Cloud Run / GCE)
    else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'healthpulse-nagpur'
      });
      console.log('✅ Firebase initialized with default credentials');
    }

    db = admin.firestore();
    return db;
  } catch (err) {
    console.error('❌ Firebase initialization failed:', err.message);
    return null;
  }
}

function getDb() {
  if (!db) {
    initializeFirebase();
  }
  return db;
}

module.exports = { initializeFirebase, getDb, admin };
