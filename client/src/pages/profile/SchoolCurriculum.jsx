import React, { useState, useEffect, useRef } from 'react'
import { useDataContext } from '../../context/DataContext'
import useCurriculumDocuments from '../../hooks/useCurriculumDocuments'
import supabase from '../../config/supabase'

export const SchoolCurriculum = () => {
  const { showNotification } = useDataContext()
  const { documents, loading, error, loadDocuments, uploadDocument, downloadDocument, deleteDocument } = useCurriculumDocuments()
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState(null)
  const [selectedType, setSelectedType] = useState('Kurikulum')
  const [documentName, setDocumentName] = useState('')
  const [description, setDescription] = useState('')
  const fileInputRef = useRef(null)

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        loadDocuments(user.id)
      }
    }
    getCurrentUser()
  }, [loadDocuments])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = async (files) => {
    for (let file of files) {
      await uploadSingleFile(file)
    }
  }

  const uploadSingleFile = async (file) => {
    if (!userId) return

    setUploading(true)
    try {
      await uploadDocument(userId, file, {
        nama_dokumen: documentName || file.name,
        jenis: selectedType,
        deskripsi: description,
      })
      showNotification(`${file.name} berhasil diupload`, 'success')
      setDocumentName('')
      setDescription('')
      await loadDocuments(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal mengupload dokumen', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleDownload = async (doc) => {
    try {
      await downloadDocument(doc.file_path, doc.file_name)
      showNotification(`${doc.file_name} berhasil diunduh`, 'success')
    } catch (err) {
      showNotification(err.message || 'Gagal mengunduh dokumen', 'error')
    }
  }

  const handleView = (doc) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank')
    } else {
      showNotification('URL dokumen tidak tersedia', 'error')
    }
  }

  const handleDelete = async (docId, fileName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${fileName}?`)) return

    try {
      const doc = documents.find((d) => d.id === docId)
      await deleteDocument(docId, doc.file_path)
      showNotification(`${fileName} berhasil dihapus`, 'success')
      await loadDocuments(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus dokumen', 'error')
    }
  }

  const handleAddToCalendar = async (doc) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showNotification('User tidak ditemukan', 'error')
        return
      }

      // Create calendar event for curriculum document
      const eventData = {
        judul: `Implementasi: ${doc.judul || doc.file_name}`,
        deskripsi: doc.deskripsi || `Dokumen ${doc.kategori} yang perlu diimplementasikan`,
        kategori: 'kurikulum',
        tanggal_mulai: new Date().toISOString().split('T')[0],
        tanggal_selesai: new Date().toISOString().split('T')[0],
        jam_mulai: '08:00',
        jam_selesai: '10:00',
        lokasi: 'Sekolah',
        curriculum_document_id: doc.id,
      }

      const { error: calendarError } = await supabase
        .from('calendar_events')
        .insert([{ ...eventData, user_id: user.id }])

      if (calendarError) throw calendarError

      showNotification('Dokumen berhasil ditambahkan ke kalender', 'success')
    } catch (err) {
      showNotification(err.message || 'Gagal menambahkan ke kalender', 'error')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kurikulum Sekolah</h1>
        <p className="text-gray-600 mt-2">Kelola dokumen kurikulum dan silabus sekolah</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Dokumen</h2>

        {/* Drag and Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
          <p className="text-gray-700 font-medium mb-1">Drag and drop dokumen di sini</p>
          <p className="text-gray-500 text-sm mb-4">atau</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Pilih Dokumen
          </button>
          <p className="text-gray-500 text-xs mt-4">PDF, DOC, DOCX - Max 10MB per file</p>
        </div>

        {/* Document Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dokumen</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Nama dokumen (opsional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Dokumen</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Kurikulum">Kurikulum</option>
              <option value="Silabus">Silabus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi (opsional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dokumen Tersimpan</h2>

        {loading ? (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
            <p className="text-gray-600">Memuat dokumen...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-folder-open text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-600">Belum ada dokumen</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Nama Dokumen</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Jenis</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Ukuran</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tanggal Upload</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <i className={`fas fa-file-${doc.file_type === 'pdf' ? 'pdf' : 'word'} text-red-500`}></i>
                        <span className="text-gray-900">{doc.judul || doc.file_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                        {doc.kategori}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{formatFileSize(doc.file_size)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(doc.created_at)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleView(doc)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          title="Lihat dokumen"
                        >
                          <i className="fas fa-eye mr-1"></i>
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                          title="Download dokumen"
                        >
                          <i className="fas fa-download mr-1"></i>
                          Download
                        </button>
                        <button
                          onClick={() => handleAddToCalendar(doc)}
                          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                          title="Tambahkan ke kalender"
                        >
                          <i className="fas fa-calendar-plus mr-1"></i>
                          Kalender
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.judul || doc.file_name)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                          title="Hapus dokumen"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SchoolCurriculum

