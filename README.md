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

```text
                         ┌──────────────────┐
                         │      EliasDex 2      │
                         │   Next.js App    │
                         └────────┬─────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
       ┌───────────┐        ┌───────────┐        ┌───────────┐
       │  AniList  │        │   Jikan   │        │  AniKoto   │
       │   GraphQL │        │    MAL    │        │ Streaming  │
       └───────────┘        └───────────┘        └───────────┘
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  ▼
                         ┌─────────────────┐
                         │  API / Fallback │
                         │     Layer       │
                         └────────┬────────┘
                                  ▼
                         ┌─────────────────┐
                         │ React Components│
                         │     + Context   │
                         └────────┬────────┘
                                  ▼
                         ┌─────────────────┐
                         │ Anime Discovery │
                         │ & Watch UI      │
                         └─────────────────┘
```

## 📁 Project Structure

```text
EliasDex 2/
├── assets/
│
├── src/
│   ├── app/
│   │   ├── anime/
│   │   │   └── [malId]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── anikoto/
│   │   │   │   └── [...path]/
│   │   │   │       └── route.ts
│   │   │   ├── anilist/
│   │   │   │   └── route.ts
│   │   │   ├── health/
│   │   │   │   └── route.ts
│   │   │   ├── jikan/
│   │   │   │   └── [...path]/
│   │   │   │       └── route.ts
│   │   │   ├── music/
│   │   │   │   └── search/
│   │   │   │       └── route.ts
│   │   │   └── stream/
│   │   │       └── route.ts
│   │   │
│   │   ├── browse/
│   │   ├── history/
│   │   ├── schedule/
│   │   ├── search/
│   │   ├── top/
│   │   ├── watch/
│   │   └── watchlist/
│   │
│   ├── components/
│   │   ├── anime/
│   │   ├── layout/
│   │   ├── music/
│   │   ├── player/
│   │   ├── providers/
│   │   └── ui/
│   │
│   ├── context/
│   ├── lib/
│   │   ├── server/
│   │   ├── anikoto.ts
│   │   ├── anilist.ts
│   │   ├── animeApi.ts
│   │   ├── cache.ts
│   │   ├── fallbackData.ts
│   │   ├── jikan.ts
│   │   ├── music.ts
│   │   ├── rateLimiter.ts
│   │   └── stream.ts
│   │
│   ├── views/
│   └── types.ts
│
├── assets/
├── metadata.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

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

Create a `.env.local` file if your deployment requires environment-specific configuration.

Example:

```env
ANILIST_API_URL=https://graphql.anilist.co
JIKAN_API_URL=https://api.jikan.moe/v4
ANIKOTO_API_URL=https://anikoto.deno.dev
```

Use the actual endpoints supported by your deployment configuration.

Do not commit secrets or private API credentials.

## 🧪 Health Check

The application includes a health endpoint:

```text
GET /api/health
```

This can be used by deployment platforms, monitoring services, or uptime checks.

## 🔄 Data Source Strategy

EliasDex 2 is designed around multiple providers instead of treating one API as the entire universe.

```text
Request
   │
   ▼
Anime API Layer
   │
   ├── AniList
   │
   ├── Jikan
   │
   └── AniKoto
   │
   ▼
Normalization
   │
   ▼
Cache
   │
   ▼
Fallback
   │
   ▼
UI
```

This approach helps reduce the impact of:

- API downtime
- Rate limits
- Missing metadata
- Provider-specific response formats
- Temporary network failures

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

## 🚀 Production Build

Build the application:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

For Bun:

```bash
bun run build
bun run start
```

## 📈 Performance

EliasDex 2 includes several mechanisms intended to reduce unnecessary API traffic:

- API caching
- Rate limiting
- Server-side request handling
- Reusable components
- Loading skeletons
- Fallback responses
- Centralized API clients

The goal is simple: fewer requests, less waiting, fewer things catching fire.

## 🔐 Security Considerations

External API requests are routed through server-side endpoints where appropriate.

Recommended production practices:

- Keep private credentials server-side
- Validate API parameters
- Apply request rate limits
- Avoid exposing unnecessary upstream API details
- Sanitize user-controlled query parameters
- Configure appropriate CORS behavior
- Monitor upstream API failures

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

Contributions are welcome.

```bash
git checkout -b feature/your-feature
```

Make your changes, test them, then open a pull request.

Keep changes focused and avoid turning one small feature into a 47-file architectural pilgrimage.

## 🗺️ Roadmap

- [ ] Improved recommendation engine
- [ ] More streaming providers
- [ ] Better episode progress synchronization
- [ ] Advanced anime filtering
- [ ] User accounts
- [ ] Cloud watchlist synchronization
- [ ] Personalized recommendations
- [ ] Improved mobile player
- [ ] PWA improvements
- [ ] Better API failure recovery
- [ ] Automated API health monitoring

## ⭐ Project Goals

EliasDex 2 aims to provide a fast and clean anime experience with:

```text
Discover
   ↓
Search
   ↓
Explore
   ↓
Track
   ↓
Watch
   ↓
Continue
```

Built with Next.js, TypeScript, and a mildly unreasonable number of API integrations.
