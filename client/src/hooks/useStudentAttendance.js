import { useState, useCallback } from 'react'
import supabase, { getCurrentUserId } from '../config/supabase'

/**
 * Custom hook for managing student attendance
 * Handles CRUD operations and statistics
 */
const useStudentAttendance = () => {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Attendance status types
  const ATTENDANCE_STATUS = {
    hadir: { label: 'Hadir', color: 'green', icon: 'fa-check' },
    sakit: { label: 'Sakit', color: 'yellow', icon: 'fa-heartbeat' },
    izin: { label: 'Izin', color: 'blue', icon: 'fa-file-alt' },
    alpha: { label: 'Alpha', color: 'red', icon: 'fa-times' },
  }

  /**
   * Load attendance for a specific class and date
   */
  const loadAttendanceByDate = useCallback(async (classId, attendanceDate) => {
    setLoading(true)
    setError(null)
    try {
      // Ensure date is in YYYY-MM-DD format (local timezone)
      let formattedDate = attendanceDate
      if (attendanceDate instanceof Date) {
        const year = attendanceDate.getFullYear()
        const month = String(attendanceDate.getMonth() + 1).padStart(2, '0')
        const day = String(attendanceDate.getDate()).padStart(2, '0')
        formattedDate = `${year}-${month}-${day}`
      }

      const { data, error: err } = await supabase
        .from('student_attendance')
        .select(`
          *,
          students:student_id (id, name, nis)
        `)
        .eq('class_id', classId)
        .eq('attendance_date', formattedDate)

      if (err) throw err
      setAttendance(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading attendance:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load attendance for a date range
   */
  const loadAttendanceByDateRange = useCallback(async (classId, startDate, endDate) => {
    setLoading(true)
    setError(null)
    try {
      // Ensure dates are in YYYY-MM-DD format (local timezone)
      const formatDate = (date) => {
        if (date instanceof Date) {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        return date
      }

      const formattedStartDate = formatDate(startDate)
      const formattedEndDate = formatDate(endDate)

      const { data, error: err } = await supabase
        .from('student_attendance')
        .select(`
          *,
          students:student_id (id, name, nis)
        `)
        .eq('class_id', classId)
        .gte('attendance_date', formattedStartDate)
        .lte('attendance_date', formattedEndDate)
        .order('attendance_date', { ascending: false })

      if (err) throw err
      setAttendance(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading attendance range:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create or update attendance record
   */
  const saveAttendance = useCallback(async (teacherId, classId, studentId, attendanceDate, status, notes = '') => {
    setLoading(true)
    setError(null)
    try {
      // Ensure date is in YYYY-MM-DD format (local timezone)
      let formattedDate = attendanceDate
      if (attendanceDate instanceof Date) {
        const year = attendanceDate.getFullYear()
        const month = String(attendanceDate.getMonth() + 1).padStart(2, '0')
        const day = String(attendanceDate.getDate()).padStart(2, '0')
        formattedDate = `${year}-${month}-${day}`
      }

      // Check if record exists
      const { data: existing, error: checkErr } = await supabase
        .from('student_attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('attendance_date', formattedDate)
        .single()

      if (checkErr && checkErr.code !== 'PGRST116') throw checkErr

      let result
      if (existing) {
        // Update existing
        const { data, error: err } = await supabase
          .from('student_attendance')
          .update({ status, notes, updated_at: new Date() })
          .eq('id', existing.id)
          .select()

        if (err) throw err
        result = data[0]
      } else {
        // Insert new
        const { data, error: err } = await supabase
          .from('student_attendance')
          .insert([
            {
              teacher_id: teacherId,
              class_id: classId,
              student_id: studentId,
              attendance_date: formattedDate,
              status,
              notes,
            },
          ])
          .select()

        if (err) throw err
        result = data[0]
      }

      // Update local state
      setAttendance((prev) => {
        const filtered = prev.filter((a) => a.student_id !== studentId)
        return [...filtered, result]
      })

      return result
    } catch (err) {
      setError(err.message)
      console.error('Error saving attendance:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Bulk save attendance for multiple students
   */
  const bulkSaveAttendance = useCallback(async (teacherId, classId, attendanceDate, attendanceData) => {
    setLoading(true)
    setError(null)
    try {
      // Ensure date is in YYYY-MM-DD format (local timezone)
      // If attendanceDate is already a string in YYYY-MM-DD format, use it
      // If it's a Date object, convert it to local YYYY-MM-DD
      let formattedDate = attendanceDate
      if (attendanceDate instanceof Date) {
        const year = attendanceDate.getFullYear()
        const month = String(attendanceDate.getMonth() + 1).padStart(2, '0')
        const day = String(attendanceDate.getDate()).padStart(2, '0')
        formattedDate = `${year}-${month}-${day}`
      }

      const records = attendanceData.map((item) => ({
        teacher_id: teacherId,
        class_id: classId,
        student_id: item.student_id,
        attendance_date: formattedDate,
        status: item.status,
        notes: item.notes || '',
      }))

      // Delete existing records for this date
      await supabase
        .from('student_attendance')
        .delete()
        .eq('class_id', classId)
        .eq('attendance_date', formattedDate)

      // Insert new records
      const { data, error: err } = await supabase
        .from('student_attendance')
        .insert(records)
        .select()

      if (err) throw err

      setAttendance(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error bulk saving attendance:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Calculate attendance statistics for a student
   */
  const getStudentStatistics = useCallback((studentId, attendanceData) => {
    const records = attendanceData.filter((a) => a.student_id === studentId)
    const total = records.length

    if (total === 0) {
      return {
        total: 0,
        hadir: 0,
        sakit: 0,
        izin: 0,
        alpha: 0,
        hadirPercent: 0,
        absentPercent: 0,
      }
    }

    const hadir = records.filter((a) => a.status === 'hadir').length
    const sakit = records.filter((a) => a.status === 'sakit').length
    const izin = records.filter((a) => a.status === 'izin').length
    const alpha = records.filter((a) => a.status === 'alpha').length

    return {
      total,
      hadir,
      sakit,
      izin,
      alpha,
      hadirPercent: Math.round((hadir / total) * 100),
      absentPercent: Math.round(((sakit + izin + alpha) / total) * 100),
    }
  }, [])

  /**
   * Get class statistics
   */
  const getClassStatistics = useCallback((attendanceData) => {
    if (attendanceData.length === 0) {
      return {
        totalRecords: 0,
        totalStudents: 0,
        avgPresent: 0,
        avgAbsent: 0,
      }
    }

    const uniqueStudents = new Set(attendanceData.map((a) => a.student_id))
    const totalStudents = uniqueStudents.size

    let totalHadir = 0
    let totalAbsent = 0

    attendanceData.forEach((record) => {
      if (record.status === 'hadir') {
        totalHadir++
      } else {
        totalAbsent++
      }
    })

    return {
      totalRecords: attendanceData.length,
      totalStudents,
      avgPresent: Math.round((totalHadir / attendanceData.length) * 100),
      avgAbsent: Math.round((totalAbsent / attendanceData.length) * 100),
    }
  }, [])

  /**
   * Delete attendance record
   */
  const deleteAttendance = useCallback(async (attendanceId) => {
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('student_attendance')
        .delete()
        .eq('id', attendanceId)

      if (err) throw err

      setAttendance((prev) => prev.filter((a) => a.id !== attendanceId))
    } catch (err) {
      setError(err.message)
      console.error('Error deleting attendance:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load all classes for current teacher
   */
  const loadClasses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const userId = await getCurrentUserId()

      const { data, error: err } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', userId)
        .order('grade', { ascending: true })
        .order('name', { ascending: true })

      if (err) throw err
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading classes:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create new class
   */
  const createClass = useCallback(async (classData) => {
    setLoading(true)
    setError(null)
    try {
      const userId = await getCurrentUserId()

      const { data, error: err } = await supabase
        .from('classes')
        .insert([{
          teacher_id: userId,
          name: classData.name || classData.class_name,
          grade: classData.grade || classData.grade_level,
          academic_year: classData.academic_year || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
          total_students: classData.total_students || 0,
          wali_kelas: classData.wali_kelas || '',
          ruang_kelas: classData.ruang_kelas || '',
        }])
        .select()

      if (err) throw err
      return data[0]
    } catch (err) {
      setError(err.message)
      console.error('Error creating class:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update existing class
   */
  const updateClass = useCallback(async (classId, classData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('classes')
        .update({
          name: classData.name || classData.class_name,
          grade: classData.grade || classData.grade_level,
          academic_year: classData.academic_year,
          total_students: classData.total_students,
          wali_kelas: classData.wali_kelas,
          ruang_kelas: classData.ruang_kelas,
        })
        .eq('id', classId)
        .select()

      if (err) throw err
      return data[0]
    } catch (err) {
      setError(err.message)
      console.error('Error updating class:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete class (check for dependencies first)
   */
  const deleteClass = useCallback(async (classId) => {
    setLoading(true)
    setError(null)
    try {
      // Check if class has students
      const { data: students, error: studentsErr } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)

      if (studentsErr) throw studentsErr

      if (students && students.length > 0) {
        throw new Error('Tidak dapat menghapus kelas yang masih memiliki siswa. Hapus siswa terlebih dahulu.')
      }

      // Check if class has schedules
      const { data: schedules, error: schedulesErr } = await supabase
        .from('class_schedules')
        .select('id')
        .eq('class_id', classId)

      if (schedulesErr) throw schedulesErr

      if (schedules && schedules.length > 0) {
        throw new Error('Tidak dapat menghapus kelas yang masih memiliki jadwal. Hapus jadwal terlebih dahulu.')
      }

      // Delete class
      const { error: err } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)

      if (err) throw err
      return true
    } catch (err) {
      setError(err.message)
      console.error('Error deleting class:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load students by class
   */
  const loadStudentsByClass = useCallback(async (classId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('nis', { ascending: true })

      if (err) throw err
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading students:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create new student
   */
  const createStudent = useCallback(async (studentData) => {
    setLoading(true)
    setError(null)
    try {
      const userId = await getCurrentUserId()

      const { data, error: err } = await supabase
        .from('students')
        .insert([{
          teacher_id: userId,
          class_id: studentData.class_id,
          name: studentData.name,
          nis: studentData.nis || studentData.student_number,
          nisn: studentData.nisn,
          tempat_lahir: studentData.tempat_lahir,
          tanggal_lahir: studentData.tanggal_lahir,
          jenis_kelamin: studentData.jenis_kelamin,
          agama: studentData.agama,
        }])
        .select()

      if (err) throw err
      return data[0]
    } catch (err) {
      setError(err.message)
      console.error('Error creating student:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update existing student
   */
  const updateStudent = useCallback(async (studentId, studentData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('students')
        .update({
          class_id: studentData.class_id,
          name: studentData.name,
          nis: studentData.nis || studentData.student_number,
          nisn: studentData.nisn,
          tempat_lahir: studentData.tempat_lahir,
          tanggal_lahir: studentData.tanggal_lahir,
          jenis_kelamin: studentData.jenis_kelamin,
          agama: studentData.agama,
        })
        .eq('id', studentId)
        .select()

      if (err) throw err
      return data[0]
    } catch (err) {
      setError(err.message)
      console.error('Error updating student:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete student
   */
  const deleteStudent = useCallback(async (studentId) => {
    setLoading(true)
    setError(null)
    try {
      // Check if student has attendance records
      const { data: attendanceRecords, error: attendanceErr } = await supabase
        .from('student_attendance')
        .select('id')
        .eq('student_id', studentId)

      if (attendanceErr) throw attendanceErr

      if (attendanceRecords && attendanceRecords.length > 0) {
        throw new Error('Tidak dapat menghapus siswa yang memiliki data absensi. Hapus data absensi terlebih dahulu.')
      }

      // Delete student
      const { error: err } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)

      if (err) throw err
      return true
    } catch (err) {
      setError(err.message)
      console.error('Error deleting student:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    attendance,
    setAttendance,
    loading,
    error,
    ATTENDANCE_STATUS,
    loadAttendanceByDate,
    loadAttendanceByDateRange,
    saveAttendance,
    bulkSaveAttendance,
    getStudentStatistics,
    getClassStatistics,
    deleteAttendance,
    // Class management
    loadClasses,
    createClass,
    updateClass,
    deleteClass,
    // Student management
    loadStudentsByClass,
    createStudent,
    updateStudent,
    deleteStudent,
  }
}

export default useStudentAttendance

