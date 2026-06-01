'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTimesheet } from './timesheet-context'
import { Category } from './types'
import { cn } from '@/lib/utils'

const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'grow', label: 'Grow', color: '#2251FF' },
  { value: 'run', label: 'Run', color: '#16A34A' },
  { value: 'non-billable', label: 'Non-Billable', color: '#6B7280' },
]

export function AddChargeCodeDialog() {
  const { addChargeCode, chargeCodes } = useTimesheet()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('grow')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!code.trim()) { setError('Code is required'); return }
    if (!description.trim()) { setError('Description is required'); return }
    if (chargeCodes.some(c => c.code.toLowerCase() === code.trim().toLowerCase())) {
      setError('Charge code already exists')
      return
    }
    addChargeCode({
      id: crypto.randomUUID(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      category,
    })
    setCode('')
    setDescription('')
    setCategory('grow')
    setError('')
    setOpen(false)
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Charge Code</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="e.g. PRJ-007"
                value={code}
                onChange={e => { setCode(e.target.value); setError('') }}
                className="uppercase"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                placeholder="e.g. Project Delta"
                value={description}
                onChange={e => { setDescription(e.target.value); setError('') }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <div className="flex gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-sm font-medium transition-all',
                      category === cat.value
                        ? 'border-transparent text-white'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
                    )}
                    style={category === cat.value ? { backgroundColor: cat.color } : {}}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category === cat.value ? 'white' : cat.color }}
                    />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} style={{ backgroundColor: 'var(--primary)' }}>
              Add Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
