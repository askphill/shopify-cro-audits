import type { Bug } from "../types/audit";
import { BugSeverityBadge } from "./BugSeverityBadge";

interface BugRowProps {
  bug: Bug;
}

export function BugRow({ bug }: BugRowProps) {
  return (
    <div
      data-component="BugRow"
      className="rounded-lg bg-ap-greyLight p-4 space-y-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <BugSeverityBadge severity={bug.severity} />
        <span className="inline-flex items-center whitespace-nowrap rounded-full bg-ap-brown/20 text-ap-brownDark px-2.5 py-0.5 text-xs font-bold tracking-tighter">
          {bug.category}
        </span>
        <h4 className="text-base font-bold tracking-tighter">{bug.title}</h4>
      </div>

      <p className="text-xs text-ap-greyDark">{bug.location}</p>

      {bug.evidence && (
        <p className="ap-description-text text-sm">
          <span className="font-bold tracking-tighter text-black">
            Evidence:
          </span>{" "}
          {bug.evidence}
        </p>
      )}

      <p className="ap-description-text text-sm">
        <span className="font-bold tracking-tighter text-black">Fix:</span>{" "}
        {bug.quick_fix}
      </p>

      {bug.screenshot_url && (
        <img
          src={bug.screenshot_url}
          alt={`Screenshot: ${bug.title}`}
          className="rounded-md max-w-full h-auto mt-2"
        />
      )}
    </div>
  );
}
