import React, { useState, useEffect } from 'react'
import { useNotification } from '../context/NotificationContext'
import useClasses from '../hooks/useClasses'
import useStudents from '../hooks/useStudents'

export const Students = () => {
  const { showNotification } = useNotification()
  const { loadClasses } = useClasses()
  const { students: studentsList, loading, error, loadStudents, createStudent, updateStudent, deleteStudent } = useStudents()

  const [kelas, setKelas] = useState([])
  const [selectedKelasId, setSelectedKelasId] = useState('')
  const [siswa, setSiswa] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    gender: '',
    class_id: '',
  })

  useEffect(() => {
    loadKelasData()
  }, [])

  useEffect(() => {
    if (selectedKelasId) {
      loadSiswaData()
    }
  }, [selectedKelasId, studentsList])

  const loadKelasData = async () => {
    try {
      const data = await loadClasses()
      setKelas(data || [])
      if (data && data.length > 0 && !selectedKelasId) {
        setSelectedKelasId(data[0].id)
      }
    } catch (err) {
      showNotification('Gagal memuat data kelas', 'error')
    }
  }

  const loadSiswaData = async () => {
    try {
      await loadStudents()
      const filtered = studentsList.filter(s => s.class_id === selectedKelasId)
      setSiswa(filtered)
    } catch (err) {
      showNotification('Gagal memuat data siswa', 'error')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOpenForm = (student = null) => {
    if (student) {
      setEditingStudentId(student.id)
      setFormData({
        name: student.name || '',
        nis: student.nis || '',
        gender: student.gender || '',
        class_id: student.class_id || selectedKelasId,
      })
    } else {
      setEditingStudentId(null)
      setFormData({
        name: '',
        nis: '',
        gender: '',
        class_id: selectedKelasId,
      })
    }
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.gender || !formData.class_id) {
      showNotification('Nama, jenis kelamin, dan kelas harus diisi', 'error')
      return
    }
    if (formData.gender !== 'L' && formData.gender !== 'P') {
      showNotification('Jenis kelamin harus L atau P', 'error')
      return
    }

    try {
      if (editingStudentId) {
        await updateStudent(editingStudentId, formData)
        showNotification('Data siswa berhasil diperbarui', 'success')
      } else {
        await createStudent(formData)
        showNotification('Data siswa berhasil ditambahkan', 'success')
      }
      setShowForm(false)
      setEditingStudentId(null)
      setFormData({ name: '', nis: '', gender: '', class_id: selectedKelasId })
      await loadStudents()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan data siswa', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus siswa ini?')) return
    try {
      await deleteStudent(id)
      showNotification('Siswa berhasil dihapus', 'success')
      await loadStudents()
    } catch (err) {
      showNotification('Gagal menghapus siswa', 'error')
    }
  }

  useEffect(() => {
    if (studentsList && selectedKelasId) {
      const filtered = studentsList.filter(s => s.class_id === selectedKelasId)
      setSiswa(filtered)
    }
  }, [studentsList, selectedKelasId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Siswa</h1>
          <p className="text-gray-600 mt-2">Kelola data siswa per kelas</p>
        </div>
        <button onClick={() => handleOpenForm()} className="btn-primary flex items-center gap-2">
          <i className="fas fa-plus"></i>
          Tambah Siswa
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
        <select
          value={selectedKelasId}
          onChange={(e) => setSelectedKelasId(e.target.value)}
          className="input-field"
        >
          <option value="">-- Pilih Kelas --</option>
          {kelas.map((k) => (
            <option key={k.id} value={k.id}>{k.name} - Kelas {k.grade}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingStudentId ? 'Edit Siswa' : 'Tambah Siswa Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                <input type="text" name="nis" value={formData.nis} onChange={handleInputChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin *</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="input-field" required>
                  <option value="">-- Pilih --</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Simpan</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingStudentId(null) }} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Daftar Siswa</h2>
        {loading ? (
          <div className="text-center py-8"><i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i></div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <i className="fas fa-exclamation-circle mr-2"></i>{error}
          </div>
        ) : siswa.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="table-header">No</th>
                  <th className="table-header">Nama</th>
                  <th className="table-header">NIS</th>
                  <th className="table-header">Jenis Kelamin</th>
                  <th className="table-header">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {siswa.map((s, index) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{s.name}</td>
                    <td className="table-cell">{s.nis || '-'}</td>
                    <td className="table-cell">{s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td className="table-cell">
                      <button onClick={() => handleOpenForm(s)} className="text-blue-600 hover:text-blue-800 mr-2">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-inbox text-3xl mb-2"></i>
            <p>Tidak ada data siswa</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Students
