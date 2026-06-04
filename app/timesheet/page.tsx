'use client'

import Link from 'next/link'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { PeriodSelector } from '@/components/timesheet/period-selector'
import { TimesheetGrid } from '@/components/timesheet/timesheet-grid'
import { MobileDayView } from '@/components/timesheet/mobile-day-view'
import { Toolbar, StatusBar } from '@/components/timesheet/toolbar-statusbar'
import { useTimesheet } from '@/components/timesheet/timesheet-context'

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">No hours yet</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Add a charge code, fill defaults, or copy your last period to get started.
        </p>
      </div>
    </div>
  )
}

export default function TimesheetPage() {
  const { hasStarted } = useTimesheet()

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

      {/* Period selector */}
      <div className="flex justify-end">
        <PeriodSelector />
      </div>

      {/* Toolbar */}
      <Toolbar />

      {hasStarted ? (
        <>
          {/* Desktop Grid */}
          <div className="hidden md:block">
            <TimesheetGrid />
          </div>

          {/* Mobile Day View */}
          <div className="md:hidden">
            <MobileDayView />
          </div>

          {/* Status bar */}
          <StatusBar />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
