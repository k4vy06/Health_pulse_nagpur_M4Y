import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Building2,
  AlertTriangle,
  ClipboardList,
  Building,
  Sparkles,
  BarChart3,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Surveillance Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Geospatial Outbreak Map', path: '/map', icon: Map },
  { name: 'Ward Surveillance', path: '/wards', icon: Building2 },
  { name: 'Early Warning Alerts', path: '/alerts', icon: AlertTriangle, badge: '7 Active', badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { name: 'Intervention Manager', path: '/interventions', icon: ClipboardList },
  { name: 'Healthcare Facilities', path: '/facilities', icon: Building },
  { name: 'PulseAI Simulator', path: '/simulator', icon: Sparkles, highlight: true },
  { name: 'Macro Analytics', path: '/analytics', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-900/80 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 flex-shrink-0 bg-surface-900 border-r border-surface-700/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Items */}
        <div className="p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Surveillance & Operations
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-600/15 text-primary-400 border border-primary-500/30 shadow-sm shadow-primary-500/10'
                      : item.highlight
                      ? 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 border border-amber-500/20'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-surface-800'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Quick Nagpur Outbreak Summary Card at Bottom */}
        <div className="p-4 border-t border-surface-700/80 bg-surface-900/50">
          <div className="p-3 rounded-xl bg-surface-800/90 border border-surface-600/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Nagpur Risk Summary
              </span>
              <span className="text-[10px] text-gray-500 font-mono">22 Wards</span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-center">
              <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="text-xs font-extrabold text-red-400">2</div>
                <div className="text-[9px] text-gray-400 uppercase font-semibold">Crit</div>
              </div>
              <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="text-xs font-extrabold text-orange-400">4</div>
                <div className="text-[9px] text-gray-400 uppercase font-semibold">High</div>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-xs font-extrabold text-amber-400">6</div>
                <div className="text-[9px] text-gray-400 uppercase font-semibold">Mod</div>
              </div>
              <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-xs font-extrabold text-green-400">10</div>
                <div className="text-[9px] text-gray-400 uppercase font-semibold">Low</div>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 pt-1 flex items-center justify-between">
              <span>Epidemic Threshold:</span>
              <span className="font-semibold text-red-400">+58% Surge</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
