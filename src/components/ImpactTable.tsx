import type { Finding } from "../types/audit";
import { ThemeTag } from "./ThemeTag";

interface ImpactTableProps {
  findings: Finding[];
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-ap-red">
      {"★".repeat(count)}
      <span className="text-gray-300">{"★".repeat(5 - count)}</span>
    </span>
  );
}

export function ImpactTable({ findings }: ImpactTableProps) {
  return (
    <section className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold tracking-tighter mb-6">
          Impact Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 font-semibold tracking-tight">Finding</th>
                <th className="pb-3 font-semibold tracking-tight">Theme</th>
                <th className="pb-3 font-semibold tracking-tight">Business</th>
                <th className="pb-3 font-semibold tracking-tight">User</th>
                <th className="pb-3 font-semibold tracking-tight">Effort</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 font-medium">{f.title}</td>
                  <td className="py-3">
                    <ThemeTag theme={f.theme} />
                  </td>
                  <td className="py-3">
                    <Stars count={f.business_impact} />
                  </td>
                  <td className="py-3">
                    <Stars count={f.user_impact} />
                  </td>
                  <td className="py-3">
                    <Stars count={f.effort_to_fix} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
