import { render, screen } from "@testing-library/react";
import { LighthouseGauge } from "../../src/components/LighthouseGauge";

describe("LighthouseGauge", () => {
  it("renders the score as text", () => {
    render(<LighthouseGauge score={85} label="Performance" />);
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("renders the label", () => {
    render(<LighthouseGauge score={92} label="SEO" />);
    expect(screen.getByText("SEO")).toBeInTheDocument();
  });

  it("applies green color for scores >= 90", () => {
    render(<LighthouseGauge score={95} label="Test" />);
    const gauge = screen.getByTestId("gauge-circle");
    expect(gauge.getAttribute("stroke")).toBe("#0DC147");
  });

  it("applies orange color for scores 50-89", () => {
    render(<LighthouseGauge score={72} label="Test" />);
    const gauge = screen.getByTestId("gauge-circle");
    expect(gauge.getAttribute("stroke")).toBe("#FF8C00");
  });

  it("applies red color for scores < 50", () => {
    render(<LighthouseGauge score={30} label="Test" />);
    const gauge = screen.getByTestId("gauge-circle");
    expect(gauge.getAttribute("stroke")).toBe("#DE0015");
  });
});
