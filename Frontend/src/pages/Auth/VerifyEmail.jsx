import React, { useEffect, useState } from "react";
import { auth } from "@/Firebase/firebase.config";
import { sendEmailVerification, reload } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Refresh user's state from Firebase servers
      await reload(user);

      if (user.emailVerified) {
        navigate("/dashboard");
      }
    };

    // Check every 3 seconds
    const interval = setInterval(checkVerificationStatus, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  const resendEmail = async () => {
    setSending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      Swal.fire({
        icon: "success",
        title: "Verification email sent!",
        text: "Please check your inbox.",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error sending email",
        text: err.message,
      });
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Verify Your Email</h1>
      <p className="text-gray-600 w-50">
      A verification link has been sent to your email. If you don’t see it in your inbox, please check your spam or junk folder. Once verified, you will be redirected automatically.
      </p>

      <div className="d-flex gap-2">
      <button
        onClick={resendEmail}
        disabled={sending}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        {sending ? "Sending..." : "Resend verification email"}
      </button>
      <button className="bg-zinc-500 text-white px-6 py-2 rounded">
      <Navigate to="/login"/>
      </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
