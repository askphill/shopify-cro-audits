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
    <div className="relative rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-4 py-3 text-left flex items-center gap-3 rounded-lg cursor-pointer transition-colors ${
          expanded ? "bg-ap-brownLight rounded-b-none" : "bg-ap-greyLight hover:bg-ap-brownLight"
        }`}
      >
        <span className="text-lg font-bold tracking-tighter text-ap-red shrink-0">
          {String(index).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold tracking-tighter text-lg">
              {finding.title}
            </h3>
            <ThemeTag theme={finding.theme} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-ap-red hidden sm:inline">
            {"★".repeat(finding.business_impact)}
            <span className="text-ap-brown">{"★".repeat(5 - finding.business_impact)}</span>
          </span>
          <span
            className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-white transition-all text-black hover:opacity-50 shrink-0"
            style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
          >
            &#8250;
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-1.5 bg-white">
          <div className="p-4 rounded-2xl rounded-t-none bg-ap-greyLight">
            <p className="ap-description-text text-base leading-relaxed mb-4">
              {finding.issue_description}
            </p>

            {finding.screenshot_url && (
              <img
                src={finding.screenshot_url}
                alt={`Screenshot: ${finding.title}`}
                className="rounded-lg border border-ap-brown/20 mb-4 max-w-full"
              />
            )}

            {finding.evidence.length > 0 && (
              <ul className="list-disc list-inside text-sm ap-description-text mb-4 space-y-1">
                {finding.evidence.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}

            <a
              href={finding.plus_feature_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-ap-greenLight/50 px-4 py-1.5 text-sm font-bold tracking-tighter text-ap-greenDark hover:bg-ap-greenLight transition-colors"
            >
              Learn about {finding.plus_feature} on Shopify Plus &rarr;
            </a>

            <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-ap-brown/10">
              <StarRating
                value={finding.business_impact}
                label="Business Impact"
              />
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
