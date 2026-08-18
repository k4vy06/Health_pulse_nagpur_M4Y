import React from 'react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { Shield, UserCheck, Stethoscope, Briefcase } from 'lucide-react';
import Modal from '../common/Modal';

export default function RoleSwitcher({ isOpen, onClose }) {
  const { user, login } = useAuth();

  const roleProfiles = [
    {
      id: ROLES.HEALTH_OFFICER,
      title: 'Public Health Officer',
      person: 'Dr. Priya Sharma',
      badge: 'PHO-2024',
      icon: Stethoscope,
      color: 'from-blue-600/20 to-cyan-600/20 border-blue-500/40 text-blue-400',
      description: 'Full epidemiological intelligence, outbreak response planning, AI containment recommendations, and clinical surveillance.'
    },
    {
      id: ROLES.ADMIN,
      title: 'Municipal Administrator',
      person: 'Commissioner R. Kumar',
      badge: 'NMC-ADM',
      icon: Briefcase,
      color: 'from-purple-600/20 to-pink-600/20 border-purple-500/40 text-purple-400',
      description: 'Executive command center, inter-departmental resource allocation, hospital bed surge oversight, and policy dispatch.'
    },
    {
      id: ROLES.FIELD_WORKER,
      title: 'Field Health Worker',
      person: 'ASHA Worker Meena',
      badge: 'FW-0042',
      icon: UserCheck,
      color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/40 text-emerald-400',
      description: 'Rapid field checklist execution, larval surveys, door-to-door screenings, and ground-level status updates.'
    }
  ];

  const handleSelectRole = (roleId) => {
    login(roleId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Surveillance Role"
      subtitle="Select a persona to experience SehatSetu from different departmental perspectives"
      maxWidth="max-w-xl"
    >
      <div className="space-y-3">
        {roleProfiles.map((item) => {
          const Icon = item.icon;
          const isCurrent = user?.role === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectRole(item.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 ${
                isCurrent
                  ? 'bg-gradient-to-r ' + item.color + ' ring-2 ring-primary-500 shadow-lg'
                  : 'bg-surface-700/50 hover:bg-surface-700 border-surface-600 hover:border-surface-500'
              }`}
            >
              <div className={`p-3 rounded-xl bg-surface-800 border border-surface-600 flex-shrink-0 ${isCurrent ? 'text-primary-400' : 'text-gray-400'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white text-sm sm:text-base">{item.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-800 text-gray-400 border border-surface-600">
                      {item.badge}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/40">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs font-medium text-primary-400/90 mt-0.5">{item.person}</div>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
