import { useState, useCallback } from 'react'
import { api } from '../lib/api'

const useExamQuestions = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/exam-questions')
      setQuestions(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createQuestion = useCallback(async (questionData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/exam-questions', questionData)
      setQuestions((prev) => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateQuestion = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/exam-questions/${id}`, updates)
      setQuestions((prev) => prev.map((q) => (q.id === id ? data : q)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteQuestion = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/exam-questions/${id}`)
      setQuestions((prev) => prev.filter((q) => q.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { questions, setQuestions, loading, error, loadQuestions, createQuestion, updateQuestion, deleteQuestion }
}

export default useExamQuestions
