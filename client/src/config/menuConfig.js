/**
 * Comprehensive Menu Configuration for Teacher Management System
 * Organized by 8 main sections with hierarchical submenus
 */

export const menuConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard Utama',
    path: '/',
    icon: 'fas fa-home',
    description: 'Ringkasan dan akses cepat ke fitur utama',
    children: null,
  },
  {
    id: 'data-master',
    label: 'Data Siswa & Kelas',
    icon: 'fas fa-users-cog',
    description: 'Kelola data siswa (standar rapor) dan kelas',
    children: [
      {
        id: 'data-siswa',
        label: 'Data Siswa',
        path: '/data-siswa',
        icon: 'fas fa-user-graduate',
        description: 'Data lengkap siswa: identitas, ttl, alamat, orang tua/wali',
      },
      {
        id: 'data-kelas',
        label: 'Data Kelas',
        path: '/data-kelas',
        icon: 'fas fa-school',
        description: 'Kelas rombel per tahun ajaran, wali kelas, dan ruang',
      },
    ],
  },
  {
    id: 'profile',
    label: 'Profil & Identitas',
    icon: 'fas fa-id-card',
    description: 'Kelola profil dan identitas guru',
    children: [
      {
        id: 'teacher-profile',
        label: 'Profil Guru',
        path: '/profile/teacher-profile',
        icon: 'fas fa-user',
        description: 'Data pribadi, kualifikasi, dan sertifikasi',
      },
      {
        id: 'school-curriculum',
        label: 'Kurikulum Sekolah',
        path: '/profile/school-curriculum',
        icon: 'fas fa-book-open',
        description: 'Unggah dan kelola dokumen kurikulum',
      },
      {
        id: 'academic-calendar',
        label: 'Kalender Akademik',
        path: '/profile/academic-calendar',
        icon: 'fas fa-calendar-alt',
        description: 'Lihat acara sekolah, libur, dan jadwal ujian',
      },
    ],
  },
  {
    id: 'schedule-attendance',
    label: 'Jadwal & Absensi',
    icon: 'fas fa-calendar-check',
    description: 'Kelola jadwal dan absensi siswa',
    children: [
      {
        id: 'class-schedule',
        label: 'Jadwal Pelajaran',
        path: '/schedule-attendance/class-schedule',
        icon: 'fas fa-calendar',
        description: 'Tampilan mingguan dengan slot waktu yang dapat diedit',
      },
      {
        id: 'student-attendance',
        label: 'Buku Absensi Siswa',
        path: '/schedule-attendance/student-attendance',
        icon: 'fas fa-clipboard-list',
        description: 'Formulir absensi digital per kelas',
      },
      {
        id: 'teaching-journal',
        label: 'Jurnal Mengajar',
        path: '/schedule-attendance/teaching-journal',
        icon: 'fas fa-book',
        description: 'Catat aktivitas mengajar harian',
      },
      {
        id: 'attendance-report',
        label: 'Rekap Absensi',
        path: '/schedule-attendance/attendance-report',
        icon: 'fas fa-chart-bar',
        description: 'Laporan rekap absensi per periode (bulanan, semester, tahunan)',
      },
      {
        id: 'journal-report',
        label: 'Rekap Jurnal',
        path: '/schedule-attendance/journal-report',
        icon: 'fas fa-file-alt',
        description: 'Laporan rekap jurnal mengajar per periode (bulanan, semester, tahunan)',
      },
    ],
  },
  {
    id: 'learning-planning',
    label: 'Perencanaan Pembelajaran',
    icon: 'fas fa-pencil-ruler',
    description: 'Buat dan kelola rencana pembelajaran',
    children: [
      {
        id: 'atp-intracurricular',
        label: 'ATP Intrakurikuler',
        path: '/learning-planning/atp-intracurricular',
        icon: 'fas fa-stream',
        description: 'Alur Tujuan Pembelajaran (Learning Objectives Flow)',
      },
      {
        id: 'lesson-plans',
        label: 'RPP/Modul Ajar',
        path: '/learning-planning/lesson-plans',
        icon: 'fas fa-file-alt',
        description: 'Rencana Pelaksanaan Pembelajaran (Lesson Implementation Plans)',
      },
    ],
  },
  {
    id: 'cocurricular',
    label: 'Kegiatan Kokurikuler',
    icon: 'fas fa-tasks',
    description: 'Kelola kegiatan kokurikuler',
    children: [
      {
        id: 'cocurricular-schedule',
        label: 'Jadwal Kokurikuler',
        path: '/cocurricular/schedule',
        icon: 'fas fa-clock',
        description: 'Antarmuka penjadwalan kegiatan kokurikuler',
      },
      {
        id: 'cocurricular-programs',
        label: 'Program Kokurikuler',
        path: '/cocurricular/programs',
        icon: 'fas fa-project-diagram',
        description: 'Perencanaan dan dokumentasi program',
      },
      {
        id: 'cocurricular-modules',
        label: 'Modul Kokurikuler',
        path: '/cocurricular/modules',
        icon: 'fas fa-folder-open',
        description: 'Perpustakaan materi dan sumber daya',
      },
    ],
  },
  {
    id: 'extracurricular',
    label: 'Ekstrakurikuler',
    icon: 'fas fa-star',
    description: 'Kelola kegiatan ekstrakurikuler',
    children: [
      {
        id: 'extracurricular-programs',
        label: 'Program Ekstrakurikuler',
        path: '/extracurricular/programs',
        icon: 'fas fa-trophy',
        description: 'Manajemen kegiatan ekstrakurikuler',
      },
      {
        id: 'extracurricular-schedule',
        label: 'Jadwal Ekstrakurikuler',
        path: '/extracurricular/schedule',
        icon: 'fas fa-hourglass-half',
        description: 'Penjadwalan dan koordinasi sesi',
      },
      {
        id: 'competition-records',
        label: 'Catatan Peserta Lomba',
        path: '/extracurricular/competition-records',
        icon: 'fas fa-medal',
        description: 'Database peserta kompetisi dan prestasi',
      },
    ],
  },
  {
    id: 'monitoring-evaluation',
    label: 'Monitoring & Evaluasi',
    icon: 'fas fa-chart-line',
    description: 'Pantau dan evaluasi pembelajaran',
    children: [
      {
        id: 'visitation-log',
        label: 'Buku Kunjungan',
        path: '/monitoring-evaluation/visitation-log',
        icon: 'fas fa-clipboard-check',
        description: 'Catatan kunjungan kelas digital',
      },
      {
        id: 'student-reflection',
        label: 'Refleksi Siswa',
        path: '/monitoring-evaluation/student-reflection',
        icon: 'fas fa-lightbulb',
        description: 'Jurnal pembelajaran dan refleksi diri siswa',
      },
    ],
  },
  {
    id: 'assessment',
    label: 'Penilaian',
    icon: 'fas fa-chart-bar',
    description: 'Kelola penilaian dan nilai siswa',
    children: [
      {
        id: 'exam-questions',
        label: 'Soal Ulangan',
        path: '/assessment/exam-questions',
        icon: 'fas fa-question-circle',
        description: 'Bank soal dan generator tes harian',
      },
      {
        id: 'grade-list',
        label: 'Daftar Nilai',
        path: '/assessment/grade-list',
        icon: 'fas fa-list-ol',
        description: 'Input dan kelola nilai siswa per kelas',
      },
      {
        id: 'mastery-criteria',
        label: 'Kriteria Ketuntasan',
        path: '/assessment/mastery-criteria',
        icon: 'fas fa-check-double',
        description: 'KKTP - Kriteria Ketercapaian Tujuan Pembelajaran',
      },
      {
        id: 'evaluation-analysis',
        label: 'Analisis Evaluasi',
        path: '/assessment/evaluation-analysis',
        icon: 'fas fa-chart-pie',
        description: 'Dashboard analisis hasil pembelajaran',
      },
    ],
  },
]

/**
 * Utility function to flatten menu items for easier access
 */
export const flattenMenuItems = (items = menuConfig) => {
  const flattened = []
  
  items.forEach((item) => {
    flattened.push({
      ...item,
      children: undefined,
    })
    
    if (item.children && Array.isArray(item.children)) {
      flattened.push(...item.children)
    }
  })
  
  return flattened
}

/**
 * Find menu item by path
 */
export const findMenuItemByPath = (path, items = menuConfig) => {
  const flattened = flattenMenuItems(items)
  return flattened.find((item) => item.path === path)
}

/**
 * Find menu item by id
 */
export const findMenuItemById = (id, items = menuConfig) => {
  const flattened = flattenMenuItems(items)
  return flattened.find((item) => item.id === id)
}

/**
 * Get parent menu item for a child item
 */
export const getParentMenuItem = (childId, items = menuConfig) => {
  for (const item of items) {
    if (item.children && Array.isArray(item.children)) {
      if (item.children.some((child) => child.id === childId)) {
        return item
      }
    }
  }
  return null
}

