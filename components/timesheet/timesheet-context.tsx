'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import {
  ChargeCode,
  PeriodType,
  TimesheetStatus,
  DEFAULT_CHARGE_CODES,
} from './types'
import { getPeriodBounds, addPeriod, getDatesInPeriod, isWeekend, formatDate } from './date-utils'

interface TimesheetContextValue {
  chargeCodes: ChargeCode[]
  entries: Record<string, Record<string, number | ''>>
  periodType: PeriodType
  referenceDate: Date
  status: TimesheetStatus
  periodStart: Date
  periodEnd: Date
  setEntry: (chargeCodeId: string, dateStr: string, hours: number | '') => void
  fillDefaults: () => void
  copyLastPeriod: () => void
  submitTimesheet: () => void
  resetTimesheet: () => void
  addChargeCode: (code: ChargeCode) => void
  navigatePeriod: (delta: number) => void
  setPeriodType: (type: PeriodType) => void
}

const TimesheetContext = createContext<TimesheetContextValue | null>(null)

export function TimesheetProvider({ children }: { children: React.ReactNode }) {
  const [chargeCodes, setChargeCodes] = useState<ChargeCode[]>(DEFAULT_CHARGE_CODES)
  const [entries, setEntries] = useState<Record<string, Record<string, number | ''>>>({})
  const [periodType, setPeriodTypeState] = useState<PeriodType>('semi-monthly')
  const [referenceDate, setReferenceDate] = useState<Date>(new Date(2026, 5, 1)) // Jun 1 2026
  const [status, setStatus] = useState<TimesheetStatus>('draft')

  const { start: periodStart, end: periodEnd } = useMemo(
    () => getPeriodBounds(referenceDate, periodType),
    [referenceDate, periodType]
  )

  const setEntry = useCallback(
    (chargeCodeId: string, dateStr: string, hours: number | '') => {
      setEntries((prev) => ({
        ...prev,
        [dateStr]: {
          ...(prev[dateStr] || {}),
          [chargeCodeId]: hours,
        },
      }))
      setStatus('draft')
    },
    []
  )

  const fillDefaults = useCallback(() => {
    const growCodes = chargeCodes.filter((c) => c.category === 'grow')
    if (growCodes.length === 0) return

    const allDates = getDatesInPeriod(periodStart, periodEnd)
    const workdays = allDates.filter((d) => !isWeekend(d))

    setEntries((prev) => {
      const next = { ...prev }
      workdays.forEach((date) => {
        const dateStr = formatDate(date)
        next[dateStr] = { ...(next[dateStr] || {}) }
        const hoursEach = Math.floor(7 / growCodes.length)
        const remainder = 7 - hoursEach * growCodes.length
        growCodes.forEach((cc, i) => {
          next[dateStr][cc.id] = hoursEach + (i === 0 ? remainder : 0)
        })
      })
      return next
    })
    setStatus('draft')
  }, [chargeCodes, periodStart, periodEnd])

  const copyLastPeriod = useCallback(() => {
    // Simulate copy from last period using preset values
    const allDates = getDatesInPeriod(periodStart, periodEnd)
    const workdays = allDates.filter((d) => !isWeekend(d))
    const growCodes = chargeCodes.filter((c) => c.category === 'grow')
    const runCodes = chargeCodes.filter((c) => c.category === 'run')

    setEntries((prev) => {
      const next = { ...prev }
      workdays.forEach((date, idx) => {
        const dateStr = formatDate(date)
        next[dateStr] = {}
        // Alternate pattern to mimic realistic data
        growCodes.forEach((cc, i) => {
          next[dateStr][cc.id] = i === 0 ? 4 : 3
        })
        runCodes.forEach((cc) => {
          next[dateStr][cc.id] = idx % 3 === 0 ? 0 : ''
        })
      })
      return next
    })
    setStatus('draft')
  }, [chargeCodes, periodStart, periodEnd])

  const submitTimesheet = useCallback(() => {
    setStatus('submitted')
  }, [])

  const resetTimesheet = useCallback(() => {
    setStatus('draft')
  }, [])

  const addChargeCode = useCallback((code: ChargeCode) => {
    setChargeCodes((prev) => [...prev, code])
  }, [])

  const navigatePeriod = useCallback(
    (delta: number) => {
      setReferenceDate((prev) => addPeriod(prev, periodType, delta))
      setStatus('draft')
      setEntries({})
    },
    [periodType]
  )

  const setPeriodType = useCallback((type: PeriodType) => {
    setPeriodTypeState(type)
    setStatus('draft')
    setEntries({})
  }, [])

  const value = useMemo<TimesheetContextValue>(
    () => ({
      chargeCodes,
      entries,
      periodType,
      referenceDate,
      status,
      periodStart,
      periodEnd,
      setEntry,
      fillDefaults,
      copyLastPeriod,
      submitTimesheet,
      resetTimesheet,
      addChargeCode,
      navigatePeriod,
      setPeriodType,
    }),
    [
      chargeCodes,
      entries,
      periodType,
      referenceDate,
      status,
      periodStart,
      periodEnd,
      setEntry,
      fillDefaults,
      copyLastPeriod,
      submitTimesheet,
      resetTimesheet,
      addChargeCode,
      navigatePeriod,
      setPeriodType,
    ]
  )

  return <TimesheetContext.Provider value={value}>{children}</TimesheetContext.Provider>
}

export function useTimesheet() {
  const ctx = useContext(TimesheetContext)
  if (!ctx) throw new Error('useTimesheet must be used within TimesheetProvider')
  return ctx
}
