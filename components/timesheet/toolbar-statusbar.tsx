'use client'

import { useTimesheet } from './timesheet-context'
import { getDatesInPeriod, isWeekend, formatDate } from './date-utils'
import { Zap, Copy, CheckCircle2, AlertCircle, Clock, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddChargeCodeDialog } from './add-charge-code-dialog'

function StatusBadge({ status }: { status: 'draft' | 'submitted' }) {
  if (status === 'submitted') {
    return (
      <Badge className="gap-1.5 bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 dark:text-green-400 hover:bg-green-500/15">
        <CheckCircle2 className="w-3 h-3" />
        Submitted
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1.5 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400 hover:bg-amber-50">
      <Clock className="w-3 h-3" />
      Draft
    </Badge>
  )
}

export function StatusBar() {
  const { status, entries, periodStart, periodEnd, chargeCodes, submitTimesheet, resetTimesheet } = useTimesheet()

  const dates = getDatesInPeriod(periodStart, periodEnd)
  const workdays = dates.filter(d => !isWeekend(d))

  const totalHours = workdays.reduce((sum, d) => {
    const ds = formatDate(d)
    return sum + chargeCodes.reduce((s, cc) => {
      const v = entries[ds]?.[cc.id]
      return s + (typeof v === 'number' ? v : 0)
    }, 0)
  }, 0)

  const expectedHours = workdays.length * 7
  const hoursEntered = totalHours
  const pct = expectedHours > 0 ? Math.min(100, Math.round((hoursEntered / expectedHours) * 100)) : 0
  const isOver = totalHours > expectedHours
  const isComplete = totalHours === expectedHours

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card shadow-sm px-4 py-3">
      {/* Left: status + hours summary */}
      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge status={status} />
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="font-bold text-foreground tabular-nums">{hoursEntered}h</span>
          <span>/ {expectedHours}h expected</span>
          {isOver && (
            <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
              <AlertCircle className="w-3 h-3" />
              Over by {totalHours - expectedHours}h
            </span>
          )}
          {isComplete && (
            <span className="flex items-center gap-1 text-green-500 text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Complete
            </span>
          )}
        </div>
        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: isOver ? '#EF4444' : isComplete ? '#22C55E' : '#F59E0B',
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {status === 'draft' ? (
          <Button
            size="sm"
            onClick={submitTimesheet}
            className="h-8 text-xs font-semibold px-4 gap-1.5"
            style={{ backgroundColor: '#003A6B', color: '#fff' }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Submit Timesheet
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={resetTimesheet}
            className="h-8 text-xs font-semibold px-4"
          >
            Reopen as Draft
          </Button>
        )}
      </div>
    </div>
  )
}

export function Toolbar() {
  const { fillDefaults, copyLastPeriod, includeWeekends, setIncludeWeekends } = useTimesheet()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <AddChargeCodeDialog />
      <Button
        variant="outline"
        size="sm"
        onClick={fillDefaults}
        className="gap-1.5 h-8 text-xs font-medium"
      >
        <Zap className="h-3.5 w-3.5 text-amber-500" />
        Fill Defaults
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={copyLastPeriod}
        className="gap-1.5 h-8 text-xs font-medium"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy Last Period
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIncludeWeekends(!includeWeekends)}
        className="gap-1.5 h-8 text-xs font-medium text-muted-foreground hover:text-foreground sm:ml-auto"
        aria-pressed={includeWeekends}
      >
        <CalendarDays className="h-3.5 w-3.5" />
        {includeWeekends ? 'Hide weekend' : 'Show weekend'}
      </Button>
    </div>
  )
}
