"use client";

import React from "react";

type FalconSpinnerProps = {
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  text?: string;
  variant?: "default" | "minimal";
};

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const textSizeMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

export default function FalconSpinner({
  size = "md",
  fullScreen = false,
  text = "Loading",
  variant = "default",
}: FalconSpinnerProps) {
  const sizeClass = sizeMap[size];
  const textClass = textSizeMap[size];

  // SVG Falcon icon that spins
  const FalconIcon = () => (
    <svg
      viewBox="0 0 100 100"
      className={`${sizeClass} animate-spin`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Falcon head */}
      <circle cx="50" cy="30" r="12" stroke="currentColor" strokeWidth="2" className="text-gold" />
      
      {/* Falcon eye */}
      <circle cx="54" cy="28" r="2" fill="currentColor" className="text-gold" />
      
      {/* Falcon beak */}
      <line x1="62" y1="28" x2="70" y2="26" stroke="currentColor" strokeWidth="2" className="text-gold" />
      
      {/* Left wing */}
      <path
        d="M 45 35 Q 25 30 20 50 Q 25 55 40 45"
        stroke="currentColor"
        strokeWidth="2"
        className="text-indigo-light"
      />
      
      {/* Right wing */}
      <path
        d="M 55 35 Q 75 30 80 50 Q 75 55 60 45"
        stroke="currentColor"
        strokeWidth="2"
        className="text-indigo"
      />
      
      {/* Body */}
      <ellipse cx="50" cy="50" rx="10" ry="15" stroke="currentColor" strokeWidth="2" className="text-gold" />
      
      {/* Tail feathers */}
      <path
        d="M 50 65 Q 35 75 30 85"
        stroke="currentColor"
        strokeWidth="2"
        className="text-indigo-light"
      />
      <path
        d="M 50 65 Q 50 80 50 90"
        stroke="currentColor"
        strokeWidth="2"
        className="text-gold"
      />
      <path
        d="M 50 65 Q 65 75 70 85"
        stroke="currentColor"
        strokeWidth="2"
        className="text-indigo"
      />
    </svg>
  );

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <FalconIcon />
      {text && (
        <p className={`${textClass} font-medium text-muted animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinnerContent}
      </div>
    );
  }

  if (variant === "minimal") {
    return <FalconIcon />;
  }

  return (
    <div className="flex items-center justify-center">
      {spinnerContent}
    </div>
  );
}

// Minimal spinner for inline use
export function FalconSpinnerInline({ size = "sm" }: { size?: "sm" | "md" }) {
  return <FalconSpinner size={size} variant="minimal" text="" />;
}

// Full screen loading overlay
export function FalconSpinnerFullscreen({ text = "Loading..." }: { text?: string }) {
  return <FalconSpinner fullScreen size="lg" text={text} />;
}
