import React from "react";

const ModernInput = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  error, 
  type = "text",
  className = ""
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 bg-gray-50/70 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors ${
          error ? "border border-red-500 bg-red-50/50" : "border border-gray-200"
        } ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default ModernInput; 