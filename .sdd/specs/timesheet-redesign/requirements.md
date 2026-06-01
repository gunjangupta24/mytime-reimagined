# Requirements Document

## Introduction

This document captures requirements for the MyTime Reimagined POC — a modern, mobile-responsive timesheet UI that addresses 15 identified pain points with the current Infor CloudSuite Extensity (MyTime) system. The POC targets a leadership demo using mock data, demonstrating what a next-generation timesheet experience could look like for the firm.

## Boundary Context

- **In scope**: Frontend UI/UX for timesheet entry, dashboard visualization, mobile responsiveness, and mock calendar sync flow
- **Out of scope**: Backend APIs, real authentication/SSO, actual Outlook calendar integration, MyTime upload/import, approval workflow backend, multi-user support, real charge code validation against firm systems
- **Adjacent expectations**: The existing `smart_timesheet_assistant` Python tool handles actual `.xlsx` generation and MyTime upload. This POC is a UI layer that could eventually replace the MyTime web interface, with the Python tool as a potential backend.

## Requirements

### Requirement 1: Fast Timesheet Grid Entry
**Objective:** As a consultant, I want to enter my hours in an editable grid with smart defaults, so that I can complete my timesheet in under 2 minutes instead of 10+.

#### Acceptance Criteria
1. The system shall display a grid with charge codes as rows and days as columns for the selected period
2. When a user opens a new timesheet, the system shall pre-populate their default charge codes from saved preferences
3. The system shall provide a "Fill Defaults" action that distributes 7 hours/day across default charge codes
4. When a cell is tapped/clicked, the system shall allow inline numeric editing (0-24 range)
5. The system shall display column totals (daily) and row totals (per charge code) that update in real-time
6. When a daily total does not equal 7 hours, the system shall display a visual warning (amber for under, red for over)
7. The system shall never allow hour entry on Saturday or Sunday columns (greyed out, non-editable)

### Requirement 2: Period Selection and Navigation
**Objective:** As a consultant, I want to easily switch between weekly and semi-monthly periods and navigate to past/future periods, so that I can quickly find the timesheet I need to fill.

#### Acceptance Criteria
1. The system shall provide a toggle between "Weekly" and "Semi-Monthly" period formats
2. When semi-monthly is selected, the system shall show periods as 1st–15th and 16th–end-of-month
3. When weekly is selected, the system shall show Monday-through-Sunday periods
4. The system shall provide forward/back navigation arrows to move between periods
5. The system shall highlight the current active period and default to it on load

### Requirement 3: Charge Code Management
**Objective:** As a consultant, I want a searchable, grouped charge code picker that remembers my frequent codes, so that I don't waste time hunting for the right code every period.

#### Acceptance Criteria
1. The system shall provide an "Add Charge Code" action on the timesheet grid
2. When triggered, the system shall display a searchable dropdown/modal with all available charge codes
3. Charge codes shall be grouped by category: Product Grow, Product Run, Non-Billable
4. Each charge code shall display both the code and the human-readable project name
5. The system shall show recently-used and favorite charge codes at the top of the picker
6. The system shall allow removing a charge code row from the timesheet grid

### Requirement 4: Calendar Sync Concept (Mock)
**Objective:** As a consultant, I want the system to read my Outlook calendar and propose hour allocations based on my meetings, so that I don't have to manually cross-reference my calendar.

#### Acceptance Criteria
1. The system shall display a "Sync Calendar" button on the timesheet grid
2. When clicked, the system shall simulate loading meetings from a mock calendar dataset
3. The system shall display proposed allocations mapped from meeting titles to charge codes
4. The system shall allow the user to accept, modify, or reject each proposed allocation
5. After accepting proposals, the system shall populate the grid with the suggested hours

### Requirement 5: Hours Dashboard
**Objective:** As a consultant, I want a dashboard showing my hours breakdown, trends, and submission status, so that I have visibility into how I'm spending my time.

#### Acceptance Criteria
1. The system shall display the current period's submission status (Draft, Submitted, Approved)
2. The system shall show a donut or bar chart breaking down hours by charge code for the current period
3. The system shall display a trend chart showing hours distribution across the last 4 periods
4. The system shall provide quick-action buttons: "Fill This Week" and "Copy Last Period"
5. When "Copy Last Period" is clicked, the system shall duplicate the previous period's charge codes and hour allocations into the current period

### Requirement 6: Mobile-Responsive Experience
**Objective:** As a consultant, I want to fill my timesheet from my phone between meetings, so that I'm not tied to a desktop to complete this task.

#### Acceptance Criteria
1. On viewports below 768px, the timesheet grid shall transform into a card-based day view
2. The mobile view shall allow swiping left/right to navigate between days
3. Each day card shall list charge codes with editable hour inputs and a daily total
4. The system shall provide a bottom navigation bar with tabs: Timesheet, Dashboard, Profile
5. All touch targets shall be minimum 44x44px for accessibility
6. The mobile view shall support pull-to-refresh gesture for calendar sync

### Requirement 7: Visual Feedback and Error Prevention
**Objective:** As a consultant, I want clear visual cues when something is wrong with my entry, so that I don't submit incorrect timesheets.

#### Acceptance Criteria
1. The system shall color-code charge codes by category (e.g., blue for grow, green for run, grey for non-billable)
2. When a daily total is below 7 hours, the system shall show an amber warning indicator
3. When a daily total exceeds 7 hours, the system shall show a red warning indicator
4. When all days in a period are correctly filled, the system shall show a green "Ready to Submit" state
5. The system shall display a confirmation dialog before submission, showing a summary of total hours and charge code distribution

### Requirement 8: Timesheet Recall (Mock)
**Objective:** As a consultant, I want to recall a submitted timesheet to fix mistakes without emailing the admin team, so that I can self-service corrections.

#### Acceptance Criteria
1. When a timesheet is in "Submitted" status, the system shall display a "Recall" button
2. When recall is triggered, the system shall show a confirmation dialog explaining the action
3. After recall, the timesheet status shall revert to "Draft" and become editable again
4. The system shall log the recall action with a timestamp (displayed in status history)

### Requirement 9: Modern Visual Design
**Objective:** As a leadership stakeholder, I want the POC to demonstrate a modern, polished UI that reflects the firm's brand, so that I can envision this as a firm-wide tool.

#### Acceptance Criteria
1. The system shall use a clean, modern design language consistent with McKinsey branding (navy blue #003A6B as primary)
2. The system shall use professional typography with clear hierarchy (headings, labels, data)
3. The system shall include subtle animations for transitions (page navigation, modal open/close, status changes)
4. The system shall support both light and dark mode
5. The system shall render crisply on high-DPI (Retina) displays

### Requirement 10: Quick Actions and Shortcuts
**Objective:** As a consultant, I want one-tap shortcuts for common actions, so that repetitive tasks are eliminated.

#### Acceptance Criteria
1. The system shall provide a "Fill Defaults" button that applies the user's standard allocation across all weekdays
2. The system shall provide a "Copy Last Period" button that replicates the previous period's allocation
3. The system shall provide a "Clear All" button with confirmation to reset the current period
4. When the user enters hours for one charge code on one day, the system shall allow "Apply to Week" to copy that value across all weekdays for that code

---

_15 user-reported pain points mapped to 10 structured requirements. Remaining pain points (SSO friction, upload process, approval opacity) are captured as out-of-scope items addressed by the mock recall flow and noted for future phases._
