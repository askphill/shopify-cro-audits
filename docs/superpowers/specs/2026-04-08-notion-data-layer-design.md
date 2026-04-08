# Design: Replace Supabase with Notion Data Layer

## Goal

Replace Supabase with the Notion "CRO Audit Reports" database as the sole data store for audit reports. Add a lightweight Express server to proxy Notion API calls (secret key cannot be exposed client-side).

## Architecture

- **Write path:** Claude Code CRO skill writes directly to Notion via MCP (creates page with properties + JSON body)
- **Read path:** React SPA → Express `GET /api/audit/:id` → Notion API → transformed `CroAudit` JSON
- **Serving:** Express serves the built SPA static files and the API from a single container on Railway

## Notion Database

Database ID: `3ce32b72e4f5440199bd005ecc3fa762`
Data source: `collection://0abd352f-02f1-48c7-95c3-3efb33e237e9`

### Property → CroAudit Mapping

| Notion Property | CroAudit Field | Type |
|---|---|---|
| Page ID | `id` | string (UUID) |
| Client Name | `client_name` | title |
| Website URL | `website_url` | url |
| Audit Date | `audit_date` | date |
| Executive Summary | `executive_summary` | text |
| CTA Link | `cta_link` | url |
| Performance | `lighthouse_scores.performance` | number 0-100 |
| Accessibility | `lighthouse_scores.accessibility` | number 0-100 |
| SEO | `lighthouse_scores.seo` | number 0-100 |
| Best Practices | `lighthouse_scores.best_practices` | number 0-100 |
| Theme Name | `tech_stack.theme` | text |
| Checkout Type | `tech_stack.checkout_type` | text |
| Finding Count | derived from `findings.length` | number |
| Status | publication gate (only "Published" served) | select |
| createdTime | `created_at` | auto |

### Page Body (JSON code block)

Nested/array data stored as a single JSON code block in the page content:

```json
{
  "findings": [
    {
      "title": "...",
      "theme": "Checkout & Cart",
      "issue_description": "...",
      "business_impact": 8,
      "user_impact": 7,
      "effort_to_fix": 3,
      "plus_feature": "...",
      "plus_feature_link": "...",
      "screenshot_url": "...",
      "evidence": ["..."]
    }
  ],
  "tech_stack": {
    "apps": ["..."],
    "payment_providers": ["..."],
    "analytics": ["..."]
  }
}
```

## Files Changed

### New files

- **`server/index.ts`** — Express server (runs with tsx)
  - Serves `/dist` static files
  - `GET /api/audit/:id` — fetches Notion page, transforms to `CroAudit`, returns JSON
  - SPA fallback: all non-API routes serve `index.html`
  - In-memory cache: Map with 5-minute TTL per audit ID
  - Returns 404 if page not found or Status is not "Published"
  - Reads env: `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `PORT` (default 3000)

- **`server/notion.ts`** — Notion client + transform logic (server-side, outside Vite build)
  - `fetchAuditFromNotion(id: string): Promise<CroAudit | null>`
  - Reads page properties + page content (code block)
  - Transforms Notion response into `CroAudit` shape
  - Handles missing pages, unpublished status

- **`src/lib/api.ts`** — Frontend data layer (replaces supabase.ts)
  - `fetchAudit(id: string): Promise<CroAudit | null>`
  - Simple `fetch("/api/audit/${id}")` call

### Modified files

- **`src/pages/AuditPage.tsx`** — Change import from `supabase` to `api`
- **`Dockerfile`** — Single-stage Node build: build SPA, then run Express (no nginx)
- **`package.json`** — Add `express`, `@notionhq/client`, `tsx`; remove `@supabase/supabase-js`; add `start` script
- **`.env.example`** — Replace Supabase vars with `NOTION_API_KEY` and `NOTION_DATABASE_ID`
- **`tests/pages/AuditPage.test.tsx`** (if exists) — Mock `fetch` instead of Supabase

### Removed files

- **`src/lib/supabase.ts`** — No longer needed

### Unchanged

- `src/types/audit.ts` — CroAudit interface stays identical
- All component files and their tests — they receive props, don't touch the data layer

## Caching

In-memory Map in `server/index.ts` with 5-minute TTL. Key is the audit page ID. On cache hit, return cached `CroAudit` directly. On miss or expired, fetch from Notion and cache.

No external cache dependency needed — audit reports are read-heavy and rarely updated.

## Error Handling

- Notion page not found → Express returns 404 → frontend shows NotFound component (existing)
- Notion page exists but Status is not "Published" → 404
- Notion API error (rate limit, auth) → Express returns 502 with generic error
- Malformed page body JSON → Express returns 502, logs error

## Testing

- **`tests/server/notion.test.ts`** — Unit test the Notion → CroAudit transform function with mocked Notion API responses
- **`tests/server/api.test.ts`** — Test Express endpoint returns 404 for missing/unpublished audits
- **Existing component tests** — Unchanged; they test rendering with props

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `NOTION_API_KEY` | Server-side only | Notion integration secret |
| `NOTION_DATABASE_ID` | Server-side only | CRO Audit Reports DB ID |
| `PORT` | Server-side only | Express port (default 3000) |

No more `VITE_` prefixed vars — the secret stays server-side.
