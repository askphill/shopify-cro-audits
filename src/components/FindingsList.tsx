import type { Finding } from "../types/audit";
import { FindingCard } from "./FindingCard";

interface FindingsListProps {
  findings: Finding[];
  expandedIndices: Set<number>;
  onToggle: (index: number) => void;
}

const QUICK_WIN_COUNT = 3;

export function FindingsList({
  findings,
  expandedIndices,
  onToggle,
}: FindingsListProps) {
  const quickWins = findings.slice(0, QUICK_WIN_COUNT);
  const opportunities = findings.slice(QUICK_WIN_COUNT);

  return (
    <section data-component="FindingsList" className="mt-6">
      {quickWins.length > 0 && (
        <>
          <h2 className="text-2xl font-bold tracking-tighter mb-4">
            Quick Wins
          </h2>
          <div className="space-y-2">
            {quickWins.map((finding, i) => (
              <FindingCard
                key={i}
                finding={finding}
                index={i + 1}
                expanded={expandedIndices.has(i)}
                onToggle={() => onToggle(i)}
              />
            ))}
          </div>
        </>
      )}

      {opportunities.length > 0 && (
        <>
          <h2 className="text-2xl font-bold tracking-tighter mb-4 mt-8">
            Opportunities
          </h2>
          <div className="space-y-2">
            {opportunities.map((finding, i) => {
              const absoluteIndex = QUICK_WIN_COUNT + i;
              return (
                <FindingCard
                  key={absoluteIndex}
                  finding={finding}
                  index={absoluteIndex + 1}
                  expanded={expandedIndices.has(absoluteIndex)}
                  onToggle={() => onToggle(absoluteIndex)}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
