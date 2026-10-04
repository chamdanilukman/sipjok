import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '../../context/NotificationContext'
import useClasses from '../../hooks/useClasses'
import useStudents from '../../hooks/useStudents'
import ImportModal from '../../components/ImportModal'
import { formatNama } from '../../utils/formatNama'

// Form kosong standar rapor — semua field opsional kecuali nama, JK, dan kelas
const EMPTY_FORM = {
  name: '',
  nis: '',
  nisn: '',
  gender: '',
  class_id: '',
  birth_place: '',
  birth_date: '',
  religion: '',
  address: '',
  father_name: '',
  mother_name: '',
  parent_job: '',
  parent_phone: '',
  origin_school: '',
}

const AGAMA = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']

export const DataSiswa = () => {
  const { showNotification } = useNotification()
  const { loadClasses } = useClasses()
  const { loading, error, loadStudents, createStudent, updateStudent, deleteStudent } = useStudents()

  const [classes, setClasses] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterClassId, setFilterClassId] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const loadAll = useCallback(async () => {
    setInitialLoading(true)
    try {
      const [classData, studentData] = await Promise.all([loadClasses(), loadStudents()])
      setClasses(classData || [])
      setStudentsList(studentData || [])
    } catch (err) {
      showNotification(err.message || 'Gagal memuat data siswa', 'error')
    } finally {
      setInitialLoading(false)
    }
  }, [loadClasses, loadStudents, showNotification])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return studentsList
      .filter((s) => (filterClassId ? s.class_id === filterClassId : true))
      .filter((s) => {
        if (!q) return true
        const nama = String(s.name || '').toLowerCase()
        return (
          nama.includes(q) ||
          String(s.nis || '').toLowerCase().includes(q) ||
          String(s.nisn || '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (a.class_id !== b.class_id) return String(a.class_id).localeCompare(String(b.class_id))
        return String(a.name || '').localeCompare(String(b.name || ''), 'id')
      })
  }, [studentsList, filterClassId, search])

  const classById = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes])

  const stats = useMemo(
    () => ({
      total: filtered.length,
      laki: filtered.filter((s) => s.gender === 'L').length,
      perempuan: filtered.filter((s) => s.gender === 'P').length,
    }),
    [filtered]
  )

  const handleOpenForm = (student = null) => {
    if (student) {
      setEditingId(student.id)
      setFormData({ ...EMPTY_FORM, ...student, birth_date: (student.birth_date || '').slice(0, 10) })
    } else {
      setEditingId(null)
      setFormData({ ...EMPTY_FORM, class_id: filterClassId || (classes[0]?.id ?? '') })
    }
    setShowForm(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showNotification('Nama siswa wajib diisi', 'error')
      return
    }
    if (!formData.gender) {
      showNotification('Jenis kelamin wajib dipilih', 'error')
      return
    }
    if (!formData.class_id) {
      showNotification('Kelas wajib dipilih', 'error')
      return
    }

    setSaving(true)
    try {
      // Nama dirapikan Kapital Huruf Depan sebelum disimpan (server merapikan lagi)
      const payload = { ...formData, name: formatNama(formData.name) }
      if (editingId) {
        await updateStudent(editingId, payload)
        showNotification('Data siswa berhasil diperbarui', 'success')
      } else {
        await createStudent(payload)
        showNotification('Siswa baru berhasil ditambahkan', 'success')
      }
      setShowForm(false)
      setEditingId(null)
      setFormData(EMPTY_FORM)
      await loadAll()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan data siswa', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (student) => {
    const nama = formatNama(student.name)
    if (
      !window.confirm(
        `Hapus ${nama}?\n\nSeluruh data absensi, nilai, dan catatan siswa ini juga akan terhapus. Tindakan ini tidak bisa dibatalkan.`
      )
    )
      return
    try {
      await deleteStudent(student.id)
      showNotification(`${nama} berhasil dihapus`, 'success')
      await loadAll()
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus siswa', 'error')
    }
  }

  // Import Excel/CSV: kolom kelas, nama, jenis kelamin, nis
  const handleImportStudents = async (data) => {
    let successCount = 0
    let errorCount = 0
    const errors = []

    for (const row of data) {
      try {
        const getValue = (key) => {
          const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase())
          return found ? row[found] : undefined
        }

        const className = getValue('kelas')
        const targetClass = classes.find(
          (cls) => cls.name === className || String(cls.grade) === String(className)
        )
        if (!targetClass) {
          errors.push(`Kelas "${className}" tidak ditemukan untuk ${getValue('nama') || 'siswa tanpa nama'}`)
          errorCount++
          continue
        }

        let jk = (getValue('jenis kelamin') || getValue('jenis_kelamin') || '').toString().toUpperCase()
        let gender = ''
        if (['L', 'LAKI-LAKI', 'LAKI'].includes(jk)) gender = 'L'
        if (['P', 'PEREMPUAN'].includes(jk)) gender = 'P'
        if (!gender) {
          errors.push(`Jenis kelamin tidak valid untuk ${getValue('nama') || 'siswa tanpa nama'}`)
          errorCount++
          continue
        }

        await createStudent({
          class_id: targetClass.id,
          name: formatNama(getValue('nama')),
          nis: getValue('nis') ? String(getValue('nis')).trim() : null,
          gender,
        })
        successCount++
      } catch (err) {
        errors.push(`Gagal import satu baris: ${err.message}`)
        errorCount++
      }
    }

    if (errorCount > 0) {
      showNotification(`Import selesai. Berhasil: ${successCount}, Gagal: ${errorCount}. ${errors.slice(0, 3).join(' | ')}`, 'warning')
    } else {
      showNotification(`Import berhasil! ${successCount} siswa ditambahkan.`, 'success')
    }
    await loadAll()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Lengkap seperti rapor: identitas, ttl, alamat, dan orang tua/wali
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="min-h-[44px] px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-colors text-sm font-medium"
          >
            <i className="fas fa-upload mr-2"></i>Import Excel
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-colors text-sm font-medium"
          >
            <i className="fas fa-user-plus mr-2"></i>Tambah Siswa
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={loadAll} className="text-sm font-medium text-red-700 underline">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Filter & pencarian */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} — Kelas {cls.grade}
                  {cls.academic_year ? ` (TP ${cls.academic_year})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari siswa</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nama, NIS, atau NISN..."
              className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-sm">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">{stats.total} siswa</span>
          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">{stats.laki} laki-laki</span>
          <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full font-medium">{stats.perempuan} perempuan</span>
        </div>
        {classes.length === 0 && !initialLoading && (
          <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Belum ada kelas.{' '}
            <Link to="/data-kelas" className="underline font-medium">
              Buat kelas dulu di menu Data Kelas
            </Link>{' '}
            sebelum menambah siswa.
          </p>
        )}
      </div>

      {/* Tabel siswa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {initialLoading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
            <p className="text-gray-600">Memuat data siswa...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <i className="fas fa-user-graduate text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-600 font-medium">
              {studentsList.length === 0 ? 'Belum ada data siswa' : 'Tidak ada siswa yang cocok dengan filter'}
            </p>
            {studentsList.length === 0 ? (
              <button
                onClick={() => handleOpenForm()}
                disabled={classes.length === 0}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <i className="fas fa-user-plus mr-2"></i>Tambah Siswa Pertama
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearch('')
                  setFilterClassId('')
                }}
                className="mt-4 text-sm text-blue-600 underline font-medium"
              >
                Reset filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 w-12">No</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700">Nama Siswa</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 hidden md:table-cell">NIS / NISN</th>
                  <th className="px-3 sm:px-4 py-3 text-center font-semibold text-gray-700 hidden sm:table-cell">JK</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700">Kelas</th>
                  <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-700 hidden lg:table-cell">Tempat, Tgl Lahir</th>
                  <th className="px-3 sm:px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, index) => {
                  const cls = classById.get(s.class_id)
                  return (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-3 sm:px-4 py-3">
                        <p className="font-medium text-gray-900">{formatNama(s.name)}</p>
                        <p className="text-xs text-gray-500 md:hidden">{s.nis || s.nisn || '—'}</p>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-gray-700 hidden md:table-cell">
                        <p>{s.nis || '—'}</p>
                        <p className="text-xs text-gray-500">{s.nisn || ''}</p>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-center hidden sm:table-cell">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-gray-700">
                        {cls ? cls.name : '—'}
                        {cls?.academic_year && (
                          <span className="block text-xs text-gray-500">TP {cls.academic_year}</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-gray-700 hidden lg:table-cell">
                        {s.birth_place || s.birth_date
                          ? `${s.birth_place ? s.birth_place + ', ' : ''}${s.birth_date || ''}`
                          : '—'}
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenForm(s)}
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit data siswa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus siswa"
                        >
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
      </div>

      {/* Form Modal — data lengkap standar rapor */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
                aria-label="Tutup form"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-5">
              {/* Identitas */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 mb-3">
                  <i className="fas fa-id-card text-blue-600 mr-2"></i>Data Pribadi
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: budi santoso (otomatis jadi Budi Santoso)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                    <input type="text" name="nis" value={formData.nis} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nomor induk sekolah" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                    <input type="text" name="nisn" value={formData.nisn} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nomor induk nasional (10 digit)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin *</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Pilih</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kelas *</label>
                    <select name="class_id" value={formData.class_id} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Pilih Kelas</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} — Kelas {cls.grade}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                    <input type="text" name="birth_place" value={formData.birth_place} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Semarang" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
                    <select name="religion" value={formData.religion} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Pilih (opsional)</option>
                      {AGAMA.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asal Sekolah</label>
                    <input type="text" name="origin_school" value={formData.origin_school} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="TK/SD asal" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Alamat tempat tinggal siswa"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Orang tua */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 mb-3">
                  <i className="fas fa-users text-blue-600 mr-2"></i>Orang Tua / Wali
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ayah</label>
                    <input type="text" name="father_name" value={formData.father_name} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu</label>
                    <input type="text" name="mother_name" value={formData.mother_name} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan Orang Tua</label>
                    <input type="text" name="parent_job" value={formData.parent_job} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Petani" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. HP Orang Tua / Wali</label>
                    <input type="tel" name="parent_phone" value={formData.parent_phone} onChange={handleInputChange} className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: 0812xxxxxxx" />
                  </div>
                </div>
              </fieldset>

              <p className="text-xs text-gray-500">
                Kolom bertanda * wajib diisi. Nama akan otomatis dirapikan menjadi Kapital Huruf Depan.
              </p>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t">
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
                    <><i className="fas fa-save mr-2"></i>{editingId ? 'Simpan Perubahan' : 'Simpan Siswa'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImportStudents}
        type="students"
      />
    </div>
  )
}

export default DataSiswa
