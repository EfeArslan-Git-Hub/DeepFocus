'use client'

/**
 * useTasks Hook — Task Repository ile Store arasındaki bağı kurar.
 *
 * @packageDocumentation
 */

import { useCallback, useEffect, useRef } from 'react'
import { useTaskStore } from '../store/task.store'
import { LocalStorageTaskRepository } from '@/infrastructure/storage/local-storage-task.repository'
import type { TaskEntity, TaskPriority } from '@/domain/entities/task.entity'

function getRepo() {
  return new LocalStorageTaskRepository()
}

export function useTasks() {
  const store = useTaskStore()
  const mounted = useRef(false)

  const loadTasks = useCallback(async () => {
    try {
      const repo = getRepo()
      const allTasks = await repo.findAll()
      store.setTasks(allTasks)
    } catch (err) {
      console.error('[useTasks] Görevler yüklenemedi:', err)
    }
  }, [store])

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      void loadTasks()
    }
  }, [loadTasks])

  const createTask = useCallback(async (
    title: string,
    estimatedPomodoros: number,
    priority: TaskPriority = 'medium',
    description?: string
  ) => {
    const newTask: TaskEntity = {
      id: crypto.randomUUID(),
      title,
      ...(description !== undefined ? { description } : {}),
      priority,
      estimatedPomodoros,
      completedPomodoros: 0,
      completed: false,
      isActive: false,
      createdAt: new Date(),
    }

    try {
      await getRepo().save(newTask)
      store.addTask(newTask)
    } catch (err) {
      console.error('[useTasks] Görev oluşturulamadı:', err)
    }
    return newTask
  }, [store])

  const toggleTaskCompletion = useCallback(async (id: string) => {
    const taskIndex = store.tasks.findIndex(t => t.id === id)
    if (taskIndex < 0) return

    const task = store.tasks[taskIndex]!
    const { completedAt, ...rest } = task
    const updatedTask: TaskEntity = {
      ...rest,
      completed: !task.completed,
      ...(!task.completed ? { completedAt: new Date() } : {}),
      isActive: !task.completed ? false : task.isActive // Tamamlandıysa active'den çıkar
    }

    try {
      await getRepo().save(updatedTask)
      store.updateTask(updatedTask)
    } catch (err) {
      console.error('[useTasks] Görev güncellenemedi:', err)
    }
  }, [store])

  const setTaskActive = useCallback(async (id: string | null) => {
    try {
      const repo = getRepo()
      // Önce mevcut aktif(ler)i passive yapalım (Sadece 1 aktif task istiyorsak)
      for (const t of store.tasks) {
        if (t.isActive && t.id !== id) {
          const updated = { ...t, isActive: false }
          await repo.save(updated)
          store.updateTask(updated)
        }
      }

      if (id) {
        const task = store.tasks.find(t => t.id === id)
        if (task && !task.completed) {
          const updated = { ...task, isActive: true }
          await repo.save(updated)
          store.updateTask(updated)
        }
      }
    } catch (err) {
       console.error('[useTasks] Aktif görev ayarlanamadı:', err)
    }
  }, [store])

  const deleteTask = useCallback(async (id: string) => {
    try {
       await getRepo().delete(id)
       store.removeTask(id)
    } catch (err) {
       console.error('[useTasks] Görev silinemedi:', err)
    }
  }, [store])
  
  const sortTasks = useCallback((tasks: TaskEntity[]) => {
    // 1. Bitmemişler başta (completed: false)
    // 2. Active olan en üstte
    // 3. Priority'e göre (high -> medium -> low)
    // 4. createdAt rezerve (en yeni en üstte)
    
    const priorityWeight = { high: 3, medium: 2, low: 1 }

    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
      if (a.priority !== b.priority) return priorityWeight[b.priority] - priorityWeight[a.priority]
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  }, [])

  return {
    tasks: sortTasks(store.tasks),
    activeTask: store.tasks.find((t) => t.isActive && !t.completed) ?? null,
    createTask,
    toggleTaskCompletion,
    setTaskActive,
    deleteTask
  }
}
