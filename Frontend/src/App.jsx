import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { auth } from "./firebase";

// import Header from "./components/header/header";
import LandingPage from "./pages/Landing/landing";
import Login from "./pages/Auth/login";
import Signup from "./pages/Auth/signup";
import Dashboard from "./pages/Dashboard/dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import EmailVerificationRoute from "./components/EmailVerificationRoute";
import "./App.css";
import Success from "./pages/Actions/Success";
import Error from "./pages/Actions/Error";
import VerifyEmail from "./pages/Auth/VerifyEmail";

const App = () => {
  // const [user] = useAuthState(auth);
  return (
    <Router>
      {/* {user && <Header />} */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" exact element={<Login />} />
        <Route path="/signup" exact element={<Signup />} />
        <Route path="/success" exact element={<Success />} />
        <Route path="/cancel" exact element={<Error />} />
        <Route
          path="/verify-email"
          element={
            <EmailVerificationRoute>
              <VerifyEmail />
            </EmailVerificationRoute>
          }
        />
        {/* Protect Dashboard and Resume Builder */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} /> */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
