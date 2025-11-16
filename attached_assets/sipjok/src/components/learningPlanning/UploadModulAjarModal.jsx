import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import supabase from '../../config/supabase'

export const UploadModulAjarModal = ({ isOpen, onClose, onUpload, atpList, teacherId, teacherProfile }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [formData, setFormData] = useState({
    atp_id: '',
    title: '',
    mata_pelajaran: 'PJOK',
    fase: 'A',
    kelas: '1',
    alokasi_waktu: 1,
    status: 'draft',
  })

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      
      if (!validTypes.includes(file.type)) {
        alert('File harus berformat PDF atau Word (.doc, .docx)')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran file maksimal 10MB')
        return
      }

      setUploadedFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  })

  const handleAtpChange = (atpId) => {
    const selectedAtp = atpList.find(atp => atp.id === atpId)
    if (selectedAtp) {
      setFormData({
        ...formData,
        atp_id: atpId,
        mata_pelajaran: selectedAtp.mata_pelajaran || 'PJOK',
        fase: selectedAtp.fase || 'A',
        kelas: selectedAtp.kelas || '1',
        alokasi_waktu: selectedAtp.alokasi_waktu || 1,
      })
    } else {
      setFormData({
        ...formData,
        atp_id: atpId,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!uploadedFile) {
      alert('Silakan pilih file terlebih dahulu')
      return
    }

    if (!formData.atp_id) {
      alert('Silakan pilih ATP terlebih dahulu')
      return
    }

    if (!formData.title) {
      alert('Silakan isi judul modul')
      return
    }

    setUploading(true)

    try {
      // Upload file to Supabase Storage
      const fileExt = uploadedFile.name.split('.').pop()
      const fileName = `${Date.now()}_${uploadedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const filePath = `modul_ajar/${teacherId}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // Create modul ajar record with file reference
      const modulData = {
        teacher_id: teacherId,
        atp_id: formData.atp_id,
        title: formData.title,
        mata_pelajaran: formData.mata_pelajaran,
        fase: formData.fase,
        kelas: formData.kelas,
        alokasi_waktu: formData.alokasi_waktu,
        status: formData.status,
        file_url: publicUrl,
        file_path: filePath,
        file_type: uploadedFile.type,
        file_name: uploadedFile.name,
        teacher_name: teacherProfile?.nama_lengkap || teacherProfile?.name || 'Guru PJOK',
        institusi: teacherProfile?.sekolah || teacherProfile?.institusi || 'SD Negeri',
        // Set default values for required fields
        capaian_pembelajaran: 'Lihat file terlampir',
        tujuan_pembelajaran: 'Lihat file terlampir',
        profil_lulusan: [],
        skenario_pembelajaran: [],
        asesmen: 'Lihat file terlampir',
      }

      await onUpload(modulData)

      // Reset form
      setUploadedFile(null)
      setFormData({
        atp_id: '',
        title: '',
        mata_pelajaran: 'PJOK',
        fase: 'A',
        kelas: '1',
        alokasi_waktu: 1,
        status: 'draft',
      })

      onClose()
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Gagal mengupload file: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Upload Modul Ajar / RPP</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={uploading}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <i className="fas fa-info-circle text-blue-600 mt-1"></i>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Informasi Upload:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Format file: PDF atau Word (.doc, .docx)</li>
                  <li>Ukuran maksimal: 10MB</li>
                  <li>Pilih ATP yang sesuai dengan modul</li>
                  <li>Identitas guru akan otomatis terisi dari profil</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ATP Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih ATP <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.atp_id}
              onChange={(e) => handleAtpChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">-- Pilih ATP --</option>
              {atpList.map((atp) => (
                <option key={atp.id} value={atp.id}>
                  {atp.title} - Fase {atp.fase} / Kelas {atp.kelas}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Modul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Contoh: Permainan Bola Basket"
              required
            />
          </div>

          {/* Informasi dari ATP */}
          {formData.atp_id && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={formData.mata_pelajaran}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fase / Kelas
                </label>
                <input
                  type="text"
                  value={`Fase ${formData.fase} / Kelas ${formData.kelas}`}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-gray-50"
                />
              </div>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Modul <span className="text-red-500">*</span>
            </label>
            
            {!uploadedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                <p className="text-sm text-gray-600 mb-1">
                  {isDragActive
                    ? 'Drop file di sini...'
                    : 'Drag & drop file atau click untuk pilih'}
                </p>
                <p className="text-xs text-gray-500">
                  PDF atau Word (.doc, .docx) - Max 10MB
                </p>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className={`fas ${
                      uploadedFile.type === 'application/pdf' ? 'fa-file-pdf text-red-500' : 'fa-file-word text-blue-500'
                    } text-xl`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700"
                  disabled={uploading}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={uploading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={uploading || !uploadedFile || !formData.atp_id || !formData.title}
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  Upload Modul
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModulAjarModal

