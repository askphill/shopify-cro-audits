import type { CoreWebVitals, CoreWebVitalMetrics } from "../types/audit";

interface CoreWebVitalsTableProps {
  coreWebVitals: CoreWebVitals;
}

interface MetricConfig {
  key: keyof CoreWebVitalMetrics;
  label: string;
  unit: string;
  good: number;
  poor: number;
}

const metrics: MetricConfig[] = [
  { key: "lcp_ms", label: "LCP", unit: "s", good: 2500, poor: 4000 },
  { key: "fcp_ms", label: "FCP", unit: "s", good: 1800, poor: 3000 },
  { key: "inp_ms", label: "INP", unit: "ms", good: 200, poor: 500 },
  { key: "tbt_ms", label: "TBT", unit: "ms", good: 200, poor: 600 },
  { key: "cls", label: "CLS", unit: "", good: 0.1, poor: 0.25 },
  { key: "ttfb_ms", label: "TTFB", unit: "s", good: 800, poor: 1800 },
];

function getRating(value: number, config: MetricConfig): "good" | "needs-improvement" | "poor" {
  if (value <= config.good) return "good";
  if (value <= config.poor) return "needs-improvement";
  return "poor";
}

const ratingStyles = {
  good: "bg-ap-greenLight text-ap-greenDark",
  "needs-improvement": "bg-amber-100 text-amber-800",
  poor: "bg-ap-redLight text-ap-redDark",
};

function formatValue(value: number, config: MetricConfig): string {
  if (config.unit === "s") return (value / 1000).toFixed(1) + "s";
  if (config.unit === "ms") return Math.round(value) + "ms";
  return value.toFixed(2);
}

export function CoreWebVitalsTable({ coreWebVitals }: CoreWebVitalsTableProps) {
  const pages = [
    { label: "Homepage", data: coreWebVitals.homepage },
    { label: "PDP", data: coreWebVitals.pdp },
  ];

  return (
    <div data-component="CoreWebVitalsTable">
      <h4 className="font-bold tracking-tighter text-sm mb-3">
        Core Web Vitals
      </h4>
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ap-brown/15">
              <th className="text-left py-2 pr-3 font-bold tracking-tighter ap-description-text text-xs">
                Metric
              </th>
              {pages.map((page) => (
                <th
                  key={page.label}
                  className="text-center py-2 px-2 font-bold tracking-tighter ap-description-text text-xs"
                >
                  {page.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.key} className="border-b border-ap-brown/10 last:border-0">
                <td className="py-2 pr-3 font-bold tracking-tighter text-xs">
                  {metric.label}
                </td>
                {pages.map((page) => {
                  const value = page.data[metric.key];
                  const rating = getRating(value, metric);
                  return (
                    <td key={page.label} className="text-center py-2 px-2">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tracking-tighter ${ratingStyles[rating]}`}
                      >
                        {formatValue(value, metric)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
