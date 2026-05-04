import { useState } from "react";
import type { Bug, BugSeverity } from "../types/audit";
import { BugRow } from "./BugRow";
import { ExpandToggleButton } from "./ExpandToggleButton";

const LOW_CAP = 5;

interface BugsSectionProps {
  bugs: Bug[];
}

const severityOrder: BugSeverity[] = ["critical", "high", "low"];

const severityHeadings: Record<BugSeverity, string> = {
  critical: "Critical",
  high: "High",
  low: "Low",
};

interface CollapsibleGroupProps {
  heading: string;
  count: number;
  children: React.ReactNode;
}

function CollapsibleGroup({ heading, count, children }: CollapsibleGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((v) => !v);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        aria-expanded={expanded}
        className={`flex items-center px-4 py-2 w-full rounded-lg cursor-pointer transition-colors ${
          expanded ? "bg-ap-brownLight" : "bg-ap-greyLight hover:bg-ap-brownLight"
        }`}
      >
        <h3 className="flex-1 min-w-0 text-sm font-bold tracking-tighter uppercase text-ap-greyDark">
          {heading}{" "}
          <span className="ap-description-text font-normal">({count})</span>
        </h3>
        <ExpandToggleButton isExpanded={expanded} onToggle={toggle} />
      </div>
      {expanded && <div className="space-y-2 mt-2">{children}</div>}
    </div>
  );
}

export function BugsSection({ bugs }: BugsSectionProps) {
  if (!bugs || bugs.length === 0) return null;

  const grouped = severityOrder.map((severity) => ({
    severity,
    items: bugs.filter((b) => b.severity === severity),
  }));

  const lowGroup = grouped.find((g) => g.severity === "low");
  let lowOverflow = 0;
  if (lowGroup && lowGroup.items.length > LOW_CAP) {
    lowOverflow = lowGroup.items.length - LOW_CAP;
    lowGroup.items = lowGroup.items.slice(0, LOW_CAP);
  }

  return (
    <section data-component="BugsSection" className="mt-8">
      <h2 className="text-2xl font-bold tracking-tighter mb-4">
        Technical Bugs
      </h2>
      <div className="space-y-4">
        {grouped.map((group) => {
          if (group.items.length === 0) return null;

          const rows = group.items.map((bug, i) => (
            <BugRow key={`${group.severity}-${i}`} bug={bug} />
          ));

          if (group.severity === "critical") {
            return (
              <div key={group.severity}>
                <h3 className="text-sm font-bold tracking-tighter uppercase text-ap-greyDark mb-2">
                  {severityHeadings[group.severity]}
                </h3>
                <div className="space-y-2">{rows}</div>
              </div>
            );
          }

          return (
            <CollapsibleGroup
              key={group.severity}
              heading={severityHeadings[group.severity]}
              count={group.items.length}
            >
              {rows}
              {group.severity === "low" && lowOverflow > 0 && (
                <p className="ap-description-text text-sm mt-2 italic">
                  + {lowOverflow} more low-severity{" "}
                  {lowOverflow === 1 ? "issue" : "issues"} — full list available
                  on request.
                </p>
              )}
            </CollapsibleGroup>
          );
        })}
      </div>
    </section>
  );
}
