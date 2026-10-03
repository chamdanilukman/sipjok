import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useModulAjar = () => {
  const [modulAjar, setModulAjar] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadModulAjar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/modul-ajar')
      setModulAjar(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createModulAjar = useCallback(async (modulData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/modul-ajar', modulData)
      setModulAjar((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateModulAjar = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/modul-ajar/${id}`, updates)
      setModulAjar((prev) => prev.map((m) => (m.id === id ? data : m)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteModulAjar = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/modul-ajar/${id}`)
      setModulAjar((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { modulAjar, setModulAjar, loading, error, loadModulAjar, createModulAjar, updateModulAjar, deleteModulAjar }
}

export default useModulAjar
