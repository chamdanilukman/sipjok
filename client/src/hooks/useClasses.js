import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

const useClasses = () => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load all classes for a teacher
  const loadClasses = useCallback(async (teacherId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('grade', { ascending: true })
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
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
      const { data, error: fetchError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single()

      if (fetchError) throw fetchError
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
  const createClass = useCallback(async (teacherId, classData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from('classes')
        .insert([
          {
            ...classData,
            teacher_id: teacherId,
          },
        ])
        .select()

      if (insertError) throw insertError
      setClasses((prev) => [...prev, data[0]])
      return data[0]
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
      const { data, error: updateError } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', classId)
        .select()

      if (updateError) throw updateError
      setClasses((prev) => prev.map((c) => (c.id === classId ? data[0] : c)))
      return data[0]
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
      const { error: deleteError } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)

      if (deleteError) throw deleteError
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

