import type { FindingTheme } from "../types/audit";
import { ThemeTag } from "./ThemeTag";
import { ExpandToggleButton } from "./ExpandToggleButton";

interface FindingCardToggleProps {
  title: string;
  index: number;
  theme: FindingTheme;
  expanded: boolean;
  onToggle: () => void;
}

export function FindingCardToggle({
  title,
  index,
  theme,
  expanded,
  onToggle,
}: FindingCardToggleProps) {
  const handleToggleBtn = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  return (
    <div
      data-component="FindingCardToggle"
      className={`relative z-[1] flex items-center px-4 py-3 w-full rounded-lg cursor-pointer transition-colors ${
        expanded ? "bg-ap-brownLight" : "bg-ap-greyLight hover:bg-ap-brownLight"
      }`}
      onClick={onToggle}
    >
      <div className="flex-1 flex items-center justify-between">
        <h3 className="w-auto shrink text-lg font-bold tracking-tighter">
          {title}
        </h3>

        <div className="flex items-center">
          <span className="font-bold tracking-tighter mr-3 hidden sm:inline">
            <ThemeTag theme={theme} />
          </span>
          <ExpandToggleButton
            isExpanded={expanded}
            onToggle={handleToggleBtn}
          />
        </div>
      </div>
    </div>
  );
}
