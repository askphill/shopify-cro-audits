import type { Bug, BugSeverity } from "../types/audit";
import { BugRow } from "./BugRow";

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
        Technical Bugs & Quick Fixes
      </h2>
      <div className="space-y-6">
        {grouped.map(
          (group) =>
            group.items.length > 0 && (
              <div key={group.severity}>
                <h3 className="text-sm font-bold tracking-tighter uppercase text-ap-greyDark mb-2">
                  {severityHeadings[group.severity]}
                </h3>
                <div className="space-y-2">
                  {group.items.map((bug, i) => (
                    <BugRow key={`${group.severity}-${i}`} bug={bug} />
                  ))}
                </div>
                {group.severity === "low" && lowOverflow > 0 && (
                  <p className="ap-description-text text-sm mt-2 italic">
                    + {lowOverflow} more low-severity{" "}
                    {lowOverflow === 1 ? "issue" : "issues"} — full list
                    available on request.
                  </p>
                )}
              </div>
            )
        )}
      </div>
    </section>
  );
}
