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
  broadcastTimerState,
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

export interface UseTimerOptions {
  /** 
   * Hook PiP (Picture in Picture) penceresinde kullanılıyor mu?
   * Eğer true ise; timer bittiğinde veya periyodik sync'de
   * "tamamlanma (handleComplete)" delege edilir, kendisi çift/karışık karar vermez.
   */
  readonly isPip?: boolean
}

/**
 * useTimer hook'u — uygulamanın zamanlayıcı mantığını yürütür.
 *
 * @param options - Hook davranış seçenekleri
 * @returns Timer kontrollerini ve state'i içeren nesne
 */
export function useTimer(options: UseTimerOptions = {}) {
  const { isPip = false } = options
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
  /** PiP'in (Slave) yayın isteyip istemediğini (bağlı olup olmadığını) takip eden bayrak (Sadece Master için) */
  const pipConnectedRef = useRef<boolean>(false)

  // ─── PIP İletişimi (Mount) ───────────────────────────────────────────────
  useEffect(() => {
    if (!isPip) return
    broadcastTimerState({ type: 'PIP_CONNECTED', timestamp: Date.now() })
    broadcastTimerState({ type: 'REQUEST_STATE', timestamp: Date.now() })

    return () => {
      broadcastTimerState({ type: 'PIP_DISCONNECTED', timestamp: Date.now() })
    }
  }, [isPip])

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

    // 1.5 sn sonra completing animasyonunu kapat ve yeni moda geçip hazır bekle
    setTimeout(() => {
      store.setIsCompleting(false)
      
      const currentState = useTimerStore.getState()
      let nextMode: typeof currentState.mode = 'focus'
      
      if (currentState.mode === 'focus') {
        const currentCompleted = currentState.completedPomodoros
        if (currentCompleted > 0 && currentCompleted % currentState.config.longBreakInterval === 0) {
          nextMode = 'long-break'
        } else {
          nextMode = 'short-break'
        }
      } else {
        // Mola modundan focus moduna
        nextMode = 'focus'
      }

      // Modu ayarla (bu işlem total ve remaining seconds'u o moda göre otomatik sıfırlar)
      store.setMode(nextMode)

      // Storage'daki güncel olmayan timer datasını temizle 
      try {
        createRepositories().timerRepo.clear()
      } catch {
        // sessiz devam
      }

      // OTOMATİK DÖNGÜ (AUTO-START)
      getService().start(nextMode, currentState.completedPomodoros).then(timer => {
        store.initTimer({
          timerId: timer.id,
          remainingSeconds: timer.remainingSeconds,
          totalSeconds: timer.totalSeconds,
          mode: timer.mode,
          createdAt: timer.createdAt,
        })
      }).catch(err => console.error('[useTimer] Otomatik döngü başlatılamadı:', err))

    }, 1500)
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

        // Her 5 saniyede bir localStorage'a sync et (sadece Master pencere yapar)
        if (!isPip && newRemaining % 5 === 0 && newRemaining > 0) {
          const entity = buildTimerEntity()
          try {
            await getService().syncState({ ...entity, remainingSeconds: newRemaining })
          } catch {
            // Silent fail — sync is best-effort
          }
        }

        // --- MASTER -> PIP SENKRONİZASYONU ---
        // Her saniye tiktaklandığında, eğer PIP penceresi bağlandıysa onu da state'den haberdar et
        if (!isPip && pipConnectedRef.current) {
          const currentStateNow = useTimerStore.getState()
          broadcastTimerState({
            type: 'TIMER_STATE_UPDATE',
            payload: {
               id: currentStateNow.timerId ?? '',
               mode: currentStateNow.mode,
               status: currentStateNow.status,
               remainingSeconds: currentStateNow.remainingSeconds,
               totalSeconds: currentStateNow.totalSeconds,
               completedPomodoros: currentStateNow.completedPomodoros,
               config: currentStateNow.config,
               createdAt: currentStateNow.timerCreatedAt ? new Date(currentStateNow.timerCreatedAt) : new Date(),
               updatedAt: new Date()
            },
            timestamp: Date.now()
          })
        }
      }

      if (newRemaining === 0) {
        // Sıfıra ulaşıldığında tamamlanma (Next mode / Auto-start) kararını sadece
        // Ana Pencere (Master) verir. PIP sadece sonucu okur!
        if (!isPip) {
          await handleComplete()
        }
      }
    }, 500) // 500ms polling — daha responsive ve drift toleranslı
  }, [clearTimer, buildTimerEntity, handleComplete, isPip])

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
    if (isPip) return // PIP (Slave) penceresi kendi başına ASLA interval çalıştırmaz! Ritm Master'dan gelir.

    if (store.status === 'running') {
      startInterval()
    } else {
      clearTimer()
    }

    return clearTimer
  }, [store.status, store.mode, isPip]) // mode değişince interval sıfırlanır

  // ─── BroadcastChannel Dinleme ─────────────────────────────────────────────


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
    if (isPip) {
      broadcastTimerState({ type: 'COMMAND_START', timestamp: Date.now() })
      return
    }

    try {
      const timer = await getService().start(store.mode, store.completedPomodoros)
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
  }, [store.mode, store.completedPomodoros, isPip])

  /**
   * Çalışan timer'ı duraklatır.
   */
  const pause = useCallback(async () => {
    if (isPip) {
      broadcastTimerState({ type: 'COMMAND_PAUSE', timestamp: Date.now() })
      return
    }

    store.setStatus('paused')
    clearTimer()

    // Mevcut durumu kaydet
    const entity = buildTimerEntity()
    try {
      await getService().syncState({ ...entity, status: 'paused' })
    } catch {
      // Silent
    }
  }, [clearTimer, buildTimerEntity, isPip, store])

  /**
   * Duraklatılmış timer'ı devam ettirir.
   */
  const resume = useCallback(() => {
    if (isPip) {
      broadcastTimerState({ type: 'COMMAND_START', timestamp: Date.now() })
      return
    }

    store.setStatus('running')
    // startInterval useEffect tarafından otomatik tetiklenir
  }, [isPip, store])

  /**
   * Timer'ı sıfırlar.
   */
  const reset = useCallback(async () => {
    if (isPip) {
      broadcastTimerState({ type: 'COMMAND_RESET', timestamp: Date.now() })
      return
    }

    clearTimer()
    store.reset()

    // Repository'yi de temizle
    try {
      createRepositories().timerRepo.clear()
    } catch {
      // Silent
    }
  }, [clearTimer, isPip, store])

  // ─── BroadcastChannel Dinleme (Moved to resolve TDZ) ──────────────────────
  useEffect(() => {
    const cleanup = listenTimerSync((msg: WindowSyncMessage) => {
      if (isPip) {
        // PiP Sadece Master'dan gelen State Update / Start raporlarını alır
        switch (msg.type) {
          case 'TIMER_STATE_UPDATE':
          case 'TIMER_START':
            if (msg.payload) {
              useTimerStore.setState((state) => ({
                ...state,
                timerId: msg.payload?.id ?? state.timerId,
                timerCreatedAt: msg.payload?.createdAt ? new Date(msg.payload.createdAt).toISOString() : state.timerCreatedAt,
                completedPomodoros: msg.payload?.completedPomodoros ?? state.completedPomodoros,
                config: msg.payload?.config ?? state.config,
                remainingSeconds: msg.payload?.remainingSeconds ?? state.remainingSeconds,
                totalSeconds: msg.payload?.totalSeconds ?? state.totalSeconds,
                mode: msg.payload?.mode ?? state.mode,
                status: msg.payload?.status ?? state.status,
              }))
            }
            break
          case 'TIMER_PAUSE':
            if (msg.payload) {
              useTimerStore.setState((state) => ({
                ...state,
                status: 'paused',
                remainingSeconds: msg.payload?.remainingSeconds ?? state.remainingSeconds,
              }))
            } else {
              useTimerStore.setState({ status: 'paused' })
            }
            break
          case 'TIMER_RESET':
          case 'TIMER_COMPLETE':
            // Tam senkronizasyon: Diğer pencere modu günceller veya temizlerse sayfayı okumaya zorla
            if (msg.payload?.mode) {
               useTimerStore.setState({ mode: msg.payload.mode })
            }
            break
        }
      } else {
        // MASTER: PIP'in varlığını ve ondan gelen Start/Pause Komutlarını Dinler
        switch (msg.type) {
          case 'PIP_CONNECTED':
          case 'REQUEST_STATE':
            pipConnectedRef.current = true
            const currentMasterState = useTimerStore.getState()
            broadcastTimerState({
              type: 'TIMER_STATE_UPDATE',
              payload: {
                id: currentMasterState.timerId ?? '',
                mode: currentMasterState.mode,
                status: currentMasterState.status,
                remainingSeconds: currentMasterState.remainingSeconds,
                totalSeconds: currentMasterState.totalSeconds,
                completedPomodoros: currentMasterState.completedPomodoros,
                config: currentMasterState.config,
                createdAt: currentMasterState.timerCreatedAt ? new Date(currentMasterState.timerCreatedAt) : new Date(),
                updatedAt: new Date()
              },
              timestamp: Date.now()
            })
            break
          case 'PIP_DISCONNECTED':
            pipConnectedRef.current = false
            break
          case 'COMMAND_START':
            void start()
            break
          case 'COMMAND_PAUSE':
            void pause()
            break
          case 'COMMAND_RESET':
            void reset()
            break
        }
      }
    })

    return cleanup
  }, [isPip, start, pause, reset, buildTimerEntity])

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
