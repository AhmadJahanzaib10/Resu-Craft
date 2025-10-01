import useAuth from "@/hooks/useAuth";
import React from "react";

function Dash({onSectionChange}) {
  const { user } = useAuth();
  return (
    <div className="mt-36 w-4/5 lg:w-2/3 mx-auto text-center">
  <div className="bg-white shadow-lg rounded-2xl p-10 border border-gray-100 relative overflow-hidden">
    {/* Decorative background circle */}
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-30"></div>
    <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-purple-100 rounded-full opacity-20"></div>

    <p className="font-bold text-primary text-4xl lg:text-5xl mb-6 animate-fade-in">
      👋 Hello, {user?.displayName || "Guest"}
    </p>

    <p className="mt-4 text-lg lg:text-xl text-gray-700 leading-relaxed animate-slide-up">
      Welcome back to your{" "}
      <span className="font-semibold text-primary">
        Resume Builder Dashboard
      </span>
      . Here, you can{" "}
      <span className="font-medium">
        create professional resumes, edit drafts, and download them anytime
      </span>
      . Keep all your career documents in one place — so you’re always ready
      for the next big opportunity 🚀
    </p>
    <button className="btn mt-3 text-white" style={{background: "#24356e"}} onClick={()=>{onSectionChange("Create New")}}>Build My Resume Now</button>
  </div>
</div>

  );
}

export default Dash;
