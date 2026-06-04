'use client'

import { MapPin } from 'lucide-react'
import { useTimesheet } from './timesheet-context'
import { getDatesInPeriod, isWeekend, formatDate, formatColumnHeader } from './date-utils'
import { getHoliday } from './holidays'
import { HOLIDAY_CODE_ID, HOLIDAY_HOURS_PER_DAY } from './types'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'

function DailyTotalBadge({ total }: { total: number }) {
  if (total === 0) return <span className="text-muted-foreground text-xs">—</span>
  const color =
    total < 7 ? '#F59E0B' : total > 7 ? '#EF4444' : '#22C55E'
  return (
    <span
      className="inline-flex items-center justify-center font-bold text-xs tabular-nums px-2 py-0.5 rounded-full"
      style={{ background: color + '1A', color }}
    >
      {total}h
    </span>
  )
}

export function TimesheetGrid() {
  const { chargeCodes, entries, setEntry, periodStart, periodEnd, status, recentlyAddedIds, country, includeWeekends } = useTimesheet()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const allDates = getDatesInPeriod(periodStart, periodEnd)
  const dates = includeWeekends ? allDates : allDates.filter((d) => !isWeekend(d))
  const isReadOnly = status === 'submitted'

  // Per-day totals (across all codes — used for footer)
  const dayTotals: Record<string, number> = {}
  dates.forEach(d => {
    const ds = formatDate(d)
    dayTotals[ds] = chargeCodes.reduce((sum, cc) => {
      const v = entries[ds]?.[cc.id]
      return sum + (typeof v === 'number' ? v : 0)
    }, 0)
  })

  // Per-code totals
  const codeTotals: Record<string, number> = {}
  chargeCodes.forEach(cc => {
    codeTotals[cc.id] = dates.reduce((sum, d) => {
      const ds = formatDate(d)
      const v = entries[ds]?.[cc.id]
      return sum + (typeof v === 'number' ? v : 0)
    }, 0)
  })

  // Only show rows with hours filled, plus any code the user JUST added so
  // they can enter the first hour. Avoids wasted space from empty rows.
  const visibleCodes = chargeCodes.filter(
    (cc) => (codeTotals[cc.id] ?? 0) > 0 || recentlyAddedIds.has(cc.id)
  )

  const grandTotal = Object.values(codeTotals).reduce((a, b) => a + b, 0)

  const catColors: Record<string, string> = {
    grow: isDark ? '#4D6FFF' : '#2251FF',
    run: isDark ? '#22C55E' : '#16A34A',
    'non-billable': isDark ? '#9CA3AF' : '#6B7280',
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full text-sm border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b border-border">
            {/* Charge code column header */}
            <th className="sticky left-0 bg-card z-10 text-left px-4 py-3 font-semibold text-foreground min-w-[220px]">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Charge Code</span>
            </th>
            {dates.map(d => {
              const ds = formatDate(d)
              const weekend = isWeekend(d)
              const holiday = !weekend ? getHoliday(ds, country) : null
              const { day, date } = formatColumnHeader(d)
              return (
                <th
                  key={ds}
                  title={holiday?.name}
                  className={cn(
                    'text-center px-2 py-3 font-medium min-w-[68px]',
                    weekend && 'bg-muted/50 text-muted-foreground/50',
                    holiday && 'bg-amber-50 dark:bg-amber-950/30',
                    !weekend && !holiday && 'text-foreground'
                  )}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] uppercase tracking-wider font-medium opacity-60">{day}</span>
                    <span className="text-xs font-semibold">{date}</span>
                    {holiday && (
                      <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400 leading-tight mt-0.5 max-w-[64px] truncate">
                        {holiday.name}
                      </span>
                    )}
                  </div>
                </th>
              )
            })}
            <th className="text-center px-3 py-3 font-semibold text-foreground min-w-[64px]">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleCodes.length === 0 && (
            <tr>
              <td
                colSpan={dates.length + 2}
                className="text-center text-xs text-muted-foreground py-8"
              >
                No hours entered yet. Use the toolbar above to add a code or fill defaults.
              </td>
            </tr>
          )}
          {visibleCodes.map((cc, rowIdx) => {
            const rowTotal = codeTotals[cc.id] ?? 0
            const isHolidayRowOuter = cc.id === HOLIDAY_CODE_ID
            const catColor = isHolidayRowOuter
              ? (isDark ? '#F59E0B' : '#D97706')
              : catColors[cc.category]
            return (
              <tr
                key={cc.id}
                className={cn(
                  'border-b border-border/60 transition-colors group',
                  rowIdx % 2 === 0 ? 'bg-transparent' : 'bg-muted/20',
                  'hover:bg-accent/5'
                )}
              >
                {/* Code label — sticky */}
                <td className="sticky left-0 z-10 px-4 py-2 bg-inherit">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 ring-2 ring-offset-1"
                      style={{ backgroundColor: catColor, boxShadow: `0 0 0 2px ${catColor}40` }}
                      title={cc.category}
                    />
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-semibold text-foreground truncate">{cc.code}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">{cc.description}</div>
                      {cc.location && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          <span className="truncate">{cc.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Day cells */}
                {dates.map(d => {
                  const ds = formatDate(d)
                  const weekend = isWeekend(d)
                  const holiday = !weekend ? getHoliday(ds, country) : null
                  const val = entries[ds]?.[cc.id]
                  const isHolidayRow = cc.id === HOLIDAY_CODE_ID

                  if (weekend) {
                    return (
                      <td key={ds} className="text-center px-2 py-2 bg-muted/30">
                        <span className="text-muted-foreground/30 text-xs">—</span>
                      </td>
                    )
                  }

                  if (holiday && isHolidayRow) {
                    // Auto-filled holiday hours — read-only, amber background
                    return (
                      <td
                        key={ds}
                        className="text-center px-1 py-1.5 bg-amber-50/60 dark:bg-amber-950/20"
                        title={holiday.name}
                      >
                        <span className="inline-flex items-center justify-center w-12 h-8 text-sm font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                          {typeof val === 'number' ? val : HOLIDAY_HOURS_PER_DAY}
                        </span>
                      </td>
                    )
                  }

                  if (holiday) {
                    // Non-holiday rows on holiday days: just a dash
                    return (
                      <td
                        key={ds}
                        className="text-center px-2 py-2 bg-amber-50/30 dark:bg-amber-950/10"
                        title={holiday.name}
                      >
                        <span className="text-muted-foreground/30 text-xs">—</span>
                      </td>
                    )
                  }

                  if (isHolidayRow) {
                    // HOLIDAY row, non-holiday day: just a dash (no entry)
                    return (
                      <td key={ds} className="text-center px-2 py-2">
                        <span className="text-muted-foreground/30 text-xs">—</span>
                      </td>
                    )
                  }

                  return (
                    <td key={ds} className="text-center px-1 py-1.5">
                      <input
                        type="number"
                        min={0}
                        max={24}
                        step={1}
                        disabled={isReadOnly}
                        value={val === '' || val === undefined ? '' : String(val)}
                        onChange={e => {
                          const raw = e.target.value
                          if (raw === '') { setEntry(cc.id, ds, ''); return }
                          const n = parseInt(raw, 10)
                          if (!isNaN(n) && n >= 0 && n <= 24) setEntry(cc.id, ds, n)
                        }}
                        placeholder="0"
                        aria-label={`Hours for ${cc.code} on ${ds}`}
                        className={cn(
                          'w-12 h-8 text-center text-sm font-semibold rounded-md border transition-all tabular-nums',
                          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                          isReadOnly
                            ? 'bg-muted/50 text-muted-foreground border-transparent cursor-not-allowed'
                            : 'bg-background border-input hover:border-primary/40 text-foreground',
                          val !== '' && val !== undefined && typeof val === 'number' && val > 0
                            ? 'border-primary/30 bg-primary/5'
                            : ''
                        )}
                      />
                    </td>
                  )
                })}

                {/* Row total */}
                <td className="text-center px-3 py-2">
                  <span className={cn(
                    'text-sm font-bold tabular-nums',
                    rowTotal > 0 ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {rowTotal > 0 ? rowTotal : '—'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border bg-muted/30">
            <td className="sticky left-0 px-4 py-2.5 bg-muted/30 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Daily Total
            </td>
            {dates.map(d => {
              const ds = formatDate(d)
              const weekend = isWeekend(d)
              const holiday = !weekend ? getHoliday(ds, country) : null
              return (
                <td
                  key={ds}
                  className={cn(
                    'text-center px-2 py-2.5',
                    weekend && 'opacity-30',
                    holiday && 'bg-amber-50/60 dark:bg-amber-950/20'
                  )}
                  title={holiday?.name}
                >
                  {weekend ? (
                    <span className="text-muted-foreground/30 text-xs">—</span>
                  ) : (
                    <DailyTotalBadge total={dayTotals[ds] ?? 0} />
                  )}
                </td>
              )
            })}
            <td className="text-center px-3 py-2.5">
              <span className="text-sm font-bold text-foreground tabular-nums">{grandTotal}h</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
