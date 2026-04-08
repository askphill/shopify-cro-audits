import type { Finding } from "../types/audit";

interface ExecutiveSummaryProps {
  summary: string;
  findings: Finding[];
}

export function ExecutiveSummary({
  summary,
  findings,
}: ExecutiveSummaryProps) {
  const topTheme = findings.reduce(
    (acc, f) => {
      acc[f.theme] = (acc[f.theme] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const mostCommonTheme = Object.entries(topTheme).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold tracking-tighter mb-4">
        Executive Summary
      </h2>
      <p className="ap-description-text text-base leading-relaxed mb-6">{summary}</p>

      <div className="flex gap-6 text-sm ap-description-text">
        <span>
          <strong className="text-black font-bold tracking-tighter">{findings.length}</strong> findings
        </span>
        {mostCommonTheme && (
          <span>
            Top theme:{" "}
            <strong className="text-black font-bold tracking-tighter">{mostCommonTheme}</strong>
          </span>
        )}
      </div>
    </section>
  );
}
