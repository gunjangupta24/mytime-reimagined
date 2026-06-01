# Implementation Plan

## Build Strategy

This POC is built on **v0.app** using natural-language prompts and Design Mode. Tasks below are ordered as v0 prompts and manual refinements. Each task produces a shippable increment.

---

## Tasks

- [ ] 1. Project Setup & Design Tokens
- [ ] 1.1 Create a new v0 project with Next.js + shadcn/ui (P)
  - Initialize project on v0.app
  - Configure Tailwind with McKinsey design tokens (navy #003A6B primary, category colors)
  - Set up Inter font and tabular-nums for hour displays
  - Observable: project loads with correct branding in v0 preview
  - _Requirements: 9_

- [ ] 1.2 Create AppShell layout with responsive navigation (P)
  - Top nav bar (desktop): logo, "Timesheet" and "Dashboard" tabs, user avatar
  - Bottom tab bar (mobile <768px): Timesheet, Dashboard, Profile icons
  - Main content area with proper padding
  - Observable: navigation switches between routes; bottom nav visible on mobile, top nav on desktop
  - _Requirements: 6, 9_

- [ ] 2. Mock Data Layer
- [ ] 2.1 Create mock charge codes and user data (P)
  - `data/charge-codes.json` with 10-15 codes across grow/run/non-billable categories
  - `data/mock-allocations.ts` with sample filled timesheet for one period
  - `data/mock-history.ts` with 4 past periods of sample data for trend chart
  - `data/mock-calendar.ts` with 15-20 fake meetings mapped to charge codes
  - Type definitions in `types/`
  - Observable: data imports successfully with TypeScript types
  - _Requirements: 1, 3, 4, 5_

- [ ] 3. Timesheet Grid (Core Screen)
- [ ] 3.1 Build PeriodSelector component
  - Toggle between Weekly / Semi-Monthly
  - Forward/back arrows to navigate periods
  - Display current period label (e.g., "Jun 1 – Jun 15, 2026")
  - Highlight current period badge
  - Observable: toggling changes the date columns; navigation updates dates
  - _Requirements: 2_

- [ ] 3.2 Build TimesheetGrid with editable cells
  - Rows = charge codes (code + project name + category color dot)
  - Columns = weekdays for the selected period (5 for weekly, 10-11 for semi-monthly)
  - Weekend columns greyed out and non-editable
  - Each cell is an inline editable number input (0-24, integers only)
  - Column footer shows daily totals; row end shows code totals
  - "Add Charge Code" button at bottom of grid
  - "Remove" action per row
  - Observable: editing a cell updates totals in real-time; weekends are locked
  - _Requirements: 1, 7_

- [ ] 3.3 Build ChargeCodePicker
  - Triggered by "Add Charge Code" button
  - Modal/sheet with search input at top
  - Codes grouped by category (Grow / Run / Non-Billable) with collapsible sections
  - Each code shows code + project name
  - Recently used / favorites section at top
  - Prevents adding duplicates (shows "Already added" badge)
  - Observable: searching filters codes; selecting adds a new row to the grid
  - _Requirements: 3_

- [ ] 3.4 Build visual validation and warnings
  - Cell border turns amber when daily total < 7
  - Cell border turns red when daily total > 7
  - Cell border turns green when daily total = 7
  - Column header shows a status dot (green/amber/red) per day
  - Observable: changing hours triggers real-time color updates
  - _Requirements: 7_

- [ ] 3.5 Build SubmitBar with recall
  - Fixed bar at bottom of grid showing: status badge (Draft/Submitted/Approved), Submit button, Recall button
  - Submit shows confirmation dialog with total hours summary per code
  - After submit, status changes to "Submitted" and grid becomes read-only
  - Recall button (visible when Submitted) reverts to Draft with timestamp log
  - Observable: full submit → recall → re-edit cycle works
  - _Requirements: 7, 8_

- [ ] 4. Quick Actions
- [ ] 4.1 Implement Fill Defaults, Copy Last Period, Clear All, Apply to Week
  - "Fill Defaults" distributes 7h/day across user's default codes
  - "Copy Last Period" loads the previous period's allocations
  - "Clear All" resets with confirmation dialog
  - "Apply to Week" on a single cell copies that value across all weekdays for that code
  - Observable: each action correctly modifies the grid and totals update
  - _Requirements: 10_

- [ ] 5. Calendar Sync (Mock)
- [ ] 5.1 Build CalendarSyncPanel
  - "Sync Calendar" button in the grid toolbar
  - On click, shows loading spinner for 1.5s (simulated)
  - Displays a list of mock meetings with proposed charge code mapping
  - Each proposal has Accept / Reject buttons
  - "Accept All" and "Reject All" bulk actions
  - Accepted proposals populate the grid
  - Observable: sync loads mock data, accepting proposals fills grid cells
  - _Requirements: 4_

- [ ] 6. Dashboard Screen
- [ ] 6.1 Build StatusCard
  - Large status badge showing current period status (Draft / Submitted / Approved)
  - Period label and date range below
  - Observable: status reflects the current timesheet state
  - _Requirements: 5_

- [ ] 6.2 Build HoursDonutChart
  - Recharts PieChart with one slice per charge code
  - Colors match charge code category
  - Center label showing total hours
  - Legend with code names and percentages
  - Observable: chart renders with correct proportions from mock data
  - _Requirements: 5_

- [ ] 6.3 Build TrendChart
  - Recharts stacked BarChart showing 4 past periods
  - Each bar segment represents a charge code
  - X-axis: period labels; Y-axis: hours
  - Observable: chart shows 4 bars with correct stacking
  - _Requirements: 5_

- [ ] 6.4 Build QuickActions card
  - "Fill This Week" and "Copy Last Period" buttons (same logic as grid quick actions)
  - Links back to timesheet grid after action
  - Observable: clicking action navigates to grid with populated data
  - _Requirements: 5, 10_

- [ ] 7. Mobile Responsiveness
- [ ] 7.1 Build MobileDayView with DayCards
  - Below 768px, replace TimesheetGrid with card-based view
  - One card per day showing: day name, date, charge codes with hour inputs, daily total
  - Swipe left/right to navigate between days (framer-motion)
  - Day indicator dots at top (like iOS page dots)
  - Observable: swiping navigates days; editing hours in cards updates totals
  - _Requirements: 6_
  - _Boundary: MobileDayView, DayCard_

- [ ] 7.2 Mobile dashboard layout
  - Stack StatusCard, DonutChart, TrendChart, QuickActions vertically
  - Full-width charts on mobile
  - Observable: dashboard is fully usable on 375px viewport
  - _Requirements: 5, 6_

- [ ] 8. Polish & Deploy
- [ ] 8.1 Dark mode support (P)
  - Implement dark mode toggle in nav
  - All components respect dark/light tokens
  - Observable: toggling switches all surfaces, text, and charts
  - _Requirements: 9_

- [ ] 8.2 Animations and transitions (P)
  - Page transition animations between Timesheet and Dashboard
  - Modal/sheet open-close animations
  - Mobile swipe physics
  - Observable: transitions are smooth (60fps) and feel native
  - _Requirements: 9_

- [ ] 8.3 Deploy to Vercel
  - One-click deploy from v0
  - Verify all screens work on the live URL
  - Test on mobile device (iPhone/Android)
  - Share URL with stakeholders
  - Observable: live Vercel URL loads all screens correctly on desktop and mobile
  - _Requirements: 9_
