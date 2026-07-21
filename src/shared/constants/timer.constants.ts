/**
 * Timer sabitleri — Pomodoro varsayılan süreleri.
 *
 * Magic number kullanımını önlemek için tüm timer sabitleri burada.
 *
 * @packageDocumentation
 */

import { createDuration } from '../../domain/value-objects/duration.value-object'
import type { TimerConfig, TimerMode } from '../../domain/entities/timer.entity'

/** Varsayılan Pomodoro timer konfigürasyonu */
export const TIMER_DEFAULTS: TimerConfig = {
  focusDuration: createDuration(25),
  shortBreakDuration: createDuration(5),
  longBreakDuration: createDuration(15),
  longBreakInterval: 4,
  environment: {
    enabled: false,
    type: 'rain',
  },
} as const

/** Minimum focus süresi (dakika) */
export const MIN_FOCUS_MINUTES = 1

/** Maksimum focus süresi (dakika) */
export const MAX_FOCUS_MINUTES = 120

/** Sekme başlığı şablonu */
export const TAB_TITLE_TEMPLATE = '{time} — DeepFocus' as const

/** Varsayılan uygulama sekme başlığı */
export const DEFAULT_TAB_TITLE = 'DeepFocus — Minimalist Pomodoro Timer' as const

/** Uzun mola öncesi tamamlanması gereken pomodoro sayısı */
export const POMODORO_DOTS_COUNT = 4 as const

/** Her timer modunun vurgu rengi */
export const MODE_COLORS: Record<TimerMode, string> = {
  focus: '#7c6af7',
  'short-break': '#4ade80',
  'long-break': '#60a5fa',
} as const

/** Her timer modunun Türkçe etiketi */
export const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Odaklan',
  'short-break': 'Kısa Mola',
  'long-break': 'Uzun Mola',
} as const

/** localStorage anahtar isimleri */
export const STORAGE_KEYS = {
  TIMER: 'deepfocus:timer',
  TIMER_CONFIG: 'deepfocus:timer-config',
  TASKS: 'deepfocus:tasks',
  SESSIONS: 'deepfocus:sessions',
  STATS: 'deepfocus:stats',
  THEME_SELECTION: 'deepfocus:theme-selection',
  AMBIENT_SOUND: 'deepfocus:ambient-sound',
} as const
