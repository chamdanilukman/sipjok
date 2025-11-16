import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { menuConfig } from '../config/menuConfig'

/**
 * MenuItem Component - Handles both parent and child menu items
 */
const MenuItem = ({ item, isOpen, isActive, isExpanded, onToggleExpand, isMobile }) => {
  const hasChildren = item.children && item.children.length > 0

  if (hasChildren) {
    return (
      <div>
        {/* Parent Menu Item */}
        <button
          onClick={() => onToggleExpand(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            isExpanded ? 'bg-gray-800 text-blue-400' : 'text-gray-300 hover:bg-gray-800'
          } ${isMobile ? 'min-h-[56px]' : ''}`}
          title={!isOpen ? item.label : ''}
          data-testid={`menu-${item.id}`}
        >
          <i className={`${item.icon} text-lg w-6 text-center flex-shrink-0`}></i>
          {isOpen && (
            <>
              <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
              <i
                className={`fas fa-chevron-down text-xs transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              ></i>
            </>
          )}
        </button>

        {/* Child Menu Items */}
        {isOpen && isExpanded && (
          <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {item.children.map((child) => (
              <Link
                key={child.id}
                to={child.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                  isActive(child.path)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                } ${isMobile ? 'min-h-[48px]' : ''}`}
                title={!isOpen ? child.label : ''}
                data-testid={`menu-${child.id}`}
              >
                <i className={`${child.icon} text-sm w-5 text-center flex-shrink-0`}></i>
                {isOpen && <span className="font-medium">{child.label}</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Simple Menu Item (no children)
  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive(item.path)
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-300 hover:bg-gray-800'
      } ${isMobile ? 'min-h-[56px]' : ''}`}
      title={!isOpen ? item.label : ''}
      data-testid={`menu-${item.id}`}
    >
      <i className={`${item.icon} text-lg w-6 text-center flex-shrink-0`}></i>
      {isOpen && <span className="text-sm font-medium">{item.label}</span>}
    </Link>
  )
}

export const Sidebar = ({ isOpen, onToggle, isMobile }) => {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState({})

  const isActive = (path) => {
    return location.pathname === path
  }

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobile, isOpen])

  return (
    <>
      {/* Sidebar - Desktop/Tablet: Always visible | Mobile: Slide-in drawer from right */}
      <aside
        className={`
          ${isMobile ? 'fixed inset-y-0 right-0 z-50' : 'relative'}
          ${isOpen ? 'translate-x-0' : isMobile ? 'translate-x-full' : 'translate-x-0'}
          ${isMobile ? 'w-[280px]' : isOpen ? 'w-64' : 'w-20'}
          bg-gray-900 text-white transition-all duration-300 ease-in-out
          overflow-y-auto flex flex-col shadow-xl
        `}
        data-testid="sidebar"
      >
        {/* Logo */}
        <div className={`p-4 border-b border-gray-700 ${isMobile ? 'pt-6' : ''}`}>
          <div className="flex items-center justify-center gap-2">
            <i className="fas fa-dumbbell text-2xl text-blue-400"></i>
            {isOpen && <span className="font-bold text-lg">SIPJOK</span>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuConfig.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              isOpen={isOpen}
              isActive={isActive}
              isExpanded={expandedItems[item.id] || false}
              onToggleExpand={toggleExpand}
              isMobile={isMobile}
            />
          ))}
        </nav>

        {/* Footer - Collapse button (Desktop/Tablet only) */}
        {!isMobile && (
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-all duration-200 min-h-[44px]"
              data-testid="button-collapse-sidebar"
            >
              <i className={`fas fa-chevron-${isOpen ? 'left' : 'right'}`}></i>
              {isOpen && <span className="text-sm">Collapse</span>}
            </button>
          </div>
        )}

        {/* Close button (Mobile only) */}
        {isMobile && (
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 min-h-[56px]"
              data-testid="button-close-mobile-menu"
            >
              <i className="fas fa-times text-lg"></i>
              <span className="text-sm font-medium">Tutup Menu</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile overlay backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 animate-in fade-in duration-300"
          onClick={onToggle}
          data-testid="sidebar-overlay"
        ></div>
      )}
    </>
  )
}

export default Sidebar

