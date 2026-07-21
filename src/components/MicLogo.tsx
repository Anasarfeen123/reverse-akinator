import React from 'react';

const Hexagon = ({ cx, cy, r, fill, className }: { cx: number, cy: number, r: number, fill: string, className?: string }) => {
  const points = [
    `${cx - r/2},${cy - r * 0.866}`,
    `${cx + r/2},${cy - r * 0.866}`,
    `${cx + r},${cy}`,
    `${cx + r/2},${cy + r * 0.866}`,
    `${cx - r/2},${cy + r * 0.866}`,
    `${cx - r},${cy}`
  ].join(' ');
  return <polygon points={points} fill={fill} className={className} />;
}

export const MicLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  // Center of logo is 50, 50. Hexagon radius R = 18.5 to leave a slight gap
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Top: Yellow */}
      <Hexagon cx={50} cy={32.68} r={18.5} fill="#EAB308" />
      {/* Bottom: Green */}
      <Hexagon cx={50} cy={67.32} r={18.5} fill="#16A34A" />
      {/* Left: Orange */}
      <Hexagon cx={20} cy={50} r={18.5} fill="#EA580C" />
      {/* Right: Blue */}
      <Hexagon cx={80} cy={50} r={18.5} fill="#2563EB" />
    </svg>
  );
};
