import { Client } from "@notionhq/client";
import type { CroAudit } from "../src/types/audit";

function getPlainText(prop: { rich_text?: Array<{ plain_text: string }>; title?: Array<{ plain_text: string }> }): string {
  const items = prop.rich_text ?? prop.title ?? [];
  return items.map((t) => t.plain_text).join("");
}

interface NotionPage {
  id: string;
  created_time: string;
  properties: Record<string, unknown>;
}

interface NotionCodeBlock {
  type: "code";
  code: {
    language: string;
    rich_text: Array<{ plain_text: string }>;
  };
}

interface NotionBlock {
  type: string;
  code?: NotionCodeBlock["code"];
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function fetchAuditFromNotion(
  pageId: string
): Promise<CroAudit | null> {

  let page: NotionPage;
  try {
    page = (await notion.pages.retrieve({ page_id: pageId })) as unknown as NotionPage;
  } catch {
    return null;
  }

  const props = page.properties as Record<string, Record<string, unknown>>;

  // Gate on Published status
  const status = props["Status"] as { select?: { name: string } };
  if (status?.select?.name !== "Published") {
    return null;
  }

  // Fetch page body blocks to find JSON code block
  let bodyData: {
    findings: CroAudit["findings"];
    tech_stack: { apps: string[]; payment_providers: string[]; analytics: string[] };
    core_web_vitals?: CroAudit["core_web_vitals"];
  };
  try {
    const blocks = await notion.blocks.children.list({ block_id: pageId });
    const codeBlock = (blocks.results as NotionBlock[]).find(
      (b) => b.type === "code"
    );
    if (!codeBlock?.code) return null;
    const json = codeBlock.code.rich_text.map((t) => t.plain_text).join("");
    bodyData = JSON.parse(json);
  } catch {
    return null;
  }

  const logoUrl = (props["Logo URL"] as { url?: string })?.url;

  return {
    id: page.id,
    client_name: getPlainText(props["Client Name"] as { title: Array<{ plain_text: string }> }),
    website_url: (props["Website URL"] as { url: string }).url ?? "",
    audit_date: (props["Audit Date"] as { date: { start: string } }).date?.start ?? "",
    executive_summary: getPlainText(props["Executive Summary"] as { rich_text: Array<{ plain_text: string }> }),
    logo_url: logoUrl || undefined,
    cta_link: (props["CTA Link"] as { url?: string }).url,
    lighthouse_scores: {
      performance: (props["Performance"] as { number: number }).number ?? 0,
      accessibility: (props["Accessibility"] as { number: number }).number ?? 0,
      seo: (props["SEO"] as { number: number }).number ?? 0,
      best_practices: (props["Best Practices"] as { number: number }).number ?? 0,
    },
    core_web_vitals: bodyData.core_web_vitals,
    tech_stack: {
      theme: getPlainText(props["Theme Name"] as { rich_text: Array<{ plain_text: string }> }),
      checkout_type: getPlainText(props["Checkout Type"] as { rich_text: Array<{ plain_text: string }> }),
      apps: bodyData.tech_stack.apps,
      payment_providers: bodyData.tech_stack.payment_providers,
      analytics: bodyData.tech_stack.analytics,
    },
    findings: bodyData.findings,
    created_at: page.created_time,
  };
}
