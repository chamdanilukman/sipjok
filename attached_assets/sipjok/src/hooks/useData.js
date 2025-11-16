import { useState, useCallback, useEffect } from 'react'
import useSupabase from './useSupabase'

/**
 * Custom hook for managing SIPJOK data operations
 * Provides high-level methods for all data entities
 */
export const useData = () => {
  const supabase = useSupabase()
  const [cache, setCache] = useState({})

  /**
   * Load guru (teacher) profile
   */
  const loadGuruProfile = useCallback(async (guruId) => {
    try {
      const data = await supabase.fetchData('teacher_profiles', {
        filters: { user_id: guruId },
      })
      return data?.[0]
    } catch (err) {
      console.error('Error loading guru profile:', err)
      throw err
    }
  }, [supabase])

  /**
   * Save guru profile
   */
  const saveGuruProfile = useCallback(async (guruData) => {
    try {
      if (guruData.id) {
        return await supabase.updateData('teacher_profiles', guruData.id, guruData)
      } else {
        return await supabase.insertData('teacher_profiles', guruData)
      }
    } catch (err) {
      console.error('Error saving guru profile:', err)
      throw err
    }
  }, [supabase])

  /**
   * Load students by class
   */
  const loadSiswaByKelas = useCallback(async (kelasId) => {
    try {
      const data = await supabase.fetchData('students', {
        filters: { class_id: kelasId },
        orderBy: { column: 'name', ascending: true },
      })
      return data || []
    } catch (err) {
      console.error('Error loading siswa:', err)
      throw err
    }
  }, [supabase])

  /**
   * Load attendance records
   */
  const loadAbsensi = useCallback(async (kelasId, tanggal) => {
    try {
      const data = await supabase.fetchData('student_attendance', {
        filters: { class_id: kelasId, attendance_date: tanggal },
      })
      return data || []
    } catch (err) {
      console.error('Error loading absensi:', err)
      throw err
    }
  }, [supabase])

  /**
   * Save attendance record
   */
  const saveAbsensi = useCallback(async (absensiData) => {
    try {
      if (absensiData.id) {
        return await supabase.updateData('student_attendance', absensiData.id, absensiData)
      } else {
        return await supabase.insertData('student_attendance', absensiData)
      }
    } catch (err) {
      console.error('Error saving absensi:', err)
      throw err
    }
  }, [supabase])

  /**
   * Load grades
   */
  const loadNilai = useCallback(async (kelasId, jenisPenilaian) => {
    try {
      const filters = { class_id: kelasId }
      if (jenisPenilaian) {
        filters.assessment_type = jenisPenilaian
      }
      const data = await supabase.fetchData('student_grades', { filters })
      return data || []
    } catch (err) {
      console.error('Error loading nilai:', err)
      throw err
    }
  }, [supabase])

  /**
   * Save grade
   */
  const saveNilai = useCallback(async (nilaiData) => {
    try {
      if (nilaiData.id) {
        return await supabase.updateData('student_grades', nilaiData.id, nilaiData)
      } else {
        return await supabase.insertData('student_grades', nilaiData)
      }
    } catch (err) {
      console.error('Error saving nilai:', err)
      throw err
    }
  }, [supabase])

  /**
   * Load lesson plans (RPP)
   */
  const loadRPP = useCallback(async (guruId, kelasId) => {
    try {
      const filters = { teacher_id: guruId }
      if (kelasId) {
        filters.kelas = kelasId
      }
      const data = await supabase.fetchData('modul_ajar', { filters })
      return data || []
    } catch (err) {
      console.error('Error loading RPP:', err)
      throw err
    }
  }, [supabase])

  /**
   * Save lesson plan
   */
  const saveRPP = useCallback(async (rppData) => {
    try {
      if (rppData.id) {
        return await supabase.updateData('modul_ajar', rppData.id, rppData)
      } else {
        return await supabase.insertData('modul_ajar', rppData)
      }
    } catch (err) {
      console.error('Error saving RPP:', err)
      throw err
    }
  }, [supabase])

  /**
   * Load all classes
   */
  const loadKelas = useCallback(async () => {
    try {
      const data = await supabase.fetchData('classes', {
        orderBy: { column: 'name', ascending: true },
      })
      return data || []
    } catch (err) {
      console.error('Error loading kelas:', err)
      throw err
    }
  }, [supabase])

  /**
   * Load schedule
   */
  const loadJadwal = useCallback(async (kelasId) => {
    try {
      const data = await supabase.fetchData('class_schedules', {
        filters: { class_id: kelasId },
        orderBy: { column: 'day_of_week', ascending: true },
      })
      return data || []
    } catch (err) {
      console.error('Error loading jadwal:', err)
      throw err
    }
  }, [supabase])

  /**
   * Load co-curricular programs
   */
  const loadKokurikuler = useCallback(async (guruId) => {
    try {
      const data = await supabase.fetchData('cocurricular_programs', {
        filters: { teacher_id: guruId },
      })
      return data || []
    } catch (err) {
      console.error('Error loading kokurikuler:', err)
      throw err
    }
  }, [supabase])

  /**
   * Load extracurricular programs
   */
  const loadEkstrakurikuler = useCallback(async (guruId) => {
    try {
      const data = await supabase.fetchData('extracurricular_programs', {
        filters: { teacher_id: guruId },
      })
      return data || []
    } catch (err) {
      console.error('Error loading ekstrakurikuler:', err)
      throw err
    }
  }, [supabase])

  return {
    ...supabase,
    cache,
    setCache,
    loadGuruProfile,
    saveGuruProfile,
    loadSiswaByKelas,
    loadAbsensi,
    saveAbsensi,
    loadNilai,
    saveNilai,
    loadRPP,
    saveRPP,
    loadKelas,
    loadJadwal,
    loadKokurikuler,
    loadEkstrakurikuler,
  }
}

export default useData
