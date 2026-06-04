'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip as RechartTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { CheckCircle2, Clock, Zap, Copy, TrendingUp, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTimesheet } from '@/components/timesheet/timesheet-context'
import { getDatesInPeriod, isWeekend, formatDate, formatPeriodLabel } from '@/components/timesheet/date-utils'
import { CATEGORY_LABELS } from '@/components/timesheet/types'
import { useTheme } from '@/components/theme-provider'

// Mock 4-period trend data
const TREND_DATA = [
  { period: 'Apr 16–30', grow: 62, run: 35, nonBillable: 6 },
  { period: 'May 1–15', grow: 55, run: 42, nonBillable: 8 },
  { period: 'May 16–31', grow: 70, run: 28, nonBillable: 7 },
  { period: 'Jun 1–15', grow: 0, run: 0, nonBillable: 0 }, // current (live)
]

function StatCard({
  label, value, sub, icon: Icon, accent
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: (accent ?? '#003A6B') + '15' }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: accent ?? '#003A6B' }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'var(--foreground)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

export default function DashboardPage() {
  const { chargeCodes, entries, periodStart, periodEnd, status, fillDefaults, copyLastPeriod } = useTimesheet()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const catColors: Record<string, string> = {
    grow: isDark ? '#4D6FFF' : '#2251FF',
    run: isDark ? '#22C55E' : '#16A34A',
    'non-billable': isDark ? '#9CA3AF' : '#6B7280',
  }

  const dates = getDatesInPeriod(periodStart, periodEnd)
  const workdays = dates.filter(d => !isWeekend(d))
  const expectedHours = workdays.length * 7

  // Compute hours per charge code for donut
  const donutData = useMemo(() => {
    return chargeCodes
      .map(cc => {
        const total = dates.reduce((sum, d) => {
          const ds = formatDate(d)
          const v = entries[ds]?.[cc.id]
          return sum + (typeof v === 'number' ? v : 0)
        }, 0)
        return {
          name: cc.description,
          code: cc.code,
          value: total,
          category: cc.category,
          color: catColors[cc.category],
        }
      })
      .filter(d => d.value > 0)
  }, [chargeCodes, entries, dates, isDark])

  const totalHours = donutData.reduce((s, d) => s + d.value, 0)

  // Compute total by category for stats
  const byCategory = useMemo(() => {
    const acc: Record<string, number> = { grow: 0, run: 0, 'non-billable': 0 }
    chargeCodes.forEach(cc => {
      const total = dates.reduce((sum, d) => {
        const ds = formatDate(d)
        const v = entries[ds]?.[cc.id]
        return sum + (typeof v === 'number' ? v : 0)
      }, 0)
      acc[cc.category] = (acc[cc.category] ?? 0) + total
    })
    return acc
  }, [chargeCodes, entries, dates])

  // Inject current period into trend
  const trendWithCurrent = useMemo(() => {
    const updated = [...TREND_DATA]
    const last = { ...updated[updated.length - 1] }
    last.grow = byCategory.grow
    last.run = byCategory.run
    last.nonBillable = byCategory['non-billable']
    updated[updated.length - 1] = last
    return updated
  }, [byCategory])

  const periodLabel = formatPeriodLabel(periodStart, periodEnd)
  const pct = expectedHours > 0 ? Math.round((totalHours / expectedHours) * 100) : 0

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Back to Home
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Period overview &middot; {periodLabel}</p>
        </div>
        {/* Status badge */}
        {status === 'submitted' ? (
          <Badge className="gap-1.5 bg-green-500/10 text-green-600 border-green-200 dark:border-green-800 dark:text-green-400 text-sm px-3 py-1.5 h-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Submitted
          </Badge>
        ) : status === 'saved' ? (
          <Badge variant="outline" className="gap-1.5 text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 text-sm px-3 py-1.5 h-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved — {pct}% complete
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400 text-sm px-3 py-1.5 h-auto">
            <Clock className="w-3.5 h-3.5" />
            Unsaved — {pct}% complete
          </Badge>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Hours"
          value={`${totalHours}h`}
          sub={`of ${expectedHours}h expected`}
          icon={Clock}
          accent="#003A6B"
        />
        <StatCard
          label="Grow Hours"
          value={`${byCategory.grow}h`}
          sub={totalHours > 0 ? `${Math.round((byCategory.grow / expectedHours) * 100)}% of expected` : 'No data yet'}
          icon={TrendingUp}
          accent="#2251FF"
        />
        <StatCard
          label="Run Hours"
          value={`${byCategory.run}h`}
          sub={totalHours > 0 ? `${Math.round((byCategory.run / expectedHours) * 100)}% of expected` : 'No data yet'}
          icon={Calendar}
          accent="#16A34A"
        />
        <StatCard
          label="Days Remaining"
          value={workdays.length}
          sub="workdays this period"
          icon={Calendar}
          accent="#6B7280"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Donut chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Hours by Charge Code</h2>
          {totalHours === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
              <div className="w-16 h-16 rounded-full border-4 border-dashed border-border" />
              <p className="text-sm text-muted-foreground">No hours logged yet</p>
              <p className="text-xs text-muted-foreground/70">Use &quot;Fill Defaults&quot; to get started</p>
            </div>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartTooltip
                    contentStyle={CUSTOM_TOOLTIP_STYLE}
                    formatter={(value: number, name: string) => [`${value}h`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-foreground tabular-nums">{totalHours}h</span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
            </div>
          )}
          {/* Legend */}
          <div className="mt-3 flex flex-col gap-1.5">
            {donutData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground truncate max-w-[140px]">{d.name}</span>
                </div>
                <span className="font-semibold text-foreground tabular-nums">{d.value}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked bar trend chart */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-1">4-Period Trend</h2>
          <p className="text-xs text-muted-foreground mb-4">Hours by category across last 4 periods</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={trendWithCurrent}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#1A3558' : '#E2E6ED'}
                vertical={false}
              />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 10, fill: isDark ? '#8AA3BA' : '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: isDark ? '#8AA3BA' : '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                formatter={(value: number, name: string) => [`${value}h`, name]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => {
                  const map: Record<string, string> = {
                    grow: 'Grow', run: 'Run', nonBillable: 'Non-Billable'
                  }
                  return map[value] ?? value
                }}
              />
              <Bar dataKey="grow" stackId="a" fill={catColors.grow} radius={[0, 0, 0, 0]} />
              <Bar dataKey="run" stackId="a" fill={catColors.run} radius={[0, 0, 0, 0]} />
              <Bar dataKey="nonBillable" stackId="a" fill={catColors['non-billable']} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={fillDefaults}
            className="gap-2 h-9 text-sm font-medium"
            style={{ backgroundColor: '#003A6B', color: '#fff' }}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            Fill This Week
          </Button>
          <Button
            variant="outline"
            onClick={copyLastPeriod}
            className="gap-2 h-9 text-sm font-medium"
          >
            <Copy className="w-4 h-4" />
            Copy Last Period
          </Button>
        </div>
      </div>
    </div>
  )
}
