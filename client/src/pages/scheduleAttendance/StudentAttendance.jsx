import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import useStudentAttendance from '../../hooks/useStudentAttendance'
import { useAcademicYear } from '../../context/AcademicYearContext'
import ImportModal from '../../components/ImportModal'
import { api } from '../../lib/api'
import { exportAttendanceToExcel, exportAttendanceToPDF, printAttendance } from '../../utils/exportAttendance'

export const StudentAttendance = () => {
  const location = useLocation()
  const { showNotification } = useNotification()
  const { availableYears, currentAcademicYear } = useAcademicYear()
  const {
    attendance,
    loading,
    error,
    ATTENDANCE_STATUS,
    loadAttendanceByDate,
    bulkSaveAttendance,
    getClassStatistics,
    // Class management
    loadClasses: loadClassesHook,
    createClass,
    updateClass,
    deleteClass,
    // Student management
    loadStudentsByClass,
    createStudent,
    updateStudent,
    deleteStudent,
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

  // Class management modal states
  const [showClassModal, setShowClassModal] = useState(false)
  const [classFormData, setClassFormData] = useState({
    name: '',
    grade: 1,
    academic_year: '',
    total_students: 0,
    wali_kelas: '',
    ruang_kelas: '',
  })
  const [editingClassId, setEditingClassId] = useState(null)

  // Student management modal states
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [studentFormData, setStudentFormData] = useState({
    class_id: '',
    name: '',
    nis: '',
    gender: '',
  })
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [studentModalClassId, setStudentModalClassId] = useState('')

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false)
  const [studentsList, setStudentsList] = useState([])

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

  // Class management functions
  const handleOpenClassModal = (classData = null) => {
    if (classData) {
      setEditingClassId(classData.id)
      setClassFormData({
        name: classData.name || '',
        grade: classData.grade || 1,
        academic_year: classData.academic_year || '',
        total_students: classData.total_students || 0,
        wali_kelas: classData.wali_kelas || '',
        ruang_kelas: classData.ruang_kelas || '',
      })
    } else {
      setEditingClassId(null)
      // TP default = tahun ajaran yang sedang berjalan (mulai Juli, bukan tahun kalender)
      setClassFormData({
        name: '',
        grade: 1,
        academic_year: currentAcademicYear,
        total_students: 0,
        wali_kelas: '',
        ruang_kelas: '',
      })
    }
    setShowClassModal(true)
  }

  const handleSaveClass = async () => {
    try {
      if (!classFormData.name || !classFormData.grade) {
        showNotification('Nama kelas dan tingkat kelas harus diisi', 'error')
        return
      }

      if (editingClassId) {
        await updateClass(editingClassId, classFormData)
        showNotification('Kelas berhasil diperbarui', 'success')
      } else {
        await createClass(classFormData)
        showNotification('Kelas berhasil ditambahkan', 'success')
      }

      setShowClassModal(false)
      loadClasses()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan kelas', 'error')
    }
  }

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      return
    }

    try {
      await deleteClass(classId)
      showNotification('Kelas berhasil dihapus', 'success')
      loadClasses()
      if (selectedClass === classId) {
        setSelectedClass('')
      }
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus kelas', 'error')
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

  // Student management functions
  const handleOpenStudentModal = async (studentData = null) => {
    if (studentData) {
      setEditingStudentId(studentData.id)
      setStudentFormData({
        class_id: studentData.class_id,
        name: studentData.name,
        nis: studentData.nis || '',
        gender: studentData.gender || '',
      })
      setStudentModalClassId(studentData.class_id)
    } else {
      setEditingStudentId(null)
      setStudentFormData({
        class_id: classes.length > 0 ? classes[0].id : '',
        name: '',
        nis: '',
        gender: '',
      })
      setStudentModalClassId(classes.length > 0 ? classes[0].id : '')
    }
    setShowStudentModal(true)

    // Load students for the modal
    if (classes.length > 0) {
      const classId = studentData ? studentData.class_id : classes[0].id
      const studentsData = await loadStudentsByClass(classId)
      setStudentsList(studentsData || [])
    }
  }

  const handleStudentModalClassChange = async (classId) => {
    setStudentModalClassId(classId)
    const studentsData = await loadStudentsByClass(classId)
    setStudentsList(studentsData || [])
  }

  const handleSaveStudent = async () => {
    try {
      if (!studentFormData.class_id || !studentFormData.name || !studentFormData.gender) {
        showNotification('Kelas, nama, dan jenis kelamin wajib diisi', 'error')
        return
      }

      if (editingStudentId) {
        await updateStudent(editingStudentId, studentFormData)
        showNotification('Siswa berhasil diperbarui', 'success')
      } else {
        await createStudent(studentFormData)
        showNotification('Siswa berhasil ditambahkan', 'success')
      }

      setShowStudentModal(false)

      // Reload students if current class is affected
      if (selectedClass === studentFormData.class_id || selectedClass === studentModalClassId) {
        loadStudents(selectedClass)
      }

      // Reload student list in modal
      const studentsData = await loadStudentsByClass(studentModalClassId)
      setStudentsList(studentsData || [])
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan siswa', 'error')
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      return
    }

    try {
      await deleteStudent(studentId)
      showNotification('Siswa berhasil dihapus', 'success')

      // Reload students
      if (selectedClass) {
        loadStudents(selectedClass)
      }

      // Reload student list in modal
      if (studentModalClassId) {
        const studentsData = await loadStudentsByClass(studentModalClassId)
        setStudentsList(studentsData || [])
      }
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus siswa', 'error')
    }
  }

  // Import students handler
  const handleImportStudents = async (data) => {
    try {
      if (!userId) {
        showNotification('User tidak ditemukan. Silakan login ulang.', 'error')
        return
      }

      let successCount = 0
      let errorCount = 0
      const errors = []

      for (const row of data) {
        try {
          // Helper function to get value case-insensitively
          const getValue = (key) => {
            const found = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase())
            return found ? row[found] : undefined
          }

          // Find class by name (e.g., "1", "2", or "1A", "2B")
          const className = getValue('kelas')
          const targetClass = classes.find(cls => cls.name === className || cls.grade.toString() === className)

          if (!targetClass) {
            errors.push(`Kelas "${className}" tidak ditemukan untuk siswa ${getValue('nama')}`)
            errorCount++
            continue
          }

          // Get jenis_kelamin and normalize it
          let jenisKelamin = getValue('jenis kelamin') || getValue('jenis_kelamin')
          if (jenisKelamin) {
            jenisKelamin = jenisKelamin.toUpperCase()
            if (jenisKelamin === 'L' || jenisKelamin === 'LAKI-LAKI' || jenisKelamin === 'LAKI') {
              jenisKelamin = 'Laki-laki'
            } else if (jenisKelamin === 'P' || jenisKelamin === 'PEREMPUAN') {
              jenisKelamin = 'Perempuan'
            }
          }

          let gender = ''
          if (jenisKelamin === 'Laki-laki' || jenisKelamin === 'L') gender = 'L'
          if (jenisKelamin === 'Perempuan' || jenisKelamin === 'P') gender = 'P'
          if (!gender) {
            errors.push(`Jenis kelamin tidak valid untuk siswa ${getValue('nama')}`)
            errorCount++
            continue
          }

          await createStudent({
            class_id: targetClass.id,
            name: getValue('nama'),
            nis: getValue('nis') || null,
            gender,
          })
          successCount++
        } catch (err) {
          console.error('Error importing row:', row, err)
          const nama = Object.keys(row).find(k => k.toLowerCase() === 'nama')
          errors.push(`Error untuk ${nama ? row[nama] : 'siswa'}: ${err.message}`)
          errorCount++
        }
      }

      // Show detailed notification
      if (errorCount > 0) {
        showNotification(
          `Import selesai! Berhasil: ${successCount}, Gagal: ${errorCount}\n${errors.slice(0, 3).join('\n')}`,
          'warning'
        )
      } else {
        showNotification(
          `Import berhasil! ${successCount} siswa ditambahkan.`,
          'success'
        )
      }

      // Reload students if a class is selected
      if (selectedClass) {
        loadStudents(selectedClass)
      }
    } catch (error) {
      showNotification('Error: ' + error.message, 'error')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buku Absensi Siswa</h1>
          <p className="text-gray-600 mt-2">Kelola absensi siswa harian</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenClassModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-school mr-2"></i>
            Kelola Kelas
          </button>
          <button
            onClick={() => handleOpenStudentModal()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <i className="fas fa-users mr-2"></i>
            Kelola Siswa
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <i className="fas fa-chart-bar mr-2"></i>
            Statistik
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <i className="fas fa-upload mr-2"></i>
            Import Siswa
          </button>
        </div>
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
                  <td className="px-4 py-3 text-gray-700">{student.name}</td>
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

      {/* Class Management Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full mx-4 my-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Kelola Kelas
            </h3>

            {/* Class Form */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {editingClassId ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Kelas *
                  </label>
                  <input
                    type="text"
                    value={classFormData.name ?? ''}
                    onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: 1A, 2B"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tingkat Kelas *
                  </label>
                  <select
                    value={classFormData.grade ?? 1}
                    onChange={(e) => setClassFormData({ ...classFormData, grade: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((level) => (
                      <option key={level} value={level}>
                        Kelas {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun Ajaran
                  </label>
                  <select
                    value={classFormData.academic_year ?? ''}
                    onChange={(e) => setClassFormData({ ...classFormData, academic_year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Tahun Ajaran</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        TP {year}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Menentukan TP mana data kelas ini tampil di Dashboard dan Rekap
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wali Kelas
                  </label>
                  <input
                    type="text"
                    value={classFormData.wali_kelas ?? ''}
                    onChange={(e) => setClassFormData({ ...classFormData, wali_kelas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama Wali Kelas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruang Kelas
                  </label>
                  <input
                    type="text"
                    value={classFormData.ruang_kelas ?? ''}
                    onChange={(e) => setClassFormData({ ...classFormData, ruang_kelas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: R101"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveClass}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-save mr-2"></i>
                {editingClassId ? 'Update Kelas' : 'Tambah Kelas'}
              </button>
            </div>

            {/* Class List */}
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nama Kelas</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tingkat</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tahun Ajaran</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr key={cls.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{cls.name}</td>
                      <td className="px-4 py-3">Kelas {cls.grade}</td>
                      <td className="px-4 py-3">{cls.academic_year || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleOpenClassModal(cls)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors mr-2"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowClassModal(false)
                  setEditingClassId(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Management Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full mx-4 my-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Kelola Siswa
            </h3>

            {/* Class Selection for Student Modal */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Kelas untuk Melihat Siswa
              </label>
              <select
                value={studentModalClassId}
                onChange={(e) => handleStudentModalClassChange(e.target.value)}
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

            {/* Student Form */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {editingStudentId ? 'Edit Siswa' : 'Tambah Siswa Baru'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelas *
                  </label>
                  <select
                    value={studentFormData.class_id}
                    onChange={(e) => setStudentFormData({ ...studentFormData, class_id: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Induk
                  </label>
                  <input
                    type="text"
                    value={studentFormData.nis}
                    onChange={(e) => setStudentFormData({ ...studentFormData, nis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={studentFormData.name}
                    onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama Siswa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={studentFormData.gender}
                    onChange={(e) => setStudentFormData({ ...studentFormData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSaveStudent}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <i className="fas fa-save mr-2"></i>
                {editingStudentId ? 'Update Siswa' : 'Tambah Siswa'}
              </button>
            </div>

            {/* Student List */}
            {studentModalClassId && (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">No. Induk</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nama Siswa</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{student.nis || '-'}</td>
                        <td className="px-4 py-3">{student.name}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleOpenStudentModal(student)}
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors mr-2"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowStudentModal(false)
                  setEditingStudentId(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportStudents}
        type="students"
      />
    </div>
  )
}

export default StudentAttendance


