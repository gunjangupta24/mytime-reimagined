'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTimesheet } from './timesheet-context'

export function PeriodSelector() {
  const { periodType, setPeriodType, navigatePeriod } = useTimesheet()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
