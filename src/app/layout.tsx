import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DeepFocus — Minimalist Pomodoro Timer',
  description:
    'Odaklanmak için tasarlanmış minimalist ve estetik Pomodoro zamanlayıcısı. Görev yönetimi, istatistikler, ambient sesler ve tema sistemi ile.',
  keywords: ['pomodoro', 'timer', 'focus', 'productivity', 'deep work', 'odaklanma'],
  authors: [{ name: 'DeepFocus' }],
  creator: 'DeepFocus',
  metadataBase: new URL('https://deepfocus.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://deepfocus.vercel.app',
    title: 'DeepFocus — Minimalist Pomodoro Timer',
    description: 'Odaklanmak için tasarlanmış minimalist Pomodoro zamanlayıcısı.',
    siteName: 'DeepFocus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeepFocus — Minimalist Pomodoro Timer',
    description: 'Odaklanmak için tasarlanmış minimalist Pomodoro zamanlayıcısı.',
  },
}

import { ThemeProvider } from '@/presentation/components/theme/ThemeProvider'

/**
 * Root layout — tüm sayfaların ortak iskelet yapısı.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans antialiased transition-colors duration-700">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
