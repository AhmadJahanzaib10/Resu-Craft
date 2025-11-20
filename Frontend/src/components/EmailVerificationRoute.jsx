import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const EmailVerificationRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or a spinner

  if (!user) {
    // User not logged in → redirect to login
    return <Navigate to="/login" />;
  }

  if (user.emailVerified) {
    // User already verified → redirect to dashboard
    return <Navigate to="/dashboard" />;
  }

  // User is logged in but NOT verified → show children
  return children;
};

export default EmailVerificationRoute;
