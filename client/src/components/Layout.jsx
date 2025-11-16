import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Notification from './Notification'
import { useIsMobile } from '../hooks/use-mobile'

export const Layout = () => {
  const isMobile = useIsMobile()
  // Mobile: closed by default, Desktop: open by default
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Update sidebar state based on screen size
  useEffect(() => {
    if (isMobile === undefined) return
    
    // On mobile: sidebar should be closed by default
    // On desktop/tablet: sidebar should be open by default
    setSidebarOpen(!isMobile)
  }, [isMobile])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          isMobile={isMobile}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notification */}
      <Notification />
    </div>
  )
}

export default Layout

