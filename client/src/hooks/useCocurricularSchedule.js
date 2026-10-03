import { useState, useCallback } from 'react'
import { api } from '../lib/api'

// Urutan hari sama dengan classSchedules: 0=Senin ... 6=Minggu
export const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const useCocurricularSchedule = () => {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadSchedules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/cocurricular-schedules')
      setSchedules(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createSchedule = useCallback(async (userId, scheduleData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/cocurricular-schedules', scheduleData)
      setSchedules((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSchedule = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/cocurricular-schedules/${id}`, updates)
      setSchedules((prev) => prev.map((s) => (s.id === id ? data : s)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteSchedule = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/cocurricular-schedules/${id}`)
      setSchedules((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { schedules, setSchedules, loading, error, loadSchedules, createSchedule, updateSchedule, deleteSchedule }
}

export default useCocurricularSchedule
