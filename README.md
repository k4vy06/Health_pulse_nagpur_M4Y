# 🏥 HealthPulse Nagpur

**Municipal Disease Surveillance & Early Warning System for Nagpur Municipal Corporation**

HealthPulse Nagpur is a real-time disease surveillance dashboard that helps public health officers track, predict, and respond to outbreaks across Nagpur's 22 municipal wards. It features interactive GIS mapping, AI-powered risk scoring, outbreak simulation, and field intervention management.

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| **Command Center Dashboard** | 6 KPI cards, disease breakdown, active alerts, high-risk ward rankings |
| **Geospatial Outbreak Map** | Interactive Leaflet GIS map with ward risk circles, facility pins, zone filters |
| **22-Ward Surveillance** | Grid and table views with drill-down dossiers for each ward |
| **PulseAI Risk Engine** | 4-factor weighted risk scoring (Growth 40%, Density 25%, Historical 20%, Neighbor 15%) |
| **Outbreak Simulator** | Interactive epidemic curve projection comparing uncontrolled vs contained scenarios |
| **Early Warning Alerts** | Outbreak alarm feed with 1-click containment protocol deployment |
| **Intervention Manager** | Field operations with live task checklists and progress tracking |
| **Healthcare Facilities** | Bed capacity meters, doctor staffing, and emergency contacts |
| **Macro Analytics** | 30-day incidence curves, ward risk rankings, pathogen proportion charts |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS v4 |
| **Charts** | Recharts (area, bar, pie, line) |
| **GIS Map** | React-Leaflet v5 + OpenStreetMap |
| **Backend** | Express.js (Node.js) |
| **Database** | Firebase Firestore (Cloud NoSQL) |
| **AI Engine** | PulseAI rule-based engine + Google Gemini API (optional) |

---

## 📁 Project Structure

```
HealthPulse_Nagpur/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ai/            # RiskScoreRadar, AIPlanModal
│   │   │   ├── charts/        # DiseaseTrendChart, OutbreakSimChart, BedCapacityMeter
│   │   │   ├── common/        # Badge, StatCard, Modal, LoadingSpinner
│   │   │   ├── layout/        # Navbar, Sidebar, RoleSwitcher
│   │   │   └── map/           # NagpurMap, MapLegend
│   │   ├── data/              # mockData.js (offline fallback)
│   │   ├── layouts/           # AppLayout
│   │   ├── pages/             # All page components
│   │   └── services/          # api.js (API layer with mock fallback)
│   └── index.html
│
├── server/                    # Express.js Backend
│   ├── config/                # firebase.js (Firestore init)
│   ├── controllers/           # API logic for each resource
│   ├── routes/                # Express route definitions
│   ├── seed/                  # seedData.js + wardData.js
│   ├── services/              # riskEngine.js + pulseAI.js
│   └── server.js              # Express app entry point
│
└── .env.example               # Environment variable template
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ installed
- **Firebase project** with Firestore enabled ([setup guide](https://console.firebase.google.com))

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/HealthPulse_Nagpur.git
cd HealthPulse_Nagpur
```

### 2. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Set up Firebase
1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Firestore Database** (test mode)
3. Go to Project Settings → Service Accounts → **Generate new private key**
4. Save the downloaded file as `server/serviceAccountKey.json`
5. Copy `.env.example` to `server/.env` and update `FIREBASE_PROJECT_ID`

### 4. Seed the database
```bash
cd server
node seed/seedData.js
```

### 5. Run the application
```bash
# Terminal 1 — Backend
cd server && node server.js

# Terminal 2 — Frontend
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📊 Data Architecture

```
wardData.js (22 Nagpur wards with GPS coordinates)
        ↓
seedData.js (generates 60 days of disease case reports)
        ↓
Firebase Firestore (6 collections: wards, diseaseReports, diseaseBaselines, alerts, facilities, interventions)
        ↓
Express.js API (/api/wards, /api/alerts, /api/dashboard/stats, etc.)
        ↓
React Frontend (Dashboard, Map, Charts, Alerts, Simulator)
```

### Risk Score Formula
```
Risk Score = 40% × Case Growth + 25% × Case Density + 20% × Historical Pattern + 15% × Neighbor Risk
```

---

## 🔐 Security

- `serviceAccountKey.json` is listed in `.gitignore` — **never committed**
- Firebase Firestore rules should be tightened before production deployment
- Role-based access (PHO, Municipal Admin, ASHA Worker) is simulated on the frontend

---

## 📄 License

This project is for academic/demonstration purposes.

---

**Built for Nagpur Municipal Corporation Disease Surveillance**
