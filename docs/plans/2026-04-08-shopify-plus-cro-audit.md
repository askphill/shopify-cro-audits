# Shopify Plus CRO Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a branded, interactive web app for sharing CRO audit reports with Shopify merchants, plus a Claude Code skill that generates those audits by externally scraping stores.

**Architecture:** React SPA fetches audit data from Supabase by UUID and renders a branded Ask Phill report page. The Claude Code skill collects data via Playwright/Lighthouse/DOM inspection, pushes structured JSON to Supabase and Notion, and returns the shareable URL.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS, Supabase (shared instance with ap-customizer), Railway (hosting), Claude Code skill (SKILL.md)

**Design Spec:** `/Users/benrosenberg/phillbert/docs/superpowers/specs/2026-04-08-shopify-plus-cro-audit-design.md`

**Brand Reference:** `/Users/benrosenberg/ap-customizer-main` (colors, logo SVGs, typography)

---

## File Structure

```
/Users/benrosenberg/shopify-cro-audit/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── index.html
├── .env.example
├── .env
├── Dockerfile
├── .dockerignore
├── docs/
│   └── plans/
│       └── 2026-04-08-shopify-plus-cro-audit.md (this file)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── audit.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── components/
│   │   ├── Logo.tsx
│   │   ├── Header.tsx
│   │   ├── ExecutiveSummary.tsx
│   │   ├── LighthouseGauge.tsx
│   │   ├── FindingCard.tsx
│   │   ├── FindingsList.tsx
│   │   ├── ImpactTable.tsx
│   │   ├── ThemeTag.tsx
│   │   ├── StarRating.tsx
│   │   ├── CallToAction.tsx
│   │   └── NotFound.tsx
│   └── pages/
│       └── AuditPage.tsx
└── tests/
    ├── setup.ts
    └── components/
        ├── LighthouseGauge.test.tsx
        ├── ThemeTag.test.tsx
        ├── StarRating.test.tsx
        ├── FindingCard.test.tsx
        └── ImpactTable.test.tsx
```

**Skill file (in phillbert repo):**
```
/Users/benrosenberg/phillbert/.claude/skills/shopify-plus-cro-audit/SKILL.md
```

---

## Phase A: Web App

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `.env.example`, `src/main.tsx`, `src/index.css`

- [ ] **Step 1: Initialize project with Vite**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npm create vite@latest . -- --template react-ts
```

Select "React" and "TypeScript" if prompted interactively. If the directory is not empty (because of the docs folder), Vite may ask to proceed; answer yes.

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npm install @supabase/supabase-js react-router-dom
npm install -D tailwindcss @tailwindcss/vite autoprefixer
```

- [ ] **Step 3: Configure Tailwind with Ask Phill brand tokens**

Replace `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ap: {
          red: "#DE0015",
          redLight: "#f7bad4",
          redDark: "#850009",
          green: "#0DC147",
          greenLight: "#b9f0d8",
          greenDark: "#035716",
          greyLight: "#FAF8F7",
          greyDark: "#898989",
          brown: "#D8CCB5",
          brownLight: "#f0ece1",
          brownDark: "#614125",
          blue: "#1E90FF",
          blueLight: "#c7edff",
          blueDark: "#1761BF",
        },
        black: "#131313",
      },
      boxShadow: {
        "ap-popup": "0px 4px 25px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 4: Configure Vite with Tailwind plugin**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 5: Set up index.css with Tailwind directives and base styles**

Replace `src/index.css` with:

```css
@import "tailwindcss";

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  background-color: #faf8f7;
  color: #131313;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 6: Create .env.example**

```
VITE_SUPABASE_URL=https://lbjnyktosnzccazdqaci.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

- [ ] **Step 7: Initialize git and commit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git init
echo "node_modules\ndist\n.env" > .gitignore
git add -A
git commit -m "feat: scaffold React + Vite + Tailwind project with AP brand tokens"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/audit.ts`

- [ ] **Step 1: Define the audit data types**

Create `src/types/audit.ts`:

```ts
export interface LighthouseScores {
  performance: number;
  accessibility: number;
  seo: number;
  best_practices: number;
}

export interface TechStack {
  theme: string;
  apps: string[];
  checkout_type: string;
  payment_providers: string[];
  analytics: string[];
}

export type FindingTheme =
  | "Checkout & Cart"
  | "Product Discovery"
  | "Product Page (PDP)"
  | "ICC & Personalization"
  | "Email & Retention"
  | "Conversion Optimization"
  | "Content & UX"
  | "Data & Analytics"
  | "Technical Infrastructure"
  | "AI & Automation"
  | "Customer Service";

export interface Finding {
  title: string;
  theme: FindingTheme;
  issue_description: string;
  business_impact: number;
  user_impact: number;
  effort_to_fix: number;
  plus_feature: string;
  plus_feature_link: string;
  screenshot_url?: string;
  evidence: string[];
}

export interface CroAudit {
  id: string;
  client_name: string;
  website_url: string;
  audit_date: string;
  lighthouse_scores: LighthouseScores;
  tech_stack: TechStack;
  findings: Finding[];
  executive_summary: string;
  cta_link?: string;
  created_at: string;
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git add src/types/audit.ts
git commit -m "feat: add TypeScript types for CRO audit data"
```

---

### Task 3: Supabase Client

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Create the Supabase client and fetch function**

Create `src/lib/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";
import type { CroAudit } from "../types/audit";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchAudit(id: string): Promise<CroAudit | null> {
  const { data, error } = await supabase
    .from("cro_audits")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as CroAudit;
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git add src/lib/supabase.ts
git commit -m "feat: add Supabase client and fetchAudit function"
```

---

### Task 4: Logo Component

**Files:**
- Create: `src/components/Logo.tsx`

- [ ] **Step 1: Create the co-branded Ask Phill + Shopify logo**

Create `src/components/Logo.tsx`. This is the `customizerLogo` variant from the ap-customizer repo (the "ASK" wordmark + "Phill" with a Shopify-green checkmark):

```tsx
interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 904 583"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M81.3244 279.79H18L114.488 0H190.641L286.992 279.79H223.668L202.975 215.99H102.058L81.3244 279.79ZM153.656 63.9364L187.997 169.814H117.064L151.473 63.9364H153.656Z"
        fill="#131313"
      />
      <path
        d="M534.798 213.166V279.79H476.66V0H534.798V149.595H537.937L605.083 69.9475H671.819L594.071 160.845L675.777 279.79H607.676L550.554 195.157L534.798 213.166Z"
        fill="#131313"
      />
      <path
        d="M408.95 133.064L462.176 129.786C459.628 110.477 450.712 95.2216 435.427 84.0191C420.232 72.8165 399.397 67.2153 372.921 67.2153C354.997 67.2153 339.348 69.8565 325.974 75.139C312.69 80.4215 302.363 87.9354 294.994 97.6807C287.715 107.426 284.076 119.038 284.076 132.518C284.076 148.183 289.034 161.071 298.952 171.18C308.96 181.29 324.199 188.394 344.671 192.492L380.973 199.733C390.071 201.555 396.804 204.196 401.171 207.657C405.539 211.027 407.768 215.353 407.859 220.635C407.768 226.92 404.583 232.066 398.305 236.073C392.119 239.989 383.93 241.948 373.74 241.948C363.368 241.948 354.861 239.762 348.219 235.39C341.577 230.927 337.392 224.461 335.663 215.99L278.48 218.996C281.301 239.033 290.9 254.881 307.277 266.538C323.745 278.105 345.854 283.889 373.603 283.889C391.8 283.889 407.859 281.02 421.779 275.282C435.791 269.453 446.8 261.347 454.806 250.964C462.904 240.581 466.952 228.514 466.952 214.761C466.952 199.642 461.948 187.438 451.94 178.148C441.932 168.858 426.738 162.118 406.357 157.928L368.417 150.278C358.682 148.183 351.813 145.405 347.81 141.944C343.806 138.483 341.805 134.248 341.805 129.239C341.805 122.955 344.898 117.945 351.085 114.211C357.272 110.386 364.869 108.473 373.876 108.473C380.609 108.473 386.387 109.612 391.209 111.889C396.122 114.075 400.08 117.035 403.082 120.769C406.084 124.412 408.041 128.51 408.95 133.064Z"
        fill="#131313"
      />
      <path d="M904 583V303.21H845.862V583H904Z" fill="#131313" />
      <path d="M826.192 303.21V583H768.053V303.21H826.192Z" fill="#131313" />
      <path d="M690.245 373.157V583H748.383V373.157H690.245Z" fill="#131313" />
      <path
        d="M697.205 337.5C703.392 343.238 710.807 346.107 719.45 346.107C728.094 346.107 735.463 343.238 741.559 337.5C747.746 331.672 750.84 324.704 750.84 316.598C750.84 308.583 747.746 301.707 741.559 295.969C735.463 290.14 728.094 287.226 719.45 287.226C710.807 287.226 703.392 290.14 697.205 295.969C691.109 301.707 688.061 308.583 688.061 316.598C688.061 324.704 691.109 331.672 697.205 337.5Z"
        fill="#131313"
      />
      <path
        d="M535.464 461.685V583H477.326V303.21H533.827V410.18H536.283C541.014 397.794 548.657 388.094 559.211 381.081C569.765 373.977 583.003 370.425 598.925 370.425C613.482 370.425 626.175 373.613 637.002 379.988C647.92 386.273 656.381 395.335 662.386 407.175C668.482 418.924 671.484 432.995 671.393 449.389V583H613.255V459.772C613.346 446.839 610.071 436.775 603.429 429.58C596.878 422.385 587.689 418.787 575.861 418.787C567.945 418.787 560.94 420.472 554.844 423.842C548.839 427.212 544.108 432.13 540.65 438.597C537.284 444.972 535.555 452.668 535.464 461.685Z"
        fill="#131313"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M256.492 303.21V583H315.585V492.287H365.262C386.734 492.287 405.022 488.325 420.125 480.401C435.319 472.477 446.92 461.411 454.926 447.203C462.933 432.995 466.936 416.601 466.936 398.022C466.936 379.442 462.978 363.048 455.063 348.84C447.238 334.54 435.865 323.383 420.944 315.369C406.023 307.263 387.962 303.21 366.763 303.21H256.492ZM315.585 444.881V351.572H355.436C366.9 351.572 376.362 353.53 383.823 357.446C391.283 361.272 396.833 366.691 400.473 373.704C404.203 380.626 406.068 388.732 406.068 398.022C406.068 407.22 404.203 415.372 400.473 422.476C396.833 429.489 391.283 434.999 383.823 439.006C376.453 442.923 367.082 444.881 355.709 444.881H315.585Z"
        fill="#131313"
      />
      <rect
        y="331.137"
        width="246"
        height="246"
        rx="50"
        transform="rotate(-20 0 331.137)"
        fill="white"
      />
      <path
        d="M195.697 351.296L151.319 446.463L108.062 426.291"
        stroke="#95BF46"
        strokeWidth="19"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git add src/components/Logo.tsx
git commit -m "feat: add Ask Phill + Shopify co-branded logo component"
```

---

### Task 5: Small Reusable Components

**Files:**
- Create: `src/components/ThemeTag.tsx`, `src/components/StarRating.tsx`, `src/components/LighthouseGauge.tsx`
- Test: `tests/components/ThemeTag.test.tsx`, `tests/components/StarRating.test.tsx`, `tests/components/LighthouseGauge.test.tsx`

- [ ] **Step 1: Install test dependencies**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Configure Vitest**

Add to `vite.config.ts` (replace entire file):

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
  },
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Write failing tests for ThemeTag**

Create `tests/components/ThemeTag.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ThemeTag } from "../../src/components/ThemeTag";

describe("ThemeTag", () => {
  it("renders the theme text", () => {
    render(<ThemeTag theme="Checkout & Cart" />);
    expect(screen.getByText("Checkout & Cart")).toBeInTheDocument();
  });

  it("applies different colors for different themes", () => {
    const { rerender } = render(<ThemeTag theme="Checkout & Cart" />);
    const tag1 = screen.getByText("Checkout & Cart");

    rerender(<ThemeTag theme="Content & UX" />);
    const tag2 = screen.getByText("Content & UX");

    expect(tag1.className).not.toBe(tag2.className);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run tests/components/ThemeTag.test.tsx
```

Expected: FAIL (module not found)

- [ ] **Step 5: Implement ThemeTag**

Create `src/components/ThemeTag.tsx`:

```tsx
import type { FindingTheme } from "../types/audit";

const themeColors: Record<FindingTheme, string> = {
  "Checkout & Cart": "bg-blue-100 text-blue-800",
  "Product Discovery": "bg-green-100 text-green-800",
  "Product Page (PDP)": "bg-yellow-100 text-yellow-800",
  "ICC & Personalization": "bg-purple-100 text-purple-800",
  "Email & Retention": "bg-red-100 text-red-800",
  "Conversion Optimization": "bg-orange-100 text-orange-800",
  "Content & UX": "bg-pink-100 text-pink-800",
  "Data & Analytics": "bg-gray-100 text-gray-800",
  "Technical Infrastructure": "bg-stone-100 text-stone-800",
  "AI & Automation": "bg-slate-100 text-slate-800",
  "Customer Service": "bg-cyan-100 text-cyan-800",
};

interface ThemeTagProps {
  theme: FindingTheme;
}

export function ThemeTag({ theme }: ThemeTagProps) {
  const colorClass = themeColors[theme] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-tight ${colorClass}`}
    >
      {theme}
    </span>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run tests/components/ThemeTag.test.tsx
```

Expected: PASS

- [ ] **Step 7: Write failing tests for StarRating**

Create `tests/components/StarRating.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { StarRating } from "../../src/components/StarRating";

describe("StarRating", () => {
  it("renders the correct number of filled stars", () => {
    render(<StarRating value={3} max={5} />);
    const filled = screen.getAllByTestId("star-filled");
    expect(filled).toHaveLength(3);
  });

  it("renders the correct number of empty stars", () => {
    render(<StarRating value={2} max={5} />);
    const empty = screen.getAllByTestId("star-empty");
    expect(empty).toHaveLength(3);
  });

  it("renders a label when provided", () => {
    render(<StarRating value={4} max={5} label="Impact" />);
    expect(screen.getByText("Impact")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Run tests to verify they fail**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run tests/components/StarRating.test.tsx
```

Expected: FAIL

- [ ] **Step 9: Implement StarRating**

Create `src/components/StarRating.tsx`:

```tsx
interface StarRatingProps {
  value: number;
  max?: number;
  label?: string;
}

export function StarRating({ value, max = 5, label }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      {label && (
        <span className="text-xs font-medium text-ap-greyDark tracking-tight">
          {label}
        </span>
      )}
      <div className="flex gap-0.5">
        {Array.from({ length: max }, (_, i) =>
          i < value ? (
            <span key={i} data-testid="star-filled" className="text-ap-red">
              &#9733;
            </span>
          ) : (
            <span
              key={i}
              data-testid="star-empty"
              className="text-gray-300"
            >
              &#9733;
            </span>
          )
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Run tests to verify they pass**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run tests/components/StarRating.test.tsx
```

Expected: PASS

- [ ] **Step 11: Write failing tests for LighthouseGauge**

Create `tests/components/LighthouseGauge.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { LighthouseGauge } from "../../src/components/LighthouseGauge";

describe("LighthouseGauge", () => {
  it("renders the score as text", () => {
    render(<LighthouseGauge score={85} label="Performance" />);
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("renders the label", () => {
    render(<LighthouseGauge score={92} label="SEO" />);
    expect(screen.getByText("SEO")).toBeInTheDocument();
  });

  it("applies green color for scores >= 90", () => {
    render(<LighthouseGauge score={95} label="Test" />);
    const gauge = screen.getByTestId("gauge-circle");
    expect(gauge.getAttribute("stroke")).toBe("#0DC147");
  });

  it("applies orange color for scores 50-89", () => {
    render(<LighthouseGauge score={72} label="Test" />);
    const gauge = screen.getByTestId("gauge-circle");
    expect(gauge.getAttribute("stroke")).toBe("#FF8C00");
  });

  it("applies red color for scores < 50", () => {
    render(<LighthouseGauge score={30} label="Test" />);
    const gauge = screen.getByTestId("gauge-circle");
    expect(gauge.getAttribute("stroke")).toBe("#DE0015");
  });
});
```

- [ ] **Step 12: Run tests to verify they fail**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run tests/components/LighthouseGauge.test.tsx
```

Expected: FAIL

- [ ] **Step 13: Implement LighthouseGauge**

Create `src/components/LighthouseGauge.tsx`:

```tsx
interface LighthouseGaugeProps {
  score: number;
  label: string;
}

function getColor(score: number): string {
  if (score >= 90) return "#0DC147";
  if (score >= 50) return "#FF8C00";
  return "#DE0015";
}

export function LighthouseGauge({ score, label }: LighthouseGaugeProps) {
  const color = getColor(score);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          data-testid="gauge-circle"
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-xl font-bold"
          fill="#131313"
        >
          {score}
        </text>
      </svg>
      <span className="text-xs font-medium tracking-tight text-ap-greyDark">
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Step 14: Run all tests to verify they pass**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run
```

Expected: all PASS

- [ ] **Step 15: Commit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git add src/components/ThemeTag.tsx src/components/StarRating.tsx src/components/LighthouseGauge.tsx tests/
git commit -m "feat: add ThemeTag, StarRating, LighthouseGauge components with tests"
```

---

### Task 6: Header and Executive Summary Components

**Files:**
- Create: `src/components/Header.tsx`, `src/components/ExecutiveSummary.tsx`

- [ ] **Step 1: Implement Header**

Create `src/components/Header.tsx`:

```tsx
import { Logo } from "./Logo";

interface HeaderProps {
  clientName: string;
  websiteUrl: string;
  auditDate: string;
}

export function Header({ clientName, websiteUrl, auditDate }: HeaderProps) {
  const formattedDate = new Date(auditDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-8 md:px-12">
      <div className="mx-auto max-w-4xl">
        <Logo className="h-12 mb-6" />
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tighter">
            CRO Audit: {clientName}
          </h1>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ap-blue hover:underline text-sm"
          >
            {websiteUrl}
          </a>
          <p className="text-sm text-ap-greyDark mt-1">
            {formattedDate} &middot; Prepared by Ask Phill
          </p>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Implement ExecutiveSummary**

Create `src/components/ExecutiveSummary.tsx`:

```tsx
import type { LighthouseScores, Finding } from "../types/audit";
import { LighthouseGauge } from "./LighthouseGauge";

interface ExecutiveSummaryProps {
  summary: string;
  lighthouseScores: LighthouseScores;
  findings: Finding[];
}

export function ExecutiveSummary({
  summary,
  lighthouseScores,
  findings,
}: ExecutiveSummaryProps) {
  const topTheme = findings.reduce(
    (acc, f) => {
      acc[f.theme] = (acc[f.theme] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const mostCommonTheme = Object.entries(topTheme).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  return (
    <section className="bg-white px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold tracking-tighter mb-4">
          Executive Summary
        </h2>
        <p className="text-black/70 leading-relaxed mb-8">{summary}</p>

        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <LighthouseGauge
            score={lighthouseScores.performance}
            label="Performance"
          />
          <LighthouseGauge
            score={lighthouseScores.accessibility}
            label="Accessibility"
          />
          <LighthouseGauge score={lighthouseScores.seo} label="SEO" />
          <LighthouseGauge
            score={lighthouseScores.best_practices}
            label="Best Practices"
          />
        </div>

        <div className="flex gap-6 text-sm text-ap-greyDark">
          <span>
            <strong className="text-black">{findings.length}</strong> findings
          </span>
          {mostCommonTheme && (
            <span>
              Top theme:{" "}
              <strong className="text-black">{mostCommonTheme}</strong>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git add src/components/Header.tsx src/components/ExecutiveSummary.tsx
git commit -m "feat: add Header and ExecutiveSummary components"
```

---

### Task 7: FindingCard and FindingsList Components

**Files:**
- Create: `src/components/FindingCard.tsx`, `src/components/FindingsList.tsx`
- Test: `tests/components/FindingCard.test.tsx`

- [ ] **Step 1: Write failing tests for FindingCard**

Create `tests/components/FindingCard.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { FindingCard } from "../../src/components/FindingCard";
import type { Finding } from "../../src/types/audit";

const mockFinding: Finding = {
  title: "Checkout lacks trust signals",
  theme: "Checkout & Cart",
  issue_description:
    "The checkout page has no trust badges, security indicators, or return policy info visible.",
  business_impact: 5,
  user_impact: 4,
  effort_to_fix: 2,
  plus_feature: "Checkout Extensibility",
  plus_feature_link: "https://shopify.dev/docs/api/checkout-ui-extensions",
  evidence: ["No trust badges found", "Generic checkout branding"],
};

describe("FindingCard", () => {
  it("renders the title in collapsed state", () => {
    render(<FindingCard finding={mockFinding} index={1} />);
    expect(screen.getByText("Checkout lacks trust signals")).toBeInTheDocument();
  });

  it("renders the theme tag", () => {
    render(<FindingCard finding={mockFinding} index={1} />);
    expect(screen.getByText("Checkout & Cart")).toBeInTheDocument();
  });

  it("shows full description when expanded", () => {
    render(<FindingCard finding={mockFinding} index={1} />);
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByText(/checkout page has no trust badges/)
    ).toBeInTheDocument();
  });

  it("shows Plus feature link when expanded", () => {
    render(<FindingCard finding={mockFinding} index={1} />);
    fireEvent.click(screen.getByRole("button"));
    const link = screen.getByText(/Checkout Extensibility/);
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://shopify.dev/docs/api/checkout-ui-extensions"
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run tests/components/FindingCard.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Implement FindingCard**

Create `src/components/FindingCard.tsx`:

```tsx
import { useState } from "react";
import type { Finding } from "../types/audit";
import { ThemeTag } from "./ThemeTag";
import { StarRating } from "./StarRating";

interface FindingCardProps {
  finding: Finding;
  index: number;
}

export function FindingCard({ finding, index }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-ap-popup overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 text-left flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="text-2xl font-bold tracking-tighter text-ap-red shrink-0">
          {String(index).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="font-bold tracking-tight text-lg">
              {finding.title}
            </h3>
            <ThemeTag theme={finding.theme} />
          </div>
          <StarRating value={finding.business_impact} label="Business Impact" />
        </div>
        <span className="text-ap-greyDark text-xl shrink-0">
          {expanded ? "\u2212" : "+"}
        </span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 pt-0 border-t border-gray-100">
          <div className="pl-12">
            <p className="text-black/70 leading-relaxed mt-4 mb-4">
              {finding.issue_description}
            </p>

            {finding.screenshot_url && (
              <img
                src={finding.screenshot_url}
                alt={`Screenshot: ${finding.title}`}
                className="rounded-lg border border-gray-200 mb-4 max-w-full"
              />
            )}

            {finding.evidence.length > 0 && (
              <ul className="list-disc list-inside text-sm text-black/60 mb-4 space-y-1">
                {finding.evidence.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}

            <a
              href={finding.plus_feature_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ap-green hover:text-ap-greenDark transition-colors"
            >
              Learn about {finding.plus_feature} on Shopify Plus &rarr;
            </a>

            <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
              <StarRating
                value={finding.user_impact}
                label="User Impact"
              />
              <StarRating
                value={finding.effort_to_fix}
                label="Effort to Fix"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run tests/components/FindingCard.test.tsx
```

Expected: PASS

- [ ] **Step 5: Implement FindingsList**

Create `src/components/FindingsList.tsx`:

```tsx
import type { Finding } from "../types/audit";
import { FindingCard } from "./FindingCard";

interface FindingsListProps {
  findings: Finding[];
}

export function FindingsList({ findings }: FindingsListProps) {
  return (
    <section className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold tracking-tighter mb-6">Findings</h2>
        <div className="space-y-4">
          {findings.map((finding, i) => (
            <FindingCard key={i} finding={finding} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git add src/components/FindingCard.tsx src/components/FindingsList.tsx tests/components/FindingCard.test.tsx
git commit -m "feat: add FindingCard and FindingsList with expand/collapse and tests"
```

---

### Task 8: ImpactTable and CallToAction Components

**Files:**
- Create: `src/components/ImpactTable.tsx`, `src/components/CallToAction.tsx`
- Test: `tests/components/ImpactTable.test.tsx`

- [ ] **Step 1: Write failing test for ImpactTable**

Create `tests/components/ImpactTable.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ImpactTable } from "../../src/components/ImpactTable";
import type { Finding } from "../../src/types/audit";

const mockFindings: Finding[] = [
  {
    title: "Finding A",
    theme: "Checkout & Cart",
    issue_description: "Desc A",
    business_impact: 5,
    user_impact: 4,
    effort_to_fix: 2,
    plus_feature: "Checkout Extensibility",
    plus_feature_link: "https://example.com",
    evidence: [],
  },
  {
    title: "Finding B",
    theme: "Content & UX",
    issue_description: "Desc B",
    business_impact: 3,
    user_impact: 3,
    effort_to_fix: 1,
    plus_feature: "Launchpad",
    plus_feature_link: "https://example.com",
    evidence: [],
  },
];

describe("ImpactTable", () => {
  it("renders a row for each finding", () => {
    render(<ImpactTable findings={mockFindings} />);
    expect(screen.getByText("Finding A")).toBeInTheDocument();
    expect(screen.getByText("Finding B")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<ImpactTable findings={mockFindings} />);
    expect(screen.getByText("Finding")).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Effort")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run tests/components/ImpactTable.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Implement ImpactTable**

Create `src/components/ImpactTable.tsx`:

```tsx
import type { Finding } from "../types/audit";
import { ThemeTag } from "./ThemeTag";

interface ImpactTableProps {
  findings: Finding[];
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-ap-red">
      {"★".repeat(count)}
      <span className="text-gray-300">{"★".repeat(5 - count)}</span>
    </span>
  );
}

export function ImpactTable({ findings }: ImpactTableProps) {
  return (
    <section className="px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold tracking-tighter mb-6">
          Impact Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 font-semibold tracking-tight">Finding</th>
                <th className="pb-3 font-semibold tracking-tight">Theme</th>
                <th className="pb-3 font-semibold tracking-tight">Business</th>
                <th className="pb-3 font-semibold tracking-tight">User</th>
                <th className="pb-3 font-semibold tracking-tight">Effort</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 font-medium">{f.title}</td>
                  <td className="py-3">
                    <ThemeTag theme={f.theme} />
                  </td>
                  <td className="py-3">
                    <Stars count={f.business_impact} />
                  </td>
                  <td className="py-3">
                    <Stars count={f.user_impact} />
                  </td>
                  <td className="py-3">
                    <Stars count={f.effort_to_fix} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run tests/components/ImpactTable.test.tsx
```

Expected: PASS

- [ ] **Step 5: Implement CallToAction**

Create `src/components/CallToAction.tsx`:

```tsx
interface CallToActionProps {
  ctaLink?: string;
}

export function CallToAction({ ctaLink }: CallToActionProps) {
  const bookingUrl = ctaLink || "https://www.askphill.com/contact";

  return (
    <section className="bg-black text-white px-6 py-16 md:px-12">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tighter mb-4">
          Ready to unlock these opportunities?
        </h2>
        <p className="text-white/70 mb-8 max-w-lg mx-auto">
          Let's discuss how Shopify Plus can help you convert more visitors
          into customers with the optimizations outlined in this audit.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-ap-red px-8 py-3 font-semibold text-white hover:bg-ap-redDark transition-colors tracking-tight"
          >
            Book a call with Ask Phill
          </a>
          <a
            href="https://www.shopify.com/plus"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-white/30 px-8 py-3 font-semibold text-white hover:bg-white/10 transition-colors tracking-tight"
          >
            Learn more about Shopify Plus
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run all tests**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run
```

Expected: all PASS

- [ ] **Step 7: Commit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git add src/components/ImpactTable.tsx src/components/CallToAction.tsx tests/components/ImpactTable.test.tsx
git commit -m "feat: add ImpactTable and CallToAction components with tests"
```

---

### Task 9: NotFound Component and AuditPage

**Files:**
- Create: `src/components/NotFound.tsx`, `src/pages/AuditPage.tsx`

- [ ] **Step 1: Implement NotFound**

Create `src/components/NotFound.tsx`:

```tsx
import { Logo } from "./Logo";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ap-greyLight px-6">
      <Logo className="h-10 mb-8" />
      <h1 className="text-2xl font-bold tracking-tighter mb-2">
        Audit not found
      </h1>
      <p className="text-ap-greyDark text-sm">
        This audit link may have expired or the ID is incorrect.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Implement AuditPage**

Create `src/pages/AuditPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { CroAudit } from "../types/audit";
import { fetchAudit } from "../lib/supabase";
import { Header } from "../components/Header";
import { ExecutiveSummary } from "../components/ExecutiveSummary";
import { FindingsList } from "../components/FindingsList";
import { ImpactTable } from "../components/ImpactTable";
import { CallToAction } from "../components/CallToAction";
import { NotFound } from "../components/NotFound";

export function AuditPage() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<CroAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetchAudit(id).then((data) => {
      if (data) {
        setAudit(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ap-greyLight">
        <div className="text-ap-greyDark text-sm">Loading audit...</div>
      </div>
    );
  }

  if (notFound || !audit) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-ap-greyLight">
      <Header
        clientName={audit.client_name}
        websiteUrl={audit.website_url}
        auditDate={audit.audit_date}
      />
      <ExecutiveSummary
        summary={audit.executive_summary}
        lighthouseScores={audit.lighthouse_scores}
        findings={audit.findings}
      />
      <FindingsList findings={audit.findings} />
      <ImpactTable findings={audit.findings} />
      <CallToAction ctaLink={audit.cta_link} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git add src/components/NotFound.tsx src/pages/AuditPage.tsx
git commit -m "feat: add AuditPage with data fetching and NotFound fallback"
```

---

### Task 10: App Router and Entry Point

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Modify: `index.html`

- [ ] **Step 1: Set up App with routing**

Replace `src/App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuditPage } from "./pages/AuditPage";
import { NotFound } from "./components/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:id" element={<AuditPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Set up main.tsx**

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 3: Update index.html title**

In `index.html`, change the `<title>` to:

```html
<title>CRO Audit | Ask Phill</title>
```

- [ ] **Step 4: Run dev server and verify it compiles**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vite --port 3456
```

Open http://localhost:3456/test-id in browser. Expected: "Audit not found" page (because Supabase is not configured yet). Verify no compile errors.

- [ ] **Step 5: Run all tests**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vitest run
```

Expected: all PASS

- [ ] **Step 6: Commit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git add src/App.tsx src/main.tsx index.html
git commit -m "feat: wire up router and entry point"
```

---

### Task 11: Dockerfile for Railway

**Files:**
- Create: `Dockerfile`, `.dockerignore`

- [ ] **Step 1: Create Dockerfile**

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 2: Create .dockerignore**

Create `.dockerignore`:

```
node_modules
dist
.env
.git
docs
tests
```

- [ ] **Step 3: Commit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git add Dockerfile .dockerignore
git commit -m "feat: add Dockerfile for Railway deployment"
```

---

### Task 12: Supabase Schema Setup

**Files:** None (SQL executed in Supabase dashboard or via CLI)

- [ ] **Step 1: Create the cro_audits table**

Run this SQL in the Supabase SQL editor at https://supabase.com/dashboard (project: `lbjnyktosnzccazdqaci`):

```sql
CREATE TABLE cro_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  lighthouse_scores JSONB,
  tech_stack JSONB,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  executive_summary TEXT,
  cta_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access (no auth needed to view audits)
ALTER TABLE cro_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON cro_audits
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert" ON cro_audits
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update" ON cro_audits
  FOR UPDATE USING (auth.role() = 'authenticated');
```

- [ ] **Step 2: Create the cro-screenshots storage bucket**

In Supabase dashboard, go to Storage and create a new bucket called `cro-screenshots` with public access enabled.

- [ ] **Step 3: Set up .env with real Supabase keys**

Copy `.env.example` to `.env` and fill in the anon key from the Supabase dashboard (Settings > API):

```
VITE_SUPABASE_URL=https://lbjnyktosnzccazdqaci.supabase.co
VITE_SUPABASE_ANON_KEY=<actual_anon_key>
```

- [ ] **Step 4: Insert a test audit record for development**

Run in Supabase SQL editor:

```sql
INSERT INTO cro_audits (id, client_name, website_url, audit_date, lighthouse_scores, tech_stack, findings, executive_summary, cta_link)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Store',
  'https://example-store.myshopify.com',
  '2026-04-08',
  '{"performance": 72, "accessibility": 85, "seo": 91, "best_practices": 78}'::jsonb,
  '{"theme": "Dawn 12.0", "apps": ["Klaviyo", "Judge.me"], "checkout_type": "standard", "payment_providers": ["Shopify Payments", "PayPal"], "analytics": ["GA4", "Meta Pixel"]}'::jsonb,
  '[
    {
      "title": "Checkout lacks trust signals and upsell opportunities",
      "theme": "Checkout & Cart",
      "issue_description": "The checkout uses Shopify''s standard template with no customization. There are no trust badges, no return policy summary, and no order bump or upsell offers. With Shopify Plus, Checkout Extensibility lets you add UI extensions for trust badges, custom banners, and in-checkout product offers that can increase AOV by 10-15%.",
      "business_impact": 5,
      "user_impact": 4,
      "effort_to_fix": 2,
      "plus_feature": "Checkout Extensibility",
      "plus_feature_link": "https://shopify.dev/docs/api/checkout-ui-extensions",
      "evidence": ["No trust badges in checkout", "No order bump offers", "Generic checkout branding only"]
    },
    {
      "title": "No bundle or gift-with-purchase logic",
      "theme": "Conversion Optimization",
      "issue_description": "The store has no product bundling, BOGO offers, or gift-with-purchase mechanics. These are proven conversion drivers. Shopify Functions and Cart Transform APIs on Plus enable server-side bundle pricing and automatic free gift injection without fragile JavaScript workarounds.",
      "business_impact": 4,
      "user_impact": 3,
      "effort_to_fix": 3,
      "plus_feature": "Shopify Functions",
      "plus_feature_link": "https://shopify.dev/docs/apps/build/functions",
      "evidence": ["No bundle products found", "No gift-with-purchase threshold messaging", "Cart has no automatic additions"]
    },
    {
      "title": "Mobile product page has poor scroll engagement",
      "theme": "Product Page (PDP)",
      "issue_description": "On mobile, product images take up the entire viewport with no visible price, title, or ATC button until scrolling. The buy box is below the fold. A sticky ATC bar would significantly reduce friction for mobile shoppers, who represent the majority of traffic.",
      "business_impact": 4,
      "user_impact": 5,
      "effort_to_fix": 1,
      "plus_feature": "Checkout Extensibility",
      "plus_feature_link": "https://shopify.dev/docs/api/checkout-ui-extensions",
      "evidence": ["ATC button not visible without scrolling on mobile", "No sticky buy bar", "Product images consume full viewport"]
    },
    {
      "title": "No personalization or customer segmentation",
      "theme": "ICC & Personalization",
      "issue_description": "The store shows the same content to all visitors regardless of behavior, location, or purchase history. Shopify Plus''s higher API rate limits enable integration with CDPs and personalization engines that can serve dynamic product recommendations, personalized promotions, and tailored landing pages.",
      "business_impact": 3,
      "user_impact": 4,
      "effort_to_fix": 4,
      "plus_feature": "Higher API Rate Limits",
      "plus_feature_link": "https://shopify.dev/docs/api/usage/rate-limits",
      "evidence": ["Same homepage for all visitors", "No recently viewed or recommended sections", "No geo-targeted content"]
    },
    {
      "title": "Slow page load impacting mobile conversion",
      "theme": "Technical Infrastructure",
      "issue_description": "Lighthouse performance score of 72 indicates significant room for improvement. LCP is above 3 seconds on mobile. Multiple render-blocking scripts from third-party apps are delaying first paint. Core Web Vitals optimization is critical since every second of load time costs approximately 7% in conversion.",
      "business_impact": 4,
      "user_impact": 4,
      "effort_to_fix": 3,
      "plus_feature": "Checkout Extensibility",
      "plus_feature_link": "https://shopify.dev/docs/api/checkout-ui-extensions",
      "evidence": ["Lighthouse performance: 72", "LCP > 3s on mobile", "6 render-blocking third-party scripts"]
    }
  ]'::jsonb,
  'This audit of Test Store reveals five key optimization opportunities that could meaningfully improve conversion rates. The biggest structural issues are in checkout (no trust signals or upsells), mobile UX (buy box below the fold), and page performance (72 Lighthouse score). Several of these improvements are unlocked or significantly enhanced by Shopify Plus features, particularly Checkout Extensibility and Shopify Functions.',
  'https://www.askphill.com/contact'
);
```

- [ ] **Step 5: Verify the dev app loads the test audit**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx vite --port 3456
```

Open http://localhost:3456/00000000-0000-0000-0000-000000000001 in browser. Expected: fully rendered audit page with header, Lighthouse gauges, 5 expandable finding cards, impact table, and CTA.

---

### Task 13: Deploy to Railway

- [ ] **Step 1: Create Railway project**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx @railway/cli login
npx @railway/cli init
```

Follow prompts to create a new project.

- [ ] **Step 2: Set environment variables on Railway**

```bash
npx @railway/cli variables set VITE_SUPABASE_URL=https://lbjnyktosnzccazdqaci.supabase.co
npx @railway/cli variables set VITE_SUPABASE_ANON_KEY=<actual_anon_key>
```

Note: Vite bakes env vars into the build at compile time, so these must be set before deploying.

- [ ] **Step 3: Deploy**

```bash
cd /Users/benrosenberg/shopify-cro-audit
npx @railway/cli up
```

- [ ] **Step 4: Verify the deployed app**

Open the Railway-provided URL + `/00000000-0000-0000-0000-000000000001` in browser. Expected: same fully rendered audit page as local dev.

- [ ] **Step 5: Commit any deployment config changes**

```bash
cd /Users/benrosenberg/shopify-cro-audit
git add -A
git commit -m "chore: add Railway deployment configuration"
```

---

## Phase B: Claude Code Skill

### Task 14: Create the SKILL.md

**Files:**
- Create: `/Users/benrosenberg/phillbert/.claude/skills/shopify-plus-cro-audit/SKILL.md`

- [ ] **Step 1: Write the skill file**

Create `/Users/benrosenberg/phillbert/.claude/skills/shopify-plus-cro-audit/SKILL.md` with the full skill definition. The content of this file is the entire skill spec from the design document (Part 1), reformatted as a SKILL.md with frontmatter. This is a large file; the full content is provided below.

```markdown
---
name: shopify-plus-cro-audit
description: External CRO audit for Shopify merchants not yet on Plus, as part of the Shopify Plus sales partnership. Scrapes the live site, runs Lighthouse, detects tech stack, and produces 5-7 findings tied to Plus-exclusive features. Outputs to Notion (Shopify CRO Audits database) and Supabase (for the branded web app). Trigger when the user says "Plus CRO audit", "Shopify Plus audit", "partnership CRO audit", "audit [URL] for Plus", or mentions auditing a store for the Shopify sales partnership.
---

# Shopify Plus CRO Audit

External CRO audit skill for the Shopify Plus sales partnership. Audits non-Plus Shopify stores purely by scraping the live site and ties each finding to a Plus-exclusive feature.

## Context

Ask Phill partners with Shopify's EMEA sales team to accelerate Plus adoption. Shopify sends pre-qualified merchants (1M+ EUR revenue). Ask Phill delivers a complimentary CRO audit that demonstrates value and shows what Plus features would unlock.

**Key constraints:**
- No access to admin, GA4, Clarity, or any internal merchant data
- All data collection is external (browsing, Lighthouse, DOM inspection)
- Produce 5-7 findings, each naturally tied to a Plus feature
- Output is a near-complete draft for Ben to review before sharing

## Allowed Tools

- The `playwright-cli` skill (browse site, screenshots, DOM inspection)
- Chrome DevTools MCP tools (`lighthouse_audit`, `take_screenshot`, `evaluate_script`, `navigate_page`, `take_snapshot`)
- `WebFetch` (page source for tech stack detection)
- All `claude.ai Notion` MCP tools (push to Shopify CRO Audits database)
- `Bash` (for Supabase data push via curl)

## Workflow

### Step 0: Collect Input

Ask the user for:
1. **Store URL** (required)
2. **Client name** (optional; infer from the site if not provided)

### Phase 1: Discovery and Data Collection

#### 1a: Site Browsing (Playwright)

Use the `playwright-cli` skill to browse the site as a real shopper. Navigate to each page, take snapshots and screenshots.

```bash
playwright-cli open <store-url>
playwright-cli snapshot
playwright-cli screenshot --filename=homepage.png
```

Audit these key pages:
1. **Homepage**: value prop, navigation, trust signals, CTA visibility, announcement bar
2. **Top 2-3 collection pages**: product grid, filtering, product card info
3. **Product page (top 2-3 products)**: images, descriptions, price, ATC prominence, reviews, cross-sells
4. **Cart page/drawer**: upsells, shipping info, trust badges, checkout CTA
5. **Search experience**: visibility, autocomplete, results quality
6. **Mobile experience**: same pages at mobile viewport, touch targets, sticky CTAs

Screenshot each page for the branded report.

CRO issues to look for (reference `references/examples/cro-audit-summum.md` for detailed UX best practices):
- Missing or weak CTAs above the fold
- No urgency/scarcity elements
- Poor mobile experience (tiny buttons, horizontal scroll)
- Missing trust signals (reviews, badges, return policy)
- No cross-sell/upsell on product or cart pages
- Unclear shipping costs or return policy
- Poor product imagery or sparse descriptions
- Empty collection pages
- Broken URLs or redirect chains

#### 1b: Lighthouse Audit (Chrome DevTools MCP)

Run Lighthouse on homepage and one PDP:
- Performance score (LCP, FID, CLS, TTFB)
- Accessibility score
- SEO score
- Best Practices score

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

Map observations into 5-7 findings. Each finding must:

1. Be categorized by **Theme**: Checkout & Cart, Product Discovery, Product Page (PDP), ICC & Personalization, Conversion Optimization, Content & UX, Technical Infrastructure, Data & Analytics

2. Have **impact and effort scores** (1-5 each): Business Impact, User Impact, Effort to Fix

3. **Naturally reference the Plus feature** that addresses it (woven into the description, not a separate section), with a link to Shopify documentation

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

#### 3a: Notion (Shopify CRO Audits Database)

Create an entry in `https://www.notion.so/ask-phill/33c5f35473528047a7f3c8f5d451cc07`:

**Properties:**
- Project name: "[Client Name] CRO Audit"
- Client: client name
- Website: store URL
- Status: "In progress"
- Priority: based on overall opportunity size
- Start date: audit date

**Page body:** For each finding (5-7):
- Heading with finding title
- Tags inline: Theme, Business Impact, User Impact, Effort to Fix
- Issue Description with Plus feature recommendation woven naturally
- Notes with additional context and evidence

#### 3b: Supabase (Web App Data)

Push audit data to the `cro_audits` table in Supabase (`lbjnyktosnzccazdqaci.supabase.co`). Use curl via Bash:

```bash
curl -X POST "https://lbjnyktosnzccazdqaci.supabase.co/rest/v1/cro_audits" \
  -H "apikey: <SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <SUPABASE_SERVICE_KEY>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '<JSON payload>'
```

The JSON payload must match this structure:
```json
{
  "client_name": "string",
  "website_url": "string",
  "audit_date": "YYYY-MM-DD",
  "lighthouse_scores": {"performance": 0, "accessibility": 0, "seo": 0, "best_practices": 0},
  "tech_stack": {"theme": "", "apps": [], "checkout_type": "", "payment_providers": [], "analytics": []},
  "findings": [{"title": "", "theme": "", "issue_description": "", "business_impact": 0, "user_impact": 0, "effort_to_fix": 0, "plus_feature": "", "plus_feature_link": "", "screenshot_url": "", "evidence": []}],
  "executive_summary": "string",
  "cta_link": "https://www.askphill.com/contact"
}
```

Upload screenshots to Supabase Storage bucket `cro-screenshots` and reference the public URLs in the findings.

#### 3c: Return Shareable URL

After pushing to Supabase, the response includes the `id`. Return the shareable URL:
`<RAILWAY_APP_URL>/{id}`

Tell Ben the audit is ready for review.

### Phase 4: Follow-up

After presenting the report, offer to:
1. Deep-dive into any specific finding
2. Adjust impact/effort scores based on Ben's judgment
3. Update the Notion page or Supabase data
4. Re-audit after changes are made
```

- [ ] **Step 2: Commit in phillbert repo**

```bash
cd /Users/benrosenberg/phillbert
git add .claude/skills/shopify-plus-cro-audit/SKILL.md
git commit -m "feat: add shopify-plus-cro-audit skill for Shopify Plus sales partnership"
```

---

### Task 15: Update Phillbert CLAUDE.md

**Files:**
- Modify: `/Users/benrosenberg/phillbert/CLAUDE.md`

- [ ] **Step 1: Add the new skill to the Available Skills table**

In `/Users/benrosenberg/phillbert/CLAUDE.md`, add a new row to the Available Skills table:

```
| `shopify-plus-cro-audit` | External CRO audit for Shopify Plus sales partnership (scrape-only, no admin access) |
```

- [ ] **Step 2: Commit**

```bash
cd /Users/benrosenberg/phillbert
git add CLAUDE.md
git commit -m "docs: add shopify-plus-cro-audit to available skills list"
```

---

## Self-Review Checklist

1. **Spec coverage:** All sections covered. Web app (Part 2): Tasks 1-13. Skill (Part 1): Task 14. Notion DB, Supabase schema, Railway deploy, brand identity, all addressed.
2. **Placeholder scan:** No TBDs in code. Supabase anon key is left as `<actual_anon_key>` because it's a real secret; instructions say to get it from the dashboard.
3. **Type consistency:** `CroAudit`, `Finding`, `FindingTheme`, `LighthouseScores`, `TechStack` types are used consistently across all components, the Supabase fetch function, and the skill's JSON payload spec.
