import { render, screen } from "@testing-library/react";
import { ImpactTable } from "../../src/components/ImpactTable";
import type { Finding } from "../../src/types/audit";

const mockFindings: Finding[] = [
  {
    title: "Finding A",
    theme: "Checkout & Cart",
    issue_description: "Desc A",
    business_impact: 5,
    user_impact: 4,
    effort_to_fix: 2,
    plus_feature: "Checkout Extensibility",
    plus_feature_link: "https://example.com",
    evidence: [],
  },
  {
    title: "Finding B",
    theme: "Content & UX",
    issue_description: "Desc B",
    business_impact: 3,
    user_impact: 3,
    effort_to_fix: 1,
    plus_feature: "Launchpad",
    plus_feature_link: "https://example.com",
    evidence: [],
  },
];

describe("ImpactTable", () => {
  it("renders a row for each finding", () => {
    render(<ImpactTable findings={mockFindings} />);
    expect(screen.getByText("Finding A")).toBeInTheDocument();
    expect(screen.getByText("Finding B")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<ImpactTable findings={mockFindings} />);
    expect(screen.getByText("Finding")).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Effort")).toBeInTheDocument();
  });
});
