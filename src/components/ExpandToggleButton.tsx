import { ChevronRight } from "lucide-react";

interface ExpandToggleButtonProps {
  isExpanded: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
}

export function ExpandToggleButton({
  isExpanded,
  onToggle,
  className = "",
}: ExpandToggleButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(e);
  };

  return (
    <button
      data-component="ExpandToggleButton"
      onClick={handleClick}
      type="button"
      className={`w-7 h-7 inline-flex items-center justify-center transition-all rounded-full flex-shrink-0 text-black hover:opacity-50 ${
        isExpanded ? "bg-ap-greyLight" : "bg-white"
      } ${className}`}
      aria-label={isExpanded ? "Hide details" : "Show details"}
    >
      <ChevronRight
        strokeWidth={3}
        className={`relative w-4 h-4 transition-transform ${
          isExpanded ? "rotate-90" : "rotate-0"
        }`}
      />
    </button>
  );
}
