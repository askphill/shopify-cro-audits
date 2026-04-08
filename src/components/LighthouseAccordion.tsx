import { useState } from "react";
import type { LighthouseScores } from "../types/audit";
import { LighthouseGauge } from "./LighthouseGauge";

interface LighthouseAccordionProps {
  lighthouseScores: LighthouseScores;
}

export function LighthouseAccordion({ lighthouseScores }: LighthouseAccordionProps) {
  const [expanded, setExpanded] = useState(false);

  const avg = Math.round(
    (lighthouseScores.performance +
      lighthouseScores.accessibility +
      lighthouseScores.seo +
      lighthouseScores.best_practices) /
      4
  );

  return (
    <div className="relative rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-4 py-3 text-left flex items-center gap-3 rounded-lg cursor-pointer transition-colors ${
          expanded ? "bg-ap-brownLight rounded-b-none" : "bg-ap-greyLight hover:bg-ap-brownLight"
        }`}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-bold tracking-tighter text-lg">
            Lighthouse Scores
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold tracking-tighter text-sm ap-description-text">
            Avg: {avg}
          </span>
          <span
            className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-white transition-all text-black hover:opacity-50 shrink-0"
            style={{ transform: expanded ? "rotate(90deg)" : "none" }}
          >
            &#8250;
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-1.5 bg-white">
          <div className="p-4 rounded-2xl rounded-t-none bg-ap-greyLight">
            <div className="flex flex-wrap justify-center gap-8">
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
          </div>
        </div>
      )}
    </div>
  );
}
