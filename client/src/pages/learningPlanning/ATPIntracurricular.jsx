import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useATP from '../../hooks/useATP'
import ATPCard from '../../components/learningPlanning/ATPCard'
import FormSection from '../../components/learningPlanning/FormSection'
import { api } from '../../lib/api'

export const ATPIntracurricular = () => {
  const { showNotification } = useNotification()
  const {
    atpList,
    loading,
    error,
    loadATP,
    createATP,
    updateATP,
    deleteATP,
    searchATP,
    filterATP,
  } = useATP()

  const [userId, setUserId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingATP, setEditingATP] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterFase, setFilterFase] = useState('')
  const [filterKelas, setFilterKelas] = useState('')

  const [formData, setFormData] = useState({
    judul: '',
    mata_pelajaran: 'PJOK',
    fase: 'A',
    kelas: '1',
    capaian_pembelajaran: '',
    tujuan_pembelajaran: [{ id: Date.now(), text: '' }],
    alokasi_waktu: 1,
  })

  // Get current user and load ATP
  useEffect(() => {
    const getCurrentUser = async () => {
      const user = await api.get('/auth/me')
      if (user) {
        setUserId(user.id)
        loadATP(user.id)
      }
    }
    getCurrentUser()
  }, [loadATP])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTPChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      tujuan_pembelajaran: prev.tujuan_pembelajaran.map((tp) =>
        tp.id === id ? { ...tp, text: value } : tp
      ),
    }))
  }

  const handleAddTP = () => {
    setFormData((prev) => ({
      ...prev,
      tujuan_pembelajaran: [
        ...prev.tujuan_pembelajaran,
        { id: Date.now(), text: '' },
      ],
    }))
  }

  const handleRemoveTP = (id) => {
    setFormData((prev) => ({
      ...prev,
      tujuan_pembelajaran: prev.tujuan_pembelajaran.filter((tp) => tp.id !== id),
    }))
  }

  const handleOpenModal = (atp = null) => {
    if (atp) {
      // Edit mode
      setEditingATP(atp)
      setFormData({
        judul: atp.judul,
        mata_pelajaran: atp.mata_pelajaran,
        fase: atp.fase,
        kelas: atp.kelas,
        capaian_pembelajaran: atp.capaian_pembelajaran,
        tujuan_pembelajaran: atp.tujuan_pembelajaran.map((tp, index) => ({
          id: tp.id || Date.now() + index,
          text: tp.text || tp,
        })),
        alokasi_waktu: atp.alokasi_waktu,
      })
    } else {
      // Create mode
      setEditingATP(null)
      setFormData({
        judul: '',
        mata_pelajaran: 'PJOK',
        fase: 'A',
        kelas: '1',
        capaian_pembelajaran: '',
        tujuan_pembelajaran: [{ id: Date.now(), text: '' }],
        alokasi_waktu: 1,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingATP(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.judul.trim()) {
      showNotification('Judul ATP harus diisi', 'error')
      return
    }

    if (!formData.capaian_pembelajaran.trim()) {
      showNotification('Capaian Pembelajaran harus diisi', 'error')
      return
    }

    const validTP = formData.tujuan_pembelajaran.filter((tp) => tp.text.trim())
    if (validTP.length === 0) {
      showNotification('Minimal 1 Tujuan Pembelajaran harus diisi', 'error')
      return
    }

    try {
      const dataToSave = {
        ...formData,
        tujuan_pembelajaran: validTP,
      }

      if (editingATP) {
        await updateATP(editingATP.id, dataToSave)
        showNotification('ATP berhasil diperbarui', 'success')
      } else {
        await createATP(userId, dataToSave)
        showNotification('ATP berhasil dibuat', 'success')
      }

      handleCloseModal()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan ATP', 'error')
    }
  }

  const handleDelete = async (atpId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus ATP ini?')) {
      return
    }

    try {
      await deleteATP(atpId)
      showNotification('ATP berhasil dihapus', 'success')
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus ATP', 'error')
    }
  }

  const handleSearch = async () => {
    if (!userId) return

    if (searchKeyword.trim()) {
      await searchATP(userId, searchKeyword)
    } else {
      await loadATP(userId)
    }
  }

  const handleFilter = async () => {
    if (!userId) return

    const filters = {}
    if (filterFase) filters.fase = filterFase
    if (filterKelas) filters.kelas = filterKelas

    if (Object.keys(filters).length > 0) {
      await filterATP(userId, filters)
    } else {
      await loadATP(userId)
    }
  }

  const handleClearFilters = async () => {
    setSearchKeyword('')
    setFilterFase('')
    setFilterKelas('')
    if (userId) {
      await loadATP(userId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ATP Intrakurikuler</h1>
        <p className="text-gray-600 mt-2">
          Kelola Alur Tujuan Pembelajaran untuk setiap fase dan kelas
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
        >
          <i className="fas fa-plus"></i>
          Tambah ATP Baru
        </button>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Cari ATP..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>

          {/* Filter Fase */}
          <select
            value={filterFase}
            onChange={(e) => {
              setFilterFase(e.target.value)
              handleFilter()
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Semua Fase</option>
            <option value="A">Fase A</option>
            <option value="B">Fase B</option>
            <option value="C">Fase C</option>
          </select>

          {/* Filter Kelas */}
          <select
            value={filterKelas}
            onChange={(e) => {
              setFilterKelas(e.target.value)
              handleFilter()
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Semua Kelas</option>
            <option value="1">Kelas 1</option>
            <option value="2">Kelas 2</option>
            <option value="3">Kelas 3</option>
            <option value="4">Kelas 4</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
          </select>

          {(searchKeyword || filterFase || filterKelas) && (
            <button
              onClick={handleClearFilters}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <i className="fas fa-times mr-1"></i>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ATP List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Memuat ATP...</p>
          </div>
        </div>
      ) : atpList.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-stream text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum ada ATP
          </h3>
          <p className="text-gray-600 mb-6">
            Mulai dengan membuat ATP pertama Anda
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <i className="fas fa-plus"></i>
            Tambah ATP Baru
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Menampilkan {atpList.length} ATP
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {atpList.map((atp) => (
              <ATPCard
                key={atp.id}
                atp={atp}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingATP ? 'Edit ATP' : 'Tambah ATP Baru'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <FormSection
                title="Informasi Dasar"
                description="Informasi umum tentang ATP"
              >
                <div className="space-y-4">
                  {/* Judul */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Judul ATP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="judul"
                      value={formData.judul}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Contoh: Gerak Dasar Lokomotor"
                      required
                    />
                  </div>

                  {/* Mata Pelajaran */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Mata Pelajaran
                    </label>
                    <input
                      type="text"
                      name="mata_pelajaran"
                      value={formData.mata_pelajaran}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      readOnly
                    />
                  </div>

                  {/* Fase & Kelas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Fase <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="fase"
                        value={formData.fase}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="A">Fase A (Kelas 1-2)</option>
                        <option value="B">Fase B (Kelas 3-4)</option>
                        <option value="C">Fase C (Kelas 5-6)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Kelas <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="kelas"
                        value={formData.kelas}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="1">Kelas 1</option>
                        <option value="2">Kelas 2</option>
                        <option value="3">Kelas 3</option>
                        <option value="4">Kelas 4</option>
                        <option value="5">Kelas 5</option>
                        <option value="6">Kelas 6</option>
                      </select>
                    </div>
                  </div>

                  {/* Alokasi Waktu */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Alokasi Waktu (JP) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="alokasi_waktu"
                      value={formData.alokasi_waktu}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Capaian Pembelajaran"
                description="Deskripsi capaian pembelajaran yang diharapkan"
              >
                <textarea
                  name="capaian_pembelajaran"
                  value={formData.capaian_pembelajaran}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Tuliskan capaian pembelajaran..."
                  required
                ></textarea>
              </FormSection>

              <FormSection
                title="Tujuan Pembelajaran"
                description="Daftar tujuan pembelajaran yang spesifik"
              >
                <div className="space-y-3">
                  {formData.tujuan_pembelajaran.map((tp, index) => (
                    <div key={tp.id} className="flex gap-2">
                      <div className="flex-shrink-0 pt-2 text-sm font-medium text-gray-500">
                        {index + 1}.
                      </div>
                      <input
                        type="text"
                        value={tp.text}
                        onChange={(e) => handleTPChange(tp.id, e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Tuliskan tujuan pembelajaran..."
                      />
                      {formData.tujuan_pembelajaran.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTP(tp.id)}
                          className="flex-shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddTP}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600"
                  >
                    <i className="fas fa-plus"></i>
                    Tambah Tujuan Pembelajaran
                  </button>
                </div>
              </FormSection>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {editingATP ? 'Perbarui ATP' : 'Simpan ATP'}
                    </>
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

export default ATPIntracurricular


