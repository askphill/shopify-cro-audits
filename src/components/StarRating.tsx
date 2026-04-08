interface StarRatingProps {
  value: number;
  max?: number;
  label?: string;
}

export function StarRating({ value, max = 5, label }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      {label && (
        <span className="text-xs font-medium text-ap-greyDark tracking-tight">
          {label}
        </span>
      )}
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) =>
          i < value ? (
            <span key={i} data-testid="star-filled" className="text-ap-red">
              &#9733;
            </span>
          ) : (
            <span
              key={i}
              data-testid="star-empty"
              className="text-gray-300"
            >
              &#9733;
            </span>
          )
        )}
      </div>
    </div>
  );
}
