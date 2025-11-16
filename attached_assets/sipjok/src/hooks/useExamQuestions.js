import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

const useExamQuestions = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load all questions for a teacher
  const loadQuestions = useCallback(async (teacherId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setQuestions(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading questions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load single question by ID
  const loadQuestionById = useCallback(async (questionId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('id', questionId)
        .single()

      if (fetchError) throw fetchError
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error loading question:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Create new question
  const createQuestion = useCallback(async (teacherId, questionData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from('exam_questions')
        .insert([
          {
            teacher_id: teacherId,
            ...questionData,
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      setQuestions((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error creating question:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update question
  const updateQuestion = useCallback(async (questionId, questionData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('exam_questions')
        .update(questionData)
        .eq('id', questionId)
        .select()
        .single()

      if (updateError) throw updateError

      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? data : q))
      )
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error updating question:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete question
  const deleteQuestion = useCallback(async (questionId) => {
    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('exam_questions')
        .delete()
        .eq('id', questionId)

      if (deleteError) throw deleteError

      setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    } catch (err) {
      setError(err.message)
      console.error('Error deleting question:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Search questions
  const searchQuestions = useCallback(async (teacherId, keyword) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: searchError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('teacher_id', teacherId)
        .or(`title.ilike.%${keyword}%,question_text.ilike.%${keyword}%,topic.ilike.%${keyword}%`)
        .order('created_at', { ascending: false })

      if (searchError) throw searchError
      setQuestions(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error searching questions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter questions
  const filterQuestions = useCallback(async (teacherId, filters) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('exam_questions')
        .select('*')
        .eq('teacher_id', teacherId)

      if (filters.subject) {
        query = query.eq('subject', filters.subject)
      }
      if (filters.topic) {
        query = query.eq('topic', filters.topic)
      }
      if (filters.question_type) {
        query = query.eq('question_type', filters.question_type)
      }
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty)
      }
      if (filters.fase) {
        query = query.eq('fase', filters.fase)
      }
      if (filters.kelas) {
        query = query.eq('kelas', filters.kelas)
      }

      const { data, error: filterError } = await query.order('created_at', {
        ascending: false,
      })

      if (filterError) throw filterError
      setQuestions(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error filtering questions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Get statistics
  const getStatistics = useCallback(async (teacherId) => {
    try {
      const { data, error: statsError } = await supabase
        .from('exam_questions')
        .select('question_type, difficulty')
        .eq('teacher_id', teacherId)

      if (statsError) throw statsError

      const stats = {
        total: data.length,
        byType: {},
        byDifficulty: {},
      }

      data.forEach((q) => {
        stats.byType[q.question_type] = (stats.byType[q.question_type] || 0) + 1
        stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1
      })

      return stats
    } catch (err) {
      console.error('Error getting statistics:', err)
      return { total: 0, byType: {}, byDifficulty: {} }
    }
  }, [])

  // Get unique topics
  const getTopics = useCallback(async (teacherId) => {
    try {
      const { data, error: topicsError } = await supabase
        .from('exam_questions')
        .select('topic')
        .eq('teacher_id', teacherId)

      if (topicsError) throw topicsError

      const uniqueTopics = [...new Set(data.map((q) => q.topic))].filter(Boolean)
      return uniqueTopics.sort()
    } catch (err) {
      console.error('Error getting topics:', err)
      return []
    }
  }, [])

  return {
    questions,
    loading,
    error,
    loadQuestions,
    loadQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    filterQuestions,
    getStatistics,
    getTopics,
  }
}

export default useExamQuestions

