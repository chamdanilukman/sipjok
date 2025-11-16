import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

/**
 * Custom hook for managing teaching journals
 * Handles CRUD operations and file uploads
 */
const useTeachingJournal = () => {
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load journals for a teacher
   */
  const loadJournals = useCallback(async (teacherId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('teaching_journal')
        .select(`
          id,
          teacher_id,
          class_id,
          tanggal,
          pertemuan_ke,
          materi_pokok,
          kegiatan_pembelajaran,
          metode_pembelajaran,
          jumlah_hadir,
          jumlah_sakit,
          jumlah_izin,
          jumlah_alpha,
          catatan,
          hambatan,
          solusi,
          created_at,
          updated_at,
          classes:class_id (id, name, grade)
        `)
        .eq('teacher_id', teacherId)
        .order('tanggal', { ascending: false })

      if (err) throw err
      setJournals(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading journals:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load journals for a date range
   */
  const loadJournalsByDateRange = useCallback(async (teacherId, startDate, endDate) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('teaching_journal')
        .select(`
          id,
          teacher_id,
          class_id,
          tanggal,
          pertemuan_ke,
          materi_pokok,
          kegiatan_pembelajaran,
          metode_pembelajaran,
          jumlah_hadir,
          jumlah_sakit,
          jumlah_izin,
          jumlah_alpha,
          catatan,
          hambatan,
          solusi,
          created_at,
          updated_at,
          classes:class_id (id, name, grade)
        `)
        .eq('teacher_id', teacherId)
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .order('tanggal', { ascending: false })

      if (err) throw err
      setJournals(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading journals by date range:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load journals for a specific class
   */
  const loadJournalsByClass = useCallback(async (classId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('teaching_journal')
        .select(`
          id,
          teacher_id,
          class_id,
          tanggal,
          pertemuan_ke,
          materi_pokok,
          kegiatan_pembelajaran,
          metode_pembelajaran,
          jumlah_hadir,
          jumlah_sakit,
          jumlah_izin,
          jumlah_alpha,
          catatan,
          hambatan,
          solusi,
          created_at,
          updated_at
        `)
        .eq('class_id', classId)
        .order('tanggal', { ascending: false })

      if (err) throw err
      setJournals(data || [])
      return data || []
    } catch (err) {
      setError(err.message)
      console.error('Error loading class journals:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new journal entry
   */
  const createJournal = useCallback(async (teacherId, journalData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('teaching_journal')
        .insert([
          {
            ...journalData,
            teacher_id: teacherId,
          },
        ])
        .select()

      if (err) throw err

      setJournals((prev) => [data[0], ...prev])
      return data[0]
    } catch (err) {
      setError(err.message)
      console.error('Error creating journal:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update a journal entry
   */
  const updateJournal = useCallback(async (journalId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('teaching_journal')
        .update(updates)
        .eq('id', journalId)
        .select()

      if (err) throw err

      setJournals((prev) =>
        prev.map((j) => (j.id === journalId ? data[0] : j))
      )
      return data[0]
    } catch (err) {
      setError(err.message)
      console.error('Error updating journal:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete a journal entry
   */
  const deleteJournal = useCallback(async (journalId) => {
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('teaching_journal')
        .delete()
        .eq('id', journalId)

      if (err) throw err

      setJournals((prev) => prev.filter((j) => j.id !== journalId))
    } catch (err) {
      setError(err.message)
      console.error('Error deleting journal:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])


  /**
   * Get journals for a specific date
   */
  const getJournalsByDate = useCallback((date) => {
    return journals.filter((j) => j.tanggal === date)
  }, [journals])

  /**
   * Get journals for a specific month
   */
  const getJournalsByMonth = useCallback((year, month) => {
    return journals.filter((j) => {
      const date = new Date(j.tanggal)
      return date.getFullYear() === year && date.getMonth() === month
    })
  }, [journals])

  return {
    journals,
    setJournals,
    loading,
    error,
    loadJournals,
    loadJournalsByDateRange,
    loadJournalsByClass,
    createJournal,
    updateJournal,
    deleteJournal,
    getJournalsByDate,
    getJournalsByMonth,
  }
}

export default useTeachingJournal

