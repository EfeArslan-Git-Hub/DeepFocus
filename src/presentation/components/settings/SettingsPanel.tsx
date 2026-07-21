'use client'

/**
 * SettingsPanel — Zamanlayıcı ve diğer ayarlar paneli.
 *
 * @packageDocumentation
 */

import React, { useState, useEffect } from 'react'
import { Modal } from '@/presentation/components/shared/Modal'
import { useTimer } from '@/presentation/hooks/useTimer'
import { createDuration } from '@/domain/value-objects/duration.value-object'
import { MIN_FOCUS_MINUTES, MAX_FOCUS_MINUTES, TIMER_DEFAULTS } from '@/shared/constants/timer.constants'

interface SettingsPanelProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { config, setConfig } = useTimer()

  // Local state form değerleri (dakika cinsinden)
  const [focus, setFocus] = useState(config.focusDuration.minutes.toString())
  const [shortBreak, setShortBreak] = useState(config.shortBreakDuration.minutes.toString())
  const [longBreak, setLongBreak] = useState(config.longBreakDuration.minutes.toString())
  const [interval, setIntervalCount] = useState(config.longBreakInterval.toString())
  const [error, setError] = useState<string | null>(null)

  // Store'dan güncellemeleri al
  useEffect(() => {
    if (isOpen) {
      setFocus(config.focusDuration.minutes.toString())
      setShortBreak(config.shortBreakDuration.minutes.toString())
      setLongBreak(config.longBreakDuration.minutes.toString())
      setIntervalCount(config.longBreakInterval.toString())
      setError(null)
    }
  }, [isOpen, config])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const parsedFocus = parseInt(focus, 10)
      const parsedShortBreak = parseInt(shortBreak, 10)
      const parsedLongBreak = parseInt(longBreak, 10)
      const parsedInterval = parseInt(interval, 10)

      if (parsedInterval < 1 || parsedInterval > 10) {
        throw new Error('Uzun mola aralığı 1 ile 10 arasında olmalıdır.')
      }

      setConfig({
        focusDuration: createDuration(parsedFocus),
        shortBreakDuration: createDuration(parsedShortBreak),
        longBreakDuration: createDuration(parsedLongBreak),
        longBreakInterval: parsedInterval,
      })

      onClose()
      setError(null)
    } catch (err: unknown) {
      if (err instanceof RangeError || err instanceof Error) {
        setError(err.message)
      } else {
        setError('Geçersiz değerler girdiniz.')
      }
    }
  }

  const handleReset = () => {
    setFocus(TIMER_DEFAULTS.focusDuration.minutes.toString())
    setShortBreak(TIMER_DEFAULTS.shortBreakDuration.minutes.toString())
    setLongBreak(TIMER_DEFAULTS.longBreakDuration.minutes.toString())
    setIntervalCount(TIMER_DEFAULTS.longBreakInterval.toString())
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ayarlar">
      <form onSubmit={handleSave} className="space-y-6">
        
        {error && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Süreler (Dakika)
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="focus-input" className="text-xs text-[var(--color-text-secondary)]">Odaklan</label>
              <input
                id="focus-input"
                type="number"
                min={MIN_FOCUS_MINUTES}
                max={MAX_FOCUS_MINUTES}
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="sb-input" className="text-xs text-[var(--color-text-secondary)]">Kısa Mola</label>
              <input
                id="sb-input"
                type="number"
                min="1"
                max="60"
                value={shortBreak}
                onChange={(e) => setShortBreak(e.target.value)}
                className="w-full rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="lb-input" className="text-xs text-[var(--color-text-secondary)]">Uzun Mola</label>
              <input
                id="lb-input"
                type="number"
                min="1"
                max="120"
                value={longBreak}
                onChange={(e) => setLongBreak(e.target.value)}
                className="w-full rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Uzun Mola Aralığı
          </h3>
          <div className="flex flex-col gap-1">
             <label htmlFor="interval-input" className="text-xs text-[var(--color-text-secondary)]">
              Kaç pomodoro sonrası uzun mola verilsin?
             </label>
             <input
                id="interval-input"
                type="number"
                min="1"
                max="10"
                value={interval}
                onChange={(e) => setIntervalCount(e.target.value)}
                className="w-1/2 rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--color-glass-border)] pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            Varsayılana Sıfırla
          </button>
          
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95"
          >
            Kaydet
          </button>
        </div>
      </form>
    </Modal>
  )
}
