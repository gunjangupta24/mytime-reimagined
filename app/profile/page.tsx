'use client'

import { useTheme } from '@/components/theme-provider'
import { Sun, Moon, MapPin, Building2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTimesheet } from '@/components/timesheet/timesheet-context'
import { COUNTRY_LABELS, Country } from '@/components/timesheet/holidays'

export default function ProfilePage() {
  const { theme, setTheme } = useTheme()
  const { country, setCountry } = useTimesheet()

  return (
    <div className="max-w-[600px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
      <h1 className="text-xl font-bold text-foreground tracking-tight">Profile</h1>

      {/* Avatar card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ backgroundColor: '#003A6B' }}
        >
          AJ
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">Alex Johnson</p>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            New York
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-sm text-muted-foreground">
            <Building2 className="w-3.5 h-3.5" />
            Corporate Finance
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4">Preferences</h2>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Holiday Calendar</p>
              <p className="text-xs text-muted-foreground">Public holidays shown on your timesheet</p>
            </div>
          </div>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value as Country)}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Holiday calendar country"
          >
            {(Object.keys(COUNTRY_LABELS) as Country[]).map((c) => (
              <option key={c} value={c}>
                {COUNTRY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Toggle light / dark appearance</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="gap-2"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </div>
    </div>
  )
}
