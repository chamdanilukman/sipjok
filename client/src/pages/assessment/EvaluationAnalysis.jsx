import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useGrades from '../../hooks/useGrades'
import useClasses from '../../hooks/useClasses'
import { api } from '../../lib/api'

export const EvaluationAnalysis = () => {
  const { showNotification } = useNotification()
  const { grades, loading, loadGrades, loadGradesByClass, getClassStatistics } =
    useGrades()
  const { classes, loadClasses } = useClasses()

  const [userId, setUserId] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedAssessmentType, setSelectedAssessmentType] = useState('')
  const [statistics, setStatistics] = useState(null)
  const [assessmentList, setAssessmentList] = useState([])

  // Get current user and load data
  useEffect(() => {
    const getCurrentUser = async () => {
      const user = await api.get('/auth/me')
      if (user) {
        setUserId(user.id)
        loadGrades(user.id)
        loadClasses(user.id)
      }
    }
    getCurrentUser()
  }, [loadGrades, loadClasses])

  // Load grades when class is selected
  useEffect(() => {
    if (selectedClass && userId) {
      loadGradesByClass(userId, selectedClass)
    }
  }, [selectedClass, userId, loadGradesByClass])

  // Calculate statistics and assessment list
  useEffect(() => {
    if (grades.length > 0) {
      calculateStatistics()
      generateAssessmentList()
    }
  }, [grades, selectedAssessmentType])

  const calculateStatistics = () => {
    let filteredGrades = grades

    if (selectedAssessmentType) {
      filteredGrades = grades.filter(
        (g) => g.assessment_type === selectedAssessmentType
      )
    }

    if (filteredGrades.length === 0) {
      setStatistics(null)
      return
    }

    const totalStudents = new Set(filteredGrades.map((g) => g.student_id)).size
    const totalAssessments = new Set(
      filteredGrades.map((g) => g.assessment_title)
    ).size

    const scores = filteredGrades.map((g) => g.percentage)
    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)

    const passed = filteredGrades.filter((g) => g.is_passed).length
    const failed = filteredGrades.length - passed
    const passRate = (passed / filteredGrades.length) * 100

    // By assessment type
    const byType = {}
    filteredGrades.forEach((grade) => {
      if (!byType[grade.assessment_type]) {
        byType[grade.assessment_type] = {
          count: 0,
          totalScore: 0,
          passed: 0,
        }
      }
      byType[grade.assessment_type].count++
      byType[grade.assessment_type].totalScore += grade.percentage
      if (grade.is_passed) byType[grade.assessment_type].passed++
    })

    Object.keys(byType).forEach((type) => {
      byType[type].average = byType[type].totalScore / byType[type].count
      byType[type].passRate = (byType[type].passed / byType[type].count) * 100
    })

    setStatistics({
      totalStudents,
      totalAssessments,
      totalGrades: filteredGrades.length,
      average: average.toFixed(2),
      highest: highest.toFixed(2),
      lowest: lowest.toFixed(2),
      passed,
      failed,
      passRate: passRate.toFixed(2),
      byType,
    })
  }

  const generateAssessmentList = () => {
    let filteredGrades = grades

    if (selectedAssessmentType) {
      filteredGrades = grades.filter(
        (g) => g.assessment_type === selectedAssessmentType
      )
    }

    const grouped = {}
    filteredGrades.forEach((grade) => {
      const key = `${grade.assessment_title}-${grade.assessment_date}`
      if (!grouped[key]) {
        grouped[key] = {
          title: grade.assessment_title,
          date: grade.assessment_date,
          type: grade.assessment_type,
          grades: [],
        }
      }
      grouped[key].grades.push(grade)
    })

    const list = Object.values(grouped).map((assessment) => {
      const scores = assessment.grades.map((g) => g.percentage)
      const average =
        scores.reduce((sum, score) => sum + score, 0) / scores.length
      const passed = assessment.grades.filter((g) => g.is_passed).length
      const passRate = (passed / assessment.grades.length) * 100

      return {
        ...assessment,
        studentCount: assessment.grades.length,
        average: average.toFixed(2),
        highest: Math.max(...scores).toFixed(2),
        lowest: Math.min(...scores).toFixed(2),
        passed,
        failed: assessment.grades.length - passed,
        passRate: passRate.toFixed(2),
      }
    })

    // Sort by date descending
    list.sort((a, b) => new Date(b.date) - new Date(a.date))
    setAssessmentList(list)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analisis Evaluasi</h1>
        <p className="text-gray-600 mt-2">
          Dashboard analisis hasil pembelajaran dan tren kinerja siswa
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={selectedClass || ''}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Semua Kelas</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} - Kelas {cls.grade}
            </option>
          ))}
        </select>

        <select
          value={selectedAssessmentType}
          onChange={(e) => setSelectedAssessmentType(e.target.value)}
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
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      ) : grades.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-chart-pie text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum ada data
          </h3>
          <p className="text-gray-600">
            Tambahkan nilai siswa untuk melihat analisis evaluasi
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statistics Cards */}
          {statistics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">
                      Total Siswa
                    </h3>
                    <i className="fas fa-users text-2xl opacity-75"></i>
                  </div>
                  <p className="text-3xl font-bold">
                    {statistics.totalStudents}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">
                      Total Penilaian
                    </h3>
                    <i className="fas fa-clipboard-list text-2xl opacity-75"></i>
                  </div>
                  <p className="text-3xl font-bold">
                    {statistics.totalAssessments}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">
                      Rata-rata Nilai
                    </h3>
                    <i className="fas fa-chart-line text-2xl opacity-75"></i>
                  </div>
                  <p className="text-3xl font-bold">{statistics.average}%</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">
                      Tingkat Ketuntasan
                    </h3>
                    <i className="fas fa-percentage text-2xl opacity-75"></i>
                  </div>
                  <p className="text-3xl font-bold">{statistics.passRate}%</p>
                </div>
              </div>

              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Distribusi Nilai
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Nilai Tertinggi</span>
                      <span className="text-2xl font-bold text-green-600">
                        {statistics.highest}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Nilai Rata-rata</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {statistics.average}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Nilai Terendah</span>
                      <span className="text-2xl font-bold text-red-600">
                        {statistics.lowest}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pass/Fail Statistics */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Status Ketuntasan
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Tuntas</span>
                        <span className="text-lg font-semibold text-green-600">
                          {statistics.passed} siswa
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full transition-all"
                          style={{ width: `${statistics.passRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">Belum Tuntas</span>
                        <span className="text-lg font-semibold text-red-600">
                          {statistics.failed} siswa
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-red-600 h-3 rounded-full transition-all"
                          style={{
                            width: `${100 - parseFloat(statistics.passRate)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* By Assessment Type */}
              {statistics.byType &&
                Object.keys(statistics.byType).length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Analisis per Jenis Penilaian
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(statistics.byType).map(([type, data]) => (
                        <div
                          key={type}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`px-3 py-1 rounded text-sm font-medium ${getAssessmentTypeColor(
                                type
                              )}`}
                            >
                              {getAssessmentTypeLabel(type)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {data.count} penilaian
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Rata-rata
                              </p>
                              <p className="text-xl font-bold text-blue-600">
                                {data.average.toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Ketuntasan
                              </p>
                              <p className="text-xl font-bold text-green-600">
                                {data.passRate.toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                Tuntas
                              </p>
                              <p className="text-xl font-bold text-gray-900">
                                {data.passed}/{data.count}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Assessment List */}
              {assessmentList.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Rincian Penilaian ({assessmentList.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Judul Penilaian
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            Tanggal
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            Jenis
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            Siswa
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            Rata-rata
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            Tertinggi
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            Terendah
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            Ketuntasan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {assessmentList.map((assessment, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {assessment.title}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">
                              {new Date(assessment.date).toLocaleDateString(
                                'id-ID'
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getAssessmentTypeColor(
                                  assessment.type
                                )}`}
                              >
                                {getAssessmentTypeLabel(assessment.type)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900">
                              {assessment.studentCount}
                            </td>
                            <td className="px-4 py-3 text-sm text-center font-semibold text-blue-600">
                              {assessment.average}%
                            </td>
                            <td className="px-4 py-3 text-sm text-center font-semibold text-green-600">
                              {assessment.highest}%
                            </td>
                            <td className="px-4 py-3 text-sm text-center font-semibold text-red-600">
                              {assessment.lowest}%
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-sm font-semibold text-gray-900">
                                  {assessment.passRate}%
                                </span>
                                <span className="text-xs text-gray-600">
                                  {assessment.passed}/{assessment.studentCount}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default EvaluationAnalysis



