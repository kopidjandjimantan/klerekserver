# Klerek DB Viewer

Website responsive untuk HP/komputer: login admin, halaman admin, dan pembaca file database SQLite `.db`, `.sqlite`, atau `.sqlite3`. Tampilan terinspirasi dari gaya dashboard sederhana.

## Fitur
- Login admin dengan sesi HTTP-only cookie yang ditandatangani server.
- Pesan kesalahan jika username/password salah.
- Halaman admin untuk informasi konfigurasi.
- Membuka database SQLite standar dan menampilkan tabel/data (maksimal 500 baris per tabel).
- File database diproses di browser, tidak diunggah ke server aplikasi.
- Siap deploy ke Vercel.

## Jalankan di komputer
Perlu Node.js 20 atau lebih baru.
1. Ekstrak ZIP dan buka folder proyek di terminal.
2. Salin `.env.example` menjadi `.env.local`.
3. Isi `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan `SESSION_SECRET`. Gunakan password kuat dan secret acak minimal 32 karakter.
4. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
5. Buka `http://localhost:3000`.

Buat secret acak (opsional):
- macOS/Linux: `openssl rand -hex 32`
- PowerShell: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Deploy ke Vercel
1. Buat repository baru di GitHub dan unggah seluruh isi folder ini (termasuk `package.json`, `app/`, `components/`, `lib/`, dan `tsconfig.json`).
2. Masuk ke Vercel, pilih **Add New → Project**, lalu impor repository tersebut.
3. Di **Project Settings → Environment Variables**, tambahkan:
   - `ADMIN_USERNAME` = username admin pilihan Anda
   - `ADMIN_PASSWORD` = password kuat pilihan Anda
   - `SESSION_SECRET` = string acak minimal 32 karakter
4. Deploy. Jika sudah pernah deploy sebelum mengatur variabel, lakukan **Redeploy**.
5. Buka URL Vercel. Login memakai username/password yang tadi disimpan di Environment Variables.

**Jangan** memasukkan `.env.local` ke GitHub. Jangan menggunakan password penting yang dipakai di layanan lain.

## Catatan format database
Aplikasi ini membaca SQLite standar yang header-nya `SQLite format 3`. Jika file `.db` terenkripsi, rusak, atau format khusus aplikasi (misalnya format proprietary), aplikasi tidak dapat membaca isinya tanpa dokumentasi, format, atau kunci yang sah. File tidak dikirim ke server, tetapi pustaka `sql.js` dimuat dari CDN sehingga browser memerlukan internet saat pertama kali membuka database.

## Keamanan dan batasan
- Login server-side dan cookie HTTP-only; gunakan HTTPS (Vercel menyediakan HTTPS).
- Website ini menggunakan satu akun admin dari environment variables. Pengelolaan banyak akun, audit log, dan pemulihan password memerlukan database pengguna/backend tambahan.
- Pembatasan login sederhana belum mencakup rate limiting; untuk situs yang sensitif tambahkan rate limiting/WAF.
- Halaman admin tidak menyimpan atau mengubah database yang dibuka.
