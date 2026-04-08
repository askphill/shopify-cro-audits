import type { Finding } from "../types/audit";
import { FindingCard } from "./FindingCard";

interface FindingsListProps {
  findings: Finding[];
  expandedIndices: Set<number>;
  onToggle: (index: number) => void;
}

export function FindingsList({
  findings,
  expandedIndices,
  onToggle,
}: FindingsListProps) {
  return (
    <section data-component="FindingsList" className="mt-6">
      <h2 className="text-2xl font-bold tracking-tighter mb-4">Findings</h2>
      <div className="space-y-2">
        {findings.map((finding, i) => (
          <FindingCard
            key={i}
            finding={finding}
            index={i + 1}
            expanded={expandedIndices.has(i)}
            onToggle={() => onToggle(i)}
          />
        ))}
      </div>
    </section>
  );
}
