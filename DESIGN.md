# DESIGN.md - Arahan Desain SIPJOK

Dokumen ini mendokumentasikan arahan desain yang **sudah dipakai aplikasi ini**
(bukan gaya baru). Semua pekerjaan UI mengikuti dokumen ini, dengan `antislop`
sebagai saringan. Bahasa UI: **Indonesia**, istilah yang dipakai guru sekolah.

## Identitas

- **Produk**: SIPJOK, aplikasi manajemen pembelajaran PJOK (Pendidikan Jasmani,
  Olahraga, dan Kesehatan) untuk guru SD. Satu guru mengelola banyak kelas,
  siswa, jadwal, dan administrasi kurikulum (Permendikdasmen 10 & 13/2025).
- **Pengguna**: guru PJOK SD, sehari-hari, sebagian besar di laptop, sebagian di HP.
- **Kepribadian**: alat kerja yang tegas dan ramah: mirip aplikasi administrasi
  sekolah pemerintah, bukan landing page. Jelas, cepat, tanpa hiasan.

## Dial

`ENERGY 1 / RHYTHM 1 / MOTION 1` - alat administrasi fungsional: tenang,
konsisten, gerak minimal (transisi hover dan feedback notifikasi saja).

## Palet

- **Primer**: biru-600 (`bg-blue-600`) untuk aksi utama; biru-50/100 untuk
  penanda informatif. Alasan: satu warna aksi yang sudah baku di seluruh app.
- **Netral**: putih (kartu), abu Tailwind (teks `gray-900/700/600/500`, latar
  `gray-100/50`, sidebar `gray-900`/biru gelap). Netral tidak dihitung inti.
- **Aksen/status (semantik, bukan dekorasi)**: hijau = berhasil/aktif, kuning =
  berjalan/diubah, merah = hapus/galat/alpa, ungu = rekomendasi/tindak lanjut,
  abu = arsip/nonaktif. Setiap badge status punya pasangan `bg-{warna}-100
  text-{warna}-800` yang tetap (sistem legenda, konsisten lintas halaman).
- **Dilarang**: gradient dekoratif, glow, glassmorphism, lebih dari 1 aksen
  non-semantik per layar.

## Tipografi

- Font sistem bawaan Tailwind (stack default). Alasan: alat kerja, keterbacaan
  dulu, tanpa muat font eksternal.
- Hierarki: `text-3xl font-bold` judul halaman, `text-gray-600` subjudul,
  `text-sm`/`text-xs` untuk data dan meta.

## Komponen

- **Kartu data**: `bg-white rounded-lg shadow-md p-5`; grid `1/2/3` kolom
  responsif. Kartu seragam karena isinya data setara (daftar CRUD), hierarki
  dari badge status dan judul, bukan variasi ukuran.
- **Tabel**: `w-full text-sm`, kepala `bg-gray-100`, baris `hover:bg-gray-50`,
  pembungkus `overflow-x-auto`.
- **Tombol**: primer `bg-blue-600 text-white rounded-lg hover:bg-blue-700`;
  sekunder `bg-gray-300 text-gray-800`. Tombol ikon (edit/hapus): `h-11 w-11`
  (tap target 44px) dengan ikon di tengah.
- **Modal**: overlay `fixed inset-0 bg-black bg-opacity-50 z-50`, panel putih
  `rounded-lg p-6 max-w-md/lg`, tertutup tombol Batal **dan** tombol Escape.
- **Form**: label `text-sm font-medium text-gray-700`, input `rounded-lg` dengan
  `focus:ring-2 focus:ring-blue-500` (fokus selalu terlihat).
- **State wajib**: setiap halaman data punya state muat (spinner), kosong
  (pesan + petunjuk tombol tambah), dan galat (kotak merah).
- **Banner rujukan**: `bg-blue-50 border-blue-200 text-blue-800` berisi kutipan
  regulasi yang mendasari fitur; hanya teks nyata, tanpa angka palsu.
- **Ikon**: FontAwesome, dipilih karena relevan dengan isi (medal untuk lomba,
  clock untuk jadwal); bukan ikon generik sparkle/magic.

## Bahasa UI

- Judul dan tombol dalam bahasa Indonesia yang spesifik: "Tambah Jadwal",
  "Catat Kunjungan", "Catat Refleksi", "Simpan", "Batal". Tanpa istilah
  marketing, tanpa em dash di teks apa pun.
- Pesan notifikasi menyebut objeknya: "Jadwal kokurikuler berhasil ditambahkan".
