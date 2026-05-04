# Domain Context

The shared language for the Shopify CRO Audit product. Update inline when terms are resolved.

## Glossary

### Audit
A single CRO report for one Shopify merchant, produced by the `shopify-plus-cro-audit` skill and published via the Notion-backed web app. An audit contains exactly one `Findings` list, one `Bugs` list, Lighthouse scores, Core Web Vitals, and tech-stack data.

### Finding
A **CRO opportunity** — a subjective, strategic recommendation scored on business impact, user impact, and effort (each 1-5). May tie to a Shopify Plus feature. The audit contains exactly 10 Findings, with the first 3 being Quick Wins. Findings are about *what could be better*, not *what is broken*.

### Bug
A **technical defect** — something objectively broken on the live site that a developer would fix without strategic debate. Bugs are distinct from Findings: they are not scored on the 1-5 impact matrix, do not tie to Plus features, and are not capped at a fixed count. Each Bug ships with a recommended quick fix.

Test for "is it a Bug?": *Would a developer fix this in a small PR without asking the merchant for product sign-off?* If yes → Bug. If no → Finding.

**In scope as Bugs:** JS console errors on key pages, broken links / 404s, broken images, mobile layout breaks (horizontal scroll, cut-off CTAs, overlap), failing interactions, missing/duplicate `<title>` / canonical / H1, invalid structured data, critical a11y violations (missing alt on conversion-critical images, contrast failures on CTAs, missing viewport meta), staging/dev URLs leaking into prod, mixed-content warnings, broken redirects, 3+ hop redirect chains.

**Not Bugs (stay as Findings or live in the Lighthouse gauges):** slow LCP / poor Core Web Vitals (already in gauges), weak copy, missing trust badges, "could add reviews here" opinions, general perf suggestions unless egregiously broken.

**Shape of a Bug:** `title`, `category` (enum: JavaScript Error, Broken Link, Broken Image, Layout / Responsive, Failing Interaction, SEO Tag, Structured Data, Accessibility, Security / Mixed Content, Redirect), `severity` (critical / high / low), `location` (free text), `evidence` (single string), `quick_fix` (1-2 sentences), optional `screenshot_url`. Bugs are not scored on the 1-5 impact matrix and do not tie to Plus features.

### Severity (Bug)
Three levels:
- **Critical** — blocks or directly breaks conversion (broken Add-to-Cart / Checkout link, mixed-content warning that triggers browser blocks).
- **High** — visibly broken or measurably impairs conversion (404 on a CTA, mobile button cut off, missing canonical on key templates).
- **Low** — cosmetic or minor SEO (missing alt on near-decorative image, redirect chain).

### Quick Fix (Bug)
The single 1-2 sentence remediation that ships with every Bug. Actionable, not a PR-sized diff. Example: *"Add `loading=\"lazy\"` to the homepage hero `<img>`"* or *"Set canonical tag on collection pages to strip the `?sort=` query param."*

### Bug Hunt
The structured detection pass added to the audit skill (Phase 1d). Runs on the same 5 key pages the audit already visits — homepage, top PDP, top collection, cart, search — and explicitly checks each Bug category (console errors, broken links, broken images, mobile horizontal scroll, head-tag sanity, structured data, redirect chains, mixed content, staging-URL leaks). No site-wide crawl in v1.

### Bugs Section
The report block placed between Findings and the Impact Table, titled *"Technical Bugs & Quick Fixes"*. Renders as compact rows (severity badge, category, title, location, "Fix:" line) grouped by severity (Critical → High → Low). Hidden entirely when the audit produces zero bugs. Lows are capped at 5 visible with an overflow line (*"+ N more low-severity issues"*); Criticals and Highs are never truncated.

### Dedup Rule (Bug vs Finding)
An issue lives in exactly one section. If it passes the Bug test (*dev fix without product sign-off*), it's a Bug — even when its conversion impact is finding-sized. Conversion-blocking Critical Bugs are name-checked in the Executive Summary so urgency surfaces without duplicating the item into Findings.

### Quick Win
The first 3 Findings in an audit — issues the merchant can ship in hours-to-days using their existing stack. Effort ≤ 2/5, business impact ≥ 3/5, no Plus upgrade required. Quick Wins are still Findings (CRO opportunities), distinct from Bugs (defects).
