import { TimerContainer } from '@/presentation/components/timer'
import { TasksContainer } from '@/presentation/components/task'
import { StatsDashboard } from '@/presentation/components/stats'
import { Header } from '@/presentation/components/shared/Header'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 py-24 pb-32">
      <Header />
      
      {/* Arka plan gradyan (Tema değişkenleri ile dinamik) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-[var(--color-bg-primary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-primary)] transition-colors duration-700"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Timer Ana Bileşen */}
        <TimerContainer />

        {/* Görevler Modülü */}
        <TasksContainer />

        {/* İstatistikler Modülü */}
        <StatsDashboard />
      </div>
    </main>
  )
}
