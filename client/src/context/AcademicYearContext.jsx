import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'sipjok_tahun_ajaran'

// Tahun ajaran (TP) di Indonesia dimulai Juli: Jul-Des = tahun awal TP,
// Jan-Jun = tahun akhirnya. Contoh: Oktober 2026 -> TP "2026/2027".
export const getCurrentAcademicYear = (now = new Date()) => {
  const y = now.getFullYear()
  const start = now.getMonth() >= 6 ? y : y - 1
  return `${start}/${start + 1}`
}

// Tiga TP terakhir sebagai pilihan bawaan; tahun kustom dari data kelas
// bisa ditambahkan lewat registerClassYears.
export const getBaseAcademicYears = (now = new Date()) => {
  const start = parseInt(getCurrentAcademicYear(now), 10)
  return [`${start}/${start + 1}`, `${start - 1}/${start}`, `${start - 2}/${start - 1}`]
}

const AcademicYearContext = createContext(null)

export const AcademicYearProvider = ({ children }) => {
  const [academicYear, setAcademicYearState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || getCurrentAcademicYear()
    } catch {
      return getCurrentAcademicYear()
    }
  })
  const [extraYears, setExtraYears] = useState([])

  const setAcademicYear = useCallback((year) => {
    setAcademicYearState(year)
    try {
      localStorage.setItem(STORAGE_KEY, year)
    } catch {
      // localStorage tidak tersedia (mode privat) — pilihan hanya bertahan selama sesi
    }
  }, [])

  // Halaman yang memuat daftar kelas mendaftarkan tahun ajaran kustom dari database
  const registerClassYears = useCallback((classes) => {
    const found = [...new Set((classes || [])
      .map((c) => String(c.academic_year || '').trim())
      .filter(Boolean))]
    setExtraYears((prev) => {
      const merged = [...new Set([...prev, ...found])]
      return merged.length === prev.length ? prev : merged
    })
  }, [])

  const availableYears = useMemo(() => (
    [...new Set([...getBaseAcademicYears(), ...extraYears])]
      .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
  ), [extraYears])

  // Rentang tanggal TP terpilih: 1 Juli tahun awal s.d. 30 Juni tahun berikutnya
  const academicYearRange = useMemo(() => {
    const startYear = parseInt(academicYear, 10)
    if (Number.isNaN(startYear)) return null
    return { startDate: `${startYear}-07-01`, endDate: `${startYear + 1}-06-30` }
  }, [academicYear])

  return (
    <AcademicYearContext.Provider
      value={{
        academicYear,
        setAcademicYear,
        availableYears,
        registerClassYears,
        academicYearRange,
        currentAcademicYear: getCurrentAcademicYear(),
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  )
}

export const useAcademicYear = () => {
  const ctx = useContext(AcademicYearContext)
  if (!ctx) {
    throw new Error('useAcademicYear harus dipakai di dalam AcademicYearProvider')
  }
  return ctx
}

export default AcademicYearContext
