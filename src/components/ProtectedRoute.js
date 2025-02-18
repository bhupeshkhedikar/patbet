import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, children, allowGuest }) => {
  if (!user && !allowGuest) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
