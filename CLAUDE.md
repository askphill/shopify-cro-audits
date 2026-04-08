# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Branded web app for sharing CRO (Conversion Rate Optimization) audit reports with Shopify merchants. A React SPA fetches audit data from Supabase by UUID and renders an Ask Phill branded report page. A companion Claude Code skill (in the phillbert repo) generates audits by scraping stores externally.

## Tech Stack

- React 18, TypeScript, Vite 5, Tailwind CSS
- Supabase (shared instance with ap-customizer, table: `cro_audits`)
- Railway for hosting
- Vitest + React Testing Library for tests

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npx vitest run       # Run all tests
npx vitest run tests/components/ThemeTag.test.tsx  # Run a single test file
npx vitest --watch   # Watch mode
```

## Architecture

- `src/pages/AuditPage.tsx` — Main page, fetches audit by UUID from URL params via `react-router-dom`
- `src/lib/supabase.ts` — Supabase client and `fetchAudit()` data layer
- `src/types/audit.ts` — TypeScript interfaces (`CroAudit`, `Finding`, `LighthouseScores`, `FindingTheme`, etc.)
- `src/components/` — Presentational components: `Logo`, `Header`, `ExecutiveSummary`, `LighthouseGauge`, `FindingCard`, `FindingsList`, `ImpactTable`, `ThemeTag`, `StarRating`, `CallToAction`, `NotFound`
- `tests/` — Component tests mirror `src/components/`

## Brand Tokens (Ask Phill)

Custom Tailwind colors are prefixed `ap-` (e.g., `ap-red`, `ap-green`, `ap-greyLight`, `ap-brown`). Brand reference code lives in `/Users/benrosenberg/ap-customizer-main`. The logo component (`Logo.tsx`) is the co-branded ASK Phill + Shopify wordmark SVG.

## Implementation Plan

The full plan with step-by-step tasks lives at `docs/plans/2026-04-08-shopify-plus-cro-audit.md`. It follows TDD (write failing tests first, then implement). Phase A covers the web app; Phase B covers the Claude Code skill and Supabase schema.

## Environment

Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The Supabase instance is `lbjnyktosnzccazdqaci.supabase.co`.
