# DeepFocus

> Minimalist ve estetik Pomodoro/odaklanma zamanlayıcısı.
> [online demo](https://deep-focus-six.vercel.app/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EfeArslan-Git-Hub/DeepFocus)

---

## ✨ Özellikler

- 🎯 **Pomodoro Timer** — Focus / Short Break / Long Break modları
- 🎨 **Tema Sistemi** — Kütüphane, Orman, Yağmur, Okyanus, Minimal Dark
- ✅ **Görev Listesi** — Basit CRUD, aktif oturum bağlantısı
- 📊 **İstatistikler** — Streak, günlük/haftalık/aylık odaklanma süresi
- 🎵 **Ambient Sesler** — Yağmur, kafe, beyaz gürültü, orman, şömine
- 🪟 **Mini Pencere (PiP)** — Document Picture-in-Picture API ile pop-out timer
- ⚙️ **Ayarlar Paneli** — Süre, tema ve ses ayarları

## 🏗️ Mimari

Proje **Clean Architecture** prensiplerine göre yapılandırılmıştır:

```
src/
├── domain/           # İş kuralları — framework bağımsız
│   ├── entities/     # Timer, Task, Session, Theme, UserStats
│   ├── value-objects/ # Duration, StreakCount
│   └── repositories/ # Soyut repository interface'leri
├── application/      # Use-case'ler ve servisler
│   ├── use-cases/    # StartFocusSession, CompleteSession, UpdateStreak, SyncTimerAcrossWindows
│   └── services/     # TimerService
├── infrastructure/   # Dış dünya adaptörleri
│   ├── storage/      # localStorage repository implementasyonları
│   ├── audio/        # AmbientAudioService
│   └── pip/          # PipWindowService (Document PiP + fallback popup)
├── presentation/     # React UI katmanı
│   ├── components/   # Sunum bileşenleri (timer, tasks, stats, themes, shared)
│   ├── hooks/        # Custom hook'lar (useTimer, useTheme, useStats...)
│   └── layouts/
└── shared/           # Tüm katmanlara açık yardımcılar
    ├── constants/    # TIMER_DEFAULTS, BUILT_IN_THEMES, AMBIENT_SOUNDS
    ├── types/        # DeepReadonly, Result, ID
    └── utils/        # cn(), date utils, formatSeconds
```

**Bağımlılık yönü:** `presentation → application → domain` (tek yönlü)

## 🛠️ Teknoloji Yığını

| Alan | Teknoloji |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Dil | TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| State | Zustand |
| Validasyon | Zod |
| Test | Vitest + React Testing Library |
| Lint/Format | ESLint + Prettier (Husky pre-commit) |
| Deploy | Vercel |

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Testleri çalıştır
npm test

# Type kontrolü
npm run type-check

# Lint
npm run lint
```

## 📦 Veri Saklama

MVP aşamasında tüm veriler `localStorage`'da saklanır. Repository pattern sayesinde ileride Supabase/PostgreSQL geçişi sadece `infrastructure/storage/` klasöründe yeni implementasyon yazılarak yapılabilir.

## 🤝 Katkı Rehberi

### Commit Mesajları

[Conventional Commits](https://www.conventionalcommits.org/) formatı kullanılır:

```
feat:     Yeni özellik
fix:      Hata düzeltmesi
refactor: Kod yeniden yapılandırma (davranış değişmez)
docs:     Sadece dokümantasyon değişikliği
test:     Test ekleme/güncelleme
chore:    Build, tooling, bağımlılık güncellemeleri
style:    Kod biçimlendirme
```

### Dallanma Stratejisi

- `main` — production branch
- `develop` — geliştirme branch'i
- `feature/<kısa-açıklama>` — yeni özellikler
- `fix/<kısa-açıklama>` — hata düzeltmeleri

### Geliştirme Kuralları

1. Her özellik için en az bir unit test yaz
2. Magic string/number kullanma — `shared/constants/` kullan
3. Her public fonksiyon TSDoc açıklamasına sahip olmalı
4. `domain/` klasörüne React/Next.js import etme
5. Hook'lar iş mantığı içermemeli — sadece use-case çağrısı yapmalı

## 📄 Lisans

MIT
