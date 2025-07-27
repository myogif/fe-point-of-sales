import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute = ({ children, allowedRoles = ['admin'] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect cashier users to POS page if they try to access admin routes
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;