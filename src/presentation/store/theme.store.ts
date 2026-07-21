'use client'

/**
 * ThemeStore — Uygulama tema durumu globale yönetimi.
 *
 * @packageDocumentation
 */

import { create } from 'zustand'
import { BUILT_IN_THEMES, DEFAULT_THEME_ID } from '@/shared/constants/theme.constants'
import { STORAGE_KEYS } from '@/shared/constants/timer.constants'
import type { ThemeEntity } from '@/domain/entities/theme.entity'

export interface ThemeStoreState {
  activeThemeId: string
  activeTheme: ThemeEntity
}

export interface ThemeStoreActions {
  /** Temayı günceller ve localStorage'a kaydeder */
  setTheme: (themeId: string) => void
  /** Tarayıcıdaki kayıtlı temayı yükler (sadece client-side) */
  loadSavedTheme: () => void
}

export type ThemeStore = ThemeStoreState & ThemeStoreActions

function getThemeById(id: string): ThemeEntity {
  return BUILT_IN_THEMES.find((t) => t.id === id) ?? BUILT_IN_THEMES[0]!
}

export const useThemeStore = create<ThemeStore>((set) => ({
  activeThemeId: DEFAULT_THEME_ID,
  activeTheme: getThemeById(DEFAULT_THEME_ID),

  setTheme: (themeId) => {
    const theme = getThemeById(themeId)
    set({ activeThemeId: themeId, activeTheme: theme })
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.THEME_SELECTION, themeId)
      applyThemeVariables(theme)
    }
  },

  loadSavedTheme: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME_SELECTION)
      if (saved) {
        const theme = getThemeById(saved)
        set({ activeThemeId: saved, activeTheme: theme })
        applyThemeVariables(theme)
      } else {
        const defaultTheme = getThemeById(DEFAULT_THEME_ID)
        applyThemeVariables(defaultTheme)
      }
    }
  },
}))

/**
 * Temanın CSS değişkenlerini document root'a uygular.
 * Ayrıca varsa arkaplan resmini uygular.
 */
function applyThemeVariables(theme: ThemeEntity) {
  const root = document.documentElement
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  if (theme.backgroundImageUrl) {
    // Burada body arka planına pseudo element ile resim verebiliriz veya bir root değişkeni ile yapabiliriz.
    // Şimdilik CSS değişkeni olarak ekleyelim, globals.css içinde kullanılabilir.
    root.style.setProperty('--bg-image-url', `url(${theme.backgroundImageUrl})`)
  } else {
    root.style.setProperty('--bg-image-url', 'none')
  }
}
