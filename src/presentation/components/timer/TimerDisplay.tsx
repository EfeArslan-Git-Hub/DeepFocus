'use client'

/**
 * TimerDisplay — Geri sayım MM:SS göstergesi.
 *
 * Büyük, monospace, tabular-nums tipografisi ile hassas sayı hizalaması.
 * Tamamlanma durumunda check animasyonu gösterir.
 *
 * @packageDocumentation
 */

import React from 'react'
import { formatSeconds } from '@/domain/value-objects/duration.value-object'
import { cn } from '@/shared/utils/cn.utils'
import type { TimerStatus } from '@/domain/entities/timer.entity'

interface TimerDisplayProps {
  /** Kalan saniye */
  readonly remainingSeconds: number
  /** Timer durumu */
  readonly status: TimerStatus
  /** Tamamlanma animasyonu aktif mi */
  readonly isCompleting: boolean
  /** Mod rengi */
  readonly color: string
  /** CSS class */
  readonly className?: string
}

/**
 * MM:SS formatında geri sayım göstergesi.
 */
export function TimerDisplay({
  remainingSeconds,
  status,
  isCompleting,
  color,
  className,
}: TimerDisplayProps) {
  const timeString = formatSeconds(remainingSeconds)
  const [minutes, seconds] = timeString.split(':')

  return (
    <div
      className={cn(
        'timer-display flex flex-col items-center select-none',
        className,
      )}
      role="timer"
      aria-label={`${timeString} kalan`}
      aria-live="off"
    >
      {/* Tamamlandı ikonu */}
      {isCompleting ? (
        <div
          className="animate-bounce text-5xl"
          style={{ color }}
          aria-label="Tamamlandı"
        >
          ✓
        </div>
      ) : (
        <>
          {/* Büyük zaman göstergesi */}
          <div
            className="flex items-baseline gap-0.5 font-light tracking-tight"
            style={{ color: status === 'paused' ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}
          >
            {/* Dakika */}
            <span
              className="text-[5.5rem] leading-none tabular-nums sm:text-[6.5rem]"
              style={{
                transition: 'color 0.3s ease',
                textShadow: status === 'running' ? `0 0 40px ${color}30` : 'none',
              }}
            >
              {minutes}
            </span>

            {/* Ayraç — çalışırken yanıp söner */}
            <span
              className={cn(
                'text-[4rem] leading-none sm:text-[5rem]',
                status === 'running' && 'animate-[blink_1s_step-end_infinite]',
              )}
              style={{ color: 'var(--color-text-secondary)' }}
              aria-hidden="true"
            >
              :
            </span>

            {/* Saniye */}
            <span
              className="text-[5.5rem] leading-none tabular-nums sm:text-[6.5rem]"
              style={{
                transition: 'color 0.3s ease',
                textShadow: status === 'running' ? `0 0 40px ${color}30` : 'none',
              }}
            >
              {seconds}
            </span>
          </div>

          {/* Durum etiketi */}
          <span
            className="mt-2 text-xs font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {status === 'idle' && 'Hazır'}
            {status === 'running' && 'Odaklanıyorsun'}
            {status === 'paused' && 'Duraklatıldı'}
            {status === 'completed' && 'Tamamlandı!'}
          </span>
        </>
      )}
    </div>
  )
}
