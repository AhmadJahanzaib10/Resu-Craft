import React, { useState } from "react";
import { X, Menu } from "lucide-react"; // Icons for menu and close
import { Link } from "react-router-dom";

function NavBar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div>
      <nav className="p-3 border-b-2 border-gray-200 flex justify-between items-center h-16">
        {/* Logo */}
        <div>
          <p className="text-lg text-primary font-plight">Resume Shaper</p>
        </div>

        {/* Desktop Navigation (Hidden on mobile) */}
        <div className="hidden md:flex space-x-5 items-center">
          <a className="text-base text-primary font-plight hover:text-tertiary">Blogs</a>
          <Link to="/login" className="text-base text-primary font-plight hover:text-tertiary">Log In</Link>
          <Link to="/signup" className="text-base text-secondary bg-primary px-3 py-2 rounded-3xl font-plight hover:text-tertiary">
            Get Started
          </Link>
        </div>

        {/* Hamburger Menu (Visible on mobile) */}
        <button 
          className="md:hidden text-primary"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Mobile Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 md:hidden`}
      >
        {/* Close Button */}
        <button 
          className="absolute top-4 right-4 text-primary"
          onClick={() => setIsDrawerOpen(false)}
        >
          <X size={28} />
        </button>

        {/* Navigation Links */}
        <div className="flex flex-col mt-16 space-y-6 px-6">
          <a 
            className="text-primary font-light hover:opacity-80 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          >
            Blogs
          </a>
          <a 
            href="/login"
            className="text-primary font-light hover:opacity-80 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          >
            Log In
          </a>
          <a 
            href="/signup"
            className="text-secondary bg-primary px-3 py-2 rounded-3xl font-plight hover:text-tertiary text-center"
            onClick={() => setIsDrawerOpen(false)}
          >
            Get Started
          </a>
        </div>
      </div>

      {/* Background Overlay (Click to Close Drawer) */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
}

export default NavBar;

