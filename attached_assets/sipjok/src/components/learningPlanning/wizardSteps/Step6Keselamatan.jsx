import React from 'react'
import FormSection from '../FormSection'

/**
 * Step 6: Keselamatan (PJOK)
 * Safety considerations specific to physical education
 */
export const Step6Keselamatan = ({ formData, onChange }) => {
  const handleKeselamatanChange = (field, value) => {
    onChange({
      keselamatan: {
        ...formData.keselamatan,
        [field]: value,
      },
    })
  }

  const handleInstruksiChange = (index, value) => {
    const newInstruksi = [...(formData.keselamatan.instruksi || [])]
    newInstruksi[index] = value
    handleKeselamatanChange('instruksi', newInstruksi)
  }

  const handleAddInstruksi = () => {
    const newInstruksi = [...(formData.keselamatan.instruksi || []), '']
    handleKeselamatanChange('instruksi', newInstruksi)
  }

  const handleRemoveInstruksi = (index) => {
    const newInstruksi = (formData.keselamatan.instruksi || []).filter((_, i) => i !== index)
    handleKeselamatanChange('instruksi', newInstruksi)
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start gap-3">
          <i className="fas fa-exclamation-triangle text-2xl text-yellow-600"></i>
          <div>
            <h4 className="font-semibold text-yellow-900">Keselamatan dalam PJOK</h4>
            <p className="mt-1 text-sm text-yellow-800">
              Pastikan semua aspek keselamatan dipertimbangkan untuk mencegah cedera dan memastikan
              pembelajaran yang aman bagi semua siswa.
            </p>
          </div>
        </div>
      </div>

      {/* Area Aman */}
      <FormSection
        title="Area Aman"
        description="Jelaskan area atau tempat yang aman untuk melakukan aktivitas"
      >
        <textarea
          value={formData.keselamatan.area_aman || ''}
          onChange={(e) => handleKeselamatanChange('area_aman', e.target.value)}
          rows="4"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Contoh: Lapangan yang rata dan bebas dari batu atau benda tajam, area yang cukup luas untuk bergerak bebas..."
        ></textarea>
      </FormSection>

      {/* Instruksi Keamanan */}
      <FormSection
        title="Instruksi Keamanan"
        description="Daftar instruksi keamanan yang harus diikuti siswa"
      >
        <div className="space-y-3">
          {(formData.keselamatan.instruksi || []).map((instruksi, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-shrink-0 pt-2 text-sm font-medium text-gray-500">
                {index + 1}.
              </div>
              <input
                type="text"
                value={instruksi}
                onChange={(e) => handleInstruksiChange(index, e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Tuliskan instruksi keamanan..."
              />
              {(formData.keselamatan.instruksi || []).length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveInstruksi(index)}
                  className="flex-shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddInstruksi}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600"
          >
            <i className="fas fa-plus"></i>
            Tambah Instruksi
          </button>
        </div>

        {/* Common Safety Instructions */}
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="mb-2 text-sm font-medium text-blue-900">
            <i className="fas fa-lightbulb mr-1"></i>
            Contoh Instruksi Keamanan:
          </p>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Lakukan pemanasan sebelum aktivitas</li>
            <li>• Gunakan sepatu olahraga yang sesuai</li>
            <li>• Ikuti instruksi guru dengan seksama</li>
            <li>• Laporkan jika merasa tidak nyaman atau sakit</li>
            <li>• Jaga jarak aman dengan teman saat bergerak</li>
            <li>• Gunakan peralatan sesuai fungsinya</li>
          </ul>
        </div>
      </FormSection>

      {/* Alternatif Aktivitas */}
      <FormSection
        title="Alternatif Aktivitas"
        description="Aktivitas alternatif untuk siswa yang tidak dapat mengikuti aktivitas utama (cedera, kondisi khusus, dll)"
      >
        <textarea
          value={formData.keselamatan.alternatif || ''}
          onChange={(e) => handleKeselamatanChange('alternatif', e.target.value)}
          rows="4"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Contoh: Siswa yang cedera dapat melakukan observasi dan mencatat gerakan teman, atau melakukan gerakan dengan intensitas lebih rendah..."
        ></textarea>
        <p className="mt-2 text-xs text-gray-500">
          Penting untuk menyediakan alternatif agar semua siswa tetap dapat berpartisipasi dalam pembelajaran
        </p>
      </FormSection>
    </div>
  )
}

export default Step6Keselamatan

