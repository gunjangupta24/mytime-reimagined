'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PeriodSelector } from '@/components/timesheet/period-selector'
import { TimesheetGrid } from '@/components/timesheet/timesheet-grid'
import { MobileDayView } from '@/components/timesheet/mobile-day-view'
import { Toolbar, StatusBar } from '@/components/timesheet/toolbar-statusbar'
import { useTimesheet } from '@/components/timesheet/timesheet-context'
import { getDatesInPeriod, isWeekend, formatDate } from '@/components/timesheet/date-utils'
import { CATEGORY_LABELS } from '@/components/timesheet/types'
import { useTheme } from '@/components/theme-provider'

function CategoryLegend() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const items = [
    { category: 'grow' as const, color: isDark ? '#4D6FFF' : '#2251FF' },
    { category: 'run' as const, color: isDark ? '#22C55E' : '#16A34A' },
    { category: 'non-billable' as const, color: isDark ? '#9CA3AF' : '#6B7280' },
  ]
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {items.map(({ category, color }) => (
        <div key={category} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[category]}</span>
        </div>
      ))}
      <div className="flex items-center gap-3 ml-auto flex-wrap text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
          {'< 7h'}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
          = 7h
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
          {'> 7h'}
        </span>
      </div>
    </div>
  )
}

export default function TimesheetPage() {
  const { chargeCodes, entries, periodStart, periodEnd } = useTimesheet()

  const dates = getDatesInPeriod(periodStart, periodEnd)
  const workdays = dates.filter(d => !isWeekend(d))
  const totalHours = workdays.reduce((sum, d) => {
    const ds = formatDate(d)
    return sum + chargeCodes.reduce((s, cc) => {
      const v = entries[ds]?.[cc.id]
      return s + (typeof v === 'number' ? v : 0)
    }, 0)
  }, 0)
  const filledDays = workdays.filter(d => {
    const ds = formatDate(d)
    return chargeCodes.some(cc => {
      const v = entries[ds]?.[cc.id]
      return typeof v === 'number' && v > 0
    })
  }).length

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Back to Home
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Timesheet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filledDays} of {workdays.length} workdays filled &middot; {totalHours}h total
          </p>
        </div>
        <PeriodSelector />
      </div>

      {/* Toolbar */}
      <Toolbar />

      {/* Desktop Grid */}
      <div className="hidden md:block">
        <div className="mb-2">
          <CategoryLegend />
        </div>
        <TimesheetGrid />
      </div>

      {/* Mobile Day View */}
      <div className="md:hidden">
        <MobileDayView />
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  )
}
