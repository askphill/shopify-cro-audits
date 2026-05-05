import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FindingCard } from "../../src/components/FindingCard";
import type { Finding } from "../../src/types/audit";

function makeFinding(overrides: Partial<Finding> = {}): Finding {
  return {
    title: "Hero CTA below the fold",
    theme: "Conversion Optimization",
    issue_description: "Primary CTA renders below 600px on mobile.",
    business_impact: 4,
    user_impact: 3,
    effort_to_fix: 2,
    plus_feature: null,
    plus_feature_link: null,
    evidence: ["Mobile screenshot at 390x844 shows CTA at 720px from top"],
    ...overrides,
  };
}

describe("FindingCard shopify_solution", () => {
  it("renders the shopify_solution line when present and expanded", () => {
    render(
      <FindingCard
        finding={makeFinding({
          shopify_solution:
            "Shopify's CDN serves responsive WebP variants automatically for theme images.",
        })}
        index={0}
        expanded
      />
    );
    expect(
      screen.getByText(/Shopify's CDN serves responsive WebP variants/i)
    ).toBeDefined();
  });

  it("omits the shopify_solution line when absent", () => {
    render(
      <FindingCard finding={makeFinding()} index={0} expanded />
    );
    expect(screen.queryByTestId("shopify-solution")).toBeNull();
  });

  it("does not render shopify_solution when collapsed", () => {
    render(
      <FindingCard
        finding={makeFinding({
          shopify_solution: "Shopify's native checkout handles this.",
        })}
        index={0}
        expanded={false}
      />
    );
    expect(screen.queryByTestId("shopify-solution")).toBeNull();
  });
});
