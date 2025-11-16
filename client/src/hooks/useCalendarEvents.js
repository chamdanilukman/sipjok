import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

/**
 * Custom hook for managing calendar events
 * Handles event CRUD operations with color-coded categories
 */
export const useCalendarEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Event categories with colors
  const CATEGORIES = {
    pembelajaran: { label: 'Pembelajaran', color: 'green', icon: 'fas fa-book' },
    ekstrakurikuler: { label: 'Ekstrakurikuler', color: 'blue', icon: 'fas fa-star' },
    ujian: { label: 'Ujian', color: 'red', icon: 'fas fa-file-alt' },
    event_khusus: { label: 'Event Khusus', color: 'yellow', icon: 'fas fa-calendar-alt' },
    libur: { label: 'Libur', color: 'gray', icon: 'fas fa-umbrella-beach' },
  }

  /**
   * Load calendar events for a specific month
   */
  const loadEvents = useCallback(async (userId, year, month) => {
    setLoading(true)
    setError(null)
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const { data, error: err } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('tanggal_mulai', startDate)
        .lte('tanggal_mulai', endDate)
        .order('tanggal_mulai', { ascending: true })

      if (err) throw err

      setEvents(data || [])
      return data
    } catch (err) {
      const errorMessage = err.message || 'Failed to load events'
      setError(errorMessage)
      console.error('Error loading events:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load all events for a user
   */
  const loadAllEvents = useCallback(async (userId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('tanggal_mulai', { ascending: true })

      if (err) throw err

      setEvents(data || [])
      return data
    } catch (err) {
      const errorMessage = err.message || 'Failed to load events'
      setError(errorMessage)
      console.error('Error loading events:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create new calendar event
   */
  const createEvent = useCallback(async (userId, eventData) => {
    setLoading(true)
    setError(null)
    try {
      const { data: newEvent, error: err } = await supabase
        .from('calendar_events')
        .insert([
          {
            user_id: userId,
            ...eventData,
            peserta: eventData.peserta ? JSON.stringify(eventData.peserta) : null,
          },
        ])
        .select()
        .single()

      if (err) throw err

      setEvents((prev) => [...prev, newEvent])
      return newEvent
    } catch (err) {
      const errorMessage = err.message || 'Failed to create event'
      setError(errorMessage)
      console.error('Error creating event:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update calendar event
   */
  const updateEvent = useCallback(async (eventId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const { data: updatedEvent, error: err } = await supabase
        .from('calendar_events')
        .update({
          ...updates,
          peserta: updates.peserta ? JSON.stringify(updates.peserta) : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .select()
        .single()

      if (err) throw err

      setEvents((prev) =>
        prev.map((event) => (event.id === eventId ? updatedEvent : event))
      )
      return updatedEvent
    } catch (err) {
      const errorMessage = err.message || 'Failed to update event'
      setError(errorMessage)
      console.error('Error updating event:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete calendar event
   */
  const deleteEvent = useCallback(async (eventId) => {
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)

      if (err) throw err

      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      return true
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete event'
      setError(errorMessage)
      console.error('Error deleting event:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get events for a specific date
   */
  const getEventsForDate = useCallback((date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter((event) => event.tanggal_mulai === dateStr)
  }, [events])

  /**
   * Get category info
   */
  const getCategoryInfo = useCallback((kategori) => {
    return CATEGORIES[kategori] || CATEGORIES.pembelajaran
  }, [])

  return {
    events,
    setEvents,
    loading,
    error,
    CATEGORIES,
    loadEvents,
    loadAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getCategoryInfo,
  }
}

export default useCalendarEvents

