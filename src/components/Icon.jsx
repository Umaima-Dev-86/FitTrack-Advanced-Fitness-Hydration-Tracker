import React from "react";

// Generic path-based icon renderer, paths separated by "M" segments already include the M.
export default function Icon({ d, size = 18, color = "currentColor", strokeWidth = 2.2 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

export const PATHS = {
  dumbbell: "M6.5 6.5 17.5 17.5M4 4l3 3M20 20l-3-3M2.5 8.5 8.5 2.5M15.5 21.5l6-6M8 16l-2 2M18 6l-2 2",
  water: "M12 2c-2 4-6 8.5-6 12.5A6 6 0 0 0 18 14.5C18 10.5 14 6 12 2z",
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  chart: "M4 19V9M10 19V5M16 19v-7M22 19H2",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.36.2.75.2 1.15V10a2 2 0 0 1 0 4z",
  steps: "M4 16l4-4 3 3 6-8",
  flame: "M12 2c-1.5 3-4 5-4 9a4 4 0 0 0 8 0c0-4-2.5-6-4-9z",
  clock: "M12 7v5l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  strength: "M6.5 17.5h11M4 12h16M9 6.5h6M2 12h2M20 12h2M6.5 9v6M17.5 9v6",
  cardio: "M22 12h-4l-3 9L9 3l-3 9H2",
  hiit: "M13 2 3 14h7l-1 8 10-12h-7z",
  cycling: "M5 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 19 15 8h-6l3 11zM12 8l2-4h3",
  yoga: "M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 21l3-7 3 3 3-3 3 7M9 14l3-6 3 6",
};
