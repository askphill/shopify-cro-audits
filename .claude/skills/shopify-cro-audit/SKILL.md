---
name: shopify-cro-audit
description: External CRO audit for ecommerce merchants. Scrapes the live site, runs Lighthouse, detects tech stack and platform, and produces 10 findings (first 3 are quick wins) plus a Technical Bugs pass. Auto-detects whether the site is on Shopify; in Shopify mode Plus features are called out where genuinely relevant; in Non-Shopify mode (WooCommerce, Magento, BigCommerce, custom) findings/bugs that are solved natively by Shopify carry a subtle one-line callout. Outputs to the Notion CRO Audit Reports database (which powers the branded web app). Trigger when the user says "CRO audit", "store audit", "audit [URL]", "conversion audit", or mentions auditing any ecommerce store.
---

# CRO Audit (Shopify and non-Shopify)

External CRO audit skill. Audits ecommerce stores purely by scraping the live site and produces actionable findings, quick wins, and a structured technical-bug pass. Auto-branches between **Shopify mode** (Plus features called out where genuinely relevant) and **Non-Shopify mode** (subtle Shopify-as-native-solution callouts on issues Shopify resolves structurally). Both modes produce the same report shape; the framing differs.

## Context

Ask Phill partners with Shopify's EMEA sales team. Shopify sends pre-qualified merchants (often 1M+ EUR revenue). The same audit also runs on prospects who are **not yet on Shopify** — same depth of analysis, same 10-findings-plus-bugs structure, with the platform angle woven in subtly rather than as a sales pitch. The audit's job is to be a credible CRO analysis first, with Shopify-relevant framing second.

**Key constraints:**
- No access to admin, GA4, Clarity, or any internal merchant data
- All data collection is external (browsing, Lighthouse, DOM inspection)
- Produce **10 findings**, ordered so the **first 3 are "quick wins"**
- In Shopify mode, Plus features are called out where they genuinely solve a problem, but not every finding needs a Plus tie-in
- In Non-Shopify mode, the `shopify_solution` field carries the framing (see Audit Mode rules below). Quick Wins never carry a `shopify_solution`
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

### Step 0.5: Audit Mode Detection

Before running the rest of Phase 1, determine whether the site is on Shopify. Navigate to the homepage with Chrome DevTools / Playwright MCP, then run a single `evaluate_script` to collect signals:

```js
({
  hasShopifyGlobal: typeof window.Shopify !== "undefined",
  hasShopifyCdn: Array.from(document.scripts).some(s => /cdn\.shopify\.com/.test(s.src || "")),
  hasMonorail: !!performance.getEntries().find(e => /monorail-edge\.shopifysvc\.com/.test(e.name)),
  hasCheckoutTokenMeta: !!document.querySelector('meta[name="shopify-checkout-api-token"]'),
  checkoutHrefs: Array.from(document.querySelectorAll('a[href*="checkout" i], form[action*="checkout" i]')).map(el => el.href || el.action).slice(0, 5),
  generator: document.querySelector('meta[name="generator"]')?.content || null,
  woocommerceMarker: !!document.querySelector('body.woocommerce, link[href*="wp-content/plugins/woocommerce"]'),
  magentoMarker: typeof window.Magento !== "undefined" || !!document.querySelector('body[class*="catalog-"], script[src*="mage/"]'),
  bigcommerceMarker: !!document.querySelector('script[src*="bigcommerce.com"]') || !!window.BCData
})
```

**Classify the platform:**

| Detected | Platform value | Mode |
|---|---|---|
| `hasShopifyGlobal` OR `hasCheckoutTokenMeta` OR `hasMonorail` | `Shopify` | Shopify |
| Checkout link/form target on `*.myshopify.com` or `checkout.shopify.com` but no `Shopify` global | `Shopify (Hydrogen)` | Shopify |
| `woocommerceMarker` OR `generator` contains `WooCommerce` | `WooCommerce` | Non-Shopify |
| `magentoMarker` OR `generator` contains `Magento` | `Magento` | Non-Shopify |
| `bigcommerceMarker` | `BigCommerce` | Non-Shopify |
| None of the above | `Custom` (low confidence — confirm with Ben) | Non-Shopify |

**Confidence rule:**
- If a definitive Shopify or non-Shopify marker fires, proceed silently.
- If the result is `Custom` or `Other` (no markers fire), surface to Ben before continuing: *"Detected: unknown platform. Best guess: [...]. Confirm before I continue."* Ben confirms or overrides the platform.

Record the chosen `platform` and `mode` for the rest of the audit. **Hydrogen / headless Shopify is treated as Shopify mode** — Plus features still apply.

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

**In Shopify mode**, detect:
- **Theme**: name/version from `Shopify.theme` or meta tags
- **Installed apps**: scan for script patterns (Klaviyo, Yotpo, Judge.me, ReCharge, Bold, etc.)
- **Checkout type**: standard vs. extensible (Plus leaves detectable signals)
- **Payment providers**: visible on product pages
- **Analytics**: GA4, Meta Pixel, TikTok Pixel, etc.
- **Performance signals**: lazy loading, image optimization, font loading

**In Non-Shopify mode**, skip Theme and Checkout Type detection (Shopify-specific concepts). Detect everything else identically — script-based detection of apps/third-party tools, payment providers, and analytics works platform-agnostically. Apps detected on a non-Shopify site might include Klaviyo, Algolia, Trustpilot, Mailchimp, etc., as well as platform-equivalent tools.

Use `evaluate_script` in Chrome DevTools or parse the page source via WebFetch.

#### 1d: Bug Hunt

Run a structured pass for **technical bugs** on the same 5 key pages already visited (homepage, top PDP, top collection, cart, search). A Bug is something *objectively broken* — a developer would fix it in a small PR without product sign-off. Distinct from a Finding (which is a CRO opportunity).

For each page, run these checks:

- **JS console errors**: After navigating, call `list_console_messages` (Chrome DevTools MCP) — flag any `error`-level message.
- **Broken links**: Use `evaluate_script` to collect all in-domain `<a href>` values, then `fetch(url, { method: "HEAD" })` each. Flag any 4xx/5xx.
- **Broken images**: Iterate `document.querySelectorAll("img")`. Flag any with no `src`, with a `src` returning 4xx, or `<img>` on conversion-critical surfaces (PDP gallery, hero, featured products) missing `alt`.
- **Mobile horizontal scroll**: Resize to 390×844 and check `document.documentElement.scrollWidth > window.innerWidth`. If true, that's a Layout / Responsive bug.
- **Head sanity**: Count `<title>` (must be exactly 1), check `<link rel="canonical">` presence and that it points to a non-querystring URL, check `<meta name="viewport">` exists, count H1s in `<body>` (must be exactly 1).
- **Structured data**: Inspect `<script type="application/ld+json">` blocks; flag invalid JSON or missing required fields on Product / Organization schema.
- **Mixed content / staging URL leaks**: Scan page source via `WebFetch` for `http://` references on a `https://` page, and for `localhost`, `staging.`, or `*.myshopify.com` (when the live domain differs).
- **Redirect chains**: For homepage, top PDP, and top collection, follow redirects with `fetch` and count hops. Flag chains of 3+.

For each bug found, record:
- `title`: short, human ("Cart drawer 'Checkout' button silently fails on mobile")
- `category`: one of `JavaScript Error`, `Broken Link`, `Broken Image`, `Layout / Responsive`, `Failing Interaction`, `SEO Tag`, `Structured Data`, `Accessibility`, `Security / Mixed Content`, `Redirect`
- `severity`: `critical` (blocks/breaks conversion: broken ATC, broken Checkout link, mixed-content blocks), `high` (visibly broken or measurably impairs conversion: 404 on a CTA, mobile button cut off, missing canonical on key templates), `low` (cosmetic / minor SEO: missing alt on near-decorative image, redirect chain)
- `location`: free text ("/products/classic-kit on mobile viewport")
- `evidence`: single string (the console message, HTTP status, selector, etc.)
- `quick_fix`: 1-2 sentences, actionable; not a PR-sized diff

**Quick Fix wording rule (Non-Shopify mode):** `quick_fix` text MUST be platform-agnostic. Do not reference Liquid, `theme.liquid`, Shopify admin paths, or any specific CMS file/plugin (no `wp-config.php`, no `functions.php`, no `theme.xml`). Describe the fix in HTML/CSS/JS/HTTP semantics. If a fix genuinely requires platform-specific knowledge to action, that's a sign it's the wrong granularity for a Quick Fix — escalate it into a Finding instead.

**Dedup rule**: A given issue lives in exactly one section. If it passes the bug test (a dev would fix it without product sign-off), record it as a Bug — even if its conversion impact is finding-sized. Do not also create a Finding for it. Conversion-blocking Critical bugs should be **name-checked in the Executive Summary** so urgency surfaces without duplicating the item into Findings.

There is no fixed bug count — list everything you find. The frontend caps low-severity bugs at 5 visible automatically.

### Phase 2: Analysis

Map observations into **10 findings**, with the **first 3 being quick wins** (see Quick wins section above). Each finding must:

1. Be categorized by **Theme**: Checkout & Cart, Product Discovery, Product Page (PDP), ICC & Personalization, Conversion Optimization, Content & UX, Technical Infrastructure, Data & Analytics

2. Have **impact and effort scores** (1-5 each): Business Impact, User Impact, Effort to Fix

3. **Reference a Plus feature only when it genuinely solves the problem** (Shopify mode only), woven into the description (not a separate section), with a link to Shopify documentation. Quick wins should NOT reference Plus (by definition they're doable without it). For the remaining 7, aim for 3-5 to have a strong Plus tie-in when the merchant is a Plus candidate. **In Non-Shopify mode, `plus_feature` MUST be `null` for every finding** — Plus features only apply to Shopify-mode audits.

4. Include **evidence**: screenshots, Lighthouse metrics, specific observations

#### Non-Shopify mode: `shopify_solution` rules

In Non-Shopify mode, both **Findings** and **Bugs** carry an optional `shopify_solution: string | null` field. This is the only channel for Shopify-as-solution framing — keep it out of `issue_description` and `quick_fix`. The web app renders it as a subdued italic line below the body.

**Apply `shopify_solution` only when ALL three are true:**
1. **Structural fix, not strategic.** Shopify *natively, by virtue of the platform itself*, solves or prevents this issue. Not "Shopify has an app for that".
2. **The fix is non-trivial on the current platform.** If the merchant can fix it in a 5-minute setting toggle, the Shopify line is gratuitous.
3. **The Shopify capability is concrete and specific.** Examples: Shop Pay autofill, checkout extensibility, managed HTTPS for theme assets, automatic responsive WebP via the CDN, native `loading="lazy"` defaults in modern themes, Shopify's CDN edge caching. NOT generic claims like "Shopify is faster" or "Shopify is more reliable".

**Never apply when:**
- The issue is about copy, trust badges, photography, hero composition, brand tone, ICC strategy, merchandising mix, review density, or content strategy. These are platform-agnostic.
- The issue is a generic CRO opportunity (urgency element, social proof, exit intent). Adding "Shopify could help" here is a stretch and reads as forced.
- The Shopify capability requires Plus *and* the merchant is small/mid-size. Don't dangle Plus features as the answer to a small-merchant problem.

**Cap (subtlety governor):**
- **At most ~30-40% of (Findings + Bugs) carry a `shopify_solution`.** For a 10-finding + 8-bug audit, that's ~5-7 lines max. If more candidates emerge, force-rank by structural-impact and drop the weakest.
- **Quick Wins (first 3 findings) NEVER carry a `shopify_solution`.** Quick Wins are "ship this in hours-to-days on your current stack" — adding "On Shopify..." contradicts the Quick Win contract. Always set `shopify_solution: null` on the first 3 findings.

**Voice rules for the line itself:**
- One sentence, max ~20 words.
- Factual capability statement. Subject is "Shopify" or "Shopify's native X", verb is "handles / solves / eliminates / prevents", object is the specific issue.
- No comparative language ("better", "faster", "more reliable").
- No prescriptive language ("you should", "consider migrating", "we recommend").
- No marketing words ("seamless", "best-in-class", "unmatched").
- The sentence MUST start with "Shopify" or "Shopify's …" so the rendering reads cleanly without a leading label.

**Examples (good vs bad):**

| Issue | Good `shopify_solution` | Bad |
|---|---|---|
| Mixed-content warning on PDP | "Shopify-hosted assets serve over HTTPS by default; this class of bug doesn't occur on Shopify." | "Shopify is more secure than your current platform." |
| Checkout abandons during autofill | "Shopify's native checkout handles autofill via Shop Pay, eliminating the re-render that triggers this drop-off." | "Switch to Shopify for a better checkout." |
| Slow LCP from unoptimized hero image | "Shopify's CDN serves responsive WebP variants automatically for theme images." | "Shopify is faster overall." |
| Missing review widget | (set `shopify_solution: null` — platform-agnostic) | "Shopify has many review apps." |
| Weak hero copy | (set `shopify_solution: null` — copy is not a platform issue) | "Shopify's themes have better hero sections." |

**Final check before emitting JSON:** count the items with non-null `shopify_solution`. If it exceeds ~40% of (Findings + Bugs), trim the weakest before writing to Notion.

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
- Executive Summary: 2-3 sentence summary of the audit. **Do not mention Shopify in Non-Shopify mode** — keep the summary as a pure CRO analysis. The platform angle is reserved for individual finding/bug-level callouts.
- CTA Link: `https://www.askphill.com/contact`
- Performance: Lighthouse performance score (0-100)
- Accessibility: Lighthouse accessibility score (0-100)
- SEO: Lighthouse SEO score (0-100)
- Best Practices: Lighthouse best practices score (0-100)
- **Platform**: Select. Set to one of `Shopify`, `Shopify (Hydrogen)`, `WooCommerce`, `Magento`, `BigCommerce`, `Custom`, `Other` based on Step 0.5 detection. Always populated.
- Theme Name: detected Shopify theme. **Leave empty in Non-Shopify mode.**
- Checkout Type: e.g. "Standard", "Shopify Plus". **Leave empty in Non-Shopify mode.**
- Finding Count: number of findings (should be 10)
- Status: "Draft" (Ben will change to "Published" after review)

**Page body:** Add a single JSON code block containing the nested data:

```json
{
  "findings": [
    {
      "title": "Finding title",
      "theme": "Checkout & Cart",
      "issue_description": "Description with Plus feature recommendation woven in naturally (Shopify mode) or platform-agnostic CRO analysis (Non-Shopify mode)",
      "business_impact": 4,
      "user_impact": 3,
      "effort_to_fix": 2,
      "plus_feature": "Checkout Extensibility",
      "plus_feature_link": "https://shopify.dev/docs/api/checkout-ui-extensions",
      "shopify_solution": null,
      "screenshot_url": "",
      "evidence": ["Evidence point 1", "Evidence point 2"]
    }
  ],
  "bugs": [
    {
      "title": "Add-to-cart silently fails on mobile PDP",
      "category": "JavaScript Error",
      "severity": "critical",
      "location": "/products/classic-kit on mobile viewport (390x844)",
      "evidence": "Uncaught TypeError: addToCart is not a function (cart.js:42)",
      "quick_fix": "Restore the missing addToCart handler binding — the click listener attaches to a stale function reference.",
      "shopify_solution": null
    },
    {
      "title": "Mixed-content warning on PDP",
      "category": "Security / Mixed Content",
      "severity": "high",
      "location": "/products/classic-kit",
      "evidence": "http://cdn.example.com/img/swatch.jpg referenced from an https page",
      "quick_fix": "Update the image reference to https://, or replace with a relative protocol-less URL.",
      "shopify_solution": "Shopify-hosted assets serve over HTTPS by default; this class of bug doesn't occur on Shopify."
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

The `findings` array must contain **exactly 10 findings in order**, the first 3 being quick wins. Each finding must match the `Finding` TypeScript interface and include all required fields. The `screenshot_url` field can be empty if no screenshot is available for that finding. The `shopify_solution` field is `null` in Shopify mode for every finding, and may be a string in Non-Shopify mode subject to the cap and rules above. `core_web_vitals` is optional but strongly preferred; include every metric the perf trace reports for each of `homepage` and `pdp`, and omit any the trace doesn't produce — the frontend renders an em-dash for missing values.

The `bugs` array contains all technical defects found during Phase 1d. Each bug also carries `shopify_solution: string | null`, with the same rules as findings (only set in Non-Shopify mode, only when Shopify structurally resolves the issue). There is no fixed count: emit every bug uncovered by the structured pass. Each bug must include `title`, `category`, `severity` (`critical` / `high` / `low`), `location`, `evidence`, and `quick_fix`. Omit the `bugs` field entirely (or pass an empty array) if no bugs were found — the frontend hides the section. The frontend automatically caps low-severity bugs at 5 visible with an overflow line; do not pre-truncate. **If the audit produces a Critical bug, name-check it in the Executive Summary** so the urgency surfaces above the fold without duplicating the item into Findings.

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
