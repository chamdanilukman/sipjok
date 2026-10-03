import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useTeacherProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/teacher-profile')
      setProfile(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createProfile = useCallback(async (profileData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/teacher-profile', profileData)
      setProfile(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put('/teacher-profile', updates)
      setProfile(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { profile, setProfile, loading, error, loadProfile, createProfile, updateProfile }
}

export default useTeacherProfile
