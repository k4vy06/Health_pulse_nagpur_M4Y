import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  Radio,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import RoleSwitcher from './RoleSwitcher';
import { alertsAPI } from '../../services/api';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(7);
  const [currentTime, setCurrentTime] = useState('');
  const [isLiveApi, setIsLiveApi] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const alerts = await alertsAPI.getAll({ status: 'ACTIVE' });
        setActiveAlertCount(alerts?.length || 0);
      } catch {
        setActiveAlertCount(7);
      }
    };
    loadAlerts();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-surface-900/90 backdrop-blur-md border-b border-surface-700/80 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left side: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-800 transition-colors"
            aria-label="Toggle navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-400 p-0.5 shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-surface-900 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-400 group-hover:animate-pulse" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">HealthPulse</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 border border-primary-500/30">
                  NAGPUR
                </span>
              </div>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                NMC Disease Surveillance Command
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Live Surveillance Status & Clock */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/80 border border-surface-700 text-xs text-gray-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400">Live Surveillance Active</span>
            <span className="text-gray-500">•</span>
            <span className="font-mono text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              {currentTime || 'Nagpur, MH'}
            </span>
          </div>
        </div>

        {/* Right side: Alerts Pill, Role Switcher, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Outbreak Alerts button */}
          <Link
            to="/alerts"
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all duration-200"
            title="View Active Outbreak Alerts"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span className="hidden sm:inline">Alerts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {activeAlertCount}
            </span>
          </Link>

          {/* Role Switcher Button */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-600/80 text-xs text-gray-200 transition-all hover:border-primary-500/50"
            title="Switch Department Persona"
          >
            <Shield className="w-3.5 h-3.5 text-primary-400" />
            <span className="hidden xl:inline text-gray-400 font-medium">Role:</span>
            <span className="font-semibold text-primary-400 truncate max-w-[120px]">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-700 text-gray-400 border border-surface-600 font-mono">
              {user?.badge || 'PHO'}
            </span>
          </button>

          {/* User Profile Avatar & Logout */}
          <div className="flex items-center gap-1 pl-1 sm:pl-2 border-l border-surface-700">
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow"
              title={`${user?.name} (${user?.role})`}
            >
              {user?.avatar || 'PH'}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-surface-800 transition-colors"
              title="Sign Out"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Role Switcher Modal */}
      <RoleSwitcher
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </>
  );
}
