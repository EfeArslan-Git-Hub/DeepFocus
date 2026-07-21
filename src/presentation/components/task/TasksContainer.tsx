'use client'

/**
 * TasksContainer — Görev listesi ana modülü.
 *
 * @packageDocumentation
 */

import React, { useEffect } from 'react'
import { useTasks } from '@/presentation/hooks/useTasks'
import { TaskInput } from './TaskInput'
import { TaskItem } from './TaskItem'
import { useTimer } from '@/presentation/hooks/useTimer'

export function TasksContainer() {
  const { tasks, activeTask, createTask, toggleTaskCompletion, setTaskActive, deleteTask } = useTasks()
  const { setCurrentTaskId } = useTimer()

  // Aktif task değiştiğinde Timer store'a (useTimer üzerinden) bildiriyoruz
  // Böylece Timer session'ı tamamlandığında ilgili task'a ait completedPomodoros artırılabilir.
  useEffect(() => {
    setCurrentTaskId(activeTask?.id ?? null)
  }, [activeTask?.id, setCurrentTaskId])

  // Toplam istatistikler (UI badge'leri için)
  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  
  return (
    <div className="mt-8 flex w-full flex-col gap-6">
      
      {/* Başlık ve İstatistik Alanı */}
      <div className="flex items-center justify-between px-2">
         <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">Görevler</h2>
         
         <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--color-glass-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
               {completedTasks} / {totalTasks} tamamlandı
            </span>
         </div>
      </div>

      {/* Yeni Görev Ekleme Formu */}
      <TaskInput onAddTask={createTask} />

      {/* Görev Listesi */}
      <div className="flex flex-col gap-2">
         {tasks.length === 0 ? (
           <div className="glass flex flex-col items-center justify-center gap-2 rounded-2xl p-8 text-center opacity-60">
             <div className="rounded-full bg-[var(--color-glass-border)] p-4 text-[var(--color-text-secondary)]">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 20h9"></path>
                 <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
               </svg>
             </div>
             <p className="text-sm font-medium text-[var(--color-text-secondary)]">Henüz bir görev eklemedin.</p>
           </div>
         ) : (
            tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTaskCompletion}
                onSetActive={(id) => setTaskActive(id === activeTask?.id ? null : id)}
                onDelete={deleteTask}
              />
            ))
         )}
      </div>

    </div>
  )
}
