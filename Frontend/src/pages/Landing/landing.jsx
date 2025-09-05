// import React from "react";

// const LandingPage = () => {
//   return (
//     <div className="w-full h-screen">
//       <iframe
//         src="https://resumeshaperai.com" // ✅ WordPress page URL
//         className="w-full h-full border-0"
//         title="Free AI Resume Checker"
//       />
//     </div>
//   );
// };

// export default LandingPage;
import React, { useState, useRef, useEffect } from "react";
import Lottie from "lottie-react";
import { Link } from "react-router-dom";
import heroImg from "../../assets/images/hero4.webp";
import NavBar from "../../components/NavBar";
import build from "../../assets/images/build-2.png";
import ai from "../../assets/images/ai-2.png";
import doc from "../../assets/images/doc-2.png";
import letter from "../../assets/images/letter-2.png";
import docAnimation from "../../assets/icons/docAnimation.json";
import tempRandom from "../../assets/images/temp.webp";
import tempRandom2 from "../../assets/images/temp2.webp";
import blog1 from "../../assets/images/blog1.webp";
import Footer from "../../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const animationRef = useRef(null);
   const navigate = useNavigate();

  useEffect(() => {
    // Initialize AOS only once
    AOS.init({
      duration: 700, // Animation duration in milliseconds
      easing: "ease-in-out", // Easing function
      once: true, // Whether animation should happen only once
    });
  }, []); 

  return (
    <div>
      {/* Hero Section */}
      <section className="h-screen flex flex-col">
        <NavBar />

        {/* Hero Content */}
        <div className="flex-1 flex">
          <div data-aos="fade-up" className="w-full md:w-1/2 flex flex-col px-14 justify-center">
            <h1 className="text-5xl font-pextralight text-primary">
              Resume That Gets <span className="text-tertiary">Hired</span>.
            </h1>
            <p className="text-xl text-primary font-pextralight mt-2">
              Stand out in the job market with AI-driven resume enhancements
              that make recruiters take notice and call you first.
            </p>

            <Link
              to="/signup"
              className="bg-primary text-secondary px-6 py-3 rounded-full mt-3 w-fit text-sm md:text-lg font-pextralight flex items-center justify-center gap-4 
                 transition-all duration-300 hover:scale-105 shadow-gray-400 shadow-xl"
              onMouseEnter={() => animationRef.current.play()} // Play animation on hover
              onMouseLeave={() => animationRef.current.pause()} // Pause animation on leave
            >
              Create Your Resume
              <div className="flex justify-center items-center h-8 w-8">
                <Lottie
                  lottieRef={animationRef}
                  animationData={docAnimation}
                  loop={true}
                  autoplay={false}
                />
              </div>
            </Link>
          </div>

          <div className="bg-primary w-0 md:w-1/2 flex items-end justify-center">
            <img src={heroImg} alt="hero" className="w-11/12 mt-20 relative" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section data-aos="fade-up" className="min-h-screen flex flex-col">
        {/* Stat Card */}
        <div className="border border-y-gray-200 border-x-0 p-10 flex flex-col justify-center items-center">
          <p className="font-pextralight text-5xl text-primary">75%</p>
          <p className="font-pextralight text-xl text-primary mt-2 text-center">
            of resumes are rejected by ATS before they reach a recruiter
          </p>
          <p className="font-pextralight text-xl text-primary mt-2">
            Dont let yours be one of them.
          </p>
        </div>

        {/* Features */}

        {/* <p className="font-plight text-3xl text-left px-14 pt-20 text-primary">Our Features.</p> */}

        <div className="flex flex-1 flex-col md:flex-row justify-between items-center mx-10 mt-5 md:mx-40">
          <div className="flex flex-row gap-5 items-center max-w-lg mb-5 md:mb-0">
            <img src={build} alt="ats" className="w-20 h-20" />
            <div>
              <p className="font-pextralight text-xl md:text-2xl text-primary">
                Step-by-Step Resume Builder
              </p>
              <p className="font-pextralight text-sm md:text-base text-primary">
                Guided, step-by-step resume builder that simplifies the process,
                helping you create a professional, job-winning resume with ease.
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-5 items-center max-w-lg mb-5 md:mb-0">
            <img src={doc} alt="doc" className="w-20 h-20" />
            <div>
              <p className="font-pextralight text-xl md:text-2xl text-primary">
                Resume Templates
              </p>
              <p className="font-pextralight text-sm md:text-base text-primary">
                Choose from professionally designed templates to make your
                resume visually appealing and ATS-friendly.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col md:flex-row justify-between items-center mx-10 mt-5 md:mx-40 mb-5">
          <div className="flex flex-row gap-5 items-center max-w-lg mb-5 md:mb-0">
            <img src={ai} alt="ai" className="w-20 h-20" />
            <div>
              <p className="font-pextralight text-xl md:text-2xl text-primary">
                AI Resume Optimization
              </p>
              <p className="font-pextralight text-sm md:text-base text-primary">
                Optimize your resume with AI-driven suggestions to increase your
                chances of getting hired.
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-5 items-center max-w-lg mb-5 md:mb-0">
            <img src={letter} alt="letter" className="w-20 h-20" />
            <div>
              <p className="font-pextralight text-xl md:text-2xl text-primary">
                Cover Letter Builder
              </p>
              <p className="font-pextralight text-sm md:text-base text-primary">
                Create a personalized cover letter that complements your resume
                and impresses recruiters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section data-aos="fade-up" className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <div className="w-full md:w-1/3 flex flex-col px-5 text-center justify-center items-center mb-2">
          <p className="text-xl font-pextralight text-white">
            Browse our range of ATS - friendly resume templates
          </p>
          <button onClick={() => navigate("/signup")} className="font-pextralight text-primary bg-secondary py-1 px-3 w-fit rounded-3xl text-sm mt-3 flex flex-row items-center gap-2 hover:scale-105 transition">
            Sign up to view all
            <svg
              className="w-7 h-7"
              viewBox="0 0 151 151"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M131.681 75.5L128.44 72.1072L88.3303 31.9978L81.54 38.7881L113.543 70.7812L18.875 70.7812V80.2187L113.547 80.2187L81.5447 112.217L88.3303 119.002L128.44 78.8927L131.681 75.5Z"
                fill="#24356E"
              />
            </svg>
          </button>
        </div>

        <div className="flex justify-end items-center mt-10 mx-10 md:mx-0">
          {/* Left Image */}
          <img
            src={tempRandom2}
            alt="Resume 1"
            className="w-0 md:w-[325px] h-auto rounded-lg transform scale-90 blur-xs"
          />

          {/* Center Image (Larger & Highlighted) */}
          <div className="relative">
            <img
              src={tempRandom}
              alt="Resume 2"
              className="w-[400px] h-auto rounded-lg shadow-xl"
            />
            <button onClick={() => navigate("/signup")} className="absolute text-xs md:text-base bottom-10 left-1/2 transform -translate-x-1/2 px-5 py-2 bg-tertiary text-white font-semibold rounded-3xl shadow-xl shadow-gray-400 hover:scale-105 transition">
              Use this template
            </button>
          </div>

          {/* Right Image */}
          <img
            src={tempRandom2}
            alt="Resume 3"
            className="w-0 md:w-[325px] h-auto rounded-lg blur-xs transform scale-90"
          />
        </div>
      </section>

      {/* Blogs Section */}
      <section data-aos="fade-up" className="min-h-screen flex flex-col items-center justify-center">
        <h3 className="font-pextralight text-2xl md:text-4xl text-primary">Our Blogs</h3>
        <p className="font-pextralight text-base md:text-xl text-primary mt-2 mx-10 text-center md:mx-0">
          Explore expert tips, career advice, and industry insights to help you
          craft the perfect resume and land your dream job.
        </p>

        <button className="font-pextralight text-primary mt-5 text-base md:text-lg flex flex-row gap-2 items-center">
          Explore All
          <svg
            className="w-4 h-4 md:w-6 md:h-6"
            viewBox="0 0 67 67"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M58.4282 33.5L56.9898 31.9946L39.1929 14.1978L36.18 17.2107L50.3798 31.4063L8.375 31.4063L8.375 35.5938L50.3819 35.5938L36.1821 49.7915L39.1929 52.8023L56.9898 35.0054L58.4282 33.5Z"
              fill="#EF8747"
            />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-12 px-6 md:px-40">
          {/* Blog Post 1 */}
          <div className="relative bg-white rounded-2xl border border-gray-200">
            <img
              src={blog1}
              alt="blog1"
              className="w-full h-40 object-cover rounded-t-2xl"
            />
            <div className="p-6">
              <p className="text-sm text-gray-500 font-pextralight">
                3 min read
              </p>
              <h3 className="text-xl font-psemibold text-gray-900 mt-2 group-hover:text-primary transition">
                Top Resume Tips to Land Your Dream Job Faster
              </h3>
              <p className="text-gray-600 text-sm mt-3 font-plight">
                A well-crafted resume is your ticket to job success. Learn how
                to optimize it for recruiters and applicant tracking systems.
              </p>
              <button className="mt-4 inline-flex items-center text-primary font-plight hover:underline transition">
                Read More →
              </button>
            </div>
          </div>
          
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
