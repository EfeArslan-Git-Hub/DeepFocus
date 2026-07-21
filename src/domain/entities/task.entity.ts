/**
 * Task Entity — Görev listesi iş modeli.
 *
 * Kullanıcının oluşturduğu görevleri temsil eder.
 * Framework bağımsız, saf TypeScript.
 *
 * @packageDocumentation
 */

/** Görev öncelik seviyeleri */
export type TaskPriority = 'low' | 'medium' | 'high'

/** Görev Entity */
export interface TaskEntity {
  /** Benzersiz görev ID'si */
  readonly id: string
  /** Görev başlığı */
  readonly title: string
  /** Görev açıklaması (isteğe bağlı) */
  readonly description?: string
  /** Tamamlandı mı? */
  readonly completed: boolean
  /** Öncelik seviyesi */
  readonly priority: TaskPriority
  /** Tahmini pomodoro sayısı */
  readonly estimatedPomodoros: number
  /** Tamamlanan pomodoro sayısı */
  readonly completedPomodoros: number
  /** Aktif focus oturumuna bağlı mı? */
  readonly isActive: boolean
  /** Oluşturulma zamanı */
  readonly createdAt: Date
  /** Tamamlanma zamanı (varsa) */
  readonly completedAt?: Date
}
