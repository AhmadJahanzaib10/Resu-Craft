import React, { useEffect } from 'react';
// import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '@/Firebase/firebase.config';

function Settings({ email, user }) {
  const handleResetPassword = async () => {
    if (!email) {
      alert("No email found. Please log in first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Error resetting password:", error.message);
      alert("Failed to send password reset email. Please try again.");
    }
  };
  useEffect(()=>{
    console.log(user)
  })
  return (
    <div className="mt-3">
      <p className="font-plight text-lg text-primary">Name:</p>
      <p className="font-plight text-base mb-3">{user.user.name || "Not logged in"}</p>
      <p className="font-plight text-lg text-primary">Email address:</p>
      <p className="font-plight text-base mb-3">{user.user.email || "Not logged in"}</p>
      <p className="font-plight text-lg text-primary">Profile Image:</p>
      <img 
  src={user.user.avatar} 
  alt="Profile" 
  referrerPolicy="no-referrer"
  className="w-16 h-16 rounded-full"
/>

      {/* <p className="font-plight text-lg text-primary mt-5">Reset your password here</p>
      <button
        onClick={handleResetPassword}
        className="bg-primary text-white cursor-pointer mt-1 px-3 py-2 rounded-lg"
      >
        Reset Password
      </button> */}

    </div>
  );
}

export default Settings;
