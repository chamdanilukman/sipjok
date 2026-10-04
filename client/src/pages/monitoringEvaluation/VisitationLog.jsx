import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useVisitationLog, { JENIS_KUNJUNGAN, JABATAN_PENGUNJUNG } from '../../hooks/useVisitationLog'
import useClasses from '../../hooks/useClasses'
import { api } from '../../lib/api'

// Buku Kunjungan - catatan kunjungan/visitasi kelas digital (supervisi kepala
// sekolah, pengawas, atau kunjungan monitoring sarana)
export const VisitationLog = () => {
  const { showNotification } = useNotification()
  const {
    logs,
    loading,
    error,
    loadLogs,
    createLog,
    updateLog,
    deleteLog,
  } = useVisitationLog()
  const { loadClasses: loadClassesHook } = useClasses()

  const [userId, setUserId] = useState(null)
  const [classes, setClasses] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jam_mulai: '07:30',
    jam_selesai: '09:00',
    class_id: '',
    lokasi: '',
    pengunjung: '',
    jabatan: 'Kepala Sekolah',
    jenis: 'Supervisi Pembelajaran',
    materi: '',
    hasil_observasi: '',
    rekomendasi: '',
    tindak_lanjut: '',
    status: 'selesai',
  })

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          loadLogs()
          const classData = await loadClassesHook()
          setClasses(classData || [])
        }
      } catch (err) {
        console.error('Error getting current user:', err)
      }
    }
    getCurrentUser()
  }, [loadLogs, loadClassesHook])

  // Modal bisa ditutup dengan Escape
  useEffect(() => {
    if (!showModal) return
    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showModal])

  const handleOpenModal = (log = null) => {
    if (log) {
      setEditingId(log.id)
      setFormData({
        tanggal: (log.tanggal || '').slice(0, 10) || new Date().toISOString().split('T')[0],
        jam_mulai: log.jam_mulai || '07:30',
        jam_selesai: log.jam_selesai || '09:00',
        class_id: log.class_id || '',
        lokasi: log.lokasi || '',
        pengunjung: log.pengunjung || '',
        jabatan: log.jabatan || 'Kepala Sekolah',
        jenis: log.jenis || 'Supervisi Pembelajaran',
        materi: log.materi || '',
        hasil_observasi: log.hasil_observasi || '',
        rekomendasi: log.rekomendasi || '',
        tindak_lanjut: log.tindak_lanjut || '',
        status: log.status || 'selesai',
      })
    } else {
      setEditingId(null)
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        jam_mulai: '07:30',
        jam_selesai: '09:00',
        class_id: '',
        lokasi: '',
        pengunjung: '',
        jabatan: 'Kepala Sekolah',
        jenis: 'Supervisi Pembelajaran',
        materi: '',
        hasil_observasi: '',
        rekomendasi: '',
        tindak_lanjut: '',
        status: 'selesai',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.pengunjung) {
      showNotification('Nama pengunjung harus diisi', 'error')
      return
    }
    try {
      const payload = { ...formData, class_id: formData.class_id || null }
      if (editingId) {
        await updateLog(editingId, payload)
        showNotification('Kunjungan berhasil diperbarui', 'success')
      } else {
        await createLog(userId, payload)
        showNotification('Kunjungan berhasil dicatat', 'success')
      }
      setShowModal(false)
      await loadLogs()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan kunjungan', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan kunjungan ini?')) return
    try {
      await deleteLog(id)
      showNotification('Kunjungan berhasil dihapus', 'success')
      await loadLogs()
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus kunjungan', 'error')
    }
  }

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase()
    return (
      !q ||
      (l.pengunjung || '').toLowerCase().includes(q) ||
      (l.materi || '').toLowerCase().includes(q) ||
      (l.class?.name || '').toLowerCase().includes(q)
    )
  })

  const classNameOf = (l) => l.class?.name || l.lokasi || '-'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buku Kunjungan</h1>
          <p className="text-gray-600 mt-2">Catatan digital kunjungan dan supervisi pembelajaran PJOK</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Catat Kunjungan
        </button>
      </div>

      {/* Referensi */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          Buku kunjungan mendokumentasikan supervisi kepala sekolah/pengawas, monitoring sarana, dan tindak
          lanjutnya, mendukung pelaksanaan <strong>Pembelajaran Mendalam</strong> yang berkesadaran, bermakna,
          dan menggembirakan (Permendikdasmen No. 13 Tahun 2025).
        </p>
      </div>

      {/* Pencarian */}
      <div className="relative">
        <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Cari pengunjung, materi, atau kelas..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Daftar kunjungan */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Memuat kunjungan...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-clipboard-check text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">
            {search ? 'Tidak ada kunjungan yang cocok dengan pencarian.' : 'Belum ada catatan kunjungan. Klik "Catat Kunjungan" untuk memulai.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((l) => {
            const jenisInfo = JENIS_KUNJUNGAN[l.jenis] || { badge: 'bg-gray-100 text-gray-800' }
            return (
              <div key={l.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        <i className="fas fa-calendar mr-1"></i>{(l.tanggal || '').slice(0, 10)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${jenisInfo.badge}`}>
                        {l.jenis || 'Kunjungan'}
                      </span>
                      {l.status === 'terjadwal' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          Terjadwal
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {l.pengunjung} <span className="text-sm font-normal text-gray-500">({l.jabatan || '-'})</span>
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(l)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50" title="Edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(l.id)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" title="Hapus">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                  <p><i className="fas fa-door-open w-5 text-gray-400"></i>Kelas/Lokasi: <span className="text-gray-900">{classNameOf(l)}</span></p>
                  <p><i className="fas fa-clock w-5 text-gray-400"></i>{l.jam_mulai || '--:--'} - {l.jam_selesai || '--:--'}</p>
                  {l.materi && <p className="sm:col-span-2"><i className="fas fa-book w-5 text-gray-400"></i>Materi: <span className="text-gray-900">{l.materi}</span></p>}
                  {l.hasil_observasi && <p className="sm:col-span-2"><i className="fas fa-eye w-5 text-gray-400"></i>{l.hasil_observasi}</p>}
                  {l.rekomendasi && (
                    <p className="sm:col-span-2 text-purple-700"><i className="fas fa-comment-medical w-5"></i>Rekomendasi: {l.rekomendasi}</p>
                  )}
                  {l.tindak_lanjut && (
                    <p className="sm:col-span-2 text-green-700"><i className="fas fa-tasks w-5"></i>Tindak lanjut: {l.tindak_lanjut}</p>
                  )}
                </div>
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
              {editingId ? 'Edit Catatan Kunjungan' : 'Catat Kunjungan'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={formData.jam_mulai}
                    onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={formData.jam_selesai}
                    onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Bukan kunjungan kelas</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Lain</label>
                  <input
                    type="text"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="mis. Gudang Sarana"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengunjung *</label>
                  <input
                    type="text"
                    value={formData.pengunjung}
                    onChange={(e) => setFormData({ ...formData, pengunjung: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama lengkap pengunjung"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                  <select
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {JABATAN_PENGUNJUNG.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kunjungan</label>
                  <select
                    value={formData.jenis}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[...Object.keys(JENIS_KUNJUNGAN), 'Lainnya'].map((j) => (
                      <option key={j} value={j}>{j}</option>
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
                    <option value="selesai">Selesai</option>
                    <option value="terjadwal">Terjadwal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materi/Fokus Observasi</label>
                <input
                  type="text"
                  value={formData.materi}
                  onChange={(e) => setFormData({ ...formData, materi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="mis. Permainan Bola Besar - Passing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasil Observasi</label>
                <textarea
                  value={formData.hasil_observasi}
                  onChange={(e) => setFormData({ ...formData, hasil_observasi: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rekomendasi</label>
                <textarea
                  value={formData.rekomendasi}
                  onChange={(e) => setFormData({ ...formData, rekomendasi: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tindak Lanjut</label>
                <textarea
                  value={formData.tindak_lanjut}
                  onChange={(e) => setFormData({ ...formData, tindak_lanjut: e.target.value })}
                  rows="2"
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

export default VisitationLog
