import { render, screen, fireEvent } from "@testing-library/react";
import { FindingCard } from "../../src/components/FindingCard";
import type { Finding } from "../../src/types/audit";

const mockFinding: Finding = {
  title: "Checkout lacks trust signals",
  theme: "Checkout & Cart",
  issue_description:
    "The checkout page has no trust badges, security indicators, or return policy info visible.",
  business_impact: 5,
  user_impact: 4,
  effort_to_fix: 2,
  plus_feature: "Checkout Extensibility",
  plus_feature_link: "https://shopify.dev/docs/api/checkout-ui-extensions",
  evidence: ["No trust badges found", "Generic checkout branding"],
};

describe("FindingCard", () => {
  it("renders the title in collapsed state", () => {
    render(<FindingCard finding={mockFinding} index={1} />);
    expect(screen.getByText("Checkout lacks trust signals")).toBeInTheDocument();
  });

  it("renders the theme tag", () => {
    render(<FindingCard finding={mockFinding} index={1} />);
    expect(screen.getByText("Checkout & Cart")).toBeInTheDocument();
  });

  it("shows full description when expanded", () => {
    render(<FindingCard finding={mockFinding} index={1} />);
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByText(/checkout page has no trust badges/)
    ).toBeInTheDocument();
  });

  it("shows Plus feature link when expanded", () => {
    render(<FindingCard finding={mockFinding} index={1} />);
    fireEvent.click(screen.getByRole("button"));
    const link = screen.getByText(/Checkout Extensibility/);
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://shopify.dev/docs/api/checkout-ui-extensions"
    );
  });
});
