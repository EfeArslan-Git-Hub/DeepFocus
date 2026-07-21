'use client'

/**
 * useTimer Hook — Application katmanı ile Zustand store'u bağlar.
 *
 * Bu hook iş mantığı içermez; sadece:
 * 1. Repository'leri başlatır (lazy, sadece tarayıcıda)
 * 2. TimerService use-case'lerini çağırır
 * 3. Timestamp tabanlı geri sayım interval'ını yönetir
 * 4. Sekme başlığını (document.title) günceller
 * 5. BroadcastChannel üzerinden diğer pencerelerle senkronize olur
 *
 * @packageDocumentation
 */

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useTimerStore } from '../store/timer.store'
import { LocalStorageTimerRepository } from '@/infrastructure/storage/local-storage-timer.repository'
import { LocalStorageSessionRepository } from '@/infrastructure/storage/local-storage-session.repository'
import { LocalStorageStatsRepository } from '@/infrastructure/storage/local-storage-stats.repository'
import { createTimerService } from '@/application/services/timer.service'
import { formatSeconds } from '@/domain/value-objects/duration.value-object'
import {
  listenTimerSync,
  type WindowSyncMessage,
} from '@/application/use-cases/sync-timer-across-windows.use-case'
import {
  TAB_TITLE_TEMPLATE,
  DEFAULT_TAB_TITLE,
} from '@/shared/constants/timer.constants'
import type { TimerEntity } from '@/domain/entities/timer.entity'

// ─── Timer Service (singleton) ────────────────────────────────────────────────

/**
 * Browser-safe repository singletons.
 * SSR sırasında çağrılmaz (useEffect içinde kullanılır).
 */
function createRepositories() {
  return {
    timerRepo: new LocalStorageTimerRepository(),
    sessionRepo: new LocalStorageSessionRepository(),
    statsRepo: new LocalStorageStatsRepository(),
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useTimer hook'u — uygulamanın zamanlayıcı mantığını yürütür.
 *
 * @returns Timer kontrollerini ve state'i içeren nesne
 */
export function useTimer() {
  const store = useTimerStore()

  // ─── Refs ───────────────────────────────────────────────────────────────
  /** setInterval ID'si */
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  /** Interval başladığında kalan saniye (drift düzeltme için) */
  const startRemainingRef = useRef<number>(store.remainingSeconds)
  /** Interval başladığında Date.now() */
  const startTimeRef = useRef<number>(Date.now())
  /** Timer entity'si (use-case'lere geçmek için güncel kopya) */
  const timerEntityRef = useRef<TimerEntity | null>(null)

  // ─── Service (lazy, browser-only) ───────────────────────────────────────
  const serviceRef = useRef<ReturnType<typeof createTimerService> | null>(null)

  function getService() {
    if (!serviceRef.current) {
      serviceRef.current = createTimerService(createRepositories())
    }
    return serviceRef.current
  }

  // ─── Güncel TimerEntity oluşturma ────────────────────────────────────────
  const buildTimerEntity = useCallback((): TimerEntity => {
    const s = useTimerStore.getState()
    return {
      id: s.timerId ?? crypto.randomUUID(),
      mode: s.mode,
      remainingSeconds: s.remainingSeconds,
      totalSeconds: s.totalSeconds,
      status: s.status,
      completedPomodoros: s.completedPomodoros,
      config: s.config,
      createdAt: s.timerCreatedAt ? new Date(s.timerCreatedAt) : new Date(),
      updatedAt: new Date(),
    }
  }, [])

  // ─── Interval Temizleme ───────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // ─── Tamamlanma Akışı ────────────────────────────────────────────────────
  const handleComplete = useCallback(async () => {
    clearTimer()
    store.setStatus('completed')
    store.setIsCompleting(true)

    const entity = buildTimerEntity()
    timerEntityRef.current = entity

    try {
      await getService().complete(entity, true, store.currentTaskId ?? undefined)
    } catch (err) {
      console.error('[useTimer] Session tamamlanamadı:', err)
    }

    if (entity.mode === 'focus') {
      store.incrementCompletedPomodoros()
    }

    // 1.5 sn sonra completing animasyonunu kapat
    setTimeout(() => store.setIsCompleting(false), 1500)
  }, [clearTimer, buildTimerEntity, store])

  // ─── Interval Başlatma ───────────────────────────────────────────────────
  const startInterval = useCallback(() => {
    clearTimer()
    startRemainingRef.current = useTimerStore.getState().remainingSeconds
    startTimeRef.current = Date.now()

    intervalRef.current = setInterval(async () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const newRemaining = Math.max(0, startRemainingRef.current - elapsed)
      const current = useTimerStore.getState()

      if (current.status !== 'running') {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        return
      }

      if (newRemaining !== current.remainingSeconds) {
        useTimerStore.setState({ remainingSeconds: newRemaining })

        // Her 5 saniyede bir localStorage'a sync et
        if (newRemaining % 5 === 0 && newRemaining > 0) {
          const entity = buildTimerEntity()
          try {
            await getService().syncState({ ...entity, remainingSeconds: newRemaining })
          } catch {
            // Silent fail — sync is best-effort
          }
        }
      }

      if (newRemaining === 0) {
        await handleComplete()
      }
    }, 500) // 500ms polling — daha responsive ve drift toleranslı
  }, [clearTimer, buildTimerEntity, handleComplete])

  // ─── Sekme Başlığı Güncelleme ─────────────────────────────────────────────
  useEffect(() => {
    const { status, remainingSeconds, mode } = store
    if (status === 'running' || status === 'paused') {
      const timeStr = formatSeconds(remainingSeconds)
      document.title = TAB_TITLE_TEMPLATE.replace('{time}', timeStr)
    } else {
      document.title = DEFAULT_TAB_TITLE
    }
  }, [store.remainingSeconds, store.status, store.mode])

  // ─── Kayıtlı Timer'ı Yükleme ──────────────────────────────────────────────
  useEffect(() => {
    async function loadSavedTimer() {
      try {
        const repos = createRepositories()
        const savedTimer = await repos.timerRepo.load()
        const savedConfig = await repos.timerRepo.loadConfig()

        if (savedConfig) {
          store.setConfig(savedConfig)
        }

        if (savedTimer && savedTimer.status === 'running') {
          // Sayfa yenilendiğinde: kalan saniyeyi gerçek zamandan hesapla
          const elapsed = Math.floor((Date.now() - savedTimer.updatedAt.getTime()) / 1000)
          const adjustedRemaining = Math.max(0, savedTimer.remainingSeconds - elapsed)

          store.initTimer({
            timerId: savedTimer.id,
            remainingSeconds: adjustedRemaining,
            totalSeconds: savedTimer.totalSeconds,
            mode: savedTimer.mode,
            createdAt: savedTimer.createdAt,
          })
        } else if (savedTimer && savedTimer.status === 'paused') {
          store.initTimer({
            timerId: savedTimer.id,
            remainingSeconds: savedTimer.remainingSeconds,
            totalSeconds: savedTimer.totalSeconds,
            mode: savedTimer.mode,
            createdAt: savedTimer.createdAt,
          })
          store.setStatus('paused')
        }
      } catch (err) {
        console.error('[useTimer] Kayıtlı timer yüklenemedi:', err)
      }
    }

    loadSavedTimer()
  }, []) // Sadece mount'ta çalışır

  // ─── Status Değişince Interval Yönetimi ───────────────────────────────────
  useEffect(() => {
    if (store.status === 'running') {
      startInterval()
    } else {
      clearTimer()
    }

    return clearTimer
  }, [store.status, store.mode]) // mode değişince interval sıfırlanır

  // ─── BroadcastChannel Dinleme ─────────────────────────────────────────────
  useEffect(() => {
    const cleanup = listenTimerSync((msg: WindowSyncMessage) => {
      switch (msg.type) {
        case 'TIMER_STATE_UPDATE':
          if (msg.payload?.remainingSeconds !== undefined) {
            useTimerStore.setState({ remainingSeconds: msg.payload.remainingSeconds })
          }
          break
        case 'TIMER_PAUSE':
          store.setStatus('paused')
          break
        case 'TIMER_START':
        case 'TIMER_RESET':
          // Diğer pencere başlatınca/sıfırlayınca sayfayı yenilemek yerine
          // sadece store'u güncelle (tam senkronizasyon ileride eklenebilir)
          break
        default:
          break
      }
    })

    return cleanup
  }, [])

  // ─── Unmount Temizleme ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimer()
      document.title = DEFAULT_TAB_TITLE
    }
  }, [clearTimer])

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Timer'ı başlatır (yeni oturum).
   */
  const start = useCallback(async () => {
    try {
      const timer = await getService().start(store.mode)
      store.initTimer({
        timerId: timer.id,
        remainingSeconds: timer.remainingSeconds,
        totalSeconds: timer.totalSeconds,
        mode: timer.mode,
        createdAt: timer.createdAt,
      })
    } catch (err) {
      console.error('[useTimer] Timer başlatılamadı:', err)
    }
  }, [store.mode])

  /**
   * Çalışan timer'ı duraklatır.
   */
  const pause = useCallback(async () => {
    store.setStatus('paused')
    clearTimer()

    // Mevcut durumu kaydet
    const entity = buildTimerEntity()
    try {
      await getService().syncState({ ...entity, status: 'paused' })
    } catch {
      // Silent
    }
  }, [clearTimer, buildTimerEntity])

  /**
   * Duraklatılmış timer'ı devam ettirir.
   */
  const resume = useCallback(() => {
    store.setStatus('running')
    // startInterval useEffect tarafından otomatik tetiklenir
  }, [])

  /**
   * Timer'ı sıfırlar.
   */
  const reset = useCallback(async () => {
    clearTimer()
    store.reset()

    // Repository'yi de temizle
    try {
      createRepositories().timerRepo.clear()
    } catch {
      // Silent
    }
  }, [clearTimer])

  /**
   * Modu değiştirir (timer sıfırlanır).
   */
  const changeMode = useCallback(
    async (mode: (typeof store)['mode']) => {
      clearTimer()
      store.setMode(mode)

      try {
        createRepositories().timerRepo.clear()
      } catch {
        // Silent
      }
    },
    [clearTimer],
  )

  /**
   * Tek buton ile start/pause/resume kontrolü.
   */
  const toggle = useCallback(async () => {
    switch (store.status) {
      case 'idle':
      case 'completed':
        await start()
        break
      case 'running':
        await pause()
        break
      case 'paused':
        resume()
        break
    }
  }, [store.status, start, pause, resume])

  /**
   * Kullanıcı konfigürasyonunu günceller ve kaydeder.
   */
  const updateConfig = useCallback(async (newConfig: typeof store.config) => {
    store.setConfig(newConfig)
    try {
      await createRepositories().timerRepo.saveConfig(newConfig)
    } catch {
      // Silent fail
    }
  }, [store])

  return {
    // State
    remainingSeconds: store.remainingSeconds,
    totalSeconds: store.totalSeconds,
    mode: store.mode,
    status: store.status,
    completedPomodoros: store.completedPomodoros,
    config: store.config,
    currentTaskId: store.currentTaskId,
    isCompleting: store.isCompleting,

    // Actions
    start,
    pause,
    resume,
    reset,
    toggle,
    changeMode,
    setCurrentTaskId: store.setCurrentTaskId,
    setConfig: updateConfig,
  }
}
