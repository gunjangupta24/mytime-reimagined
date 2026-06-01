export type Category = 'grow' | 'run' | 'non-billable'

export interface ChargeCode {
  id: string
  code: string
  description: string
  category: Category
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

export const DEFAULT_CHARGE_CODES: ChargeCode[] = [
  { id: '1', code: 'PRJ-001', description: 'Project Alpha (Growth)', category: 'grow' },
  { id: '2', code: 'PRJ-002', description: 'Project Alpha (Ops)',    category: 'run' },
  { id: '3', code: 'PRJ-003', description: 'Project Beta',           category: 'grow' },
  { id: '4', code: 'PRJ-004', description: 'Project Gamma',          category: 'run' },
  { id: '5', code: 'TRN-001', description: 'Training',               category: 'non-billable' },
  { id: '6', code: 'ADM-001', description: 'Admin',                  category: 'non-billable' },
]
