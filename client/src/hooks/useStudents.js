import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load all students for authenticated user
  const loadStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/students')
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
      const data = await api.get(`/students/class/${classId}`)
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
      const data = await api.get(`/students/${studentId}`)
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
  const createStudent = useCallback(async (studentData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/students', studentData)
      setStudents((prev) => [...prev, data])
      return data
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
      const data = await api.put(`/students/${studentId}`, updates)
      setStudents((prev) => prev.map((s) => (s.id === studentId ? data : s)))
      return data
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
      await api.delete(`/students/${studentId}`)
      setStudents((prev) => prev.filter((s) => s.id !== studentId))
    } catch (err) {
      setError(err.message)
      console.error('Error deleting student:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Search students by name or NIS (client-side for now)
  const searchStudents = useCallback(async (keyword) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/students')
      const filtered = data.filter(s => 
        s.name.toLowerCase().includes(keyword.toLowerCase()) ||
        (s.nis && s.nis.toLowerCase().includes(keyword.toLowerCase()))
      )
      setStudents(filtered)
      return filtered
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
