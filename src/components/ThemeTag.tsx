import type { FindingTheme } from "../types/audit";

const themeColors: Record<FindingTheme, string> = {
  "Checkout & Cart": "bg-blue-100 text-blue-800",
  "Product Discovery": "bg-green-100 text-green-800",
  "Product Page (PDP)": "bg-yellow-100 text-yellow-800",
  "ICC & Personalization": "bg-purple-100 text-purple-800",
  "Email & Retention": "bg-red-100 text-red-800",
  "Conversion Optimization": "bg-orange-100 text-orange-800",
  "Content & UX": "bg-pink-100 text-pink-800",
  "Data & Analytics": "bg-gray-100 text-gray-800",
  "Technical Infrastructure": "bg-stone-100 text-stone-800",
  "AI & Automation": "bg-slate-100 text-slate-800",
  "Customer Service": "bg-cyan-100 text-cyan-800",
};

interface ThemeTagProps {
  theme: FindingTheme;
}

export function ThemeTag({ theme }: ThemeTagProps) {
  const colorClass = themeColors[theme] ?? "bg-gray-100 text-gray-800";
  return (
    <span key={theme} className={`inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-tight ${colorClass}`}>
      {theme}
    </span>
  );
}
