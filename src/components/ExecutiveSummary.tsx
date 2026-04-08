import type { LighthouseScores, Finding } from "../types/audit";
import { LighthouseGauge } from "./LighthouseGauge";

interface ExecutiveSummaryProps {
  summary: string;
  lighthouseScores: LighthouseScores;
  findings: Finding[];
}

export function ExecutiveSummary({
  summary,
  lighthouseScores,
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
    <section className="bg-white border-b border-ap-brown/20 px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold tracking-tighter mb-4">
          Executive Summary
        </h2>
        <p className="ap-description-text text-base leading-relaxed mb-8">{summary}</p>

        <div className="flex flex-wrap justify-center gap-8 mb-8 bg-ap-greyLight rounded-lg px-6 py-6">
          <LighthouseGauge
            score={lighthouseScores.performance}
            label="Performance"
          />
          <LighthouseGauge
            score={lighthouseScores.accessibility}
            label="Accessibility"
          />
          <LighthouseGauge score={lighthouseScores.seo} label="SEO" />
          <LighthouseGauge
            score={lighthouseScores.best_practices}
            label="Best Practices"
          />
        </div>

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
      </div>
    </section>
  );
}
