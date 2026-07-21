'use client'

/**
 * EnvironmentLayer — Tuval (Canvas) Tabanlı Arka Plan Animasyonları
 * 
 * GPU hızlandırmalı, 30-50 parçacık (yağmur/kar) limitiyle çalışan,
 * 'prefers-reduced-motion' duyarlı tamamen performans optimize bir bileşendir.
 * Efekt kapalıyken requestAnimationFrame zincirini tamamen kırar ve CPU'yu 0'da bırakır.
 */

import React, { useEffect, useRef } from 'react'
import { useTimerStore } from '@/presentation/store/timer.store'
import { TIMER_DEFAULTS } from '@/shared/constants/timer.constants'

export function EnvironmentLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Eğer store'dan undefined/yakalanamayan bir config gelirse geri dönük uyumluluk defaultu
  const environment = useTimerStore((state) => state.config.environment) ?? TIMER_DEFAULTS.environment!

  useEffect(() => {
    // Performans Optimizasyonu 1: Animasyon İstemeyen Cihazlar
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Kapalıysa veya Reduced Motion ZORUNLU ise döngüye girmiyoruz + Temizliyoruz
    if (!environment.enabled || reducedMotion.matches) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    
    // Parçacık Modeli
    interface Particle {
      x: number
      y: number
      speed: number
      radius?: number
      length?: number
      opacity: number
    }
    let particles: Particle[] = []
    
    // Tema Rengi Okuma (Loop dışında 1 kere - CSS Custom Property: text-secondary)
    // Canvas içinde computed property sürekli okunmaz (Layout Thrashing).
    const computedStyle = getComputedStyle(document.body)
    const rawColor = computedStyle.getPropertyValue('--color-text-secondary').trim() 
    let themeColor = rawColor.startsWith('#') ? rawColor : '#888888' // Fallback
    
    if (rawColor === '') {
      themeColor = '#cbd5e1'
    }

    // Mobil optimizasyonu
    const isMobile = window.innerWidth < 768
    const particleCount = isMobile ? 15 : 40

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticle = (initialSpawn: boolean = false): Particle => {
      const isRain = environment.type === 'rain'
      
      if (isRain) {
        return {
          x: Math.random() * canvas.width,
          y: initialSpawn ? Math.random() * canvas.height : -20,
          speed: 12 + Math.random() * 8,   // Yağmur hızı (12-20)
          length: 10 + Math.random() * 15,
          opacity: 0.1 + Math.random() * 0.2 // Hafif silik görünüm
        }
      } else {
        return { // Snow
          x: Math.random() * canvas.width,
          y: initialSpawn ? Math.random() * canvas.height : -20,
          speed: 0.8 + Math.random() * 1.5, // Kar hızı yavaş (0.8-2.3)
          radius: 1 + Math.random() * 2,
          opacity: 0.2 + Math.random() * 0.4
        }
      }
    }

    const initParticles = () => {
      particles = []
      handleResize()
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle(true))
      }
    }

    const draw = () => {
      // Önceki ekranı sil
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const isRain = environment.type === 'rain'

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (!p) continue
        
        ctx.beginPath()
        
        if (isRain) {
          ctx.strokeStyle = themeColor
          ctx.globalAlpha = p.opacity
          ctx.lineWidth = 1.5
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + (p.speed * 0.15), p.y + (p.length || 10)) // Hafif yanal rüzgar etkisi / eğik
          ctx.stroke()
          
          p.y += p.speed
          p.x += p.speed * 0.15
        } else {
          ctx.fillStyle = themeColor
          ctx.globalAlpha = p.opacity
          ctx.arc(p.x, p.y, p.radius || 2, 0, Math.PI * 2)
          ctx.fill()
          
          p.y += p.speed
          // Kar'a hafif bir X dalgalanması ver
          p.x += Math.sin(p.y * 0.05) * 0.5
        }

        // Ekranın dışına çıktıysa resetle
        if (p.y > canvas.height || p.x > canvas.width) {
          particles[i] = createParticle(false)
        }
      }
      
      ctx.globalAlpha = 1 // reset
      animationFrameId = requestAnimationFrame(draw)
    }

    // Başlat
    initParticles()
    window.addEventListener('resize', initParticles)
    draw()

    // Cleanup: Çok önemli (rAF durdurulur)
    return () => {
      window.removeEventListener('resize', initParticles)
      cancelAnimationFrame(animationFrameId)
    }
  }, [environment.enabled, environment.type]) // enabled ve type değişince efekt resetlenir/kapanır

  if (!environment.enabled) return null // DOM'dan silebiliriz de performansa katkısı küçük ama temiz.

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[-1] touch-none opacity-80"
      aria-hidden="true"
    />
  )
}
