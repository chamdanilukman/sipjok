import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

/**
 * Custom hook for managing class schedules
 * Handles CRUD operations and conflict detection
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
   * Load schedules for a specific teacher
   */
  const loadSchedules = useCallback(async (teacherId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('class_schedules')
        .select(`
          *,
          classes:class_id (id, name, grade)
        `)
        .eq('teacher_id', teacherId)
        .order('day_of_week', { ascending: true })
        .order('time_start', { ascending: true })

      if (err) throw err
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
      const { data, error: err } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('class_id', classId)
        .order('day_of_week', { ascending: true })
        .order('time_start', { ascending: true })

      if (err) throw err
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
   * Check for schedule conflicts
   */
  const checkConflict = useCallback(async (teacherId, dayOfWeek, timeStart, timeEnd, excludeId = null) => {
    try {
      let query = supabase
        .from('class_schedules')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('day_of_week', dayOfWeek)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error: err } = await query

      if (err) throw err

      // Check for time overlap
      const hasConflict = data.some((schedule) => {
        const existingStart = schedule.time_start
        const existingEnd = schedule.time_end
        return !(timeEnd <= existingStart || timeStart >= existingEnd)
      })

      return hasConflict
    } catch (err) {
      console.error('Error checking conflict:', err)
      throw err
    }
  }, [])

  /**
   * Create a new schedule
   */
  const createSchedule = useCallback(async (teacherId, scheduleData) => {
    setLoading(true)
    setError(null)
    try {
      // Check for conflicts
      const hasConflict = await checkConflict(
        teacherId,
        scheduleData.day_of_week,
        scheduleData.time_start,
        scheduleData.time_end
      )

      if (hasConflict) {
        throw new Error('Jadwal bentrok dengan jadwal yang sudah ada')
      }

      const { data, error: err } = await supabase
        .from('class_schedules')
        .insert([
          {
            ...scheduleData,
            teacher_id: teacherId,
          },
        ])
        .select()

      if (err) throw err

      setSchedules((prev) => [...prev, data[0]])
      return data[0]
    } catch (err) {
      setError(err.message)
      console.error('Error creating schedule:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [checkConflict])

  /**
   * Update an existing schedule
   */
  const updateSchedule = useCallback(
    async (scheduleId, updates) => {
      setLoading(true)
      setError(null)
      try {
        // Get current schedule to check conflicts
        const currentSchedule = schedules.find((s) => s.id === scheduleId)
        if (!currentSchedule) throw new Error('Schedule not found')

        // Check for conflicts if time changed
        if (
          updates.day_of_week !== undefined ||
          updates.time_start !== undefined ||
          updates.time_end !== undefined
        ) {
          const hasConflict = await checkConflict(
            currentSchedule.teacher_id,
            updates.day_of_week || currentSchedule.day_of_week,
            updates.time_start || currentSchedule.time_start,
            updates.time_end || currentSchedule.time_end,
            scheduleId
          )

          if (hasConflict) {
            throw new Error('Jadwal bentrok dengan jadwal yang sudah ada')
          }
        }

        const { data, error: err } = await supabase
          .from('class_schedules')
          .update(updates)
          .eq('id', scheduleId)
          .select()

        if (err) throw err

        setSchedules((prev) =>
          prev.map((s) => (s.id === scheduleId ? data[0] : s))
        )
        return data[0]
      } catch (err) {
        setError(err.message)
        console.error('Error updating schedule:', err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [schedules, checkConflict]
  )

  /**
   * Delete a schedule
   */
  const deleteSchedule = useCallback(async (scheduleId) => {
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('class_schedules')
        .delete()
        .eq('id', scheduleId)

      if (err) throw err

      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
    } catch (err) {
      setError(err.message)
      console.error('Error deleting schedule:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get day name from day number
   */
  const getDayName = useCallback((dayNumber) => {
    return DAYS_OF_WEEK[dayNumber] || 'Unknown'
  }, [])

  /**
   * Get schedules for a specific day
   */
  const getSchedulesByDay = useCallback((dayOfWeek) => {
    return schedules.filter((s) => s.day_of_week === dayOfWeek)
  }, [schedules])

  return {
    schedules,
    setSchedules,
    loading,
    error,
    DAYS_OF_WEEK,
    loadSchedules,
    loadSchedulesByClass,
    checkConflict,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getDayName,
    getSchedulesByDay,
  }
}

export default useClassSchedule

