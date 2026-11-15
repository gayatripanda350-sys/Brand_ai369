import { useEffect, useState } from 'react';

type CircularProgressProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorScheme?: 'blue' | 'green' | 'auto';
};

const colorMap = {
  blue: { stroke: '#2563eb', glow: '#3b82f6', track: '#dbeafe' },
  green: { stroke: '#16a34a', glow: '#22c55e', track: '#dcfce7' },
};

export default function CircularProgress({
  value,
  size = 180,
  strokeWidth = 12,
  label = 'Compliance',
  sublabel = 'Average Score',
  colorScheme = 'auto',
}: CircularProgressPropsProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  const scheme = colorScheme === 'auto'
    ? (value >= 80 ? colorMap.green : colorMap.blue)
    : colorMap[colorScheme];

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(Math.round(eased * value));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={scheme.stroke} />
              <stop offset="100%" stopColor={scheme.glow} />
            </linearGradient>
            <filter id="progressGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scheme.track}
            strokeWidth={strokeWidth}
          />

          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#progressGlow)"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-extrabold tabular-nums"
            style={{ color: scheme.stroke }}
          >
            {animatedValue}
            <span className="text-xl font-bold opacity-60">%</span>
          </span>
          <span className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>

      {sublabel && (
        <p className="text-sm text-gray-500 mt-3 font-medium">{sublabel}</p>
      )}
    </div>
  );
}
