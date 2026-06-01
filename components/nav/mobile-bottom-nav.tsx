'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/timesheet', label: 'Timesheet', icon: Clock },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  // Don't show the bottom nav on the landing page
  if (pathname === '/') return null

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 border-t border-border bg-card/95 backdrop-blur-sm"
      aria-label="Mobile navigation"
    >
      <ul className="flex h-full items-center">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 h-full w-full transition-colors',
                  active ? 'text-accent' : 'text-muted-foreground'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={cn('w-5 h-5 transition-transform', active && 'scale-110')}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>
                  {label}
                </span>
                {active && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-accent rounded-t-full" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
