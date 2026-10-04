import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useExtracurricularSchedule, { DAYS_OF_WEEK } from '../../hooks/useExtracurricularSchedule'
import useExtracurricularPrograms from '../../hooks/useExtracurricularPrograms'
import { api } from '../../lib/api'

// Jadwal Ekstrakurikuler - penjadwalan latihan/sesi kegiatan ekstrakurikuler
export const ExtracurricularSchedule = () => {
  const { showNotification } = useNotification()
  const {
    schedules,
    loading,
    error,
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useExtracurricularSchedule()
  const { programs, loadPrograms } = useExtracurricularPrograms()

  const [userId, setUserId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    program_id: '',
    kegiatan: '',
    day_of_week: 5,
    jam_mulai: '15:00',
    jam_selesai: '16:30',
    lokasi: '',
    pembina: '',
    keterangan: '',
  })

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          loadSchedules()
          loadPrograms()
        }
      } catch (err) {
        console.error('Error getting current user:', err)
      }
    }
    getCurrentUser()
  }, [loadSchedules, loadPrograms])

  // Modal bisa ditutup dengan Escape
  useEffect(() => {
    if (!showModal) return
    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showModal])

  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setEditingId(schedule.id)
      setFormData({
        program_id: schedule.program_id || '',
        kegiatan: schedule.kegiatan || '',
        day_of_week: schedule.day_of_week ?? 5,
        jam_mulai: schedule.jam_mulai || '15:00',
        jam_selesai: schedule.jam_selesai || '16:30',
        lokasi: schedule.lokasi || '',
        pembina: schedule.pembina || '',
        keterangan: schedule.keterangan || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        program_id: '',
        kegiatan: '',
        day_of_week: 5,
        jam_mulai: '15:00',
        jam_selesai: '16:30',
        lokasi: '',
        pembina: '',
        keterangan: '',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.kegiatan) {
      showNotification('Nama kegiatan harus diisi', 'error')
      return
    }
    if (formData.jam_mulai && formData.jam_selesai && formData.jam_mulai >= formData.jam_selesai) {
      showNotification('Jam mulai harus lebih awal dari jam selesai', 'error')
      return
    }
    try {
      const payload = { ...formData, program_id: formData.program_id || null }
      if (editingId) {
        await updateSchedule(editingId, payload)
        showNotification('Jadwal ekstrakurikuler berhasil diperbarui', 'success')
      } else {
        await createSchedule(userId, payload)
        showNotification('Jadwal ekstrakurikuler berhasil ditambahkan', 'success')
      }
      setShowModal(false)
      await loadSchedules()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan jadwal', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return
    try {
      await deleteSchedule(id)
      showNotification('Jadwal ekstrakurikuler berhasil dihapus', 'success')
      await loadSchedules()
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus jadwal', 'error')
    }
  }

  const sorted = [...schedules].sort((a, b) => a.day_of_week - b.day_of_week || (a.jam_mulai || '').localeCompare(b.jam_mulai || ''))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jadwal Ekstrakurikuler</h1>
          <p className="text-gray-600 mt-2">Penjadwalan dan koordinasi sesi latihan ekstrakurikuler</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Tambah Jadwal
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Daftar jadwal */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Memuat jadwal...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-hourglass-half text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">Belum ada jadwal ekstrakurikuler. Klik "Tambah Jadwal" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((s) => (
            <div key={s.id} className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  {DAYS_OF_WEEK[s.day_of_week] || '-'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(s)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50" title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" title="Hapus">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.kegiatan}</h3>
              {s.program && (
                <p className="text-xs text-gray-500 mb-1">
                  <i className="fas fa-trophy mr-1"></i>{s.program.nama}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <i className="fas fa-clock mr-2 text-gray-400"></i>
                {s.jam_mulai || '--:--'} - {s.jam_selesai || '--:--'}
              </p>
              {s.lokasi && (
                <p className="text-sm text-gray-600">
                  <i className="fas fa-map-marker-alt mr-2 text-gray-400"></i>{s.lokasi}
                </p>
              )}
              {s.pembina && (
                <p className="text-sm text-gray-600">
                  <i className="fas fa-user-tie mr-2 text-gray-400"></i>{s.pembina}
                </p>
              )}
              {s.keterangan && <p className="text-xs text-gray-500 mt-2">{s.keterangan}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Jadwal Ekstrakurikuler' : 'Tambah Jadwal Ekstrakurikuler'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  value={formData.kegiatan}
                  onChange={(e) => setFormData({ ...formData, kegiatan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Latihan Futsal"
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
                    <option key={p.id} value={p.id}>{p.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS_OF_WEEK.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pembina</label>
                  <input
                    type="text"
                    value={formData.pembina}
                    onChange={(e) => setFormData({ ...formData, pembina: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
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

export default ExtracurricularSchedule
