import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  HEALTH_OFFICER: 'Public Health Officer',
  ADMIN: 'Municipal Administrator',
  FIELD_WORKER: 'Field Health Worker',
};

const DEMO_USERS = {
  [ROLES.HEALTH_OFFICER]: { name: 'Dr. Priya Sharma', role: ROLES.HEALTH_OFFICER, badge: 'PHO-2024', avatar: 'PS' },
  [ROLES.ADMIN]: { name: 'Commissioner R. Kumar', role: ROLES.ADMIN, badge: 'NMC-ADM', avatar: 'RK' },
  [ROLES.FIELD_WORKER]: { name: 'ASHA Worker Meena', role: ROLES.FIELD_WORKER, badge: 'FW-0042', avatar: 'MW' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (role) => {
    setUser(DEMO_USERS[role]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
