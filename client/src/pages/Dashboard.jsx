import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { api } from '../lib/api'
import { useAcademicYear } from '../context/AcademicYearContext'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Warna konsisten dengan ATTENDANCE_STATUS (useStudentAttendance);
// kunci mengikuti nama properti Chart.js agar bisa di-spread ke dataset
const STATUS_CHART_COLORS = {
  hadir: { borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.5)' },
  sakit: { borderColor: 'rgb(234, 179, 8)', backgroundColor: 'rgba(234, 179, 8, 0.5)' },
  izin: { borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.5)' },
  alpa: { borderColor: 'rgb(239, 68, 68)', backgroundColor: 'rgba(239, 68, 68, 0.5)' },
}
const STATUS_LABELS = { hadir: 'Hadir', sakit: 'Sakit', izin: 'Izin', alpa: 'Alpa' }

// Server menyimpan status lowercase ('alpa'); 'alpha' dari data lama ikut dinormalisasi
const normStatus = (s) => {
  const v = String(s || '').toLowerCase()
  return v === 'alpha' ? 'alpa' : v
}

// Kunci tanggal lokal 'YYYY-MM-DD' (toISOString memakai UTC dan bisa geser hari)
const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const dayLabel = (key) =>
  new Date(`${key}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'short' })

const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' })
}

export const Dashboard = () => {
  const navigate = useNavigate()
  const { academicYear, registerClassYears, academicYearRange, currentAcademicYear } = useAcademicYear()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState([])
  const [grades, setGrades] = useState([])
  const [journals, setJournals] = useState([])
  const [modulAjar, setModulAjar] = useState([])

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [classesData, studentsData, attendanceData, gradesData, journalsData, modulAjarData] =
        await Promise.all([
          api.get('/classes'),
          api.get('/students'),
          api.get('/attendance'),
          api.get('/grades'),
          api.get('/journals'),
          api.get('/modul-ajar'),
        ])
      setClasses(classesData || [])
      setStudents(studentsData || [])
      setAttendance(attendanceData || [])
      setGrades(gradesData || [])
      setJournals(journalsData || [])
      setModulAjar(modulAjarData || [])
      registerClassYears(classesData)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err.message || 'Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }, [registerClassYears])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // === Data milik TP terpilih (semua dihitung dari API, tanpa data contoh) ===
  const tpData = useMemo(() => {
    const yearOf = (c) => String(c.academic_year || '').trim()
    let tpClasses = classes.filter((c) => yearOf(c) === academicYear)
    // Kelas lama yang belum diatur tahun ajarannya dianggap milik TP berjalan
    const legacyFallback =
      tpClasses.length === 0 &&
      academicYear === currentAcademicYear &&
      classes.length > 0 &&
      !classes.some((c) => yearOf(c))
    if (legacyFallback) tpClasses = classes

    const classIds = new Set(tpClasses.map((c) => c.id))
    const inTp = (row) => classIds.has(row.class_id)

    const tpStudents = students.filter((s) => classIds.has(s.class_id))
    const tpAttendance = attendance.filter(inTp)
    const tpGrades = grades.filter(inTp)
    const tpJournals = [...journals.filter(inTp)].sort((a, b) =>
      String(b.tanggal).localeCompare(String(a.tanggal))
    )

    const todayKey = toDateKey(new Date())
    const todayAttendance = tpAttendance.filter((a) => String(a.tanggal).slice(0, 10) === todayKey)
    const todayHadir = todayAttendance.filter((a) => normStatus(a.status) === 'hadir').length
    const todayPercent =
      todayAttendance.length > 0 ? Math.round((todayHadir / todayAttendance.length) * 100) : null

    return {
      tpClasses, tpStudents, tpAttendance, tpGrades, tpJournals,
      todayAttendance, todayHadir, todayPercent, legacyFallback,
    }
  }, [classes, students, attendance, grades, journals, academicYear, currentAcademicYear])

  // Absensi 7 hari terakhir (riil, per status) + total utk state kosong
  const attendance7 = useMemo(() => {
    const keys = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      keys.push(toDateKey(d))
    }
    const byDay = new Map(keys.map((k) => [k, { hadir: 0, sakit: 0, izin: 0, alpa: 0 }]))
    tpData.tpAttendance.forEach((a) => {
      const key = String(a.tanggal).slice(0, 10)
      const bucket = byDay.get(key)
      if (bucket) bucket[normStatus(a.status)] += 1
    })
    const total = keys.reduce((s, k) => s + Object.values(byDay.get(k)).reduce((a, b) => a + b, 0), 0)
    return {
      total,
      chart: {
        labels: keys.map(dayLabel),
        datasets: ['hadir', 'sakit', 'izin', 'alpa'].map((status) => ({
          label: STATUS_LABELS[status],
          data: keys.map((k) => byDay.get(k)[status]),
          ...STATUS_CHART_COLORS[status],
          tension: 0.3,
          pointRadius: 3,
        })),
      },
    }
  }, [tpData.tpAttendance])

  // Distribusi nilai TP ini: rata-rata persentase per siswa -> kategori A-E
  const gradeData = useMemo(() => {
    const byStudent = new Map()
    tpData.tpGrades.forEach((g) => {
      const score = Number(g.score)
      const max = Number(g.max_score)
      if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return
      const arr = byStudent.get(g.student_id) || []
      arr.push((score / max) * 100)
      byStudent.set(g.student_id, arr)
    })
    const buckets = [0, 0, 0, 0, 0] // A, B, C, D, E
    byStudent.forEach((arr) => {
      const avg = arr.reduce((s, v) => s + v, 0) / arr.length
      if (avg >= 90) buckets[0]++
      else if (avg >= 80) buckets[1]++
      else if (avg >= 70) buckets[2]++
      else if (avg >= 60) buckets[3]++
      else buckets[4]++
    })
    return {
      labels: ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'E (<60)'],
      datasets: [
        {
          label: 'Jumlah Siswa',
          data: buckets,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
        },
      ],
    }
  }, [tpData.tpGrades])

  // Komposisi kehadiran sepanjang TP terpilih (persentase per status)
  const tpAttendanceData = useMemo(() => {
    const range = academicYearRange
    const rows = range
      ? tpData.tpAttendance.filter((a) => {
          const t = String(a.tanggal).slice(0, 10)
          return t >= range.startDate && t <= range.endDate
        })
      : tpData.tpAttendance
    const counts = { hadir: 0, sakit: 0, izin: 0, alpa: 0 }
    rows.forEach((a) => {
      counts[normStatus(a.status)] += 1
    })
    const total = rows.length
    const hadirPercent = total > 0 ? Math.round((counts.hadir / total) * 100) : null
    return {
      total,
      hadirPercent,
      chart: {
        labels: ['Hadir', 'Sakit', 'Izin', 'Alpa'],
        datasets: [
          {
            data: [counts.hadir, counts.sakit, counts.izin, counts.alpa],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(234, 179, 8, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
          },
        ],
      },
    }
  }, [tpData.tpAttendance, academicYearRange])

  // Aktivitas bulanan 6 bulan terakhir: jurnal (ikut TP) + modul ajar (belum terhubung TP)
  const activityData = useMemo(() => {
    const keys = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i, 1)
      keys.push(toDateKey(d).slice(0, 7))
    }
    const journalCounts = new Map(keys.map((k) => [k, 0]))
    tpData.tpJournals.forEach((j) => {
      const key = String(j.tanggal).slice(0, 7)
      if (journalCounts.has(key)) journalCounts.set(key, journalCounts.get(key) + 1)
    })
    const modulCounts = new Map(keys.map((k) => [k, 0]))
    modulAjar.forEach((m) => {
      const key = String(m.created_at || '').slice(0, 7)
      if (modulCounts.has(key)) modulCounts.set(key, modulCounts.get(key) + 1)
    })
    return {
      labels: keys.map(monthLabel),
      datasets: [
        {
          label: 'Jurnal Mengajar',
          data: keys.map((k) => journalCounts.get(k)),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: 'Modul Ajar',
          data: keys.map((k) => modulCounts.get(k)),
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
        },
      ],
    }
  }, [tpData.tpJournals, modulAjar])

  const modulAjarCount = modulAjar.length

  const gradeTotalStudents = useMemo(
    () => new Set(tpData.tpGrades.map((g) => g.student_id)).size,
    [tpData.tpGrades]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="bg-blue-600 rounded-lg shadow-md p-4 md:p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard Guru</h1>
          <span className="px-3 py-1 rounded-full bg-white bg-opacity-20 text-sm font-semibold">
            TP {academicYear}
          </span>
        </div>
        <p className="mt-2 text-sm md:text-base opacity-90">
          Semua angka di bawah dihitung dari data Anda untuk TP {academicYear}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between gap-3">
          <p className="text-red-800 text-sm">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 min-h-[44px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {tpData.legacyFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-700">
            <i className="fas fa-info-circle mr-2"></i>
            Kelas Anda belum diatur tahun ajarannya, jadi semua kelas ditampilkan sebagai TP {academicYear}.
            Atur tahun ajaran lewat Buku Absensi Siswa, menu Kelola Kelas, agar pemisahan TP akurat.
          </p>
        </div>
      )}

      {/* Stats Cards — 2 kolom sampai lg: di lebar md (tablet) 4 kolom membuat angka tertutup ikon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Total Kelas"
          value={tpData.tpClasses.length}
          sub={`TP ${academicYear}`}
          icon="fas fa-school"
          color="bg-blue-500"
          onClick={() => navigate('/schedule-attendance/student-attendance')}
        />
        <StatCard
          title="Total Siswa"
          value={tpData.tpStudents.length}
          sub={`${tpData.tpClasses.length} kelas`}
          icon="fas fa-users"
          color="bg-green-500"
          onClick={() => navigate('/schedule-attendance/student-attendance')}
        />
        <StatCard
          title="Kehadiran Hari Ini"
          value={tpData.todayHadir}
          sub={
            tpData.todayPercent === null
              ? 'belum ada absensi hari ini'
              : `${tpData.todayPercent}% dari ${tpData.todayAttendance.length} catatan`
          }
          icon="fas fa-clipboard-check"
          color="bg-orange-500"
          onClick={() => navigate('/schedule-attendance/student-attendance')}
        />
        <StatCard
          title="Modul Ajar"
          value={modulAjarCount}
          sub="semua TP"
          icon="fas fa-book"
          color="bg-purple-500"
          onClick={() => navigate('/learning-planning/lesson-plans')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <ChartCard
          icon="fas fa-chart-line"
          iconColor="text-blue-600"
          title="Absensi 7 Hari Terakhir"
          isEmpty={attendance7.total === 0}
          emptyText="Belum ada absensi tercatat dalam 7 hari terakhir"
        >
          <div className="h-60 md:h-72">
            <Line data={attendance7.chart} options={lineOptions} />
          </div>
        </ChartCard>

        <ChartCard
          icon="fas fa-heartbeat"
          iconColor="text-green-600"
          title="Kehadiran TP Ini"
          subtitle={
            tpAttendanceData.total > 0
              ? `${tpAttendanceData.total} catatan absensi, ${tpAttendanceData.hadirPercent}% hadir`
              : null
          }
          isEmpty={tpAttendanceData.total === 0}
          emptyText="Belum ada catatan absensi pada rentang TP ini"
        >
          <div className="h-60 md:h-72">
            <Doughnut data={tpAttendanceData.chart} options={doughnutOptions} />
          </div>
        </ChartCard>

        <ChartCard
          icon="fas fa-chart-pie"
          iconColor="text-purple-600"
          title="Distribusi Nilai Siswa"
          subtitle={
            gradeTotalStudents > 0
              ? `Rata-rata nilai ${gradeTotalStudents} siswa, dikelompokkan per kategori`
              : null
          }
          isEmpty={gradeTotalStudents === 0}
          emptyText="Belum ada nilai yang diinput untuk TP ini"
        >
          <div className="h-60 md:h-72">
            <Bar data={gradeData} options={barOptions} />
          </div>
        </ChartCard>

        <ChartCard
          icon="fas fa-chart-bar"
          iconColor="text-orange-600"
          title="Aktivitas 6 Bulan Terakhir"
          subtitle="Jurnal mengajar mengikuti TP terpilih; modul ajar belum terhubung TP"
          isEmpty={tpData.tpJournals.length === 0 && modulAjarCount === 0}
          emptyText="Belum ada jurnal mengajar maupun modul ajar"
        >
          <div className="h-60 md:h-72">
            <Bar data={activityData} options={barOptions} />
          </div>
        </ChartCard>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          <i className="fas fa-history mr-2 text-orange-600"></i>
          Jurnal Mengajar Terbaru
        </h2>
        {tpData.tpJournals.length > 0 ? (
          <div className="space-y-3">
            {tpData.tpJournals.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-book text-blue-600"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Jurnal Mengajar - {activity.class?.name || 'Kelas'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {activity.materi || 'Tidak ada deskripsi'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    <i className="fas fa-calendar mr-1"></i>
                    {new Date(activity.tanggal).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-inbox text-3xl mb-2"></i>
            <p className="text-sm">Belum ada jurnal mengajar untuk TP ini</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          <i className="fas fa-bolt mr-2 text-yellow-600"></i>
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <QuickActionButton
            icon="fas fa-clipboard-list"
            label="Input Absensi"
            color="bg-green-600"
            onClick={() => navigate('/schedule-attendance/student-attendance')}
          />
          <QuickActionButton
            icon="fas fa-star"
            label="Input Nilai"
            color="bg-purple-600"
            onClick={() => navigate('/assessment/grade-list')}
          />
          <QuickActionButton
            icon="fas fa-book"
            label="Buat Modul Ajar"
            color="bg-orange-600"
            onClick={() => navigate('/learning-planning/lesson-plans')}
          />
          <QuickActionButton
            icon="fas fa-journal-whills"
            label="Jurnal Mengajar"
            color="bg-blue-600"
            onClick={() => navigate('/schedule-attendance/teaching-journal')}
          />
        </div>
      </div>
    </div>
  )
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
  },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
}

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
  },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 } },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
  },
  cutout: '62%',
}

const ChartCard = ({ icon, iconColor, title, subtitle, loading, isEmpty, emptyText, children }) => (
  <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
    <h2 className={`text-base md:text-lg font-bold text-gray-900 ${subtitle ? 'mb-1' : 'mb-4'}`}>
      <i className={`${icon} mr-2 ${iconColor}`}></i>
      {title}
    </h2>
    {subtitle && <p className="text-xs text-gray-500 mb-4">{subtitle}</p>}
    {isEmpty ? (
      <div className="h-60 md:h-72 flex flex-col items-center justify-center text-center text-gray-500 px-4">
        <i className="fas fa-inbox text-3xl mb-3"></i>
        <p className="text-sm">{emptyText}</p>
      </div>
    ) : (
      children
    )}
  </div>
)

const StatCard = ({ title, value, sub, icon, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="bg-white rounded-lg shadow-md p-4 md:p-6 cursor-pointer hover:shadow-lg transition-shadow text-left w-full"
  >
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-gray-600 text-xs md:text-sm font-medium truncate">{title}</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>}
      </div>
      <div className={`${color} text-white p-3 md:p-4 rounded-lg flex-shrink-0`}>
        <i className={`${icon} text-lg md:text-2xl`}></i>
      </div>
    </div>
  </button>
)

const QuickActionButton = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`${color} text-white px-3 md:px-4 py-3 min-h-[44px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex flex-col md:flex-row items-center justify-center gap-2`}
  >
    <i className={`${icon} text-lg md:text-base`}></i>
    <span className="text-xs md:text-sm text-center">{label}</span>
  </button>
)

export default Dashboard
