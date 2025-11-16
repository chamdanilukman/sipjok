import React from 'react'
import FormSection from '../FormSection'

/**
 * Step 7: Referensi
 * References and bibliography
 */
export const Step7Referensi = ({ formData, onChange }) => {
  const handleReferensiChange = (index, field, value) => {
    const newReferensi = [...(formData.referensi || [])]
    newReferensi[index] = { ...newReferensi[index], [field]: value }
    onChange({ referensi: newReferensi })
  }

  const handleAddReferensi = () => {
    onChange({
      referensi: [
        ...(formData.referensi || []),
        {
          id: Date.now(),
          jenis: 'buku',
          penulis: '',
          judul: '',
          tahun: '',
          penerbit: '',
          url: '',
        },
      ],
    })
  }

  const handleRemoveReferensi = (index) => {
    const newReferensi = (formData.referensi || []).filter((_, i) => i !== index)
    onChange({ referensi: newReferensi })
  }

  const jenisOptions = [
    { value: 'buku', label: 'Buku', icon: 'fas fa-book' },
    { value: 'jurnal', label: 'Jurnal', icon: 'fas fa-file-alt' },
    { value: 'website', label: 'Website', icon: 'fas fa-globe' },
    { value: 'peraturan', label: 'Peraturan/Kebijakan', icon: 'fas fa-gavel' },
  ]

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <i className="fas fa-info-circle text-xl text-blue-600"></i>
          <div>
            <h4 className="font-semibold text-blue-900">Referensi</h4>
            <p className="mt-1 text-sm text-blue-800">
              Tambahkan sumber referensi yang digunakan dalam penyusunan modul ajar ini.
              Referensi yang lengkap menunjukkan kredibilitas dan dapat membantu guru lain.
            </p>
          </div>
        </div>
      </div>

      <FormSection
        title="Daftar Referensi"
        description="Tambahkan sumber referensi yang digunakan"
      >
        <div className="space-y-4">
          {(formData.referensi || []).map((ref, index) => (
            <div
              key={ref.id || index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Referensi {index + 1}
                </span>
                {(formData.referensi || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveReferensi(index)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Hapus
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Jenis Referensi */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Jenis Referensi
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {jenisOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs transition-all ${
                          ref.jenis === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`jenis-${index}`}
                          value={option.value}
                          checked={ref.jenis === option.value}
                          onChange={(e) =>
                            handleReferensiChange(index, 'jenis', e.target.value)
                          }
                          className="hidden"
                        />
                        <i className={option.icon}></i>
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Penulis */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Penulis/Author
                  </label>
                  <input
                    type="text"
                    value={ref.penulis || ''}
                    onChange={(e) =>
                      handleReferensiChange(index, 'penulis', e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Nama penulis atau organisasi"
                  />
                </div>

                {/* Judul */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Judul
                  </label>
                  <input
                    type="text"
                    value={ref.judul || ''}
                    onChange={(e) =>
                      handleReferensiChange(index, 'judul', e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Judul buku, artikel, atau dokumen"
                  />
                </div>

                {/* Tahun & Penerbit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Tahun
                    </label>
                    <input
                      type="text"
                      value={ref.tahun || ''}
                      onChange={(e) =>
                        handleReferensiChange(index, 'tahun', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="2024"
                    />
                  </div>

                  {ref.jenis !== 'website' && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Penerbit
                      </label>
                      <input
                        type="text"
                        value={ref.penerbit || ''}
                        onChange={(e) =>
                          handleReferensiChange(index, 'penerbit', e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Nama penerbit"
                      />
                    </div>
                  )}
                </div>

                {/* URL */}
                {(ref.jenis === 'website' || ref.jenis === 'jurnal') && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      URL
                    </label>
                    <input
                      type="url"
                      value={ref.url || ''}
                      onChange={(e) =>
                        handleReferensiChange(index, 'url', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddReferensi}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600"
          >
            <i className="fas fa-plus"></i>
            Tambah Referensi
          </button>
        </div>
      </FormSection>

      {/* Example */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="mb-2 text-sm font-medium text-gray-700">
          <i className="fas fa-lightbulb mr-1 text-yellow-500"></i>
          Contoh Format Referensi:
        </p>
        <div className="space-y-2 text-xs text-gray-600">
          <p>
            <strong>Buku:</strong> Kemendikbudristek. (2022). Panduan Pembelajaran dan Asesmen
            Kurikulum Merdeka. Jakarta: Kemendikbudristek.
          </p>
          <p>
            <strong>Jurnal:</strong> Suherman, A. (2020). Implementasi Kurikulum Merdeka dalam
            Pembelajaran PJOK. Jurnal Pendidikan Jasmani, 15(2), 45-60.
          </p>
          <p>
            <strong>Website:</strong> Kemendikbudristek. (2023). Kurikulum Merdeka.
            https://kurikulum.kemdikbud.go.id
          </p>
        </div>
      </div>
    </div>
  )
}

export default Step7Referensi

