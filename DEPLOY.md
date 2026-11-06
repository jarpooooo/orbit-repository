# Deploy PinjamTEDI ke Firebase Hosting

Web ini di-deploy sebagai **situs statis** ke Firebase Hosting. Gratis di paket **Spark**, tanpa kartu kredit, dan tidak memakai App Hosting maupun Blaze.
Login, Firestore (stok live, pengajuan), dan PWA tetap jalan, karena semuanya diakses langsung dari browser.

- Alamat: **https://pinjamtedi.web.app**, dengan alamat cadangan https://pinjamtedi.firebaseapp.com
- `npm run build` → `next build` (dengan `output: "export"`) → menghasilkan folder `out/`, lalu diunggah ke Hosting.

## Deploy otomatis dari GitHub (sekali setup)

1. Jalankan sekali di laptop yang sudah `firebase login`:
   ```
   firebase init hosting:github
   ```
   - Repository: `jarpooooo/orbit-repository`
   - "Set up the workflow to run a build script before every deploy?" → **No**. Workflow-nya sudah ada di `.github/workflows/`.
   - Kalau ditanya untuk menimpa file workflow yang sudah ada → **No**.
   - Perintah ini membuat secret `FIREBASE_SERVICE_ACCOUNT_PINJAMTEDI` di GitHub. Hanya secret ini yang dibutuhkan.
2. Setelah itu deploy berjalan otomatis:
   - **Push atau merge ke `main`** → `firebase-hosting-merge.yml` → situs live diperbarui (sekitar 3–5 menit).
   - **Pull request** → `firebase-hosting-pull-request.yml` → link preview 7 hari muncul sebagai komentar di PR.
3. Pantau progresnya di tab **Actions** pada repo GitHub.

## Deploy manual dari laptop

```
npm run deploy            # live: https://pinjamtedi.web.app
npm run deploy -- preview # link preview 7 hari, situs live tidak berubah
```
Script ini selalu build ke Firebase asli, walaupun `.env.local` diatur ke emulator.

## Yang ikut di-deploy terpisah

- Aturan Firestore: `firebase deploy --only firestore:rules`. Tidak ikut otomatis. Jalankan setiap kali `firestore.rules` berubah, setelah diuji di emulator.
- Data fasilitas: `npm run seed -- --cloud`. Isi awal saja; stok yang sudah diubah di Console akan kembali ke nilai awal.

## Pengaturan yang dipakai saat build (ada di workflow dan di `scripts/deploy.mjs`)

| Variabel | Nilai | Untuk |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | config web project `pinjamtedi` | koneksi ke Firebase (nilai publik, bukan rahasia) |
| `NEXT_PUBLIC_USE_EMULATORS` | `false` | pakai Firebase asli |
| `NEXT_PUBLIC_SITE_URL` | `https://pinjamtedi.web.app` | canonical, og:image, sitemap |
| `NEXT_PUBLIC_DEMO_LOGIN` | `true` | tombol akun demo Mahasiswa / Petugas untuk juri |

Akun demo dibuat otomatis saat tombolnya pertama kali diklik. Kata sandinya ada di kode, jadi siapa pun bisa memakainya. Akun demo tidak boleh punya hak lebih dari mahasiswa.

## Kalau domain berubah (custom domain)

1. Tambahkan domain di Firebase Console → Hosting → Add custom domain.
2. Tambahkan juga di Authentication → Settings → Authorized domains, supaya login berfungsi.
3. Ganti `NEXT_PUBLIC_SITE_URL` di kedua workflow dan di `scripts/deploy.mjs`.

## Cek setelah deploy pertama

- `/katalog`, `/jadwal-ruang`, dan `/cara-pinjam` harus redirect (301) ke URL bahasa Inggris (aturan ada di `firebase.json`).
- `/sw.js` harus punya header `Cache-Control: no-cache, no-store, must-revalidate`.
- Coba login demo, kirim satu pengajuan, lalu batalkan.
