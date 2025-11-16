import React, { createContext, useContext, useState, useCallback } from 'react'
import useData from '../hooks/useData'

const DataContext = createContext()

export const DataProvider = ({ children }) => {
  const data = useData()
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [selectedSiswa, setSelectedSiswa] = useState(null)
  const [notification, setNotification] = useState(null)

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type })
    if (duration > 0) {
      setTimeout(() => setNotification(null), duration)
    }
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(null)
  }, [])

  const value = {
    ...data,
    selectedKelas,
    setSelectedKelas,
    selectedSiswa,
    setSelectedSiswa,
    notification,
    showNotification,
    hideNotification,
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export const useDataContext = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider')
  }
  return context
}

export default DataContext

