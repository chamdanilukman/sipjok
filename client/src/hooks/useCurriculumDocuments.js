import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useCurriculumDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/curriculum')
      setDocuments(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createDocument = useCallback(async (documentData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/curriculum', documentData)
      setDocuments((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateDocument = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/curriculum/${id}`, updates)
      setDocuments((prev) => prev.map((d) => (d.id === id ? data : d)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteDocument = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/curriculum/${id}`)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Upload a document file to the server's local storage, then create
   * the curriculum_documents record pointing at it.
   */
  const uploadDocument = useCallback(async (userId, file, meta = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.upload('/uploads', file)
      const data = await api.post('/curriculum', {
        title: meta.nama_dokumen || file.name,
        document_type: meta.jenis || 'Lainnya',
        description: meta.deskripsi || null,
        file_url: result.url,
      })
      setDocuments((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Open a stored document. With local storage the file_url is a
   * same-origin path like /uploads/<filename>.
   */
  const downloadDocument = useCallback(async (fileUrl, fileName) => {
    if (!fileUrl) throw new Error('Dokumen tidak memiliki file terlampir')
    window.open(fileUrl, '_blank')
  }, [])

  return { documents, setDocuments, loading, error, loadDocuments, createDocument, updateDocument, deleteDocument, uploadDocument, downloadDocument }
}

export default useCurriculumDocuments
