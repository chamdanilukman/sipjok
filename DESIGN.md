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
- **Pemilih Tahun Ajaran (TP)**: dropdown tetap di Header (tombol `min-h-[44px]`
  berikon kalender, teks `TP 2026/2027`). TP disimpan di
  `AcademicYearContext` + localStorage; Tahun ajaran Indonesia mulai Juli.
  Dashboard dan semua Rekap (monev) wajib mengikuti TP terpilih; daftar pilihan
  bertambah otomatis dari nilai `academic_year` kelas. Kelas tanpa tahun ajaran
  dianggap milik TP berjalan dan diberi catatan kuning, bukan disimpan diam-diam.
- **Grafik dashboard**: semua angka dan persentase dihitung dari data API
  (absensi, nilai, jurnal) untuk TP terpilih. Dilarang keras menaruh data contoh
  hardcode. Kartu grafik wajib punya state kosong ("Belum ada catatan absensi
  pada rentang TP ini") dan subtitle yang menjelaskan sumber angka.

## Bahasa UI

- Judul dan tombol dalam bahasa Indonesia yang spesifik: "Tambah Jadwal",
  "Catat Kunjungan", "Catat Refleksi", "Simpan", "Batal". Tanpa istilah
  marketing, tanpa em dash di teks apa pun.
- Pesan notifikasi menyebut objeknya: "Jadwal kokurikuler berhasil ditambahkan".
- **Data siswa & kelas menu sendiri**: pengelolaan siswa dan kelas TIDAK
  bercampur dengan halaman presensi. Menu "Data Siswa & Kelas" (setelah
  Dashboard) memuat dua halaman: `/data-siswa` (CRUD siswa dengan field
  standar rapor: NIS, NISN, JK, tempat/tanggal lahir, agama, alamat, nama
  ayah/ibu, pekerjaan orang tua, no. HP, asal sekolah) dan `/data-kelas`
  (kelas rombel per TP, wali kelas, ruang, jumlah siswa). Halaman Buku
  Absensi hanya mengisi absensi dan menyisipkan banner rujukan ke menu
  tersebut; tombol Import Excel siswa tinggal di `/data-siswa`.
- **Nama Kapital Huruf Depan**: nama orang (siswa, ayah, ibu) selalu
  ditampilkan lewat `formatNama()` (`utils/formatNama.js`) dan dirapikan
  lagi di server saat simpan (`titleCaseName` di `routes/students.ts`),
  contoh "budi santoso" tampil "Budi Santoso", "muhammad al-fatih" tetap
  satu kata depan kapital setelah tanda hubung. Data lama yang hurufnya
  berantakan ikut tampil rapi tanpa perlu migrasi.
