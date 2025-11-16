import React, { useState, useEffect } from 'react'
import { useDataContext } from '../../context/DataContext'
import useTeachingJournal from '../../hooks/useTeachingJournal'
import supabase from '../../config/supabase'
import { exportJournalReportToExcel, exportJournalReportToPDF } from '../../utils/exportJournal'

export const JournalReport = () => {
  const { showNotification } = useDataContext()
  const { loadJournalsByDateRange } = useTeachingJournal()

  const [userId, setUserId] = useState(null)
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [reportType, setReportType] = useState('monthly')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('1')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState([])
  const [summary, setSummary] = useState(null)
  const [periodLabel, setPeriodLabel] = useState('')

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        loadClasses(user.id)
      }
    }
    getCurrentUser()
  }, [])

  const loadClasses = async (teacherId) => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherId)

      if (error) throw error
      setClasses(data || [])
    } catch (err) {
      console.error('Error loading classes:', err)
      showNotification('Gagal memuat data kelas', 'error')
    }
  }

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
        if (selectedSemester === '1') {
          startDate = `${selectedYear}-01-01`
          endDate = `${selectedYear}-06-30`
          period = `Semester 1 ${selectedYear}`
        } else {
          startDate = `${selectedYear}-07-01`
          endDate = `${selectedYear}-12-31`
          period = `Semester 2 ${selectedYear}`
        }
      } else if (reportType === 'yearly') {
        startDate = `${selectedYear}-01-01`
        endDate = `${selectedYear}-12-31`
        period = `Tahun ${selectedYear}`
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

      // Group by materi_pokok
      const materiMap = new Map()

      filteredRecords.forEach((journal) => {
        const materi = journal.materi_pokok || 'Tidak ada materi pokok'

        if (!materiMap.has(materi)) {
          materiMap.set(materi, {
            materi_pokok: materi,
            totalSessions: 0,
            metode: new Set(),
          })
        }

        const materiData = materiMap.get(materi)
        materiData.totalSessions++
        if (journal.metode_pembelajaran) {
          materiData.metode.add(journal.metode_pembelajaran)
        }
      })

      // Convert Set to Array for metode
      const reportArray = Array.from(materiMap.values()).map(item => ({
        ...item,
        metode: Array.from(item.metode)
      }))

      // Calculate summary
      const totalJournals = filteredRecords.length
      const totalMateri = reportArray.length
      const uniqueDates = new Set(filteredRecords.map(j => j.tanggal)).size
      const totalHadir = filteredRecords.reduce((sum, j) => sum + (j.jumlah_hadir || 0), 0)
      const totalSakit = filteredRecords.reduce((sum, j) => sum + (j.jumlah_sakit || 0), 0)
      const totalIzin = filteredRecords.reduce((sum, j) => sum + (j.jumlah_izin || 0), 0)
      const totalAlpha = filteredRecords.reduce((sum, j) => sum + (j.jumlah_alpha || 0), 0)

      const summaryData = {
        totalJournals,
        totalMateri,
        uniqueDates,
        avgSessionsPerMateri: totalMateri > 0 ? (totalJournals / totalMateri).toFixed(1) : 0,
        totalHadir,
        totalSakit,
        totalIzin,
        totalAlpha,
      }

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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Rekap Jurnal Mengajar</h1>
        <p className="text-gray-600 mt-2">Laporan rekap jurnal mengajar per periode</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas *</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - Kelas {cls.grade}
                </option>
              ))}
            </select>
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
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">Semester 1 (Jan-Jun)</option>
                  <option value="2">Semester 2 (Jul-Des)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun *</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  min="2000"
                  max="2100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {reportType === 'yearly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun *</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                min="2000"
                max="2100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

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
                <p className="text-sm text-gray-600">Total Kehadiran</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalHadir}</p>
              </div>
              <i className="fas fa-user-check text-3xl text-orange-500"></i>
            </div>
          </div>
        </div>
      )}

      {/* Additional Summary Stats */}
      {summary && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rekapitulasi Kehadiran</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Hadir</p>
              <p className="text-2xl font-bold text-green-600">{summary.totalHadir}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sakit</p>
              <p className="text-2xl font-bold text-blue-600">{summary.totalSakit}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Izin</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.totalIzin}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Alpha</p>
              <p className="text-2xl font-bold text-red-600">{summary.totalAlpha}</p>
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
                    Materi Pokok
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Pertemuan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metode Pembelajaran
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
                      {item.materi_pokok}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {item.totalSessions}x
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.metode.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.metode.map((metode, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                              {metode}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
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
