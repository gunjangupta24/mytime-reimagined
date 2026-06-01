'use client'

import { useTheme } from '@/components/theme-provider'
import { Sun, Moon, MapPin, Mail, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { theme, setTheme } = useTheme()

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
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Toggle light / dark appearance</p>
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
