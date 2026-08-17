import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { AlertOctagon, ArrowRight, X } from 'lucide-react';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAlertBanner, setShowAlertBanner] = useState(true);

  return (
    <div className="min-h-screen bg-surface-900 text-gray-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
          {/* Critical Outbreak Alert Banner */}
          {showAlertBanner && (
            <div className="bg-gradient-to-r from-red-600/90 via-red-500/80 to-amber-600/90 text-white px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium shadow-lg animate-fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertOctagon className="w-4 h-4 flex-shrink-0 animate-bounce text-white" />
                <span className="truncate">
                  <span className="font-extrabold uppercase bg-black/25 px-1.5 py-0.5 rounded text-[11px] mr-1.5">
                    URGENT OUTBREAK
                  </span>
                  Dengue surge in <strong>Sakkardara (W01)</strong> (+58% weekly case growth). Vector-control protocol initiated.
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  to="/alerts/a1"
                  className="inline-flex items-center gap-1 font-bold underline hover:text-white/80 transition-colors"
                >
                  Investigate <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setShowAlertBanner(false)}
                  className="p-1 rounded hover:bg-black/20 text-white/80 hover:text-white transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Page Outlet */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="mt-auto border-t border-surface-800 bg-surface-900/60 px-6 py-4 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              © 2026 Nagpur Municipal Corporation (NMC) • Public Health & Epidemic Cell
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                PulseAI v2.4 Engine Active
              </span>
              <span>•</span>
              <Link to="/simulator" className="text-primary-400 hover:underline">
                Predictive Models
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
