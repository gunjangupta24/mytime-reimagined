import { PeriodType } from './types'

/**
 * Given a reference date and period type, return the start/end of the period.
 */
export function getPeriodBounds(
  referenceDate: Date,
  periodType: PeriodType
): { start: Date; end: Date } {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const day = referenceDate.getDate()

  if (periodType === 'weekly') {
    // Week starts Monday
    const dow = referenceDate.getDay() // 0=Sun, 1=Mon...
    const diffToMon = (dow === 0 ? -6 : 1 - dow)
    const start = new Date(referenceDate)
    start.setDate(day + diffToMon)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(0, 0, 0, 0)
    return { start, end }
  } else {
    // Semi-monthly: 1st-15th or 16th-end
    if (day <= 15) {
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month, 15),
      }
    } else {
      const lastDay = new Date(year, month + 1, 0).getDate()
      return {
        start: new Date(year, month, 16),
        end: new Date(year, month, lastDay),
      }
    }
  }
}

export function addPeriod(date: Date, periodType: PeriodType, delta: number): Date {
  const { start, end } = getPeriodBounds(date, periodType)
  if (delta === 0) return date
  if (delta > 0) {
    // Move to period after end
    const next = new Date(end)
    next.setDate(next.getDate() + 1)
    if (delta === 1) return next
    return addPeriod(next, periodType, delta - 1)
  } else {
    // Move to period before start
    const prev = new Date(start)
    prev.setDate(prev.getDate() - 1)
    if (delta === -1) return prev
    return addPeriod(prev, periodType, delta + 1)
  }
}

/**
 * Get all dates in the period (inclusive).
 */
export function getDatesInPeriod(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  const cur = new Date(start)
  cur.setHours(0, 0, 0, 0)
  const endTime = new Date(end)
  endTime.setHours(0, 0, 0, 0)
  while (cur <= endTime) {
    dates.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

export function isWeekend(date: Date): boolean {
  const d = date.getDay()
  return d === 0 || d === 6
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function formatPeriodLabel(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startStr = start.toLocaleDateString('en-US', opts)
  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startStr} – ${endStr}`
}

export function formatColumnHeader(date: Date): { day: string; date: string } {
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }
}
