import { useState, useCallback } from 'react'
import { api } from '../lib/api'

// Rubrik level KKTP default (urut dari skor terendah) — dipakai form saat
// membuat kriteria baru sebelum guru mengubahnya
export const DEFAULT_INDICATORS = [
  { level: 'Belum Berkembang', min_score: 0, max_score: 59, description: 'Perlu bimbingan penuh dalam melakukan gerakan dasar.' },
  { level: 'Mulai Berkembang', min_score: 60, max_score: 69, description: 'Mulai mampu melakukan gerakan dasar dengan bantuan.' },
  { level: 'Berkembang Sesuai Harapan', min_score: 70, max_score: 84, description: 'Mampu melakukan gerakan dasar sesuai target pembelajaran.' },
  { level: 'Sangat Berkembang', min_score: 85, max_score: 100, description: 'Mampu melakukan gerakan dasar dengan sangat baik dan konsisten.' },
]

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

  const createKKTP = useCallback(async (userId, kktpData) => {
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

  const searchKKTP = useCallback(async (userId, keyword) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/kktp')
      const q = String(keyword || '').toLowerCase()
      const rows = (data || []).filter((k) =>
        `${k.subject || ''} ${k.tujuan_pembelajaran || ''}`.toLowerCase().includes(q)
      )
      setKktpList(rows)
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const filterKKTP = useCallback(async (userId, filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/kktp')
      const rows = (data || []).filter((k) =>
        (!filters.fase || k.fase === filters.fase) &&
        (!filters.kelas || String(k.kelas) === String(filters.kelas))
      )
      setKktpList(rows)
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Konversi skor 0-100 menjadi label level capaiannya
  const getLevelFromScore = useCallback((score) => {
    const n = Number(score)
    if (!Number.isFinite(n)) return null
    if (n >= 85) return DEFAULT_INDICATORS[3].level
    if (n >= 70) return DEFAULT_INDICATORS[2].level
    if (n >= 60) return DEFAULT_INDICATORS[1].level
    return DEFAULT_INDICATORS[0].level
  }, [])

  return { kktpList, setKktpList, loading, error, loadKKTP, createKKTP, updateKKTP, deleteKKTP, searchKKTP, filterKKTP, DEFAULT_INDICATORS, getLevelFromScore }
}

export default useKKTP
