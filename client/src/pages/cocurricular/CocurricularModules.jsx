import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useCocurricularModules from '../../hooks/useCocurricularModules'
import useCocurricularPrograms, { TEMA_KOKURIKULER } from '../../hooks/useCocurricularPrograms'
import { api } from '../../lib/api'

// Modul Kokurikuler - repositori materi dan sumber daya kegiatan kokurikuler
export const CocurricularModules = () => {
  const { showNotification } = useNotification()
  const {
    modules,
    loading,
    error,
    loadModules,
    createModule,
    updateModule,
    deleteModule,
  } = useCocurricularModules()
  const { programs, loadPrograms } = useCocurricularPrograms()

  const [userId, setUserId] = useState(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    judul: '',
    program_id: '',
    tema: '',
    topik: '',
    fase: 'B',
    kelas: 'Semua Kelas',
    deskripsi: '',
    konten_materi: '',
    file_url: '',
    file_name: '',
    status: 'draft',
  })

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          loadModules()
          loadPrograms()
        }
      } catch (err) {
        console.error('Error getting current user:', err)
      }
    }
    getCurrentUser()
  }, [loadModules, loadPrograms])

  // Modal bisa ditutup dengan Escape
  useEffect(() => {
    if (!showModal) return
    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showModal])

  const handleOpenModal = (mod = null) => {
    if (mod) {
      setEditingId(mod.id)
      setFormData({
        judul: mod.judul || '',
        program_id: mod.program_id || '',
        tema: mod.tema || '',
        topik: mod.topik || '',
        fase: mod.fase || 'B',
        kelas: mod.kelas || 'Semua Kelas',
        deskripsi: mod.deskripsi || '',
        konten_materi: mod.konten_materi || '',
        file_url: mod.file_url || '',
        file_name: mod.file_name || '',
        status: mod.status || 'draft',
      })
    } else {
      setEditingId(null)
      setFormData({
        judul: '',
        program_id: '',
        tema: '',
        topik: '',
        fase: 'B',
        kelas: 'Semua Kelas',
        deskripsi: '',
        konten_materi: '',
        file_url: '',
        file_name: '',
        status: 'draft',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.judul) {
      showNotification('Judul modul harus diisi', 'error')
      return
    }
    try {
      const payload = { ...formData, program_id: formData.program_id || null }
      if (editingId) {
        await updateModule(editingId, payload)
        showNotification('Modul kokurikuler berhasil diperbarui', 'success')
      } else {
        await createModule(userId, payload)
        showNotification('Modul kokurikuler berhasil ditambahkan', 'success')
      }
      setShowModal(false)
      await loadModules()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan modul', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus modul ini?')) return
    try {
      await deleteModule(id)
      showNotification('Modul kokurikuler berhasil dihapus', 'success')
      await loadModules()
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus modul', 'error')
    }
  }

  const filtered = modules.filter((m) => {
    const q = search.toLowerCase()
    return (
      !q ||
      (m.judul || '').toLowerCase().includes(q) ||
      (m.tema || '').toLowerCase().includes(q) ||
      (m.topik || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modul Kokurikuler</h1>
          <p className="text-gray-600 mt-2">Repositori materi dan sumber daya kegiatan kokurikuler</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Tambah Modul
        </button>
      </div>

      {/* Pencarian */}
      <div className="relative">
        <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Cari modul, tema, atau topik..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Daftar modul */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Memuat modul...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-folder-open text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">
            {search ? 'Tidak ada modul yang cocok dengan pencarian.' : 'Belum ada modul kokurikuler. Klik "Tambah Modul" untuk memulai.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div key={m.id} className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${m.status === 'publikasi' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {m.status === 'publikasi' ? 'Publikasi' : 'Draft'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(m)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50" title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" title="Hapus">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{m.judul}</h3>
              {m.program && (
                <p className="text-xs text-gray-500 mb-1"><i className="fas fa-project-diagram mr-1"></i>{m.program.judul}</p>
              )}
              {m.tema && <p className="text-xs text-gray-500 mb-1"><i className="fas fa-tag mr-1"></i>{m.tema}</p>}
              <p className="text-xs text-gray-500 mb-2">
                {m.fase ? `Fase ${m.fase}` : ''}{m.kelas ? ` • ${m.kelas}` : ''}
              </p>
              {m.deskripsi && <p className="text-sm text-gray-600 line-clamp-2 mb-2">{m.deskripsi}</p>}
              {m.file_url && (
                <a href={m.file_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                  <i className="fas fa-file-download mr-1"></i>{m.file_name || 'Unduh berkas'}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Modul Kokurikuler' : 'Tambah Modul Kokurikuler'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Modul *</label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Panduan Senam Sehat Anak Indonesia Hebat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terkait Program (opsional)</label>
                <select
                  value={formData.program_id}
                  onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tidak terkait program</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.judul}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                  <select
                    value={formData.tema}
                    onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih tema</option>
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
                  <select
                    value={formData.fase}
                    onChange={(e) => setFormData({ ...formData, fase: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">Fase A (Kelas 1-3)</option>
                    <option value="B">Fase B (Kelas 4-6)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['1', '2', '3', '4', '5', '6', 'Semua Kelas'].map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten Materi / Langkah Kegiatan</label>
                <textarea
                  value={formData.konten_materi}
                  onChange={(e) => setFormData({ ...formData, konten_materi: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Uraikan materi atau langkah kegiatan, pisahkan dengan baris baru"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Berkas</label>
                  <input
                    type="text"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Berkas</label>
                  <input
                    type="text"
                    value={formData.file_name}
                    onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="publikasi">Publikasi</option>
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

export default CocurricularModules
