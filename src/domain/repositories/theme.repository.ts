/**
 * IThemeRepository — Tema veri erişim sözleşmesi.
 *
 * @packageDocumentation
 */

import type { ThemeEntity, UserThemeSelection } from '../entities/theme.entity'

/**
 * Theme repository interface'i.
 * Infrastructure katmanında implementasyonu yapılır.
 */
export interface IThemeRepository {
  /**
   * Tüm mevcut temaları getirir.
   * @returns Tema listesi
   */
  findAll(): Promise<ThemeEntity[]>

  /**
   * ID'ye göre tema getirir.
   * @param id - Tema ID'si
   * @returns Tema entity'si veya null
   */
  findById(id: string): Promise<ThemeEntity | null>

  /**
   * Kullanıcının tema seçimini getirir.
   * @returns Kullanıcı tema seçimi
   */
  loadUserSelection(): Promise<UserThemeSelection | null>

  /**
   * Kullanıcının tema seçimini kaydeder.
   * @param selection - Yeni tema seçimi
   */
  saveUserSelection(selection: UserThemeSelection): Promise<void>
}
