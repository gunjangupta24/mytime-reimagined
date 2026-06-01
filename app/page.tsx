'use client'

import Link from 'next/link'
import { useRef, useState, useCallback } from 'react'
import {
  Zap,
  CalendarClock,
  Smartphone,
  Download,
  Upload,
  CheckCircle2,
  ArrowRight,
  FileSpreadsheet,
  Clock3,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTimesheet } from '@/components/timesheet/timesheet-context'

// ─── Phone mockup ─────────────────────────────────────────────────────
const PREVIEW_ROWS = [
  { code: 'PRJ-001', description: 'Project Alpha (Growth)', hours: 3, category: 'grow' as const },
  { code: 'PRJ-002', description: 'Project Alpha (Ops)',    hours: 2, category: 'run'  as const },
  { code: 'TRN-001', description: 'Training',               hours: 1, category: 'non-billable' as const },
  { code: 'ADM-001', description: 'Admin',                  hours: 1, category: 'non-billable' as const },
]
const CAT_COLOR: Record<string, string> = {
  grow: '#2251FF',
  run: '#16A34A',
  'non-billable': '#6B7280',
}

function PhoneMockup() {
  return (
    /*
     * Outer wrapper: positions the phone with a tilt + lift.
     * The transform is purely decorative — no interaction needed.
     */
    <div
      aria-hidden
      className="relative flex-shrink-0 select-none"
      style={{
        transform: 'perspective(900px) rotateY(-12deg) rotateX(4deg)',
        transformStyle: 'preserve-3d',
        filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.55)) drop-shadow(0 8px 24px rgba(0,0,0,0.35))',
      }}
    >
      {/* ── iPhone frame ─────────────────────────────────── */}
      <div
        className="relative w-[220px] rounded-[36px] overflow-hidden"
        style={{
          background: 'linear-gradient(170deg, #1c1c1e 0%, #0a0a0b 100%)',
          padding: '10px',
          boxShadow:
            'inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.18)',
        }}
      >
        {/* Side buttons (decorative) */}
        <div className="absolute left-[-3px] top-[88px] w-[3px] h-6 rounded-l-full" style={{ background: '#2a2a2c' }} />
        <div className="absolute left-[-3px] top-[122px] w-[3px] h-10 rounded-l-full" style={{ background: '#2a2a2c' }} />
        <div className="absolute left-[-3px] top-[140px] w-[3px] h-10 rounded-l-full" style={{ background: '#2a2a2c' }} />
        <div className="absolute right-[-3px] top-[108px] w-[3px] h-14 rounded-r-full" style={{ background: '#2a2a2c' }} />

        {/* Screen bezel */}
        <div
          className="relative rounded-[28px] overflow-hidden"
          style={{ background: '#F7F8FA', minHeight: '440px' }}
        >
          {/* Dynamic Island */}
          <div className="flex justify-center pt-3 pb-0">
            <div
              className="w-[80px] h-[24px] rounded-full"
              style={{ background: '#0a0a0b' }}
            />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-1 pb-0">
            <span className="text-[9px] font-semibold text-[#1A1A1A]">9:41</span>
            <div className="flex items-center gap-1">
              {/* Signal bars */}
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <rect x="0" y="5" width="2" height="3" rx="0.5" fill="#1A1A1A"/>
                <rect x="3" y="3.5" width="2" height="4.5" rx="0.5" fill="#1A1A1A"/>
                <rect x="6" y="2" width="2" height="6" rx="0.5" fill="#1A1A1A"/>
                <rect x="9" y="0.5" width="2" height="7.5" rx="0.5" fill="#1A1A1A"/>
              </svg>
              {/* Wifi */}
              <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                <path d="M5.5 6.5a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6z" fill="#1A1A1A"/>
                <path d="M2.5 4.5C3.4 3.6 4.4 3 5.5 3s2.1.6 3 1.5" stroke="#1A1A1A" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
                <path d="M0.5 2.5C2 1 3.7 0 5.5 0s3.5 1 5 2.5" stroke="#1A1A1A" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
              </svg>
              {/* Battery */}
              <div className="flex items-center gap-[1px]">
                <div className="w-[18px] h-[9px] rounded-[2px] border border-[#1A1A1A]/50 p-[1.5px]">
                  <div className="h-full rounded-[1px] bg-[#1A1A1A]" style={{ width: '80%' }} />
                </div>
                <div className="w-[1.5px] h-[4px] rounded-r-full bg-[#1A1A1A]/50" />
              </div>
            </div>
          </div>

          {/* ── App content ─────────────────────────────── */}
          <div className="px-3 pt-2 pb-4">
            {/* Top bar */}
            <div
              className="rounded-xl px-3 py-2 mb-3 flex items-center justify-between"
              style={{ background: '#051C2C' }}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded flex items-center justify-center text-[7px] font-black text-white"
                  style={{ background: '#2251FF' }}
                >MT</div>
                <span className="text-[9px] font-bold text-white">MyTime</span>
              </div>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[7px] font-bold"
                style={{ background: '#2251FF' }}
              >AJ</div>
            </div>

            {/* Day navigator */}
            <div className="flex items-center justify-between mb-2.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,58,107,0.1)' }}
              >
                <ChevronLeft className="w-3 h-3" style={{ color: '#003A6B' }} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-[#1A1A1A]">Monday</p>
                <p className="text-[8px] text-[#6B7280]">Jun 2, 2026</p>
              </div>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,58,107,0.1)' }}
              >
                <ChevronRight className="w-3 h-3" style={{ color: '#003A6B' }} />
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex justify-center gap-1 mb-3">
              {['Mon','Tue','Wed','Thu','Fri'].map((d, i) => (
                <div
                  key={d}
                  className="rounded-full"
                  style={{
                    width: i === 0 ? 14 : 5,
                    height: 5,
                    background: i === 0 ? '#2251FF' : 'rgba(0,0,0,0.15)',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>

            {/* Charge code rows */}
            <div className="flex flex-col gap-1.5 mb-3">
              {PREVIEW_ROWS.map((row) => (
                <div
                  key={row.code}
                  className="rounded-lg px-2.5 py-2 flex items-center justify-between"
                  style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: CAT_COLOR[row.category] }}
                    />
                    <div className="min-w-0">
                      <p className="text-[8px] font-semibold text-[#1A1A1A] truncate leading-tight">{row.description}</p>
                      <p className="text-[7px] text-[#6B7280] leading-tight">{row.code}</p>
                    </div>
                  </div>
                  <div
                    className="flex-shrink-0 w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                    style={{ background: 'rgba(34,81,255,0.08)', color: '#2251FF' }}
                  >
                    {row.hours}
                  </div>
                </div>
              ))}
            </div>

            {/* Daily total */}
            <div
              className="rounded-lg px-2.5 py-2 flex items-center justify-between"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <span className="text-[9px] font-semibold text-[#15803d]">Daily Total</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-[#15803d]">7h</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              className="mt-3 w-full rounded-xl py-2 text-[9px] font-bold text-white"
              style={{ background: '#003A6B' }}
            >
              Submit Timesheet
            </button>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-2 pt-0">
            <div className="w-16 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.2)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Feature cards ───────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Zap,
    title: 'Smart Defaults',
    description:
      'Pre-fill 7 hours across your charge codes in one click. Zero repetitive typing.',
    accent: '#2251FF',
    bg: 'rgba(34,81,255,0.07)',
  },
  {
    icon: CalendarClock,
    title: 'Calendar Sync',
    description:
      'Auto-map your meetings and focus blocks to the right charge codes without guessing.',
    accent: '#16A34A',
    bg: 'rgba(22,163,74,0.07)',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    description:
      'Fill your timesheet from any device. Card-by-card day view built for phones.',
    accent: '#003A6B',
    bg: 'rgba(0,58,107,0.07)',
  },
]

// ─── Upload dropzone ─────────────────────────────────────────────────
function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return
    setPreview(file.name)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFile(e.dataTransfer.files[0])
    },
    [handleFile]
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload timesheet — click or drag and drop"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className="mt-3 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none"
      style={{
        borderColor: isDragging ? '#2251FF' : '#D1D9E6',
        background: isDragging ? 'rgba(34,81,255,0.04)' : 'transparent',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
        {preview ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <p className="text-sm font-semibold text-foreground">{preview}</p>
            <p className="text-xs text-muted-foreground">Upload complete</p>
          </>
        ) : (
          <>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,58,107,0.08)' }}
            >
              <Upload className="w-5 h-5" style={{ color: '#003A6B' }} />
            </div>
            <p className="text-sm font-medium text-foreground">
              Drop your file here, or{' '}
              <span style={{ color: '#2251FF' }} className="font-semibold">
                browse
              </span>
            </p>
            <p className="text-xs text-muted-foreground">.xlsx, .xls, .csv supported</p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { fillDefaults } = useTimesheet()

  function handleDownloadTemplate() {
    // Mock download — in production would trigger file download
  }

  return (
    <div className="flex flex-col">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #051C2C 0%, #0A3260 55%, #0D4080 100%)' }}
        >
          {/* Subtle grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row md:items-center gap-12 md:gap-16">
            {/* ── Left: text content ── */}
            <div className="flex flex-col items-start gap-6 flex-1 min-w-0">
              {/* Greeting pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/8 backdrop-blur-sm">
                <div
                  className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: '#2251FF' }}
                >
                  AJ
                </div>
                <span className="text-white/80 text-xs font-medium">
                  Welcome back, <span className="text-white font-semibold">Alex</span>
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-[52px] font-extrabold text-white tracking-tight leading-[1.1] text-balance">
                MyTime{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #6B9FFF 0%, #A8C4FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Reimagined
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-white/65 max-w-md text-pretty leading-relaxed">
                The fastest way to fill your timesheet. Smart defaults, calendar sync, zero friction.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/timesheet">
                  <Button
                    size="lg"
                    className="gap-2 font-semibold h-11 px-6 text-white shadow-lg shadow-blue-900/30 hover:opacity-90 transition-opacity"
                    style={{ background: '#003A6B', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    Fill Timesheet
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="gap-2 font-medium h-11 px-6 text-white/75 hover:text-white hover:bg-white/10 border border-white/15 transition-all"
                  >
                    View Dashboard
                  </Button>
                </Link>
              </div>

              {/* Period badge */}
              <Badge
                className="gap-1.5 px-2.5 py-1 text-[11px] font-medium border-white/15 bg-white/10 text-white/70"
              >
                <Clock3 className="w-3 h-3" />
                Jun 1 – Jun 15, 2026 &middot; Draft
              </Badge>
            </div>

            {/* ── Right: phone mockup ── */}
            <div className="flex justify-center md:justify-end flex-shrink-0 md:self-end md:mb-[-24px]">
              <PhoneMockup />
            </div>
          </div>
        </section>

        {/* ── Feature cards ──────────────────────────────────── */}
        <section className="max-w-5xl mx-auto w-full px-6 py-14 md:py-16 flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Built for how you actually work
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Less clicking, more billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, description, accent, bg }) => (
              <div
                key={title}
                className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: accent }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Import section ─────────────────────────────────── */}
        <section className="max-w-5xl mx-auto w-full px-6 pb-14 md:pb-20">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Header strip */}
            <div
              className="px-6 py-4 flex items-center gap-3 border-b border-border"
              style={{ background: 'rgba(0,58,107,0.04)' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,58,107,0.1)' }}
              >
                <FileSpreadsheet className="w-5 h-5" style={{ color: '#003A6B' }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Import from Excel</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Download our template, fill it offline, and upload it here
                </p>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Download */}
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Step 1 — Get the template
                </p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Our pre-formatted Excel template includes your charge codes, a date range, and
                  validation rules to ensure a clean import.
                </p>
                <Button
                  variant="outline"
                  className="gap-2 h-9 text-sm font-medium"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px bg-border self-stretch mx-2" />
              <div className="sm:hidden h-px bg-border" />

              {/* Upload */}
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Step 2 — Upload your file
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Drag and drop your completed template or click to browse. We&apos;ll parse and
                  load it into your timesheet grid instantly.
                </p>
                <UploadZone />
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick-fill CTA banner ───────────────────────────── */}
        <section
          className="border-t border-border py-10 px-6"
          style={{ background: '#F0F4FA' }}
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Ready to fill Jun 1 – 15?
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                One click fills 7h per workday across your Grow codes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/timesheet">
                <Button
                  onClick={fillDefaults}
                  className="gap-2 h-9 text-sm font-semibold text-white"
                  style={{ background: '#003A6B' }}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  Fill Defaults
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
    </div>
  )
}
