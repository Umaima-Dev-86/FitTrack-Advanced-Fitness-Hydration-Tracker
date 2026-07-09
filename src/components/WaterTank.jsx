import React from "react";

export default function WaterTank({ pct, size = 150 }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const h = 230 * (size / 150);
  const fillY = h - (h * clamped) / 100;
  return (
    <div className="tank" style={{ width: size, height: h }}>
      <svg viewBox={`0 0 124 ${h}`}>
        <defs>
          <clipPath id="tankClip">
            <rect x="4" y="4" width="116" height={h - 8} rx="26" />
          </clipPath>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e8f7" />
            <stop offset="100%" stopColor="#0090a0" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="116" height={h - 8} rx="26" fill="#1b1f27" stroke="#262b34" strokeWidth="3" />
        <g clipPath="url(#tankClip)">
          <rect x="-20" y={fillY} width="164" height={h + 10} fill="url(#waterGrad)">
            <animate attributeName="y" values={`${fillY};${fillY - 4};${fillY}`} dur="3s" repeatCount="indefinite" />
          </rect>
        </g>
        <rect x="4" y="4" width="116" height={h - 8} rx="26" fill="none" stroke="#262b34" strokeWidth="3" />
      </svg>
      <div className="tank-pct mono">{clamped}%</div>
    </div>
  );
}
