'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const APP_LINKS = [
  { href: '/timesheet', label: 'Timesheet' },
  { href: '/dashboard', label: 'Dashboard' },
]

// Avatar shared across both nav variants
function UserAvatar({ showName }: { showName?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {showName && (
        <div className="text-right leading-none hidden md:block">
          <p className="text-[12px] font-semibold text-white">Alex Johnson</p>
          <p className="text-[11px] text-white/45 mt-0.5">New York</p>
        </div>
      )}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: '#2251FF', boxShadow: '0 0 0 2px rgba(255,255,255,0.15)' }}
        aria-label="User avatar: Alex Johnson"
      >
        AJ
      </div>
    </div>
  )
}

// Wordmark shared across both nav variants
function Wordmark({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 flex-shrink-0 select-none"
      aria-label="MyTime Reimagined home"
    >
      <div
        className="h-6 w-6 rounded flex items-center justify-center text-[10px] font-black tracking-tighter text-white select-none"
        style={{ background: '#2251FF' }}
        aria-hidden
      >
        MT
      </div>
      <span className="font-bold text-[15px] tracking-tight text-white hidden sm:block">
        MyTime <span className="font-normal text-white/50">Reimagined</span>
      </span>
    </Link>
  )
}

export function TopNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isLanding = pathname === '/'

  // Minimal variant for the landing page
  if (isLanding) {
    return (
      <header
        className="sticky top-0 z-50 h-14 flex items-center px-4 md:px-6"
        style={{ background: '#051C2C', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Wordmark href="/" />
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-[15px] w-[15px]" />
              ) : (
                <Moon className="h-[15px] w-[15px]" />
              )}
            </Button>
          )}
          <UserAvatar />
        </div>
      </header>
    )
  }

  // Full variant for app pages (/timesheet, /dashboard, /profile)
  return (
    <header
      className="sticky top-0 z-50 h-14 flex items-center px-4 md:px-6 gap-4 md:gap-6"
      style={{ background: '#051C2C', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      <Wordmark href="/" />

      <div className="hidden md:block w-px h-5 bg-white/15 flex-shrink-0" />

      <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
        {APP_LINKS.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150',
                active
                  ? 'text-white bg-white/10'
                  : 'text-white/55 hover:text-white hover:bg-white/8'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {label}
              {active && (
                <span
                  className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-t-full"
                  style={{ background: '#2251FF' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-[15px] w-[15px]" />
            ) : (
              <Moon className="h-[15px] w-[15px]" />
            )}
          </Button>
        )}
        <UserAvatar showName />
      </div>
    </header>
  )
}
