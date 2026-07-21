/**
 * Ambient ses sabitleri — Mevcut ortam sesleri.
 *
 * @packageDocumentation
 */

/** Ambient ses öğesi */
export interface AmbientSound {
  readonly id: string
  readonly name: string
  readonly emoji: string
  /** Ses dosyası yolu (/public/sounds/ altında) */
  readonly filePath: string
}

/** Mevcut ambient sesler */
export const AMBIENT_SOUNDS: readonly AmbientSound[] = [
  { id: 'rain', name: 'Yağmur', emoji: '🌧️', filePath: '/sounds/rain.mp3' },
  { id: 'cafe', name: 'Kafe', emoji: '☕', filePath: '/sounds/cafe.mp3' },
  { id: 'white-noise', name: 'Beyaz Gürültü', emoji: '🌊', filePath: '/sounds/white-noise.mp3' },
  { id: 'forest', name: 'Orman', emoji: '🌲', filePath: '/sounds/forest.mp3' },
  { id: 'fireplace', name: 'Şömine', emoji: '🔥', filePath: '/sounds/fireplace.mp3' },
] as const

/** Varsayılan ses seviyesi (0-1) */
export const DEFAULT_VOLUME = 0.5 as const
