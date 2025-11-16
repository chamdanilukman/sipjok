import React, { useState } from 'react'
import FormSection from '../FormSection'

/**
 * Step 3: Skenario Pembelajaran
 * Learning scenarios with multiple meetings and 3 phases each
 */
export const Step3SkenarioPembelajaran = ({ formData, onChange }) => {
  const [activeTab, setActiveTab] = useState(0)

  const handleAddPertemuan = () => {
    const newPertemuan = {
      id: Date.now(),
      pertemuan: formData.skenario_pembelajaran.length + 1,
      topik: '',
      fase_memahami: '',
      fase_mengaplikasi: '',
      fase_merefleksi: '',
    }
    onChange({
      skenario_pembelajaran: [...formData.skenario_pembelajaran, newPertemuan],
    })
    setActiveTab(formData.skenario_pembelajaran.length)
  }

  const handleRemovePertemuan = (index) => {
    if (formData.skenario_pembelajaran.length === 1) {
      alert('Minimal harus ada 1 pertemuan')
      return
    }
    const newSkenario = formData.skenario_pembelajaran.filter((_, i) => i !== index)
    // Renumber pertemuan
    const renumbered = newSkenario.map((p, i) => ({ ...p, pertemuan: i + 1 }))
    onChange({ skenario_pembelajaran: renumbered })
    if (activeTab >= renumbered.length) {
      setActiveTab(renumbered.length - 1)
    }
  }

  const handlePertemuanChange = (index, field, value) => {
    const newSkenario = [...formData.skenario_pembelajaran]
    newSkenario[index] = { ...newSkenario[index], [field]: value }
    onChange({ skenario_pembelajaran: newSkenario })
  }

  const currentPertemuan = formData.skenario_pembelajaran[activeTab] || {}

  return (
    <div className="space-y-6">
      <FormSection
        title="Skenario Pembelajaran"
        description="Rancang skenario pembelajaran untuk setiap pertemuan dengan 3 fase: Memahami, Mengaplikasi, dan Merefleksi"
      >
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
          {formData.skenario_pembelajaran.map((pertemuan, index) => (
            <div
              key={pertemuan.id || index}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === index
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab(index)}
                className="hover:opacity-80"
              >
                Pertemuan {pertemuan.pertemuan}
              </button>
              {formData.skenario_pembelajaran.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemovePertemuan(index)
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddPertemuan}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <i className="fas fa-plus mr-1"></i>
            Tambah Pertemuan
          </button>
        </div>

        {/* Pertemuan Content */}
        <div className="space-y-4">
          {/* Topik */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Topik Pertemuan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={currentPertemuan.topik || ''}
              onChange={(e) => handlePertemuanChange(activeTab, 'topik', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Contoh: Teknik Dasar Berlari"
              required
            />
          </div>

          {/* Fase Memahami */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              <i className="fas fa-book-open text-blue-600"></i>
              Fase Memahami <span className="text-red-500">*</span>
            </label>
            <p className="mb-2 text-xs text-gray-500">
              Kegiatan untuk memahami konsep dan teori
            </p>
            <textarea
              value={currentPertemuan.fase_memahami || ''}
              onChange={(e) => handlePertemuanChange(activeTab, 'fase_memahami', e.target.value)}
              rows="4"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Contoh: Guru menjelaskan teknik berlari yang benar, siswa mengamati demonstrasi..."
              required
            ></textarea>
          </div>

          {/* Fase Mengaplikasi */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              <i className="fas fa-running text-green-600"></i>
              Fase Mengaplikasi <span className="text-red-500">*</span>
            </label>
            <p className="mb-2 text-xs text-gray-500">
              Kegiatan praktik dan penerapan
            </p>
            <textarea
              value={currentPertemuan.fase_mengaplikasi || ''}
              onChange={(e) => handlePertemuanChange(activeTab, 'fase_mengaplikasi', e.target.value)}
              rows="4"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Contoh: Siswa berlatih berlari dengan jarak 20 meter, melakukan gerakan secara bergantian..."
              required
            ></textarea>
          </div>

          {/* Fase Merefleksi */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              <i className="fas fa-comments text-purple-600"></i>
              Fase Merefleksi <span className="text-red-500">*</span>
            </label>
            <p className="mb-2 text-xs text-gray-500">
              Kegiatan refleksi dan evaluasi
            </p>
            <textarea
              value={currentPertemuan.fase_merefleksi || ''}
              onChange={(e) => handlePertemuanChange(activeTab, 'fase_merefleksi', e.target.value)}
              rows="4"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Contoh: Siswa berdiskusi tentang pengalaman mereka, apa yang mudah dan sulit..."
              required
            ></textarea>
          </div>
        </div>
      </FormSection>

      {/* Summary */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2 text-sm text-blue-900">
          <i className="fas fa-info-circle"></i>
          <span className="font-medium">
            Total {formData.skenario_pembelajaran.length} pertemuan telah dirancang
          </span>
        </div>
      </div>
    </div>
  )
}

export default Step3SkenarioPembelajaran

