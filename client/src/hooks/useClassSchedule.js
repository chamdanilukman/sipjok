import { useState, useCallback } from 'react'
import { api } from '../lib/api'

/**
 * Custom hook for managing class schedules
 * Handles CRUD operations
 */
const useClassSchedule = () => {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Days of week mapping
  const DAYS_OF_WEEK = {
    0: 'Senin',
    1: 'Selasa',
    2: 'Rabu',
    3: 'Kamis',
    4: 'Jumat',
    5: 'Sabtu',
  }

  /**
   * Load schedules for authenticated user
   */
  const loadSchedules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/schedules')
      setSchedules(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading schedules:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load schedules for a specific class
   */
  const loadSchedulesByClass = useCallback(async (classId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get(`/schedules/class/${classId}`)
      setSchedules(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading class schedules:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new schedule
   */
  const createSchedule = useCallback(async (scheduleData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/schedules', scheduleData)
      setSchedules((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error creating schedule:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update a schedule
   */
  const updateSchedule = useCallback(async (scheduleId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/schedules/${scheduleId}`, updates)
      setSchedules((prev) => prev.map((s) => (s.id === scheduleId ? data : s)))
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error updating schedule:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete a schedule
   */
  const deleteSchedule = useCallback(async (scheduleId) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/schedules/${scheduleId}`)
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
    } catch (err) {
      setError(err.message)
      console.error('Error deleting schedule:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    schedules,
    setSchedules,
    loading,
    error,
    DAYS_OF_WEEK,
    loadSchedules,
    loadSchedulesByClass,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
}

export default useClassSchedule
