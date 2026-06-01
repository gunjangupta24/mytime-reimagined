'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTimesheet } from './timesheet-context'
import { getDatesInPeriod, isWeekend, formatDate } from './date-utils'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'

function DayCard({ date, dayIndex }: { date: Date; dayIndex: number }) {
  const { chargeCodes, entries, setEntry, status } = useTimesheet()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const ds = formatDate(date)
  const isReadOnly = status === 'submitted'
  const weekend = isWeekend(date)

  const catColors: Record<string, string> = {
    grow: isDark ? '#4D6FFF' : '#2251FF',
    run: isDark ? '#22C55E' : '#16A34A',
    'non-billable': isDark ? '#9CA3AF' : '#6B7280',
  }

  const dayTotal = chargeCodes.reduce((sum, cc) => {
    const v = entries[ds]?.[cc.id]
    return sum + (typeof v === 'number' ? v : 0)
  }, 0)

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
      'rounded-xl border border-border bg-card shadow-sm overflow-hidden',
      weekend && 'opacity-60'
    )}>
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
        <div>
          <p className="font-semibold text-foreground">{dayName}</p>
          <p className="text-xs text-muted-foreground">{dateStr}</p>
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
        {chargeCodes.map(cc => {
          const val = entries[ds]?.[cc.id]
          return (
            <div key={cc.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: catColors[cc.category] }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-mono font-semibold text-foreground">{cc.code}</p>
                  <p className="text-xs text-muted-foreground truncate">{cc.description}</p>
                </div>
              </div>
              {weekend ? (
                <span className="text-xs text-muted-foreground/40 w-14 text-center">—</span>
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
                      ? 'border-primary/30 bg-primary/5'
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
  const { periodStart, periodEnd } = useTimesheet()
  const dates = getDatesInPeriod(periodStart, periodEnd)
  const [currentIdx, setCurrentIdx] = useState(0)

  const currentDate = dates[currentIdx]

  return (
    <div className="flex flex-col gap-4">
      {/* Day navigator header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Pagination dots */}
        <div className="flex items-center gap-1.5">
          {dates.map((_, i) => {
            const weekend = isWeekend(dates[i])
            return (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                aria-label={`Go to day ${i + 1}`}
                className={cn(
                  'rounded-full transition-all',
                  i === currentIdx
                    ? 'w-4 h-2 bg-primary'
                    : weekend
                    ? 'w-1.5 h-1.5 bg-border'
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
          disabled={currentIdx === dates.length - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day card */}
      <DayCard date={currentDate} dayIndex={currentIdx} />

      {/* Swipe hint */}
      <p className="text-center text-xs text-muted-foreground/60">
        {currentIdx + 1} of {dates.length} days
      </p>
    </div>
  )
}
