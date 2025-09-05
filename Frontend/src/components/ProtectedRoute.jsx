import React from "react";
import { Navigate } from "react-router-dom";
// import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth"; // ✅ Use Firebase Hooks
import { auth } from "@/Firebase/firebase.config";

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth); // ✅ Listen for authentication changes

  if (loading) return <p>Loading...</p>; // ✅ Show loading state until Firebase checks auth

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
