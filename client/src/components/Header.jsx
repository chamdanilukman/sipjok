import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useTeacherProfile from '../hooks/useTeacherProfile'
import { signOut, getCurrentUserId } from '../config/auth'
import { useAcademicYear } from '../context/AcademicYearContext'

export const Header = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const { profile, loadProfile } = useTeacherProfile()
  const { academicYear, setAcademicYear, availableYears, currentAcademicYear } = useAcademicYear()
  const [userId, setUserId] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showTpMenu, setShowTpMenu] = useState(false)
  const dropdownRef = useRef(null)
  const tpMenuRef = useRef(null)

  // Get current user and load profile
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const id = await getCurrentUserId()
        setUserId(id)
        loadProfile(id)
      } catch {
        navigate('/login')
      }
    }
    getCurrentUser()
  }, [loadProfile, navigate])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (tpMenuRef.current && !tpMenuRef.current.contains(event.target)) {
        setShowTpMenu(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false)
        setShowTpMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Left side - Menu button (Touch-friendly 44px) */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          title="Toggle sidebar"
          data-testid="button-toggle-menu"
        >
          <i className="fas fa-bars text-xl text-gray-700"></i>
        </button>

        {/* Center - Title (Responsive) */}
        <div className="flex-1 text-center px-2">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <i className="fas fa-dumbbell text-blue-600"></i>
            <span>SIPJOK</span>
          </h1>
        </div>

        {/* Right side - Tahun ajaran + User menu */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Pilihan Tahun Ajaran (TP) — dipakai filter Dashboard & Rekap */}
          <div className="relative" ref={tpMenuRef}>
            <button
              onClick={() => setShowTpMenu(!showTpMenu)}
              className="flex items-center gap-2 px-2 sm:px-3 min-h-[44px] rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              title="Pilih tahun ajaran"
              data-testid="button-tahun-ajaran"
            >
              <i className="fas fa-calendar-alt text-blue-600"></i>
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                <span className="hidden sm:inline">TP </span>{academicYear}
              </span>
              <i className={`fas fa-chevron-down text-xs text-gray-500 transition-transform duration-200 ${showTpMenu ? 'rotate-180' : ''}`}></i>
            </button>

            {showTpMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">Tahun Ajaran</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Data Dashboard &amp; Rekap mengikuti TP yang dipilih
                  </p>
                </div>
                <div className="py-2 max-h-64 overflow-y-auto">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setAcademicYear(year)
                        setShowTpMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-100 transition-colors ${
                        year === academicYear ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                      }`}
                      data-testid={`tp-option-${year}`}
                    >
                      <span className="flex items-center gap-2">
                        <span>TP {year}</span>
                        {year === currentAcademicYear && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                            Berjalan
                          </span>
                        )}
                      </span>
                      {year === academicYear && <i className="fas fa-check text-blue-600"></i>}
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <p className="text-xs text-gray-400">
                    Daftar TP ikut bertambah saat kelas dibuat dengan tahun ajaran baru
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notifications (Touch-friendly) */}
          <button 
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            data-testid="button-notifications"
          >
            <i className="fas fa-bell text-lg sm:text-xl text-gray-700"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity min-h-[44px]"
              data-testid="button-user-menu"
            >
              {/* Profile Photo */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden bg-blue-600 border-2 border-blue-600">
                {profile?.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fas fa-user text-white text-sm"></i>
                )}
              </div>

              {/* User Info - Hidden on small mobile */}
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 text-left">
                  {profile?.nama_lengkap || 'Guru PJOK'}
                </p>
                <p className="text-xs text-gray-500">Online</p>
              </div>

              {/* Dropdown Arrow */}
              <i className={`fas fa-chevron-down text-xs text-gray-600 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}></i>
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

