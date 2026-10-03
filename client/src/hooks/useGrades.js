import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useGrades = () => {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadGrades = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/grades')
      setGrades(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createGrade = useCallback(async (gradeData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/grades', gradeData)
      setGrades((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateGrade = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/grades/${id}`, updates)
      setGrades((prev) => prev.map((g) => (g.id === id ? data : g)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteGrade = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/grades/${id}`)
      setGrades((prev) => prev.filter((g) => g.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { grades, setGrades, loading, error, loadGrades, createGrade, updateGrade, deleteGrade }
}

export default useGrades
