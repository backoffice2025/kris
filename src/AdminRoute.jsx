import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ user, isAdmin, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/kri" replace />;
  }
  return children;
};

export default AdminRoute;