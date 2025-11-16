import { useState, useCallback, useEffect } from 'react'
import supabase from '../config/supabase'

/**
 * Custom hook for managing teacher profile data
 * Handles profile CRUD operations and photo uploads
 */
export const useTeacherProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load teacher profile from Supabase
   */
  const loadProfile = useCallback(async (userId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (err && err.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is okay for new users
        throw err
      }

      setProfile(data || null)
      return data
    } catch (err) {
      const errorMessage = err.message || 'Failed to load profile'
      setError(errorMessage)
      console.error('Error loading profile:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Save or update teacher profile
   */
  const saveProfile = useCallback(async (userId, profileData) => {
    setLoading(true)
    setError(null)
    try {
      // Sanitize data: convert empty strings to null for integer/date fields
      const sanitizedData = { ...profileData }

      // Integer fields
      const integerFields = ['tahun_lulus', 'masa_kerja']
      integerFields.forEach(field => {
        if (sanitizedData[field] === '' || sanitizedData[field] === null || sanitizedData[field] === undefined) {
          sanitizedData[field] = null
        } else {
          sanitizedData[field] = parseInt(sanitizedData[field], 10)
        }
      })

      // Date fields
      const dateFields = ['tanggal_lahir', 'tmt']
      dateFields.forEach(field => {
        if (sanitizedData[field] === '' || sanitizedData[field] === null || sanitizedData[field] === undefined) {
          sanitizedData[field] = null
        }
      })

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      let result
      if (existingProfile) {
        // Update existing profile
        const { data, error: err } = await supabase
          .from('teacher_profiles')
          .update({
            ...sanitizedData,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()
          .single()

        if (err) throw err
        result = data
      } else {
        // Insert new profile
        const { data, error: err } = await supabase
          .from('teacher_profiles')
          .insert([
            {
              user_id: userId,
              ...sanitizedData,
            },
          ])
          .select()
          .single()

        if (err) throw err
        result = data
      }

      setProfile(result)
      return result
    } catch (err) {
      const errorMessage = err.message || 'Failed to save profile'
      setError(errorMessage)
      console.error('Error saving profile:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Upload profile photo to Supabase Storage
   */
  const uploadProfilePhoto = useCallback(async (userId, file) => {
    setLoading(true)
    setError(null)
    try {
      // Validate file
      if (!file) throw new Error('No file selected')
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB')
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        throw new Error('Only JPG and PNG files are allowed')
      }

      // Generate unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Upload to storage
      const { error: uploadErr } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true })

      if (uploadErr) throw uploadErr

      // Get public URL
      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath)

      const photoUrl = data.publicUrl

      // Update profile with photo URL
      const { data: updatedProfile, error: updateErr } = await supabase
        .from('teacher_profiles')
        .update({
          profile_photo_url: photoUrl,
          profile_photo_path: filePath,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (updateErr) throw updateErr

      setProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload photo'
      setError(errorMessage)
      console.error('Error uploading photo:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete profile photo
   */
  const deleteProfilePhoto = useCallback(async (userId, filePath) => {
    setLoading(true)
    setError(null)
    try {
      if (!filePath) throw new Error('No file path provided')

      // Delete from storage
      const { error: deleteErr } = await supabase.storage
        .from('profile-photos')
        .remove([filePath])

      if (deleteErr) throw deleteErr

      // Update profile to remove photo URL
      const { data: updatedProfile, error: updateErr } = await supabase
        .from('teacher_profiles')
        .update({
          profile_photo_url: null,
          profile_photo_path: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (updateErr) throw updateErr

      setProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete photo'
      setError(errorMessage)
      console.error('Error deleting photo:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    profile,
    setProfile,
    loading,
    error,
    loadProfile,
    saveProfile,
    uploadProfilePhoto,
    deleteProfilePhoto,
  }
}

export default useTeacherProfile

