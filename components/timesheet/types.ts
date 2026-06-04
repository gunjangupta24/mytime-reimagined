export type Category = 'grow' | 'run' | 'non-billable'

export interface ChargeCode {
  id: string
  code: string
  description: string
  category: Category
  location?: string
}

export type PeriodType = 'weekly' | 'semi-monthly'

export type TimesheetStatus = 'draft' | 'submitted'

export interface TimesheetEntry {
  chargeCodeId: string
  date: string // YYYY-MM-DD
  hours: number | ''
}

export const CATEGORY_COLORS: Record<Category, string> = {
  grow: '#2251FF',
  run: '#16A34A',
  'non-billable': '#6B7280',
}

export const CATEGORY_COLORS_DARK: Record<Category, string> = {
  grow: '#4D6FFF',
  run: '#22C55E',
  'non-billable': '#9CA3AF',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  grow: 'Grow',
  run: 'Run',
  'non-billable': 'Non-Billable',
}

/**
 * Codes the user is currently assigned to. These show up in the
 * picker so the user can add them to their timesheet with one click —
 * no need to remember codes or fill in descriptions.
 *
 * A consultant has one home office (here: New York), so every code
 * the user can charge against is tagged to the same location.
 */
export const USER_HOME_LOCATION = 'New York'

export const ASSIGNED_CHARGE_CODES: ChargeCode[] = [
  { id: 'a1', code: 'PRJ-001', description: 'Project Alpha — Growth Strategy',     category: 'grow',         location: USER_HOME_LOCATION },
  { id: 'a2', code: 'PRJ-002', description: 'Project Alpha — Operations',          category: 'run',          location: USER_HOME_LOCATION },
  { id: 'a3', code: 'PRJ-003', description: 'Project Beta — Discovery',            category: 'grow',         location: USER_HOME_LOCATION },
  { id: 'a4', code: 'PRJ-004', description: 'Project Gamma — Implementation',      category: 'run',          location: USER_HOME_LOCATION },
  { id: 'a5', code: 'PRJ-005', description: 'Project Delta — Diagnostic',          category: 'grow',         location: USER_HOME_LOCATION },
  { id: 'a6', code: 'TRN-001', description: 'Training & Learning',                 category: 'non-billable', location: USER_HOME_LOCATION },
  { id: 'a7', code: 'ADM-001', description: 'Administration',                      category: 'non-billable', location: USER_HOME_LOCATION },
  { id: 'a8', code: 'REC-001', description: 'Recruiting',                          category: 'non-billable', location: USER_HOME_LOCATION },
  { id: 'a9', code: 'FW-001',  description: 'Firm Work',                           category: 'non-billable', location: USER_HOME_LOCATION },
]

/**
 * Kept for backwards compatibility — equivalent to ASSIGNED_CHARGE_CODES.
 */
export const DEFAULT_CHARGE_CODES = ASSIGNED_CHARGE_CODES

/**
 * Special auto-managed charge code that captures public holidays.
 * It is added/removed automatically based on the active period + country.
 * Users can't add or remove it manually, and its cells are read-only.
 */
export const HOLIDAY_CODE_ID = '__holiday__'
export const HOLIDAY_HOURS_PER_DAY = 7

export const HOLIDAY_CHARGE_CODE: ChargeCode = {
  id: HOLIDAY_CODE_ID,
  code: 'HOLIDAY',
  description: 'Public Holiday',
  category: 'non-billable',
  location: USER_HOME_LOCATION,
}
