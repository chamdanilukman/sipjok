import React, { useState, useEffect } from 'react'
import { useDataContext } from '../../context/DataContext'
import useTeachingJournal from '../../hooks/useTeachingJournal'
import supabase from '../../config/supabase'
import { exportJournalToExcel, exportJournalToPDF, printJournal } from '../../utils/exportJournal'

export const TeachingJournal = () => {
  const { showNotification } = useDataContext()
  const {
    journals,
    loading,
    error,
    loadJournals,
    createJournal,
    updateJournal,
    deleteJournal,
  } = useTeachingJournal()

  const [userId, setUserId] = useState(null)
  const [classes, setClasses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingJournalId, setEditingJournalId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [formData, setFormData] = useState({
    class_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    pertemuan_ke: '',
    materi_pokok: '',
    kegiatan_pembelajaran: '',
    metode_pembelajaran: '',
    jumlah_hadir: 0,
    jumlah_sakit: 0,
    jumlah_izin: 0,
    jumlah_alpha: 0,
    catatan: '',
    hambatan: '',
    solusi: '',
  })

  // Get current user and load data
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        loadJournals(user.id)
        loadClasses(user.id)
      }
    }
    getCurrentUser()
  }, [loadJournals])

  const loadClasses = async (teacherId) => {
    try {
      const { data, error: err } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherId)

      if (err) throw err
      setClasses(data || [])
    } catch (err) {
      console.error('Error loading classes:', err)
    }
  }

  const handleOpenModal = (journal = null) => {
    if (journal) {
      setEditingJournalId(journal.id)
      setFormData({
        class_id: journal.class_id,
        tanggal: journal.tanggal,
        pertemuan_ke: journal.pertemuan_ke || '',
        materi_pokok: journal.materi_pokok || '',
        kegiatan_pembelajaran: journal.kegiatan_pembelajaran || '',
        metode_pembelajaran: journal.metode_pembelajaran || '',
        jumlah_hadir: journal.jumlah_hadir || 0,
        jumlah_sakit: journal.jumlah_sakit || 0,
        jumlah_izin: journal.jumlah_izin || 0,
        jumlah_alpha: journal.jumlah_alpha || 0,
        catatan: journal.catatan || '',
        hambatan: journal.hambatan || '',
        solusi: journal.solusi || '',
      })
    } else {
      setEditingJournalId(null)
      setFormData({
        class_id: '',
        tanggal: selectedDate,
        pertemuan_ke: '',
        materi_pokok: '',
        kegiatan_pembelajaran: '',
        metode_pembelajaran: '',
        jumlah_hadir: 0,
        jumlah_sakit: 0,
        jumlah_izin: 0,
        jumlah_alpha: 0,
        catatan: '',
        hambatan: '',
        solusi: '',
      })
    }
    setShowModal(true)
  }


  const handleSaveJournal = async () => {
    if (!formData.class_id || !formData.materi_pokok) {
      showNotification('Kelas dan materi pokok harus diisi', 'error')
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
                  <h3 className="text-lg font-semibold text-gray-900">{journal.materi_pokok}</h3>
                  <p className="text-sm text-gray-600">
                    {journal.classes?.name} - Kelas {journal.classes?.grade}
                    {journal.pertemuan_ke && ` • Pertemuan ke-${journal.pertemuan_ke}`}
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
                {journal.kegiatan_pembelajaran && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Kegiatan Pembelajaran:</p>
                    <p className="text-gray-900">{journal.kegiatan_pembelajaran}</p>
                  </div>
                )}
                {journal.metode_pembelajaran && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Metode:</p>
                    <p className="text-gray-900">{journal.metode_pembelajaran}</p>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Hadir</p>
                    <p className="text-lg font-semibold text-green-600">{journal.jumlah_hadir || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Sakit</p>
                    <p className="text-lg font-semibold text-blue-600">{journal.jumlah_sakit || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Izin</p>
                    <p className="text-lg font-semibold text-yellow-600">{journal.jumlah_izin || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Alpha</p>
                    <p className="text-lg font-semibold text-red-600">{journal.jumlah_alpha || 0}</p>
                  </div>
                </div>
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
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pertemuan Ke</label>
                  <input
                    type="number"
                    value={formData.pertemuan_ke}
                    onChange={(e) => setFormData({ ...formData, pertemuan_ke: parseInt(e.target.value) || '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                    min="1"
                  />
                </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Materi Pokok *</label>
                <input
                  type="text"
                  value={formData.materi_pokok}
                  onChange={(e) => setFormData({ ...formData, materi_pokok: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Sepak Bola - Teknik Dasar Passing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan Pembelajaran</label>
                <textarea
                  value={formData.kegiatan_pembelajaran}
                  onChange={(e) => setFormData({ ...formData, kegiatan_pembelajaran: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Uraikan kegiatan pembelajaran yang dilakukan"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembelajaran</label>
                <input
                  type="text"
                  value={formData.metode_pembelajaran}
                  onChange={(e) => setFormData({ ...formData, metode_pembelajaran: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Demonstrasi, Praktik, Diskusi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rekapitulasi Kehadiran</label>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hadir</label>
                    <input
                      type="number"
                      value={formData.jumlah_hadir}
                      onChange={(e) => setFormData({ ...formData, jumlah_hadir: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Sakit</label>
                    <input
                      type="number"
                      value={formData.jumlah_sakit}
                      onChange={(e) => setFormData({ ...formData, jumlah_sakit: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Izin</label>
                    <input
                      type="number"
                      value={formData.jumlah_izin}
                      onChange={(e) => setFormData({ ...formData, jumlah_izin: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Alpha</label>
                    <input
                      type="number"
                      value={formData.jumlah_alpha}
                      onChange={(e) => setFormData({ ...formData, jumlah_alpha: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan tambahan"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hambatan</label>
                <textarea
                  value={formData.hambatan}
                  onChange={(e) => setFormData({ ...formData, hambatan: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hambatan yang dihadapi saat pembelajaran"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solusi</label>
                <textarea
                  value={formData.solusi}
                  onChange={(e) => setFormData({ ...formData, solusi: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Solusi untuk mengatasi hambatan"
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
