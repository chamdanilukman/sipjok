import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import { api } from '../../lib/api'

export const ChangePassword = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [saving, setSaving] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleShow = (key) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.current_password) {
      showNotification('Kata sandi saat ini wajib diisi', 'error')
      return
    }
    if (formData.new_password.length < 8) {
      showNotification('Kata sandi baru minimal 8 karakter', 'error')
      return
    }
    if (formData.new_password !== formData.confirm_password) {
      showNotification('Konfirmasi kata sandi baru tidak sama', 'error')
      return
    }
    if (formData.new_password === formData.current_password) {
      showNotification('Kata sandi baru harus berbeda dari kata sandi saat ini', 'error')
      return
    }

    setSaving(true)
    try {
      await api.post('/auth/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password,
      })
      showNotification('Kata sandi berhasil diubah', 'success')
      setFormData({ current_password: '', new_password: '', confirm_password: '' })
      navigate('/profile/teacher-profile')
    } catch (err) {
      showNotification(err.message || 'Gagal mengubah kata sandi', 'error')
    } finally {
      setSaving(false)
    }
  }

  const passwordField = (label, name, key) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={showPasswords[key] ? 'text' : 'password'}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          autoComplete={name === 'current_password' ? 'current-password' : 'new-password'}
          className="w-full min-h-[44px] pl-3 pr-11 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => toggleShow(key)}
          className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
          aria-label={showPasswords[key] ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        >
          <i className={`fas ${showPasswords[key] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ubah Kata Sandi</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Amankan akun Anda dengan kata sandi baru minimal 8 karakter
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        {passwordField('Kata Sandi Saat Ini *', 'current_password', 'current')}
        {passwordField('Kata Sandi Baru *', 'new_password', 'next')}
        {passwordField('Ulangi Kata Sandi Baru *', 'confirm_password', 'confirm')}

        <p className="text-xs text-gray-500">
          Setelah diubah, gunakan kata sandi baru untuk masuk berikutnya.
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/profile/teacher-profile')}
            className="min-h-[44px] px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium"
          >
            {saving ? (
              <><i className="fas fa-spinner fa-spin mr-2"></i>Menyimpan...</>
            ) : (
              <><i className="fas fa-key mr-2"></i>Simpan Kata Sandi</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChangePassword
