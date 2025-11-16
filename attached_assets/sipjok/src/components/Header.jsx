import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useTeacherProfile from '../hooks/useTeacherProfile'
import supabase from '../config/supabase'

export const Header = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const { profile, loadProfile } = useTeacherProfile()
  const [userId, setUserId] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Get current user and load profile
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        loadProfile(user.id)
      }
    }
    getCurrentUser()
  }, [loadProfile])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleEditProfile = () => {
    navigate('/profile/teacher-profile')
    setShowDropdown(false)
  }

  const handleChangePassword = () => {
    navigate('/profile/change-password')
    setShowDropdown(false)
  }

  const handleSettings = () => {
    navigate('/settings')
    setShowDropdown(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Toggle sidebar"
        >
          <i className="fas fa-bars text-xl text-gray-700"></i>
        </button>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            <i className="fas fa-dumbbell text-blue-600 mr-2"></i>
            SIPJOK
          </h1>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="fas fa-bell text-xl text-gray-700"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity"
            >
              {/* Profile Photo */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-blue-600 border-2 border-blue-600">
                {profile?.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fas fa-user text-white"></i>
                )}
              </div>

              {/* User Info */}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.nama_lengkap || 'Guru PJOK'}
                </p>
                <p className="text-xs text-gray-500">Online</p>
              </div>

              {/* Dropdown Arrow */}
              <i className={`fas fa-chevron-down text-xs text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">
                    {profile?.nama_lengkap || 'Guru PJOK'}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.email || 'guru@sekolah.id'}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleEditProfile}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-user-edit text-blue-600"></i>
                    Edit Profil
                  </button>

                  <button
                    onClick={handleChangePassword}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-lock text-blue-600"></i>
                    Ubah Password
                  </button>

                  <button
                    onClick={handleSettings}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-cog text-blue-600"></i>
                    Pengaturan
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

