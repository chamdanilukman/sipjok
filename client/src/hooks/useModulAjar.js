import { useState, useCallback } from 'react'
import { api } from '../lib/api'

/**
 * Wizard Modul Ajar bekerja dengan bentuk "rich" (title, tujuan_pembelajaran array,
 * asesmen object, skenario_pembelajaran, dst.) sedangkan tabel modul_ajar berbentuk
 * flat (judul, kolom teks) + kolom jsonb `data` untuk menyimpan payload wizard apa
 * adanya. Mapper di bawah menjembatani keduanya:
 *  - toRow: payload wizard -> body POST/PUT (kolom inti + data JSON)
 *  - toRich: baris DB -> objek yang dipahami halaman & ModuleCard
 */
const toRow = (p) => ({
  judul: p.title ?? p.judul ?? '',
  atp_id: p.atp_id ?? null,
  fase: p.fase ?? null,
  kelas: p.kelas != null ? String(p.kelas) : null,
  capaian_pembelajaran: p.capaian_pembelajaran ?? null,
  alokasi_waktu: p.alokasi_waktu != null ? String(p.alokasi_waktu) : null,
  status: p.status ?? 'draft',
  data: p,
})

const toRich = (row) => ({
  ...(row.data || {}),
  ...row,
  title: (row.data && row.data.title) || row.judul,
  status: row.status || (row.data && row.data.status) || 'draft',
})

const useModulAjar = () => {
  const [modulAjar, setModulAjar] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadModulAjar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/modul-ajar')
      const rows = (data || []).map(toRich)
      setModulAjar(rows)
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createModulAjar = useCallback(async (userId, payload) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/modul-ajar', toRow(payload || {}))
      const rich = toRich(data)
      setModulAjar((prev) => [rich, ...prev])
      return rich
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateModulAjar = useCallback(async (id, payload) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/modul-ajar/${id}`, toRow(payload || {}))
      const rich = toRich(data)
      setModulAjar((prev) => prev.map((m) => (m.id === id ? rich : m)))
      return rich
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

  // Duplikat modul: muat sumber, simpan sebagai draft baru berjudul "(Salinan)"
  const copyModulAjar = useCallback(async (userId, id) => {
    setLoading(true)
    setError(null)
    try {
      const src = await api.get(`/modul-ajar/${id}`)
      const srcRich = toRich(src)
      const payload = { ...srcRich, title: `${srcRich.title || srcRich.judul} (Salinan)`, status: 'draft' }
      const data = await api.post('/modul-ajar', toRow(payload))
      const rich = toRich(data)
      setModulAjar((prev) => [rich, ...prev])
      return rich
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const searchModulAjar = useCallback(async (userId, keyword) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/modul-ajar')
      const q = String(keyword || '').toLowerCase()
      const rows = (data || [])
        .map(toRich)
        .filter((m) => `${m.title || ''} ${m.judul || ''}`.toLowerCase().includes(q))
      setModulAjar(rows)
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const filterModulAjar = useCallback(async (userId, filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/modul-ajar')
      const rows = (data || [])
        .map(toRich)
        .filter((m) =>
          (!filters.fase || m.fase === filters.fase) &&
          (!filters.kelas || String(m.kelas) === String(filters.kelas)) &&
          (!filters.status || m.status === filters.status)
        )
      setModulAjar(rows)
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    modulAjar,
    modulList: modulAjar, // alias nama lama yang dipakai halaman
    setModulAjar,
    loading,
    error,
    loadModulAjar,
    createModulAjar,
    updateModulAjar,
    deleteModulAjar,
    copyModulAjar,
    searchModulAjar,
    filterModulAjar,
  }
}

export default useModulAjar
