import { useState, useCallback } from 'react'
import { api } from '../lib/api'

// Kategori ekstrakurikuler
export const KATEGORI_EXTRACURRICULAR = {
  olahraga: { label: 'Olahraga', badge: 'bg-green-100 text-green-800' },
  seni: { label: 'Seni', badge: 'bg-pink-100 text-pink-800' },
  keagamaan: { label: 'Keagamaan', badge: 'bg-purple-100 text-purple-800' },
  kepemimpinan: { label: 'Kepemimpinan', badge: 'bg-blue-100 text-blue-800' },
  teknologi: { label: 'Teknologi', badge: 'bg-cyan-100 text-cyan-800' },
}

// Contoh ekstrakurikuler umum di SD (fokus PJOK + umum)
export const CONTOH_EXTRACURRICULAR = [
  'Sepak Bola', 'Futsal', 'Bola Voli', 'Bola Basket', 'Bulu Tangkis',
  'Tenis Meja', 'Renang', 'Atletik', 'Pencak Silat', 'Karate',
  'Taekwondo', 'Senam', 'Tari Tradisional', 'Drum Band', 'Pramuka',
  'PMR', 'HIMPU', 'Ansamble', 'Robotika', 'Tahfidz',
]

export const STATUS_EXTRACURRICULAR = {
  aktif: { label: 'Aktif', badge: 'bg-green-100 text-green-800' },
  nonaktif: { label: 'Nonaktif', badge: 'bg-gray-100 text-gray-800' },
}

const useExtracurricularPrograms = () => {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPrograms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/extracurricular-programs')
      setPrograms(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createProgram = useCallback(async (userId, programData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/extracurricular-programs', programData)
      setPrograms((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProgram = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/extracurricular-programs/${id}`, updates)
      setPrograms((prev) => prev.map((p) => (p.id === id ? data : p)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProgram = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/extracurricular-programs/${id}`)
      setPrograms((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { programs, setPrograms, loading, error, loadPrograms, createProgram, updateProgram, deleteProgram }
}

export default useExtracurricularPrograms
