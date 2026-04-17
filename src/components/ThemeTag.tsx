import type { FindingTheme } from "../types/audit";

const themeColors: Record<FindingTheme, string> = {
  "Checkout & Cart": "bg-ap-blueLight text-ap-blueDark",
  "Product Discovery": "bg-ap-greenLight text-ap-greenDark",
  "Product Page (PDP)": "bg-ap-brown/40 text-ap-brownDark",
  "ICC & Personalization": "bg-ap-redLight text-ap-redDark",
  "Email & Retention": "bg-ap-redLight/70 text-ap-redDark",
  "Conversion Optimization": "bg-ap-greenLight/70 text-ap-greenDark",
  "Content & UX": "bg-ap-blueLight/70 text-ap-blueDark",
  "Data & Analytics": "bg-ap-brown/30 text-ap-brownDark",
  "Technical Infrastructure": "bg-ap-greyDark/15 text-ap-greyDark",
  "AI & Automation": "bg-ap-blueDark/20 text-ap-blueDark",
  "Customer Service": "bg-ap-greenLight text-ap-greenDark",
};

interface ThemeTagProps {
  theme: FindingTheme;
}

export function ThemeTag({ theme }: ThemeTagProps) {
  const colorClass = themeColors[theme] ?? "bg-ap-brown/20 text-ap-brownDark";
  return (
    <span data-component="ThemeTag" key={theme} className={`inline-flex items-center whitespace-nowrap rounded-full border-none px-2.5 py-0.5 text-xs font-bold tracking-tighter ${colorClass}`}>
      {theme}
    </span>
  );
}
