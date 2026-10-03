import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useStudentAttendance = () => {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadAttendance = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/attendance')
      setAttendance(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createAttendance = useCallback(async (attendanceData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/attendance', attendanceData)
      setAttendance((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAttendance = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/attendance/${id}`, updates)
      setAttendance((prev) => prev.map((a) => (a.id === id ? data : a)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAttendance = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/attendance/${id}`)
      setAttendance((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { attendance, setAttendance, loading, error, loadAttendance, createAttendance, updateAttendance, deleteAttendance }
}

export default useStudentAttendance
