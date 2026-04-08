import { useState } from "react";
import type { Finding } from "../types/audit";
import { ThemeTag } from "./ThemeTag";
import { StarRating } from "./StarRating";

interface FindingCardProps {
  finding: Finding;
  index: number;
}

export function FindingCard({ finding, index }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-ap-popup overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 text-left flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="text-2xl font-bold tracking-tighter text-ap-red shrink-0">
          {String(index).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="font-bold tracking-tight text-lg">
              {finding.title}
            </h3>
            <ThemeTag theme={finding.theme} />
          </div>
          <StarRating value={finding.business_impact} label="Business Impact" />
        </div>
        <span className="text-ap-greyDark text-xl shrink-0">
          {expanded ? "\u2212" : "+"}
        </span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 pt-0 border-t border-gray-100">
          <div className="pl-12">
            <p className="text-black/70 leading-relaxed mt-4 mb-4">
              {finding.issue_description}
            </p>

            {finding.screenshot_url && (
              <img
                src={finding.screenshot_url}
                alt={`Screenshot: ${finding.title}`}
                className="rounded-lg border border-gray-200 mb-4 max-w-full"
              />
            )}

            {finding.evidence.length > 0 && (
              <ul className="list-disc list-inside text-sm text-black/60 mb-4 space-y-1">
                {finding.evidence.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}

            <a
              href={finding.plus_feature_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ap-green hover:text-ap-greenDark transition-colors"
            >
              Learn about {finding.plus_feature} on Shopify Plus &rarr;
            </a>

            <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
              <StarRating
                value={finding.user_impact}
                label="User Impact"
              />
              <StarRating
                value={finding.effort_to_fix}
                label="Effort to Fix"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
