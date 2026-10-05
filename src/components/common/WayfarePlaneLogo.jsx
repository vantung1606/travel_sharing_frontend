import React from 'react';

/**
 * Custom-designed modern aerodynamic airplane logo for Wayfare.
 * Features a supersonic aircraft taking flight with 3D faceted depth,
 * an elegant orbital contrail, and a glowing guiding beacon.
 */
export const WayfarePlaneLogo = ({ className = 'w-5 h-5', ...props }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Soft atmospheric glow for contrail */}
        <linearGradient id="wfContrailGrad" x1="3" y1="29" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="60%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.75" />
        </linearGradient>

        {/* Shading gradient for lower fuselage wing facet */}
        <linearGradient id="wfWingShadow" x1="14" y1="16" x2="19" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.38" />
        </linearGradient>
      </defs>

      {/* 1. Dynamic Flight Contrails (Vệt bay tốc độ xé gió) */}
      <path
        d="M3 27.5C6.5 25 10.5 22 15 17.5"
        stroke="url(#wfContrailGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 29C9.5 27 12.5 24.5 15.5 21.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.3"
      />

      {/* 2. Main Supersonic Aircraft Body (Thân máy bay cất cánh góc 45 độ) */}
      <path
        d="M28.5 3.5L18.8 24.2L14.2 17.2L5.8 14.2L28.5 3.5Z"
        fill="currentColor"
      />

      {/* 3. 3D Faceted Wing Shading (Tạo độ khối vát 3D công nghệ cao) */}
      <path
        d="M28.5 3.5L14.2 17.2L18.8 24.2L28.5 3.5Z"
        fill="url(#wfWingShadow)"
      />

      {/* 4. Fine Supersonic Spine (Sống lưng khí động học sắc nét) */}
      <path
        d="M28.5 3.5L14.2 17.2"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* 5. Guiding Beacon / Sparkle Star at Jet Nose (Điểm sáng dẫn đường AI) */}
      <circle cx="28.5" cy="3.5" r="1.4" fill="#fde047" />
    </svg>
  );
};

export default WayfarePlaneLogo;
