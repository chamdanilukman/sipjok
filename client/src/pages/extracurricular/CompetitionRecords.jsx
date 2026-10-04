import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useCompetitionRecords, {
  TINGKAT_LOMBA,
  HASIL_LOMBA,
  CONTOH_CABANG_LOMBA,
} from '../../hooks/useCompetitionRecords'
import useStudents from '../../hooks/useStudents'
import { api } from '../../lib/api'

// Catatan Peserta Lomba - dokumentasi partisipasi & prestasi siswa
// (alur pembinaan: O2SN → POPDA/Kejurda → PROVDA → POPNAS)
export const CompetitionRecords = () => {
  const { showNotification } = useNotification()
  const {
    records,
    loading,
    error,
    loadRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  } = useCompetitionRecords()
  const { loadStudents } = useStudents()

  const [userId, setUserId] = useState(null)
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    student_id: '',
    nama_peserta: '',
    nama_lomba: '',
    tingkat: 'sekolah',
    jenis: 'olahraga',
    cabang: '',
    penyelenggara: '',
    tempat: '',
    tanggal_lomba: new Date().toISOString().split('T')[0],
    hasil: 'Peserta',
    peringkat: '',
    catatan: '',
  })

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          loadRecords()
          const studentData = await loadStudents()
          setStudents(studentData || [])
        }
      } catch (err) {
        console.error('Error getting current user:', err)
      }
    }
    getCurrentUser()
  }, [loadRecords, loadStudents])

  // Modal bisa ditutup dengan Escape
  useEffect(() => {
    if (!showModal) return
    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showModal])

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id)
      setFormData({
        student_id: record.student_id || '',
        nama_peserta: record.nama_peserta || '',
        nama_lomba: record.nama_lomba || '',
        tingkat: record.tingkat || 'sekolah',
        jenis: record.jenis || 'olahraga',
        cabang: record.cabang || '',
        penyelenggara: record.penyelenggara || '',
        tempat: record.tempat || '',
        tanggal_lomba: (record.tanggal_lomba || '').slice(0, 10) || new Date().toISOString().split('T')[0],
        hasil: record.hasil || 'Peserta',
        peringkat: record.peringkat || '',
        catatan: record.catatan || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        student_id: '',
        nama_peserta: '',
        nama_lomba: '',
        tingkat: 'sekolah',
        jenis: 'olahraga',
        cabang: '',
        penyelenggara: '',
        tempat: '',
        tanggal_lomba: new Date().toISOString().split('T')[0],
        hasil: 'Peserta',
        peringkat: '',
        catatan: '',
      })
    }
    setShowModal(true)
  }

  const handleStudentChange = (studentId) => {
    const student = students.find((s) => s.id === studentId)
    setFormData((prev) => ({ ...prev, student_id: studentId, nama_peserta: student ? student.name : prev.nama_peserta }))
  }

  const handleSave = async () => {
    if (!formData.nama_peserta || !formData.nama_lomba) {
      showNotification('Nama peserta dan nama lomba harus diisi', 'error')
      return
    }
    try {
      const payload = {
        ...formData,
        student_id: formData.student_id || null,
        peringkat: formData.peringkat ? parseInt(formData.peringkat) : null,
      }
      if (editingId) {
        await updateRecord(editingId, payload)
        showNotification('Catatan lomba berhasil diperbarui', 'success')
      } else {
        await createRecord(userId, payload)
        showNotification('Catatan lomba berhasil ditambahkan', 'success')
      }
      setShowModal(false)
      await loadRecords()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan catatan lomba', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan lomba ini?')) return
    try {
      await deleteRecord(id)
      showNotification('Catatan lomba berhasil dihapus', 'success')
      await loadRecords()
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus catatan lomba', 'error')
    }
  }

  const filtered = records.filter((r) => {
    const q = search.toLowerCase()
    return (
      !q ||
      (r.nama_peserta || '').toLowerCase().includes(q) ||
      (r.nama_lomba || '').toLowerCase().includes(q) ||
      (r.cabang || '').toLowerCase().includes(q)
    )
  })

  const totalJuara = records.filter((r) => ['Juara 1', 'Juara 2', 'Juara 3'].includes(r.hasil)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catatan Peserta Lomba</h1>
          <p className="text-gray-600 mt-2">Dokumentasi partisipasi dan prestasi siswa dalam kompetisi</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Tambah Catatan
        </button>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{records.length}</p>
          <p className="text-sm text-gray-600">Total Partisipasi</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{totalJuara}</p>
          <p className="text-sm text-gray-600">Total Juara</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">
            {records.filter((r) => ['kabupaten', 'provinsi'].includes(r.tingkat)).length}
          </p>
          <p className="text-sm text-gray-600">Tingkat Kab/Prov</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-red-600">
            {records.filter((r) => ['nasional', 'internasional'].includes(r.tingkat)).length}
          </p>
          <p className="text-sm text-gray-600">Tingkat Nasional+</p>
        </div>
      </div>

      {/* Referensi regulasi */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          Alur pembinaan prestasi PJOK: <strong>O2SN</strong> (tingkat kecamatan) → <strong>POPDA/Kejurda</strong>{' '}
          (kabupaten) → <strong>PROVDA</strong> (provinsi) → <strong>POPNAS</strong> (nasional).
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
          placeholder="Cari nama peserta, lomba, atau cabang..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Daftar catatan */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Memuat catatan...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-medal text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">
            {search ? 'Tidak ada catatan yang cocok dengan pencarian.' : 'Belum ada catatan lomba. Klik "Tambah Catatan" untuk memulai.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Peserta</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Lomba</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tingkat</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Hasil</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 w-28">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const tingkatInfo = TINGKAT_LOMBA[r.tingkat] || TINGKAT_LOMBA.sekolah
                const hasilInfo = HASIL_LOMBA[r.hasil] || HASIL_LOMBA.Peserta
                return (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.nama_peserta}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.nama_lomba}
                      {r.cabang && <span className="block text-xs text-gray-500">{r.cabang}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tingkatInfo.badge}`}>
                        {tingkatInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{(r.tanggal_lomba || '').slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${hasilInfo.badge}`}>
                        {hasilInfo.medal} {r.hasil || 'Peserta'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleOpenModal(r)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50" title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" title="Hapus">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Catatan Lomba' : 'Tambah Catatan Lomba'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Siswa (opsional)</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Peserta di luar data siswa</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Peserta *</label>
                <input
                  type="text"
                  value={formData.nama_peserta}
                  onChange={(e) => setFormData({ ...formData, nama_peserta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lomba *</label>
                <input
                  type="text"
                  value={formData.nama_lomba}
                  onChange={(e) => setFormData({ ...formData, nama_lomba: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: O2SN Kecamatan, POPDA, Kejurda"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat *</label>
                  <select
                    value={formData.tingkat}
                    onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(TINGKAT_LOMBA).map(([key, info]) => (
                      <option key={key} value={key}>{info.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
                  <select
                    value={formData.jenis}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="olahraga">Olahraga</option>
                    <option value="seni">Seni</option>
                    <option value="akademik">Akademik</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cabang/Nomor Lomba</label>
                <input
                  type="text"
                  list="contoh-cabang"
                  value={formData.cabang}
                  onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Atletik Kids - Kanga Escape"
                />
                <datalist id="contoh-cabang">
                  {CONTOH_CABANG_LOMBA.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penyelenggara</label>
                  <input
                    type="text"
                    value={formData.penyelenggara}
                    onChange={(e) => setFormData({ ...formData, penyelenggara: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempat</label>
                  <input
                    type="text"
                    value={formData.tempat}
                    onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lomba</label>
                  <input
                    type="date"
                    value={formData.tanggal_lomba}
                    onChange={(e) => setFormData({ ...formData, tanggal_lomba: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasil</label>
                  <select
                    value={formData.hasil}
                    onChange={(e) => setFormData({ ...formData, hasil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(HASIL_LOMBA).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peringkat</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.peringkat}
                    onChange={(e) => setFormData({ ...formData, peringkat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
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

export default CompetitionRecords
