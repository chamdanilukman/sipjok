import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import useStudentAttendance from '../../hooks/useStudentAttendance'
import { formatNama } from '../../utils/formatNama'
import { api } from '../../lib/api'
import { exportAttendanceToExcel, exportAttendanceToPDF, printAttendance } from '../../utils/exportAttendance'

export const StudentAttendance = () => {
  const location = useLocation()
  const { showNotification } = useNotification()
  const {
    attendance,
    loading,
    error,
    ATTENDANCE_STATUS,
    loadAttendanceByDate,
    bulkSaveAttendance,
    getClassStatistics,
    // Kelas & siswa hanya dibaca untuk daftar absensi;
    // pengelolaan pindah ke menu Data Siswa & Kelas (/data-kelas, /data-siswa)
    loadClasses: loadClassesHook,
    loadStudentsByClass,
  } = useStudentAttendance()

  const [userId, setUserId] = useState(null)
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  // Use local date format to avoid timezone issues
  const getLocalDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const [attendanceDate, setAttendanceDate] = useState(getLocalDateString())
  const [attendanceData, setAttendanceData] = useState({})
  const [notesData, setNotesData] = useState({})
  const [showStats, setShowStats] = useState(false)

  // Get current user and load data
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

  // Load students when class changes
  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass)
      loadAttendanceByDate(selectedClass, attendanceDate)
    }
  }, [selectedClass, attendanceDate, loadAttendanceByDate])

  // Update attendance data when attendance records change
  useEffect(() => {
    if (students.length > 0 && attendance.length > 0) {
      const initData = {}
      const initNotes = {}
      students.forEach((student) => {
        const existing = attendance.find((a) => a.student_id === student.id)
        initData[student.id] = existing?.status || 'hadir'
        initNotes[student.id] = existing?.notes || ''
      })
      setAttendanceData(initData)
      setNotesData(initNotes)
    }
  }, [attendance, students])

  // Handle navigation from teaching journal
  useEffect(() => {
    if (location.state?.fromJournal) {
      const { classId, date } = location.state
      if (classId) {
        setSelectedClass(classId)
      }
      if (date) {
        setAttendanceDate(date)
      }
      // Show notification
      if (location.state.autoFocus) {
        showNotification('Silakan isi absensi untuk jurnal mengajar ini', 'info')
      }
    }
  }, [location.state])

  const loadClasses = async () => {
    try {
      const data = await loadClassesHook()
      setClasses(data || [])
      if (data && data.length > 0 && !selectedClass) {
        setSelectedClass(data[0].id)
      }
    } catch (err) {
      console.error('Error loading classes:', err)
      showNotification('Gagal memuat data kelas', 'error')
    }
  }

  const loadStudents = async (classId) => {
    try {
      const data = await loadStudentsByClass(classId)
      setStudents(data || [])

      // Initialize attendance data
      const initData = {}
      const initNotes = {}
      data.forEach((student) => {
        const existing = attendance.find((a) => a.student_id === student.id)
        initData[student.id] = existing?.status || 'hadir'
        initNotes[student.id] = existing?.notes || ''
      })
      setAttendanceData(initData)
      setNotesData(initNotes)
    } catch (err) {
      console.error('Error loading students:', err)
      showNotification('Gagal memuat data siswa', 'error')
    }
  }

  const handleMarkAll = (status) => {
    const newData = {}
    students.forEach((student) => {
      newData[student.id] = status
    })
    setAttendanceData(newData)
    showNotification(`Semua siswa ditandai sebagai ${ATTENDANCE_STATUS[status].label}`, 'success')
  }

  // Export/Print handlers
  const handleExportExcel = () => {
    if (!selectedClass || students.length === 0) {
      showNotification('Tidak ada data untuk diexport', 'error')
      return
    }

    const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown'
    const attendanceRecords = students.map(student => ({
      student,
      status: attendanceData[student.id] || 'alpha',
      keterangan: notesData[student.id] || '',
    }))

    exportAttendanceToExcel(attendanceRecords, className, attendanceDate)
    showNotification('Data berhasil diexport ke Excel', 'success')
  }

  const handleExportPDF = () => {
    if (!selectedClass || students.length === 0) {
      showNotification('Tidak ada data untuk diexport', 'error')
      return
    }

    const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown'
    const attendanceRecords = students.map(student => ({
      student,
      status: attendanceData[student.id] || 'alpha',
      keterangan: notesData[student.id] || '',
    }))

    exportAttendanceToPDF(attendanceRecords, className, attendanceDate)
    showNotification('Data berhasil diexport ke PDF', 'success')
  }

  const handlePrint = () => {
    if (!selectedClass || students.length === 0) {
      showNotification('Tidak ada data untuk diprint', 'error')
      return
    }

    const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown'
    const attendanceRecords = students.map(student => ({
      student,
      status: attendanceData[student.id] || 'alpha',
      keterangan: notesData[student.id] || '',
    }))

    printAttendance(attendanceRecords, className, attendanceDate)
  }

  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      showNotification('Pilih kelas terlebih dahulu', 'error')
      return
    }

    try {
      const data = students.map((student) => ({
        student_id: student.id,
        status: attendanceData[student.id] || 'hadir',
        notes: notesData[student.id] || '',
      }))

      await bulkSaveAttendance(userId, selectedClass, attendanceDate, data)
      showNotification('Absensi berhasil disimpan', 'success')
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan absensi', 'error')
    }
  }

  const classStats = getClassStatistics(attendance)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buku Absensi Siswa</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Isi absensi harian per kelas</p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="min-h-[44px] px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-[0.98] transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <i className="fas fa-chart-bar mr-2"></i>
          Statistik
        </button>
      </div>

      {/* Pengelolaan kelas & siswa kini menu terpisah */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-900 flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="flex-1">
          <i className="fas fa-circle-info mr-2 text-blue-600"></i>
          Menambah/mengedit kelas atau siswa, termasuk import Excel, kini ada di menu khusus.
        </span>
        <span className="flex gap-2">
          <Link
            to="/data-kelas"
            className="min-h-[44px] inline-flex items-center px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-100 font-medium"
          >
            <i className="fas fa-school mr-1.5"></i>Data Kelas
          </Link>
          <Link
            to="/data-siswa"
            className="min-h-[44px] inline-flex items-center px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-100 font-medium"
          >
            <i className="fas fa-user-graduate mr-1.5"></i>Data Siswa
          </Link>
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => handleMarkAll('hadir')}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <i className="fas fa-check mr-1"></i>
              Semua Hadir
            </button>
            <button
              onClick={() => handleMarkAll('alpha')}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <i className="fas fa-times mr-1"></i>
              Semua Alpha
            </button>
          </div>
        </div>

        {/* Export/Print Buttons */}
        {selectedClass && students.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
            >
              <i className="fas fa-file-excel"></i>
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
            >
              <i className="fas fa-file-pdf"></i>
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
            >
              <i className="fas fa-print"></i>
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        )}
      </div>


      {/* Statistics */}
      {showStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Absensi</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Hadir</p>
              <p className="text-2xl font-bold text-green-600">{classStats.avgPresent}%</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Absen</p>
              <p className="text-2xl font-bold text-red-600">{classStats.avgAbsent}%</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Siswa</p>
              <p className="text-2xl font-bold text-blue-600">{classStats.totalStudents}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Catatan</p>
              <p className="text-2xl font-bold text-purple-600">{classStats.totalRecords}</p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Memuat data absensi...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Siswa</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{formatNama(student.name)}</td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={attendanceData[student.id] || 'hadir'}
                      onChange={(e) =>
                        setAttendanceData({
                          ...attendanceData,
                          [student.id]: e.target.value,
                        })
                      }
                      className={`px-2 py-1 rounded text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-${
                        ATTENDANCE_STATUS[attendanceData[student.id] || 'hadir'].color
                      }-100 text-${
                        ATTENDANCE_STATUS[attendanceData[student.id] || 'hadir'].color
                      }-800`}
                    >
                      {Object.entries(ATTENDANCE_STATUS).map(([key, status]) => (
                        <option key={key} value={key}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={notesData[student.id] ?? ''}
                      onChange={(e) =>
                        setNotesData({
                          ...notesData,
                          [student.id]: e.target.value,
                        })
                      }
                      placeholder="Catatan (opsional)"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Action Buttons */}
      {students.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={handleSaveAttendance}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-save mr-2"></i>
            Simpan Absensi
          </button>
        </div>
      )}

    </div>
  )
}

export default StudentAttendance
