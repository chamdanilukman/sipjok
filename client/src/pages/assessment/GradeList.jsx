import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useGrades from '../../hooks/useGrades'
import useClasses from '../../hooks/useClasses'
import useStudents from '../../hooks/useStudents'
import useKKTP from '../../hooks/useKKTP'
import { api } from '../../lib/api'
import { exportGradesToExcel, exportGradesToPDF, printGrades } from '../../utils/exportGrades'

export const GradeList = () => {
  const { showNotification } = useNotification()
  const {
    grades,
    loading: gradesLoading,
    loadGrades,
    loadGradesByClass,
    createGrade,
    bulkCreateGrades,
    updateGrade,
    deleteGrade,
    getClassStatistics,
  } = useGrades()

  const { classes, loadClasses } = useClasses()
  const { students, loadStudentsByClass } = useStudents()
  const { kktpList, loadKKTP } = useKKTP()

  const [userId, setUserId] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editingGrade, setEditingGrade] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [filterAssessmentType, setFilterAssessmentType] = useState('')

  const [formData, setFormData] = useState({
    student_id: '',
    class_id: '',
    subject: 'PJOK',
    assessment_type: 'daily_test',
    assessment_title: '',
    assessment_date: new Date().toISOString().split('T')[0],
    score: '',
    max_score: 100,
    kktp_id: '',
    notes: '',
  })

  const [bulkFormData, setBulkFormData] = useState({
    class_id: '',
    subject: 'PJOK',
    assessment_type: 'daily_test',
    assessment_title: '',
    assessment_date: new Date().toISOString().split('T')[0],
    max_score: 100,
    kktp_id: '',
    student_scores: [],
  })

  // Get current user and load data
  useEffect(() => {
    const getCurrentUser = async () => {
      const user = await api.get('/auth/me')
      if (user) {
        setUserId(user.id)
        loadGrades(user.id)
        loadClasses(user.id)
        loadKKTP(user.id)
      }
    }
    getCurrentUser()
  }, [loadGrades, loadClasses, loadKKTP])

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass && userId) {
      loadStudentsByClass(selectedClass)
      loadGradesByClass(userId, selectedClass)
    }
  }, [selectedClass, userId, loadStudentsByClass, loadGradesByClass])

  // Load students for bulk input
  useEffect(() => {
    if (bulkFormData.class_id) {
      loadStudentsByClass(bulkFormData.class_id)
    }
  }, [bulkFormData.class_id, loadStudentsByClass])

  // Initialize student scores for bulk input
  useEffect(() => {
    if (students.length > 0 && showBulkModal) {
      setBulkFormData((prev) => ({
        ...prev,
        student_scores: students.map((student) => ({
          student_id: student.id,
          student_name: student.name,
          score: '',
        })),
      }))
    }
  }, [students, showBulkModal])

  const handleOpenModal = (grade = null) => {
    if (grade) {
      setEditingGrade(grade)
      setFormData({
        student_id: grade.student_id,
        class_id: grade.class_id,
        subject: grade.subject,
        assessment_type: grade.assessment_type,
        assessment_title: grade.assessment_title,
        assessment_date: grade.assessment_date,
        score: grade.score,
        max_score: grade.max_score,
        kktp_id: grade.kktp_id || '',
        notes: grade.notes || '',
      })
    } else {
      setEditingGrade(null)
      setFormData({
        student_id: '',
        class_id: selectedClass || '',
        subject: 'PJOK',
        assessment_type: 'daily_test',
        assessment_title: '',
        assessment_date: new Date().toISOString().split('T')[0],
        score: '',
        max_score: 100,
        kktp_id: '',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingGrade(null)
  }

  const handleOpenBulkModal = () => {
    setBulkFormData({
      class_id: selectedClass || '',
      subject: 'PJOK',
      assessment_type: 'daily_test',
      assessment_title: '',
      assessment_date: new Date().toISOString().split('T')[0],
      max_score: 100,
      kktp_id: '',
      student_scores: [],
    })
    setShowBulkModal(true)
  }

  const handleCloseBulkModal = () => {
    setShowBulkModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.student_id || !formData.class_id || !formData.score) {
      showNotification('Semua field harus diisi', 'error')
      return
    }

    try {
      if (editingGrade) {
        await updateGrade(editingGrade.id, formData)
        showNotification('Nilai berhasil diperbarui', 'success')
      } else {
        await createGrade(userId, formData)
        showNotification('Nilai berhasil ditambahkan', 'success')
      }
      handleCloseModal()
      if (selectedClass) {
        loadGradesByClass(userId, selectedClass)
      }
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan nilai', 'error')
    }
  }

  const handleBulkSubmit = async (e) => {
    e.preventDefault()

    if (!bulkFormData.class_id || !bulkFormData.assessment_title) {
      showNotification('Kelas dan judul penilaian harus diisi', 'error')
      return
    }

    const validScores = bulkFormData.student_scores.filter(
      (s) => s.score !== '' && s.score !== null
    )

    if (validScores.length === 0) {
      showNotification('Minimal satu siswa harus memiliki nilai', 'error')
      return
    }

    try {
      const gradesData = validScores.map((studentScore) => ({
        student_id: studentScore.student_id,
        class_id: bulkFormData.class_id,
        subject: bulkFormData.subject,
        assessment_type: bulkFormData.assessment_type,
        assessment_title: bulkFormData.assessment_title,
        assessment_date: bulkFormData.assessment_date,
        score: parseFloat(studentScore.score),
        max_score: bulkFormData.max_score,
        kktp_id: bulkFormData.kktp_id || null,
      }))

      await bulkCreateGrades(userId, gradesData)
      showNotification(
        `Berhasil menambahkan ${validScores.length} nilai`,
        'success'
      )
      handleCloseBulkModal()
      if (selectedClass) {
        loadGradesByClass(userId, selectedClass)
      }
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan nilai', 'error')
    }
  }

  const handleDelete = async (gradeId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus nilai ini?')) {
      return
    }

    try {
      await deleteGrade(gradeId)
      showNotification('Nilai berhasil dihapus', 'success')
      if (selectedClass) {
        loadGradesByClass(userId, selectedClass)
      }
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus nilai', 'error')
    }
  }

  const handleBulkScoreChange = (studentId, score) => {
    setBulkFormData((prev) => ({
      ...prev,
      student_scores: prev.student_scores.map((s) =>
        s.student_id === studentId ? { ...s, score } : s
      ),
    }))
  }

  // Export/Print handlers
  const handleExportExcel = () => {
    if (!selectedClass || filteredGrades.length === 0) {
      showNotification('Tidak ada data untuk diexport', 'error')
      return
    }

    const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown'
    const semester = '1' // You can add semester selector if needed

    exportGradesToExcel(filteredGrades, className, semester)
    showNotification('Data berhasil diexport ke Excel', 'success')
  }

  const handleExportPDF = () => {
    if (!selectedClass || filteredGrades.length === 0) {
      showNotification('Tidak ada data untuk diexport', 'error')
      return
    }

    const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown'
    const semester = '1' // You can add semester selector if needed

    exportGradesToPDF(filteredGrades, className, semester)
    showNotification('Data berhasil diexport ke PDF', 'success')
  }

  const handlePrint = () => {
    if (!selectedClass || filteredGrades.length === 0) {
      showNotification('Tidak ada data untuk diprint', 'error')
      return
    }

    const className = classes.find(c => c.id === selectedClass)?.name || 'Unknown'
    const semester = '1' // You can add semester selector if needed

    printGrades(filteredGrades, className, semester)
  }

  const loadStatistics = async (classId, assessmentTitle) => {
    if (!userId || !classId || !assessmentTitle) return
    const stats = await getClassStatistics(userId, classId, assessmentTitle)
    setStatistics(stats)
  }

  const getAssessmentTypeLabel = (type) => {
    const types = {
      daily_test: 'Ulangan Harian',
      midterm: 'UTS',
      final: 'UAS',
      practical: 'Praktik',
      project: 'Proyek',
      attitude: 'Sikap',
    }
    return types[type] || type
  }

  const getAssessmentTypeColor = (type) => {
    const colors = {
      daily_test: 'bg-blue-100 text-blue-800',
      midterm: 'bg-purple-100 text-purple-800',
      final: 'bg-red-100 text-red-800',
      practical: 'bg-green-100 text-green-800',
      project: 'bg-yellow-100 text-yellow-800',
      attitude: 'bg-pink-100 text-pink-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const filteredGrades = filterAssessmentType
    ? grades.filter((g) => g.assessment_type === filterAssessmentType)
    : grades

  // Group grades by assessment
  const groupedGrades = filteredGrades.reduce((acc, grade) => {
    const key = `${grade.assessment_title}-${grade.assessment_date}`
    if (!acc[key]) {
      acc[key] = {
        title: grade.assessment_title,
        date: grade.assessment_date,
        type: grade.assessment_type,
        grades: [],
      }
    }
    acc[key].grades.push(grade)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Daftar Nilai</h1>
        <p className="text-gray-600 mt-2">
          Input dan kelola nilai siswa per kelas dengan integrasi penuh
        </p>
      </div>

      {/* Class Selector & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-3">
          <select
            value={selectedClass || ''}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Pilih Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} - Kelas {cls.grade}
              </option>
            ))}
          </select>

          {selectedClass && (
            <select
              value={filterAssessmentType}
              onChange={(e) => setFilterAssessmentType(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Semua Jenis Penilaian</option>
              <option value="daily_test">Ulangan Harian</option>
              <option value="midterm">UTS</option>
              <option value="final">UAS</option>
              <option value="practical">Praktik</option>
              <option value="project">Proyek</option>
              <option value="attitude">Sikap</option>
            </select>
          )}
        </div>

        {selectedClass && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleOpenBulkModal}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white shadow-sm hover:bg-green-700"
            >
              <i className="fas fa-users"></i>
              <span className="hidden sm:inline">Input Nilai Kelas</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
            >
              <i className="fas fa-plus"></i>
              <span className="hidden sm:inline">Tambah Nilai</span>
            </button>
            {filteredGrades.length > 0 && (
              <>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-700"
                >
                  <i className="fas fa-file-excel"></i>
                  <span className="hidden sm:inline">Export Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white shadow-sm hover:bg-red-700"
                >
                  <i className="fas fa-file-pdf"></i>
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white shadow-sm hover:bg-purple-700"
                >
                  <i className="fas fa-print"></i>
                  <span className="hidden sm:inline">Print</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {!selectedClass ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-chalkboard text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Pilih Kelas
          </h3>
          <p className="text-gray-600">
            Pilih kelas untuk melihat dan mengelola nilai siswa
          </p>
        </div>
      ) : gradesLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Memuat nilai...</p>
          </div>
        </div>
      ) : filteredGrades.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-list-ol text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum ada nilai
          </h3>
          <p className="text-gray-600 mb-6">
            Mulai dengan menambahkan nilai untuk kelas ini
          </p>
          <button
            onClick={handleOpenBulkModal}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <i className="fas fa-users"></i>
            Input Nilai Kelas
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grades by Assessment */}
          {Object.entries(groupedGrades).map(([key, assessment]) => (
            <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Assessment Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assessment.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-calendar"></i>
                        {new Date(assessment.date).toLocaleDateString('id-ID')}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getAssessmentTypeColor(
                          assessment.type
                        )}`}
                      >
                        {getAssessmentTypeLabel(assessment.type)}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-users"></i>
                        {assessment.grades.length} siswa
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      loadStatistics(selectedClass, assessment.title)
                    }
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <i className="fas fa-chart-bar mr-1"></i>
                    Lihat Statistik
                  </button>
                </div>
              </div>

              {/* Grades Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Nama Siswa
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        NIS
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Nilai
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Persentase
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assessment.grades.map((grade, index) => (
                      <tr key={grade.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {grade.student?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {grade.student?.nis || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900">
                          {grade.score} / {grade.max_score}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="font-semibold text-gray-900">
                            {grade.percentage?.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {grade.is_passed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <i className="fas fa-check"></i>
                              Tuntas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <i className="fas fa-times"></i>
                              Belum Tuntas
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenModal(grade)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(grade.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Hapus"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Statistics Modal */}
          {statistics && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Statistik Kelas
                  </h3>
                  <button
                    onClick={() => setStatistics(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 mb-1">Rata-rata</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {statistics.average}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">Tertinggi</p>
                    <p className="text-2xl font-bold text-green-900">
                      {statistics.highest}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-600 mb-1">Terendah</p>
                    <p className="text-2xl font-bold text-red-900">
                      {statistics.lowest}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Ketuntasan</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {statistics.passRate}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tuntas:</span>
                    <span className="font-semibold text-green-600">
                      {statistics.passed} siswa
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Belum Tuntas:</span>
                    <span className="font-semibold text-red-600">
                      {statistics.failed} siswa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Single Grade Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
            <form onSubmit={handleSubmit}>
              <div className="sticky top-0 bg-white border-b p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingGrade ? 'Edit Nilai' : 'Tambah Nilai'}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.class_id}
                      onChange={(e) => {
                        setFormData({ ...formData, class_id: e.target.value })
                        loadStudentsByClass(e.target.value)
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Siswa <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.student_id}
                      onChange={(e) =>
                        setFormData({ ...formData, student_id: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
                      disabled={!formData.class_id}
                    >
                      <option value="">Pilih Siswa</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} - {student.nis}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Penilaian
                    </label>
                    <select
                      value={formData.assessment_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assessment_type: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="daily_test">Ulangan Harian</option>
                      <option value="midterm">UTS</option>
                      <option value="final">UAS</option>
                      <option value="practical">Praktik</option>
                      <option value="project">Proyek</option>
                      <option value="attitude">Sikap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={formData.assessment_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assessment_date: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Penilaian <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.assessment_title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assessment_title: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Contoh: Ulangan Harian Bab 1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nilai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.score}
                      onChange={(e) =>
                        setFormData({ ...formData, score: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nilai Maksimal
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.max_score}
                      onChange={(e) =>
                        setFormData({ ...formData, max_score: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KKTP (Opsional)
                  </label>
                  <select
                    value={formData.kktp_id}
                    onChange={(e) =>
                      setFormData({ ...formData, kktp_id: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">Tidak menggunakan KKTP</option>
                    {kktpList.map((kktp) => (
                      <option key={kktp.id} value={kktp.id}>
                        {kktp.tujuan_pembelajaran} ({kktp.kktp_percentage}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows="3"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Catatan tambahan (opsional)"
                  ></textarea>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  {editingGrade ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Input Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
            <form onSubmit={handleBulkSubmit}>
              <div className="sticky top-0 bg-white border-b p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Input Nilai Kelas
                  </h2>
                  <button
                    type="button"
                    onClick={handleCloseBulkModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Assessment Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    Informasi Penilaian
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kelas <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={bulkFormData.class_id}
                        onChange={(e) =>
                          setBulkFormData({
                            ...bulkFormData,
                            class_id: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        required
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Penilaian
                      </label>
                      <select
                        value={bulkFormData.assessment_type}
                        onChange={(e) =>
                          setBulkFormData({
                            ...bulkFormData,
                            assessment_type: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      >
                        <option value="daily_test">Ulangan Harian</option>
                        <option value="midterm">UTS</option>
                        <option value="final">UAS</option>
                        <option value="practical">Praktik</option>
                        <option value="project">Proyek</option>
                        <option value="attitude">Sikap</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Penilaian <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bulkFormData.assessment_title}
                        onChange={(e) =>
                          setBulkFormData({
                            ...bulkFormData,
                            assessment_title: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        placeholder="Contoh: Ulangan Harian Bab 1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal
                      </label>
                      <input
                        type="date"
                        value={bulkFormData.assessment_date}
                        onChange={(e) =>
                          setBulkFormData({
                            ...bulkFormData,
                            assessment_date: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nilai Maksimal
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={bulkFormData.max_score}
                        onChange={(e) =>
                          setBulkFormData({
                            ...bulkFormData,
                            max_score: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        KKTP (Opsional)
                      </label>
                      <select
                        value={bulkFormData.kktp_id}
                        onChange={(e) =>
                          setBulkFormData({
                            ...bulkFormData,
                            kktp_id: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      >
                        <option value="">Tidak menggunakan KKTP</option>
                        {kktpList.map((kktp) => (
                          <option key={kktp.id} value={kktp.id}>
                            {kktp.tujuan_pembelajaran} ({kktp.kktp_percentage}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Student Scores */}
                {bulkFormData.student_scores.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Daftar Nilai Siswa ({bulkFormData.student_scores.length}{' '}
                      siswa)
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                              No
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                              Nama Siswa
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              Nilai
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {bulkFormData.student_scores.map((student, index) => (
                            <tr key={student.student_id}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {student.student_name}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={student.score}
                                  onChange={(e) =>
                                    handleBulkScoreChange(
                                      student.student_id,
                                      e.target.value
                                    )
                                  }
                                  className="w-24 rounded border border-gray-300 px-2 py-1 text-center"
                                  placeholder="0"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseBulkModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Simpan Semua Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GradeList



