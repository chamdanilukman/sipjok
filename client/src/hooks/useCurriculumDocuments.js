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

  return { documents, setDocuments, loading, error, loadDocuments, createDocument, updateDocument, deleteDocument }
}

export default useCurriculumDocuments
