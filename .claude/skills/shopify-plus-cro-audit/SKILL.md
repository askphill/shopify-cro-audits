---
name: shopify-plus-cro-audit
description: External CRO audit for Shopify merchants. Scrapes the live site, runs Lighthouse, detects tech stack, and produces 10 findings (first 3 are quick wins). Shopify Plus features are called out where genuinely relevant but the audit is not Plus-gated. Outputs to the Notion CRO Audit Reports database (which powers the branded web app). Trigger when the user says "CRO audit", "Plus CRO audit", "Shopify Plus audit", "partnership CRO audit", "audit [URL]", or mentions auditing a Shopify store.
---

# Shopify Plus CRO Audit

External CRO audit skill for the Shopify Plus sales partnership. Audits non-Plus Shopify stores purely by scraping the live site and ties each finding to a Plus-exclusive feature.

## Context

Ask Phill partners with Shopify's EMEA sales team to accelerate Plus adoption. Shopify sends pre-qualified merchants (1M+ EUR revenue). Ask Phill delivers a complimentary CRO audit that demonstrates value and shows what Plus features would unlock.

**Key constraints:**
- No access to admin, GA4, Clarity, or any internal merchant data
- All data collection is external (browsing, Lighthouse, DOM inspection)
- Produce **10 findings**, ordered so the **first 3 are "quick wins"**
- Plus features are called out where they genuinely solve a problem, but not every finding needs a Plus tie-in
- Output is a near-complete draft for Ben to review before sharing

### Quick wins (first 3 findings)

The first three findings must be **quick wins**: issues the merchant could ship within hours-to-days using their existing stack. Characteristics:
- Effort to fix ≤ 2/5
- Business impact ≥ 3/5
- No Plus upgrade required, no theme rewrite, no new app subscription
- Examples: copy tweaks, adding a trust badge, enabling native lazy-loading, fixing a broken redirect, adding a missing meta tag, reordering above-the-fold content, enabling the cart drawer that's already in the theme

The remaining 7 findings are larger opportunities — anything from a theme section rebuild to a Plus migration. Order the 7 roughly by (business_impact × user_impact) ÷ effort_to_fix.

## Allowed Tools

- Chrome DevTools MCP tools (`lighthouse_audit`, `take_screenshot`, `evaluate_script`, `navigate_page`, `take_snapshot`, `list_pages`, `new_page`)
- Playwright MCP tools (`browser_navigate`, `browser_snapshot`, `browser_take_screenshot`, `browser_click`, `browser_evaluate`)
- `WebFetch` (page source for tech stack detection)
- Notion MCP tools (push to CRO Audit Reports database and Shopify CRO Audits project tracker)

## Workflow

### Step 0: Collect Input

Ask the user for:
1. **Store URL** (required)
2. **Client name** (optional; infer from the site if not provided)

### Phase 1: Discovery and Data Collection

#### 1a: Site Browsing

Use Playwright or Chrome DevTools MCP to browse the site as a real shopper. Navigate to each page, take snapshots and screenshots.

Audit these key pages:
1. **Homepage**: value prop, navigation, trust signals, CTA visibility, announcement bar
2. **Top 2-3 collection pages**: product grid, filtering, product card info
3. **Product page (top 2-3 products)**: images, descriptions, price, ATC prominence, reviews, cross-sells
4. **Cart page/drawer**: upsells, shipping info, trust badges, checkout CTA
5. **Search experience**: visibility, autocomplete, results quality
6. **Mobile experience**: same pages at mobile viewport, touch targets, sticky CTAs

Screenshot each page for the branded report.

CRO issues to look for:
- Missing or weak CTAs above the fold
- No urgency/scarcity elements
- Poor mobile experience (tiny buttons, horizontal scroll)
- Missing trust signals (reviews, badges, return policy)
- No cross-sell/upsell on product or cart pages
- Unclear shipping costs or return policy
- Poor product imagery or sparse descriptions
- Empty collection pages
- Broken URLs or redirect chains

#### 1b: Lighthouse Audit

Run Lighthouse on homepage and one PDP, plus a Chrome DevTools performance trace on each:
- Performance, Accessibility, SEO, Best Practices scores (0-100)
- **Core Web Vitals (from the perf trace)** for both homepage and PDP: LCP (ms), CLS, INP (ms), FCP (ms), TTFB (ms), TBT (ms). Prefer CrUX field p75 data when available; fall back to lab values. Record whichever the trace reports — the frontend renders an em-dash for any metric that's missing.

#### 1c: Tech Stack Detection

Inspect DOM and scripts to detect:
- **Theme**: name/version from `Shopify.theme` or meta tags
- **Installed apps**: scan for script patterns (Klaviyo, Yotpo, Judge.me, ReCharge, Bold, etc.)
- **Checkout type**: standard vs. extensible (Plus leaves detectable signals)
- **Payment providers**: visible on product pages
- **Analytics**: GA4, Meta Pixel, TikTok Pixel, etc.
- **Performance signals**: lazy loading, image optimization, font loading

Use `evaluate_script` in Chrome DevTools or parse the page source via WebFetch.

### Phase 2: Analysis

Map observations into **10 findings**, with the **first 3 being quick wins** (see Quick wins section above). Each finding must:

1. Be categorized by **Theme**: Checkout & Cart, Product Discovery, Product Page (PDP), ICC & Personalization, Conversion Optimization, Content & UX, Technical Infrastructure, Data & Analytics

2. Have **impact and effort scores** (1-5 each): Business Impact, User Impact, Effort to Fix

3. **Reference a Plus feature only when it genuinely solves the problem**, woven into the description (not a separate section), with a link to Shopify documentation. Quick wins should NOT reference Plus (by definition they're doable without it). For the remaining 7, aim for 3-5 to have a strong Plus tie-in when the merchant is a Plus candidate.

4. Include **evidence**: screenshots, Lighthouse metrics, specific observations

#### Shopify Plus Features Reference

| Feature | When to Recommend | Link |
|---------|------------------|------|
| Checkout Extensibility | Generic checkout, no upsells, no trust badges, no custom fields | https://shopify.dev/docs/api/checkout-ui-extensions |
| In-checkout order bumps | No last-minute offers at point of purchase | https://shopify.dev/docs/apps/build/checkout |
| Shopify Functions | No custom discount logic, BOGO, payment/delivery customization | https://shopify.dev/docs/apps/build/functions |
| Cart Transform | No bundles, no automatic free gifts | https://shopify.dev/docs/api/functions/reference/cart-transform |
| Launchpad | No flash sale infrastructure, manual campaign coordination | https://shopify.dev/docs/apps/build/flow/launchpad |
| ShopifyQL | Limited analytics, no custom reports | https://shopify.dev/docs/apps/build/flow/shopifyql |
| Expansion Stores | Multi-market crammed into one store | https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features |
| B2B Native | Wholesale/B2B needs with limited catalog support | https://help.shopify.com/en/manual/b2b |
| Higher API Limits (10x) | Slow/broken integrations, personalization needs | https://shopify.dev/docs/api/usage/rate-limits |

#### CRO Benchmarks

| Metric | Average | Good |
|--------|---------|------|
| Overall CR | 2-3% | 3-5% |
| Cart abandonment | 65-75% | lower |
| Add-to-cart rate | 5-10% | higher |
| Checkout completion | 40-60% | higher |
| Mobile CR | 1-2% | higher |
| Desktop CR | 3-4% | higher |
| Bounce rate (homepage) | 30-50% | lower |
| Bounce rate (PDP) | 20-40% | lower |

### Phase 3: Output

#### 3a: Notion — CRO Audit Reports Database (Web App Data)

This is the **primary output** — the data that powers the branded web app at `https://shopify-cro-audits-production.up.railway.app`.

Create a page in the **CRO Audit Reports** database (ID: `3ce32b72e4f5440199bd005ecc3fa762`) using the Notion MCP tools.

**Page properties:**
- Client Name: client name (title)
- Website URL: store URL
- Audit Date: today's date
- Executive Summary: 2-3 sentence summary of the audit
- CTA Link: `https://www.askphill.com/contact`
- Performance: Lighthouse performance score (0-100)
- Accessibility: Lighthouse accessibility score (0-100)
- SEO: Lighthouse SEO score (0-100)
- Best Practices: Lighthouse best practices score (0-100)
- Theme Name: detected Shopify theme
- Checkout Type: e.g. "Standard", "Shopify Plus"
- Finding Count: number of findings (should be 10)
- Status: "Draft" (Ben will change to "Published" after review)

**Page body:** Add a single JSON code block containing the nested data:

```json
{
  "findings": [
    {
      "title": "Finding title",
      "theme": "Checkout & Cart",
      "issue_description": "Description with Plus feature recommendation woven in naturally",
      "business_impact": 4,
      "user_impact": 3,
      "effort_to_fix": 2,
      "plus_feature": "Checkout Extensibility",
      "plus_feature_link": "https://shopify.dev/docs/api/checkout-ui-extensions",
      "screenshot_url": "",
      "evidence": ["Evidence point 1", "Evidence point 2"]
    }
  ],
  "tech_stack": {
    "apps": ["Klaviyo", "Yotpo"],
    "payment_providers": ["Shopify Payments", "PayPal"],
    "analytics": ["GA4", "Meta Pixel"]
  },
  "core_web_vitals": {
    "homepage": {
      "lcp_ms": 1737,
      "inp_ms": 94,
      "cls": 0,
      "fcp_ms": 1200,
      "ttfb_ms": 639,
      "tbt_ms": 350
    },
    "pdp": {
      "lcp_ms": 2400,
      "cls": 0
    }
  }
}
```

The `findings` array must contain **exactly 10 findings in order**, the first 3 being quick wins. Each finding must match the `Finding` TypeScript interface and include all required fields. The `screenshot_url` field can be empty if no screenshot is available for that finding. `core_web_vitals` is optional but strongly preferred; include every metric the perf trace reports for each of `homepage` and `pdp`, and omit any the trace doesn't produce — the frontend renders an em-dash for missing values.

#### 3b: Notion — Shopify CRO Audits Project Tracker

Also create an entry in the **Shopify CRO Audits** project tracker database (`33c5f354-7352-8047-a7f3-c8f5d451cc07`) for internal tracking:

**Properties:**
- Project name: "[Client Name] CRO Audit"
- Client: client name
- Website: store URL
- Status: "In progress"
- Priority: based on overall opportunity size
- Start date: audit date

**Page body:** Human-readable summary with headings per finding, inline tags for Theme/Impact/Effort, and issue descriptions.

#### 3c: Return Shareable URL

After creating the page in the CRO Audit Reports database, the Notion page ID is the audit ID. Return the shareable URL:

`https://shopify-cro-audits-production.up.railway.app/{notion-page-id}`

Note: The audit is created with Status "Draft". Ben must change it to "Published" in Notion before the web app will serve it. Tell Ben the audit is ready for review and remind him to publish it.

### Phase 4: Follow-up

After presenting the report, offer to:
1. Deep-dive into any specific finding
2. Adjust impact/effort scores based on Ben's judgment
3. Update the Notion pages
4. Re-audit after changes are made
