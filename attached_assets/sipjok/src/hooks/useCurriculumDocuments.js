import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

/**
 * Custom hook for managing curriculum documents
 * Handles document uploads, downloads, and metadata management
 */
export const useCurriculumDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load all curriculum documents for a user
   */
  const loadDocuments = useCallback(async (userId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('curriculum_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (err) throw err

      setDocuments(data || [])
      return data
    } catch (err) {
      const errorMessage = err.message || 'Failed to load documents'
      setError(errorMessage)
      console.error('Error loading documents:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Upload curriculum document
   */
  const uploadDocument = useCallback(async (userId, file, metadata) => {
    setLoading(true)
    setError(null)
    try {
      // Validate file
      if (!file) throw new Error('No file selected')
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF and Word documents are allowed')
      }

      // Generate unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${userId}/${fileName}`

      // Upload to storage
      const { error: uploadErr } = await supabase.storage
        .from('curriculum-files')
        .upload(filePath, file)

      if (uploadErr) throw uploadErr

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('curriculum-files')
        .getPublicUrl(filePath)

      const fileUrl = urlData.publicUrl

      // Get file type
      const fileType = fileExt.toLowerCase()

      // Map jenis to kategori
      const kategoriMap = {
        'Kurikulum': 'kurikulum',
        'Silabus': 'silabus',
        'Pedoman': 'pedoman',
        'Lainnya': 'lainnya'
      }

      // Save metadata to database
      const { data: newDoc, error: dbErr } = await supabase
        .from('curriculum_documents')
        .insert([
          {
            user_id: userId,
            judul: metadata.nama_dokumen || file.name,
            kategori: kategoriMap[metadata.jenis] || 'kurikulum',
            deskripsi: metadata.deskripsi || '',
            file_name: file.name,
            file_url: fileUrl,
            file_path: filePath,
            file_size: file.size,
            file_type: fileType,
          },
        ])
        .select()
        .single()

      if (dbErr) throw dbErr

      // Add to documents list
      setDocuments((prev) => [newDoc, ...prev])
      return newDoc
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload document'
      setError(errorMessage)
      console.error('Error uploading document:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Download curriculum document
   */
  const downloadDocument = useCallback(async (filePath, fileName) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase.storage
        .from('curriculum-files')
        .download(filePath)

      if (err) throw err

      // Create blob and download
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true
    } catch (err) {
      const errorMessage = err.message || 'Failed to download document'
      setError(errorMessage)
      console.error('Error downloading document:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete curriculum document
   */
  const deleteDocument = useCallback(async (documentId, filePath) => {
    setLoading(true)
    setError(null)
    try {
      // Delete from storage
      const { error: storageErr } = await supabase.storage
        .from('curriculum-files')
        .remove([filePath])

      if (storageErr) throw storageErr

      // Delete from database
      const { error: dbErr } = await supabase
        .from('curriculum_documents')
        .delete()
        .eq('id', documentId)

      if (dbErr) throw dbErr

      // Remove from documents list
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
      return true
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete document'
      setError(errorMessage)
      console.error('Error deleting document:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update document metadata
   */
  const updateDocument = useCallback(async (documentId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const { data: updatedDoc, error: err } = await supabase
        .from('curriculum_documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single()

      if (err) throw err

      // Update in documents list
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentId ? updatedDoc : doc))
      )
      return updatedDoc
    } catch (err) {
      const errorMessage = err.message || 'Failed to update document'
      setError(errorMessage)
      console.error('Error updating document:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    documents,
    setDocuments,
    loading,
    error,
    loadDocuments,
    uploadDocument,
    downloadDocument,
    deleteDocument,
    updateDocument,
  }
}

export default useCurriculumDocuments

