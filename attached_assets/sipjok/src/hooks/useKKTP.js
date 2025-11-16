import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

const useKKTP = () => {
  const [kktpList, setKktpList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Default indicators template
  const DEFAULT_INDICATORS = [
    {
      level: 'Belum Berkembang',
      min: 0,
      max: 40,
      description: 'Peserta didik belum menunjukkan kemampuan yang diharapkan',
    },
    {
      level: 'Mulai Berkembang',
      min: 41,
      max: 60,
      description: 'Peserta didik mulai menunjukkan kemampuan dengan bantuan',
    },
    {
      level: 'Berkembang Sesuai Harapan',
      min: 61,
      max: 80,
      description: 'Peserta didik menunjukkan kemampuan sesuai harapan',
    },
    {
      level: 'Sangat Berkembang',
      min: 81,
      max: 100,
      description: 'Peserta didik menunjukkan kemampuan melebihi harapan',
    },
  ]

  // Load all KKTP for a teacher
  const loadKKTP = useCallback(async (teacherId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('kktp_criteria')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setKktpList(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading KKTP:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load single KKTP by ID
  const loadKKTPById = useCallback(async (kktpId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('kktp_criteria')
        .select('*')
        .eq('id', kktpId)
        .single()

      if (fetchError) throw fetchError
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error loading KKTP:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Create new KKTP
  const createKKTP = useCallback(async (teacherId, kktpData) => {
    setLoading(true)
    setError(null)
    try {
      // Use default indicators if not provided
      const indicators = kktpData.indicators || DEFAULT_INDICATORS

      const { data, error: insertError } = await supabase
        .from('kktp_criteria')
        .insert([
          {
            teacher_id: teacherId,
            ...kktpData,
            indicators,
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      setKktpList((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error creating KKTP:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update KKTP
  const updateKKTP = useCallback(async (kktpId, kktpData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('kktp_criteria')
        .update(kktpData)
        .eq('id', kktpId)
        .select()
        .single()

      if (updateError) throw updateError

      setKktpList((prev) => prev.map((k) => (k.id === kktpId ? data : k)))
      return data
    } catch (err) {
      setError(err.message)
      console.error('Error updating KKTP:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete KKTP
  const deleteKKTP = useCallback(async (kktpId) => {
    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('kktp_criteria')
        .delete()
        .eq('id', kktpId)

      if (deleteError) throw deleteError

      setKktpList((prev) => prev.filter((k) => k.id !== kktpId))
    } catch (err) {
      setError(err.message)
      console.error('Error deleting KKTP:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter KKTP
  const filterKKTP = useCallback(async (teacherId, filters) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('kktp_criteria')
        .select('*')
        .eq('teacher_id', teacherId)

      if (filters.fase) {
        query = query.eq('fase', filters.fase)
      }
      if (filters.kelas) {
        query = query.eq('kelas', filters.kelas)
      }
      if (filters.subject) {
        query = query.eq('subject', filters.subject)
      }

      const { data, error: filterError } = await query.order('created_at', {
        ascending: false,
      })

      if (filterError) throw filterError
      setKktpList(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error filtering KKTP:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Search KKTP
  const searchKKTP = useCallback(async (teacherId, keyword) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: searchError } = await supabase
        .from('kktp_criteria')
        .select('*')
        .eq('teacher_id', teacherId)
        .ilike('tujuan_pembelajaran', `%${keyword}%`)
        .order('created_at', { ascending: false })

      if (searchError) throw searchError
      setKktpList(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error searching KKTP:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Get KKTP statistics
  const getStatistics = useCallback(async (teacherId) => {
    try {
      const { data, error: statsError } = await supabase
        .from('kktp_criteria')
        .select('fase, kelas, kktp_percentage')
        .eq('teacher_id', teacherId)

      if (statsError) throw statsError

      const stats = {
        total: data.length,
        byFase: {},
        averageKKTP: 0,
      }

      data.forEach((k) => {
        stats.byFase[k.fase] = (stats.byFase[k.fase] || 0) + 1
      })

      if (data.length > 0) {
        const totalKKTP = data.reduce((sum, k) => sum + k.kktp_percentage, 0)
        stats.averageKKTP = (totalKKTP / data.length).toFixed(2)
      }

      return stats
    } catch (err) {
      console.error('Error getting statistics:', err)
      return { total: 0, byFase: {}, averageKKTP: 0 }
    }
  }, [])

  // Get level from score
  const getLevelFromScore = useCallback((score, indicators) => {
    const indicatorList = indicators || DEFAULT_INDICATORS
    const indicator = indicatorList.find(
      (ind) => score >= ind.min && score <= ind.max
    )
    return indicator || indicatorList[0]
  }, [])

  return {
    kktpList,
    loading,
    error,
    DEFAULT_INDICATORS,
    loadKKTP,
    loadKKTPById,
    createKKTP,
    updateKKTP,
    deleteKKTP,
    filterKKTP,
    searchKKTP,
    getStatistics,
    getLevelFromScore,
  }
}

export default useKKTP

