import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useClasses = () => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load all classes for authenticated user
  const loadClasses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/classes')
      setClasses(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading classes:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Load a single class by ID
  const loadClassById = useCallback(async (classId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get(`/classes/${classId}`)
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error loading class:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new class
  const createClass = useCallback(async (classData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/classes', classData)
      setClasses((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error creating class:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update a class
  const updateClass = useCallback(async (classId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/classes/${classId}`, updates)
      setClasses((prev) => prev.map((c) => (c.id === classId ? data : c)))
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error updating class:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete a class
  const deleteClass = useCallback(async (classId) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/classes/${classId}`)
      setClasses((prev) => prev.filter((c) => c.id !== classId))
    } catch (err) {
      setError(err.message)
      console.error('Error deleting class:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    classes,
    setClasses,
    loading,
    error,
    loadClasses,
    loadClassById,
    createClass,
    updateClass,
    deleteClass,
  }
}

export default useClasses
