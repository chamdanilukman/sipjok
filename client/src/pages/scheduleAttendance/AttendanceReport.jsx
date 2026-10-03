import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useStudentAttendance from '../../hooks/useStudentAttendance'
import { api } from '../../lib/api'
import { exportAttendanceReportToExcel, exportAttendanceReportToPDF } from '../../utils/exportAttendance'

export const AttendanceReport = () => {
  const { showNotification } = useNotification()
  const {
    loading,
    error,
    loadAttendanceByDateRange,
    loadClasses: loadClassesHook,
  } = useStudentAttendance()

  const [userId, setUserId] = useState(null)
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [reportType, setReportType] = useState('monthly') // monthly, semester, yearly
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('1')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [reportData, setReportData] = useState([])
  const [summary, setSummary] = useState(null)

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          loadClasses()
        }
      } catch (err) {
        console.error('Error getting current user:', err)
      }
    }
    getCurrentUser()
  }, [])

  // Initialize current month
  useEffect(() => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    setSelectedMonth(`${now.getFullYear()}-${month}`)
  }, [])

  const loadClasses = async () => {
    try {
      const data = await loadClassesHook()
      setClasses(data || [])
      if (data && data.length > 0) {
        setSelectedClass(data[0].id)
      }
    } catch (err) {
      showNotification('Gagal memuat data kelas', 'error')
    }
  }

  const generateReport = async () => {
    if (!selectedClass) {
      showNotification('Pilih kelas terlebih dahulu', 'error')
      return
    }

    try {
      let startDate, endDate

      if (reportType === 'monthly') {
        // Monthly: e.g., 2025-11 → 2025-11-01 to 2025-11-30
        const [year, month] = selectedMonth.split('-')
        const lastDay = new Date(year, month, 0).getDate()
        startDate = `${year}-${month}-01`
        endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`
      } else if (reportType === 'semester') {
        // Semester 1: Jan-Jun, Semester 2: Jul-Dec
        if (selectedSemester === '1') {
          startDate = `${selectedYear}-01-01`
          endDate = `${selectedYear}-06-30`
        } else {
          startDate = `${selectedYear}-07-01`
          endDate = `${selectedYear}-12-31`
        }
      } else if (reportType === 'yearly') {
        // Yearly: Jan 1 to Dec 31
        startDate = `${selectedYear}-01-01`
        endDate = `${selectedYear}-12-31`
      }

      // Load attendance data for date range
      const attendanceRecords = await loadAttendanceByDateRange(selectedClass, startDate, endDate)

      // Group by student
      const studentMap = new Map()

      attendanceRecords.forEach((record) => {
        const studentId = record.student_id
        const studentName = record.students?.name || 'Unknown'
        const studentNis = record.students?.nis || '-'

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: studentId,
            name: studentName,
            nis: studentNis,
            hadir: 0,
            sakit: 0,
            izin: 0,
            alpha: 0,
            total: 0,
          })
        }

        const studentData = studentMap.get(studentId)
        studentData.total++

        if (record.status === 'hadir') studentData.hadir++
        else if (record.status === 'sakit') studentData.sakit++
        else if (record.status === 'izin') studentData.izin++
        else if (record.status === 'alpha') studentData.alpha++
      })

      const reportArray = Array.from(studentMap.values())

      // Calculate percentages
      reportArray.forEach((student) => {
        student.hadirPercent = student.total > 0
          ? Math.round((student.hadir / student.total) * 100)
          : 0
        student.absenPercent = student.total > 0
          ? Math.round(((student.sakit + student.izin + student.alpha) / student.total) * 100)
          : 0
      })

      // Sort by name
      reportArray.sort((a, b) => a.name.localeCompare(b.name))

      setReportData(reportArray)

      // Calculate summary
      const totalRecords = attendanceRecords.length
      const totalHadir = attendanceRecords.filter(r => r.status === 'hadir').length
      const totalSakit = attendanceRecords.filter(r => r.status === 'sakit').length
      const totalIzin = attendanceRecords.filter(r => r.status === 'izin').length
      const totalAlpha = attendanceRecords.filter(r => r.status === 'alpha').length

      setSummary({
        totalRecords,
        totalHadir,
        totalSakit,
        totalIzin,
        totalAlpha,
        totalStudents: reportArray.length,
        avgPresent: totalRecords > 0 ? Math.round((totalHadir / totalRecords) * 100) : 0,
      })

      showNotification('Rekap berhasil dibuat', 'success')
    } catch (err) {
      console.error('Error generating report:', err)
      showNotification(err.message || 'Gagal membuat rekap', 'error')
    }
  }

  const handleExport = (format) => {
    if (reportData.length === 0) {
      showNotification('Tidak ada data untuk diexport', 'error')
      return
    }

    const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown'

    let periodLabel = ''
    if (reportType === 'monthly') {
      const [year, month] = selectedMonth.split('-')
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      periodLabel = `${monthNames[parseInt(month) - 1]} ${year}`
    } else if (reportType === 'semester') {
      periodLabel = `Semester ${selectedSemester} - ${selectedYear}`
    } else {
      periodLabel = `Tahun ${selectedYear}`
    }

    if (format === 'excel') {
      exportAttendanceReportToExcel(reportData, className, periodLabel, summary)
      showNotification('Rekap berhasil diexport ke Excel', 'success')
    } else if (format === 'pdf') {
      exportAttendanceReportToPDF(reportData, className, periodLabel, summary)
      showNotification('Rekap berhasil diexport ke PDF', 'success')
    }
  }

  const getReportTypeLabel = () => {
    if (reportType === 'monthly') return 'Bulanan'
    if (reportType === 'semester') return 'Semester'
    return 'Tahunan'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekap Absensi</h1>
          <p className="text-gray-600">Rekap kehadiran siswa per periode</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
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

          {/* Month Selection (for monthly) */}
          {reportType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Semester Selection (for semester) */}
          {reportType === 'semester' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
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

          {/* Year Selection (for yearly) */}
          {reportType === 'yearly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
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
              disabled={loading || !selectedClass}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <i className="fas fa-chart-bar mr-2"></i>
              {loading ? 'Memuat...' : 'Buat Rekap'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ringkasan - {getReportTypeLabel()}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Siswa</p>
              <p className="text-2xl font-bold text-blue-900">{summary.totalStudents}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Total Catatan</p>
              <p className="text-2xl font-bold text-purple-900">{summary.totalRecords}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Hadir</p>
              <p className="text-2xl font-bold text-green-900">{summary.totalHadir}</p>
              <p className="text-xs text-green-600">{summary.avgPresent}%</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600 font-medium">Sakit</p>
              <p className="text-2xl font-bold text-yellow-900">{summary.totalSakit}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Izin</p>
              <p className="text-2xl font-bold text-blue-900">{summary.totalIzin}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium">Alpha</p>
              <p className="text-2xl font-bold text-red-900">{summary.totalAlpha}</p>
            </div>
          </div>
        </div>
      )}

      {/* Report Table */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Rekap Per Siswa</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('excel')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <i className="fas fa-file-excel mr-2"></i>
                Export Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <i className="fas fa-file-pdf mr-2"></i>
                Export PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sakit</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Izin</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Alpha</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% Hadir</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{student.nis}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{student.total}</td>
                    <td className="px-4 py-3 text-sm text-center text-green-600">{student.hadir}</td>
                    <td className="px-4 py-3 text-sm text-center text-yellow-600">{student.sakit}</td>
                    <td className="px-4 py-3 text-sm text-center text-blue-600">{student.izin}</td>
                    <td className="px-4 py-3 text-sm text-center text-red-600">{student.alpha}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.hadirPercent >= 90 ? 'bg-green-100 text-green-800' :
                        student.hadirPercent >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.hadirPercent}%
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
      {reportData.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-chart-bar text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Rekap</h3>
          <p className="text-gray-500">Pilih kelas dan periode, lalu klik "Buat Rekap" untuk menampilkan data</p>
        </div>
      )}
    </div>
  )
}

export default AttendanceReport
