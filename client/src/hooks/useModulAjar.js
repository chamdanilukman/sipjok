import { useState, useCallback } from 'react'
import supabase from '../config/supabase'

/**
 * Custom hook for Modul Ajar (Lesson Plans) CRUD operations
 * Manages complete lesson plans with 7-step wizard data
 */
const useModulAjar = () => {
  const [modulList, setModulList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Load all Modul Ajar for a teacher
   */
  const loadModulAjar = useCallback(async (teacherId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('modul_ajar')
        .select(`
          *,
          atp:atp_intracurricular(judul, fase, kelas)
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })

      if (err) throw err
      setModulList(data || [])
      return data
    } catch (err) {
      console.error('Error loading Modul Ajar:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Load single Modul Ajar by ID
   */
  const loadModulAjarById = useCallback(async (modulId) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('modul_ajar')
        .select(`
          *,
          atp:atp_intracurricular(*)
        `)
        .eq('id', modulId)
        .single()

      if (err) throw err
      return data
    } catch (err) {
      console.error('Error loading Modul Ajar by ID:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create new Modul Ajar
   */
  const createModulAjar = useCallback(async (teacherId, modulData) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('modul_ajar')
        .insert([
          {
            teacher_id: teacherId,
            atp_id: modulData.atp_id || null,
            title: modulData.title,
            mata_pelajaran: modulData.mata_pelajaran || 'PJOK',
            fase: modulData.fase,
            kelas: modulData.kelas,
            alokasi_waktu: modulData.alokasi_waktu || 1,
            capaian_pembelajaran: modulData.capaian_pembelajaran || '',
            tujuan_pembelajaran: modulData.tujuan_pembelajaran || [],
            profil_lulusan: modulData.profil_lulusan || [],
            praktik_pedagogis: modulData.praktik_pedagogis || null,
            kemitraan: modulData.kemitraan || null,
            lingkungan_pembelajaran: modulData.lingkungan_pembelajaran || null,
            digital_tools: modulData.digital_tools || [],
            skenario_pembelajaran: modulData.skenario_pembelajaran || [],
            asesmen: modulData.asesmen || {},
            media_files: modulData.media_files || [],
            sumber_belajar: modulData.sumber_belajar || {},
            diferensiasi: modulData.diferensiasi || {},
            refleksi_guru: modulData.refleksi_guru || null,
            catatan_tambahan: modulData.catatan_tambahan || null,
            status: modulData.status || 'draft',
          },
        ])
        .select()
        .single()

      if (err) throw err

      // Update local state
      setModulList((prev) => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating Modul Ajar:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update existing Modul Ajar
   */
  const updateModulAjar = useCallback(async (modulId, modulData) => {
    setLoading(true)
    setError(null)
    try {
      const updateData = {
        title: modulData.title,
        mata_pelajaran: modulData.mata_pelajaran,
        fase: modulData.fase,
        kelas: modulData.kelas,
        alokasi_waktu: modulData.alokasi_waktu,
        capaian_pembelajaran: modulData.capaian_pembelajaran,
        tujuan_pembelajaran: modulData.tujuan_pembelajaran,
        profil_lulusan: modulData.profil_lulusan,
        praktik_pedagogis: modulData.praktik_pedagogis,
        kemitraan: modulData.kemitraan,
        lingkungan_pembelajaran: modulData.lingkungan_pembelajaran,
        digital_tools: modulData.digital_tools,
        skenario_pembelajaran: modulData.skenario_pembelajaran,
        asesmen: modulData.asesmen,
        media_files: modulData.media_files,
        sumber_belajar: modulData.sumber_belajar,
        diferensiasi: modulData.diferensiasi,
        refleksi_guru: modulData.refleksi_guru,
        catatan_tambahan: modulData.catatan_tambahan,
        status: modulData.status,
      }

      // Only update atp_id if explicitly provided
      if (modulData.atp_id !== undefined) {
        updateData.atp_id = modulData.atp_id
      }

      const { data, error: err } = await supabase
        .from('modul_ajar')
        .update(updateData)
        .eq('id', modulId)
        .select()
        .single()

      if (err) throw err

      // Update local state
      setModulList((prev) =>
        prev.map((modul) => (modul.id === modulId ? data : modul))
      )
      return data
    } catch (err) {
      console.error('Error updating Modul Ajar:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete Modul Ajar
   */
  const deleteModulAjar = useCallback(async (modulId) => {
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('modul_ajar')
        .delete()
        .eq('id', modulId)

      if (err) throw err

      // Update local state
      setModulList((prev) => prev.filter((modul) => modul.id !== modulId))
    } catch (err) {
      console.error('Error deleting Modul Ajar:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Copy/Duplicate Modul Ajar
   */
  const copyModulAjar = useCallback(async (teacherId, modulId) => {
    setLoading(true)
    setError(null)
    try {
      // Load original modul
      const { data: original, error: loadErr } = await supabase
        .from('modul_ajar')
        .select('*')
        .eq('id', modulId)
        .single()

      if (loadErr) throw loadErr

      // Create copy with modified title
      const copyData = {
        ...original,
        id: undefined, // Remove ID to create new record
        teacher_id: teacherId,
        title: `${original.title} (Copy)`,
        status: 'draft',
        created_at: undefined,
        updated_at: undefined,
      }

      const { data, error: err } = await supabase
        .from('modul_ajar')
        .insert([copyData])
        .select()
        .single()

      if (err) throw err

      // Update local state
      setModulList((prev) => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error copying Modul Ajar:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update Modul Ajar status
   */
  const updateStatus = useCallback(async (modulId, status) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('modul_ajar')
        .update({ status })
        .eq('id', modulId)
        .select()
        .single()

      if (err) throw err

      // Update local state
      setModulList((prev) =>
        prev.map((modul) => (modul.id === modulId ? data : modul))
      )
      return data
    } catch (err) {
      console.error('Error updating status:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Search Modul Ajar by keyword
   */
  const searchModulAjar = useCallback(async (teacherId, keyword) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('modul_ajar')
        .select('*')
        .eq('teacher_id', teacherId)
        .or(`title.ilike.%${keyword}%,capaian_pembelajaran.ilike.%${keyword}%`)
        .order('created_at', { ascending: false })

      if (err) throw err
      setModulList(data || [])
      return data
    } catch (err) {
      console.error('Error searching Modul Ajar:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Filter Modul Ajar by fase, kelas, and/or status
   */
  const filterModulAjar = useCallback(async (teacherId, filters) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('modul_ajar')
        .select('*')
        .eq('teacher_id', teacherId)

      if (filters.fase) {
        query = query.eq('fase', filters.fase)
      }

      if (filters.kelas) {
        query = query.eq('kelas', filters.kelas)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error: err } = await query.order('created_at', { ascending: false })

      if (err) throw err
      setModulList(data || [])
      return data
    } catch (err) {
      console.error('Error filtering Modul Ajar:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get statistics (count by status)
   */
  const getStatistics = useCallback(async (teacherId) => {
    try {
      const { data, error: err } = await supabase
        .from('modul_ajar')
        .select('status')
        .eq('teacher_id', teacherId)

      if (err) throw err

      const stats = {
        total: data.length,
        draft: 0,
        review: 0,
        published: 0,
      }

      data.forEach((item) => {
        if (stats[item.status] !== undefined) {
          stats[item.status]++
        }
      })

      return stats
    } catch (err) {
      console.error('Error getting statistics:', err)
      return { total: 0, draft: 0, review: 0, published: 0 }
    }
  }, [])

  return {
    modulList,
    loading,
    error,
    loadModulAjar,
    loadModulAjarById,
    createModulAjar,
    updateModulAjar,
    deleteModulAjar,
    copyModulAjar,
    updateStatus,
    searchModulAjar,
    filterModulAjar,
    getStatistics,
  }
}

export default useModulAjar

