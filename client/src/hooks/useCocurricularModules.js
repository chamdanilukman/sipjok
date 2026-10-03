import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useCocurricularModules = () => {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadModules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/cocurricular-modules')
      setModules(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createModule = useCallback(async (userId, moduleData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/cocurricular-modules', moduleData)
      setModules((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateModule = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/cocurricular-modules/${id}`, updates)
      setModules((prev) => prev.map((m) => (m.id === id ? data : m)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteModule = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/cocurricular-modules/${id}`)
      setModules((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { modules, setModules, loading, error, loadModules, createModule, updateModule, deleteModule }
}

export default useCocurricularModules
