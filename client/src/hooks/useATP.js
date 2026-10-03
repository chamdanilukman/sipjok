import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useATP = () => {
  const [atpList, setAtpList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadATP = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/atp')
      setAtpList(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createATP = useCallback(async (atpData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/atp', atpData)
      setAtpList((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateATP = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/atp/${id}`, updates)
      setAtpList((prev) => prev.map((a) => (a.id === id ? data : a)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteATP = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/atp/${id}`)
      setAtpList((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { atpList, setAtpList, loading, error, loadATP, createATP, updateATP, deleteATP }
}

export default useATP
