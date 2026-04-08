import type { Finding } from "../types/audit";
import { FindingCard } from "./FindingCard";

interface FindingsListProps {
  findings: Finding[];
}

export function FindingsList({ findings }: FindingsListProps) {
  return (
    <section className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold tracking-tighter mb-6">Findings</h2>
        <div className="space-y-4">
          {findings.map((finding, i) => (
            <FindingCard key={i} finding={finding} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
