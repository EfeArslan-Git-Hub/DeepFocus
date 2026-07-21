'use client'

/**
 * TimerModeSelector — Odaklan / Kısa Mola / Uzun Mola sekme seçici.
 *
 * Aktif modun rengini ve altçizgisini gösterir.
 *
 * @packageDocumentation
 */

import React from 'react'
import { cn } from '@/shared/utils/cn.utils'
import { MODE_LABELS, MODE_COLORS } from '@/shared/constants/timer.constants'
import type { TimerMode, TimerStatus } from '@/domain/entities/timer.entity'

interface TimerModeSelectorProps {
  /** Aktif mod */
  readonly activeMode: TimerMode
  /** Timer durumu (çalışırken mod değiştirilemez) */
  readonly status: TimerStatus
  /** Mod değişimi callback'i */
  readonly onModeChange: (mode: TimerMode) => void
  /** CSS class */
  readonly className?: string
}

const MODES: TimerMode[] = ['focus', 'short-break', 'long-break']

/**
 * Mod seçici tab bileşeni.
 * Timer çalışırken butonlar devre dışı bırakılır.
 */
export function TimerModeSelector({
  activeMode,
  status,
  onModeChange,
  className,
}: TimerModeSelectorProps) {
  const isDisabled = status === 'running'

  return (
    <div
      className={cn('flex items-center gap-1 rounded-full p-1', className)}
      style={{ background: 'var(--color-glass-bg)', border: '1px solid var(--color-glass-border)' }}
      role="tablist"
      aria-label="Timer modu seç"
    >
      {MODES.map((mode) => {
        const isActive = mode === activeMode
        const color = MODE_COLORS[mode]

        return (
          <button
            key={mode}
            id={`timer-mode-${mode}`}
            role="tab"
            aria-selected={isActive}
            aria-disabled={isDisabled && !isActive}
            disabled={isDisabled && !isActive}
            onClick={() => !isDisabled && onModeChange(mode)}
            className={cn(
              'relative rounded-full px-4 py-2 text-sm font-medium',
              'transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
              isActive
                ? 'text-white shadow-lg'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
              isDisabled && !isActive && 'cursor-not-allowed opacity-40',
            )}
            style={
              isActive
                ? {
                    background: `${color}22`,
                    boxShadow: `0 0 16px ${color}30`,
                    color,
                    borderBottom: `2px solid ${color}`,
                  }
                : {}
            }
          >
            {MODE_LABELS[mode]}

            {/* Aktif göstergesi — alt nokta */}
            {isActive && (
              <span
                className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full"
                style={{ background: color }}
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
