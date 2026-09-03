# SECURITY_AUDIT.md

Reusable audit playbook buat semua project agent-driven (bsc-base-bot, pumpfun-sniper, anime-streaming-web, dll). Copy-paste prompt di tiap tahap ke agent (Claude Code / Gemini / dll). Jalanin sebagai step terpisah dari task fitur, bukan digabung.

**Prinsip utama:** agent WAJIB nunjukkin bukti kode (path:line + quote), bukan cuma declare "✅ AMAN". Kalau agent nulis "✅ APPROVAL SELESAI" sendiri — itu bukan approval, itu klaim. Kamu yang approve.

---

## STAGE 0 — Audit Awal

```
Lakukan security & stability audit terhadap kode yang baru saja kamu buat/ubah, sebelum lanjut ke task berikutnya. Jangan langsung fix, laporkan dulu temuan dalam format list (file:line, severity, deskripsi), baru minta konfirmasi gue sebelum patch.

Cakupan audit:
1. AUTH & SESSION
   - Endpoint yang seharusnya protected tapi belum dicek middleware/auth guard?
   - Token/session divalidasi benar (expiry, refresh, revoke)?
   - Password/secret di-hash, bukan plaintext?

2. INPUT VALIDATION & INJECTION
   - Semua input user (body, query, params, headers) divalidasi/sanitized?
   - Raw query rawan SQL/NoSQL injection?
   - File upload dibatasi tipe & size, path traversal dicek?

3. AUTHORIZATION / IDOR
   - Endpoint yang akses data by ID: cek ownership-nya (user A ga bisa akses resource user B)?
   - Role/permission check konsisten di semua route, bukan cuma frontend?

4. SECRET & CONFIG
   - API key/secret/connection string ke-hardcode?
   - .env sudah gitignored, ga ke-commit di history?

5. ERROR HANDLING & LOGGING
   - Error ke user ga bocorin stack trace/internal detail?
   - Ada logging buat aktivitas sensitif?

6. RATE LIMIT & ABUSE
   - Endpoint publik (login, register, chat, dll) ada rate limit?

7. DEPENDENCY & STABILITY
   - Known vulnerability di dependency (npm/pip audit)?
   - Unhandled promise rejection / try-catch yang ke-skip di async flow?
   - Race condition di operasi concurrent (balance update, order matching, bulkWrite)?

Output: markdown checklist status ✅/⚠️/❌ per poin, plus rekomendasi fix untuk tiap ⚠️/❌. Jangan ubah kode dulu sampai gue approve list-nya.
```

---

## STAGE 1 — Verifikasi .env & Secret Leak

```bash
git check-ignore -v .env
git log --all --full-history -- .env
```

Jalanin manual (cepat, ga perlu agent). Kalau `git log` ga kosong → `.env` pernah ke-commit → **rotate semua secret di dalamnya**, jangan cuma tambahin ke .gitignore.

---

## STAGE 2 — IDOR Deep Check

Jangan percaya grep pertama agent. Paksa recursive listing dulu biar ga ada file kelewat:

```
Jalankan listing recursive yang BENAR (bukan wildcard ** yang sering ga recursive di shell tertentu):

# PowerShell:
Get-ChildItem -Path src/app/api -Recurse -Filter route.ts | Select-Object -ExpandProperty FullName

# bash:
find src/app/api -name "route.ts"

Laporkan JUMLAH TOTAL file. Untuk SETIAP file:
- path + method (GET/POST/PUT/DELETE)
- QUOTE baris kode yang membandingkan session.user.id / auth identity dengan resource owner sebelum read/write data privat
- Kalau endpoint publik tanpa data privat, jelaskan kenapa (bukan cuma declare "aman")
- Kalau TIDAK ADA perbandingan ownership padahal endpoint terima ID dari URL/body: tandai ❌ VULNERABLE, jelaskan skenario exploit-nya

Prioritaskan endpoint yang menerima identifier (userId, username, roomId, resourceId) langsung dari URL param atau request body — itu risiko IDOR tertinggi.

Di akhir: hitung ulang total file yang benar-benar teraudit, pastikan cocok dengan jumlah dari listing recursive di atas. Kalau ada selisih, jelaskan kenapa.
```

**Red flag yang harus ditolak:**

- Status "✅ AMAN" tanpa quote baris kode
- Total file audit ga cocok sama hasil listing
- File dengan dynamic segment (`[id]`, `[username]`, `[...path]`) yang dilewatin analisisnya

---

## STAGE 3 — Realtime/Pub-Sub Channel Check (Pusher/Socket.io/WebSocket)

Kalau project punya chat/realtime feature — ini celah yang paling sering kelewat karena bukan REST endpoint biasa:

```
Cek endpoint auth untuk channel realtime (pusher-auth, socket.io auth middleware, dll):
1. Apakah ada validasi bahwa channel/room yang diminta memang milik user yang login, SEBELUM auth signature/token dikeluarkan?
2. Cari SEMUA tempat CLIENT (bukan server) generate/subscribe nama channel:
   rg -n "subscribe|channel_name|private-|presence-" src --glob "*.ts" --glob "*.tsx"
3. Bandingkan pola yang benar-benar dipakai client vs validasi yang ada di server — jangan asumsi dari kode server doang, karena client yang nentuin channel_name yang dikirim.
4. Kalau ketemu gap (server ga validasi ownership, atau pattern validasi ga cocok sama yang dipakai client): fix, lalu re-grep ulang buat pastiin fix ga bikin false-positive block ke channel publik/room bersama.
```

---

## STAGE 4 — Race Condition & Bulk Operation Logging

```
Cari semua bulkWrite/batch operation dengan { ordered: false } atau sejenisnya:
rg -n "bulkWrite|batchWrite|Promise.allSettled" src/lib

Untuk tiap satu, pastikan ada error logging per-item (bukan cuma try-catch di luar loop):

const result = await col.bulkWrite(ops, { ordered: false });
if (result.hasWriteErrors?.()) {
  result.getWriteErrors().forEach(e =>
    console.error("[context] item failed:", { index: e.index, err: e.err })
  );
}

Tunjukkan diff, lalu jalankan build/typecheck untuk verifikasi ga ada regresi.
```

---

## STAGE 5 — Trading Bot Specific (Solana/BSC/Futures)

Poin tambahan khusus buat project trading bot — private key & API secret exchange itu kelas risiko beda dari web app biasa:

```
Cek khusus untuk bot trading:
1. Private key wallet / API secret exchange: pernah ke-log ke console, file log, atau terkirim ke request luar (termasuk via error tracking/analytics third-party)?
2. Apakah ada retry logic yang bisa double-execute order (misal retry tanpa idempotency check, race antara order placement dan balance check)?
3. Slippage/position size validation: ada hard cap yang mencegah bug menghasilkan order dengan size salah (misal parsing error jadi 100x lipat)?
4. Kill switch: ada cara manual stop bot cepat kalau ada anomali, tanpa perlu redeploy?

Quote baris kode untuk tiap poin, jangan cuma bilang aman.
```

---

## Approval Protocol

- Agent **melaporkan**, kamu yang **approve**. Kalau agent nulis "APPROVAL SELESAI" atau "siap dipakai" sendiri, itu diabaikan — bukan sign-off yang valid.
- Total ❌ harus 0 sebelum lanjut task fitur baru.
- Total ⚠️ boleh ditunda ke pre-production kalau memang bukan blocking, tapi harus eksplisit kamu yang putuskan mana yang ditunda.
- Kalau ada gap antara jumlah file yang diklaim vs hasil listing/grep — jangan lanjut, suruh agent audit ulang sampai angkanya konsisten.
