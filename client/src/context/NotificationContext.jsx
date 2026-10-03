import React, { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
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

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export default NotificationContext
