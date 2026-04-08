# Notion Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Supabase with the Notion "CRO Audit Reports" database as the sole data store, adding an Express server to proxy Notion API calls.

**Architecture:** Express server (`server/`) serves the built React SPA and a single `GET /api/audit/:id` endpoint that fetches from the Notion API, transforms the response into the existing `CroAudit` shape, and returns JSON. The frontend `fetchAudit()` becomes a plain `fetch()` call. A 5-minute in-memory cache prevents repeated Notion API hits.

**Tech Stack:** Express, @notionhq/client, tsx (runtime), Vitest (tests)

**Spec:** `docs/superpowers/specs/2026-04-08-notion-data-layer-design.md`

---

## File Structure

```
server/
  index.ts          — Express server: static files, API route, SPA fallback, cache
  notion.ts         — Notion client, fetchAuditFromNotion(), transform logic
tsconfig.server.json — TypeScript config for server/ directory
src/
  lib/
    api.ts          — Frontend fetchAudit() (replaces supabase.ts)
  pages/
    AuditPage.tsx   — Change import from supabase to api
tests/
  server/
    notion.test.ts  — Unit tests for Notion → CroAudit transform
Dockerfile          — Single-stage Node build + Express runtime (replaces nginx)
package.json        — Dependency changes
.env.example        — New env vars
```

---

### Task 1: Install dependencies and update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install new dependencies**

Run:
```bash
cd /Users/benrosenberg/shopify-cro-audit
npm install express @notionhq/client
npm install -D @types/express tsx
```

- [ ] **Step 2: Remove Supabase dependency**

Run:
```bash
npm uninstall @supabase/supabase-js
```

- [ ] **Step 3: Add start script to package.json**

Add `"start"` to the `scripts` section in `package.json`:

```json
"scripts": {
  "dev": "vite",
  "dev:server": "tsx watch server/index.ts",
  "build": "tsc -b && vite build",
  "start": "tsx server/index.ts",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: swap supabase for express + notion dependencies"
```

---

### Task 2: Add server TypeScript config

**Files:**
- Create: `tsconfig.server.json`
- Modify: `tsconfig.json`

- [ ] **Step 1: Create tsconfig.server.json**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.server.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["server"]
}
```

- [ ] **Step 2: Add reference to root tsconfig.json**

Update `tsconfig.json` to include the server config:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.server.json" }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add tsconfig.server.json tsconfig.json
git commit -m "chore: add server TypeScript config"
```

---

### Task 3: Notion transform logic (TDD)

**Files:**
- Create: `server/notion.ts`
- Create: `tests/server/notion.test.ts`

This is the core logic: fetching a Notion page and transforming it into a `CroAudit` object.

- [ ] **Step 1: Write the failing tests**

Create `tests/server/notion.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CroAudit } from "../../src/types/audit";

// Mock @notionhq/client before importing the module under test
vi.mock("@notionhq/client", () => ({
  Client: vi.fn().mockImplementation(() => ({
    pages: {
      retrieve: vi.fn(),
    },
    blocks: {
      children: {
        list: vi.fn(),
      },
    },
  })),
}));

// Must import after mock setup
const { Client } = await import("@notionhq/client");
const { fetchAuditFromNotion } = await import("../../server/notion");

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

describe("fetchAuditFromNotion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup mock return values after clearing
    const client = getNotionClient();
    if (client) {
      client.pages.retrieve.mockReset();
      client.blocks.children.list.mockReset();
    }
  });

  it("transforms a published Notion page into a CroAudit", async () => {
    const client = getNotionClient();
    client.pages.retrieve.mockResolvedValue(mockPageProperties);
    client.blocks.children.list.mockResolvedValue(mockBlocksResponse);

    const result = await fetchAuditFromNotion(MOCK_PAGE_ID);

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

    const result = await fetchAuditFromNotion(MOCK_PAGE_ID);
    expect(result).toBeNull();
  });

  it("returns null when Notion page is not found", async () => {
    const client = getNotionClient();
    client.pages.retrieve.mockRejectedValue({ status: 404 });

    const result = await fetchAuditFromNotion(MOCK_PAGE_ID);
    expect(result).toBeNull();
  });

  it("returns null when page body JSON is missing", async () => {
    const client = getNotionClient();
    client.pages.retrieve.mockResolvedValue(mockPageProperties);
    client.blocks.children.list.mockResolvedValue({ results: [] });

    const result = await fetchAuditFromNotion(MOCK_PAGE_ID);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/server/notion.test.ts`
Expected: FAIL — `server/notion` module does not exist

- [ ] **Step 3: Implement server/notion.ts**

Create `server/notion.ts`:

```typescript
import { Client } from "@notionhq/client";
import type { CroAudit } from "../src/types/audit";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

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
  let bodyData: { findings: CroAudit["findings"]; tech_stack: { apps: string[]; payment_providers: string[]; analytics: string[] } };
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

  return {
    id: page.id,
    client_name: getPlainText(props["Client Name"] as { title: Array<{ plain_text: string }> }),
    website_url: (props["Website URL"] as { url: string }).url ?? "",
    audit_date: (props["Audit Date"] as { date: { start: string } }).date?.start ?? "",
    executive_summary: getPlainText(props["Executive Summary"] as { rich_text: Array<{ plain_text: string }> }),
    cta_link: (props["CTA Link"] as { url?: string }).url,
    lighthouse_scores: {
      performance: (props["Performance"] as { number: number }).number ?? 0,
      accessibility: (props["Accessibility"] as { number: number }).number ?? 0,
      seo: (props["SEO"] as { number: number }).number ?? 0,
      best_practices: (props["Best Practices"] as { number: number }).number ?? 0,
    },
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/server/notion.test.ts`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add server/notion.ts tests/server/notion.test.ts
git commit -m "feat: add Notion fetch and CroAudit transform with tests"
```

---

### Task 4: Express server

**Files:**
- Create: `server/index.ts`

- [ ] **Step 1: Create server/index.ts**

```typescript
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { fetchAuditFromNotion } from "./notion.js";
import type { CroAudit } from "../src/types/audit.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3000", 10);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "dist");

// In-memory cache with 5-minute TTL
const cache = new Map<string, { data: CroAudit; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(id: string): CroAudit | null {
  const entry = cache.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(id);
    return null;
  }
  return entry.data;
}

// API route
app.get("/api/audit/:id", async (req, res) => {
  const { id } = req.params;

  const cached = getCached(id);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const audit = await fetchAuditFromNotion(id);
    if (!audit) {
      res.status(404).json({ error: "Audit not found" });
      return;
    }
    cache.set(id, { data: audit, expires: Date.now() + CACHE_TTL_MS });
    res.json(audit);
  } catch (err) {
    console.error("Notion API error:", err);
    res.status(502).json({ error: "Failed to fetch audit" });
  }
});

// Serve static SPA files
app.use(express.static(distPath));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit -p tsconfig.server.json`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add server/index.ts
git commit -m "feat: add Express server with audit API and SPA serving"
```

---

### Task 5: Frontend data layer swap

**Files:**
- Create: `src/lib/api.ts`
- Modify: `src/pages/AuditPage.tsx`
- Delete: `src/lib/supabase.ts`

- [ ] **Step 1: Create src/lib/api.ts**

```typescript
import type { CroAudit } from "../types/audit";

export async function fetchAudit(id: string): Promise<CroAudit | null> {
  const res = await fetch(`/api/audit/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return res.json() as Promise<CroAudit>;
}
```

- [ ] **Step 2: Update AuditPage.tsx import**

In `src/pages/AuditPage.tsx`, change line 4 from:

```typescript
import { fetchAudit } from "../lib/supabase";
```

to:

```typescript
import { fetchAudit } from "../lib/api";
```

No other changes needed — the function signature is identical.

- [ ] **Step 3: Delete src/lib/supabase.ts**

Run: `rm src/lib/supabase.ts`

- [ ] **Step 4: Verify the frontend builds**

Run: `npm run build`
Expected: Successful build with no errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/api.ts src/pages/AuditPage.tsx
git rm src/lib/supabase.ts
git commit -m "feat: replace Supabase with fetch-based API client"
```

---

### Task 6: Update environment config

**Files:**
- Modify: `.env.example`
- Modify: `.env` (local)

- [ ] **Step 1: Update .env.example**

Replace contents of `.env.example` with:

```
NOTION_API_KEY=your_notion_integration_secret
NOTION_DATABASE_ID=3ce32b72e4f5440199bd005ecc3fa762
PORT=3000
```

- [ ] **Step 2: Update local .env**

Replace contents of `.env` with actual values:

```
NOTION_API_KEY=<your actual Notion integration secret>
NOTION_DATABASE_ID=3ce32b72e4f5440199bd005ecc3fa762
PORT=3000
```

Note: You need to create a Notion integration at https://www.notion.so/my-integrations and share the CRO Audit Reports database with it to get the API key.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: update env example for Notion config"
```

---

### Task 7: Update Dockerfile

**Files:**
- Modify: `Dockerfile`

- [ ] **Step 1: Replace Dockerfile contents**

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

This replaces the two-stage nginx build with a single Node stage that builds the SPA and runs the Express server.

- [ ] **Step 2: Commit**

```bash
git add Dockerfile
git commit -m "chore: replace nginx Dockerfile with Express server"
```

---

### Task 8: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md to reflect new architecture**

Update the following sections:

**Project Overview** — change to:
```
Branded web app for sharing CRO (Conversion Rate Optimization) audit reports with Shopify merchants. A React SPA served by Express fetches audit data from a Notion database via a server-side API and renders an Ask Phill branded report page. A companion Claude Code skill (in the phillbert repo) generates audits by scraping stores and writing directly to Notion.
```

**Tech Stack** — change to:
```
- React 18, TypeScript, Vite 5, Tailwind CSS
- Notion (CRO Audit Reports database, ID: 3ce32b72e4f5440199bd005ecc3fa762)
- Express + @notionhq/client (server-side API)
- Railway for hosting
- Vitest + React Testing Library for tests
```

**Commands** — add:
```bash
npm start            # Production server (Express)
npm run dev:server   # Dev server with watch mode
```

**Architecture** — update:
```
- `server/index.ts` — Express server: serves SPA static files, `GET /api/audit/:id`, SPA fallback, in-memory cache (5min TTL)
- `server/notion.ts` — Notion client and `fetchAuditFromNotion()` transform logic
- `src/lib/api.ts` — Frontend `fetchAudit()` via fetch to `/api/audit/:id`
- `src/pages/AuditPage.tsx` — Main page, fetches audit by UUID from URL params via `react-router-dom`
- `src/types/audit.ts` — TypeScript interfaces (`CroAudit`, `Finding`, `LighthouseScores`, `FindingTheme`, etc.)
```

**Environment** — change to:
```
Copy `.env.example` to `.env` and set `NOTION_API_KEY` and `NOTION_DATABASE_ID`. The Notion database is "CRO Audit Reports" (ID: `3ce32b72e4f5440199bd005ecc3fa762`).
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Notion data layer"
```

---

### Task 9: Smoke test end-to-end

- [ ] **Step 1: Run all existing tests**

Run: `npx vitest run`
Expected: All component tests pass, server tests pass

- [ ] **Step 2: Build and start the server locally**

Run:
```bash
npm run build
npm start
```

Expected: `Server running on port 3000`

- [ ] **Step 3: Test the API endpoint**

In a separate terminal, run:
```bash
curl -s http://localhost:3000/api/audit/nonexistent-id | head -c 200
```

Expected: `{"error":"Audit not found"}` with HTTP 404

- [ ] **Step 4: Test SPA fallback**

Run:
```bash
curl -s http://localhost:3000/audit/some-id | head -c 100
```

Expected: HTML response (the SPA index.html)

- [ ] **Step 5: Stop the server and commit any fixes if needed**

If everything works, no commit needed. If fixes were required, commit them with a descriptive message.
