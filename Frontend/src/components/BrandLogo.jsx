import React from 'react';

export const BrandLogo = ({ size = 28, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, display: 'inline-block' }}
    >
      <defs>
        <filter id="glow-react-logo" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <linearGradient id="rf-bg-grad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        <linearGradient id="rf-plate-grad" x1="12" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
        </linearGradient>

        <linearGradient id="rf-core-grad" x1="20" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>

        <linearGradient id="rf-fold-grad" x1="38" y1="10" x2="50" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
      </defs>

      {/* Squircle */}
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#rf-bg-grad)" />

      {/* Inner Plate */}
      <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#rf-plate-grad)" />

      {/* Document Shape */}
      <path 
        d="M19 15C19 13.3431 20.3431 12 22 12H37L46 21V48C46 49.6569 44.6569 51 43 51H22C20.3431 51 19 49.6569 19 48V15Z" 
        fill="#1E293B" 
        stroke="url(#rf-bg-grad)" 
        strokeWidth="1.8" 
        strokeLinejoin="round" 
      />

      {/* Folded Corner */}
      <path 
        d="M37 12V19C37 20.1046 37.8954 21 39 21H46" 
        fill="url(#rf-fold-grad)" 
        stroke="url(#rf-bg-grad)" 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
      />

      {/* Detail Lines */}
      <rect x="24" y="22" width="10" height="2.5" rx="1.25" fill="#64748B" />
      <rect x="24" y="27" width="16" height="2" rx="1" fill="#475569" />
      <rect x="24" y="31.5" width="13" height="2" rx="1" fill="#475569" />

      {/* Sparkling AI Forge Core */}
      <g filter="url(#glow-react-logo)">
        <path 
          d="M32 35 C32 38.5 28.5 42 25 42 C28.5 42 32 45.5 32 49 C32 45.5 35.5 42 39 42 C35.5 42 32 38.5 32 35Z" 
          fill="url(#rf-core-grad)" 
        />
        <path 
          d="M39 30 C39 31.8 37.2 33.5 35.5 33.5 C37.2 33.5 39 35.2 39 37 C39 35.2 40.8 33.5 42.5 33.5 C40.8 33.5 39 31.8 39 30Z" 
          fill="#38BDF8" 
          opacity="0.9" 
        />
      </g>

      <circle cx="32" cy="42" r="1.5" fill="#FFFFFF" />
    </svg>
  );
};

export default BrandLogo;
