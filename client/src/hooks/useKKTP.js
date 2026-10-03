import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useKKTP = () => {
  const [kktpList, setKktpList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadKKTP = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/kktp')
      setKktpList(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createKKTP = useCallback(async (kktpData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/kktp', kktpData)
      setKktpList((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateKKTP = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/kktp/${id}`, updates)
      setKktpList((prev) => prev.map((k) => (k.id === id ? data : k)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteKKTP = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/kktp/${id}`)
      setKktpList((prev) => prev.filter((k) => k.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { kktpList, setKktpList, loading, error, loadKKTP, createKKTP, updateKKTP, deleteKKTP }
}

export default useKKTP
