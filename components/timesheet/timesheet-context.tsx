'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import {
  ChargeCode,
  PeriodType,
  TimesheetStatus,
  ASSIGNED_CHARGE_CODES,
} from './types'
import { getPeriodBounds, addPeriod, getDatesInPeriod, isWeekend, formatDate } from './date-utils'

interface TimesheetContextValue {
  chargeCodes: ChargeCode[]
  assignedCodes: ChargeCode[]
  entries: Record<string, Record<string, number | ''>>
  periodType: PeriodType
  referenceDate: Date
  status: TimesheetStatus
  periodStart: Date
  periodEnd: Date
  hasStarted: boolean
  setEntry: (chargeCodeId: string, dateStr: string, hours: number | '') => void
  fillDefaults: () => void
  copyLastPeriod: () => void
  submitTimesheet: () => void
  resetTimesheet: () => void
  addChargeCode: (code: ChargeCode) => void
  removeChargeCode: (id: string) => void
  navigatePeriod: (delta: number) => void
  setPeriodType: (type: PeriodType) => void
}

const TimesheetContext = createContext<TimesheetContextValue | null>(null)

export function TimesheetProvider({ children }: { children: React.ReactNode }) {
  const [chargeCodes, setChargeCodes] = useState<ChargeCode[]>([])
  const [entries, setEntries] = useState<Record<string, Record<string, number | ''>>>({})
  const [periodType, setPeriodTypeState] = useState<PeriodType>('semi-monthly')
  const [referenceDate, setReferenceDate] = useState<Date>(new Date(2026, 5, 1)) // Jun 1 2026
  const [status, setStatus] = useState<TimesheetStatus>('draft')
  const [hasStarted, setHasStarted] = useState(false)

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
      setHasStarted(true)
    },
    []
  )

  const fillDefaults = useCallback(() => {
    // Ensure at least one code is present — pick the user's primary grow code from the assigned pool.
    const effectiveCodes: ChargeCode[] = chargeCodes.length > 0
      ? chargeCodes
      : [ASSIGNED_CHARGE_CODES.find(c => c.category === 'grow') ?? ASSIGNED_CHARGE_CODES[0]]

    if (chargeCodes.length === 0) {
      setChargeCodes(effectiveCodes)
    }

    const growCodes = effectiveCodes.filter((c) => c.category === 'grow')
    const targets = growCodes.length > 0 ? growCodes : effectiveCodes
    if (targets.length === 0) return

    const allDates = getDatesInPeriod(periodStart, periodEnd)
    const workdays = allDates.filter((d) => !isWeekend(d))

    setEntries((prev) => {
      const next = { ...prev }
      workdays.forEach((date) => {
        const dateStr = formatDate(date)
        next[dateStr] = { ...(next[dateStr] || {}) }
        const hoursEach = Math.floor(7 / targets.length)
        const remainder = 7 - hoursEach * targets.length
        targets.forEach((cc, i) => {
          next[dateStr][cc.id] = hoursEach + (i === 0 ? remainder : 0)
        })
      })
      return next
    })
    setStatus('draft')
    setHasStarted(true)
  }, [chargeCodes, periodStart, periodEnd])

  const copyLastPeriod = useCallback(() => {
    // Simulate "last period" — auto-add a representative mix of codes if empty.
    const effectiveCodes: ChargeCode[] = chargeCodes.length > 0
      ? chargeCodes
      : [
          ASSIGNED_CHARGE_CODES.find(c => c.category === 'grow') ?? ASSIGNED_CHARGE_CODES[0],
          ASSIGNED_CHARGE_CODES.find(c => c.category === 'non-billable') ?? ASSIGNED_CHARGE_CODES[0],
        ].filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i)

    if (chargeCodes.length === 0) {
      setChargeCodes(effectiveCodes)
    }

    const allDates = getDatesInPeriod(periodStart, periodEnd)
    const workdays = allDates.filter((d) => !isWeekend(d))
    const growCodes = effectiveCodes.filter((c) => c.category === 'grow')
    const nonBillable = effectiveCodes.filter((c) => c.category === 'non-billable')

    setEntries((prev) => {
      const next = { ...prev }
      workdays.forEach((date, idx) => {
        const dateStr = formatDate(date)
        next[dateStr] = { ...(next[dateStr] || {}) }
        // Most days: 7h on primary grow code. Friday-ish: split with admin/training.
        if (idx % 5 === 4 && nonBillable.length > 0 && growCodes.length > 0) {
          next[dateStr][growCodes[0].id] = 5
          next[dateStr][nonBillable[0].id] = 2
        } else if (growCodes.length > 0) {
          next[dateStr][growCodes[0].id] = 7
        } else if (effectiveCodes.length > 0) {
          next[dateStr][effectiveCodes[0].id] = 7
        }
      })
      return next
    })
    setStatus('draft')
    setHasStarted(true)
  }, [chargeCodes, periodStart, periodEnd])

  const submitTimesheet = useCallback(() => {
    setStatus('submitted')
  }, [])

  const resetTimesheet = useCallback(() => {
    setStatus('draft')
  }, [])

  const addChargeCode = useCallback((code: ChargeCode) => {
    setChargeCodes((prev) => {
      if (prev.some((c) => c.id === code.id || c.code.toLowerCase() === code.code.toLowerCase())) {
        return prev
      }
      return [...prev, code]
    })
    setHasStarted(true)
  }, [])

  const removeChargeCode = useCallback((id: string) => {
    setChargeCodes((prev) => prev.filter((c) => c.id !== id))
    setEntries((prev) => {
      const next: Record<string, Record<string, number | ''>> = {}
      for (const dateStr of Object.keys(prev)) {
        const row = { ...prev[dateStr] }
        delete row[id]
        next[dateStr] = row
      }
      return next
    })
  }, [])

  const navigatePeriod = useCallback(
    (delta: number) => {
      setReferenceDate((prev) => addPeriod(prev, periodType, delta))
      setStatus('draft')
      setEntries({})
      setChargeCodes([])
      setHasStarted(false)
    },
    [periodType]
  )

  const setPeriodType = useCallback((type: PeriodType) => {
    setPeriodTypeState(type)
    setStatus('draft')
    setEntries({})
    setChargeCodes([])
    setHasStarted(false)
  }, [])

  const value = useMemo<TimesheetContextValue>(
    () => ({
      chargeCodes,
      assignedCodes: ASSIGNED_CHARGE_CODES,
      entries,
      periodType,
      referenceDate,
      status,
      periodStart,
      periodEnd,
      hasStarted,
      setEntry,
      fillDefaults,
      copyLastPeriod,
      submitTimesheet,
      resetTimesheet,
      addChargeCode,
      removeChargeCode,
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
      hasStarted,
      setEntry,
      fillDefaults,
      copyLastPeriod,
      submitTimesheet,
      resetTimesheet,
      addChargeCode,
      removeChargeCode,
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
