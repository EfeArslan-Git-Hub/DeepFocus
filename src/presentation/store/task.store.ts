'use client'

/**
 * TaskStore — UI'da gösterilen görevlerin durumunu (state) yönetir.
 *
 * @packageDocumentation
 */

import { create } from 'zustand'
import type { TaskEntity } from '@/domain/entities/task.entity'

export interface TaskStoreState {
  tasks: TaskEntity[]
}

export interface TaskStoreActions {
  setTasks: (tasks: TaskEntity[]) => void
  addTask: (task: TaskEntity) => void
  updateTask: (task: TaskEntity) => void
  removeTask: (id: string) => void
  clearTasks: () => void
}

export type TaskStore = TaskStoreState & TaskStoreActions

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  updateTask: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      ),
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  clearTasks: () => set({ tasks: [] }),
}))
