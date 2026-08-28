# EliasDex 2 

> A modern anime streaming and discovery platform built with Next.js, TypeScript, and multiple anime data sources.

<div align="center">

  <!-- Views Count -->
  <img src="https://komarev.com/ghpvc/?username=Eliasdex&label=PROJECT+VIEWS&color=0e75e8&style=flat" alt="Project Views" />

  <br />

  <!-- Repo Stats -->
  <a href="https://github.com/Eliasilyz/EliasDex-2/stargazers">
    <img src="https://img.shields.io/github/stars/Eliasilyz/EliasDex-2?style=flat-square&logo=github&color=yellow" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/Eliasilyz/EliasDex-2/network/members">
    <img src="https://img.shields.io/github/forks/Eliasilyz/EliasDex-2?style=flat-square&logo=github&color=blue" alt="GitHub Forks" />
  </a>
  <a href="https://github.com/Eliasilyz/EliasDex-2/issues">
    <img src="https://img.shields.io/github/issues/Eliasilyz/EliasDex-2?style=flat-square&color=red" alt="Open Issues" />
  </a>
  <a href="https://github.com/Eliasilyz/EliasDex-2/issues?q=is%3Aissue+is%3Aclosed">
    <img src="https://img.shields.io/github/issues-closed/Eliasilyz/EliasDex-2?style=flat-square&color=green" alt="Closed Issues" />
  </a>

  <br />

  <!-- Extra Details (Lisensi, Commit Terakhir, & Repo Size) -->
  <img src="https://img.shields.io/github/last-commit/Eliasilyz/EliasDex-2?style=flat-square&color=orange" alt="Last Commit" />
  <img src="https://img.shields.io/github/repo-size/Eliasilyz/EliasDex-2?style=flat-square&color=purple" alt="Repo Size" />
  <img src="https://img.shields.io/github/license/Eliasilyz/EliasDex-2?style=flat-square&color=grey" alt="License" />

</div>

EliasDex 2 is a web-based anime platform focused on browsing, discovering, tracking, and watching anime from a clean, responsive interface.

It combines multiple APIs to provide anime metadata, schedules, episodes, characters, staff, themes, trailers, and streaming sources without relying on a single provider. Because apparently one API failing wasn't enough for humanity.

## 🖼️ Screenshots
![](https://files.catbox.moe/33m58e.png)
![](https://files.catbox.moe/xhxx06.png)

## ✨ Features

- 🎬 Anime discovery and browsing
- 🔎 Anime search
- 📺 Episode streaming
- 🌐 Multiple streaming servers
- 🇯🇵 Japanese / English title switching
- 📅 Seasonal anime schedule
- 🔥 Top anime
- 📚 Watchlist
- 🕒 Watch history
- 🎵 Global music player
- 🎶 Anime opening and ending themes
- 🎭 Character information
- 👥 Staff information
- 🔗 Anime relations
- 🎞️ Trailer support
- 🌙 Dark / light theme
- 📱 Responsive mobile-first UI
- ⚡ Client-side caching and API rate limiting
- 🔄 Multiple anime data sources with fallback support
- ❤️ Local watch progress tracking

## 📊 Project Stats

| Category       | Details                    |
| -------------- | -------------------------- |
| Framework      | Next.js                    |
| Language       | TypeScript                 |
| Runtime        | Node.js / Bun              |
| Styling        | CSS                        |
| Architecture   | App Router                 |
| Data Sources   | AniList, Jikan, AniKoto    |
| Streaming      | AniKoto + stream API       |
| Music          | Anime music search API     |
| State          | React Context              |
| Caching        | Custom cache layer         |
| API Protection | Rate limiter               |
| Rendering      | Server + Client Components |
| License        | See License section        |

## 🧩 API Sources

EliasDex 2 uses several services, each with a different responsibility.

### AniList

Used primarily for rich anime metadata and structured anime information.

Typical usage:

- Anime metadata
- Titles
- Descriptions
- Genres
- Studios
- Relations
- Rankings
- Seasonal information

### Jikan

Jikan provides access to MyAnimeList data through its API.

Typical usage:

- MAL IDs
- Anime metadata
- Characters
- Staff
- Episodes
- Rankings
- Schedules
- Additional MAL information

### AniKoto

AniKoto is used primarily for streaming-related data.

Typical usage:

- Episode sources
- Streaming servers
- Episode information
- Video sources

The application routes external API requests through its own Next.js API endpoints where appropriate.

## 🏗️ Architecture

### Data Flow

```text
                     ┌──────────────────┐
                     │    EliasDex 2    │
                     │   Next.js App    │
                     └────────┬─────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
     ┌──────────┐        ┌──────────┐      ┌──────────┐
     │ AniList  │        │  Jikan   │      │ AniKoto  │
     │ GraphQL  │        │   MAL    │      │Streaming │
     └──────────┘        └──────────┘      └──────────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                              ▼
                     ┌─────────────────┐
                     │  Anime Metadata │
                     │  & Streaming    │
                     └────────┬────────┘
                              ▼
                     ┌─────────────────┐
                     │  React + Hooks  │
                     │   + Context     │
                     └────────┬────────┘
                              ▼
                     ┌─────────────────┐
                     │   UI Layer      │
                     │  (Components)   │
                     └─────────────────┘
```

### User Data Layer (Optional)

When `MONGODB_URI` is configured:

```text
┌─────────────────────────────────────────┐
│          EliasDex 2 (Next.js)           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  API Routes & Server Actions    │   │
│  │  (/api/*, server functions)     │   │
│  └────────────┬────────────────────┘   │
│               │                        │
│  ┌────────────▼────────────────────┐   │
│  │  Repository Layer               │   │
│  │  (src/models/*.ts)              │   │
│  │  - user.ts                      │   │
│  │  - watchHistory.ts              │   │
│  │  - favorites.ts                 │   │
│  │  - chatMessages.ts              │   │
│  │  - comments.ts                  │   │
│  └────────────┬────────────────────┘   │
│               │                        │
│  ┌────────────▼────────────────────┐   │
│  │  Database Client Singleton      │   │
│  │  (src/lib/db.ts)                │   │
│  │  - Connection pooling           │   │
│  │  - Fallback on DB_ENABLED=false │   │
│  └────────────┬────────────────────┘   │
│               │                        │
└───────────────┼────────────────────────┘
                │
                ▼
          ┌──────────────┐
          │   MongoDB    │
          │   Database   │
          └──────────────┘
```

**Collections:**
- `users` — account credentials & profile
- `watch_history` — episode progress per user
- `favorites` — user's favorite anime
- `chat_messages` — global chat messages
- `comments` — anime comments per episode

All queries include DB availability checks; operations gracefully return empty results when database is unavailable.

## 📁 Project Structure

```text
EliasDex 2/
├── src/
│   ├── app/                          # Next.js App Router pages & API
│   │   ├── api/
│   │   │   ├── anikoto/[...path]    # Anime stream sources proxy
│   │   │   ├── anilist/             # AniList GraphQL proxy
│   │   │   ├── jikan/[...path]      # Jikan/MAL API proxy
│   │   │   ├── music/search         # Music search endpoint
│   │   │   ├── stream/              # Stream resolution endpoint
│   │   │   └── health/              # Health check endpoint
│   │   │
│   │   ├── anime/[malId]/           # Anime detail page
│   │   ├── browse/                  # Browse all anime
│   │   ├── search/                  # Search page
│   │   ├── schedule/                # Airing schedule
│   │   ├── top/                     # Top anime rankings
│   │   ├── watch/[malId]/[ep]       # Episode player
│   │   ├── watchlist/               # User watchlist (DB-optional)
│   │   ├── history/                 # Watch history (DB-optional)
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Homepage
│   │   └── globals.css              # Global styles
│   │
│   ├── components/                  # Reusable React components
│   │   ├── anime/                   # Anime-specific components
│   │   ├── layout/                  # Layout wrappers (Navbar, Footer)
│   │   ├── music/                   # Music player
│   │   ├── player/                  # Video player
│   │   ├── providers/               # Context providers
│   │   ├── ui/                      # Shadcn/UI & custom UI
│   │   └── DbStatusBanner.tsx       # Dev-only DB status banner
│   │
│   ├── context/                     # React Context definitions
│   │   ├── DataSourceContext        # API source selection
│   │   ├── MusicPlayerContext       # Global music state
│   │   ├── ThemeContext             # Dark/light theme
│   │   ├── TitleLanguageContext     # Japanese/English titles
│   │   └── WatchContext             # Watch progress
│   │
│   ├── lib/                         # Utilities & helpers
│   │   ├── env.ts                   # Environment config (DB_ENABLED)
│   │   ├── db.ts                    # MongoDB client singleton
│   │   ├── server/
│   │   │   ├── apiHandlers.ts       # Common API route logic
│   │   │   └── response.ts          # Standardized responses
│   │   ├── anikoto.ts               # AniKoto API wrapper
│   │   ├── anilist.ts               # AniList GraphQL wrapper
│   │   ├── jikan.ts                 # Jikan API wrapper
│   │   ├── animeApi.ts              # Unified anime API layer
│   │   ├── cache.ts                 # Custom caching logic
│   │   ├── rateLimiter.ts           # API rate limiting
│   │   ├── stream.ts                # Stream resolution
│   │   ├── music.ts                 # Music search
│   │   ├── metadata.ts              # Metadata construction
│   │   ├── fallbackData.ts          # Fallback seed data
│   │   └── utils.ts                 # General utilities
│   │
│   ├── models/                      # Database repositories (DB-optional)
│   │   ├── user.ts                  # User CRUD operations
│   │   ├── watchHistory.ts          # Watch history queries
│   │   ├── favorites.ts             # Favorites queries
│   │   ├── chatMessages.ts          # Chat message queries
│   │   └── comments.ts              # Comment queries
│   │
│   ├── views/                       # Complex view components
│   ├── types.ts                     # Global TypeScript types
│   └── phantom-ui.d.ts              # Phantom UI type definitions
│
├── scripts/
│   └── create-indexes.ts            # MongoDB index creation
│
├── public/                          # Static assets
├── .github/                         # GitHub config
├── metadata.json                    # Anime metadata cache
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies
├── postcss.config.mjs               # PostCSS/Tailwind config
├── .env.example                     # Environment template
├── README.md                        # This file
└── LICENSE                          # Project license
```

**Key conventions:**
- `src/app` — Next.js routes (server components by default)
- `src/lib` — Shared utilities & external integrations
- `src/models` — Database access layer (gracefully handles missing DB)
- `src/components` — Reusable UI components (client components as needed)

## 🛠️ Tech Stack

### Core

- Next.js
- React
- TypeScript
- CSS
- Next.js App Router

### Data

- AniList API
- Jikan API
- AniKoto API

### Application Architecture

- React Context API
- Custom API abstraction
- Server-side API routes
- Client-side state management
- Custom caching
- API rate limiting
- Fallback data handling

## 🔌 Internal API Routes

The frontend communicates with internal API routes instead of directly coupling every component to an external service.

```text
/api/anilist
/api/jikan/*
/api/anikoto/*
/api/music/search
/api/stream
/api/health
```

This keeps API-specific logic centralized and makes it easier to replace or modify providers later.

## 🎨 UI Components

The interface is divided into reusable component groups.

### Anime

```text
AnimeCard
AnimeGrid
AnimeListRow
AnimeRelationsList
CharacterList
EpisodeList
GenreSelector
HeroCarousel
ScheduleRow
StaffList
ThemeSongsList
TrailerSection
```

### Player

```text
LanguageToggle
PlayerFrame
ServerNotice
ServerSelector
usePlayerEvents
```

### Layout

```text
AppShell
Footer
Navbar
SearchBar
```

### UI

```text
Badge
Button
DataSourceSelector
Skeleton
ThemeToggle
TitleLanguageToggle
```

## 🧠 Context System

EliasDex 2 uses React Context for application-wide state.

```text
DataSourceContext
MusicPlayerContext
ThemeContext
TitleLanguageContext
WatchContext
```

This allows features such as:

- Persistent theme preferences
- Anime data source selection
- Global music playback
- Title language switching
- Watch progress management

## ▶️ Getting Started

### Requirements

Make sure you have:

- Node.js 20+
- npm or Bun
- Git

### Clone

```bash
git clone https://github.com/your-username/EliasDex 2.git
cd EliasDex 2
```

### Install dependencies

Using npm:

```bash
npm install
```

Using Bun:

```bash
bun install
```

### Run development server

```bash
npm run dev
```

or:

```bash
bun run dev
```

Open:

```text
http://localhost:3000
```

## ⚙️ Environment Variables

EliasDex 2 supports optional database configuration. Create a `.env.local` file based on `.env.example`:

```env
# External anime data sources (required for core functionality)
JIKAN_BASE_URL="https://api.jikan.moe/v4"
ANIKOTO_BASE_URL="https://anikotoapi.site"
MEGAPLAY_BASE_URL="https://megaplay.buzz"

# MongoDB connection (optional for persistence)
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/eliasdex"
```

### Database Configuration (Optional)

**Without `MONGODB_URI` (No-DB Mode):**
- ✅ Anime browsing, search, schedules work normally
- ✅ Episode streaming available
- ✅ Guest mode (stateless JWT-only session) enabled
- ❌ Watchlist disabled
- ❌ Watch history not persisted
- ❌ User accounts & authentication disabled
- ❌ Comments & global chat disabled

**With `MONGODB_URI` (Full Persistence):**
- ✅ User authentication & accounts
- ✅ Persistent watchlist & favorites
- ✅ Watch history tracking
- ✅ User levels & XP system
- ✅ Global chat & comments
- ✅ All features enabled

This design allows local development without external DB setup, while production deployments can enable full user data persistence.

**Security:** Do not commit `.env.local` or expose `MONGODB_URI` publicly. Use environment secrets in production.

## 🗄️ Database Schema

When `MONGODB_URI` is configured, the following collections are created automatically on first use:

### `users`
```typescript
{
  _id: ObjectId,
  email: string (unique),
  passwordHash: string,
  username: string,
  createdAt: Date,
  updatedAt: Date
}
```

### `watch_history`
```typescript
{
  _id: ObjectId,
  userId: string,
  animeId: number (AniList ID),
  episodeNumber: number,
  watchedAt: Date,
  progress: number (0-100)
}
```

### `favorites`
```typescript
{
  _id: ObjectId,
  userId: string,
  animeId: number (AniList ID),
  addedAt: Date
}
```

### `chat_messages`
```typescript
{
  _id: ObjectId,
  userId: string,
  username: string,
  content: string,
  createdAt: Date
}
```

### `comments`
```typescript
{
  _id: ObjectId,
  userId: string,
  username: string,
  animeId: number (AniList ID),
  content: string,
  createdAt: Date
}
```

**Run index creation:**
```bash
npm run build && node --require ts-node/register src/scripts/create-indexes.ts
```

If `MONGODB_URI` is unset, this script exits silently without error.

## 🧪 Health Check

The application includes a health endpoint:

```text
GET /api/health
```

This can be used by deployment platforms, monitoring services, or uptime checks.

## 🔄 Data Source Strategy

EliasDex 2 is designed around multiple providers instead of treating one API as the entire universe.

```text
User Request
     │
     ▼
┌─────────────────────────────────┐
│  Unified Anime API Layer        │
│  (src/lib/animeApi.ts)          │
└──────────┬──────────────────────┘
           │
     ┌─────┴─────┬─────────┐
     ▼           ▼         ▼
  AniList     Jikan    AniKoto
  (Metadata) (Details) (Streaming)
     │           │         │
     └─────┬─────┴────┬────┘
           ▼          ▼
       ┌────────────────────┐
       │ Fallback & Cache   │
       │ (src/lib/cache.ts) │
       └────────────────────┘
           │
           ▼
       ┌────────────────────┐
       │   UI Components    │
       └────────────────────┘
```

**Benefits:**
- **Resilience** — if one API fails, others provide fallback
- **Rate limit tolerance** — distribute traffic across providers
- **Rich metadata** — combine strengths of each source
- **Flexibility** — easy to swap or add providers

**AniList ID Strategy:**
EliasDex 2 uses AniList IDs as the internal canonical identifier (`animeId`). AniList's `idMal` field reconciles with MyAnimeList IDs when needed. This ensures consistent references across:
- User watch history
- Favorites & watchlist
- Comments & chat
- Stream links

## 📺 Watch Flow

```text
Anime Detail
     │
     ▼
Episode Selection
     │
     ▼
Stream API
     │
     ▼
Server Selection
     │
     ▼
Player
     │
     ▼
Watch Progress
     │
     ▼
History
```

The player architecture supports multiple servers and language selection through dedicated components.

## 🎵 Music System

EliasDex 2 includes a global music player designed to allow music playback while navigating the application.

```text
Music Search
     │
     ▼
Music API
     │
     ▼
GlobalMusicPlayer
     │
     ▼
MusicPlayerContext
     │
     ▼
Persistent Playback
```

Anime theme songs can also be displayed directly from the anime detail page.

## 📱 Pages

| Route                 | Purpose                 |
| --------------------- | ----------------------- |
| `/`                   | Home and featured anime |
| `/anime/[malId]`      | Anime details           |
| `/browse`             | Browse anime            |
| `/search`             | Search anime            |
| `/schedule`           | Airing schedule         |
| `/top`                | Top anime               |
| `/watchlist`          | Saved anime             |
| `/history`            | Watch history           |
| `/watch/[malId]/[ep]` | Episode streaming       |

## 🚀 Deployment

### Local Development (No Database)

Perfect for quick setup without external dependencies:

```bash
git clone https://github.com/your-username/EliasDex-2.git
cd EliasDex-2
npm install
npm run dev
```

Visit `http://localhost:3000`. Browsing works fully; user persistence is disabled.

A dev-only banner appears in the bottom-left corner indicating "Database offline."

### Production (With MongoDB)

1. **Set up MongoDB:**
   ```bash
   # Atlas (recommended): create cluster at mongodb.com/cloud/atlas
   # Self-hosted: run MongoDB server locally or on VPS
   ```

2. **Configure environment:**
   ```bash
   export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/eliasdex"
   ```

3. **Build & deploy:**
   ```bash
   npm run build
   npm run start
   ```

4. **Create indexes (one-time):**
   ```bash
   npm run build
   node --require ts-node/register src/scripts/create-indexes.ts
   ```

**Hosting options:**
- **Vercel** — native Next.js support, zero-config
- **Railway, Render, Fly.io** — straightforward Node.js deployments
- **Self-hosted VPS** — full control, bring your own MongoDB

## 📈 Performance Considerations

EliasDex 2 includes several mechanisms to reduce unnecessary API traffic:

- **Client-side caching** (src/lib/cache.ts) — memoize frequent queries
- **Rate limiting** (src/lib/rateLimiter.ts) — throttle API calls per source
- **Server-side proxying** (/api/* routes) — centralize external requests
- **Reusable components** — minimize re-renders
- **Loading skeletons** — perceived performance improvement
- **Fallback responses** — graceful degradation on provider outage

The goal: fewer requests, faster loads, fewer cascading failures.

## 🔐 Security & Best Practices

### Database Security

- **Never commit `.env.local`** — use `.gitignore` to exclude it
- **Rotate credentials regularly** — especially MongoDB connection strings
- **Use IP whitelisting** — if your MongoDB provider supports it
- **Enable authentication** — require strong passwords for DB accounts
- **Validate input** — all repository functions sanitize user IDs before querying

### API Security

- All external API requests are routed through Next.js server-side routes
- API keys and credentials are stored server-side only
- User-controlled query parameters are validated before forwarding to upstream APIs
- CORS is configured to prevent unauthorized cross-origin requests

### Authentication (When Enabled)

- Passwords are hashed before storage (NextAuth.js handles this)
- Sessions use JWT tokens with no server-side session store required
- Guest mode (stateless) is available when DB is offline
- Credentials provider disabled when `DB_ENABLED = false`

### Deployment Checklist

- [ ] Set `NODE_ENV=production` in your deployment
- [ ] Configure `MONGODB_URI` with a strong, unique password
- [ ] Use HTTPS only (enforced by hosting providers)
- [ ] Enable rate limiting on API endpoints in production
- [ ] Monitor logs for suspicious activity
- [ ] Set up uptime monitoring via `/api/health`
- [ ] Review & test auth flows before launch

## ⚠️ Disclaimer

EliasDex 2 is an independent project and is not affiliated with AniList, MyAnimeList, Jikan, AniKoto, or the respective anime studios and copyright holders.

Anime metadata and streaming availability are provided by third-party services.

Users are responsible for complying with applicable laws and the terms of the services they use.

## 📜 License

Add your preferred license here.

Example:

```text
MIT License
```

If this project uses third-party assets, APIs, libraries, or media, their respective licenses and terms remain applicable.

## 🤝 Contributing

Contributions are welcome. To get started:

1. **Fork the repository** and clone your fork locally
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Make your changes** and test thoroughly
4. **Follow the project conventions:**
   - Use TypeScript strict mode
   - Follow existing code style (camelCase functions, PascalCase components)
   - Keep components focused and reusable
   - Add repository-fallback checks for any new DB operations
5. **Open a pull request** with a clear description

Keep changes focused and avoid turning one small feature into a multi-file refactor without discussion.

## 🗺️ Roadmap

**Phase 2 (Current):**
- [ ] NextAuth.js v5 integration with Credentials provider
- [ ] User accounts & authentication UI
- [ ] Persistent watchlist sync

**Phase 3:**
- [ ] User levels & XP system
- [ ] Global chat with Socket.IO
- [ ] Episode comments & reactions
- [ ] Personalized recommendations

**Phase 4:**
- [ ] Advanced anime filtering
- [ ] Better episode progress synchronization
- [ ] PWA improvements
- [ ] Automated API health monitoring

**Exploration:**
- [ ] More streaming providers
- [ ] Improved mobile player
- [ ] Social features (follows, activity feed)

## ⭐ Project Philosophy

EliasDex 2 is built around these core principles:

```text
┌─────────────────────────────────┐
│      No Single Point of Failure  │
│  (Multiple API providers, work   │
│   without DB for browsing)       │
└─────────────────────────────────┘
           ▼
┌─────────────────────────────────┐
│    Simple, Clean Architecture    │
│  (Clear separation of concerns,  │
│   repositories, no ORM overhead) │
└─────────────────────────────────┘
           ▼
┌─────────────────────────────────┐
│  Developer-Friendly Setup        │
│  (Works locally without external │
│   DB, graceful degradation)      │
└─────────────────────────────────┘
           ▼
┌─────────────────────────────────┐
│   Performance by Default         │
│  (Caching, rate limiting, CDN-   │
│   ready static generation)       │
└─────────────────────────────────┘
```

Built with Next.js 14+, TypeScript strict mode, MongoDB, and a carefully curated set of external APIs.
