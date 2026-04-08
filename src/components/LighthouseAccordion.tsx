import { useState } from "react";
import type { LighthouseScores } from "../types/audit";
import { LighthouseGauge } from "./LighthouseGauge";
import { ExpandToggleButton } from "./ExpandToggleButton";

interface LighthouseAccordionProps {
  lighthouseScores: LighthouseScores;
  expanded?: boolean;
  onToggle?: () => void;
}

export function LighthouseAccordion({
  lighthouseScores,
  expanded: controlledExpanded,
  onToggle,
}: LighthouseAccordionProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;

  const toggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const avg = Math.round(
    (lighthouseScores.performance +
      lighthouseScores.accessibility +
      lighthouseScores.seo +
      lighthouseScores.best_practices) /
      4
  );

  const handleToggleBtn = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  return (
    <section data-component="LighthouseAccordion" className="relative rounded-lg">
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggle();
        }}
        className={`relative z-[1] flex items-center px-4 py-3 w-full rounded-lg cursor-pointer transition-colors ${
          expanded
            ? "bg-ap-brownLight"
            : "bg-ap-greyLight hover:bg-ap-brownLight"
        }`}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-bold tracking-tighter text-lg leading-7">
            Lighthouse Scores
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold tracking-tighter text-sm ap-description-text">
            Avg: {avg}
          </span>
          <ExpandToggleButton isExpanded={expanded} onToggle={handleToggleBtn} />
        </div>
      </div>

      {expanded && (
        <div className="px-1.5 relative bg-white">
          <div className="p-4 rounded-2xl rounded-t-none overflow-hidden bg-ap-greyLight">
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
    </section>
  );
}
