'use client'

import { ChevronLeft, ChevronRight, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTimesheet } from './timesheet-context'
import { COUNTRY_LABELS, Country } from './holidays'
import { formatCompactPeriodLabel } from './date-utils'

export function PeriodSelector() {
  const { periodType, setPeriodType, navigatePeriod, country, setCountry, periodStart, periodEnd } = useTimesheet()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Country / holiday calendar */}
      <label className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card pl-2 pr-1 h-8 text-xs">
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="sr-only">Holiday calendar</span>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value as Country)}
          className="bg-transparent border-0 outline-none focus:ring-0 text-xs font-medium text-foreground pr-1 cursor-pointer"
          aria-label="Holiday calendar country"
        >
          {(Object.keys(COUNTRY_LABELS) as Country[]).map((c) => (
            <option key={c} value={c}>
              {COUNTRY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>

      {/* Period type toggle */}
      <div className="inline-flex rounded-lg border border-border bg-muted p-0.5 text-sm">
        {(['semi-monthly', 'weekly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setPeriodType(t)}
            className={
              periodType === t
                ? 'px-3 py-1 rounded-md bg-card text-foreground font-medium shadow-sm transition-all'
                : 'px-3 py-1 rounded-md text-muted-foreground hover:text-foreground transition-all'
            }
          >
            {t === 'semi-monthly' ? 'Semi-Monthly' : 'Weekly'}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigatePeriod(-1)}
          aria-label="Previous period"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[88px] text-center text-xs font-medium text-muted-foreground tabular-nums">
          {formatCompactPeriodLabel(periodStart, periodEnd)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigatePeriod(1)}
          aria-label="Next period"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
