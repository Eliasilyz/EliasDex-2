````md
# WeebCentral Scraper

Standalone TypeScript scraper/provider untuk mengambil data manga dari WeebCentral.

File utama:

    weebcentral.ts

Library yang dibutuhkan:

    npm install cheerio

Node.js 18+ direkomendasikan karena scraper menggunakan native `fetch()`.

---

## 1. Import

Gunakan instance yang sudah tersedia:

```ts
import weebcentral from "./weebcentral";
````

Tidak perlu membuat instance baru.

Jika ingin menggunakan class:

```ts
import { WeebCentral } from "./weebcentral";

const scraper = new WeebCentral();
```

---

# 2. API yang tersedia

Class menyediakan method:

```ts
weebcentral.search(query, page)
weebcentral.latest(page)
weebcentral.detail(url)
weebcentral.watch(chapterUrl)
weebcentral.getManga(url)
weebcentral.getPages(chapterUrl)
```

---

# 3. Search Manga

Gunakan:

```ts
const results = await weebcentral.search("One Piece");
```

Return:

```ts
[
  {
    title: "One Piece",
    url: "https://weebcentral.com/series/...",
    cover: "https://..."
  }
]
```

Type:

```ts
interface SearchResult {
  title: string;
  url: string;
  cover: string;
}
```

Contoh:

```ts
const results = await weebcentral.search("Solo Leveling");

for (const manga of results) {
  console.log(manga.title);
  console.log(manga.url);
  console.log(manga.cover);
}
```

`url` hasil search digunakan sebagai input untuk `detail()`.

---

# 4. Latest Manga

Gunakan:

```ts
const results = await weebcentral.latest(1);
```

Parameter:

```ts
latest(page: number)
```

Contoh halaman kedua:

```ts
const results = await weebcentral.latest(2);
```

Return:

```ts
[
  {
    title: "One Piece",
    url: "https://weebcentral.com/series/...",
    cover: "https://...",
    update: "Chapter 1192"
  }
]
```

Type:

```ts
interface LatestResult {
  title: string;
  url: string;
  cover: string;
  update: string;
}
```

---

# 5. Manga Detail

Gunakan URL dari hasil `search()` atau `latest()`:

```ts
const results = await weebcentral.search("One Piece");

const manga = await weebcentral.detail(results[0].url);
```

Return:

```ts
{
  title: "One Piece",
  cover: "https://...",
  desc: "...",
  episodes: [
    {
      title: "Chapters",
      urls: [
        {
          name: "Chapter 1192",
          url: "https://weebcentral.com/chapters/..."
        }
      ]
    }
  ]
}
```

Type:

```ts
interface MangaDetail {
  title: string;
  cover: string;
  desc: string;

  episodes: {
    title: string;
    urls: Chapter[];
  }[];
}

interface Chapter {
  name: string;
  url: string;
}
```

Chapter URL digunakan sebagai input untuk `watch()`.

---

# 6. Mendapatkan Chapter

Setelah mendapatkan detail:

```ts
const manga = await weebcentral.detail(seriesUrl);

const chapters = manga.episodes[0].urls;
```

Contoh:

```ts
for (const chapter of chapters) {
  console.log(chapter.name);
  console.log(chapter.url);
}
```

Hasil:

```ts
[
  {
    name: "Chapter 1192",
    url: "https://weebcentral.com/chapters/..."
  },
  {
    name: "Chapter 1191",
    url: "https://weebcentral.com/chapters/..."
  }
]
```

---

# 7. Mendapatkan Gambar Chapter

Gunakan:

```ts
const pages = await weebcentral.watch(chapterUrl);
```

Return:

```ts
{
  urls: [
    "https://...",
    "https://...",
    "https://..."
  ]
}
```

Type:

```ts
interface MangaPages {
  urls: string[];
}
```

Contoh:

```ts
const pages = await weebcentral.watch(chapter.url);

for (const image of pages.urls) {
  console.log(image);
}
```

Setiap URL di `pages.urls` adalah URL gambar halaman manga.

---

# 8. Helper getManga()

Jika hanya membutuhkan detail + chapter dalam bentuk yang lebih sederhana:

```ts
const manga = await weebcentral.getManga(seriesUrl);
```

Return:

```ts
{
  title: "...",
  cover: "...",
  desc: "...",

  episodes: [...],

  chapters: [
    {
      name: "Chapter 10",
      url: "..."
    },
    {
      name: "Chapter 9",
      url: "..."
    }
  ]
}
```

`chapters` merupakan hasil flatten dari:

```ts
episodes[].urls
```

Contoh:

```ts
const manga = await weebcentral.getManga(seriesUrl);

console.log(manga.title);

for (const chapter of manga.chapters) {
  console.log(chapter.name);
}
```

---

# 9. Helper getPages()

Jika hanya membutuhkan array URL gambar:

```ts
const pages = await weebcentral.getPages(chapterUrl);
```

Return langsung:

```ts
string[]
```

Contoh:

```ts
const pages = await weebcentral.getPages(chapterUrl);

console.log(pages);
```

Hasil:

```ts
[
  "https://image-1.jpg",
  "https://image-2.jpg",
  "https://image-3.jpg"
]
```

---

# 10. Flow Penggunaan Utama

Flow normal:

```text
Search
  ↓
Manga URL
  ↓
Detail
  ↓
Chapter URL
  ↓
Watch
  ↓
Image URLs
```

Dalam kode:

```ts
const results = await weebcentral.search("One Piece");

if (results.length === 0) {
  throw new Error("Manga not found");
}

const manga = await weebcentral.detail(results[0].url);

const chapters = manga.episodes[0].urls;

if (chapters.length === 0) {
  throw new Error("No chapters found");
}

const pages = await weebcentral.watch(chapters[0].url);

console.log({
  manga: manga.title,
  chapter: chapters[0].name,
  pages: pages.urls
});
```

---

# 11. Flow untuk API Backend

Jika digunakan di Express/Next.js:

```text
Client
  ↓
/api/manga/search?q=one+piece
  ↓
weebcentral.search()
  ↓
JSON
```

Kemudian:

```text
Client
  ↓
/api/manga/:id
  ↓
weebcentral.detail()
  ↓
JSON
```

Dan reader:

```text
Client
  ↓
/api/manga/chapter?url=...
  ↓
weebcentral.watch()
  ↓
Image URLs
```

Jangan menjalankan scraper langsung dari frontend/browser.

Gunakan backend/server.

---

# 12. Error Handling

Semua method menggunakan Promise dan bisa throw error.

Gunakan:

```ts
try {
  const results = await weebcentral.search("One Piece");

  console.log(results);
} catch (error) {
  console.error("WeebCentral error:", error);
}
```

Untuk API:

```ts
try {
  const manga = await weebcentral.detail(url);

  return manga;
} catch (error) {
  console.error(error);

  throw new Error("Failed to fetch manga");
}
```

Jangan menganggap hasil selalu tersedia.

Selalu cek:

```ts
if (!results.length) {
  // manga tidak ditemukan
}
```

dan:

```ts
if (!manga.episodes[0]?.urls.length) {
  // chapter tidak ditemukan
}
```

---

# 13. Jangan Menggunakan API Miru

File ini adalah standalone scraper.

Jangan menggunakan:

```ts
Extension
this.request()
this.querySelector()
this.querySelectorAll()
this.getAttributeText()
this.registerSetting()
this.getSetting()
```

API tersebut berasal dari runtime Miru/JiruHub dan tidak diperlukan.

Gunakan API dari class:

```ts
weebcentral.search()
weebcentral.latest()
weebcentral.detail()
weebcentral.watch()
weebcentral.getManga()
weebcentral.getPages()
```

---

# 14. Jangan Hardcode URL Chapter

Jangan membuat URL chapter sendiri.

SALAH:

```ts
const chapterUrl = "https://weebcentral.com/chapters/...";
```

Gunakan URL yang diberikan oleh:

```ts
const manga = await weebcentral.detail(seriesUrl);

const chapter = manga.episodes[0].urls[0];

const pages = await weebcentral.watch(chapter.url);
```

Alasannya: struktur URL/source bisa berubah.

---

# 15. Jangan Scrape dari Frontend

SALAH:

```ts
"use client";

import weebcentral from "./weebcentral";
```

Untuk aplikasi Next.js, scraper sebaiknya dijalankan di:

```text
Route Handler
Server Component
Server Action
Backend service
```

Contoh:

```ts
// app/api/manga/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import weebcentral from "@/lib/weebcentral";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Missing query" },
      { status: 400 }
    );
  }

  try {
    const results = await weebcentral.search(query);

    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch WeebCentral" },
      { status: 500 }
    );
  }
}
```

Frontend cukup memanggil API milik aplikasi sendiri.

---

# 16. Contoh Implementasi Lengkap

```ts
import weebcentral from "./weebcentral";

async function main() {
  const search = await weebcentral.search("One Piece");

  if (!search.length) {
    console.log("Manga not found");
    return;
  }

  const manga = await weebcentral.detail(search[0].url);

  console.log("Title:", manga.title);
  console.log("Cover:", manga.cover);
  console.log("Description:", manga.desc);

  const chapters = manga.episodes[0]?.urls ?? [];

  console.log("Chapters:", chapters.length);

  if (!chapters.length) {
    return;
  }

  const chapter = chapters[0];

  console.log("Chapter:", chapter.name);

  const pages = await weebcentral.watch(chapter.url);

  console.log("Pages:", pages.urls.length);

  for (const image of pages.urls) {
    console.log(image);
  }
}

main().catch(console.error);
```

---

# 17. Rule untuk AI/Agent

Jika AI/agent menggunakan `weebcentral.ts`, ikuti aturan berikut:

1. Jangan mengubah API public tanpa alasan.
2. Jangan menggunakan API Miru.
3. Gunakan `search()` untuk mencari manga.
4. Gunakan URL hasil search untuk `detail()`.
5. Gunakan chapter URL hasil `detail()` untuk `watch()`.
6. Jangan membuat URL chapter secara manual.
7. Jangan menjalankan scraper di client/browser.
8. Gunakan scraper dari server/backend.
9. Tangani error dan hasil kosong.
10. Jangan mengubah selector HTML kecuali struktur WeebCentral berubah.
11. Jangan menambahkan dependency baru jika tidak diperlukan.
12. Pertahankan TypeScript types.
13. Jika struktur HTML WeebCentral berubah, perbaiki scraper berdasarkan HTML terbaru, bukan dengan menebak selector.

---

# 18. Dependency

Satu dependency diperlukan:

```bash
npm install cheerio
```

`fetch()` menggunakan native API Node.js 18+.

Tidak diperlukan:

```text
axios
Miru
JiruHub
Express
EJS
Puppeteer
Playwright
```

kecuali project membutuhkan dependency tersebut untuk bagian lain.

---

# 19. Public API

Public API yang harus dianggap stabil:

```ts
weebcentral.search(query, page?)

weebcentral.latest(page?)

weebcentral.detail(url)

weebcentral.watch(chapterUrl)

weebcentral.getManga(url)

weebcentral.getPages(chapterUrl)
```

Type utama:

```ts
SearchResult
LatestResult
Chapter
MangaDetail
MangaPages
```

Internal implementation seperti:

```ts
request()
absoluteUrl()
```

tidak boleh digunakan langsung dari luar class.
