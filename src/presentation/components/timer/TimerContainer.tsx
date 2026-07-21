'use client'

/**
 * TimerContainer — Ana timer bileşeni.
 *
 * Tüm timer alt bileşenlerini bir araya getirir ve useTimer hook'unu bağlar.
 * Klavye kısayollarını (Space, R, 1/2/3) dinler.
 *
 * @packageDocumentation
 */

import React, { useEffect, useCallback } from 'react'
import { useTimer } from '@/presentation/hooks/useTimer'
import { TimerProgressRing } from './TimerProgressRing'
import { TimerDisplay } from './TimerDisplay'
import { TimerModeSelector } from './TimerModeSelector'
import { TimerControls } from './TimerControls'
import { PomodoroDots } from './PomodoroDots'
import { SessionCounterWidget } from '../stats/SessionCounterWidget'
import { MODE_COLORS } from '@/shared/constants/timer.constants'
import { cn } from '@/shared/utils/cn.utils'
import type { TimerMode } from '@/domain/entities/timer.entity'

interface TimerContainerProps {
  /** CSS class */
  readonly className?: string
}

/**
 * Timer ana container bileşeni.
 * useTimer hook'u ile bağlantı kurar ve tüm kontrolleri bir araya getirir.
 */
export function TimerContainer({ className }: TimerContainerProps) {
  const {
    remainingSeconds,
    totalSeconds,
    mode,
    status,
    completedPomodoros,
    isCompleting,
    toggle,
    reset,
    changeMode,
  } = useTimer()

  const color = MODE_COLORS[mode]
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0
  const isRunning = status === 'running'

  // ─── Klavye Kısayolları ─────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Input/textarea üzerindeyken kısayolları devre dışı bırak
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          void toggle()
          break
        case 'KeyR':
          void reset()
          break
        case 'Digit1':
          void changeMode('focus')
          break
        case 'Digit2':
          void changeMode('short-break')
          break
        case 'Digit3':
          void changeMode('long-break')
          break
      }
    },
    [toggle, reset, changeMode],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // ─── Mod değişim handler'ı ────────────────────────────────────────────
  const handleModeChange = useCallback(
    (newMode: TimerMode) => {
      void changeMode(newMode)
    },
    [changeMode],
  )

  // ─── Toggle ve Reset handler'lar ──────────────────────────────────────
  const handleToggle = useCallback(() => void toggle(), [toggle])
  const handleReset = useCallback(() => void reset(), [reset])

  return (
    <div
      className={cn(
        'glass relative flex flex-col items-center gap-8 rounded-[2rem] px-8 pb-10 pt-8',
        'shadow-2xl',
        className,
      )}
      style={{
        boxShadow: `0 24px 64px ${color}15, 0 4px 16px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Günlük Tamamlanan Oturumlar Paneli */}
      <SessionCounterWidget className="absolute -top-5 z-20 shadow-lg" />

      {/* Mod seçici */}
      <TimerModeSelector
        activeMode={mode}
        status={status}
        onModeChange={handleModeChange}
      />

      {/* İlerleme halkası + sayaç */}
      <TimerProgressRing
        progress={progress}
        color={color}
        size={280}
        strokeWidth={5}
        isRunning={isRunning}
      >
        <TimerDisplay
          remainingSeconds={remainingSeconds}
          status={status}
          isCompleting={isCompleting}
          color={color}
        />
      </TimerProgressRing>

      {/* Pomodoro noktaları */}
      <PomodoroDots
        completedPomodoros={completedPomodoros}
        color={color}
      />

      {/* Kontrol butonları */}
      <TimerControls
        status={status}
        color={color}
        onToggle={handleToggle}
        onReset={handleReset}
      />

      {/* Klavye kısayolu ipuçları (sadece idle'da) */}
      {status === 'idle' && (
        <div
          className="absolute bottom-3 left-0 right-0 flex justify-center gap-4 text-[11px]"
          style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}
          aria-hidden="true"
        >
          <span><kbd className="font-mono">Space</kbd> Başlat</span>
          <span><kbd className="font-mono">R</kbd> Sıfırla</span>
          <span><kbd className="font-mono">1/2/3</kbd> Mod</span>
        </div>
      )}
    </div>
  )
}
