"use client";
import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  color = "#EE8E32",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} rounded-full animate-spin`}
        style={{
          borderColor: `${color} transparent ${color} transparent`,
          borderWidth: size === "sm" ? "2px" : size === "md" ? "3px" : "4px",
        }}
      ></div>
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader size="lg" />
        <p className="text-[#EE8E32] font-semibold">Loading...</p>
      </div>
    </div>
  );
};

export const ButtonLoader: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Loader size="sm" color="#ffffff" />
      <span>Loading...</span>
    </div>
  );
};

