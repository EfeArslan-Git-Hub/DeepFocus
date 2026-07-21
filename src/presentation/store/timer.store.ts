'use client'

/**
 * Timer Zustand Store — Global timer UI durumu.
 *
 * Bu store sadece UI state'i tutar; iş mantığı içermez.
 * Kalıcılık (persistence) infrastructure katmanındaki
 * LocalStorageTimerRepository aracılığıyla sağlanır.
 *
 * @packageDocumentation
 */

import { create } from 'zustand'
import type { TimerMode, TimerStatus, TimerConfig } from '@/domain/entities/timer.entity'
import { TIMER_DEFAULTS } from '@/shared/constants/timer.constants'

/** Timer store'unun tuttuğu state şekli */
export interface TimerStoreState {
  // ─── Timer Durumu ──────────────────────────────────────────
  /** Mevcut timer oturumunun ID'si */
  timerId: string | null
  /** Timer'ın oluşturulma zamanı (ISO string — Zustand serializable) */
  timerCreatedAt: string | null
  /** Kalan saniye */
  remainingSeconds: number
  /** Toplam saniye (mevcut mod için) */
  totalSeconds: number
  /** Aktif mod */
  mode: TimerMode
  /** Çalışma durumu */
  status: TimerStatus
  /** Bu oturumda tamamlanan pomodoro sayısı */
  completedPomodoros: number
  /** Kullanıcı konfigürasyonu */
  config: TimerConfig
  /** Şu an odaklanılan görev ID'si */
  currentTaskId: string | null
  /** Timer tamamlandı animasyonu aktif mi */
  isCompleting: boolean
}

/** Timer store'unun aksiyonları */
export interface TimerStoreActions {
  /**
   * Timer'ı yeni bir mod/süre ile başlatır.
   * (startFocusSession use-case çıktısı ile çağrılır)
   */
  initTimer: (args: {
    timerId: string
    remainingSeconds: number
    totalSeconds: number
    mode: TimerMode
    createdAt: Date
  }) => void

  /** Çalışma durumunu günceller */
  setStatus: (status: TimerStatus) => void

  /** Modu değiştirir ve timer'ı o modun varsayılan süresine sıfırlar */
  setMode: (mode: TimerMode) => void

  /** Her saniye azaltılır (useTimer hook'u çağırır) */
  tick: () => void

  /** Timer'ı mevcut modun başlangıç süresine sıfırlar */
  reset: () => void

  /** Kullanıcı konfigürasyonunu günceller */
  setConfig: (config: TimerConfig) => void

  /** Odaklanılacak görevi ayarlar */
  setCurrentTaskId: (taskId: string | null) => void

  /** Tamamlanan pomodoro sayısını artırır */
  incrementCompletedPomodoros: () => void

  /** Tamamlanma animasyonunu tetikler */
  setIsCompleting: (isCompleting: boolean) => void
}

/** Tam store tipi */
export type TimerStore = TimerStoreState & TimerStoreActions

/**
 * Moda göre toplam saniyeyi hesaplar.
 *
 * @param mode - Timer modu
 * @param config - Kullanıcı konfigürasyonu
 * @returns Toplam saniye
 */
function getTotalSecondsForMode(mode: TimerMode, config: TimerConfig): number {
  switch (mode) {
    case 'focus':
      return config.focusDuration.seconds
    case 'short-break':
      return config.shortBreakDuration.seconds
    case 'long-break':
      return config.longBreakDuration.seconds
  }
}

/**
 * Zustand timer store'u.
 * Tüm presentation katmanı bileşen ve hook'ları bu store'u kullanır.
 */
export const useTimerStore = create<TimerStore>((set, get) => ({
  // ─── Başlangıç State ─────────────────────────────────────────────────────
  timerId: null,
  timerCreatedAt: null,
  remainingSeconds: TIMER_DEFAULTS.focusDuration.seconds,
  totalSeconds: TIMER_DEFAULTS.focusDuration.seconds,
  mode: 'focus',
  status: 'idle',
  completedPomodoros: 0,
  config: TIMER_DEFAULTS,
  currentTaskId: null,
  isCompleting: false,

  // ─── Aksiyonlar ──────────────────────────────────────────────────────────
  initTimer: ({ timerId, remainingSeconds, totalSeconds, mode, createdAt }) => {
    set({
      timerId,
      timerCreatedAt: createdAt.toISOString(),
      remainingSeconds,
      totalSeconds,
      mode,
      status: 'running',
      isCompleting: false,
    })
  },

  setStatus: (status) => set({ status }),

  setMode: (mode) => {
    const { config } = get()
    const totalSeconds = getTotalSecondsForMode(mode, config)
    set({
      mode,
      totalSeconds,
      remainingSeconds: totalSeconds,
      status: 'idle',
      timerId: null,
      timerCreatedAt: null,
      isCompleting: false,
    })
  },

  tick: () => {
    const { remainingSeconds } = get()
    if (remainingSeconds > 0) {
      set({ remainingSeconds: remainingSeconds - 1 })
    }
  },

  reset: () => {
    const { mode, config } = get()
    const totalSeconds = getTotalSecondsForMode(mode, config)
    set({
      remainingSeconds: totalSeconds,
      totalSeconds,
      status: 'idle',
      timerId: null,
      timerCreatedAt: null,
      isCompleting: false,
    })
  },

  setConfig: (config) => {
    const { mode, status } = get()
    // Eğer timer çalışmıyorsa kalan süreyi de güncelle
    if (status === 'idle') {
      const totalSeconds = getTotalSecondsForMode(mode, config)
      set({ config, totalSeconds, remainingSeconds: totalSeconds })
    } else {
      set({ config })
    }
  },

  setCurrentTaskId: (taskId) => set({ currentTaskId: taskId }),

  incrementCompletedPomodoros: () =>
    set((state) => ({ completedPomodoros: state.completedPomodoros + 1 })),

  setIsCompleting: (isCompleting) => set({ isCompleting }),
}))
