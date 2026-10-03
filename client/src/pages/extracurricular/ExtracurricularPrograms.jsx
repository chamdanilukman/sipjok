import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useExtracurricularPrograms, {
  KATEGORI_EXTRACURRICULAR,
  CONTOH_EXTRACURRICULAR,
  STATUS_EXTRACURRICULAR,
} from '../../hooks/useExtracurricularPrograms'
import { api } from '../../lib/api'

// Program Ekstrakurikuler — Permendikdasmen No. 13 Tahun 2025: sekolah wajib
// menyelenggarakan ekstrakurikuler; peserta didik mengikuti minimal satu kegiatan
export const ExtracurricularPrograms = () => {
  const { showNotification } = useNotification()
  const {
    programs,
    loading,
    error,
    loadPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
  } = useExtracurricularPrograms()

  const [userId, setUserId] = useState(null)
  const [filterKategori, setFilterKategori] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nama: '',
    kategori: 'olahraga',
    pembina: '',
    lokasi: '',
    deskripsi: '',
    target: '',
    status: 'aktif',
  })

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          loadPrograms()
        }
      } catch (err) {
        console.error('Error getting current user:', err)
      }
    }
    getCurrentUser()
  }, [loadPrograms])

  const handleOpenModal = (program = null) => {
    if (program) {
      setEditingId(program.id)
      setFormData({
        nama: program.nama || '',
        kategori: program.kategori || 'olahraga',
        pembina: program.pembina || '',
        lokasi: program.lokasi || '',
        deskripsi: program.deskripsi || '',
        target: program.target || '',
        status: program.status || 'aktif',
      })
    } else {
      setEditingId(null)
      setFormData({
        nama: '',
        kategori: 'olahraga',
        pembina: '',
        lokasi: '',
        deskripsi: '',
        target: '',
        status: 'aktif',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.nama) {
      showNotification('Nama kegiatan ekstrakurikuler harus diisi', 'error')
      return
    }
    try {
      if (editingId) {
        await updateProgram(editingId, formData)
        showNotification('Program ekstrakurikuler berhasil diperbarui', 'success')
      } else {
        await createProgram(userId, formData)
        showNotification('Program ekstrakurikuler berhasil ditambahkan', 'success')
      }
      setShowModal(false)
      await loadPrograms()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan program', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus program ekstrakurikuler ini?')) return
    try {
      await deleteProgram(id)
      showNotification('Program ekstrakurikuler berhasil dihapus', 'success')
      await loadPrograms()
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus program', 'error')
    }
  }

  const filtered = filterKategori ? programs.filter((p) => p.kategori === filterKategori) : programs

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Program Ekstrakurikuler</h1>
          <p className="text-gray-600 mt-2">Manajemen kegiatan ekstrakurikuler sekolah</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Tambah Program
        </button>
      </div>

      {/* Referensi regulasi */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          Menurut <strong>Permendikdasmen No. 13 Tahun 2025</strong>, ekstrakurikuler wajib diselenggarakan satuan
          pendidikan dan setiap peserta didik mengikuti <strong>minimal satu kegiatan</strong> sesuai minat dan
          bakatnya (keikutsertaan bersifat sukarela memilih jenisnya).
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filter kategori */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterKategori('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!filterKategori ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Semua
        </button>
        {Object.entries(KATEGORI_EXTRACURRICULAR).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setFilterKategori(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterKategori === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {info.label}
          </button>
        ))}
      </div>

      {/* Daftar program */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Memuat program...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-trophy text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">Belum ada program ekstrakurikuler. Klik "Tambah Program" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const kategoriInfo = KATEGORI_EXTRACURRICULAR[p.kategori] || KATEGORI_EXTRACURRICULAR.olahraga
            const statusInfo = STATUS_EXTRACURRICULAR[p.status] || STATUS_EXTRACURRICULAR.aktif
            return (
              <div key={p.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex gap-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${kategoriInfo.badge}`}>
                      {kategoriInfo.label}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.badge}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-800" title="Edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{p.nama}</h3>
                {p.pembina && (
                  <p className="text-xs text-gray-500 mb-1"><i className="fas fa-user-tie mr-1"></i>{p.pembina}</p>
                )}
                {p.lokasi && (
                  <p className="text-xs text-gray-500 mb-1"><i className="fas fa-map-marker-alt mr-1"></i>{p.lokasi}</p>
                )}
                {p.target && (
                  <p className="text-xs text-gray-500 mb-1"><i className="fas fa-bullseye mr-1"></i>{p.target}</p>
                )}
                {p.deskripsi && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{p.deskripsi}</p>}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Program Ekstrakurikuler' : 'Tambah Program Ekstrakurikuler'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  list="contoh-extracurricular"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Futsal, Pencak Silat, Tari Tradisional"
                />
                <datalist id="contoh-extracurricular">
                  {CONTOH_EXTRACURRICULAR.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(KATEGORI_EXTRACURRICULAR).map(([key, info]) => (
                      <option key={key} value={key}>{info.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(STATUS_EXTRACURRICULAR).map(([key, info]) => (
                      <option key={key} value={key}>{info.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pembina</label>
                  <input
                    type="text"
                    value={formData.pembina}
                    onChange={(e) => setFormData({ ...formData, pembina: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Lapangan Sekolah"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Kegiatan/Prestasi</label>
                <input
                  type="text"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Ikut O2SN tingkat kecamatan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Simpan
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExtracurricularPrograms
