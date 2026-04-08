interface LighthouseGaugeProps {
  score: number;
  label: string;
}

function getColor(score: number): string {
  if (score >= 90) return "#0DC147";
  if (score >= 50) return "#FF8C00";
  return "#DE0015";
}

export function LighthouseGauge({ score, label }: LighthouseGaugeProps) {
  const color = getColor(score);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div data-component="LighthouseGauge" className="flex flex-col items-center gap-1">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#D8CCB5"
          strokeWidth="8"
          opacity="0.3"
        />
        <circle
          data-testid="gauge-circle"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-xl font-bold"
          fill="#131313"
        >
          {score}
        </text>
      </svg>
      <span className="text-xs font-bold tracking-tighter text-ap-greyDark">
        {label}
      </span>
    </div>
  );
}
