# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Branded web app for sharing CRO (Conversion Rate Optimization) audit reports with Shopify merchants. A React SPA served by Express fetches audit data from a Notion database via a server-side API and renders an Ask Phill branded report page. A companion Claude Code skill (in the phillbert repo) generates audits by scraping stores and writing directly to Notion.

## Tech Stack

- React 18, TypeScript, Vite 5, Tailwind CSS
- Notion (CRO Audit Reports database, ID: 3ce32b72e4f5440199bd005ecc3fa762)
- Express + @notionhq/client (server-side API)
- Railway for hosting
- Vitest + React Testing Library for tests

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm start            # Production server (Express)
npm run dev:server   # Dev server with watch mode
npx vitest run       # Run all tests
npx vitest run tests/components/ThemeTag.test.tsx  # Run a single test file
npx vitest --watch   # Watch mode
```

## Architecture

- `server/index.ts` — Express server: serves SPA static files, `GET /api/audit/:id`, SPA fallback, in-memory cache (5min TTL)
- `server/notion.ts` — Notion client and `fetchAuditFromNotion()` transform logic
- `src/lib/api.ts` — Frontend `fetchAudit()` via fetch to `/api/audit/:id`
- `src/pages/AuditPage.tsx` — Main page, fetches audit by UUID from URL params via `react-router-dom`
- `src/types/audit.ts` — TypeScript interfaces (`CroAudit`, `Finding`, `LighthouseScores`, `FindingTheme`, etc.)
- `src/components/` — Presentational components: `Logo`, `Header`, `ExecutiveSummary`, `LighthouseGauge`, `FindingCard`, `FindingsList`, `ImpactTable`, `ThemeTag`, `StarRating`, `CallToAction`, `NotFound`
- `tests/` — Component tests mirror `src/components/`, server tests in `tests/server/`

## Brand Tokens (Ask Phill)

Custom Tailwind colors are prefixed `ap-` (e.g., `ap-red`, `ap-green`, `ap-greyLight`, `ap-brown`). Brand reference code lives in `/Users/benrosenberg/ap-customizer-main`. The logo component (`Logo.tsx`) is the co-branded ASK Phill + Shopify wordmark SVG.

## Implementation Plan

The full plan with step-by-step tasks lives at `docs/plans/2026-04-08-shopify-plus-cro-audit.md`. It follows TDD (write failing tests first, then implement). Phase A covers the web app; Phase B covers the Claude Code skill and Supabase schema.

## Environment

Copy `.env.example` to `.env` and set `NOTION_API_KEY` and `NOTION_DATABASE_ID`. The Notion database is "CRO Audit Reports" (ID: `3ce32b72e4f5440199bd005ecc3fa762`).
