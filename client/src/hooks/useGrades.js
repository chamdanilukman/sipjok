import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

const useGrades = () => {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load all grades for a teacher
  const loadGrades = useCallback(async (teacherId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('student_grades')
        .select(`
          *,
          student:students(id, name, nis),
          class:classes(id, name, grade),
          kktp:kktp_criteria(id, tujuan_pembelajaran, kktp_percentage)
        `)
        .eq('teacher_id', teacherId)
        .order('assessment_date', { ascending: false })

      if (fetchError) throw fetchError
      setGrades(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading grades:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load grades by class
  const loadGradesByClass = useCallback(async (teacherId, classId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('student_grades')
        .select(`
          *,
          student:students(id, name, nis),
          class:classes(id, name, grade),
          kktp:kktp_criteria(id, tujuan_pembelajaran, kktp_percentage)
        `)
        .eq('teacher_id', teacherId)
        .eq('class_id', classId)
        .order('assessment_date', { ascending: false })

      if (fetchError) throw fetchError
      setGrades(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading grades by class:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load grades by student
  const loadGradesByStudent = useCallback(async (teacherId, studentId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('student_grades')
        .select(`
          *,
          student:students(id, name, nis),
          class:classes(id, name, grade),
          kktp:kktp_criteria(id, tujuan_pembelajaran, kktp_percentage)
        `)
        .eq('teacher_id', teacherId)
        .eq('student_id', studentId)
        .order('assessment_date', { ascending: false })

      if (fetchError) throw fetchError
      setGrades(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading grades by student:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Create new grade
  const createGrade = useCallback(async (teacherId, gradeData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from('student_grades')
        .insert([
          {
            teacher_id: teacherId,
            ...gradeData,
          },
        ])
        .select(`
          *,
          student:students(id, name, nis),
          class:classes(id, name, grade),
          kktp:kktp_criteria(id, tujuan_pembelajaran, kktp_percentage)
        `)
        .single()

      if (insertError) throw insertError

      setGrades((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error creating grade:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk create grades (for multiple students)
  const bulkCreateGrades = useCallback(async (teacherId, gradesData) => {
    setLoading(true)
    setError(null)
    try {
      const gradesWithTeacher = gradesData.map((grade) => ({
        teacher_id: teacherId,
        ...grade,
      }))

      const { data, error: insertError } = await supabase
        .from('student_grades')
        .insert(gradesWithTeacher)
        .select(`
          *,
          student:students(id, name, nis),
          class:classes(id, name, grade),
          kktp:kktp_criteria(id, tujuan_pembelajaran, kktp_percentage)
        `)

      if (insertError) throw insertError

      setGrades((prev) => [...data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error bulk creating grades:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update grade
  const updateGrade = useCallback(async (gradeId, gradeData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('student_grades')
        .update(gradeData)
        .eq('id', gradeId)
        .select(`
          *,
          student:students(id, name, nis),
          class:classes(id, name, grade),
          kktp:kktp_criteria(id, tujuan_pembelajaran, kktp_percentage)
        `)
        .single()

      if (updateError) throw updateError

      setGrades((prev) => prev.map((g) => (g.id === gradeId ? data : g)))
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error updating grade:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete grade
  const deleteGrade = useCallback(async (gradeId) => {
    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('student_grades')
        .delete()
        .eq('id', gradeId)

      if (deleteError) throw deleteError

      setGrades((prev) => prev.filter((g) => g.id !== gradeId))
    } catch (err) {
      setError(err.message)
      console.error('Error deleting grade:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get class statistics
  const getClassStatistics = useCallback(async (teacherId, classId, assessmentTitle) => {
    try {
      const { data, error: statsError } = await supabase
        .from('student_grades')
        .select('score, max_score, percentage, is_passed')
        .eq('teacher_id', teacherId)
        .eq('class_id', classId)
        .eq('assessment_title', assessmentTitle)

      if (statsError) throw statsError

      if (data.length === 0) {
        return {
          total: 0,
          average: 0,
          highest: 0,
          lowest: 0,
          passed: 0,
          failed: 0,
          passRate: 0,
        }
      }

      const scores = data.map((g) => g.percentage)
      const average = scores.reduce((a, b) => a + b, 0) / scores.length
      const highest = Math.max(...scores)
      const lowest = Math.min(...scores)
      const passed = data.filter((g) => g.is_passed).length
      const failed = data.length - passed
      const passRate = (passed / data.length) * 100

      return {
        total: data.length,
        average: average.toFixed(2),
        highest: highest.toFixed(2),
        lowest: lowest.toFixed(2),
        passed,
        failed,
        passRate: passRate.toFixed(2),
      }
    } catch (err) {
      console.error('Error getting class statistics:', err)
      return {
        total: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        passed: 0,
        failed: 0,
        passRate: 0,
      }
    }
  }, [])

  // Filter grades
  const filterGrades = useCallback(async (teacherId, filters) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('student_grades')
        .select(`
          *,
          student:students(id, name, nis),
          class:classes(id, name, grade),
          kktp:kktp_criteria(id, tujuan_pembelajaran, kktp_percentage)
        `)
        .eq('teacher_id', teacherId)

      if (filters.class_id) {
        query = query.eq('class_id', filters.class_id)
      }
      if (filters.assessment_type) {
        query = query.eq('assessment_type', filters.assessment_type)
      }
      if (filters.is_passed !== undefined) {
        query = query.eq('is_passed', filters.is_passed)
      }

      const { data, error: filterError } = await query.order('assessment_date', {
        ascending: false,
      })

      if (filterError) throw filterError
      setGrades(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error filtering grades:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    grades,
    loading,
    error,
    loadGrades,
    loadGradesByClass,
    loadGradesByStudent,
    createGrade,
    bulkCreateGrades,
    updateGrade,
    deleteGrade,
    getClassStatistics,
    filterGrades,
  }
}

export default useGrades

