'use client'

import * as React from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
})

export function useTheme() {
  return React.useContext(ThemeContext)
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  // On mount, read from localStorage and apply class
  React.useEffect(() => {
    const stored = localStorage.getItem('timeflow-theme') as Theme | null
    const resolved = stored ?? defaultTheme
    setThemeState(resolved)
    applyTheme(resolved)
    setMounted(true)
  }, [defaultTheme])

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next)
    localStorage.setItem('timeflow-theme', next)
    applyTheme(next)
  }, [])

  // Prevent flash — render children invisible until mount resolves theme
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div style={mounted ? undefined : { visibility: 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}
