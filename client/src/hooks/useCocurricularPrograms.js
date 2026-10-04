import { useState, useCallback } from 'react'
import { api } from '../lib/api'

// Tema kokurikuler (berlanjut dari tema P5 - Permendikdasmen 13/2025)
export const TEMA_KOKURIKULER = [
  'Bangunlah Jiwa dan Raganya',
  'Gaya Hidup Berkelanjutan',
  'Kearifan Lokal',
  'Bhinneka Tunggal Ika',
  'Suara Demokrasi',
  'Rekayasa dan Teknologi',
  'Kewirausahaan',
  'Kebekerjaan',
]

// 8 Dimensi Profil Lulusan - Permendikdasmen No. 10 & 13 Tahun 2025.
// Chip memakai satu gaya warna yang sama (palet ketat, R-29): hierarki datang
// dari teks label, bukan warna.
export const DIMENSI_PROFIL_LULUSAN = [
  { key: 'keimanan', label: 'Keimanan dan Ketakwaan kepada Tuhan YME', badge: 'bg-blue-50 text-blue-700' },
  { key: 'kewargaan', label: 'Kewargaan', badge: 'bg-blue-50 text-blue-700' },
  { key: 'penalaran_kritis', label: 'Penalaran Kritis', badge: 'bg-blue-50 text-blue-700' },
  { key: 'kreativitas', label: 'Kreativitas', badge: 'bg-blue-50 text-blue-700' },
  { key: 'kolaborasi', label: 'Kolaborasi', badge: 'bg-blue-50 text-blue-700' },
  { key: 'kemandirian', label: 'Kemandirian', badge: 'bg-blue-50 text-blue-700' },
  { key: 'kesehatan', label: 'Kesehatan', badge: 'bg-blue-50 text-blue-700' },
  { key: 'komunikasi', label: 'Komunikasi', badge: 'bg-blue-50 text-blue-700' },
]

export const STATUS_PROGRAM = {
  rencana: { label: 'Rencana', badge: 'bg-blue-100 text-blue-800' },
  berjalan: { label: 'Berjalan', badge: 'bg-yellow-100 text-yellow-800' },
  selesai: { label: 'Selesai', badge: 'bg-green-100 text-green-800' },
}

const useCocurricularPrograms = () => {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPrograms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/cocurricular-programs')
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
      const data = await api.post('/cocurricular-programs', programData)
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
      const data = await api.put(`/cocurricular-programs/${id}`, updates)
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
      await api.delete(`/cocurricular-programs/${id}`)
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

export default useCocurricularPrograms
