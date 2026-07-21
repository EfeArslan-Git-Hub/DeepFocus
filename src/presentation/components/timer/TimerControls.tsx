'use client'

/**
 * TimerControls — Başlat / Duraklat / Devam Et / Sıfırla butonları.
 *
 * Durum makinesine göre tek büyük aksiyon butonu + küçük sıfırla butonu.
 *
 * @packageDocumentation
 */

import React from 'react'
import { cn } from '@/shared/utils/cn.utils'
import type { TimerStatus } from '@/domain/entities/timer.entity'

interface TimerControlsProps {
  /** Timer durumu */
  readonly status: TimerStatus
  /** Mod vurgu rengi */
  readonly color: string
  /** Start/Pause/Resume toggle callback'i */
  readonly onToggle: () => void
  /** Sıfırla callback'i */
  readonly onReset: () => void
  /** CSS class */
  readonly className?: string
}

/** Duruma göre buton metni */
function getMainButtonLabel(status: TimerStatus): string {
  switch (status) {
    case 'idle':
      return 'Başlat'
    case 'running':
      return 'Duraklat'
    case 'paused':
      return 'Devam Et'
    case 'completed':
      return 'Yeniden Başlat'
  }
}

/** Durumuna göre buton ikonu (inline SVG) */
function MainButtonIcon({ status }: { status: TimerStatus }) {
  if (status === 'running') {
    // Pause ikon
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
    )
  }
  if (status === 'completed') {
    // Refresh ikon
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    )
  }
  // Play ikon (idle veya paused)
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  )
}

/**
 * Timer kontrol butonları.
 */
export function TimerControls({
  status,
  color,
  onToggle,
  onReset,
  className,
}: TimerControlsProps) {
  const showReset = status !== 'idle'

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Ana aksiyon butonu */}
      <button
        id="btn-timer-toggle"
        onClick={onToggle}
        className={cn(
          'group relative flex items-center gap-3 overflow-hidden',
          'rounded-full px-10 py-4 text-base font-semibold text-white',
          'transition-all duration-200 ease-out',
          'hover:scale-105 active:scale-95',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2',
          'shadow-xl',
        )}
        style={{
          background: `linear-gradient(135deg, ${color}cc, ${color})`,
          boxShadow: `0 8px 32px ${color}40, 0 2px 8px ${color}20`,
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          ['--tw-ring-color' as string]: `${color}80`,
        }}
        aria-label={getMainButtonLabel(status)}
      >
        {/* Parlaklık efekti */}
        <span
          className="absolute inset-0 translate-x-[-100%] bg-white/10 skew-x-[-20deg] transition-transform duration-500 group-hover:translate-x-[200%]"
          aria-hidden="true"
        />

        <MainButtonIcon status={status} />
        <span>{getMainButtonLabel(status)}</span>
      </button>

      {/* Sıfırla butonu */}
      {showReset && (
        <button
          id="btn-timer-reset"
          onClick={onReset}
          className={cn(
            'flex items-center gap-2 rounded-full px-5 py-2',
            'text-sm text-[var(--color-text-secondary)]',
            'transition-all duration-200',
            'hover:text-[var(--color-text-primary)] hover:bg-[var(--color-glass-bg)]',
            'focus-visible:outline-none focus-visible:ring-2',
            'border border-transparent hover:border-[var(--color-glass-border)]',
          )}
          aria-label="Timer'ı sıfırla"
        >
          {/* Sıfırla ikonu */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Sıfırla
        </button>
      )}
    </div>
  )
}
