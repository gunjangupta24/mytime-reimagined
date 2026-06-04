import type { ChargeCode, PeriodType, TimesheetStatus } from './types'
import type { Country } from './holidays'

/**
 * Lightweight localStorage persistence for the timesheet POC.
 *
 * Layout:
 *   {
 *     periods: {
 *       "<periodType>:<YYYY-MM-DD>": {
 *         entries, chargeCodes, status, savedAt
 *       }, ...
 *     },
 *     prefs: { country, includeWeekends, periodType }
 *   }
 */

const STORAGE_KEY = 'mytime-reimagined:v1'

export interface SavedPeriod {
  entries: Record<string, Record<string, number | ''>>
  chargeCodes: ChargeCode[]
  status: TimesheetStatus
  savedAt: string
}

export interface SavedPrefs {
  country?: Country
  includeWeekends?: boolean
  periodType?: PeriodType
}

export interface PersistedData {
  periods: Record<string, SavedPeriod>
  prefs: SavedPrefs
}

const empty = (): PersistedData => ({ periods: {}, prefs: {} })

export function readStorage(): PersistedData {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw)
    return {
      periods: parsed?.periods ?? {},
      prefs: parsed?.prefs ?? {},
    }
  } catch {
    return empty()
  }
}

export function writeStorage(data: PersistedData): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // quota exceeded or private-mode browser — silently noop for POC
  }
}

export function periodStorageKey(type: PeriodType, start: Date): string {
  const y = start.getFullYear()
  const m = String(start.getMonth() + 1).padStart(2, '0')
  const d = String(start.getDate()).padStart(2, '0')
  return `${type}:${y}-${m}-${d}`
}

export function clearStorage(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
