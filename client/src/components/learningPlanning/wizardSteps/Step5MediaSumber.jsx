import React from 'react'
import FormSection from '../FormSection'

/**
 * Step 5: Media & Sumber Belajar
 * Media files, learning resources, and LKPD
 */
export const Step5MediaSumber = ({ formData, onChange }) => {
  const handleMediaChange = (files) => {
    const fileList = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
    }))
    onChange({
      media_files: [...(formData.media_files || []), ...fileList],
    })
  }

  const handleRemoveMedia = (index) => {
    const newMedia = (formData.media_files || []).filter((_, i) => i !== index)
    onChange({ media_files: newMedia })
  }

  const handleURLChange = (index, value) => {
    const newURLs = [...(formData.sumber_belajar.urls || [])]
    newURLs[index] = value
    onChange({
      sumber_belajar: {
        ...formData.sumber_belajar,
        urls: newURLs,
      },
    })
  }

  const handleAddURL = () => {
    onChange({
      sumber_belajar: {
        ...formData.sumber_belajar,
        urls: [...(formData.sumber_belajar.urls || []), ''],
      },
    })
  }

  const handleRemoveURL = (index) => {
    const newURLs = (formData.sumber_belajar.urls || []).filter((_, i) => i !== index)
    onChange({
      sumber_belajar: {
        ...formData.sumber_belajar,
        urls: newURLs,
      },
    })
  }

  const handleLKPDChange = (value) => {
    onChange({
      sumber_belajar: {
        ...formData.sumber_belajar,
        lkpd: value,
      },
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Media Pembelajaran */}
      <FormSection
        title="Media Pembelajaran"
        description="Upload file media yang akan digunakan (gambar, video, dokumen)"
      >
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:border-blue-500 hover:bg-blue-50">
              <i className="fas fa-cloud-upload-alt mb-2 text-4xl text-gray-400"></i>
              <span className="mb-1 text-sm font-medium text-gray-700">
                Klik untuk upload file
              </span>
              <span className="text-xs text-gray-500">
                Gambar, Video, PDF, atau Dokumen
              </span>
              <input
                type="file"
                multiple
                onChange={(e) => handleMediaChange(e.target.files)}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
              />
            </label>
          </div>

          {/* File List */}
          {formData.media_files && formData.media_files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                File yang diupload ({formData.media_files.length}):
              </p>
              {formData.media_files.map((file, index) => (
                <div
                  key={file.id || index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <i className="fas fa-file text-blue-600"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormSection>

      {/* Sumber Belajar (URL) */}
      <FormSection
        title="Sumber Belajar (URL)"
        description="Tambahkan link ke sumber belajar online"
      >
        <div className="space-y-3">
          {(formData.sumber_belajar.urls || []).map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => handleURLChange(index, e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com/resource"
              />
              <button
                type="button"
                onClick={() => handleRemoveURL(index)}
                className="flex-shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddURL}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600"
          >
            <i className="fas fa-plus"></i>
            Tambah URL
          </button>
        </div>
      </FormSection>

      {/* LKPD */}
      <FormSection
        title="LKPD (Lembar Kerja Peserta Didik)"
        description="Buat atau tuliskan konten LKPD"
      >
        <textarea
          value={formData.sumber_belajar.lkpd || ''}
          onChange={(e) => handleLKPDChange(e.target.value)}
          rows="8"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Tuliskan konten LKPD di sini...&#10;&#10;Contoh:&#10;LEMBAR KERJA PESERTA DIDIK&#10;Topik: Gerak Dasar Lokomotor&#10;&#10;Nama: _______________&#10;Kelas: _______________&#10;&#10;Petunjuk:&#10;1. Lakukan gerakan berlari sejauh 20 meter&#10;2. Catat waktu yang diperlukan&#10;3. Ulangi 3 kali"
        ></textarea>
        <p className="mt-2 text-xs text-gray-500">
          Opsional: Anda dapat menuliskan konten LKPD atau mengupload file LKPD di bagian Media Pembelajaran
        </p>
      </FormSection>
    </div>
  )
}

export default Step5MediaSumber

