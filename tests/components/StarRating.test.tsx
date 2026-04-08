import { render, screen } from "@testing-library/react";
import { StarRating } from "../../src/components/StarRating";

describe("StarRating", () => {
  it("renders the correct number of filled stars", () => {
    render(<StarRating value={3} max={5} />);
    const filled = screen.getAllByTestId("star-filled");
    expect(filled).toHaveLength(3);
  });

  it("renders the correct number of empty stars", () => {
    render(<StarRating value={2} max={5} />);
    const empty = screen.getAllByTestId("star-empty");
    expect(empty).toHaveLength(3);
  });

  it("renders a label when provided", () => {
    render(<StarRating value={4} max={5} label="Impact" />);
    expect(screen.getByText("Impact")).toBeInTheDocument();
  });
});
