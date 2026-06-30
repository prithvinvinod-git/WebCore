# WebCore

> Your Website's Complete Diagnostic Brain -- Security, Visibility, Performance, AI Readiness.

[![WebCore](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel)](https://vercel.com)

---

## Overview

WebCore is a full-stack website diagnostic platform that scans any URL across **8 critical dimensions** and produces instant, in-depth reports. Each scan evaluates:

| Module | Checks |
|--------|--------|
| **Security** | 150+ checks -- security headers, TLS config, CVE detection, secret leaks, backdoor services |
| **SEO** | 80+ checks -- meta tags, structured data, Core Web Vitals (LCP, INP, CLS), indexability |
| **AEO** | 60+ checks -- AI crawler access, llms.txt, extractability, LLM engine matrix |
| **Performance** | Lighthouse estimation, TTFB, compression, render-blocking resources, resource hints |
| **Indexing** | Robots.txt, XML sitemaps, canonical URLs, hreflang, SPA rendering, crawl budget |
| **AI Readiness** | LLM-friendliness, voice search readiness, semantic HTML, machine readability |
| **Domain Health** | DNS records, TLS certificate, email security (SPF/DKIM/DMARC/BIMI), uptime, redirects |
| **Accessibility** | WCAG checks, alt text, ARIA usage, heading hierarchy, color contrast, screen reader assessment |

Results are scored 0-100 with letter grades (A-F). AI-powered remediation provides actionable fix suggestions for every finding.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **UI** | React 19, Framer Motion 12, Lucide Icons |
| **Charts** | Recharts 3 |
| **State** | Zustand 5, TanStack React Query 5 |
| **Forms** | react-hook-form + Zod 4 |
| **Auth** | Firebase Authentication (email/password, Google, GitHub) |
| **Database** | Firestore (via Firebase Admin SDK) |
| **AI** | Google Genkit + Gemini |
| **Scraping** | Cheerio, Node.js TLS/DNS |

---

## Features

- **8-Module Diagnostic Scan** -- Run a complete website audit in seconds
- **AI Remediation** -- Get AI-generated fix suggestions for every finding
- **Historical Trending** -- Track score changes over time
- **Competitor Benchmarking** -- Compare your site against competitors
- **Monitoring & Alerts** -- Schedule recurring scans and receive webhook notifications
- **REST API** -- Integrate scans into your own tooling
- **Report Export** -- Download detailed scan reports
- **Team Collaboration** -- Organization support with shared dashboards

---

## Prerequisites

- Node.js 20+
- npm
- Firebase project (Authentication + Firestore)
- Google Gemini API key (for AI remediation)

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/webcore.git
cd webcore

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Admin SDK (server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Google GenAI / Gemini (for AI remediation)
GOOGLE_GENAI_API_KEY=your-genai-api-key

# Firebase Web SDK (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Firestore Indexes

A composite index is required on the `scans` collection for filtered queries:

- Collection: `scans`
- Fields: `userId` (ASC), `createdAt` (DESC)

Deploy with:

```bash
npx firebase deploy --only firestore:indexes
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
  app/
    api/v1/          -- REST API routes (scan, user, auth, monitor, benchmark, cron)
    dashboard/       -- Dashboard pages (overview, history, settings, monitor, benchmark)
    auth/            -- Login and signup pages
    pricing/         -- Pricing page
    docs/            -- Documentation page
    page.tsx         -- Landing page
  components/
    layout/          -- Nav, sidebar, landing-nav, footer
    ui/              -- Reusable UI primitives (button, card, badge, input, tabs, etc.)
    block/           -- Page sections (features, docs-section, CurvedLoop)
  lib/
    firebase.ts      -- Firebase Admin SDK initialization
    firestore-service.ts -- Firestore CRUD operations
    auth-context.tsx  -- Firebase Auth client context
    session.ts       -- Server-side session cookie management
  scanner/
    modules/         -- 8 scanner modules (security, seo, aeo, performance, etc.)
    pipeline/        -- Scan orchestrator
    lib/             -- HTTP client, DNS, TLS utilities
  store/             -- Zustand state stores
  types/             -- TypeScript type definitions
```

---

## API Overview

All API routes are prefixed with `/api/v1`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/scan` | POST | Run a new scan |
| `/scan` | GET | List scans |
| `/scan/:id` | GET | Get scan details |
| `/scan/:id/remediate` | POST | Get AI remediation for findings |
| `/scan/:id/report` | GET | Export scan report |
| `/monitor` | POST | Create a monitoring schedule |
| `/benchmark` | POST | Run competitor benchmark |
| `/user` | GET/PATCH | User profile |
| `/auth/session` | GET/POST/DELETE | Session management |
| `/health` | GET | Health check |

Authentication for programmatic access is via API keys (`x-api-key` header).

---

## Deployment

The project is configured for deployment on Vercel.

```bash
npm run build    # builds to .next/
vercel deploy    # deploys to Vercel
```

Cron jobs are configured via Vercel Cron Jobs (`vercel.json`):
- Daily cleanup and maintenance: 06:00 UTC

---

## License

[MIT](LICENSE) -- Copyright (c) 2026 Prithvin Vinod

---

Built with Next.js, Firebase, and TypeScript.
