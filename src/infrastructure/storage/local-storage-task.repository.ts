/**
 * LocalStorage Task Repository — ITaskRepository'nin localStorage implementasyonu.
 *
 * @packageDocumentation
 */

import type { ITaskRepository } from '../../domain/repositories/task.repository'
import type { TaskEntity } from '../../domain/entities/task.entity'
import { STORAGE_KEYS } from '../../shared/constants/timer.constants'

/**
 * localStorage tabanlı Task repository implementasyonu.
 */
export class LocalStorageTaskRepository implements ITaskRepository {
  private loadAll(): TaskEntity[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TASKS)
      if (!raw) return []
      return (JSON.parse(raw) as TaskEntity[]).map((t) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        ...(t.completedAt !== undefined ? { completedAt: new Date(t.completedAt) } : {}),
      }))
    } catch {
      return []
    }
  }

  private saveAll(tasks: TaskEntity[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
  }

  async findAll(): Promise<TaskEntity[]> {
    return this.loadAll()
  }

  async findById(id: string): Promise<TaskEntity | null> {
    return this.loadAll().find((t) => t.id === id) ?? null
  }

  async findActive(): Promise<TaskEntity | null> {
    return this.loadAll().find((t) => t.isActive) ?? null
  }

  async save(task: TaskEntity): Promise<void> {
    const tasks = this.loadAll()
    const index = tasks.findIndex((t) => t.id === task.id)
    if (index >= 0) {
      tasks[index] = task
    } else {
      tasks.push(task)
    }
    this.saveAll(tasks)
  }

  async delete(id: string): Promise<void> {
    const tasks = this.loadAll().filter((t) => t.id !== id)
    this.saveAll(tasks)
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.TASKS)
  }
}
