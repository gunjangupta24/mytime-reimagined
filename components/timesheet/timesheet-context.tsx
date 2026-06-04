'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ChargeCode,
  PeriodType,
  TimesheetStatus,
  ASSIGNED_CHARGE_CODES,
  HOLIDAY_CHARGE_CODE,
  HOLIDAY_CODE_ID,
  HOLIDAY_HOURS_PER_DAY,
} from './types'
import { Country, getHolidaysInPeriod } from './holidays'
import { getPeriodBounds, addPeriod, getDatesInPeriod, isWeekend, formatDate } from './date-utils'
import { readStorage, writeStorage, periodStorageKey, SavedPeriod } from './storage'

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
  recentlyAddedIds: Set<string>
  country: Country
  includeWeekends: boolean
  lastSavedAt: Date | null
  setEntry: (chargeCodeId: string, dateStr: string, hours: number | '') => void
  fillDefaults: () => void
  copyLastPeriod: () => void
  saveTimesheet: () => void
  submitTimesheet: () => void
  resetTimesheet: () => void
  addChargeCode: (code: ChargeCode) => void
  removeChargeCode: (id: string) => void
  navigatePeriod: (delta: number) => void
  setPeriodType: (type: PeriodType) => void
  setCountry: (country: Country) => void
  setIncludeWeekends: (include: boolean) => void
}

const TimesheetContext = createContext<TimesheetContextValue | null>(null)

export function TimesheetProvider({ children }: { children: React.ReactNode }) {
  const [chargeCodes, setChargeCodes] = useState<ChargeCode[]>([])
  const [entries, setEntries] = useState<Record<string, Record<string, number | ''>>>({})
  const [periodType, setPeriodTypeState] = useState<PeriodType>('semi-monthly')
  const [referenceDate, setReferenceDate] = useState<Date>(new Date(2026, 5, 1)) // Jun 1 2026
  const [status, setStatus] = useState<TimesheetStatus>('draft')
  const [hasStarted, setHasStarted] = useState(false)
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set())
  const [country, setCountry] = useState<Country>('US')
  const [includeWeekends, setIncludeWeekends] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const { start: periodStart, end: periodEnd } = useMemo(
    () => getPeriodBounds(referenceDate, periodType),
    [referenceDate, periodType]
  )

  /* ----------------------------- Persistence ----------------------------- */

  // Refs let helpers read the freshest values without becoming useEffect deps.
  const liveRef = useRef({
    entries,
    chargeCodes,
    status,
    periodType,
    periodStart,
    hasStarted,
  })
  useEffect(() => {
    liveRef.current = { entries, chargeCodes, status, periodType, periodStart, hasStarted }
  }, [entries, chargeCodes, status, periodType, periodStart, hasStarted])

  /** Write the current period snapshot to localStorage. */
  const persistPeriod = useCallback(
    (override?: Partial<SavedPeriod> & { type?: PeriodType; start?: Date }) => {
      const data = readStorage()
      const type = override?.type ?? liveRef.current.periodType
      const start = override?.start ?? liveRef.current.periodStart
      const key = periodStorageKey(type, start)
      const now = new Date()
      data.periods[key] = {
        entries: override?.entries ?? liveRef.current.entries,
        chargeCodes: override?.chargeCodes ?? liveRef.current.chargeCodes,
        status: override?.status ?? liveRef.current.status,
        savedAt: override?.savedAt ?? now.toISOString(),
      }
      writeStorage(data)
      return now
    },
    []
  )

  /** Replace in-memory state with whatever's saved for (type, start). */
  const loadPeriod = useCallback((type: PeriodType, start: Date) => {
    const data = readStorage()
    const saved = data.periods[periodStorageKey(type, start)]
    if (saved) {
      setEntries(saved.entries ?? {})
      setChargeCodes(saved.chargeCodes ?? [])
      setStatus(saved.status ?? 'saved')
      setLastSavedAt(saved.savedAt ? new Date(saved.savedAt) : null)
      const hasAnything =
        (saved.chargeCodes?.length ?? 0) > 0 || Object.keys(saved.entries ?? {}).length > 0
      setHasStarted(hasAnything)
      setRecentlyAddedIds(new Set())
    } else {
      setEntries({})
      setChargeCodes([])
      setStatus('draft')
      setLastSavedAt(null)
      setHasStarted(false)
      setRecentlyAddedIds(new Set())
    }
  }, [])

  // One-time hydration on mount: restore prefs + load current period.
  useEffect(() => {
    const data = readStorage()
    const prefs = data.prefs ?? {}
    const restoredType: PeriodType = prefs.periodType ?? 'semi-monthly'
    const restoredCountry: Country = prefs.country ?? 'US'
    const restoredWeekends = prefs.includeWeekends ?? false
    setPeriodTypeState(restoredType)
    setCountry(restoredCountry)
    setIncludeWeekends(restoredWeekends)
    const { start } = getPeriodBounds(referenceDate, restoredType)
    loadPeriod(restoredType, start)
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist prefs whenever they change (after hydration).
  useEffect(() => {
    if (!hydrated) return
    const data = readStorage()
    data.prefs = { country, includeWeekends, periodType }
    writeStorage(data)
  }, [hydrated, country, includeWeekends, periodType])

  const setEntry = useCallback(
    (chargeCodeId: string, dateStr: string, hours: number | '') => {
      setEntries((prev) => ({
        ...prev,
        [dateStr]: {
          ...(prev[dateStr] || {}),
          [chargeCodeId]: hours,
        },
      }))
      setStatus((prev) => (prev === 'submitted' ? prev : 'draft'))
      setHasStarted(true)
    },
    []
  )

  /** Keep only codes that have any hours in the period — pruning empty rows. */
  function pruneEmpty(codes: ChargeCode[], next: Record<string, Record<string, number | ''>>, workdays: Date[]): ChargeCode[] {
    return codes.filter((cc) =>
      workdays.some((d) => {
        const v = next[formatDate(d)]?.[cc.id]
        return typeof v === 'number' && v > 0
      })
    )
  }

  const fillDefaults = useCallback(() => {
    // Ensure at least one code is present — pick the user's primary grow code from the assigned pool.
    const effectiveCodes: ChargeCode[] = chargeCodes.length > 0
      ? chargeCodes
      : [ASSIGNED_CHARGE_CODES.find(c => c.category === 'grow') ?? ASSIGNED_CHARGE_CODES[0]]

    const growCodes = effectiveCodes.filter((c) => c.category === 'grow')
    const targets = growCodes.length > 0 ? growCodes : effectiveCodes
    if (targets.length === 0) return

    const allDates = getDatesInPeriod(periodStart, periodEnd)
    const workdays = allDates.filter((d) => !isWeekend(d))

    const next: Record<string, Record<string, number | ''>> = { ...entries }
    workdays.forEach((date) => {
      const dateStr = formatDate(date)
      next[dateStr] = { ...(next[dateStr] || {}) }
      const hoursEach = Math.floor(7 / targets.length)
      const remainder = 7 - hoursEach * targets.length
      targets.forEach((cc, i) => {
        next[dateStr][cc.id] = hoursEach + (i === 0 ? remainder : 0)
      })
    })

    setEntries(next)
    setChargeCodes(pruneEmpty(effectiveCodes, next, workdays))
    setRecentlyAddedIds(new Set())
    setStatus('draft')
    setHasStarted(true)
  }, [chargeCodes, entries, periodStart, periodEnd])

  const copyLastPeriod = useCallback(() => {
    // Simulate "last period" — auto-add a representative mix of codes if empty.
    const effectiveCodes: ChargeCode[] = chargeCodes.length > 0
      ? chargeCodes
      : [
          ASSIGNED_CHARGE_CODES.find(c => c.category === 'grow') ?? ASSIGNED_CHARGE_CODES[0],
          ASSIGNED_CHARGE_CODES.find(c => c.category === 'non-billable') ?? ASSIGNED_CHARGE_CODES[0],
        ].filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i)

    const allDates = getDatesInPeriod(periodStart, periodEnd)
    const workdays = allDates.filter((d) => !isWeekend(d))
    const growCodes = effectiveCodes.filter((c) => c.category === 'grow')
    const nonBillable = effectiveCodes.filter((c) => c.category === 'non-billable')

    const next: Record<string, Record<string, number | ''>> = { ...entries }
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

    setEntries(next)
    setChargeCodes(pruneEmpty(effectiveCodes, next, workdays))
    setRecentlyAddedIds(new Set())
    setStatus('draft')
    setHasStarted(true)
  }, [chargeCodes, entries, periodStart, periodEnd])

  const saveTimesheet = useCallback(() => {
    const now = persistPeriod({ status: 'saved' })
    setStatus('saved')
    setLastSavedAt(now)
  }, [persistPeriod])

  const submitTimesheet = useCallback(() => {
    const now = persistPeriod({ status: 'submitted' })
    setStatus('submitted')
    setLastSavedAt(now)
  }, [persistPeriod])

  const resetTimesheet = useCallback(() => {
    // Mark in-memory + storage as draft again so the user can edit.
    const now = persistPeriod({ status: 'draft' })
    setStatus('draft')
    setLastSavedAt(now)
  }, [persistPeriod])

  const addChargeCode = useCallback((code: ChargeCode) => {
    setChargeCodes((prev) => {
      if (prev.some((c) => c.id === code.id || c.code.toLowerCase() === code.code.toLowerCase())) {
        return prev
      }
      return [...prev, code]
    })
    setRecentlyAddedIds((prev) => {
      const next = new Set(prev)
      next.add(code.id)
      return next
    })
    setHasStarted(true)
    setStatus((prev) => (prev === 'submitted' ? prev : 'draft'))
  }, [])

  const removeChargeCode = useCallback((id: string) => {
    if (id === HOLIDAY_CODE_ID) return // auto-managed — users can't delete it
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
    setRecentlyAddedIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setStatus((prev) => (prev === 'submitted' ? prev : 'draft'))
  }, [])

  /**
   * Auto-save the current period if it has unsaved changes, so navigation
   * never loses the user's work silently.
   */
  const autoSaveIfDirty = useCallback(() => {
    if (liveRef.current.status === 'draft' && liveRef.current.hasStarted) {
      persistPeriod({ status: 'saved' })
    }
  }, [persistPeriod])

  const navigatePeriod = useCallback(
    (delta: number) => {
      autoSaveIfDirty()
      const newRef = addPeriod(referenceDate, periodType, delta)
      const { start: newStart } = getPeriodBounds(newRef, periodType)
      setReferenceDate(newRef)
      loadPeriod(periodType, newStart)
    },
    [referenceDate, periodType, autoSaveIfDirty, loadPeriod]
  )

  const setPeriodType = useCallback(
    (type: PeriodType) => {
      autoSaveIfDirty()
      const { start: newStart } = getPeriodBounds(referenceDate, type)
      setPeriodTypeState(type)
      loadPeriod(type, newStart)
    },
    [referenceDate, autoSaveIfDirty, loadPeriod]
  )

  /**
   * Auto-manage the HOLIDAY charge code based on the active period and country.
   * Adds the code + pre-fills 7h on each public holiday in the period.
   * Removes the code (and clears its entries) when no holidays are present.
   */
  useEffect(() => {
    const periodStartStr = formatDate(periodStart)
    const periodEndStr = formatDate(periodEnd)
    const holidaysInPeriod = getHolidaysInPeriod(periodStartStr, periodEndStr, country)

    if (holidaysInPeriod.length === 0) {
      setChargeCodes((prev) =>
        prev.some((c) => c.id === HOLIDAY_CODE_ID)
          ? prev.filter((c) => c.id !== HOLIDAY_CODE_ID)
          : prev
      )
      setEntries((prev) => {
        let changed = false
        const next: typeof prev = {}
        for (const ds of Object.keys(prev)) {
          if (prev[ds][HOLIDAY_CODE_ID] !== undefined) {
            const row = { ...prev[ds] }
            delete row[HOLIDAY_CODE_ID]
            next[ds] = row
            changed = true
          } else {
            next[ds] = prev[ds]
          }
        }
        return changed ? next : prev
      })
      return
    }

    setChargeCodes((prev) =>
      prev.some((c) => c.id === HOLIDAY_CODE_ID)
        ? prev
        : [HOLIDAY_CHARGE_CODE, ...prev]
    )

    setEntries((prev) => {
      const next = { ...prev }
      let changed = false
      holidaysInPeriod.forEach((h) => {
        const existing = next[h.date]?.[HOLIDAY_CODE_ID]
        if (existing !== HOLIDAY_HOURS_PER_DAY) {
          next[h.date] = { ...(next[h.date] || {}), [HOLIDAY_CODE_ID]: HOLIDAY_HOURS_PER_DAY }
          changed = true
        }
      })
      return changed ? next : prev
    })

    setHasStarted(true)
  }, [periodStart, periodEnd, country])

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
      recentlyAddedIds,
      country,
      includeWeekends,
      lastSavedAt,
      setEntry,
      fillDefaults,
      copyLastPeriod,
      saveTimesheet,
      submitTimesheet,
      resetTimesheet,
      addChargeCode,
      removeChargeCode,
      navigatePeriod,
      setPeriodType,
      setCountry,
      setIncludeWeekends,
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
      recentlyAddedIds,
      country,
      includeWeekends,
      lastSavedAt,
      setEntry,
      fillDefaults,
      copyLastPeriod,
      saveTimesheet,
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
