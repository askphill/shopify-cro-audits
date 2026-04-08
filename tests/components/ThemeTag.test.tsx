import { render, screen } from "@testing-library/react";
import { ThemeTag } from "../../src/components/ThemeTag";

describe("ThemeTag", () => {
  it("renders the theme text", () => {
    render(<ThemeTag theme="Checkout & Cart" />);
    expect(screen.getByText("Checkout & Cart")).toBeInTheDocument();
  });

  it("applies different colors for different themes", () => {
    const { rerender } = render(<ThemeTag theme="Checkout & Cart" />);
    const tag1 = screen.getByText("Checkout & Cart");

    rerender(<ThemeTag theme="Content & UX" />);
    const tag2 = screen.getByText("Content & UX");

    expect(tag1.className).not.toBe(tag2.className);
  });
});
