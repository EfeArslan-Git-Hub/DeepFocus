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

  // Local state form değerleri
  const [focusMin, setFocusMin] = useState(config.focusDuration.minutes.toString())
  const [focusSec, setFocusSec] = useState((config.focusDuration.seconds % 60).toString())
  const [shortBreakMin, setShortBreakMin] = useState(config.shortBreakDuration.minutes.toString())
  const [shortBreakSec, setShortBreakSec] = useState((config.shortBreakDuration.seconds % 60).toString())
  const [longBreakMin, setLongBreakMin] = useState(config.longBreakDuration.minutes.toString())
  const [longBreakSec, setLongBreakSec] = useState((config.longBreakDuration.seconds % 60).toString())
  const [interval, setIntervalCount] = useState(config.longBreakInterval.toString())
  const [envEnabled, setEnvEnabled] = useState(config.environment?.enabled ?? false)
  const [envType, setEnvType] = useState<'rain' | 'snow'>(config.environment?.type ?? 'rain')
  const [error, setError] = useState<string | null>(null)

  // Store'dan güncellemeleri al
  useEffect(() => {
    if (isOpen) {
      setFocusMin(config.focusDuration.minutes.toString())
      setFocusSec((config.focusDuration.seconds % 60).toString())
      setShortBreakMin(config.shortBreakDuration.minutes.toString())
      setShortBreakSec((config.shortBreakDuration.seconds % 60).toString())
      setLongBreakMin(config.longBreakDuration.minutes.toString())
      setLongBreakSec((config.longBreakDuration.seconds % 60).toString())
      setIntervalCount(config.longBreakInterval.toString())
      setEnvEnabled(config.environment?.enabled ?? false)
      setEnvType(config.environment?.type ?? 'rain')
      setError(null)
    }
  }, [isOpen, config])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const parsedFocusMin = parseInt(focusMin, 10) || 0
      const parsedFocusSec = parseInt(focusSec, 10) || 0
      const parsedShortBreakMin = parseInt(shortBreakMin, 10) || 0
      const parsedShortBreakSec = parseInt(shortBreakSec, 10) || 0
      const parsedLongBreakMin = parseInt(longBreakMin, 10) || 0
      const parsedLongBreakSec = parseInt(longBreakSec, 10) || 0
      const parsedInterval = parseInt(interval, 10)

      if (parsedInterval < 1 || parsedInterval > 10) {
        throw new Error('Uzun mola aralığı 1 ile 10 arasında olmalıdır.')
      }

      setConfig({
        focusDuration: createDuration(parsedFocusMin, parsedFocusSec),
        shortBreakDuration: createDuration(parsedShortBreakMin, parsedShortBreakSec),
        longBreakDuration: createDuration(parsedLongBreakMin, parsedLongBreakSec),
        longBreakInterval: parsedInterval,
        environment: {
          enabled: envEnabled,
          type: envType
        }
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
    setFocusMin(TIMER_DEFAULTS.focusDuration.minutes.toString())
    setFocusSec((TIMER_DEFAULTS.focusDuration.seconds % 60).toString())
    setShortBreakMin(TIMER_DEFAULTS.shortBreakDuration.minutes.toString())
    setShortBreakSec((TIMER_DEFAULTS.shortBreakDuration.seconds % 60).toString())
    setLongBreakMin(TIMER_DEFAULTS.longBreakDuration.minutes.toString())
    setLongBreakSec((TIMER_DEFAULTS.longBreakDuration.seconds % 60).toString())
    setIntervalCount(TIMER_DEFAULTS.longBreakInterval.toString())
    setEnvEnabled(TIMER_DEFAULTS.environment?.enabled ?? false)
    setEnvType(TIMER_DEFAULTS.environment?.type ?? 'rain')
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
            Süreler (Dk : Sn)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="focus-min-input" className="text-xs text-[var(--color-text-secondary)]">Odaklan</label>
              <div className="flex items-center gap-2">
                <input
                  id="focus-min-input"
                  type="number"
                  min="0"
                  max="120"
                  value={focusMin}
                  onChange={(e) => setFocusMin(e.target.value)}
                  className="w-full rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="Dk"
                />
                <span className="text-[var(--color-text-secondary)]">:</span>
                <input
                  id="focus-sec-input"
                  type="number"
                  min="0"
                  max="59"
                  value={focusSec}
                  onChange={(e) => setFocusSec(e.target.value)}
                  className="w-full rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="Sn"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="sb-min-input" className="text-xs text-[var(--color-text-secondary)]">Kısa Mola</label>
              <div className="flex items-center gap-2">
                <input
                  id="sb-min-input"
                  type="number"
                  min="0"
                  max="60"
                  value={shortBreakMin}
                  onChange={(e) => setShortBreakMin(e.target.value)}
                  className="w-full rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="Dk"
                />
                <span className="text-[var(--color-text-secondary)]">:</span>
                <input
                  id="sb-sec-input"
                  type="number"
                  min="0"
                  max="59"
                  value={shortBreakSec}
                  onChange={(e) => setShortBreakSec(e.target.value)}
                  className="w-full rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="Sn"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="lb-min-input" className="text-xs text-[var(--color-text-secondary)]">Uzun Mola</label>
              <div className="flex items-center gap-2">
                <input
                  id="lb-min-input"
                  type="number"
                  min="0"
                  max="120"
                  value={longBreakMin}
                  onChange={(e) => setLongBreakMin(e.target.value)}
                  className="w-full rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="Dk"
                />
                 <span className="text-[var(--color-text-secondary)]">:</span>
                 <input
                  id="lb-sec-input"
                  type="number"
                  min="0"
                  max="59"
                  value={longBreakSec}
                  onChange={(e) => setLongBreakSec(e.target.value)}
                  className="w-full rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="Sn"
                />
              </div>
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

        {/* Ortam Efektleri */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Ortam Efektleri
          </h3>
          <div className="flex flex-col gap-3">
             <label className="flex items-center gap-3 cursor-pointer">
               <div className="relative">
                 <input 
                   type="checkbox" 
                   className="sr-only peer" 
                   checked={envEnabled}
                   onChange={(e) => setEnvEnabled(e.target.checked)}
                 />
                 <div className="w-11 h-6 bg-gray-200/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
               </div>
               <span className="text-sm font-medium text-[var(--color-text-primary)]">Arka Plan Görsel Efektlerini Aç</span>
             </label>

             {envEnabled && (
                <div className="flex items-center gap-3 mt-1 pl-1">
                  <span className="text-xs text-[var(--color-text-secondary)]">Efekt Türü:</span>
                  <select
                    value={envType}
                    onChange={(e) => setEnvType(e.target.value as 'rain' | 'snow')}
                    className="rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-1 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none"
                  >
                    <option value="rain">Yağmur</option>
                    <option value="snow">Kar</option>
                  </select>
                </div>
             )}
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
