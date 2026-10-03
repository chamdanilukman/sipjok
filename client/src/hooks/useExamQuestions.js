import { useState, useCallback } from 'react'
import { api } from '../lib/api'

// Kolom `options` bertipe text (JSON string) sedangkan form memakai array;
// serialisasi/parse dilakukan di sini agar halaman selalu melihat array.
const parseJson = (val, fallback) => {
  if (val == null) return fallback
  if (typeof val === 'object') return val
  try {
    const parsed = JSON.parse(val)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const serialize = (q) => ({
  ...q,
  options: Array.isArray(q.options) ? JSON.stringify(q.options) : (q.options ?? null),
})

const toView = (row) => ({
  ...row,
  options: parseJson(row.options, []),
  tags: parseJson(row.tags, []),
})

const useExamQuestions = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/exam-questions')
      const rows = (data || []).map(toView)
      setQuestions(rows)
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createQuestion = useCallback(async (userId, questionData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/exam-questions', serialize(questionData || {}))
      const row = toView(data)
      setQuestions((prev) => [row, ...prev])
      return row
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
      const data = await api.put(`/exam-questions/${id}`, serialize(updates || {}))
      const row = toView(data)
      setQuestions((prev) => prev.map((q) => (q.id === id ? row : q)))
      return row
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

  // Daftar topik unik dari seluruh soal milik guru
  const getTopics = useCallback(async () => {
    const data = await api.get('/exam-questions')
    return [...new Set((data || []).map((q) => q.topic).filter(Boolean))]
  }, [])

  const searchQuestions = useCallback(async (userId, keyword) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/exam-questions')
      const q = String(keyword || '').toLowerCase()
      const rows = (data || [])
        .map(toView)
        .filter((item) =>
          `${item.title || ''} ${item.question_text || ''} ${item.topic || ''}`.toLowerCase().includes(q)
        )
      setQuestions(rows)
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const filterQuestions = useCallback(async (userId, filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/exam-questions')
      const rows = (data || [])
        .map(toView)
        .filter((item) =>
          (!filters.question_type || item.question_type === filters.question_type) &&
          (!filters.difficulty || item.difficulty === filters.difficulty) &&
          (!filters.topic || item.topic === filters.topic)
        )
      setQuestions(rows)
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { questions, setQuestions, loading, error, loadQuestions, createQuestion, updateQuestion, deleteQuestion, searchQuestions, filterQuestions, getTopics }
}

export default useExamQuestions
