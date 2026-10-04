import React, { useState, useEffect, useMemo } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useTeachingJournal from '../../hooks/useTeachingJournal'
import useClasses from '../../hooks/useClasses'
import { api } from '../../lib/api'
import { useAcademicYear } from '../../context/AcademicYearContext'
import { exportJournalReportToExcel, exportJournalReportToPDF } from '../../utils/exportJournal'

export const JournalReport = () => {
  const { showNotification } = useNotification()
  const { loadJournalsByDateRange } = useTeachingJournal()
  const { loadClasses: loadClassesHook } = useClasses()
  const { academicYear, registerClassYears, currentAcademicYear } = useAcademicYear()

  const [userId, setUserId] = useState(null)
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [reportType, setReportType] = useState('monthly')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('1')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState([])
  const [summary, setSummary] = useState(null)
  const [periodLabel, setPeriodLabel] = useState('')

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          const classData = await loadClassesHook()
          setClasses(classData || [])
          registerClassYears(classData)
        }
      } catch (err) {
        console.error('Error getting current user:', err)
      }
    }
    getCurrentUser()
  }, [loadClassesHook, registerClassYears])

  // Bulan default = bulan berjalan; tanpa ini rekap Bulanan selalu menolak
  useEffect(() => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    setSelectedMonth(`${now.getFullYear()}-${month}`)
  }, [])

  // Kelas milik TP terpilih; kelas lama tanpa tahun ajaran dianggap TP berjalan
  const tpClasses = useMemo(() => {
    const yearOf = (c) => String(c.academic_year || '').trim()
    let list = classes.filter((c) => yearOf(c) === academicYear)
    const legacyFallback =
      list.length === 0 &&
      academicYear === currentAcademicYear &&
      classes.length > 0 &&
      !classes.some((c) => yearOf(c))
    if (legacyFallback) list = classes
    return { list, legacyFallback }
  }, [classes, academicYear, currentAcademicYear])

  // Saat TP berganti, pilihan kelas direset bila kelasnya bukan milik TP baru
  useEffect(() => {
    if (selectedClass && !tpClasses.list.some((c) => c.id === selectedClass)) {
      setSelectedClass(tpClasses.list[0]?.id || '')
    }
  }, [tpClasses, selectedClass])

  const generateReport = async () => {
    if (!selectedClass) {
      showNotification('Pilih kelas terlebih dahulu', 'error')
      return
    }

    if (reportType === 'monthly' && !selectedMonth) {
      showNotification('Pilih bulan terlebih dahulu', 'error')
      return
    }

    setLoading(true)
    try {
      let startDate, endDate, period

      if (reportType === 'monthly') {
        const [year, month] = selectedMonth.split('-')
        const lastDay = new Date(year, month, 0).getDate()
        startDate = `${year}-${month}-01`
        endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        period = `${monthNames[parseInt(month) - 1]} ${year}`
      } else if (reportType === 'semester') {
        // Semester mengikuti TP terpilih: Semester 1 = Jul-Des tahun awal,
        // Semester 2 = Jan-Jun tahun berikutnya
        const startYear = parseInt(academicYear, 10)
        if (selectedSemester === '1') {
          startDate = `${startYear}-07-01`
          endDate = `${startYear}-12-31`
          period = `Semester 1 TP ${academicYear}`
        } else {
          startDate = `${startYear + 1}-01-01`
          endDate = `${startYear + 1}-06-30`
          period = `Semester 2 TP ${academicYear}`
        }
      } else if (reportType === 'yearly') {
        // Tahunan = satu tahun ajaran penuh (1 Juli s.d. 30 Juni)
        const startYear = parseInt(academicYear, 10)
        startDate = `${startYear}-07-01`
        endDate = `${startYear + 1}-06-30`
        period = `Tahun Ajaran ${academicYear}`
      }

      setPeriodLabel(period)

      const journalRecords = await loadJournalsByDateRange(userId, startDate, endDate)

      // Filter by selected class
      const filteredRecords = journalRecords.filter(j => j.class_id === selectedClass)

      if (filteredRecords.length === 0) {
        showNotification('Tidak ada data jurnal untuk periode ini', 'info')
        setReportData([])
        setSummary(null)
        return
      }

      // Group by materi
      const materiMap = new Map()

      filteredRecords.forEach((journal) => {
        const materi = journal.materi || 'Tidak ada materi'
        if (!materiMap.has(materi)) {
          materiMap.set(materi, { materi, totalSessions: 0 })
        }
        materiMap.get(materi).totalSessions++
      })

      const reportArray = Array.from(materiMap.values())

      const totalJournals = filteredRecords.length
      const totalMateri = reportArray.length
      const uniqueDates = new Set(filteredRecords.map(j => j.tanggal)).size

      const summaryData = { totalJournals, totalMateri, uniqueDates, avgSessionsPerMateri: totalMateri > 0 ? (totalJournals / totalMateri).toFixed(1) : 0 }

      setReportData(reportArray)
      setSummary(summaryData)
      showNotification('Rekap jurnal berhasil dibuat', 'success')
    } catch (err) {
      console.error('Error generating report:', err)
      showNotification('Gagal membuat rekap jurnal', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    if (reportData.length === 0) {
      showNotification('Tidak ada data untuk diexport', 'error')
      return
    }

    const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown'
    exportJournalReportToExcel(reportData, className, periodLabel, summary)
    showNotification('Rekap berhasil diexport ke Excel', 'success')
  }

  const handleExportPDF = () => {
    if (reportData.length === 0) {
      showNotification('Tidak ada data untuk diexport', 'error')
      return
    }

    const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown'
    exportJournalReportToPDF(reportData, className, periodLabel, summary)
    showNotification('Rekap berhasil diexport ke PDF', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Rekap Jurnal Mengajar</h1>
          <p className="text-gray-600 mt-2">Laporan rekap jurnal mengajar per periode</p>
        </div>
        <span
          className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold whitespace-nowrap"
          data-testid="chip-tp"
        >
          TP {academicYear}
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas *</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Kelas</option>
              {tpClasses.list.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - Kelas {cls.grade}
                </option>
              ))}
            </select>
            {tpClasses.list.length === 0 && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                Belum ada kelas untuk TP {academicYear}. Pilih TP lain di kanan atas, atau atur
                tahun ajaran kelas di menu Buku Absensi Siswa (Kelola Kelas).
              </p>
            )}
            {tpClasses.legacyFallback && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                Kelas belum diatur tahun ajarannya, jadi semua kelas ditampilkan sebagai TP {academicYear}.
              </p>
            )}
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Bulanan</option>
              <option value="semester">Semester</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>

          {/* Conditional Inputs Based on Report Type */}
          {reportType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan *</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {reportType === 'semester' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Semester 1 (Jul-Des {academicYear.split('/')[0]})</option>
                <option value="2">Semester 2 (Jan-Jun {academicYear.split('/')[1]})</option>
              </select>
            </div>
          )}

          {/* Untuk periode Tahunan, rentang otomatis satu TP penuh (1 Jul - 30 Jun) */}

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Memuat...
                </>
              ) : (
                <>
                  <i className="fas fa-chart-bar mr-2"></i>
                  Buat Rekap
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jurnal</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalJournals}</p>
              </div>
              <i className="fas fa-book text-3xl text-blue-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Materi Pokok</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalMateri}</p>
              </div>
              <i className="fas fa-chalkboard-teacher text-3xl text-green-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hari Mengajar</p>
                <p className="text-2xl font-bold text-gray-900">{summary.uniqueDates}</p>
              </div>
              <i className="fas fa-calendar-check text-3xl text-purple-500"></i>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata Sesi/Materi</p>
                <p className="text-2xl font-bold text-gray-900">{summary.avgSessionsPerMateri}</p>
              </div>
              <i className="fas fa-chart-line text-3xl text-orange-500"></i>
            </div>
          </div>
        </div>
      )}

      {/* Report Table */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Rekap Jurnal - {periodLabel}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-file-excel"></i>
                <span className="hidden sm:inline">Export Excel</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-file-pdf"></i>
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materi
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Pertemuan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.materi}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {item.totalSessions}x
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && reportData.length === 0 && summary === null && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-chart-bar text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-600">Pilih kelas dan periode untuk membuat rekap jurnal</p>
        </div>
      )}
    </div>
  )
}

export default JournalReport
