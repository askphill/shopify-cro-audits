import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BugsSection } from "../../src/components/BugsSection";
import type { Bug } from "../../src/types/audit";

function makeBug(overrides: Partial<Bug> = {}): Bug {
  return {
    title: "Missing canonical tag",
    category: "SEO Tag",
    severity: "high",
    location: "/collections/all",
    evidence: "No <link rel=\"canonical\"> in <head>",
    quick_fix: "Add canonical tag pointing to the bare collection URL",
    ...overrides,
  };
}

describe("BugsSection", () => {
  it("renders nothing when bugs is empty", () => {
    const { container } = render(<BugsSection bugs={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the section title and grouped severity headings", () => {
    render(
      <BugsSection
        bugs={[
          makeBug({ severity: "critical", title: "Broken ATC" }),
          makeBug({ severity: "high", title: "Missing canonical" }),
          makeBug({ severity: "low", title: "Alt missing" }),
        ]}
      />
    );

    expect(
      screen.getByRole("heading", { name: /^Technical Bugs$/i })
    ).toBeDefined();
    expect(screen.getByRole("heading", { name: "Critical" })).toBeDefined();
    expect(screen.getByRole("heading", { name: /^High/ })).toBeDefined();
    expect(screen.getByRole("heading", { name: /^Low/ })).toBeDefined();
    // Critical group is always expanded
    expect(screen.getByText("Broken ATC")).toBeDefined();
    // High and Low are collapsed by default
    expect(screen.queryByText("Missing canonical")).toBeNull();
    expect(screen.queryByText("Alt missing")).toBeNull();
  });

  it("expands the High group when its header is clicked", () => {
    render(
      <BugsSection
        bugs={[makeBug({ severity: "high", title: "Missing canonical" })]}
      />
    );

    expect(screen.queryByText("Missing canonical")).toBeNull();
    fireEvent.click(screen.getByRole("heading", { name: /^High/ }));
    expect(screen.getByText("Missing canonical")).toBeDefined();
  });

  it("expands the Low group when its header is clicked", () => {
    render(
      <BugsSection bugs={[makeBug({ severity: "low", title: "Alt missing" })]} />
    );

    expect(screen.queryByText("Alt missing")).toBeNull();
    fireEvent.click(screen.getByRole("heading", { name: /^Low/ }));
    expect(screen.getByText("Alt missing")).toBeDefined();
  });

  it("hides severity headings that have no bugs", () => {
    render(<BugsSection bugs={[makeBug({ severity: "high" })]} />);
    expect(screen.queryByRole("heading", { name: "Critical" })).toBeNull();
    expect(screen.queryByRole("heading", { name: /^Low/ })).toBeNull();
    expect(screen.getByRole("heading", { name: /^High/ })).toBeDefined();
  });

  it("caps low-severity bugs at 5 and shows overflow line when expanded", () => {
    const lowBugs: Bug[] = Array.from({ length: 8 }, (_, i) =>
      makeBug({ severity: "low", title: `Low bug ${i + 1}` })
    );
    render(<BugsSection bugs={lowBugs} />);

    fireEvent.click(screen.getByRole("heading", { name: /^Low/ }));
    expect(screen.getByText("Low bug 1")).toBeDefined();
    expect(screen.getByText("Low bug 5")).toBeDefined();
    expect(screen.queryByText("Low bug 6")).toBeNull();
    expect(screen.getByText(/\+ 3 more low-severity issues/i)).toBeDefined();
  });

  it("does not truncate critical bugs", () => {
    const bugs: Bug[] = Array.from({ length: 8 }, (_, i) =>
      makeBug({ severity: "critical", title: `Crit ${i + 1}` })
    );
    render(<BugsSection bugs={bugs} />);
    expect(screen.getByText("Crit 1")).toBeDefined();
    expect(screen.getByText("Crit 8")).toBeDefined();
  });

  it("renders the Fix line for each visible bug", () => {
    render(<BugsSection bugs={[makeBug({ severity: "critical" })]} />);
    expect(screen.getByText("Fix:")).toBeDefined();
    expect(
      screen.getByText(/Add canonical tag pointing to the bare collection URL/i)
    ).toBeDefined();
  });

  it("renders the shopify_solution line when present", () => {
    render(
      <BugsSection
        bugs={[
          makeBug({
            severity: "critical",
            shopify_solution:
              "Shopify-hosted assets serve over HTTPS by default; this class of bug doesn't occur on Shopify.",
          }),
        ]}
      />
    );
    expect(
      screen.getByText(
        /Shopify-hosted assets serve over HTTPS by default/i
      )
    ).toBeDefined();
  });

  it("omits the shopify_solution line when null/absent", () => {
    render(<BugsSection bugs={[makeBug({ severity: "critical" })]} />);
    expect(screen.queryByTestId("shopify-solution")).toBeNull();
  });
});
