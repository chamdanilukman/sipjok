import React, { useState, useEffect } from 'react'
import { useDataContext } from '../context/DataContext'

export const Students = () => {
  const { loading, error, loadKelas, loadSiswaByKelas, showNotification } = useDataContext()
  const [kelas, setKelas] = useState([])
  const [selectedKelasId, setSelectedKelasId] = useState(null)
  const [siswa, setSiswa] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nama: '',
    nis: '',
    nisn: '',
    kelas_id: '',
    alamat: '',
    telepon: '',
  })

  useEffect(() => {
    loadKelasData()
  }, [])

  useEffect(() => {
    if (selectedKelasId) {
      loadSiswaData()
    }
  }, [selectedKelasId])

  const loadKelasData = async () => {
    try {
      const data = await loadKelas()
      setKelas(data)
      if (data.length > 0) {
        setSelectedKelasId(data[0].id)
      }
    } catch (err) {
      showNotification('Gagal memuat data kelas', 'error')
    }
  }

  const loadSiswaData = async () => {
    try {
      const data = await loadSiswaByKelas(selectedKelasId)
      setSiswa(data)
    } catch (err) {
      showNotification('Gagal memuat data siswa', 'error')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // TODO: Implement save logic
      showNotification('Data siswa berhasil disimpan', 'success')
      setShowForm(false)
      setFormData({
        nama: '',
        nis: '',
        nisn: '',
        kelas_id: '',
        alamat: '',
        telepon: '',
      })
      loadSiswaData()
    } catch (err) {
      showNotification('Gagal menyimpan data siswa', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Siswa</h1>
          <p className="text-gray-600 mt-2">Kelola data siswa per kelas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Tambah Siswa
        </button>
      </div>

      {/* Class Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Kelas
        </label>
        <select
          value={selectedKelasId || ''}
          onChange={(e) => setSelectedKelasId(e.target.value)}
          className="input-field"
        >
          <option value="">-- Pilih Kelas --</option>
          {kelas.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Siswa Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Siswa
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIS
                </label>
                <input
                  type="text"
                  name="nis"
                  value={formData.nis}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NISN
                </label>
                <input
                  type="text"
                  name="nisn"
                  value={formData.nisn}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telepon
                </label>
                <input
                  type="tel"
                  name="telepon"
                  value={formData.telepon}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                className="input-field"
                rows="3"
              ></textarea>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Daftar Siswa</h2>
        {loading ? (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        ) : siswa.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="table-header">No</th>
                  <th className="table-header">Nama</th>
                  <th className="table-header">NIS</th>
                  <th className="table-header">NISN</th>
                  <th className="table-header">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {siswa.map((s, index) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{s.nama}</td>
                    <td className="table-cell">{s.nis}</td>
                    <td className="table-cell">{s.nisn || '-'}</td>
                    <td className="table-cell">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
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

