import React, { useState, useEffect, useRef } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useTeacherProfile from '../../hooks/useTeacherProfile'
import { api } from '../../lib/api'

export const TeacherProfile = () => {
  const { showNotification } = useNotification()
  const { profile, loading, error, loadProfile, saveProfile, uploadProfilePhoto, deleteProfilePhoto } = useTeacherProfile()
  // Nama key form = nama kolom teacher_profile di DB agar tidak ada field
  // yang terbuang saat disimpan (bug lama: hanya nip yang lolos validasi server)
  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    nuptk: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    agama: '',
    alamat: '',
    telepon: '',
    email: '',
    school_name: '',
    school_address: '',
    pendidikan_terakhir: '',
    jurusan: '',
    tahun_lulus: '',
    status_kepegawaian: '',
    tmt: '',
    golongan_pangkat: '',
    masa_kerja: '',
  })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)
  const [userId, setUserId] = useState(null)

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          loadProfile(user.id)
        }
      } catch (err) {
        console.error('Error getting current user:', err)
      }
    }
    getCurrentUser()
  }, [loadProfile])

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        nip: profile.nip || '',
        nuptk: profile.nuptk || '',
        tempat_lahir: profile.tempat_lahir || '',
        tanggal_lahir: profile.tanggal_lahir || '',
        jenis_kelamin: profile.jenis_kelamin || '',
        agama: profile.agama || '',
        alamat: profile.alamat || '',
        telepon: profile.phone || '',
        email: profile.email || '',
        school_name: profile.school_name || '',
        school_address: profile.school_address || '',
        pendidikan_terakhir: profile.pendidikan_terakhir || '',
        jurusan: profile.jurusan || '',
        tahun_lulus: profile.tahun_lulus || '',
        status_kepegawaian: profile.status_kepegawaian || '',
        tmt: profile.tmt || '',
        golongan_pangkat: profile.golongan_pangkat || '',
        masa_kerja: profile.masa_kerja || '',
      })
      if (profile.profile_photo_url) {
        setPhotoPreview(profile.profile_photo_url)
      }
    }
  }, [profile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadPhoto = async () => {
    if (!selectedFile || !userId) return

    setUploadingPhoto(true)
    try {
      await uploadProfilePhoto(userId, selectedFile)
      showNotification('Foto profil berhasil diupload', 'success')
      setSelectedFile(null)
      // Reload profile to get updated photo URL
      await loadProfile(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal mengupload foto', 'error')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!profile?.profile_photo_path || !userId) return

    if (!window.confirm('Apakah Anda yakin ingin menghapus foto profil?')) return

    setUploadingPhoto(true)
    try {
      await deleteProfilePhoto(userId, profile.profile_photo_path)
      showNotification('Foto profil berhasil dihapus', 'success')
      setPhotoPreview(null)
      await loadProfile(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus foto', 'error')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      showNotification('Nama lengkap harus diisi', 'error')
      return
    }

    setSaving(true)
    try {
      await saveProfile(userId, formData)
      showNotification('Profil berhasil disimpan', 'success')
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan profil', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profil Guru</h1>
        <p className="text-gray-600 mt-2">Kelola data pribadi, kualifikasi, dan sertifikasi guru</p>
      </div>

      {loading && !profile && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      )}

      {error && !profile && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between gap-3">
          <p className="text-red-800">
            <i className="fas fa-exclamation-circle mr-2"></i>
            Gagal memuat profil: {error}
          </p>
          <button
            type="button"
            onClick={() => userId && loadProfile(userId)}
            className="shrink-0 px-3 py-2 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-100 text-sm font-medium"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {error && profile && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {profile && !profile.name && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900">
          <i className="fas fa-circle-info mr-2 text-amber-600"></i>
          Nama lengkap belum diisi. Nama ini yang tampil di header dan pada cetakan dokumen seperti modul ajar, jadi
          isi dan simpan ya.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Foto Profil</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Photo Preview */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-user text-4xl text-gray-400"></i>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">JPG/PNG, Max 2MB</p>
            </div>

            {/* Upload Controls */}
            <div className="flex-1 flex flex-col justify-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-upload mr-2"></i>
                Pilih Foto
              </button>
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={uploadingPhoto}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Uploading...' : 'Upload Foto'}
                </button>
              )}
              {profile?.profile_photo_url && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  disabled={uploadingPhoto}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Hapus Foto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Personal Data Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Pribadi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama lengkap beserta gelar, contoh: Agus Afifudin, S.Pd."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NUPTK</label>
              <input
                type="text"
                name="nuptk"
                value={formData.nuptk}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
              <input
                type="text"
                name="tempat_lahir"
                value={formData.tempat_lahir}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                name="tanggal_lahir"
                value={formData.tanggal_lahir}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
              <select
                name="agama"
                value={formData.agama}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Kontak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
              <input
                type="tel"
                name="phone"
                value={formData.telepon}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah</label>
              <input
                type="text"
                name="school_name"
                value={formData.school_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: SD Negeri 3 Grobogan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Sekolah</label>
              <input
                type="text"
                name="school_address"
                value={formData.school_address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Education Background Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Latar Belakang Pendidikan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan Terakhir</label>
              <select
                name="pendidikan_terakhir"
                value={formData.pendidikan_terakhir}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Pendidikan</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
              <input
                type="text"
                name="jurusan"
                value={formData.jurusan}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Lulus</label>
              <input
                type="number"
                name="tahun_lulus"
                value={formData.tahun_lulus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Employment Data Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Kepegawaian</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Kepegawaian</label>
              <select
                name="status_kepegawaian"
                value={formData.status_kepegawaian}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Status</option>
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="Honorer">Honorer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TMT (Tanggal Mulai Tugas)</label>
              <input
                type="date"
                name="tmt"
                value={formData.tmt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Golongan/Pangkat</label>
              <input
                type="text"
                name="golongan_pangkat"
                value={formData.golongan_pangkat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Masa Kerja (Tahun)</label>
              <input
                type="number"
                name="masa_kerja"
                value={formData.masa_kerja}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TeacherProfile

