import React from "react";

const RockletsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="15" r="6" fill="#FF6B9D" />
    <circle cx="8" cy="15" r="6" fill="url(#rocklets-grad1)" />
    <circle cx="16" cy="10" r="5.5" fill="#FFD93D" />
    <circle cx="16" cy="10" r="5.5" fill="url(#rocklets-grad2)" />
    <circle cx="12" cy="6" r="4.5" fill="#6BCB77" />
    <circle cx="12" cy="6" r="4.5" fill="url(#rocklets-grad3)" />
    <circle cx="13" cy="4" r="1.5" fill="rgba(255,255,255,0.35)" />
    <circle cx="10" cy="12" r="1.8" fill="rgba(255,255,255,0.3)" />
    <circle cx="17" cy="8" r="1.2" fill="rgba(255,255,255,0.3)" />
    <defs>
      <radialGradient id="rocklets-grad1" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
      </radialGradient>
      <radialGradient id="rocklets-grad2" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
      </radialGradient>
      <radialGradient id="rocklets-grad3" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
      </radialGradient>
    </defs>
  </svg>
);

export default RockletsIcon;
