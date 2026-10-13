import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, role } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const currentRole = (role || localStorage.getItem('qmapUserRole') || (user && user.role) || '').toString().toLowerCase();

  const allowedArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const allowedLower = allowedArray.map(r => (r || '').toString().toLowerCase());

  if (!allowedLower.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
