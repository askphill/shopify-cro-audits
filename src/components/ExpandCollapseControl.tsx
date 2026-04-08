import { ChevronsUpDown, ChevronsDownUp } from "lucide-react";

interface ExpandCollapseControlProps {
  anyExpanded: boolean;
  onToggle: () => void;
}

export function ExpandCollapseControl({
  anyExpanded,
  onToggle,
}: ExpandCollapseControlProps) {
  return (
    <button
      data-component="ExpandCollapseControl"
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1 text-xs px-2 py-0.5 font-bold tracking-tighter text-black/75"
    >
      {anyExpanded ? (
        <>
          <ChevronsDownUp strokeWidth={2.5} className="h-4 w-4" />
          Collapse All
        </>
      ) : (
        <>
          <ChevronsUpDown strokeWidth={2.5} className="h-4 w-4" />
          Expand All
        </>
      )}
    </button>
  );
}
