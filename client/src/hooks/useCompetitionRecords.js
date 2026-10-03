import { useState, useCallback } from 'react'
import { api } from '../lib/api'

// Tingkat kompetisi (alur pembinaan prestasi PJOK)
export const TINGKAT_LOMBA = {
  sekolah: { label: 'Sekolah', badge: 'bg-gray-100 text-gray-800' },
  kecamatan: { label: 'Kecamatan', badge: 'bg-blue-100 text-blue-800' },
  kabupaten: { label: 'Kabupaten/Kota', badge: 'bg-purple-100 text-purple-800' },
  provinsi: { label: 'Provinsi', badge: 'bg-amber-100 text-amber-800' },
  nasional: { label: 'Nasional', badge: 'bg-red-100 text-red-800' },
  internasional: { label: 'Internasional', badge: 'bg-emerald-100 text-emerald-800' },
}

// Hasil lomba
export const HASIL_LOMBA = {
  'Juara 1': { badge: 'bg-yellow-100 text-yellow-800', medal: '🥇' },
  'Juara 2': { badge: 'bg-gray-100 text-gray-800', medal: '🥈' },
  'Juara 3': { badge: 'bg-orange-100 text-orange-800', medal: '🥉' },
  'Juara Harapan': { badge: 'bg-blue-100 text-blue-800', medal: '🏅' },
  Finalis: { badge: 'bg-purple-100 text-purple-800', medal: '🎯' },
  Peserta: { badge: 'bg-gray-100 text-gray-600', medal: '🎖️' },
}

// Contoh cabang lomba PJOK (O2SN, POPDA, dsb.)
export const CONTOH_CABANG_LOMBA = [
  'Atletik Kids - Kanga Escape', 'Atletik - Lari 60m', 'Atletik - Lompat Jauh',
  'Renang Gaya Bebas', 'Renang Gaya Dada', 'Bulu Tangkis Tunggal',
  'Bulu Tangkis Ganda', 'Pencak Silat', 'Karate Kata', 'Karate Kumite',
  'Senam Aerobik', 'Senam Lantai', 'Sepak Bola', 'Futsal', 'Bola Voli',
  'Tenis Meja', 'Taekwondo', 'Jingle', 'Desain Poster', 'Video Kreatif',
]

const useCompetitionRecords = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/competition-records')
      setRecords(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createRecord = useCallback(async (userId, recordData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/competition-records', recordData)
      setRecords((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRecord = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/competition-records/${id}`, updates)
      setRecords((prev) => prev.map((r) => (r.id === id ? data : r)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteRecord = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/competition-records/${id}`)
      setRecords((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { records, setRecords, loading, error, loadRecords, createRecord, updateRecord, deleteRecord }
}

export default useCompetitionRecords
