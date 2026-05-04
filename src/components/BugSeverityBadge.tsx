import type { BugSeverity } from "../types/audit";

const severityClasses: Record<BugSeverity, string> = {
  critical: "bg-ap-redLight text-ap-redDark",
  high: "bg-ap-brown/40 text-ap-brownDark",
  low: "bg-ap-greyDark/15 text-ap-greyDark",
};

const severityLabels: Record<BugSeverity, string> = {
  critical: "Critical",
  high: "High",
  low: "Low",
};

interface BugSeverityBadgeProps {
  severity: BugSeverity;
}

export function BugSeverityBadge({ severity }: BugSeverityBadgeProps) {
  return (
    <span
      data-component="BugSeverityBadge"
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold tracking-tighter ${severityClasses[severity]}`}
    >
      {severityLabels[severity]}
    </span>
  );
}
