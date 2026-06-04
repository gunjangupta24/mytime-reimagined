'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTimesheet } from './timesheet-context'
import { getDatesInPeriod, isWeekend, formatDate } from './date-utils'
import { getHoliday } from './holidays'
import { HOLIDAY_CODE_ID } from './types'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'

function DayCard({ date, dayIndex }: { date: Date; dayIndex: number }) {
  const { chargeCodes, entries, setEntry, status, recentlyAddedIds, country } = useTimesheet()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const ds = formatDate(date)
  const isReadOnly = status === 'submitted'
  const weekend = isWeekend(date)
  const holiday = !weekend ? getHoliday(ds, country) : null

  const catColors: Record<string, string> = {
    grow: isDark ? '#4D6FFF' : '#2251FF',
    run: isDark ? '#22C55E' : '#16A34A',
    'non-billable': isDark ? '#9CA3AF' : '#6B7280',
  }

  const dayTotal = chargeCodes.reduce((sum, cc) => {
    const v = entries[ds]?.[cc.id]
    return sum + (typeof v === 'number' ? v : 0)
  }, 0)

  // Show codes the user has filled today OR any code with hours elsewhere in
  // the period (so weekend / unused-day cards still let them enter hours
  // without forcing them back to the dialog). HOLIDAY row only appears on
  // actual holiday days.
  const visibleCodes = chargeCodes.filter((cc) => {
    if (cc.id === HOLIDAY_CODE_ID) return Boolean(holiday)
    const v = entries[ds]?.[cc.id]
    if (typeof v === 'number' && v > 0) return true
    if (recentlyAddedIds.has(cc.id)) return true
    for (const dateStr of Object.keys(entries)) {
      const otherV = entries[dateStr]?.[cc.id]
      if (typeof otherV === 'number' && otherV > 0) return true
    }
    return false
  })

  const totalColor = dayTotal === 0
    ? 'text-muted-foreground'
    : dayTotal < 7
    ? 'text-amber-500'
    : dayTotal > 7
    ? 'text-red-500'
    : 'text-green-500'

  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className={cn(
      'rounded-xl border bg-card shadow-sm overflow-hidden',
      holiday
        ? 'border-amber-200 dark:border-amber-900'
        : weekend
        ? 'border-violet-200 dark:border-violet-900'
        : 'border-border'
    )}>
      {/* Card header */}
      <div className={cn(
        'flex items-center justify-between px-4 py-3 border-b border-border',
        holiday
          ? 'bg-amber-50 dark:bg-amber-950/30'
          : weekend
          ? 'bg-violet-50 dark:bg-violet-950/20'
          : 'bg-muted/20'
      )}>
        <div>
          <p className="font-semibold text-foreground">{dayName}</p>
          <p className="text-xs text-muted-foreground">{dateStr}</p>
          {holiday && (
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              <PartyPopper className="w-3 h-3" />
              {holiday.name}
            </p>
          )}
          {!holiday && weekend && (
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 dark:text-violet-400">
              Weekend
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-0.5">Total</p>
          <p className={cn('text-lg font-bold tabular-nums', totalColor)}>
            {dayTotal}h
          </p>
        </div>
      </div>

      {/* Charge code rows */}
      <div className="divide-y divide-border/60">
        {visibleCodes.length === 0 && !holiday && (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            {weekend
              ? 'No hours on this weekend day. Add a code from the toolbar if you worked.'
              : 'No hours yet. Add a code from the toolbar above.'}
          </p>
        )}
        {visibleCodes.map(cc => {
          const val = entries[ds]?.[cc.id]
          const isHolidayRow = cc.id === HOLIDAY_CODE_ID
          const dotColor = isHolidayRow
            ? (isDark ? '#F59E0B' : '#D97706')
            : catColors[cc.category]
          return (
            <div key={cc.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-mono font-semibold text-foreground">{cc.code}</p>
                  <p className="text-xs text-muted-foreground truncate">{cc.description}</p>
                  {cc.location && (
                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate">{cc.location}</span>
                    </p>
                  )}
                </div>
              </div>
              {isHolidayRow ? (
                <span className="inline-flex items-center justify-center w-14 h-9 text-sm font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                  {typeof val === 'number' ? val : (holiday ? 7 : 0)}
                </span>
              ) : (
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
                  aria-label={`Hours for ${cc.code}`}
                  className={cn(
                    'w-14 h-9 text-center text-sm font-bold rounded-lg border transition-all tabular-nums',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    isReadOnly
                      ? 'bg-muted/50 text-muted-foreground border-transparent cursor-not-allowed'
                      : 'bg-background border-input hover:border-primary/40 text-foreground',
                    val !== '' && val !== undefined && typeof val === 'number' && val > 0
                      ? weekend
                        ? 'border-violet-400/40 bg-violet-100/70 dark:bg-violet-900/30'
                        : 'border-primary/30 bg-primary/5'
                      : ''
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function MobileDayView() {
  const { periodStart, periodEnd, country, includeWeekends } = useTimesheet()
  const allDates = getDatesInPeriod(periodStart, periodEnd)
  const dates = includeWeekends ? allDates : allDates.filter((d) => !isWeekend(d))
  const [currentIdx, setCurrentIdx] = useState(0)

  // Clamp index when the visible-days list shrinks (e.g. weekend toggle off).
  useEffect(() => {
    if (currentIdx > dates.length - 1) {
      setCurrentIdx(Math.max(0, dates.length - 1))
    }
  }, [currentIdx, dates.length])

  const safeIdx = Math.min(currentIdx, Math.max(0, dates.length - 1))
  const currentDate = dates[safeIdx]
  if (!currentDate) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Day navigator header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={safeIdx === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Pagination dots */}
        <div className="flex items-center gap-1.5">
          {dates.map((_, i) => {
            const weekend = isWeekend(dates[i])
            const dotHoliday = !weekend ? getHoliday(formatDate(dates[i]), country) : null
            return (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                aria-label={`Go to day ${i + 1}`}
                title={dotHoliday?.name}
                className={cn(
                  'rounded-full transition-all',
                  i === safeIdx
                    ? 'w-4 h-2 bg-primary'
                    : dotHoliday
                    ? 'w-1.5 h-1.5 bg-amber-400'
                    : weekend
                    ? 'w-1.5 h-1.5 bg-violet-300 dark:bg-violet-700'
                    : 'w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70'
                )}
              />
            )
          })}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setCurrentIdx(i => Math.min(dates.length - 1, i + 1))}
          disabled={safeIdx === dates.length - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day card */}
      <DayCard date={currentDate} dayIndex={safeIdx} />

      {/* Swipe hint */}
      <p className="text-center text-xs text-muted-foreground/60">
        {safeIdx + 1} of {dates.length} days
      </p>
    </div>
  )
}
