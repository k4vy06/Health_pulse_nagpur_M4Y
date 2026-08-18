import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import {
  Activity,
  Stethoscope,
  Briefcase,
  UserCheck,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleLogin = (roleKey) => {
    login(roleKey);
    navigate('/dashboard');
  };

  const personas = [
    {
      role: ROLES.HEALTH_OFFICER,
      name: 'Dr. Priya Sharma',
      title: 'Public Health Officer (PHO)',
      badge: 'PHO-2024',
      avatar: 'PS',
      icon: Stethoscope,
      accent: 'from-blue-600 to-cyan-600 border-blue-500/40 text-blue-400',
      description: 'Epidemiological surveillance, risk scoring, AI containment protocols, and outbreak investigation.',
      permissions: ['AI Outbreak Prediction', 'Alert Authorization', 'Intervention Dispatch']
    },
    {
      role: ROLES.ADMIN,
      name: 'Commissioner R. Kumar',
      title: 'Municipal Administrator (NMC)',
      badge: 'NMC-ADM',
      avatar: 'RK',
      icon: Briefcase,
      accent: 'from-purple-600 to-pink-600 border-purple-500/40 text-purple-400',
      description: 'City-wide executive metrics, inter-ward resource allocation, and hospital bed pressure management.',
      permissions: ['Executive Dashboard', 'Facility Allocation', 'Inter-Ward Quarantine']
    },
    {
      role: ROLES.FIELD_WORKER,
      name: 'ASHA Worker Meena',
      title: 'Field Health & ASHA Lead',
      badge: 'FW-0042',
      avatar: 'MW',
      icon: UserCheck,
      accent: 'from-emerald-600 to-teal-600 border-emerald-500/40 text-emerald-400',
      description: 'Rapid on-ground task completion, larval surveys, fever tracking, and door-to-door advisories.',
      permissions: ['Task Checklists', 'Field Status Updates', 'Local Alert Tracking']
    }
  ];

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-cyan-400 p-0.5 shadow-lg shadow-primary-500/20">
            <div className="w-full h-full bg-surface-900 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              SehatSetu
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-primary-500/20 text-primary-400 border border-primary-500/30">
                NAGPUR
              </span>
            </h1>
            <p className="text-[11px] text-gray-400">Nagpur Municipal Corporation (NMC)</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-surface-800/80 px-3 py-1.5 rounded-full border border-surface-700">
          <MapPin className="w-3.5 h-3.5 text-primary-400" />
          <span>Surveillance Zone: 22 Wards</span>
        </div>
      </header>

      {/* Main Hero & Login Selection */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 max-w-6xl mx-auto w-full">
        <div className="w-full space-y-8 py-6">
          {/* Headline */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Outbreak Intelligence & Containment
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Nagpur Epidemic Surveillance & Early Warning Command
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Select your departmental profile to access live geospatial disease tracking, 4-factor risk scoring, and automated PulseAI response protocols.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {personas.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.role}
                  className="group relative bg-surface-800/90 hover:bg-surface-800 border border-surface-600/80 hover:border-primary-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/20 flex flex-col justify-between flex-1"
                >
                  <div className="space-y-4">
                    {/* Role Header */}
                    <div className="flex items-start justify-between">
                      <div className={`p-3.5 rounded-xl bg-surface-700/80 border border-surface-600 group-hover:scale-105 transition-transform ${p.accent.split(' ').pop()}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-surface-700 text-gray-300 border border-surface-600">
                        {p.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white">{p.name}</h3>
                      <p className="text-xs font-semibold text-primary-400 mt-0.5">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-2.5 leading-relaxed">{p.description}</p>
                    </div>

                    {/* Permissions / Features */}
                    <div className="pt-3 border-t border-surface-700/80 space-y-1.5">
                      {p.permissions.map((perm) => (
                        <div key={perm} className="flex items-center gap-2 text-[11px] text-gray-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{perm}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 mt-4">
                    <button
                      onClick={() => handleRoleLogin(p.role)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-surface-700 to-surface-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md group-hover:shadow-primary-600/30"
                    >
                      <span>Access Surveillance Command</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Municipal Trust & Spec Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-400" />
              <span>NMC Epidemic Cell Authorized</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>22 Wards Continuous GIS Telemetry</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Vector & Water-Borne Surveillance</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-gray-500 border-t border-surface-800 z-10">
        Nagpur Municipal Corporation • Health & Family Welfare Department • PulseAI Surveillance v2.4
      </footer>
    </div>
  );
}
