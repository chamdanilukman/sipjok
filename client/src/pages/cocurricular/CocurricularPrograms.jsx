import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useCocurricularPrograms, {
  TEMA_KOKURIKULER,
  DIMENSI_PROFIL_LULUSAN,
  STATUS_PROGRAM,
} from '../../hooks/useCocurricularPrograms'
import { api } from '../../lib/api'

// Program Kokurikuler — perencanaan kegiatan penguatan 8 Dimensi Profil
// Lulusan (Permendikdasmen No. 13 Tahun 2025, menggantikan istilah P5)
const FASE_OPTIONS = [
  { value: 'A', label: 'Fase A (Kelas 1-3)' },
  { value: 'B', label: 'Fase B (Kelas 4-6)' },
]
const KELAS_OPTIONS = ['1', '2', '3', '4', '5', '6', 'Semua Kelas']

export const CocurricularPrograms = () => {
  const { showNotification } = useNotification()
  const {
    programs,
    loading,
    error,
    loadPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
  } = useCocurricularPrograms()

  const [userId, setUserId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    judul: '',
    tema: '',
    topik: '',
    fase: 'B',
    kelas: 'Semua Kelas',
    dimensi: [],
    deskripsi: '',
    tujuan_kegiatan: '',
    alokasi_waktu: '',
    status: 'rencana',
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

  const getDimensiInfo = (key) => DIMENSI_PROFIL_LULUSAN.find((d) => d.key === key)
  const dimensiList = (p) =>
    Array.isArray(p.dimensi) ? p.dimensi : typeof p.dimensi === 'string' ? JSON.parse(p.dimensi || '[]') : []

  const handleOpenModal = (program = null) => {
    if (program) {
      setEditingId(program.id)
      setFormData({
        judul: program.judul || '',
        tema: program.tema || '',
        topik: program.topik || '',
        fase: program.fase || 'B',
        kelas: program.kelas || 'Semua Kelas',
        dimensi: dimensiList(program),
        deskripsi: program.deskripsi || '',
        tujuan_kegiatan: program.tujuan_kegiatan || '',
        alokasi_waktu: program.alokasi_waktu || '',
        status: program.status || 'rencana',
      })
    } else {
      setEditingId(null)
      setFormData({
        judul: '',
        tema: '',
        topik: '',
        fase: 'B',
        kelas: 'Semua Kelas',
        dimensi: [],
        deskripsi: '',
        tujuan_kegiatan: '',
        alokasi_waktu: '',
        status: 'rencana',
      })
    }
    setShowModal(true)
  }

  const toggleDimensi = (key) => {
    setFormData((prev) => ({
      ...prev,
      dimensi: prev.dimensi.includes(key) ? prev.dimensi.filter((d) => d !== key) : [...prev.dimensi, key],
    }))
  }

  const handleSave = async () => {
    if (!formData.judul) {
      showNotification('Judul program harus diisi', 'error')
      return
    }
    try {
      if (editingId) {
        await updateProgram(editingId, formData)
        showNotification('Program kokurikuler berhasil diperbarui', 'success')
      } else {
        await createProgram(userId, formData)
        showNotification('Program kokurikuler berhasil ditambahkan', 'success')
      }
      setShowModal(false)
      await loadPrograms()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan program', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus program ini?')) return
    try {
      await deleteProgram(id)
      showNotification('Program kokurikuler berhasil dihapus', 'success')
      await loadPrograms()
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus program', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Program Kokurikuler</h1>
          <p className="text-gray-600 mt-2">Perencanaan dan dokumentasi program kokurikuler sekolah</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Tambah Program
        </button>
      </div>

      {/* Referensi regulasi: 8 dimensi */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-semibold mb-2">
          <i className="fas fa-info-circle mr-2"></i>
          8 Dimensi Profil Lulusan (Permendikdasmen No. 10 & 13 Tahun 2025):
        </p>
        <div className="flex flex-wrap gap-2">
          {DIMENSI_PROFIL_LULUSAN.map((d) => (
            <span key={d.key} className={`px-2 py-1 text-xs rounded-full ${d.badge}`}>
              {d.label}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Daftar program */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Memuat program...</p>
        </div>
      ) : programs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-project-diagram text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">Belum ada program kokurikuler. Klik "Tambah Program" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((p) => {
            const statusInfo = STATUS_PROGRAM[p.status] || STATUS_PROGRAM.rencana
            return (
              <div key={p.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.badge}`}>
                    {statusInfo.label}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-800" title="Edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{p.judul}</h3>
                {p.tema && <p className="text-xs text-gray-500 mb-1"><i className="fas fa-tag mr-1"></i>{p.tema}</p>}
                {p.topik && <p className="text-xs text-gray-500 mb-1"><i className="fas fa-bullseye mr-1"></i>{p.topik}</p>}
                <p className="text-xs text-gray-500 mb-2">
                  {p.fase ? `Fase ${p.fase}` : ''}{p.kelas ? ` • ${p.kelas}` : ''}
                  {p.alokasi_waktu ? ` • ${p.alokasi_waktu}` : ''}
                </p>
                {dimensiList(p).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {dimensiList(p).map((key) => {
                      const info = getDimensiInfo(key)
                      return info ? (
                        <span key={key} className={`px-2 py-0.5 text-xs rounded-full ${info.badge}`}>
                          {info.label}
                        </span>
                      ) : null
                    })}
                  </div>
                )}
                {p.deskripsi && <p className="text-sm text-gray-600 line-clamp-2">{p.deskripsi}</p>}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Program Kokurikuler' : 'Tambah Program Kokurikuler'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Program *</label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Gaya Hidup Sehat melalui Senam dan Permainan Tradisional"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                  <select
                    value={formData.tema}
                    onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Pilih tema —</option>
                    {TEMA_KOKURIKULER.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topik</label>
                  <input
                    type="text"
                    value={formData.topik}
                    onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Gaya Hidup Sehat"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
                  <select
                    value={formData.fase}
                    onChange={(e) => setFormData({ ...formData, fase: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FASE_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {KELAS_OPTIONS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alokasi Waktu</label>
                  <input
                    type="text"
                    value={formData.alokasi_waktu}
                    onChange={(e) => setFormData({ ...formData, alokasi_waktu: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="mis. 8 pertemuan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dimensi Profil Lulusan yang Dikembangkan</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 border border-gray-200 rounded-lg p-3">
                  {DIMENSI_PROFIL_LULUSAN.map((d) => (
                    <label key={d.key} className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.dimensi.includes(d.key)}
                        onChange={() => toggleDimensi(d.key)}
                        className="mt-0.5"
                      />
                      <span>{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Kegiatan</label>
                <textarea
                  value={formData.tujuan_kegiatan}
                  onChange={(e) => setFormData({ ...formData, tujuan_kegiatan: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tulis tujuan kegiatan, pisahkan dengan baris baru"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(STATUS_PROGRAM).map(([key, info]) => (
                    <option key={key} value={key}>{info.label}</option>
                  ))}
                </select>
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

export default CocurricularPrograms
