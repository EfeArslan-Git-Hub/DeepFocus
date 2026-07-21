/**
 * SyncTimerAcrossWindows Use-Case — Timer durumunu pencereler arasında senkronize eder.
 *
 * BroadcastChannel API kullanarak ana pencere ile pop-out (PiP) penceresi
 * arasında timer durumu mesajını yayınlar.
 *
 * @packageDocumentation
 */

import type { TimerEntity } from '../../domain/entities/timer.entity'

/** Pencereler arası mesaj tipleri */
export type WindowSyncMessageType =
  | 'TIMER_STATE_UPDATE'
  | 'TIMER_START'
  | 'TIMER_PAUSE'
  | 'TIMER_RESET'
  | 'TIMER_COMPLETE'
  | 'REQUEST_STATE'
  | 'COMMAND_START'
  | 'COMMAND_PAUSE'
  | 'COMMAND_RESET'
  | 'PIP_CONNECTED'
  | 'PIP_DISCONNECTED'

/** BroadcastChannel mesaj formatı */
export interface WindowSyncMessage {
  readonly type: WindowSyncMessageType
  readonly payload?: Partial<TimerEntity>
  readonly timestamp: number
}

/** Senkronizasyon kanalı adı */
export const TIMER_BROADCAST_CHANNEL = 'deepfocus-timer-sync' as const

/**
 * Timer durumunu diğer pencereler/sekmelere yayınlar.
 * BroadcastChannel API kullanır (aynı origin, farklı pencere/sekme).
 *
 * @param message - Yayınlanacak mesaj
 *
 * @example
 * ```ts
 * broadcastTimerState({ type: 'TIMER_STATE_UPDATE', payload: timer, timestamp: Date.now() })
 * ```
 */
export function broadcastTimerState(message: WindowSyncMessage): void {
  if (typeof BroadcastChannel === 'undefined') {
    // SSR veya desteklenmeyen tarayıcı — sessizce görmezden gel
    return
  }

  const channel = new BroadcastChannel(TIMER_BROADCAST_CHANNEL)
  channel.postMessage(message)
  channel.close()
}

/**
 * Timer senkronizasyon kanalını dinleyen listener'ı başlatır.
 * Döndürülen temizleme fonksiyonu çağrıldığında dinleme durur.
 *
 * @param onMessage - Mesaj geldiğinde çağrılacak callback
 * @returns Temizleme fonksiyonu (channel.close())
 *
 * @example
 * ```ts
 * const cleanup = listenTimerSync((msg) => {
 *   if (msg.type === 'TIMER_STATE_UPDATE') updateLocalState(msg.payload)
 * })
 * return () => cleanup()
 * ```
 */
export function listenTimerSync(
  onMessage: (message: WindowSyncMessage) => void,
): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return () => undefined
  }

  const channel = new BroadcastChannel(TIMER_BROADCAST_CHANNEL)
  channel.addEventListener('message', (event: MessageEvent<WindowSyncMessage>) => {
    onMessage(event.data)
  })

  return () => channel.close()
}
