import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useModulAjar from '../../hooks/useModulAjar'
import useATP from '../../hooks/useATP'
import ModuleCard from '../../components/learningPlanning/ModuleCard'
import Step1InformasiDasar from '../../components/learningPlanning/wizardSteps/Step1InformasiDasar'
import Step2DesainPembelajaran from '../../components/learningPlanning/wizardSteps/Step2DesainPembelajaran'
import Step3SkenarioPembelajaran from '../../components/learningPlanning/wizardSteps/Step3SkenarioPembelajaran'
import Step4Asesmen from '../../components/learningPlanning/wizardSteps/Step4Asesmen'
import Step5MediaSumber from '../../components/learningPlanning/wizardSteps/Step5MediaSumber'
import Step6Keselamatan from '../../components/learningPlanning/wizardSteps/Step6Keselamatan'
import Step7Referensi from '../../components/learningPlanning/wizardSteps/Step7Referensi'
import ImportModulAjarModal from '../../components/learningPlanning/ImportModulAjarModal'
import UploadModulAjarModal from '../../components/learningPlanning/UploadModulAjarModal'
import { PreviewModulAjar } from '../../components/learningPlanning/PreviewModulAjar'
import { exportToPDF, exportToWord } from '../../utils/exportModulAjar'
import { api } from '../../lib/api'
import { useProfileContext } from '../../context/ProfileContext'

export const LessonPlans = () => {
  const { showNotification } = useNotification()
  const { profile } = useProfileContext()
  const {
    modulList,
    loading: modulLoading,
    loadModulAjar,
    createModulAjar,
    updateModulAjar,
    deleteModulAjar,
    copyModulAjar,
    searchModulAjar,
    filterModulAjar,
  } = useModulAjar()

  const { atpList, loadATP } = useATP()

  const [userId, setUserId] = useState(null)
  const [showWizard, setShowWizard] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [editingModul, setEditingModul] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterFase, setFilterFase] = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewModul, setPreviewModul] = useState(null)

  const totalSteps = 7

  const [formData, setFormData] = useState({
    selectedATP: null,
    atp_id: null,
    title: '',
    mata_pelajaran: 'PJOK',
    fase: 'A',
    kelas: '1',
    alokasi_waktu: 1,
    capaian_pembelajaran: '',
    tujuan_pembelajaran: [{ id: Date.now(), text: '' }],
    profil_lulusan: [],
    praktik_pedagogis: '',
    kemitraan: '',
    lingkungan_pembelajaran: '',
    digital_tools: [],
    skenario_pembelajaran: [
      {
        id: Date.now(),
        pertemuan: 1,
        topik: '',
        fase_memahami: '',
        fase_mengaplikasi: '',
        fase_merefleksi: '',
      },
    ],
    asesmen: {
      diagnostik: false,
      formatif: false,
      sumatif: false,
      deskripsi: '',
      instrumen: '',
      rubrik: [],
    },
    media_files: [],
    sumber_belajar: {
      urls: [],
      lkpd: '',
    },
    keselamatan: {
      area_aman: '',
      instruksi: [],
      alternatif: '',
    },
    referensi: [],
    status: 'draft',
  })

  // Get current user and load data
  useEffect(() => {
    const getCurrentUser = async () => {
      const user = await api.get('/auth/me')
      if (user) {
        setUserId(user.id)
        loadModulAjar(user.id)
        loadATP(user.id)
      }
    }
    getCurrentUser()
  }, [loadModulAjar, loadATP])

  const handleFormChange = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleSelectATP = (atp) => {
    if (atp) {
      setFormData((prev) => ({
        ...prev,
        selectedATP: atp,
        atp_id: atp.id,
        title: atp.judul,
        fase: atp.fase,
        kelas: atp.kelas,
        capaian_pembelajaran: atp.capaian_pembelajaran,
        tujuan_pembelajaran: atp.tujuan_pembelajaran.map((tp, index) => ({
          id: Date.now() + index,
          text: tp.text || tp,
        })),
        alokasi_waktu: atp.alokasi_waktu,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedATP: null,
        atp_id: null,
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      selectedATP: null,
      atp_id: null,
      title: '',
      mata_pelajaran: 'PJOK',
      fase: 'A',
      kelas: '1',
      alokasi_waktu: 1,
      capaian_pembelajaran: '',
      tujuan_pembelajaran: [{ id: Date.now(), text: '' }],
      profil_lulusan: [],
      praktik_pedagogis: '',
      kemitraan: '',
      lingkungan_pembelajaran: '',
      digital_tools: [],
      skenario_pembelajaran: [
        {
          id: Date.now(),
          pertemuan: 1,
          topik: '',
          fase_memahami: '',
          fase_mengaplikasi: '',
          fase_merefleksi: '',
        },
      ],
      asesmen: {
        diagnostik: false,
        formatif: false,
        sumatif: false,
        deskripsi: '',
        instrumen: '',
        rubrik: [],
      },
      media_files: [],
      sumber_belajar: {
        urls: [],
        lkpd: '',
      },
      keselamatan: {
        area_aman: '',
        instruksi: [],
        alternatif: '',
      },
      referensi: [],
      status: 'draft',
    })
    setCurrentStep(1)
    setEditingModul(null)
  }

  const handleOpenWizard = (modul = null) => {
    if (modul) {
      // Edit mode
      setEditingModul(modul)
      setFormData({
        selectedATP: modul.atp || null,
        atp_id: modul.atp_id,
        title: modul.title,
        mata_pelajaran: modul.mata_pelajaran,
        fase: modul.fase,
        kelas: modul.kelas,
        alokasi_waktu: modul.alokasi_waktu,
        capaian_pembelajaran: modul.capaian_pembelajaran,
        tujuan_pembelajaran: modul.tujuan_pembelajaran || [{ id: Date.now(), text: '' }],
        profil_lulusan: modul.profil_lulusan || [],
        praktik_pedagogis: modul.praktik_pedagogis || '',
        kemitraan: modul.kemitraan || '',
        lingkungan_pembelajaran: modul.lingkungan_pembelajaran || '',
        digital_tools: modul.digital_tools || [],
        skenario_pembelajaran: modul.skenario_pembelajaran || [
          {
            id: Date.now(),
            pertemuan: 1,
            topik: '',
            fase_memahami: '',
            fase_mengaplikasi: '',
            fase_merefleksi: '',
          },
        ],
        asesmen: modul.asesmen || {
          diagnostik: false,
          formatif: false,
          sumatif: false,
          deskripsi: '',
          instrumen: '',
          rubrik: [],
        },
        media_files: modul.media_files || [],
        sumber_belajar: modul.sumber_belajar || { urls: [], lkpd: '' },
        keselamatan: modul.keselamatan || {
          area_aman: '',
          instruksi: [],
          alternatif: '',
        },
        referensi: modul.referensi || [],
        status: modul.status || 'draft',
      })
    } else {
      resetForm()
    }
    setShowWizard(true)
  }

  const handleCloseWizard = () => {
    setShowWizard(false)
    resetForm()
  }

  const handlePreview = (modul) => {
    setPreviewModul(modul)
    setShowPreview(true)
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    setPreviewModul(null)
  }

  const handleDownloadPDF = () => {
    if (previewModul) {
      exportToPDF(previewModul, profile)
      showNotification('PDF berhasil didownload', 'success')
    }
  }

  const handleDownloadWord = async () => {
    if (previewModul) {
      await exportToWord(previewModul, profile)
      showNotification('Word berhasil didownload', 'success')
    }
  }

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = async () => {
    try {
      const dataToSave = {
        ...formData,
        status: 'draft',
      }

      if (editingModul) {
        await updateModulAjar(editingModul.id, dataToSave)
        showNotification('Draft berhasil diperbarui', 'success')
      } else {
        await createModulAjar(userId, dataToSave)
        showNotification('Draft berhasil disimpan', 'success')
      }
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan draft', 'error')
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      showNotification('Judul modul harus diisi', 'error')
      return
    }

    try {
      const dataToSave = {
        ...formData,
        status: 'approved',
      }

      if (editingModul) {
        await updateModulAjar(editingModul.id, dataToSave)
        showNotification('Modul Ajar berhasil diperbarui', 'success')
      } else {
        await createModulAjar(userId, dataToSave)
        showNotification('Modul Ajar berhasil dibuat', 'success')
      }

      handleCloseWizard()
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan Modul Ajar', 'error')
    }
  }

  const handleDelete = async (modulId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus modul ini?')) {
      return
    }

    try {
      await deleteModulAjar(modulId)
      showNotification('Modul berhasil dihapus', 'success')
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus modul', 'error')
    }
  }

  const handleCopy = async (modulId) => {
    try {
      await copyModulAjar(userId, modulId)
      showNotification('Modul berhasil diduplikasi', 'success')
    } catch (err) {
      showNotification(err.message || 'Gagal menduplikasi modul', 'error')
    }
  }

  const handleSearch = async () => {
    if (!userId) return

    if (searchKeyword.trim()) {
      await searchModulAjar(userId, searchKeyword)
    } else {
      await loadModulAjar(userId)
    }
  }

  const handleFilter = async () => {
    if (!userId) return

    const filters = {}
    if (filterFase) filters.fase = filterFase
    if (filterKelas) filters.kelas = filterKelas
    if (filterStatus) filters.status = filterStatus

    if (Object.keys(filters).length > 0) {
      await filterModulAjar(userId, filters)
    } else {
      await loadModulAjar(userId)
    }
  }

  const handleImportModul = async (modulDataArray) => {
    try {
      let successCount = 0
      let failCount = 0

      for (const modulData of modulDataArray) {
        try {
          await createModulAjar(userId, modulData)
          successCount++
        } catch (err) {
          console.error('Error importing modul:', err)
          failCount++
        }
      }

      if (successCount > 0) {
        showNotification(
          `Berhasil import ${successCount} modul${failCount > 0 ? `, gagal ${failCount} modul` : ''}`,
          failCount > 0 ? 'warning' : 'success'
        )
      } else {
        showNotification('Gagal import semua modul', 'error')
      }
    } catch (err) {
      showNotification(err.message || 'Gagal import modul', 'error')
    }
  }

  const handleUploadModul = async (modulData) => {
    try {
      await createModulAjar(userId, modulData)
      showNotification('Modul berhasil diupload', 'success')
      setShowUploadModal(false)
    } catch (err) {
      console.error('Error uploading modul:', err)
      throw err
    }
  }

  const handleClearFilters = async () => {
    setSearchKeyword('')
    setFilterFase('')
    setFilterKelas('')
    setFilterStatus('')
    if (userId) {
      await loadModulAjar(userId)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1InformasiDasar
            formData={formData}
            onChange={handleFormChange}
            atpList={atpList}
            onSelectATP={handleSelectATP}
          />
        )
      case 2:
        return <Step2DesainPembelajaran formData={formData} onChange={handleFormChange} />
      case 3:
        return <Step3SkenarioPembelajaran formData={formData} onChange={handleFormChange} />
      case 4:
        return <Step4Asesmen formData={formData} onChange={handleFormChange} />
      case 5:
        return <Step5MediaSumber formData={formData} onChange={handleFormChange} />
      case 6:
        return <Step6Keselamatan formData={formData} onChange={handleFormChange} />
      case 7:
        return <Step7Referensi formData={formData} onChange={handleFormChange} />
      default:
        return null
    }
  }

  const steps = [
    { number: 1, title: 'Informasi Dasar', icon: 'fas fa-info-circle' },
    { number: 2, title: 'Desain Pembelajaran', icon: 'fas fa-palette' },
    { number: 3, title: 'Skenario Pembelajaran', icon: 'fas fa-list-ol' },
    { number: 4, title: 'Asesmen', icon: 'fas fa-clipboard-check' },
    { number: 5, title: 'Media & Sumber', icon: 'fas fa-photo-video' },
    { number: 6, title: 'Keselamatan', icon: 'fas fa-shield-alt' },
    { number: 7, title: 'Referensi', icon: 'fas fa-book' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">RPP/Modul Ajar</h1>
        <p className="text-gray-600 mt-2">
          Buat dan kelola Modul Ajar dengan wizard 7 langkah
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleOpenWizard()}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
          >
            <i className="fas fa-plus"></i>
            <span className="hidden sm:inline">Buat Modul Ajar Baru</span>
            <span className="sm:hidden">Buat Baru</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white shadow-sm hover:bg-green-700"
          >
            <i className="fas fa-upload"></i>
            <span className="hidden sm:inline">Upload File</span>
            <span className="sm:hidden">Upload</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white shadow-sm hover:bg-purple-700"
          >
            <i className="fas fa-file-import"></i>
            <span className="hidden sm:inline">Import Excel</span>
            <span className="sm:hidden">Import</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Cari modul..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>

          {/* Filters */}
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

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              handleFilter()
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="published">Published</option>
          </select>

          {(searchKeyword || filterFase || filterKelas || filterStatus) && (
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

      {/* Modul List */}
      {modulLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Memuat modul...</p>
          </div>
        </div>
      ) : modulList.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <i className="fas fa-file-alt text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum ada Modul Ajar
          </h3>
          <p className="text-gray-600 mb-6">
            Mulai dengan membuat modul ajar pertama Anda
          </p>
          <button
            onClick={() => handleOpenWizard()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <i className="fas fa-plus"></i>
            Buat Modul Ajar Baru
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Menampilkan {modulList.length} modul
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modulList.map((modul) => (
              <ModuleCard
                key={modul.id}
                module={modul}
                onEdit={handleOpenWizard}
                onDelete={handleDelete}
                onCopy={handleCopy}
                onPreview={handlePreview}
              />
            ))}
          </div>
        </>
      )}

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="flex h-[90vh] w-full max-w-7xl overflow-hidden rounded-lg bg-white shadow-xl">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingModul ? 'Edit Modul Ajar' : 'Buat Modul Ajar'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Langkah {currentStep} dari {totalSteps}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Steps */}
              <nav className="space-y-2">
                {steps.map((step) => (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() => setCurrentStep(step.number)}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                      currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.number
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        currentStep === step.number
                          ? 'bg-white text-blue-600'
                          : currentStep > step.number
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <i className="fas fa-check text-sm"></i>
                      ) : (
                        <span className="text-sm font-semibold">{step.number}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.title}</p>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Save Draft Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <i className="fas fa-save"></i>
                  Simpan Draft
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Lengkapi informasi di bawah ini
                  </p>
                </div>
                <button
                  onClick={handleCloseWizard}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Step Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {renderStepContent()}
              </div>

              {/* Footer Navigation */}
              <div className="flex items-center justify-between border-t border-gray-200 p-6">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-arrow-left"></i>
                  Sebelumnya
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseWizard}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>

                  {currentStep === totalSteps ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      <i className="fas fa-check"></i>
                      Selesai & Publish
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Selanjutnya
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModulAjarModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportModul}
        teacherId={userId}
      />

      {/* Upload Modal */}
      <UploadModulAjarModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadModul}
        atpList={atpList}
        teacherId={userId}
        teacherProfile={profile}
      />

      {/* Preview Modal */}
      {showPreview && previewModul && (
        <PreviewModulAjar
          modul={previewModul}
          onClose={handleClosePreview}
          onDownloadPDF={handleDownloadPDF}
          onDownloadWord={handleDownloadWord}
        />
      )}
    </div>
  )
}

export default LessonPlans


