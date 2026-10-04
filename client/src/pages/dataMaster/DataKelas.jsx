import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import useClasses from '../../hooks/useClasses'
import useStudents from '../../hooks/useStudents'
import { useAcademicYear } from '../../context/AcademicYearContext'

const EMPTY_FORM = {
  name: '',
  grade: '1',
  academic_year: '',
  wali_kelas: '',
  ruang_kelas: '',
}

export const DataKelas = () => {
  const { showNotification } = useNotification()
  const { availableYears, currentAcademicYear } = useAcademicYear()
  const { loadClasses, createClass, updateClass, deleteClass } = useClasses()
  const { loadStudents } = useStudents()

  const [classes, setClasses] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const loadAll = useCallback(async () => {
    setInitialLoading(true)
    try {
      const [classData, studentData] = await Promise.all([loadClasses(), loadStudents()])
      setClasses(classData || [])
      setStudentsList(studentData || [])
    } catch (err) {
      showNotification(err.message || 'Gagal memuat data kelas', 'error')
    } finally {
      setInitialLoading(false)
    }
  }, [loadClasses, loadStudents, showNotification])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const studentCount = useMemo(() => {
    const map = new Map()
    studentsList.forEach((s) => map.set(s.class_id, (map.get(s.class_id) || 0) + 1))
    return map
  }, [studentsList])

  const handleOpenForm = (cls = null) => {
    if (cls) {
      setEditingId(cls.id)
      setFormData({
        name: cls.name || '',
        grade: String(cls.grade || '1'),
        academic_year: cls.academic_year || '',
        wali_kelas: cls.wali_kelas || '',
        ruang_kelas: cls.ruang_kelas || '',
      })
    } else {
      setEditingId(null)
      setFormData({ ...EMPTY_FORM, academic_year: currentAcademicYear })
    }
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showNotification('Nama kelas wajib diisi', 'error')
      return
    }
    if (!formData.academic_year) {
      showNotification('Tahun ajaran wajib dipilih — menentukan TP mana kelas ini tampil di Dashboard & Rekap', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        grade: String(formData.grade),
        academic_year: formData.academic_year,
        wali_kelas: formData.wali_kelas.trim() || null,
        ruang_kelas: formData.ruang_kelas.trim() || null,
      }
      if (editingId) {
        await updateClass(editingId, payload)
        showNotification('Kelas berhasil diperbarui', 'success')
      } else {
        await createClass(payload)
        showNotification('Kelas berhasil ditambahkan', 'success')
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(EMPTY_FORM)
      await loadAll()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan kelas', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cls) => {
    const jumlah = studentCount.get(cls.id) || 0
    const pesan = jumlah
      ? `Hapus kelas ${cls.name} beserta ${jumlah} siswanya?\n\nSeluruh data absensi dan nilai siswa di kelas ini juga akan terhapus. Tindakan ini tidak bisa dibatalkan.`
      : `Hapus kelas ${cls.name}? Tindakan ini tidak bisa dibatalkan.`
    if (!window.confirm(pesan)) return
    try {
      await deleteClass(cls.id)
      showNotification('Kelas berhasil dihapus', 'success')
      await loadAll()
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus kelas', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Kelas</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Kelas rombel per tahun ajaran, lengkap wali kelas dan ruang
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <i className="fas fa-plus mr-2"></i>Tambah Kelas
        </button>
      </div>

      {/* Tabel kelas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {initialLoading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
            <p className="text-gray-600">Memuat data kelas...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 px-4">
            <i className="fas fa-school text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-600 font-medium">Belum ada kelas</p>
            <p className="text-sm text-gray-500 mt-1">
              Buat kelas dulu, lalu tambahkan siswa di menu{' '}
              <Link to="/data-siswa" className="text-blue-600 underline font-medium">Data Siswa</Link>.
            </p>
            <button
              onClick={() => handleOpenForm()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <i className="fas fa-plus mr-2"></i>Buat Kelas Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700">Nama Kelas</th>
                  <th className="px-3 sm:px-4 py-3 text-center font-semibold text-gray-700">Tingkat</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700">Tahun Ajaran</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell">Wali Kelas</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 hidden lg:table-cell">Ruang</th>
                  <th className="px-3 sm:px-4 py-3 text-center font-semibold text-gray-700">Siswa</th>
                  <th className="px-3 sm:px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-3 font-medium text-gray-900">{cls.name}</td>
                    <td className="px-3 sm:px-4 py-3 text-center text-gray-700">Kelas {cls.grade}</td>
                    <td className="px-3 sm:px-4 py-3 text-gray-700">
                      {cls.academic_year || (
                        <span className="text-amber-600 text-xs">Belum diatur</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-700 hidden md:table-cell">{cls.wali_kelas || '—'}</td>
                    <td className="px-3 sm:px-4 py-3 text-gray-700 hidden lg:table-cell">{cls.ruang_kelas || '—'}</td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {studentCount.get(cls.id) || 0}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenForm(cls)}
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit kelas"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(cls)}
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus kelas"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 flex items-start gap-2">
        <i className="fas fa-circle-info mt-0.5 text-blue-500"></i>
        Tahun ajaran menentukan kelas mana yang tampil di Dashboard dan Rekap saat guru memilih TP di header.
        Kelas tanpa tahun ajaran dianggap milik TP berjalan.
      </p>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
                aria-label="Tutup form"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 1A, 2B, 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat *</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <option key={level} value={String(level)}>Kelas {level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran (TP) *</label>
                <select
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Tahun Ajaran</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>TP {year}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Menentukan TP mana data kelas ini tampil di Dashboard dan Rekap
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wali Kelas</label>
                <input
                  type="text"
                  value={formData.wali_kelas}
                  onChange={(e) => setFormData({ ...formData, wali_kelas: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama wali kelas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ruang Kelas</label>
                <input
                  type="text"
                  value={formData.ruang_kelas}
                  onChange={(e) => setFormData({ ...formData, ruang_kelas: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: R101"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="min-h-[44px] px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-[44px] px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium"
                >
                  {saving ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Menyimpan...</>
                  ) : (
                    <><i className="fas fa-save mr-2"></i>{editingId ? 'Simpan Perubahan' : 'Simpan Kelas'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataKelas
