/**
 * LocalStorage Theme Repository — IThemeRepository'nin localStorage implementasyonu.
 *
 * @packageDocumentation
 */

import type { IThemeRepository } from '../../domain/repositories/theme.repository'
import type { ThemeEntity, UserThemeSelection } from '../../domain/entities/theme.entity'
import { BUILT_IN_THEMES, DEFAULT_THEME_ID } from '../../shared/constants/theme.constants'
import { STORAGE_KEYS } from '../../shared/constants/timer.constants'

export class LocalStorageThemeRepository implements IThemeRepository {
  async findAll(): Promise<ThemeEntity[]> {
    return [...BUILT_IN_THEMES]
  }

  async findById(id: string): Promise<ThemeEntity | null> {
    return BUILT_IN_THEMES.find((t) => t.id === id) ?? null
  }

  async loadUserSelection(): Promise<UserThemeSelection | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.THEME_SELECTION)
      return raw ? (JSON.parse(raw) as UserThemeSelection) : null
    } catch {
      return null
    }
  }

  async saveUserSelection(selection: UserThemeSelection): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.THEME_SELECTION, JSON.stringify(selection))
  }
}

/** Varsayılan tema seçimi */
export const DEFAULT_THEME_SELECTION: UserThemeSelection = {
  homeThemeId: DEFAULT_THEME_ID,
  focusThemeId: DEFAULT_THEME_ID,
  ambientThemeId: DEFAULT_THEME_ID,
} as const
