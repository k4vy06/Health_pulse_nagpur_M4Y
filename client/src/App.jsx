import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import WardsPage from './pages/WardsPage';
import WardDetailPage from './pages/WardDetailPage';
import AlertsPage from './pages/AlertsPage';
import AlertDetailPage from './pages/AlertDetailPage';
import InterventionsPage from './pages/InterventionsPage';
import FacilitiesPage from './pages/FacilitiesPage';
import SimulatorPage from './pages/SimulatorPage';
import AnalyticsPage from './pages/AnalyticsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="wards" element={<WardsPage />} />
        <Route path="wards/:id" element={<WardDetailPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="alerts/:id" element={<AlertDetailPage />} />
        <Route path="interventions" element={<InterventionsPage />} />
        <Route path="facilities" element={<FacilitiesPage />} />
        <Route path="simulator" element={<SimulatorPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
