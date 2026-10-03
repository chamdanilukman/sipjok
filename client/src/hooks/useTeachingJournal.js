import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useTeachingJournal = () => {
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadJournals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/journals')
      setJournals(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createJournal = useCallback(async (userId, journalData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/journals', journalData)
      setJournals((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateJournal = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/journals/${id}`, updates)
      setJournals((prev) => prev.map((j) => (j.id === id ? data : j)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteJournal = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/journals/${id}`)
      setJournals((prev) => prev.filter((j) => j.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Laporan: seluruh jurnal dalam rentang tanggal (inklusif)
  const loadJournalsByDateRange = useCallback(async (userId, startDate, endDate) => {
    setLoading(true)
    setError(null)
    try {
      const all = await api.get('/journals')
      const rows = (all || []).filter((j) => {
        const d = String(j.tanggal || '').slice(0, 10)
        return (!startDate || d >= startDate) && (!endDate || d <= endDate)
      })
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { journals, setJournals, loading, error, loadJournals, loadJournalsByDateRange, createJournal, updateJournal, deleteJournal }
}

export default useTeachingJournal
