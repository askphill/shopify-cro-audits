# `shopify_solution` as a structured, optional field with restrained rendering

When the audit runs in Non-Shopify mode (site detected as WooCommerce, Magento, BigCommerce, custom, etc.), the report still has to subtly convey "on Shopify, this issue would be solved natively" without becoming a migration sales pitch. We considered three options: weave Shopify references into existing `issue_description` / `quick_fix` prose; reuse the `plus_feature` field with mode-dependent semantics; or add a new optional structured field.

We chose the third: `shopify_solution: string | null` on both Finding and Bug, populated only in Non-Shopify mode, mutually exclusive with `plus_feature`. Subtlety is a *rendering* concern as much as a *wording* one — burying Shopify references inside paragraph copy fails in two ways (too quiet to register, or jarring as a salesy aside mid-paragraph). A separate field with deliberately understated rendering (italic, smaller, muted color, no leading label) lets the framing stay consistently quiet across all 18-ish items in an audit, while a per-item cap (~30-40% of Findings + Bugs, never on Quick Wins) prevents the audit from drifting into a brochure. Reusing `plus_feature` was rejected because Plus features are a Shopify-mode concept and overloading the field would force two competing semantics through every consumer.

## Consequences

- The Notion page-body JSON gains `shopify_solution` on Finding and Bug. It is `null` in Shopify mode and SHOULD be `null` for most items in Non-Shopify mode too.
- The web app must render `shopify_solution` only when present, in a visual register lower than `Evidence:` / `Fix:` lines, with no "On Shopify:" label (the sentence itself begins with "Shopify..." per voice rules).
- The skill SKILL.md owns the cap and voice rules. If a future maintainer drops or relaxes them, the audit will start reading as a sales pitch — that is the failure mode to watch for.
- Closing "Why Shopify" sections, header changes, CTA copy changes, and Executive Summary Shopify mentions are deliberately *not* part of the design. The Shopify Platinum Partner badge in the existing CTA carries the partner-context signal; everything else stays a CRO audit.
