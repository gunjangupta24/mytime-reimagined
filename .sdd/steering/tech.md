# Technology Stack

## Architecture

Single-page application (SPA) with client-side state management. No backend server for the POC — all data is mock/static JSON bundled with the app. Designed for deployment on Vercel via v0.app with one-click publish.

## Core Technologies

- **Language**: TypeScript (strict mode)
- **Framework**: Next.js 15 (App Router)
- **UI Library**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS v4
- **Runtime**: Node.js 20+ (build only, no server runtime needed for POC)

## Key Libraries

- **Recharts** — lightweight charting for dashboard (hours breakdown, trends)
- **date-fns** — date manipulation for period calculations, weekday detection
- **lucide-react** — icon set (consistent with shadcn/ui)
- **framer-motion** — subtle animations for mobile transitions and feedback

## Development Standards

### Type Safety
- TypeScript strict mode, no `any` types
- All component props typed with explicit interfaces
- Mock data typed with shared domain models

### Code Quality
- ESLint with Next.js recommended rules
- Prettier for formatting
- Component-per-file convention

### Testing
- Not required for POC phase
- Future: Vitest + React Testing Library

## Development Environment

### Required Tools
- Node.js 20+
- v0.app account (free tier sufficient for POC)
- Vercel account (free tier for hosting)

### Common Commands
```bash
# Dev: npx next dev
# Build: npx next build
# Deploy: one-click via v0 or `vercel deploy`
```

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| No backend | Client-side only | POC is UX-focused; mock data is sufficient for leadership demo |
| shadcn/ui | Over Material UI, Chakra | Best v0 integration, modern aesthetic, copy-paste ownership |
| Next.js App Router | Over Pages Router | Latest standard, better layouts, future-ready |
| Recharts | Over Chart.js, D3 | React-native API, lightweight, good enough for dashboard charts |
| Vercel hosting | Over Azure, Netlify | Seamless v0 integration, instant deploy, free tier |

---
_Document standards and patterns, not every dependency_
