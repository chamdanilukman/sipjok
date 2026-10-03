import { useState, useCallback } from 'react'
import { api } from '../lib/api'

// Kolom score/max_score bertipe numeric (zod drizzle-zod hanya menerima string);
// halaman mengirim angka — serialisasi dilakukan di sini.
const serialize = (g) => ({
  ...g,
  score: g.score !== undefined && g.score !== null && g.score !== '' ? String(g.score) : g.score,
  max_score: g.max_score !== undefined && g.max_score !== null && g.max_score !== '' ? String(g.max_score) : g.max_score,
})

const useGrades = () => {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadGrades = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/grades')
      const rows = data || []
      setGrades(rows)
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const loadGradesByClass = useCallback(async (userId, classId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/grades')
      const rows = (data || []).filter((g) => g.class_id === classId)
      setGrades(rows)
      return rows
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createGrade = useCallback(async (userId, gradeData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/grades', serialize(gradeData || {}))
      setGrades((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Simpan banyak nilai sekaligus (mode input massal)
  const bulkCreateGrades = useCallback(async (userId, rows = []) => {
    setLoading(true)
    setError(null)
    try {
      const created = []
      for (const row of rows) {
        const data = await api.post('/grades', serialize(row))
        created.push(data)
      }
      setGrades((prev) => [...created.reverse(), ...prev])
      return created
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateGrade = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.put(`/grades/${id}`, serialize(updates || {}))
      setGrades((prev) => prev.map((g) => (g.id === id ? data : g)))
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteGrade = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/grades/${id}`)
      setGrades((prev) => prev.filter((g) => g.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Statistik untuk satu judul penilaian pada satu kelas
  const getClassStatistics = useCallback(async (userId, classId, assessmentTitle) => {
    const data = await api.get('/grades')
    const rows = (data || []).filter(
      (g) => g.class_id === classId && g.assessment_title === assessmentTitle
    )
    const scores = rows.map((g) => Number(g.score)).filter((n) => Number.isFinite(n))
    if (scores.length === 0) {
      return { average: 0, highest: 0, lowest: 0, passRate: 0, passed: 0, failed: 0 }
    }
    const passedRows = rows.filter((g) => {
      if (g.is_passed === true) return true
      if (g.is_passed === false) return false
      return Number(g.score) >= 75 // fallback: ambang default
    })
    const passed = passedRows.length
    const failed = rows.length - passed
    return {
      average: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      passRate: rows.length > 0 ? Math.round((passed / rows.length) * 100) : 0,
      passed,
      failed,
    }
  }, [])

  return {
    grades,
    setGrades,
    loading,
    error,
    loadGrades,
    loadGradesByClass,
    createGrade,
    bulkCreateGrades,
    updateGrade,
    deleteGrade,
    getClassStatistics,
  }
}

export default useGrades
