import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { TopNav } from '@/components/nav/top-nav'
import { MobileBottomNav } from '@/components/nav/mobile-bottom-nav'
import { TimesheetProvider } from '@/components/timesheet/timesheet-context'
import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const _geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'MyTime Reimagined',
  description: 'Modern timesheet management for your team.',
  generator: 'v0.app',
}

export const viewport = {
  themeColor: '#051C2C',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_inter.variable} ${_geistMono.variable} font-sans antialiased bg-background`}>
        <ThemeProvider defaultTheme="light">
          <TimesheetProvider>
            <div className="min-h-screen flex flex-col">
              <TopNav />
              <main className="flex-1 pb-16 md:pb-0">
                {children}
              </main>
              <MobileBottomNav />
            </div>
          </TimesheetProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
