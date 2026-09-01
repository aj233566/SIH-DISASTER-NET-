import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const ROLES = {
  CITIZEN: 'citizen',
  FIELD_OFFICER: 'fieldOfficer',
  AUTHORITY: 'authority'
};

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    return localStorage.getItem('cascade_role') || ROLES.AUTHORITY;
  });

  useEffect(() => {
    localStorage.setItem('cascade_role', role);
  }, [role]);

  const isCitizen = role === ROLES.CITIZEN;
  const isFieldOfficer = role === ROLES.FIELD_OFFICER;
  const isAuthority = role === ROLES.AUTHORITY;

  return (
    <RoleContext.Provider value={{ role, setRole, isCitizen, isFieldOfficer, isAuthority, ROLES }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
