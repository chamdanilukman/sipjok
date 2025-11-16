import React from 'react'
import FormSection from '../FormSection'

/**
 * Step 4: Asesmen
 * Assessment configuration including types, description, instruments, and rubrics
 */
export const Step4Asesmen = ({ formData, onChange }) => {
  const handleAsesmenToggle = (type) => {
    onChange({
      asesmen: {
        ...formData.asesmen,
        [type]: !formData.asesmen[type],
      },
    })
  }

  const handleAsesmenChange = (field, value) => {
    onChange({
      asesmen: {
        ...formData.asesmen,
        [field]: value,
      },
    })
  }

  const handleRubrikChange = (index, field, value) => {
    const newRubrik = [...(formData.asesmen.rubrik || [])]
    newRubrik[index] = { ...newRubrik[index], [field]: value }
    handleAsesmenChange('rubrik', newRubrik)
  }

  const handleAddRubrik = () => {
    const newRubrik = [
      ...(formData.asesmen.rubrik || []),
      { id: Date.now(), kriteria: '', mb: '', b: '', bsh: '' },
    ]
    handleAsesmenChange('rubrik', newRubrik)
  }

  const handleRemoveRubrik = (index) => {
    const newRubrik = (formData.asesmen.rubrik || []).filter((_, i) => i !== index)
    handleAsesmenChange('rubrik', newRubrik)
  }

  return (
    <div className="space-y-6">
      {/* Jenis Asesmen */}
      <FormSection
        title="Jenis Asesmen"
        description="Pilih jenis asesmen yang akan digunakan"
      >
        <div className="space-y-3">
          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.asesmen.diagnostik || false}
              onChange={() => handleAsesmenToggle('diagnostik')}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <i className="fas fa-stethoscope text-blue-600"></i>
                <span className="font-medium text-gray-900">Asesmen Diagnostik</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Untuk mengidentifikasi kemampuan awal siswa
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.asesmen.formatif || false}
              onChange={() => handleAsesmenToggle('formatif')}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <i className="fas fa-clipboard-check text-green-600"></i>
                <span className="font-medium text-gray-900">Asesmen Formatif</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Untuk memantau perkembangan selama pembelajaran
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.asesmen.sumatif || false}
              onChange={() => handleAsesmenToggle('sumatif')}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <i className="fas fa-award text-purple-600"></i>
                <span className="font-medium text-gray-900">Asesmen Sumatif</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Untuk mengukur pencapaian akhir pembelajaran
              </p>
            </div>
          </label>
        </div>
      </FormSection>

      {/* Deskripsi Asesmen */}
      <FormSection
        title="Deskripsi Asesmen"
        description="Jelaskan secara umum bagaimana asesmen akan dilakukan"
      >
        <textarea
          value={formData.asesmen.deskripsi || ''}
          onChange={(e) => handleAsesmenChange('deskripsi', e.target.value)}
          rows="4"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Contoh: Asesmen dilakukan melalui observasi langsung saat siswa melakukan praktik..."
        ></textarea>
      </FormSection>

      {/* Instrumen Asesmen */}
      <FormSection
        title="Instrumen Asesmen"
        description="Sebutkan instrumen atau alat yang digunakan untuk asesmen"
      >
        <textarea
          value={formData.asesmen.instrumen || ''}
          onChange={(e) => handleAsesmenChange('instrumen', e.target.value)}
          rows="3"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Contoh: Lembar observasi, checklist gerakan, tes praktik..."
        ></textarea>
      </FormSection>

      {/* Rubrik Penilaian */}
      <FormSection
        title="Rubrik Penilaian"
        description="Buat rubrik penilaian dengan kriteria MB (Mulai Berkembang), B (Berkembang), BSH (Berkembang Sesuai Harapan)"
      >
        <div className="space-y-4">
          {(formData.asesmen.rubrik || []).map((rubrik, index) => (
            <div key={rubrik.id || index} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Kriteria {index + 1}
                </span>
                {(formData.asesmen.rubrik || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRubrik(index)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Hapus
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Kriteria Penilaian
                  </label>
                  <input
                    type="text"
                    value={rubrik.kriteria || ''}
                    onChange={(e) => handleRubrikChange(index, 'kriteria', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Contoh: Teknik Berlari"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-yellow-700">
                      MB (Mulai Berkembang)
                    </label>
                    <textarea
                      value={rubrik.mb || ''}
                      onChange={(e) => handleRubrikChange(index, 'mb', e.target.value)}
                      rows="2"
                      className="w-full rounded-lg border border-yellow-300 px-3 py-2 text-sm focus:border-yellow-500 focus:ring-yellow-500"
                      placeholder="Deskripsi MB..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-blue-700">
                      B (Berkembang)
                    </label>
                    <textarea
                      value={rubrik.b || ''}
                      onChange={(e) => handleRubrikChange(index, 'b', e.target.value)}
                      rows="2"
                      className="w-full rounded-lg border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Deskripsi B..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-green-700">
                      BSH (Berkembang Sesuai Harapan)
                    </label>
                    <textarea
                      value={rubrik.bsh || ''}
                      onChange={(e) => handleRubrikChange(index, 'bsh', e.target.value)}
                      rows="2"
                      className="w-full rounded-lg border border-green-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Deskripsi BSH..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddRubrik}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600"
          >
            <i className="fas fa-plus"></i>
            Tambah Kriteria Rubrik
          </button>
        </div>
      </FormSection>
    </div>
  )
}

export default Step4Asesmen

