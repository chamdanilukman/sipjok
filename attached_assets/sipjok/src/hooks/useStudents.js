import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

const useStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load all students for a teacher
  const loadStudents = useCallback(async (teacherId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name, grade)
        `)
        .eq('teacher_id', teacherId)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      setStudents(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading students:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Load students by class
  const loadStudentsByClass = useCallback(async (classId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      setStudents(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading students by class:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Load a single student by ID
  const loadStudentById = useCallback(async (studentId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name, grade)
        `)
        .eq('id', studentId)
        .single()

      if (fetchError) throw fetchError
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error loading student:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new student
  const createStudent = useCallback(async (teacherId, studentData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from('students')
        .insert([
          {
            ...studentData,
            teacher_id: teacherId,
          },
        ])
        .select()

      if (insertError) throw insertError
      setStudents((prev) => [...prev, data[0]])
      return data[0]
    } catch (err) {
      setError(err.message)
      console.error('Error creating student:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update a student
  const updateStudent = useCallback(async (studentId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .select()

      if (updateError) throw updateError
      setStudents((prev) => prev.map((s) => (s.id === studentId ? data[0] : s)))
      return data[0]
    } catch (err) {
      setError(err.message)
      console.error('Error updating student:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete a student
  const deleteStudent = useCallback(async (studentId) => {
    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)

      if (deleteError) throw deleteError
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
    } catch (err) {
      setError(err.message)
      console.error('Error deleting student:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Search students by name or NIS
  const searchStudents = useCallback(async (teacherId, keyword) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select(`
          *,
          class:classes(id, name, grade)
        `)
        .eq('teacher_id', teacherId)
        .or(`name.ilike.%${keyword}%,nis.ilike.%${keyword}%`)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      setStudents(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error searching students:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    students,
    setStudents,
    loading,
    error,
    loadStudents,
    loadStudentsByClass,
    loadStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    searchStudents,
  }
}

export default useStudents

