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

  const uploadProfilePhoto = useCallback(async (userId, file) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.upload('/uploads', file)
      const data = await api.put('/teacher-profile', {
        profile_photo_url: result.url,
        profile_photo_path: result.path,
      })
      setProfile(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProfilePhoto = useCallback(async (userId, filePath) => {
    setLoading(true)
    setError(null)
    try {
      if (filePath) {
        await api.delete(`/uploads?path=${encodeURIComponent(filePath)}`)
      }
      const data = await api.put('/teacher-profile', {
        profile_photo_url: null,
        profile_photo_path: null,
      })
      setProfile(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Nama lama yang dipakai halaman profil & ProfileContext: (userId, data)
  const saveProfile = useCallback(async (userId, profileData) => updateProfile(profileData || {}), [updateProfile])

  return { profile, setProfile, loading, error, loadProfile, createProfile, updateProfile, saveProfile, uploadProfilePhoto, deleteProfilePhoto }
}

export default useTeacherProfile
