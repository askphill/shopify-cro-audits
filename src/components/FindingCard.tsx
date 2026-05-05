import { useState } from "react";
import type { Finding } from "../types/audit";
import { StarRating } from "./StarRating";
import { FindingCardToggle } from "./FindingCardToggle";

interface FindingCardProps {
  finding: Finding;
  index: number;
  expanded?: boolean;
  onToggle?: () => void;
}

export function FindingCard({
  finding,
  index,
  expanded: controlledExpanded,
  onToggle,
}: FindingCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded ?? internalExpanded;

  const toggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  return (
    <section data-component="FindingCard" className="relative rounded-lg">
      <FindingCardToggle
        title={finding.title}
        index={index}
        theme={finding.theme}
        expanded={expanded}
        onToggle={toggle}
      />

      {expanded && (
        <div className="px-1.5 relative bg-white">
          <div className="p-4 rounded-2xl rounded-t-none overflow-hidden bg-ap-greyLight">
            <p className="ap-description-text mb-4">
              {finding.issue_description}
            </p>

            {finding.screenshot_url && (
              <img
                src={finding.screenshot_url}
                alt={`Screenshot: ${finding.title}`}
                className="rounded-md max-w-full h-auto mb-4"
              />
            )}

            {finding.evidence.length > 0 && (
              <ul className="list-disc list-inside ap-description-text text-sm mb-4 space-y-1">
                {finding.evidence.map((e, i) => (
                  <li key={i} className="ml-2">
                    {e}
                  </li>
                ))}
              </ul>
            )}

            {finding.shopify_solution && (
              <p
                data-testid="shopify-solution"
                className="text-sm italic text-ap-greyDark mb-4"
              >
                {finding.shopify_solution}
              </p>
            )}

            <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-ap-brown/10">
              <StarRating
                value={finding.business_impact}
                label="Business Impact"
              />
              <StarRating value={finding.user_impact} label="User Impact" />
              <StarRating
                value={finding.effort_to_fix}
                label="Effort to Fix"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
