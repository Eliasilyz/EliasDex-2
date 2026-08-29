# EliasDex 2 — Architecture & Visual Design System Reference

> Dokumentasi teknis komprehensif mengenai arsitektur perangkat lunak, struktur modul, integrasi data eksternal, state management, dan visual design system dari project **EliasDex 2** (`eliasdex2`). Dokumen ini disusun berdasarkan eksplorasi langsung terhadap seluruh codebase.

---

## 1. Overview

EliasDex 2 adalah platform web modern untuk discovery, eksplorasi katalog, pelacakan histori tontonan, dan streaming anime berkecepatan tinggi yang dibangun menggunakan Next.js App Router, React 19, TypeScript, dan Tailwind CSS v4. Platform ini mengadopsi arsitektur multi-source data balancer yang memadukan data dari AniList GraphQL v2, Jikan (MyAnimeList REST API v4), dan catalog/streaming server AniKoto & MegaPlay dengan mekanisme auto-fallback offline yang tangguh. Fitur utama mencakup pemutaran episode multi-server (Zoko, MegaPlay MAL/AniList/Catalog, VidStream Backup) dengan dukungan toggle SUB/DUB, pemutar musik tema global (OP/ED), peralihan bahasa judul Romaji/English secara real-time, jadwal rilis mingguan dinamis, serta penyimpanan watchlist dan watch progress berbasis local storage tanpa ketergantungan database eksternal.

---

## 2. Architecture

Arsitektur aplikasi menerapkan pola decoupled multi-layer antara Client Component, Server Proxy Layer, Provider Fallback Layer, dan External Streaming Providers.

### Diagram Alur Data & Eksekusi

```text
[ Browser / Client View ]
  │
  ├── [ React Context & Smooth Scroll Providers ]
  │     ├── SmoothScrollProvider (Lenis v1.3 Smooth Scrolling & Inertial Scroll Engine)
  │     ├── ThemeProvider (Dark / Light / System Mode)
  │     ├── TitleLanguageProvider ('en' English vs 'jp' Romaji/Kanji)
  │     ├── DataSourceProvider ('auto' Hybrid vs 'anilist' vs 'jikan')
  │     ├── WatchProvider (Watchlist & Watch Progress in LocalStorage)
  │     └── MusicPlayerProvider (Global OP/ED Audio & Video Queue)
  │
  ├── [ Unified Anime API Layer (`src/lib/animeApi.ts`) ]
  │     ├── Mode: 'anilist' ──> `src/lib/anilist.ts` ──> POST `/api/anilist` (Proxy)
  │     ├── Mode: 'jikan'   ──> `src/lib/jikan.ts`   ──> GET  `/api/jikan/*` (Proxy)
  │     ├── Mode: 'auto'    ──> Hybrid Priority (AniList Fast Query ──[Fallback]──> Jikan ──[Fallback]──> Static Cache)
  │     └── Mode: 'fallback'──> `src/lib/fallbackData.ts` (Offline Mock Dataset)
  │
  ├── [ Next.js Route Handlers (`src/app/api/`) ]
  │     ├── `/api/anilist`        ──> Concurrency & Token Bucket Rate Limiter ──> `https://graphql.anilist.co`
  │     ├── `/api/jikan/[...path]`──> Token Bucket Rate Limiter + Retry Backoff ──> `https://api.jikan.moe/v4`
  │     ├── `/api/anikoto/[...path]` ──> Rate Limiter + Server Cache ──> `https://anikotoapi.site`
  │     ├── `/api/music/search`   ──> YouTube Video ID Parser & Resolver
  │     ├── `/api/stream`         ──> MegaPlay / Zoko Stream URL Builder
  │     └── `/api/health`         ──> Uptime & Health Status Check
  │
  └── [ External Streaming & Media Embeds ]
        ├── MegaPlay (`https://megaplay.buzz`)
        ├── Zoko Video (`https://zokoanime.video`)
        ├── VidStream Fallback (`https://vidsrc.cc`)
        └── YouTube No-Cookie (`https://www.youtube-nocookie.com`)
```

---

## 3. Module Breakdown

### A. Root & Core Config

| File | Tanggung Jawab Utama | Komponen / Fungsi Kunci | Dependensi Utama |
| :--- | :--- | :--- | :--- |
| `package.json` | Konfigurasi dependensi project, script dev/build/start/lint | Script `dev`, `build`, `start`, `lint` | `next@^16.3.0`, `react@^19.0.1`, `lenis@^1.3.26`, `@tailwindcss/postcss@^4.1.14`, `lucide-react`, `zod`, `swr` |
| `next.config.ts` | Konfigurasi Next.js runtime | `nextConfig` (`reactStrictMode: true`) | `next` |
| `tsconfig.json` | Konfigurasi TypeScript compiler dan path alias | Path alias `@/* -> ./src/*` | `typescript` |
| `postcss.config.mjs` | Integrasi styling PostCSS | Plugin `@tailwindcss/postcss` | `@tailwindcss/postcss` |
| `src/types.ts` | Skema validasi Zod dan TypeScript types komprehensif | `JikanAnimeSchema`, `Anime`, `AnimeEpisode`, `AnimeCharacterRole`, `AnimeStaffMember`, `AnimeThemeSongs`, `AnimeRelation`, `WatchProgress`, `WatchlistItem`, `SearchFilters`, `MusicTrack`, `StreamSource` | `zod` |

---

### B. Context & State Management (`src/context/` & `src/components/providers/`)

| File | Tanggung Jawab | Hook & Fungsi Kunci | State yang Dikelola |
| :--- | :--- | :--- | :--- |
| `SmoothScrollProvider.tsx` | Provider smooth scrolling global berbasis Lenis dengan scroll restoration instan saat pergantian rute | `SmoothScrollProvider`, `useLenis()` | Engine instance Lenis (`lerp: 0.1` physics damping, `smoothWheel: true`, `prevent` filter) |
| `ThemeContext.tsx` | Manajemen tema aplikasi (light, dark, system preference listener) | `ThemeProvider`, `useTheme()`, `toggleTheme()`, `setTheme()` | `theme` (`light` \| `dark` \| `system`), `resolvedTheme` (`light` \| `dark`) |
| `TitleLanguageContext.tsx` | Manajemen preferensi bahasa judul anime secara instan di semua tampilan | `TitleLanguageProvider`, `useTitleLanguage()`, `getTitle()`, `getSecondaryTitle()`, `getNativeJapaneseTitle()` | `titleLanguage` (`'en'` \| `'jp'`) |
| `DataSourceContext.tsx` | Pemilihan API upstream penyedia metadata anime | `DataSourceProvider`, `useDataSource()`, `setDataSource()` | `dataSource` (`'auto'` \| `'jikan'` \| `'anilist'`), `dataSourceName`, `dataSourceDescription` |
| `WatchContext.tsx` | Pelacakan progres tontonan (episode & timestamp) dan watchlist pengguna | `WatchProvider`, `useWatch()`, `recordWatchProgress()`, `setWatchlistStatus()`, `removeFromWatchlist()`, `clearHistory()` | `history` (`WatchProgress[]`), `watchlist` (`WatchlistItem[]`) |
| `MusicPlayerContext.tsx` | Pengendali pemutar musik tema (OP/ED) global dengan persistent iframe playback | `MusicPlayerProvider`, `useMusicPlayer()`, `playTrack()`, `togglePlay()`, `nextTrack()`, `prevTrack()`, `setPlaybackMode()`, `setShowVideoModal()` | `currentTrack`, `playlist`, `isPlaying`, `isLoading`, `isMinimized`, `showVideoModal`, `playbackMode` |


---

### C. Data Access & Service Libraries (`src/lib/`)

| File | Tanggung Jawab | Fungsi Kunci |
| :--- | :--- | :--- |
| `src/lib/animeApi.ts` | Abstraksi multi-source terpadu yang memediasi query antara AniList, Jikan, dan fallback | `getUnifiedSeasonNow`, `getUnifiedTopAnime`, `getUnifiedSchedule`, `getUnifiedSearchAnime`, `getUnifiedAnimeById`, `getUnifiedEpisodes`, `getUnifiedGenres`, `getUnifiedCharacters`, `getUnifiedStaff`, `getUnifiedRecommendations`, `getUnifiedRelations`, `getUnifiedThemes`, `getUnifiedExternalLinks` |
| `src/lib/anilist.ts` | GraphQL client & data normalizer untuk AniList API v2 | `fetchAniListGraphQL`, `normalizeAniListMedia`, `getAniListSeasonNow`, `getAniListTopAnime`, `searchAniListAnime`, `getAniListSchedule`, `getAniListAnimeById`, `getAniListCharacters`, `getAniListStaff`, `getAniListRecommendations`, `getAniListGenres` |
| `src/lib/jikan.ts` | REST API client & error handler untuk MyAnimeList via Jikan v4 | `fetchJikan`, `getAnimeById`, `getSeasonNow`, `getTopAnime`, `getSchedule`, `searchAnime`, `getAnimeEpisodes`, `getAnimeGenres`, `getAnimeRecommendations`, `getAnimeCharacters`, `getAnimeThemes`, `getAnimeStaff`, `getAnimeRelations`, `getAnimeExternalLinks` |
| `src/lib/anikoto.ts` | Resolver catalog series untuk mapping episode stream alternatif | `getAnikotoSeries` |
| `src/lib/stream.ts` | Builder URL streaming player untuk berbagai server embed | `buildStreamUrl`, `resolveEmbedId`, `STREAM_SERVERS` |
| `src/lib/music.ts` | Client helper pencarian video streaming lagu tema | `searchThemeSong` |
| `src/lib/cache.ts` | In-memory TTL caching layer dengan periodic auto-pruning | `getCached`, `setCached`, `clearCache` |
| `src/lib/rateLimiter.ts` | Token bucket concurrency rate limiter untuk mencegah HTTP 429 & 504 | `createRateLimiter`, `jikanRateLimiter`, `anilistRateLimiter`, `anikotoRateLimiter` |
| `src/lib/fallbackData.ts` | Dataset offline statis komprehensif saat upstream API down | `FALLBACK_ANIME_LIST`, `FALLBACK_GENRES`, `getFallbackSchedule`, `getFallbackAnimeById`, `generateFallbackEpisodes`, `getFallbackCharacters`, `getFallbackThemes`, `getFallbackStaff`, `getFallbackRelations`, `searchFallbackAnime` |
| `src/lib/useNavigate.ts` | Custom navigation hook pembungkus Next.js router dengan automatic scroll-to-top | `useAppNavigate` |
| `src/lib/server/apiHandlers.ts` | Server-side proxy handler dengan in-flight promise coalescing & fallback synthesis | `handleJikanProxy`, `handleAnikotoProxy`, `handleAnilistProxy`, `handleMusicSearch`, `getJikanFallbackResponse` |
| `src/lib/server/response.ts` | Helper response header injection untuk Next.js server route | `jsonWithHeaders` |

---

### D. Next.js App Router & Internal Endpoints (`src/app/`)

| Route | Tipe | Tanggung Jawab |
| :--- | :--- | :--- |
| `src/app/layout.tsx` | Server/Client Layout | Root HTML layout, registrasi Google Fonts (`Plus_Jakarta_Sans`, `Outfit`), integrasi `AppProviders` & `AppShell` |
| `src/app/page.tsx` | Client Page | Entry point Home Page (`HomePage`) |
| `src/app/anime/[malId]/page.tsx` | Client Page | Route detail anime (`AnimeDetailPage`) dengan parameter `malId` |
| `src/app/watch/[malId]/[ep]/page.tsx` | Client Page | Route streaming player (`WatchPage`) dengan parameter `malId` dan `ep` |
| `src/app/browse/page.tsx` | Client Page | Route katalog dan genre browsing (`BrowsePage`) |
| `src/app/search/page.tsx` | Client Page | Route pencarian filter interaktif (`SearchPage`) |
| `src/app/top/page.tsx` | Client Page | Route chart anime teratas (`TopAnimePage`) |
| `src/app/schedule/page.tsx` | Client Page | Route jadwal tayang mingguan (`SchedulePage`) |
| `src/app/watchlist/page.tsx` | Client Page | Route daftar anime tersimpan (`WatchlistPage`) |
| `src/app/history/page.tsx` | Client Page | Route riwayat tontonan episode (`HistoryPage`) |
| `src/app/api/anilist/route.ts` | API Route (POST) | Server proxy untuk GraphQL AniList query |
| `src/app/api/jikan/[...path]/route.ts` | API Route (GET) | Server proxy untuk REST endpoints Jikan v4 |
| `src/app/api/anikoto/[...path]/route.ts`| API Route (GET) | Server proxy untuk catalog data AniKoto |
| `src/app/api/music/search/route.ts` | API Route (GET) | YouTube search parsing endpoint untuk video tema |
| `src/app/api/stream/route.ts` | API Route (GET) | Stream URL resolver endpoint |
| `src/app/api/health/route.ts` | API Route (GET) | Uptime & platform status check |

---

### E. UI Components Breakdown (`src/components/`)

#### 1. Core UI Elements (`src/components/ui/`)
- `Badge.tsx` — Badge status multi-variant (`primary`, `secondary`, `success`, `warning`, `info`, `outline`, `sub`, `dub`).
- `Button.tsx` — Tombol aksi multi-variant (`primary`, `secondary`, `outline`, `ghost`, `danger`) dengan 3 ukuran (`sm`, `md`, `lg`).
- `DataSourceSelector.tsx` — Dropdown kompak di navbar & grid selector di settings untuk memilih provider data (`Auto Hybrid`, `AniList GraphQL`, `MyAnimeList Jikan`).
- `Skeleton.tsx` — Skeleton loading state (`Skeleton`, `AnimeCardSkeleton`, `HeroSkeleton`).
- `ThemeToggle.tsx` — Tombol siklus pergantian tema (Dark -> Light -> System).
- `TitleLanguageToggle.tsx` — Toggle switcher bahasa judul anime (EN vs JP).

#### 2. Layout Elements (`src/components/layout/`)
- `AppShell.tsx` — Wrapper layout global yang menyatukan `Navbar`, main container (`max-w-7xl`), `Footer`, dan `GlobalMusicPlayer`.
- `Navbar.tsx` — Sticky navigation bar dengan logo gradien, tautan navigasi desktop/mobile, input pencarian live, data source selector, title language toggle, dan theme toggle.
- `SearchBar.tsx` — Search input bar dengan live autocompletion dropdown, keyboard shortcut `/`, debounce 350ms, dan navigasi instan.
- `Footer.tsx` — Footer informatif berisi deskripsi singkat, quick links, atribusi API provider, status rate limiter, dan copyright.

#### 3. Anime Components (`src/components/anime/`)
- `AnimeCard.tsx` — Kartu anime standar poster 3:4 dengan overlay play button on hover, rating badge, episode badge, quick watchlist bookmark popover, dan genre preview.
- `AnimeGrid.tsx` — Grid responsif (2 sampai 6 kolom) yang merender daftar `AnimeCard` lengkap dengan loading skeleton, error state, dan empty state.
- `AnimeListRow.tsx` — Kartu tampilan list horizontal dengan preview sinopsis, info studio, season, genre chips, dan tombol watch episode instan.
- `HeroCarousel.tsx` — Carousel featured anime layar lebar dengan banner latar belakang cinematic, auto-slide interval 6 detik, cuplikan sinopsis, tombol CTA Watch/Details/Bookmark, dan navigasi dot/arrow.
- `ScheduleRow.tsx` — Baris scroll horizontal jadwal anime harian dengan tab navigasi hari (Senin–Minggu) dan waktu siaran JST.
- `EpisodeList.tsx` — Selector episode interaktif dengan mode grid/list, range selector per 50 episode, search filter nomor episode, indikator episode yang sedang ditonton, dan status filler.
- `GenreSelector.tsx` — Baris horizontal pill tombol filter genre dengan jumlah hitungan judul.
- `CharacterList.tsx` — Grid karakter 2-sisi (Karakter di sisi kiri & Voice Actor di sisi kanan) dengan tab filter `Main` / `Supporting` dan search bar.
- `StaffList.tsx` — Grid kru produksi anime dengan filter role (`Directors & Leads`, `Original Creator & Design`, `Music & Sound`).
- `ThemeSongsList.tsx` — Daftar lagu pembuka (OP) dan penutup (ED) lengkap dengan tombol putar instan di Global Music Player, tombol modal video MV, tombol copy nama lagu, serta tautan eksternal ke YouTube dan Spotify.
- `TrailerSection.tsx` — Container pemutar trailer YouTube resmi anime dengan thumbnail high-res dan overlay play button.

#### 4. Player & Music Components (`src/components/player/` & `src/components/music/`)
- `PlayerFrame.tsx` — Frame pemutar video 16:9 responsif dengan overlay loading spinner, handling error, tombol reload, dan tombol fullscreen.
- `LanguageToggle.tsx` — Segmented control SUB vs DUB.
- `ServerSelector.tsx` — Selector server streaming multi-provider (`Zoko`, `MegaPlay MAL`, `MegaPlay AniList`, `MegaPlay Catalog`, `VidStream Backup`).
- `ServerNotice.tsx` — Banner tips interaktif yang dapat di-dismiss.
- `usePlayerEvents.ts` — React hook untuk mendengarkan pesan `postMessage` (progress & playback completion) dari player embed.
- `GlobalMusicPlayer.tsx` — Floating music player bar di bagian bawah layar dengan animasi vinyl spinning, equalizer wave, playlist queue drawer, kontrol loop/shuffle/next/prev, serta modal video 16:9

---

## 4. State & Configuration

### A. Managed State & Storage Keys

Aplikasi menyimpan preferensi pengguna dan riwayat secara lokal di browser (`localStorage`):

| Storage Key | Tipe Data | Nilai / Default | Deskripsi |
| :--- | :--- | :--- | :--- |
| `animestream_theme` | String | `'dark'` (default), `'light'`, `'system'` | Preferensi tema warna UI |
| `animestream_title_language` | String | `'en'` (default), `'jp'` | Preferensi bahasa judul (English vs Romaji/Kanji) |
| `animestream_datasource_preference` | String | `'auto'` (default), `'jikan'`, `'anilist'` | Preferensi upstream data provider |
| `animestream_watch_history` | JSON Array (`WatchProgress[]`) | `[]` (maks. 50 entri) | Riwayat episode anime yang ditonton beserta timestamp |
| `animestream_watchlist` | JSON Array (`WatchlistItem[]`) | `[]` | Daftar anime yang disimpan (`watching`, `plan_to_watch`, `completed`, `dropped`) |

### B. Environment Variables (`.env.example`)

```env
# Anime APIs (Optional overrides - defaults fallback to live public endpoints)
JIKAN_BASE_URL="https://api.jikan.moe/v4"
ANIKOTO_BASE_URL="https://anikotoapi.site"
MEGAPLAY_BASE_URL="https://megaplay.buzz"
NEXT_PUBLIC_MEGAPLAY_BASE_URL="https://megaplay.buzz"
```

### C. Build & Tooling Config Files

1. **`next.config.ts`**: Menjalankan Next.js dengan `reactStrictMode: true`.
2. **`tsconfig.json`**: Target ES2017, modul `esnext`, module resolution `bundler`, JSX `preserve`, strict mode aktif.
3. **`postcss.config.mjs`**: Menggunakan plugin `@tailwindcss/postcss`.

---

## 5. External Integrations

| Layanan Eksternal | Protokol / Format | Endpoint Asli | Kegunaan | Caching & Rate Limit |
| :--- | :--- | :--- | :--- | :--- |
| **AniList API v2** | GraphQL (POST) | `https://graphql.anilist.co` | Metadata anime, poster resolusi tinggi, countdown episode, banner | Cache: 1h–24h. Rate limit: 650ms min interval, maks 3 concurrency |
| **Jikan API v4** | REST (GET) | `https://api.jikan.moe/v4` | Database MyAnimeList, daftar episode, voice actors, kru staff, relasi franchise, tema lagu | Cache: 5m–24h. Rate limit: 380ms min interval, maks 2 concurrency, retry backoff |
| **AniKoto API** | REST (GET) | `https://anikotoapi.site` | Pemetaan catalog series & episode embed ID | Cache: 24h. Rate limit: 800ms min interval, maks 1 concurrency |
| **MegaPlay Stream** | Iframe Embed (HTTPS) | `https://megaplay.buzz/stream/{mal\|ani\|s-2}/{id}/{ep}/{lang}` | Pemutar video HD anime multi-bahasa | Tidak di-cache (direct embed) |
| **Zoko Video Stream** | Iframe Embed (HTTPS) | `https://zokoanime.video/stream/mal/{id}/{ep}/{lang}?color=fb7185` | Pemutar video anime alternatif berkecepatan tinggi | Tidak di-cache (direct embed) |
| **VidStream Backup** | Iframe Embed (HTTPS) | `https://vidsrc.cc/v2/embed/anime/{id}/{ep}/{lang}` | Server cadangan pemutar video | Tidak di-cache (direct embed) |
| **YouTube** | HTTP Scrape + No-Cookie Embed | `https://www.youtube-nocookie.com/embed/{videoId}` | Pemutar trailer resmi & stream audio/video lagu tema OP/ED | Server cache YouTube search: 7 hari |

---

## 6. Visual Design System

Sistem desain EliasDex 2 mengusung tema **Dark Modern Anime Streaming Platform** yang memadukan palet netral achromatic **"Ink Wash"** dengan aksen *vibrant orange* dan *amber*.

### A. Color Palette

#### 0. Ink Wash — Neutral Anchor Tones
Empat titik jangkar dari palette yang diberikan, dari paling gelap ke paling terang:

| Token | Hex | Peran |
| :--- | :--- | :--- |
| `ink-950` | `#252525` | Titik ekstrem gelap — canvas di dark mode |
| `ink-700` | `#545454` | Mid-dark |
| `ink-500` | `#7D7D7D` | Mid-light |
| `ink-300` | `#CFCFCF` | Titik ekstrem terang — canvas di light mode |

Dua ekstrem tambahan (`#FFFFFF` putih & `#000000` hitam) dipakai HANYA untuk teks utama berkontras maksimum — bukan bagian dari 4 warna sumber, tapi diperlukan karena palette-nya tidak menyediakan titik putih/hitam murni.

#### 1. Dark Mode — Core Background & Surface Colors
Elevasi bergerak dari titik ekstrem (`ink-950`) MENUJU tengah skala — makin tinggi elevasinya, makin dekat ke `ink-700`/`ink-500`:
- **App Canvas Background**: `ink-950` `#252525`
- **Surface Elevation 1 (Card Base)**: `#333333` *(derived, interpolasi antara `ink-950` dan `ink-700`)*
- **Surface Elevation 2 (Card Hover / Inset)**: `ink-700` `#545454`
- **Surface Elevation 3 (Navbar / Dropdowns / Modals)**: `rgba(37, 37, 37, 0.95)` (`ink-950` nyaris solid) dengan `backdrop-blur-xl`/`backdrop-blur-2xl` — tetap HANYA di overlay fungsional (navbar sticky, dropdown, modal, floating music player), jangan diperluas ke `AnimeCard`/container statis (V2)
- **Surface Elevation 4 (Interactive Pill & Buttons)**: `ink-700` `#545454`, hover `ink-500` `#7D7D7D`

#### 1b. Light Mode — Core Background & Surface Colors *(sebaliknya dari dark mode)*
Peran dibalik memakai 4 anchor yang sama: canvas pindah ke ekstrem terang (`ink-300`), dan elevasi tetap bergerak MENUJU tengah skala — tapi dari arah terang, jadi makin gelap saat elevasinya naik (logika yang persis simetris dengan dark mode, bukan sekadar "kartu putih di atas halaman abu-abu" generik):
- **App Canvas Background**: `ink-300` `#CFCFCF`
- **Surface Elevation 1 (Card Base)**: `#BFBFBF` *(derived, interpolasi antara `ink-300` dan `ink-500`)*
- **Surface Elevation 2 (Card Hover / Inset)**: `ink-500` `#7D7D7D`
- **Surface Elevation 3 (Navbar / Dropdowns / Modals)**: `rgba(207, 207, 207, 0.95)` (`ink-300` nyaris solid) dengan `backdrop-blur-xl`/`backdrop-blur-2xl`, aturan pemakaian sama seperti dark mode
- **Surface Elevation 4 (Interactive Pill & Buttons)**: `ink-500` `#7D7D7D`, hover `ink-700` `#545454`

#### 2. Primary Accent & Brand Colors
Aksen brand TIDAK berubah antara dark/light mode — orange/amber sudah cukup kontras di kedua ekstrem `ink-950` maupun `ink-300`:
- **Brand Primary (Orange)**: `#ea580c` (`orange-600`)
- **Brand Primary Hover**: `#f97316` (`orange-500`)
- **Brand Primary Light / Text Accent**: `#fb923c` (`orange-400`), `#fdba74` (`orange-300`)
- **Brand Primary Glow / Tint**: `rgba(234, 88, 12, 0.15)` – `rgba(234, 88, 12, 0.30)` (`bg-orange-600/20`, `border-orange-500/30`)
- **Text Selection**: `selection:bg-orange-600 selection:text-white`

#### 3. Secondary & Semantic Accents
- **Star Rating & Highlights (Amber)**: `#fbbf24` (`amber-400`), `#f59e0b` (`amber-500`)
  - Tint: `bg-amber-500/20 text-amber-300 border-amber-500/30`
- **Currently Airing / Success (Emerald)**: `#10b981` (`emerald-500`), `#34d399` (`emerald-400`), `#6ee7b7` (`emerald-300`)
  - Tint: `bg-emerald-500/20 text-emerald-300 border-emerald-500/30`
- **DUB / Warning Badge**: `bg-amber-500/20 text-amber-300 border-amber-500/30`
- **SUB Badge**: `bg-orange-500/20 text-orange-300 border-orange-500/30`
- **Danger / Remove Action (Rose)**: `#e11d48` (`rose-600`), `#f43f5e` (`rose-500`), `#fda4af` (`rose-300`)
  - Tint: `bg-rose-600/20 text-rose-300 border-rose-500/30`
- **AniList Badge (Cyan)**: `#22d3ee` (`cyan-400`), `#06b6d4` (`cyan-500`)
  - Tint: `bg-cyan-500/10 border-cyan-500/20 text-cyan-300`
- **MyAnimeList Badge (Blue)**: `#60a5fa` (`blue-400`), `#3b82f6` (`blue-500`)
  - Tint: `bg-blue-500/10 border-blue-500/20 text-blue-300`
- **Manga / Source Material Badge (Purple)**: `#c084fc` (`purple-400`), `#a855f7` (`purple-500`)
  - Tint: `bg-purple-500/10 border-purple-500/20 text-purple-300`
- **YouTube / Trailer (Red)**: `#dc2626` (`red-600`), `#ef4444` (`red-500`)
- ⚠️ **Needs rendered verification**: tint semantic di atas (`/10`–`/30` opacity) dibuat untuk berbaur dengan canvas gelap `#252525`. Di light mode canvas jadi `#CFCFCF` yang jauh lebih terang, jadi opacity-nya kemungkinan perlu dinaikkan (mis. `/20` → `/30`+) supaya badge tetap terbaca — cek langsung saat di-render, jangan asumsi angka yang sama otomatis kontras di kedua mode.

#### 4. Typography & Border Neutral Colors — Dark Mode
- **Heading & Primary Text**: `#ffffff` *(ekstrem putih, di luar 4 anchor — kontras 15.3:1 di atas `#252525`)*
- **Secondary Body Text**: `ink-300` `#CFCFCF` *(kontras 9.85:1 di atas canvas — aman)*
- **Muted & Metadata Text**: `ink-500` `#7D7D7D` *(kontras 3.73:1 — cukup untuk teks besar/ikon, TIDAK untuk teks kecil/body; lihat catatan di bawah)*
- **Subtle / Placeholder Text**: `ink-700` `#545454` *(kontras ~2:1 — dekoratif/disabled saja, jangan dipakai untuk placeholder yang perlu terbaca)*
- **Default Borders**: `rgba(84, 84, 84, 0.6)` (`ink-700` tint), hover `rgba(125, 125, 125, 0.7)` (`ink-500` tint)

#### 4b. Typography & Border Neutral Colors — Light Mode
- **Heading & Primary Text**: `#000000` *(ekstrem hitam, di luar 4 anchor — kontras 13.5:1 di atas `#CFCFCF`)*
- **Secondary Body Text**: `ink-950` `#252525` *(kontras 9.85:1 — simetris dengan dark mode)*
- **Muted & Metadata Text**: `ink-700` `#545454` *(kontras 4.87:1 di atas canvas terang — lolos AA teks normal)*
- **Subtle / Placeholder Text**: `ink-500` `#7D7D7D` *(kontras ~2.6:1 — dekoratif/disabled saja)*
- **Default Borders**: `rgba(125, 125, 125, 0.6)` (`ink-500` tint), hover `rgba(84, 84, 84, 0.7)` (`ink-700` tint)
- ⚠️ **Needs rendered verification**: tombol `Surface Elevation 4` (`ink-500` `#7D7D7D`) dengan teks putih di atasnya berada di ~4.1:1 — pas-pasan untuk teks kecil. Kalau label tombol di bawah 14px/bold, ganti base ke `ink-700` `#545454` (7.6:1) supaya aman.

#### 5. Zinc → Ink Wash Migration Map
Class Tailwind `zinc-*` masih dipakai apa adanya di tabel Component Style Specifications (§D) di bawah — ini peta 1:1 supaya bisa di-replace mekanis (find & replace) tanpa baca ulang tiap baris:

| Class lama (`zinc-*`) | Ganti dengan |
| :--- | :--- |
| `bg-zinc-950`, `bg-zinc-950/95` | `bg-surface-canvas`, `bg-surface-canvas/95` |
| `bg-zinc-900/40`, `bg-zinc-900/60`, `bg-zinc-900/90` | `bg-surface-canvas` + opacity yang sama (`ink-950` di dark, `ink-300` di light) |
| `bg-zinc-850` | `bg-surface-raised` |
| `bg-zinc-800`, `border-zinc-800`, `border-zinc-800/60` | `ink-700` (`#545454` dark / `#7D7D7D` light) |
| `bg-zinc-700`, `border-zinc-700/80`, `border-zinc-700/50` | `ink-500` (`#7D7D7D` dark / `#545454` light) |
| `border-zinc-750` | `border-border-subtle` |
| `text-zinc-100` | Primary text (`#FFFFFF` dark / `#000000` light) |
| `text-zinc-200`, `text-zinc-300` | `ink-300` dark / `ink-950` light |
| `text-zinc-400` | `ink-500` dark / `ink-700` light |
| `text-zinc-500` | `ink-700` dark / `ink-500` light |

Terapkan lewat CSS variable + `[data-theme="light"]` override (lihat §8.5), bukan class Tailwind `dark:`/`light:` terpisah — biar satu sumber kebenaran token, bukan dua set utility yang bisa divergen.

---

### B. Typography

Dua font family Google diintegrasikan melalui `next/font/google` di `layout.tsx` dan `globals.css`:

```css
:root {
  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-heading: 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif;
}
```

#### 1. Font Specifications
- **Body / Interface Font**: `Plus Jakarta Sans` (Weights: `300`, `400`, `500`, `600`, `700`, `800`)
- **Headings Font (`h1`–`h6`, Brand Logo, Section Titles)**: `Outfit` (Weights: `500`, `600`, `700`, `800`)
- **Numbers, Codes, & Timestamps**: System `font-mono`
- **Perf note (lightweight)**: skala tipografi di bawah ini sebenarnya hanya memakai `400/500/600/700/800` dari Plus Jakarta Sans (`300` tidak dipakai di manapun pada tabel hierarki) dan `600/700/800` dari Outfit (`500` tidak dipakai). Drop weight yang tidak terpakai dari `next/font/google` subset agar payload font awal lebih kecil — tiap weight statis yang di-load adalah file terpisah.

#### 2. Typographic Scale Hierarchy
- **Hero Title (`h1`)**: `text-2xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight leading-tight`
- **Page Title (`h1` on Subpages)**: `text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight`
- **Section Heading (`h2`)**: `text-lg sm:text-xl font-bold font-heading text-white tracking-tight`
- **Sub-Section / Modal Heading (`h3`)**: `text-sm sm:text-base font-bold font-heading text-white`
- **Card Title (`h3` / `h4`)**: `text-[13px] sm:text-sm font-semibold text-zinc-100 hover:text-orange-400 line-clamp-2` (dinaikkan dari `text-xs`/12px — ini link yang bisa diklik di ratusan poster grid, bukan label statis, jadi perlu di atas ambang keterbacaan 12px)
- **Body Regular**: `text-xs sm:text-sm text-zinc-300 leading-relaxed`
- **Metadata / Chips / Badges**: `text-[10px]` khusus untuk badge/counter satu-dua karakter (mis. jumlah episode, rank number); frasa metadata yang lebih panjang (studio, tanggal, durasi) tetap minimal `text-xs`

---

### C. Spacing, Layout & Responsive Grid

- **Max Container Width**: `max-w-7xl` (`1280px`), dipusatkan dengan `mx-auto px-4 sm:px-6 lg:px-8`.
- **Responsive Breakpoints**:
  - `xs`: `< 480px`
  - `sm`: `640px`
  - `md`: `768px`
  - `lg`: `1024px`
  - `xl`: `1280px`
- **Anime Poster Grids**:
  - Mobile: `grid-cols-2` (gap: `3.5` / `14px`)
  - Tablet Portrait: `sm:grid-cols-3` (gap: `4` / `16px`)
  - Tablet Landscape: `md:grid-cols-4`
  - Desktop: `lg:grid-cols-5` (gap: `5` / `20px`)
  - Large Desktop: `xl:grid-cols-6`
- **Detail & Watch Page Split**:
  - Main Column: `lg:col-span-8` (70% viewport)
  - Sidebar Column: `lg:col-span-4` (30% viewport)

---

### D. Component Style Specifications

| Komponen | Varian | Gaya Visual & Class List Kunci |
| :--- | :--- | :--- |
| **Button** | `primary` | `bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/25 active:scale-[0.98]` |
| | `secondary` | `bg-zinc-800 hover:bg-zinc-700 text-zinc-100 active:scale-[0.98]` |
| | `outline` | `border border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/40 text-zinc-200 hover:bg-zinc-800/60 active:scale-[0.98]` |
| | `ghost` | `text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50` |
| | `danger` | `bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30` |
| **Badge** | `primary` | `bg-orange-600/90 text-white font-medium` |
| | `secondary` | `bg-zinc-800 text-zinc-300 border border-zinc-700/50` |
| | `success` | `bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium` |
| | `warning` | `bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium` |
| | `info` | `bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium` |
| | `outline` | `border border-zinc-700/80 text-zinc-300 bg-zinc-900/60 backdrop-blur-sm` |
| | `sub` | `bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold uppercase tracking-wider` |
| | `dub` | `bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold uppercase tracking-wider` |
| **AnimeCard** | Standard | Poster aspect `3/4`, border `border-zinc-800/60`, hover `border-zinc-700/80 hover:shadow-xl hover:shadow-black/40` (neutral elevation — no colored glow; every card in a grid would otherwise repeat the same tinted shadow with no state meaning) |
| **Episode Button** | Active | `bg-orange-600 text-white border-orange-400 shadow-md shadow-orange-600/40 ring-2 ring-orange-400/50` — reserved for the single "currently selected episode" state; do not reuse this glow on hover or default states |
| | Watched | `bg-zinc-800/90 text-zinc-300 border-zinc-700/80 hover:bg-zinc-700 hover:border-orange-500/50` |
| | Unwatched | `bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white` |
| **Global Music Player** | Floating Bar | `bg-zinc-950/95 backdrop-blur-xl border border-zinc-750 shadow-2xl rounded-2xl ring-1 ring-white/10` |

---

### E. Visual Effects & Motion

- **Smooth Scrolling Engine (`lenis` & `SmoothScrollProvider`)**:
  - Global Inertial Smooth Scroll: Terintegrasi di level root App Router menggunakan `ReactLenis`
  - Konfigurasi Engine: `lerp: 0.1` (physics exponential damping bebas latensi), `smoothWheel: true`, `wheelMultiplier: 1`, `touchMultiplier: 1`, `syncTouch: false` (native touch behavior)
  - CSS Integration: `@import "lenis/dist/lenis.css";` dan `html { scroll-behavior: auto !important; }` di `globals.css`
  - Isolasi Nested Scroll: Menggunakan atribut `data-lenis-prevent` pada container dengan scrolling terisolasi (`GlobalMusicPlayer` queue drawer, `SearchBar` live dropdown, `EpisodeList` grid/list) agar scroll roda mouse/touch tetap responsif tanpa mengganggu scroll posisi body utama
  - Automatic Route Scroll Restoration: Reset posisi scroll ke atas secara instan saat navigasi antar-halaman via `usePathname()` listener
- **Border Radius**:
  - `rounded-lg` (`8px`) — Badge kecil, item navigasi dalam
  - `rounded-xl` (`12px`) — Tombol ukuran sedang, thumbnail kartu, input search
  - `rounded-2xl` (`16px`) — Kartu anime, container section, popover drawer, player frame
  - `rounded-3xl` (`24px`) — Hero showcase banner, modal video layar penuh
  - `rounded-full` (`9999px`) — Tombol play, scrollbar thumb, pills indikator
- **Custom Scrollbars (`globals.css`)**:
  - Lebar/Tinggi: `7px`
  - Track: `rgba(9, 9, 11, 0.6)`
  - Thumb: `rgba(82, 82, 91, 0.45)`, Hover: `rgba(113, 113, 122, 0.7)` dengan radius `9999px`
  - Utility `.no-scrollbar` untuk horizontal carousel
- **Transitions & Micro-Animations**:
  - Hover zoom gambar: `transition-transform duration-500 group-hover:scale-105`
  - Transisi tombol: `transition-all active:scale-[0.98]`
  - Equalizer bar animation: Keyframe bouncing vertical bars (`animate-[bounce_0.8s_ease-in-out_infinite]`)
  - Spinning Vinyl: `animate-spin` dengan durasi 4–6 detik
- **Reduced Motion**:
  - Semua animasi dekoratif/berkelanjutan (Lenis smooth scroll, vinyl spin, equalizer bounce, hover zoom `scale-105`, `active:scale-[0.98]`) wajib tunduk pada media query `prefers-reduced-motion: reduce` — matikan `smoothWheel`/`syncTouch` di `SmoothScrollProvider`, hentikan `animate-spin`/`animate-bounce`, dan ganti transform-based hover dengan perubahan warna/border saja
  - Equalizer bounce dan vinyl spin dikecualikan dari kategori "motion dekoratif generik" karena keduanya merepresentasikan status audio real-time (playing/paused) — bukan hiasan tanpa arti, jadi boleh tetap ada saat `prefers-reduced-motion` off

---

## 7. Page / Screen Breakdown

### 1. Home Page (`/`)
- **Tujuan**: Halaman beranda utama untuk discovery, trending hero banner, jadwal siaran hari ini, serta riwayat tontonan cepat.
- **Urutan Section (Atas ke Bawah)**:
  1. **Hero Carousel Section**: Merender `HeroCarousel` (anime seasonal teratas, latar wallpaper cinematic, tombol Watch Ep 1, Details, Bookmark, dan navigasi arrow/dots).
  2. **Continue Watching Strip**: Merender baris horizontal riwayat tontonan dari `WatchContext` (jika user sudah pernah menonton episode).
  3. **Airing Schedule Row**: Merender `ScheduleRow` (pilihan hari Senin–Minggu, kartu jadwal siaran JST, tombol watch cepat).
  4. **Most Popular Anime Section**: Header icon `Flame`, tombol link `Explore All`, dan `AnimeGrid` (12 anime terpopuler).
  5. **Top Airing This Season Section**: Header icon `Tv`, tombol link `Explore Airing`, dan `AnimeGrid` (12 anime yang sedang tayang).
  6. **Upcoming & Anticipated Section**: Header icon `Sparkles`, tombol link `View Upcoming`, dan `AnimeGrid` (12 anime musim mendatang).

---

### 2. Anime Detail Page (`/anime/[malId]`)
- **Tujuan**: Menampilkan seluruh data komprehensif suatu anime (sinopsis, spesifikasi, episode, cast, kru, trailer, lagu tema, relasi, dan rekomendasi).
- **Urutan Section (Atas ke Bawah)**:
  1. **Breadcrumb Navigation**: Home > Anime > Judul Anime.
  2. **Top Anime Showcase Banner**:
     - Kolom Kiri: Poster cover 3:4, tombol "Watch Now / Resume", watchlist status selector dropdown.
     - Kolom Kanan: Judul utama + `TitleLanguageToggle`, rating & format badges (SUB, DUB, HD, PG-13, Score), sinopsis yang bisa di-expand (+ More / - Less), tabel spesifikasi (Studios, Aired, Status, Duration, Premiered), chips tag genre.
  3. **Main Content & Sidebar Split (`grid-cols-1 lg:grid-cols-12`)**:
     - **Left Column (`col-span-8`)**:
       - Navigation Tabs: `Episodes`, `Related Anime`, `Characters & Voice Actors`, `Theme Songs`.
       - Active Tab View (`EpisodeList`, `AnimeRelationsList`, `CharacterList`, atau `ThemeSongsList`).
       - Recommended Anime Section (`AnimeGrid` "You May Also Like").
     - **Right Sidebar (`col-span-4`)**:
       - Official Trailer Box (`TrailerSection` dengan player embed HD YouTube).
       - Anime Information Box (Judul Jepang Kanji, format, jumlah episode, score, rank, produser, dan link resmi).
       - Top Airing Anime Widget (Daftar rank 1-5 anime sedang tayang).

---

### 3. Watch Page (`/watch/[malId]/[ep]`)
- **Tujuan**: Pemutar streaming episode video anime responsif dengan opsi server dan navigasi episode.
- **Urutan Section (Atas ke Bawah)**:
  1. **Top Breadcrumb & Controls Bar**: Tombol "Anime Details" (kembali ke detail), judul anime, `TitleLanguageToggle`, dan `LanguageToggle` (SUB/DUB).
  2. **Main Streaming Layout (`grid-cols-1 lg:grid-cols-3`)**:
     - **Left Column (`col-span-2`)**:
       - Video Player (`PlayerFrame` dengan embed stream MegaPlay / Zoko Video, tombol reload, dan tombol fullscreen).
       - Player Controls Bar: Indikator nomor episode, judul episode, tombol Previous Episode, Next Episode, dan toggle Auto-Next.
       - Server Switcher: `ServerSelector` (`Zoko`, `MegaPlay MAL`, `MegaPlay AniList`, `MegaPlay Catalog`, `VidStream Backup`) & `ServerNotice`.
       - Collapsible Anime Info Accordion (Sinopsis singkat & meta info).
     - **Right Sidebar (`col-span-1`)**:
       - Interactive Episode List (`EpisodeList` dengan filter pencarian episode, range selector, dan list/grid mode).

---

### 4. Browse Page (`/browse`)
- **Tujuan**: Eksplorasi katalog anime dengan filter multi-parameter dan opsi tampilan grid/list.
- **Urutan Section (Atas ke Bawah)**:
  1. **Header Row**: Icon `Compass`, judul "Browse Catalog", total hitungan anime, dan switcher Grid/List view mode.
  2. **Action Toolbar**: Input pencarian live dengan debounce, dropdown sorting (`Most Popular`, `Highest Rated`, `Most Favorited`, `Title A-Z`, `Newest First`), tombol toggle Drawer Filter, dan tombol reset filter.
  3. **Filter Drawer (Collapsible)**: Pilihan format (`TV`, `Movie`, `OVA`, `ONA`, `Special`), status tayang (`Airing`, `Complete`, `Upcoming`), dan rating skor minimum (`8.0+`, `7.0+`, `6.0+`).
  4. **Genre Selector Bar**: Pill genre horizontal (`GenreSelector`).
  5. **Results Section**: Merender `AnimeGrid` (mode grid) atau `AnimeListRow` (mode list), diikuti kontrol paginasi `Previous` / `Next`.

---

### 5. Search Page (`/search`)
- **Tujuan**: Halaman pencarian dedikasi dengan keyword typing cepat, saran pencarian populer, dan filter metadata.
- **Urutan Section (Atas ke Bawah)**:
  1. **Header & Main Search Input**: Input box besar dengan icon search, tombol clear `X`, tombol submit "Search", dan tombol toggle "Filters".
  2. **Popular Quick Suggestions**: Deretan pill kata kunci populer (`Jujutsu Kaisen`, `Attack on Titan`, `Demon Slayer`, `Frieren`, `One Piece`, dll).
  3. **Filter Panel (Collapsible)**: Dropdown Genre, Format, Status tayang, dan Sorting order.
  4. **Results Section**: Status hasil query, `AnimeGrid`, dan tombol paginasi halaman.

---

### 6. Top Anime Page (`/top`)
- **Tujuan**: Menampilkan chart anime terbaik berdasarkan berbagai kategori penilaian.
- **Urutan Section (Atas ke Bawah)**:
  1. **Header**: Icon `Trophy` dan judul "Top Anime Charts".
  2. **Filter Tabs**: Tab selector `Most Popular` (Flame), `Top Airing` (Trophy), `Top Upcoming` (Sparkles), dan `Most Favorited` (Heart).
  3. **Results Section**: Label halaman aktif, `AnimeGrid`, dan tombol paginasi halaman.

---

### 7. Schedule Page (`/schedule`)
- **Tujuan**: Menampilkan jadwal rilis mingguan anime per hari penayangan.
- **Urutan Section (Atas ke Bawah)**:
  1. **Header**: Icon `Calendar` dan judul "Weekly Airing Schedule".
  2. **Weekday Tabs**: Tab hari Senin hingga Minggu dengan indikator `(Today)` pada hari yang sedang aktif.
  3. **Results Section**: Label hari penayangan dan `AnimeGrid` anime yang tayang pada hari tersebut.

---

### 8. Watchlist Page (`/watchlist`)
- **Tujuan**: Mengelola anime yang disimpan oleh pengguna ke dalam berbagai kategori status.
- **Urutan Section (Atas ke Bawah)**:
  1. **Header**: Icon `Bookmark` dan judul "My Watchlist".
  2. **Status Filter Tabs**: Tab filter status dengan counter badge (`All`, `Watching`, `Plan to Watch`, `Completed`, `Dropped`).
  3. **Items Grid**: Grid poster anime tersimpan, dilengkapi badge status, rating, indikator episode terakhir yang ditonton, tombol play cepat, dan tombol hapus.

---

### 9. History Page (`/history`)
- **Tujuan**: Melihat dan melanjutkan riwayat tontonan episode anime sebelumnya.
- **Urutan Section (Atas ke Bawah)**:
  1. **Header**: Icon `History`, judul "Watch History", dan tombol "Clear History".
  2. **History Cards Grid**: Kartu horizontal dengan poster, judul, nomor episode yang ditonton, bahasa SUB/DUB, waktu tontonan (`Just now`, `5m ago`, dll), tombol "Resume", dan tombol hapus entri.

---

## 8. Known Constraints & Technical Debt

1. **Aturan Query Minimum Jikan (3 Karakter)**:
   - *Kondisi*: Jikan REST API v4 melempar HTTP 400 `ValidationException` jika query pencarian kurang dari 3 karakter.
   - *Solusi di Kode*: `searchAnime()` di `src/lib/jikan.ts` secara cerdas mengalihkan query 1-2 karakter langsung ke fungsi `searchFallbackAnime()` atau AniList GraphQL untuk memberikan hasil instan tanpa error.
2. **Pemetaan ID Antara MyAnimeList (`idMal`) dan AniList (`id`)**:
   - *Kondisi*: AniList menggunakan ID internal yang berbeda dari ID MyAnimeList.
   - *Solusi di Kode*: Fungsi `normalizeAniListMedia()` di `src/lib/anilist.ts` selalu memetakan `media.idMal || media.id` ke `mal_id` agar konsisten dengan seluruh sistem routing player dan watch progress aplikasi.
3. **Ketergantungan Iframe Pemutar Video Eksternal**:
   - *Kondisi*: Pemutar video disediakan oleh layanan pihak ketiga (`zokoanime.video`, `megaplay.buzz`, `vidsrc.cc`).
   - *Solusi di Kode*: Atribut `sandbox` pada iframe dihapus di `PlayerFrame.tsx` agar video player dapat memuat script pemutar secara mulus, serta disediakan tombol reload dan fallback URL langsung.
4. **Persistent Playback Pemutar Musik**:
   - *Kondisi*: Lagu tema OP/ED diputar secara background saat navigasi antar halaman berlangsung.
   - *Solusi di Kode*: `GlobalMusicPlayer.tsx` me-mount iframe YouTube no-cookie tersembunyi secara permanen di tingkat root `AppShell`, sehingga audio tetap berlanjut tanpa terhenti ketika pengguna berpindah rute halaman.
5. **Inkonsistensi Nilai Warna & Class Tailwind** *(fix disarankan)*:
   - *Kondisi*: Hex hardcoded `#09090b` (duplikat dari `bg-zinc-950`) di `layout.tsx`/`AppShell.tsx`, plus arbitrary utility ad hoc (`bg-zinc-850`, `border-zinc-750`, `blur-xs`) yang tidak terdaftar di skala Tailwind resmi — tiap pemakaian baru berisiko generate class arbitrary baru yang sedikit beda (`bg-[#1f1f22]` vs `bg-zinc-850`), membengkakkan CSS terkompilasi dan bikin surface elevation tidak konsisten.
   - *Solusi*: Daftarkan sekali sebagai custom token di `tailwind.config`/`@theme` (Tailwind v4), lalu pakai nama semantik di seluruh komponen — bukan hex/arbitrary berulang:
     ```css
     @theme {
       --color-surface-canvas: #252525;      /* ink-950 — canvas dark mode, pengganti hardcoded #09090b lama */
       --color-surface-raised: #333333;      /* derived — pengganti bg-zinc-850 ad hoc */
       --color-border-subtle: #545454;       /* ink-700 — pengganti border-zinc-750 ad hoc */
     }

     [data-theme="light"] {
       --color-surface-canvas: #CFCFCF;      /* ink-300 — canvas light mode */
       --color-surface-raised: #BFBFBF;      /* derived */
       --color-border-subtle: #7D7D7D;       /* ink-500 */
     }
     ```
     Referensikan sebagai `bg-surface-canvas`, `bg-surface-raised`, `border-border-subtle`. Ini juga yang mendukung tujuan *lightweight*: satu token dipakai berulang kali menghasilkan lebih sedikit unique class di output CSS dibanding banyak varian arbitrary yang mirip-mirip.
6. **In-Memory Server Cache Scope**:
   - Cache memory di `src/lib/cache.ts` menggunakan runtime `Map<string, CacheEntry>`. Pada deployment serverless multi-instance (seperti Vercel), cache instance berlaku per-lambda container, sedangkan di browser didukung oleh client-side caching.