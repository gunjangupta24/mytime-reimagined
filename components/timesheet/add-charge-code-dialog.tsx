'use client'

import { useMemo, useState } from 'react'
import { Check, MapPin, Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useTimesheet } from './timesheet-context'
import { CATEGORY_COLORS } from './types'
import { cn } from '@/lib/utils'

export function AddChargeCodeDialog() {
  const { assignedCodes, chargeCodes, addChargeCode, removeChargeCode } = useTimesheet()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [customCode, setCustomCode] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [customError, setCustomError] = useState('')

  const addedIds = useMemo(() => new Set(chargeCodes.map((c) => c.id)), [chargeCodes])
  const addedCodes = useMemo(
    () => new Set(chargeCodes.map((c) => c.code.toLowerCase())),
    [chargeCodes]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return assignedCodes
    return assignedCodes.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.location ?? '').toLowerCase().includes(q)
    )
  }, [assignedCodes, query])

  function toggle(codeId: string) {
    if (addedIds.has(codeId)) {
      removeChargeCode(codeId)
    } else {
      const code = assignedCodes.find((c) => c.id === codeId)
      if (code) addChargeCode(code)
    }
  }

  function submitCustom() {
    const code = customCode.trim().toUpperCase()
    const description = customDescription.trim()
    if (!code) { setCustomError('Code is required'); return }
    if (!description) { setCustomError('Description is required'); return }
    if (addedCodes.has(code.toLowerCase())) { setCustomError('Already added'); return }
    addChargeCode({
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `c-${Date.now()}`,
      code,
      description,
      category: 'grow',
    })
    setCustomCode('')
    setCustomDescription('')
    setCustomError('')
    setShowCustom(false)
  }

  function resetCustom() {
    setShowCustom(false)
    setCustomCode('')
    setCustomDescription('')
    setCustomError('')
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setQuery('')
      resetCustom()
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 h-8 text-xs font-medium"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Code
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle className="text-lg">Add charge codes</DialogTitle>
            <DialogDescription className="text-sm">
              Pick from codes assigned to you — tap to add, tap again to remove.
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="px-6 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code, project, or location"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-9"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of assigned codes */}
          <div className="max-h-[320px] overflow-y-auto border-t border-border">
            {filtered.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No matches. Try a different search or add a custom code below.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((cc) => {
                  const isAdded = addedIds.has(cc.id)
                  const color = CATEGORY_COLORS[cc.category]
                  return (
                    <li key={cc.id}>
                      <button
                        type="button"
                        onClick={() => toggle(cc.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-6 py-3 text-left transition-colors',
                          isAdded
                            ? 'bg-primary/5 hover:bg-primary/10'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs font-semibold text-foreground">{cc.code}</p>
                          <p className="text-xs text-muted-foreground truncate">{cc.description}</p>
                          {cc.location && (
                            <p className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              <span className="truncate">{cc.location}</span>
                            </p>
                          )}
                        </div>
                        <span
                          className={cn(
                            'flex items-center justify-center h-7 w-7 rounded-full border transition-all flex-shrink-0',
                            isAdded
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border text-muted-foreground'
                          )}
                          aria-hidden
                        >
                          {isAdded ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Custom code */}
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            {!showCustom ? (
              <button
                type="button"
                onClick={() => setShowCustom(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Plus className="h-4 w-4" />
                Add a custom code
              </button>
            ) : (
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Code (e.g. PRJ-099)"
                    value={customCode}
                    onChange={(e) => { setCustomCode(e.target.value); setCustomError('') }}
                    className="uppercase sm:max-w-[180px]"
                    autoFocus
                  />
                  <Input
                    placeholder="Description"
                    value={customDescription}
                    onChange={(e) => { setCustomDescription(e.target.value); setCustomError('') }}
                    className="flex-1"
                  />
                </div>
                {customError && <p className="text-xs text-destructive">{customError}</p>}
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={resetCustom} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={submitCustom} className="h-8 text-xs">
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-3 border-t border-border">
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-xs text-muted-foreground">
                {chargeCodes.length} {chargeCodes.length === 1 ? 'code' : 'codes'} in your timesheet
              </span>
              <Button size="sm" onClick={() => handleOpenChange(false)} className="h-8 text-xs">
                Done
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
