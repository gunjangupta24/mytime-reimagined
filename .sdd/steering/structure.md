# Project Structure

## Organization Philosophy

Feature-first organization. Each major screen is a route with co-located components. Shared UI primitives, data models, and mock data live in dedicated directories. Flat hierarchy — no nesting deeper than 3 levels.

## Directory Patterns

### App Routes
**Location**: `app/`
**Purpose**: Next.js App Router pages — one folder per route/screen
**Example**: `app/timesheet/page.tsx`, `app/dashboard/page.tsx`

### Feature Components
**Location**: `components/[feature]/`
**Purpose**: Components scoped to a specific screen/feature
**Example**: `components/timesheet/TimesheetGrid.tsx`, `components/dashboard/HoursChart.tsx`

### Shared UI
**Location**: `components/ui/`
**Purpose**: shadcn/ui primitives and shared design system components
**Example**: `components/ui/button.tsx`, `components/ui/card.tsx`

### Layout Components
**Location**: `components/layout/`
**Purpose**: App shell, navigation, responsive wrappers
**Example**: `components/layout/AppShell.tsx`, `components/layout/BottomNav.tsx`

### Data Layer
**Location**: `data/`
**Purpose**: Mock JSON data and typed data access functions
**Example**: `data/charge-codes.json`, `data/mock-allocations.ts`

### Domain Types
**Location**: `types/`
**Purpose**: Shared TypeScript interfaces and type definitions
**Example**: `types/timesheet.ts`, `types/charge-code.ts`

### Hooks
**Location**: `hooks/`
**Purpose**: Custom React hooks for state management and business logic
**Example**: `hooks/useTimesheet.ts`, `hooks/useChargeCodes.ts`

### Utilities
**Location**: `lib/`
**Purpose**: Pure utility functions (date helpers, formatters, validators)
**Example**: `lib/date-utils.ts`, `lib/hour-validator.ts`

## Naming Conventions

- **Files**: kebab-case for utilities and data (`date-utils.ts`), PascalCase for components (`TimesheetGrid.tsx`)
- **Components**: PascalCase (`TimesheetGrid`, `HoursChart`)
- **Functions/hooks**: camelCase (`useTimesheet`, `formatPeriodLabel`)
- **Types/interfaces**: PascalCase (`TimesheetPeriod`, `ChargeCode`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_DAILY_HOURS`, `DEFAULT_CITY`)

## Import Organization

```typescript
import { useState } from 'react'           // React
import { Card } from '@/components/ui/card' // UI primitives
import { TimesheetGrid } from '@/components/timesheet/TimesheetGrid' // Features
import { useTimesheet } from '@/hooks/useTimesheet'                  // Hooks
import { formatDate } from '@/lib/date-utils'                        // Utilities
import type { TimesheetPeriod } from '@/types/timesheet'             // Types
```

**Path Aliases**:
- `@/`: Maps to project root (`src/` or root depending on v0 config)

## Code Organization Principles

- Components own their layout; parents own their data
- Hooks encapsulate state + logic; components are presentation + interaction
- Mock data is imported as typed constants — no fetch calls in POC
- No prop drilling beyond 2 levels — use hooks or context for deep state

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
