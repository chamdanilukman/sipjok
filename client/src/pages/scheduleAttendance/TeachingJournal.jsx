import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useTeachingJournal from '../../hooks/useTeachingJournal'
import useClasses from '../../hooks/useClasses'
import { api } from '../../lib/api'
import { exportJournalToExcel, exportJournalToPDF, printJournal } from '../../utils/exportJournal'

export const TeachingJournal = () => {
  const { showNotification } = useNotification()
  const {
    journals,
    loading,
    error,
    loadJournals,
    createJournal,
    updateJournal,
    deleteJournal,
  } = useTeachingJournal()

  const { loadClasses: loadClassesHook } = useClasses()

  const [userId, setUserId] = useState(null)
  const [classes, setClasses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingJournalId, setEditingJournalId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [formData, setFormData] = useState({
    class_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    materi: '',
    kegiatan: '',
    catatan: '',
  })

  // Get current user and load data
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          loadJournals(user.id)
          const classData = await loadClassesHook()
          setClasses(classData || [])
        }
      } catch (err) {
        console.error('Error getting current user:', err)
      }
    }
    getCurrentUser()
  }, [loadJournals, loadClassesHook])

  const handleOpenModal = (journal = null) => {
    if (journal) {
      setEditingJournalId(journal.id)
      setFormData({
        class_id: journal.class_id || '',
        tanggal: journal.tanggal || selectedDate,
        materi: journal.materi || '',
        kegiatan: journal.kegiatan || '',
        catatan: journal.catatan || '',
      })
    } else {
      setEditingJournalId(null)
      setFormData({
        class_id: '',
        tanggal: selectedDate,
        materi: '',
        kegiatan: '',
        catatan: '',
      })
    }
    setShowModal(true)
  }


  const handleSaveJournal = async () => {
    if (!formData.class_id || !formData.materi) {
      showNotification('Kelas dan materi harus diisi', 'error')
      return
    }

    try {
      if (editingJournalId) {
        await updateJournal(editingJournalId, formData)
        showNotification('Jurnal berhasil diperbarui', 'success')
      } else {
        await createJournal(userId, formData)
        showNotification('Jurnal berhasil ditambahkan', 'success')
      }
      setShowModal(false)
      await loadJournals(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan jurnal', 'error')
    }
  }

  const handleDeleteJournal = async (journal) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) return

    try {
      await deleteJournal(journal.id)
      showNotification('Jurnal berhasil dihapus', 'success')
      await loadJournals(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus jurnal', 'error')
    }
  }

  // Export/Print handlers
  const handleExportExcel = () => {
    if (journals.length === 0) {
      showNotification('Tidak ada data untuk diexport', 'error')
      return
    }

    const teacherName = 'Guru PJOK' // You can get from profile context
    const dateRange = 'All'

    exportJournalToExcel(journals, teacherName, dateRange)
    showNotification('Data berhasil diexport ke Excel', 'success')
  }

  const handleExportPDF = () => {
    if (journals.length === 0) {
      showNotification('Tidak ada data untuk diexport', 'error')
      return
    }

    const teacherName = 'Guru PJOK' // You can get from profile context
    const dateRange = 'All'

    exportJournalToPDF(journals, teacherName, dateRange)
    showNotification('Data berhasil diexport ke PDF', 'success')
  }

  const handlePrint = () => {
    if (journals.length === 0) {
      showNotification('Tidak ada data untuk diprint', 'error')
      return
    }

    const teacherName = 'Guru PJOK' // You can get from profile context
    const dateRange = 'All'

    printJournal(journals, teacherName, dateRange)
  }

  const filteredJournals = journals.filter((j) => j.tanggal === selectedDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Jurnal Mengajar</h1>
          <p className="text-gray-600 mt-2">Catat aktivitas mengajar harian</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span className="hidden sm:inline">Tambah Jurnal</span>
          </button>
          {journals.length > 0 && (
            <>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-file-excel"></i>
                <span className="hidden sm:inline">Export Excel</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-file-pdf"></i>
                <span className="hidden sm:inline">Export PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-print"></i>
                <span className="hidden sm:inline">Print</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Tanggal:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            {filteredJournals.length} jurnal ditemukan
          </span>
        </div>
      </div>

      {/* Journal List */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Memuat jurnal...</p>
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-book text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-600">Belum ada jurnal untuk tanggal ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJournals.map((journal) => (
            <div key={journal.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{journal.materi}</h3>
                  <p className="text-sm text-gray-600">
                    {journal.class?.name || journal.classes?.name} - Kelas {journal.class?.grade || journal.classes?.grade}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(journal)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit Jurnal"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteJournal(journal)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Hapus Jurnal"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {journal.kegiatan && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Kegiatan:</p>
                    <p className="text-gray-900">{journal.kegiatan}</p>
                  </div>
                )}
                {journal.catatan && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Catatan:</p>
                    <p className="text-gray-900">{journal.catatan}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Journal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 my-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingJournalId ? 'Edit Jurnal' : 'Tambah Jurnal'}
            </h3>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas *</label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - Kelas {cls.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materi *</label>
                <input
                  type="text"
                  value={formData.materi}
                  onChange={(e) => setFormData({ ...formData, materi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Sepak Bola - Teknik Dasar Passing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan</label>
                <textarea
                  value={formData.kegiatan}
                  onChange={(e) => setFormData({ ...formData, kegiatan: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Uraikan kegiatan pembelajaran yang dilakukan"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan, hambatan, dan solusi"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveJournal}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeachingJournal
