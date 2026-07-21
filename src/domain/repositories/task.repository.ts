/**
 * ITaskRepository — Görev veri erişim sözleşmesi.
 *
 * @packageDocumentation
 */

import type { TaskEntity } from '../entities/task.entity'

/**
 * Task repository interface'i.
 * Infrastructure katmanında implementasyonu yapılır.
 */
export interface ITaskRepository {
  /**
   * Tüm görevleri getirir.
   * @returns Görev listesi
   */
  findAll(): Promise<TaskEntity[]>

  /**
   * ID'ye göre görev getirir.
   * @param id - Görev ID'si
   * @returns Görev entity'si veya null
   */
  findById(id: string): Promise<TaskEntity | null>

  /**
   * Aktif görevi getirir ("şu an neye odaklanıyorsun").
   * @returns Aktif görev veya null
   */
  findActive(): Promise<TaskEntity | null>

  /**
   * Yeni görev kaydeder veya mevcut görevi günceller.
   * @param task - Kaydedilecek görev entity'si
   */
  save(task: TaskEntity): Promise<void>

  /**
   * Görevi siler.
   * @param id - Silinecek görev ID'si
   */
  delete(id: string): Promise<void>

  /**
   * Tüm görevleri siler.
   */
  clear(): Promise<void>
}
