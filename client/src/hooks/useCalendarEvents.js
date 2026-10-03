import { useState, useCallback } from 'react'
import { api } from '../lib/api'

// Kategori event kalender akademik — class Tailwind ditulis literal agar
// tidak dibuang oleh purge/JIT (kelas dinamis `bg-${color}-*` tidak terdeteksi)
export const CATEGORIES = {
  pembelajaran: { label: 'Pembelajaran', color: 'blue', badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  ujian: { label: 'Ujian', color: 'red', badge: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  kegiatan: { label: 'Kegiatan', color: 'green', badge: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  libur: { label: 'Libur', color: 'yellow', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  kurikulum: { label: 'Kurikulum', color: 'purple', badge: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
}

const useCalendarEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getCategoryInfo = useCallback((key) => CATEGORIES[key] || CATEGORIES.kegiatan, [])

  const getEventsForDate = useCallback(
    (dateStr) => events.filter((e) => (e.tanggal_mulai || '').slice(0, 10) === String(dateStr || '').slice(0, 10)),
    [events]
  )

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/calendar')
      setEvents(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = useCallback(async (userId, eventData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/calendar', eventData)
      setEvents((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateEvent = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/calendar/${id}`, updates)
      setEvents((prev) => prev.map((e) => (e.id === id ? data : e)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteEvent = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/calendar/${id}`)
      setEvents((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { events, setEvents, loading, error, loadEvents, createEvent, updateEvent, deleteEvent, CATEGORIES, getCategoryInfo, getEventsForDate }
}

export default useCalendarEvents
