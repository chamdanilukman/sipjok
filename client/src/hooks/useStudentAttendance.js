import { useState, useCallback } from 'react'
import { api } from '../lib/api'
import useClasses from './useClasses'
import useStudents from './useStudents'

// Status absensi — label & warna dipakai tombol penandaan + badge sel tabel
export const ATTENDANCE_STATUS = {
  hadir: { label: 'Hadir', color: 'green' },
  sakit: { label: 'Sakit', color: 'yellow' },
  izin: { label: 'Izin', color: 'blue' },
  alpa: { label: 'Alpa', color: 'red' },
}

// Server menyimpan tanggal sebagai timestamp UTC-tengah malam ('YYYY-MM-DDT00:00:00.000Z');
// bandingkan lewat 10 karakter pertama agar selalu 'YYYY-MM-DD'
const sameDay = (ts, date) => String(ts || '').slice(0, 10) === String(date || '').slice(0, 10)

/**
 * Facade untuk halaman Buku Absensi Siswa: gabungan absensi harian + kelola kelas
 * + kelola siswa. Kelas & siswa didelegasikan ke useClasses/useStudents agar tidak
 * ada duplikasi state antarhalaman.
 */
const useStudentAttendance = () => {
  const classesApi = useClasses()
  const studentsApi = useStudents()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadAttendanceByDate = useCallback(async (classId, date) => {
    setLoading(true)
    setError(null)
    try {
      const all = await api.get('/attendance')
      const rows = (all || []).filter((a) => a.class_id === classId && sameDay(a.tanggal, date))
      setAttendance(rows)
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Simpan satu kelas untuk satu tanggal: baris lama di-update, baru di-insert
  const bulkSaveAttendance = useCallback(async (userId, classId, date, rows) => {
    setLoading(true)
    setError(null)
    try {
      const all = await api.get('/attendance')
      const existing = (all || []).filter((a) => a.class_id === classId && sameDay(a.tanggal, date))
      const byStudent = new Map(existing.map((a) => [a.student_id, a]))

      for (const row of rows) {
        const prior = byStudent.get(row.student_id)
        if (prior) {
          await api.put(`/attendance/${prior.id}`, { status: row.status, notes: row.notes ?? null })
        } else {
          await api.post('/attendance', {
            student_id: row.student_id,
            class_id: classId,
            tanggal: date,
            status: row.status,
            notes: row.notes ?? null,
          })
        }
      }

      const fresh = await api.get('/attendance')
      const freshRows = (fresh || []).filter((a) => a.class_id === classId && sameDay(a.tanggal, date))
      setAttendance(freshRows)
      return freshRows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Laporan: seluruh baris absensi kelas dalam rentang tanggal (inklusif)
  const loadAttendanceByDateRange = useCallback(async (classId, startDate, endDate) => {
    setLoading(true)
    setError(null)
    try {
      const all = await api.get('/attendance')
      const rows = (all || []).filter((a) => {
        if (a.class_id !== classId) return false
        const d = String(a.tanggal || '').slice(0, 10)
        return (!startDate || d >= startDate) && (!endDate || d <= endDate)
      })
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getClassStatistics = useCallback((rows = []) => {
    const total = rows.length
    const hadir = rows.filter((r) => r.status === 'hadir').length
    const totalStudents = new Set(rows.map((r) => r.student_id)).size
    const avgPresent = total > 0 ? Math.round((hadir / total) * 100) : 0
    const avgAbsent = total > 0 ? 100 - avgPresent : 0
    return { avgPresent, avgAbsent, totalStudents, totalRecords: total }
  }, [])

  return {
    attendance,
    setAttendance,
    loading,
    error,
    ATTENDANCE_STATUS,
    loadAttendanceByDate,
    loadAttendanceByDateRange,
    bulkSaveAttendance,
    getClassStatistics,
    // Kelola kelas
    loadClasses: classesApi.loadClasses,
    createClass: classesApi.createClass,
    updateClass: classesApi.updateClass,
    deleteClass: classesApi.deleteClass,
    // Kelola siswa
    loadStudentsByClass: studentsApi.loadStudentsByClass,
    createStudent: studentsApi.createStudent,
    updateStudent: studentsApi.updateStudent,
    deleteStudent: studentsApi.deleteStudent,
  }
}

export default useStudentAttendance
