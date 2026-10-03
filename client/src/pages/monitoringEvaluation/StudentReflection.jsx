import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useStudentReflections, {
  PERASAAN_SISWA,
  PERTANYAAN_REFLEKSI,
  TINGKAT_PAHAM_LABEL,
} from '../../hooks/useStudentReflections'
import useClasses from '../../hooks/useClasses'
import useStudents from '../../hooks/useStudents'
import { api } from '../../lib/api'

// Refleksi Siswa — jurnal refleksi diri pasca pembelajaran PJOK, mengikuti
// pengalaman belajar "merefleksi" dalam kerangka Pembelajaran Mendalam
// (Permendikdasmen No. 13 Tahun 2025)
export const StudentReflection = () => {
  const { showNotification } = useNotification()
  const {
    reflections,
    loading,
    error,
    loadReflections,
    createReflection,
    updateReflection,
    deleteReflection,
  } = useStudentReflections()
  const { loadClasses: loadClassesHook } = useClasses()
  const { loadStudents } = useStudents()

  const [userId, setUserId] = useState(null)
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [filterClassId, setFilterClassId] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    student_id: '',
    class_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    materi: '',
    perasaan: 'senang',
    tingkat_pemahaman: 3,
    yang_dipelajari: '',
    kesulitan: '',
    rencana: '',
  })

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          loadReflections()
          const classData = await loadClassesHook()
          setClasses(classData || [])
          const studentData = await loadStudents()
          setStudents(studentData || [])
        }
      } catch (err) {
        console.error('Error getting current user:', err)
      }
    }
    getCurrentUser()
  }, [loadReflections, loadClassesHook, loadStudents])

  const filtered = filterClassId ? reflections.filter((r) => r.class_id === filterClassId) : reflections

  const filteredStudents = formData.class_id ? students.filter((s) => s.class_id === formData.class_id) : students

  const handleOpenModal = (reflection = null) => {
    if (reflection) {
      setEditingId(reflection.id)
      setFormData({
        student_id: reflection.student_id || '',
        class_id: reflection.class_id || '',
        tanggal: (reflection.tanggal || '').slice(0, 10) || new Date().toISOString().split('T')[0],
        materi: reflection.materi || '',
        perasaan: reflection.perasaan || 'senang',
        tingkat_pemahaman: reflection.tingkat_pemahaman || 3,
        yang_dipelajari: reflection.yang_dipelajari || '',
        kesulitan: reflection.kesulitan || '',
        rencana: reflection.rencana || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        student_id: '',
        class_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        materi: '',
        perasaan: 'senang',
        tingkat_pemahaman: 3,
        yang_dipelajari: '',
        kesulitan: '',
        rencana: '',
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.student_id || !formData.class_id) {
      showNotification('Kelas dan siswa harus dipilih', 'error')
      return
    }
    try {
      const payload = { ...formData, tingkat_pemahaman: parseInt(formData.tingkat_pemahaman) || null }
      if (editingId) {
        await updateReflection(editingId, payload)
        showNotification('Refleksi siswa berhasil diperbarui', 'success')
      } else {
        await createReflection(userId, payload)
        showNotification('Refleksi siswa berhasil dicatat', 'success')
      }
      setShowModal(false)
      await loadReflections()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan refleksi', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus refleksi ini?')) return
    try {
      await deleteReflection(id)
      showNotification('Refleksi siswa berhasil dihapus', 'success')
      await loadReflections()
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus refleksi', 'error')
    }
  }

  const studentNameOf = (r) => r.student?.name || '—'
  const perasaanInfo = (r) => PERASAAN_SISWA[r.perasaan] || PERASAAN_SISWA.biasa

  const avgPaham = reflections.length
    ? Math.round((reflections.reduce((sum, r) => sum + (r.tingkat_pemahaman || 0), 0) / reflections.length) * 10) / 10
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Refleksi Siswa</h1>
          <p className="text-gray-600 mt-2">Jurnal refleksi diri siswa pasca pembelajaran PJOK</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Catat Refleksi
        </button>
      </div>

      {/* Referensi regulasi */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          Refleksi merupakan bagian pengalaman belajar <strong>merefleksi</strong> dalam kerangka Pembelajaran
          Mendalam (berkesadaran, bermakna, menggembirakan) — <strong>Permendikdasmen No. 13 Tahun 2025</strong>.
          Tiga pertanyaan refleksi: {Object.values(PERTANYAAN_REFLEKSI).join(' ')}
        </p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{reflections.length}</p>
          <p className="text-sm text-gray-600">Total Refleksi</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {reflections.filter((r) => r.perasaan === 'senang').length}
          </p>
          <p className="text-sm text-gray-600">😊 Senang</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {reflections.filter((r) => r.perasaan === 'biasa').length}
          </p>
          <p className="text-sm text-gray-600">😐 Biasa</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{avgPaham}</p>
          <p className="text-sm text-gray-600">Rata-rata Pemahaman (1-5)</p>
        </div>
      </div>

      {/* Filter kelas */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterClassId('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!filterClassId ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Semua Kelas
        </button>
        {classes.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilterClassId(c.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterClassId === c.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Daftar refleksi */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Memuat refleksi...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-lightbulb text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">Belum ada refleksi siswa. Klik "Catat Refleksi" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => {
            const pInfo = perasaanInfo(r)
            return (
              <div key={r.id} className="bg-white rounded-lg shadow-md p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                      {(r.tanggal || '').slice(0, 10)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pInfo.badge}`}>
                      {pInfo.emoji} {pInfo.label}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {r.class?.name || '—'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(r)} className="text-blue-600 hover:text-blue-800" title="Edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{studentNameOf(r)}</h3>
                {r.materi && <p className="text-xs text-gray-500 mb-2"><i className="fas fa-book mr-1"></i>{r.materi}</p>}

                <div className="flex items-center gap-1 mb-2">
                  <span className="text-xs text-gray-500 mr-1">Pemahaman:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <i key={n} className={`fas fa-star text-xs ${n <= (r.tingkat_pemahaman || 0) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    {TINGKAT_PAHAM_LABEL[r.tingkat_pemahaman] || ''}
                  </span>
                </div>

                {r.yang_dipelajari && (
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">📘 Dipelajari:</span> {r.yang_dipelajari}
                  </p>
                )}
                {r.kesulitan && (
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">⚠️ Sulit:</span> {r.kesulitan}
                  </p>
                )}
                {r.rencana && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">🎯 Rencana:</span> {r.rencana}
                  </p>
                )}
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
              {editingId ? 'Edit Refleksi Siswa' : 'Catat Refleksi Siswa'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas *</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value, student_id: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Siswa *</label>
                  <select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Siswa</option>
                    {filteredStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Materi Hari Ini</label>
                  <input
                    type="text"
                    value={formData.materi}
                    onChange={(e) => setFormData({ ...formData, materi: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="mis. Lompat Tali"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bagaimana perasaanmu?</label>
                <div className="flex gap-2">
                  {Object.entries(PERASAAN_SISWA).map(([key, info]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, perasaan: key })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        formData.perasaan === key
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {info.emoji} {info.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Pemahaman</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.tingkat_pemahaman}
                    onChange={(e) => setFormData({ ...formData, tingkat_pemahaman: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-700 w-28">
                    {formData.tingkat_pemahaman} - {TINGKAT_PAHAM_LABEL[formData.tingkat_pemahaman]}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{PERTANYAAN_REFLEKSI.yang_dipelajari}</label>
                <textarea
                  value={formData.yang_dipelajari}
                  onChange={(e) => setFormData({ ...formData, yang_dipelajari: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{PERTANYAAN_REFLEKSI.kesulitan}</label>
                <textarea
                  value={formData.kesulitan}
                  onChange={(e) => setFormData({ ...formData, kesulitan: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{PERTANYAAN_REFLEKSI.rencana}</label>
                <textarea
                  value={formData.rencana}
                  onChange={(e) => setFormData({ ...formData, rencana: e.target.value })}
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

export default StudentReflection
