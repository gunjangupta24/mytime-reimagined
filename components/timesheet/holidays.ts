/**
 * 2026 public holidays for the countries our user-base typically charges from.
 * Used to visually mark holiday days in the timesheet grid so the user knows
 * they don't need to enter hours for those days.
 *
 * Keep dates as YYYY-MM-DD (local) — no timezone math required.
 */

export type Country = 'IN' | 'US' | 'UK'

export interface Holiday {
  date: string // YYYY-MM-DD
  name: string
}

export const COUNTRY_LABELS: Record<Country, string> = {
  IN: 'India',
  US: 'United States',
  UK: 'United Kingdom',
}

export const HOLIDAYS_2026: Record<Country, Holiday[]> = {
  IN: [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-01-26', name: 'Republic Day' },
    { date: '2026-03-04', name: 'Holi' },
    { date: '2026-04-03', name: 'Good Friday' },
    { date: '2026-05-01', name: 'Labour Day' },
    { date: '2026-05-27', name: 'Eid al-Fitr' },
    { date: '2026-06-17', name: 'Eid al-Adha' },
    { date: '2026-08-15', name: 'Independence Day' },
    { date: '2026-10-02', name: 'Gandhi Jayanti' },
    { date: '2026-11-08', name: 'Diwali' },
    { date: '2026-12-25', name: 'Christmas' },
  ],
  US: [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-01-19', name: 'MLK Day' },
    { date: '2026-02-16', name: "Presidents' Day" },
    { date: '2026-05-25', name: 'Memorial Day' },
    { date: '2026-06-19', name: 'Juneteenth' },
    { date: '2026-07-03', name: 'Independence Day (observed)' },
    { date: '2026-09-07', name: 'Labor Day' },
    { date: '2026-11-11', name: 'Veterans Day' },
    { date: '2026-11-26', name: 'Thanksgiving' },
    { date: '2026-12-25', name: 'Christmas' },
  ],
  UK: [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-04-03', name: 'Good Friday' },
    { date: '2026-04-06', name: 'Easter Monday' },
    { date: '2026-05-04', name: 'Early May Bank Holiday' },
    { date: '2026-05-25', name: 'Spring Bank Holiday' },
    { date: '2026-08-31', name: 'Summer Bank Holiday' },
    { date: '2026-12-25', name: 'Christmas' },
    { date: '2026-12-28', name: 'Boxing Day (substitute)' },
  ],
}

/** Returns the holiday for a given date+country, or null. */
export function getHoliday(date: string, country: Country): Holiday | null {
  return HOLIDAYS_2026[country].find((h) => h.date === date) ?? null
}

/** Returns all holidays in a given period (inclusive). */
export function getHolidaysInPeriod(
  start: string,
  end: string,
  country: Country
): Holiday[] {
  return HOLIDAYS_2026[country].filter((h) => h.date >= start && h.date <= end)
}
