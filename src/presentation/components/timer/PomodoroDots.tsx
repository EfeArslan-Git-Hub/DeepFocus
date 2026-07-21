'use client'

/**
 * PomodoroDots — Pomodoro tamamlanma noktaları.
 *
 * Uzun molaya kaç pomodoro kaldığını görsel olarak gösterir.
 *
 * @packageDocumentation
 */

import React from 'react'
import { cn } from '@/shared/utils/cn.utils'
import { POMODORO_DOTS_COUNT } from '@/shared/constants/timer.constants'

interface PomodoroDotsProps {
  /** Tamamlanan pomodoro sayısı */
  readonly completedPomodoros: number
  /** Vurgu rengi */
  readonly color: string
  /** CSS class */
  readonly className?: string
}

/**
 * Küçük daire noktalar — uzun molaya kaç pomodoro kaldığını gösterir.
 */
export function PomodoroDots({ completedPomodoros, color, className }: PomodoroDotsProps) {
  const filledCount = completedPomodoros % POMODORO_DOTS_COUNT

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="status"
      aria-label={`${filledCount} / ${POMODORO_DOTS_COUNT} pomodoro tamamlandı`}
    >
      {Array.from({ length: POMODORO_DOTS_COUNT }).map((_, index) => {
        const isFilled = index < filledCount

        return (
          <span
            key={index}
            className={cn(
              'block h-2 w-2 rounded-full transition-all duration-500',
              isFilled ? 'scale-110' : 'scale-100',
            )}
            style={{
              background: isFilled ? color : 'var(--color-glass-border)',
              boxShadow: isFilled ? `0 0 6px ${color}80` : 'none',
              opacity: isFilled ? 1 : 0.4,
            }}
            aria-hidden="true"
          />
        )
      })}

      <span
        className="ml-1 text-xs tabular-nums"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {filledCount}/{POMODORO_DOTS_COUNT}
      </span>
    </div>
  )
}
