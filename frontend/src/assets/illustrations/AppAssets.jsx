import React from 'react';

export const HeroIllustration = () => (
  <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
    <circle cx="250" cy="250" r="200" fill="#10B981" fillOpacity="0.05" />
    <rect x="150" y="300" width="200" height="120" rx="20" fill="#0F172A" />
    <rect x="170" y="320" width="40" height="40" rx="8" fill="#10B981" />
    <rect x="290" y="320" width="40" height="40" rx="8" fill="#10B981" />
    <path d="M150 350H350V400C350 411.046 341.046 420 330 420H170C158.954 420 150 411.046 150 400V350Z" fill="#1E293B" />
    <circle cx="190" cy="420" r="25" fill="#0F172A" stroke="white" strokeWidth="4" />
    <circle cx="310" cy="420" r="25" fill="#0F172A" stroke="white" strokeWidth="4" />
    {/* Static Leaf */}
    <g>
        <path d="M250 150C250 150 210 200 210 240C210 262.091 227.909 280 250 280C272.091 280 290 262.091 290 240C290 200 250 150 250 150Z" fill="#10B981" />
        <path d="M250 150V280" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

export const ImpactIllustration = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M40 100C40 66.8629 66.8629 40 100 40C133.137 40 160 66.8629 160 100C160 133.137 133.137 160 100 160" stroke="#10B981" strokeWidth="12" strokeLinecap="round" strokeDasharray="1 20" />
    <circle cx="100" cy="100" r="30" fill="#10B981" fillOpacity="0.1" />
    <path d="M90 100L100 110L120 90" stroke="#10B981" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
