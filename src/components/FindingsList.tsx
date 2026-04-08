import type { Finding } from "../types/audit";
import { FindingCard } from "./FindingCard";

interface FindingsListProps {
  findings: Finding[];
}

export function FindingsList({ findings }: FindingsListProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tighter mb-4">Findings</h2>
      <div className="space-y-3">
        {findings.map((finding, i) => (
          <FindingCard key={i} finding={finding} index={i + 1} />
        ))}
      </div>
    </section>
  );
}
