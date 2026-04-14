import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CroAudit } from "../../src/types/audit";

// Mock @notionhq/client before importing the module under test
vi.mock("@notionhq/client", () => ({
  Client: vi.fn().mockImplementation(function () {
    return {
      pages: {
        retrieve: vi.fn(),
      },
      blocks: {
        children: {
          list: vi.fn(),
        },
      },
      databases: {
        query: vi.fn(),
      },
    };
  }),
}));

// Must import after mock setup
const { Client } = await import("@notionhq/client");
const { fetchAudit } = await import("../../server/notion");

function getNotionClient() {
  return (Client as unknown as ReturnType<typeof vi.fn>).mock.results[0]?.value;
}

const MOCK_PAGE_ID = "abc12345-def6-7890-abcd-ef1234567890";

const mockPageProperties = {
  id: MOCK_PAGE_ID,
  created_time: "2026-04-08T09:00:00.000Z",
  properties: {
    "Client Name": { type: "title", title: [{ plain_text: "Braadbaas" }] },
    "Website URL": { type: "url", url: "https://braadbaas.nl" },
    "Audit Date": { type: "date", date: { start: "2026-04-08" } },
    "Executive Summary": {
      type: "rich_text",
      rich_text: [{ plain_text: "This store has potential." }],
    },
    "CTA Link": { type: "url", url: "https://askphill.com/contact" },
    Performance: { type: "number", number: 72 },
    Accessibility: { type: "number", number: 88 },
    SEO: { type: "number", number: 91 },
    "Best Practices": { type: "number", number: 85 },
    "Theme Name": {
      type: "rich_text",
      rich_text: [{ plain_text: "Dawn" }],
    },
    "Checkout Type": {
      type: "rich_text",
      rich_text: [{ plain_text: "Shopify Plus" }],
    },
    Status: { type: "select", select: { name: "Published" } },
    "Finding Count": { type: "number", number: 2 },
  },
};

const mockBodyJson = {
  findings: [
    {
      title: "Missing cart upsell",
      theme: "Checkout & Cart" as const,
      issue_description: "No upsell in cart",
      business_impact: 8,
      user_impact: 7,
      effort_to_fix: 3,
      plus_feature: "Cart Transform API",
      plus_feature_link: "https://shopify.dev/cart-transform",
      evidence: ["No upsell widget found"],
    },
  ],
  tech_stack: {
    apps: ["Klaviyo", "Rebuy"],
    payment_providers: ["Shopify Payments"],
    analytics: ["GA4"],
  },
};

const mockBlocksResponse = {
  results: [
    {
      type: "code",
      code: {
        language: "json",
        rich_text: [{ plain_text: JSON.stringify(mockBodyJson) }],
      },
    },
  ],
};

describe("fetchAudit", () => {
  beforeEach(() => {
    // Reset individual method mocks without clearing the constructor mock.results
    const client = getNotionClient();
    if (client) {
      client.pages.retrieve.mockReset();
      client.blocks.children.list.mockReset();
      client.databases.query.mockReset();
    }
  });

  it("transforms a published Notion page into a CroAudit", async () => {
    const client = getNotionClient();
    client.pages.retrieve.mockResolvedValue(mockPageProperties);
    client.blocks.children.list.mockResolvedValue(mockBlocksResponse);

    const result = await fetchAudit(MOCK_PAGE_ID);

    expect(result).not.toBeNull();
    const audit = result as CroAudit;
    expect(audit.id).toBe(MOCK_PAGE_ID);
    expect(audit.client_name).toBe("Braadbaas");
    expect(audit.website_url).toBe("https://braadbaas.nl");
    expect(audit.audit_date).toBe("2026-04-08");
    expect(audit.executive_summary).toBe("This store has potential.");
    expect(audit.cta_link).toBe("https://askphill.com/contact");
    expect(audit.created_at).toBe("2026-04-08T09:00:00.000Z");
    expect(audit.lighthouse_scores).toEqual({
      performance: 72,
      accessibility: 88,
      seo: 91,
      best_practices: 85,
    });
    expect(audit.tech_stack).toEqual({
      theme: "Dawn",
      checkout_type: "Shopify Plus",
      apps: ["Klaviyo", "Rebuy"],
      payment_providers: ["Shopify Payments"],
      analytics: ["GA4"],
    });
    expect(audit.findings).toHaveLength(1);
    expect(audit.findings[0].title).toBe("Missing cart upsell");
  });

  it("returns null for unpublished audits", async () => {
    const client = getNotionClient();
    const unpublished = {
      ...mockPageProperties,
      properties: {
        ...mockPageProperties.properties,
        Status: { type: "select", select: { name: "Draft" } },
      },
    };
    client.pages.retrieve.mockResolvedValue(unpublished);

    const result = await fetchAudit(MOCK_PAGE_ID);
    expect(result).toBeNull();
  });

  it("returns null when Notion page is not found", async () => {
    const client = getNotionClient();
    client.pages.retrieve.mockRejectedValue({ status: 404 });

    const result = await fetchAudit(MOCK_PAGE_ID);
    expect(result).toBeNull();
  });

  it("returns null when page body JSON is missing", async () => {
    const client = getNotionClient();
    client.pages.retrieve.mockResolvedValue(mockPageProperties);
    client.blocks.children.list.mockResolvedValue({ results: [] });

    const result = await fetchAudit(MOCK_PAGE_ID);
    expect(result).toBeNull();
  });

  it("resolves a slug to a page via database query", async () => {
    const client = getNotionClient();
    client.databases.query.mockResolvedValue({ results: [mockPageProperties] });
    client.blocks.children.list.mockResolvedValue(mockBlocksResponse);

    const result = await fetchAudit("braadbaas");

    expect(client.databases.query).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { property: "Slug", rich_text: { equals: "braadbaas" } },
      })
    );
    expect(result).not.toBeNull();
    expect((result as CroAudit).client_name).toBe("Braadbaas");
  });

  it("returns null when slug matches no pages", async () => {
    const client = getNotionClient();
    client.databases.query.mockResolvedValue({ results: [] });

    const result = await fetchAudit("nonexistent-store");
    expect(result).toBeNull();
  });
});
