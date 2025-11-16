import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

/**
 * Custom hook for ATP Intracurricular CRUD operations
 * Manages Alur Tujuan Pembelajaran (Learning Objectives Flow)
 */
const useATP = () => {
  const [atpList, setAtpList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load all ATP for a teacher
   */
  const loadATP = useCallback(async (teacherId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('atp_intracurricular')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })

      if (err) throw err
      setAtpList(data || [])
      return data
    } catch (err) {
      console.error('Error loading ATP:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load single ATP by ID
   */
  const loadATPById = useCallback(async (atpId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('atp_intracurricular')
        .select('*')
        .eq('id', atpId)
        .single()

      if (err) throw err
      return data
    } catch (err) {
      console.error('Error loading ATP by ID:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create new ATP
   */
  const createATP = useCallback(async (teacherId, atpData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('atp_intracurricular')
        .insert([
          {
            teacher_id: teacherId,
            judul: atpData.judul,
            mata_pelajaran: atpData.mata_pelajaran || 'PJOK',
            fase: atpData.fase,
            kelas: atpData.kelas,
            capaian_pembelajaran: atpData.capaian_pembelajaran,
            tujuan_pembelajaran: atpData.tujuan_pembelajaran || [],
            alokasi_waktu: atpData.alokasi_waktu || 1,
          },
        ])
        .select()
        .single()

      if (err) throw err
      
      // Update local state
      setAtpList((prev) => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating ATP:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update existing ATP
   */
  const updateATP = useCallback(async (atpId, atpData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('atp_intracurricular')
        .update({
          judul: atpData.judul,
          mata_pelajaran: atpData.mata_pelajaran,
          fase: atpData.fase,
          kelas: atpData.kelas,
          capaian_pembelajaran: atpData.capaian_pembelajaran,
          tujuan_pembelajaran: atpData.tujuan_pembelajaran,
          alokasi_waktu: atpData.alokasi_waktu,
        })
        .eq('id', atpId)
        .select()
        .single()

      if (err) throw err

      // Update local state
      setAtpList((prev) =>
        prev.map((atp) => (atp.id === atpId ? data : atp))
      )
      return data
    } catch (err) {
      console.error('Error updating ATP:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete ATP
   */
  const deleteATP = useCallback(async (atpId) => {
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('atp_intracurricular')
        .delete()
        .eq('id', atpId)

      if (err) throw err

      // Update local state
      setAtpList((prev) => prev.filter((atp) => atp.id !== atpId))
    } catch (err) {
      console.error('Error deleting ATP:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Search ATP by keyword
   */
  const searchATP = useCallback(async (teacherId, keyword) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('atp_intracurricular')
        .select('*')
        .eq('teacher_id', teacherId)
        .or(`judul.ilike.%${keyword}%,capaian_pembelajaran.ilike.%${keyword}%`)
        .order('created_at', { ascending: false })

      if (err) throw err
      setAtpList(data || [])
      return data
    } catch (err) {
      console.error('Error searching ATP:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Filter ATP by fase and/or kelas
   */
  const filterATP = useCallback(async (teacherId, filters) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('atp_intracurricular')
        .select('*')
        .eq('teacher_id', teacherId)

      if (filters.fase) {
        query = query.eq('fase', filters.fase)
      }

      if (filters.kelas) {
        query = query.eq('kelas', filters.kelas)
      }

      const { data, error: err } = await query.order('created_at', { ascending: false })

      if (err) throw err
      setAtpList(data || [])
      return data
    } catch (err) {
      console.error('Error filtering ATP:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get ATP count by fase
   */
  const getATPCountByFase = useCallback(async (teacherId) => {
    try {
      const { data, error: err } = await supabase
        .from('atp_intracurricular')
        .select('fase')
        .eq('teacher_id', teacherId)

      if (err) throw err

      const counts = {
        A: 0,
        B: 0,
        C: 0,
      }

      data.forEach((item) => {
        if (counts[item.fase] !== undefined) {
          counts[item.fase]++
        }
      })

      return counts
    } catch (err) {
      console.error('Error getting ATP count:', err)
      return { A: 0, B: 0, C: 0 }
    }
  }, [])

  return {
    atpList,
    loading,
    error,
    loadATP,
    loadATPById,
    createATP,
    updateATP,
    deleteATP,
    searchATP,
    filterATP,
    getATPCountByFase,
  }
}

export default useATP

