import type { FindingTheme } from "../types/audit";

const themeColors: Record<FindingTheme, string> = {
  "Checkout & Cart": "bg-ap-blueLight/50 text-ap-blueDark",
  "Product Discovery": "bg-ap-greenLight/50 text-ap-greenDark",
  "Product Page (PDP)": "bg-ap-brownLight text-ap-brownDark",
  "ICC & Personalization": "bg-ap-redLight/50 text-ap-redDark",
  "Email & Retention": "bg-ap-redLight/30 text-ap-red",
  "Conversion Optimization": "bg-ap-greenLight/30 text-ap-green",
  "Content & UX": "bg-ap-blueLight/30 text-ap-blue",
  "Data & Analytics": "bg-ap-brown/20 text-ap-brownDark",
  "Technical Infrastructure": "bg-ap-greyLight text-ap-greyDark",
  "AI & Automation": "bg-ap-blueDark/10 text-ap-blueDark",
  "Customer Service": "bg-ap-greenLight text-ap-greenDark",
};

interface ThemeTagProps {
  theme: FindingTheme;
}

export function ThemeTag({ theme }: ThemeTagProps) {
  const colorClass = themeColors[theme] ?? "bg-ap-brown/20 text-ap-brownDark";
  return (
    <span key={theme} className={`inline-flex items-center rounded-full border-none px-2.5 py-0.5 text-xs font-bold tracking-tighter ${colorClass}`}>
      {theme}
    </span>
  );
}
