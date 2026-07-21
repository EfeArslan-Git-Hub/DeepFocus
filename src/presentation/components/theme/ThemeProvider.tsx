'use client'

/**
 * ThemeProvider — Uygulamanın theme durumunu yükler.
 *
 * layout.tsx içinde <body> altına yerleştirilerek uygulamanın
 * açılış aşamasında kullanıcının kaydettiği temayı document root'una uygular.
 * Bu hook client side render esnasında çalışacağı için SSR sırasında varsayılan tema
 * CSS'ten okunur, JS devreye girince overwrite edilir.
 *
 * @packageDocumentation
 */

import React, { useEffect, useState } from 'react'
import { useThemeStore } from '@/presentation/store/theme.store'

export function ThemeProvider({ children }: { readonly children: React.ReactNode }) {
  const loadSavedTheme = useThemeStore((state) => state.loadSavedTheme)
  const activeTheme = useThemeStore((state) => state.activeTheme)
  const [mounted, setMounted] = useState(false)

  // Sadece ilk bağlanışta tarayıcıdan (localStorage) değeri yükle
  useEffect(() => {
    loadSavedTheme()
    setMounted(true)
  }, [loadSavedTheme])

  return (
    <>
      {/* 
        Eğer temada bir arka plan resmi varsa burada dinamik olarak render edilebilir.
        Bu div, gradyan div'inin altında bulunacak.
      */}
      {mounted && activeTheme.backgroundImageUrl && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${activeTheme.backgroundImageUrl})` }}
          aria-hidden="true"
        />
      )}
      {children}
    </>
  )
}
