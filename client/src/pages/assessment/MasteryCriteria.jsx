import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useKKTP from '../../hooks/useKKTP'
import { api } from '../../lib/api'

export const MasteryCriteria = () => {
  const { showNotification } = useNotification()
  const {
    kktpList,
    loading,
    loadKKTP,
    createKKTP,
    updateKKTP,
    deleteKKTP,
    searchKKTP,
    filterKKTP,
    DEFAULT_INDICATORS,
    getLevelFromScore,
  } = useKKTP()

  const [userId, setUserId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingKKTP, setEditingKKTP] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterFase, setFilterFase] = useState('')
  const [filterKelas, setFilterKelas] = useState('')

  const [formData, setFormData] = useState({
    subject: 'PJOK',
    fase: 'A',
    kelas: '1',
    tujuan_pembelajaran: '',
    kktp_percentage: 75,
    indicators: DEFAULT_INDICATORS,
  })

  // Get current user and load data
  useEffect(() => {
    const getCurrentUser = async () => {
      const user = await api.get('/auth/me')
      if (user) {
        setUserId(user.id)
        loadKKTP(user.id)
      }
    }
    getCurrentUser()
  }, [loadKKTP])

  const handleOpenModal = (kktp = null) => {
    if (kktp) {
      setEditingKKTP(kktp)
      setFormData({
        subject: kktp.subject,
        fase: kktp.fase,
        kelas: kktp.kelas,
        tujuan_pembelajaran: kktp.tujuan_pembelajaran,
        kktp_percentage: kktp.kktp_percentage,
        indicators: kktp.indicators || DEFAULT_INDICATORS,
      })
    } else {
      setEditingKKTP(null)
      setFormData({
        subject: 'PJOK',
        fase: 'A',
        kelas: '1',
        tujuan_pembelajaran: '',
        kktp_percentage: 75,
        indicators: DEFAULT_INDICATORS,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingKKTP(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.tujuan_pembelajaran) {
      showNotification('Tujuan pembelajaran harus diisi', 'error')
      return
    }

    try {
      if (editingKKTP) {
        await updateKKTP(editingKKTP.id, formData)
        showNotification('KKTP berhasil diperbarui', 'success')
      } else {
        await createKKTP(userId, formData)
        showNotification('KKTP berhasil ditambahkan', 'success')
      }
      handleCloseModal()
      loadKKTP(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan KKTP', 'error')
    }
  }

  const handleDelete = async (kktpId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus KKTP ini?')) {
      return
    }

    try {
      await deleteKKTP(kktpId)
      showNotification('KKTP berhasil dihapus', 'success')
      loadKKTP(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus KKTP', 'error')
    }
  }

  const handleSearch = async () => {
    if (searchKeyword.trim()) {
      await searchKKTP(userId, searchKeyword)
    } else {
      loadKKTP(userId)
    }
  }

  const handleFilter = async () => {
    if (filterFase || filterKelas) {
      await filterKKTP(userId, { fase: filterFase, kelas: filterKelas })
    } else {
      loadKKTP(userId)
    }
  }

  const handleClearFilters = () => {
    setSearchKeyword('')
    setFilterFase('')
    setFilterKelas('')
    loadKKTP(userId)
  }

  const handleIndicatorChange = (index, field, value) => {
    const newIndicators = [...formData.indicators]
    newIndicators[index] = { ...newIndicators[index], [field]: value }
    setFormData({ ...formData, indicators: newIndicators })
  }

  const getFaseLabel = (fase) => {
    const labels = {
      A: 'Fase A (Kelas 1-2)',
      B: 'Fase B (Kelas 3-4)',
      C: 'Fase C (Kelas 5-6)',
    }
    return labels[fase] || fase
  }

  const getLevelColor = (level) => {
    const colors = {
      'Belum Berkembang': 'bg-red-100 text-red-800',
      'Mulai Berkembang': 'bg-yellow-100 text-yellow-800',
      'Berkembang Sesuai Harapan': 'bg-blue-100 text-blue-800',
      'Sangat Berkembang': 'bg-green-100 text-green-800',
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Kriteria Ketuntasan (KKTP)
        </h1>
        <p className="text-gray-600 mt-2">
          Konfigurasi dan lacak Kriteria Ketercapaian Tujuan Pembelajaran
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari tujuan pembelajaran..."
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>

          <select
            value={filterFase}
            onChange={(e) => {
              setFilterFase(e.target.value)
              handleFilter()
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Semua Fase</option>
            <option value="A">Fase A</option>
            <option value="B">Fase B</option>
            <option value="C">Fase C</option>
          </select>

          <select
            value={filterKelas}
            onChange={(e) => {
              setFilterKelas(e.target.value)
              handleFilter()
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
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
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <i className="fas fa-times mr-2"></i>
              Clear
            </button>
          )}
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
        >
          <i className="fas fa-plus"></i>
          Tambah KKTP
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Memuat KKTP...</p>
          </div>
        </div>
      ) : kktpList.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-check-double text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum ada KKTP
          </h3>
          <p className="text-gray-600 mb-6">
            Mulai dengan menambahkan kriteria ketuntasan untuk tujuan pembelajaran
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <i className="fas fa-plus"></i>
            Tambah KKTP
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {kktpList.map((kktp) => (
            <div
              key={kktp.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {kktp.tujuan_pembelajaran}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-blue-100">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-layer-group"></i>
                        {getFaseLabel(kktp.fase)}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-chalkboard"></i>
                        Kelas {kktp.kelas}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-percentage"></i>
                        KKTP: {kktp.kktp_percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(kktp)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(kktp.id)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Indicators */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Indikator Capaian
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {kktp.indicators?.map((indicator, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(
                            indicator.level
                          )}`}
                        >
                          {indicator.level}
                        </span>
                        <span className="text-sm text-gray-600">
                          {indicator.min_score} - {indicator.max_score}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {indicator.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
            <form onSubmit={handleSubmit}>
              <div className="sticky top-0 bg-white border-b p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingKKTP ? 'Edit KKTP' : 'Tambah KKTP'}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fase
                    </label>
                    <select
                      value={formData.fase}
                      onChange={(e) =>
                        setFormData({ ...formData, fase: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="A">Fase A (Kelas 1-2)</option>
                      <option value="B">Fase B (Kelas 3-4)</option>
                      <option value="C">Fase C (Kelas 5-6)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kelas
                    </label>
                    <select
                      value={formData.kelas}
                      onChange={(e) =>
                        setFormData({ ...formData, kelas: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="1">Kelas 1</option>
                      <option value="2">Kelas 2</option>
                      <option value="3">Kelas 3</option>
                      <option value="4">Kelas 4</option>
                      <option value="5">Kelas 5</option>
                      <option value="6">Kelas 6</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      KKTP (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.kktp_percentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          kktp_percentage: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                {/* Tujuan Pembelajaran */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tujuan Pembelajaran <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.tujuan_pembelajaran}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tujuan_pembelajaran: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Contoh: Siswa mampu melakukan gerakan dasar lokomotor dengan koordinasi yang baik"
                    required
                  ></textarea>
                </div>

                {/* Indicators */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Indikator Capaian
                  </h3>
                  <div className="space-y-4">
                    {formData.indicators.map((indicator, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Level
                            </label>
                            <input
                              type="text"
                              value={indicator.level}
                              onChange={(e) =>
                                handleIndicatorChange(
                                  index,
                                  'level',
                                  e.target.value
                                )
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Skor Min
                            </label>
                            <input
                              type="number"
                              value={indicator.min_score}
                              onChange={(e) =>
                                handleIndicatorChange(
                                  index,
                                  'min_score',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Skor Max
                            </label>
                            <input
                              type="number"
                              value={indicator.max_score}
                              onChange={(e) =>
                                handleIndicatorChange(
                                  index,
                                  'max_score',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deskripsi
                          </label>
                          <textarea
                            value={indicator.description}
                            onChange={(e) =>
                              handleIndicatorChange(
                                index,
                                'description',
                                e.target.value
                              )
                            }
                            rows="2"
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  {editingKKTP ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MasteryCriteria



