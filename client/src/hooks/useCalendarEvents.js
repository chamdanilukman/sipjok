import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useCalendarEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  const createEvent = useCallback(async (eventData) => {
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

  return { events, setEvents, loading, error, loadEvents, createEvent, updateEvent, deleteEvent }
}

export default useCalendarEvents
