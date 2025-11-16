import React from 'react'
import FormSection from '../FormSection'
import ATPSelector from '../ATPSelector'

/**
 * Step 1: Informasi Dasar
 * Basic information including ATP selection
 */
export const Step1InformasiDasar = ({ formData, onChange, atpList, onSelectATP }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  const handleTPChange = (index, value) => {
    const newTP = [...formData.tujuan_pembelajaran]
    newTP[index] = { ...newTP[index], text: value }
    onChange({ tujuan_pembelajaran: newTP })
  }

  const handleAddTP = () => {
    onChange({
      tujuan_pembelajaran: [
        ...formData.tujuan_pembelajaran,
        { id: Date.now(), text: '' },
      ],
    })
  }

  const handleRemoveTP = (index) => {
    const newTP = formData.tujuan_pembelajaran.filter((_, i) => i !== index)
    onChange({ tujuan_pembelajaran: newTP })
  }

  const handleProfilChange = (value) => {
    const newProfil = formData.profil_lulusan.includes(value)
      ? formData.profil_lulusan.filter((p) => p !== value)
      : [...formData.profil_lulusan, value]
    onChange({ profil_lulusan: newProfil })
  }

  const profilOptions = [
    { value: 'dpl1', label: 'DPL 1 - Keimanan dan Ketakwaan pada Tuhan YME' },
    { value: 'dpl2', label: 'DPL 2 - Kewargaan' },
    { value: 'dpl3', label: 'DPL 3 - Penalaran Kritis' },
    { value: 'dpl4', label: 'DPL 4 - Kreativitas' },
    { value: 'dpl5', label: 'DPL 5 - Kolaborasi' },
    { value: 'dpl6', label: 'DPL 6 - Kemandirian' },
    { value: 'dpl7', label: 'DPL 7 - Kesehatan' },
    { value: 'dpl8', label: 'DPL 8 - Komunikasi' },
  ]

  return (
    <div className="space-y-6">
      {/* ATP Selector */}
      <ATPSelector
        atpList={atpList}
        selectedATP={formData.selectedATP}
        onSelectATP={onSelectATP}
        onClearSelection={() => onSelectATP(null)}
      />

      {/* Basic Information */}
      <FormSection
        title="Informasi Dasar"
        description="Informasi umum tentang modul ajar"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Judul Modul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Contoh: Gerak Dasar Lokomotor - Berlari"
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

      {/* Capaian Pembelajaran */}
      <FormSection
        title="Capaian Pembelajaran (CP)"
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

      {/* Tujuan Pembelajaran */}
      <FormSection
        title="Tujuan Pembelajaran (TP)"
        description="Daftar tujuan pembelajaran yang spesifik"
      >
        <div className="space-y-3">
          {formData.tujuan_pembelajaran.map((tp, index) => (
            <div key={tp.id || index} className="flex gap-2">
              <div className="flex-shrink-0 pt-2 text-sm font-medium text-gray-500">
                {index + 1}.
              </div>
              <input
                type="text"
                value={tp.text || tp}
                onChange={(e) => handleTPChange(index, e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Tuliskan tujuan pembelajaran..."
              />
              {formData.tujuan_pembelajaran.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTP(index)}
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

      {/* 8 Dimensi Profil Lulusan */}
      <FormSection
        title="8 Dimensi Profil Lulusan (8DPL)"
        description="Pilih dimensi profil lulusan yang relevan dengan pembelajaran"
      >
        <div className="space-y-2">
          {profilOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.profil_lulusan.includes(option.value)}
                onChange={() => handleProfilChange(option.value)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </FormSection>
    </div>
  )
}

export default Step1InformasiDasar

