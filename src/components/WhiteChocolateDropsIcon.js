import React from "react";

const WhiteChocolateDropsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="15" r="6" fill="#F5DEB3" />
    <circle cx="8" cy="15" r="6" fill="url(#wc-grad1)" />
    <circle cx="16" cy="10" r="5.5" fill="#E8C872" />
    <circle cx="16" cy="10" r="5.5" fill="url(#wc-grad2)" />
    <circle cx="12" cy="6" r="4.5" fill="#F0D58C" />
    <circle cx="12" cy="6" r="4.5" fill="url(#wc-grad3)" />
    <circle cx="13" cy="4" r="1.5" fill="rgba(255,255,255,0.6)" />
    <circle cx="10" cy="12" r="1.8" fill="rgba(255,255,255,0.4)" />
    <circle cx="17" cy="8" r="1.2" fill="rgba(255,255,255,0.4)" />
    <defs>
      <radialGradient id="wc-grad1" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
        <stop offset="100%" stopColor="rgba(139,101,30,0.2)" />
      </radialGradient>
      <radialGradient id="wc-grad2" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
        <stop offset="100%" stopColor="rgba(139,101,30,0.2)" />
      </radialGradient>
      <radialGradient id="wc-grad3" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
        <stop offset="100%" stopColor="rgba(139,101,30,0.2)" />
      </radialGradient>
    </defs>
  </svg>
);

export default WhiteChocolateDropsIcon;
