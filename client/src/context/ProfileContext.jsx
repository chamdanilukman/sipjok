import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import useTeacherProfile from '../hooks/useTeacherProfile'
import { api } from '../lib/api'

const ProfileContext = createContext()

/**
 * ProfileProvider - Manages teacher profile data synchronization across the application
 * Ensures profile photo and name are synced in header, dropdown, and profile page
 */
export const ProfileProvider = ({ children }) => {
  const { profile, loadProfile, saveProfile, uploadProfilePhoto, deleteProfilePhoto } = useTeacherProfile()
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user and load profile on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          await loadProfile(user.id)
        }
      } catch (err) {
        console.error('Error initializing user:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()
  }, [loadProfile])

  /**
   * Update profile and sync across all components
   */
  const updateProfile = useCallback(async (profileData) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const updatedProfile = await saveProfile(userId, profileData)
      // Profile state is automatically updated by the hook
      return updatedProfile
    } catch (err) {
      console.error('Error updating profile:', err)
      throw err
    }
  }, [userId, saveProfile])

  /**
   * Upload profile photo and sync across all components
   */
  const updateProfilePhoto = useCallback(async (file) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const updatedProfile = await uploadProfilePhoto(userId, file)
      // Profile state is automatically updated by the hook
      return updatedProfile
    } catch (err) {
      console.error('Error uploading photo:', err)
      throw err
    }
  }, [userId, uploadProfilePhoto])

  /**
   * Delete profile photo and sync across all components
   */
  const removeProfilePhoto = useCallback(async () => {
    if (!userId || !profile?.profile_photo_path) {
      throw new Error('No photo to delete')
    }

    try {
      const updatedProfile = await deleteProfilePhoto(userId, profile.profile_photo_path)
      // Profile state is automatically updated by the hook
      return updatedProfile
    } catch (err) {
      console.error('Error deleting photo:', err)
      throw err
    }
  }, [userId, profile?.profile_photo_path, deleteProfilePhoto])

  /**
   * Reload profile from database
   */
  const reloadProfile = useCallback(async () => {
    if (!userId) return

    try {
      await loadProfile(userId)
    } catch (err) {
      console.error('Error reloading profile:', err)
      throw err
    }
  }, [userId, loadProfile])

  const value = {
    // Profile data
    profile,
    userId,
    isLoading,

    // Profile operations
    updateProfile,
    updateProfilePhoto,
    removeProfilePhoto,
    reloadProfile,

    // Derived values for easy access
    profilePhotoUrl: profile?.profile_photo_url || null,
    teacherName: profile?.nama_lengkap || 'Guru PJOK',
    teacherEmail: profile?.email || '',
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

/**
 * Hook to use ProfileContext
 */
export const useProfileContext = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfileContext must be used within ProfileProvider')
  }
  return context
}

export default ProfileContext

