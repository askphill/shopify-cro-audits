import type { Finding } from "../types/audit";
import { ThemeTag } from "./ThemeTag";

interface ImpactTableProps {
  findings: Finding[];
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-ap-red">
      {"★".repeat(count)}
      <span className="text-ap-brown">{"★".repeat(5 - count)}</span>
    </span>
  );
}

export function ImpactTable({ findings }: ImpactTableProps) {
  return (
    <section data-component="ImpactTable" className="mt-6">
      <h2 className="text-2xl font-bold tracking-tighter mb-4">
        Impact Summary
      </h2>
      <div className="overflow-x-auto rounded-2xl bg-ap-greyLight">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ap-brown/20 bg-ap-brownLight text-left">
              <th className="px-4 py-3 font-bold tracking-tighter">Finding</th>
              <th className="px-4 py-3 font-bold tracking-tighter">Theme</th>
              <th className="px-4 py-3 font-bold tracking-tighter">Business</th>
              <th className="px-4 py-3 font-bold tracking-tighter">User</th>
              <th className="px-4 py-3 font-bold tracking-tighter">Effort</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f, i) => (
              <tr key={i} className="border-b border-ap-brown/10 hover:bg-ap-brownLight/50 transition-colors">
                <td className="px-4 py-3 font-medium tracking-tighter">{f.title}</td>
                <td className="px-4 py-3">
                  <ThemeTag theme={f.theme} />
                </td>
                <td className="px-4 py-3">
                  <Stars count={f.business_impact} />
                </td>
                <td className="px-4 py-3">
                  <Stars count={f.user_impact} />
                </td>
                <td className="px-4 py-3">
                  <Stars count={f.effort_to_fix} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
