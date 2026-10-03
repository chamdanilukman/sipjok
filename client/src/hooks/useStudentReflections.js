import { useState, useCallback } from 'react'
import { api } from '../lib/api'

// Perasaan siswa (untuk SD fase A/B, pakai emoji sederhana)
export const PERASAAN_SISWA = {
  senang: { label: 'Senang', emoji: '😊', badge: 'bg-green-100 text-green-800' },
  biasa: { label: 'Biasa saja', emoji: '😐', badge: 'bg-yellow-100 text-yellow-800' },
  sedih: { label: 'Sedih/Kesulitan', emoji: '😢', badge: 'bg-red-100 text-red-800' },
}

// Pertanyaan refleksi mengikuti pengalaman belajar "merefleksi" dalam
// kerangka Pembelajaran Mendalam (Permendikdasmen No. 13 Tahun 2025)
export const PERTANYAAN_REFLEKSI = {
  yang_dipelajari: 'Apa yang aku pelajari hari ini?',
  kesulitan: 'Bagian mana yang masih sulit untukku?',
  rencana: 'Apa yang ingin aku pelajari atau perbaiki lagi?',
}

// Label tingkat pemahaman 1-5
export const TINGKAT_PAHAM_LABEL = {
  1: 'Belum paham',
  2: 'Masih bingung',
  3: 'Cukup paham',
  4: 'Paham',
  5: 'Paham sekali',
}

const useStudentReflections = () => {
  const [reflections, setReflections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadReflections = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/student-reflections')
      setReflections(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createReflection = useCallback(async (userId, reflectionData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/student-reflections', reflectionData)
      setReflections((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateReflection = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/student-reflections/${id}`, updates)
      setReflections((prev) => prev.map((r) => (r.id === id ? data : r)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteReflection = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/student-reflections/${id}`)
      setReflections((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { reflections, setReflections, loading, error, loadReflections, createReflection, updateReflection, deleteReflection }
}

export default useStudentReflections
