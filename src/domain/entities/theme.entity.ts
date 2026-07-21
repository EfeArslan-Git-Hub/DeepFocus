/**
 * Theme Entity — Görsel tema modeli.
 *
 * Uygulamanın tema sistemini tanımlar.
 * Framework bağımsız, saf TypeScript.
 *
 * @packageDocumentation
 */

/** Tema kategorileri */
export type ThemeCategory = 'library' | 'forest' | 'rain' | 'ocean' | 'minimal' | 'custom'

/** Tema kullanım bağlamları */
export type ThemeContext = 'home' | 'focus' | 'ambient'

/** CSS custom property değerleri */
export interface ThemeColors {
  /** Birincil arka plan rengi */
  readonly '--color-bg-primary': string
  /** İkincil arka plan rengi */
  readonly '--color-bg-secondary': string
  /** Metin rengi */
  readonly '--color-text-primary': string
  /** Vurgu rengi */
  readonly '--color-accent': string
  /** Cam efekti arka planı */
  readonly '--color-glass-bg': string
  /** Cam efekti kenarlık */
  readonly '--color-glass-border': string
}

/** Tema Entity */
export interface ThemeEntity {
  /** Benzersiz tema ID'si */
  readonly id: string
  /** Tema adı */
  readonly name: string
  /** Tema kategorisi */
  readonly category: ThemeCategory
  /** Arka plan görseli URL'i (isteğe bağlı) */
  readonly backgroundImageUrl?: string
  /** Renk paleti */
  readonly colors: ThemeColors
  /** Seçilebilir bağlamlar */
  readonly availableContexts: readonly ThemeContext[]
}

/** Kullanıcının seçili temaları */
export interface UserThemeSelection {
  /** Ana sayfa teması */
  readonly homeThemeId: string
  /** Odaklanma teması */
  readonly focusThemeId: string
  /** Ortam teması */
  readonly ambientThemeId: string
}
