import { useState, useCallback } from 'react'
import { api } from '../lib/api'

// Jenis kunjungan
export const JENIS_KUNJUNGAN = {
  'Supervisi Pembelajaran': { badge: 'bg-blue-100 text-blue-800' },
  'Monitoring Sarana': { badge: 'bg-green-100 text-green-800' },
  'Verifikasi Data': { badge: 'bg-purple-100 text-purple-800' },
  'Kunjungan Rutin': { badge: 'bg-gray-100 text-gray-800' },
}

// Jabatan pengunjung
export const JABATAN_PENGUNJUNG = ['Kepala Sekolah', 'Pengawas', 'Dinas Pendidikan', 'Guru', 'Instruktur Eksternal']

const useVisitationLog = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/visitation-logs')
      setLogs(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createLog = useCallback(async (userId, logData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/visitation-logs', logData)
      setLogs((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateLog = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/visitation-logs/${id}`, updates)
      setLogs((prev) => prev.map((l) => (l.id === id ? data : l)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteLog = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/visitation-logs/${id}`)
      setLogs((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { logs, setLogs, loading, error, loadLogs, createLog, updateLog, deleteLog }
}

export default useVisitationLog
