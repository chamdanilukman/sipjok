import React from 'react'
import { useNotification } from '../context/NotificationContext'

export const Notification = () => {
  const { notification, hideNotification } = useNotification()

  if (!notification) return null

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[notification.type] || 'bg-blue-500'

  const icon = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
  }[notification.type] || 'fas fa-info-circle'

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}>
        <i className={`${icon} text-lg`}></i>
        <span className="font-medium">{notification.message}</span>
        <button
          onClick={hideNotification}
          className="ml-4 hover:opacity-80 transition-opacity"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  )
}

export default Notification

