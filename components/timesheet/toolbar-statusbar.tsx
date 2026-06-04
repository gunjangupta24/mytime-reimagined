'use client'

import { useEffect, useState } from 'react'
import { useTimesheet } from './timesheet-context'
import { getDatesInPeriod, isWeekend, formatDate } from './date-utils'
import { Zap, Copy, CheckCircle2, AlertCircle, Clock, CalendarDays, Save, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddChargeCodeDialog } from './add-charge-code-dialog'
import type { TimesheetStatus } from './types'

function StatusBadge({ status }: { status: TimesheetStatus }) {
  if (status === 'submitted') {
    return (
      <Badge className="gap-1.5 bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 dark:text-green-400 hover:bg-green-500/15">
        <CheckCircle2 className="w-3 h-3" />
        Submitted
      </Badge>
    )
  }
  if (status === 'saved') {
    return (
      <Badge variant="outline" className="gap-1.5 text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 hover:bg-blue-50">
        <BookmarkCheck className="w-3 h-3" />
        Saved
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1.5 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400 hover:bg-amber-50">
      <Clock className="w-3 h-3" />
      Unsaved
    </Badge>
  )
}

/** Live-updating "Saved 2 min ago" label. */
function SavedAgo({ at }: { at: Date | null }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!at) return
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000)
    return () => window.clearInterval(id)
  }, [at])
  if (!at) return null
  const diffSec = Math.max(0, Math.round((Date.now() - at.getTime()) / 1000))
  let label: string
  if (diffSec < 10) label = 'just now'
  else if (diffSec < 60) label = `${diffSec}s ago`
  else if (diffSec < 3600) label = `${Math.floor(diffSec / 60)}m ago`
  else if (diffSec < 86_400) label = `${Math.floor(diffSec / 3600)}h ago`
  else label = at.toLocaleDateString()
  return <span className="text-xs text-muted-foreground tabular-nums">Saved {label}</span>
}

export function StatusBar() {
  const {
    status,
    entries,
    periodStart,
    periodEnd,
    chargeCodes,
    lastSavedAt,
  } = useTimesheet()

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
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          {(status === 'saved' || status === 'submitted') && <SavedAgo at={lastSavedAt} />}
        </div>
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

    </div>
  )
}

export function Toolbar() {
  const {
    fillDefaults,
    copyLastPeriod,
    includeWeekends,
    setIncludeWeekends,
    status,
    hasStarted,
    saveTimesheet,
    submitTimesheet,
    resetTimesheet,
  } = useTimesheet()

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Entry helpers */}
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
          className="gap-1.5 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
          aria-pressed={includeWeekends}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {includeWeekends ? 'Hide weekend' : 'Show weekend'}
        </Button>
      </div>

      {/* Save / Submit — always visible so users can find them */}
      <div className="flex items-center gap-2 sm:ml-auto">
        {status === 'submitted' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={resetTimesheet}
            className="h-8 text-xs font-semibold px-4"
          >
            Reopen as Draft
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={saveTimesheet}
              disabled={!hasStarted || status === 'saved'}
              className="h-8 text-xs font-semibold px-3 gap-1.5"
              title={
                !hasStarted
                  ? 'Enter some hours first'
                  : status === 'saved'
                  ? 'No new changes to save'
                  : 'Save progress (auto-restored next time)'
              }
            >
              <Save className="w-3.5 h-3.5" />
              {status === 'saved' ? 'Saved' : 'Save'}
            </Button>
            <Button
              size="sm"
              onClick={submitTimesheet}
              disabled={!hasStarted}
              className="h-8 text-xs font-semibold px-4 gap-1.5"
              style={{ backgroundColor: '#003A6B', color: '#fff' }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Submit
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
