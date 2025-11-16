import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { menuConfig } from '../config/menuConfig'

/**
 * MenuItem Component - Handles both parent and child menu items
 */
const MenuItem = ({ item, isOpen, isActive, isExpanded, onToggleExpand }) => {
  const hasChildren = item.children && item.children.length > 0

  if (hasChildren) {
    return (
      <div>
        {/* Parent Menu Item */}
        <button
          onClick={() => onToggleExpand(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isExpanded ? 'bg-gray-800 text-blue-400' : 'text-gray-300 hover:bg-gray-800'
          }`}
          title={!isOpen ? item.label : ''}
        >
          <i className={`${item.icon} text-lg w-6 text-center flex-shrink-0`}></i>
          {isOpen && (
            <>
              <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
              <i
                className={`fas fa-chevron-down text-xs transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              ></i>
            </>
          )}
        </button>

        {/* Child Menu Items */}
        {isOpen && isExpanded && (
          <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-2">
            {item.children.map((child) => (
              <Link
                key={child.id}
                to={child.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                  isActive(child.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                }`}
                title={!isOpen ? child.label : ''}
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive(item.path)
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-800'
      }`}
      title={!isOpen ? item.label : ''}
    >
      <i className={`${item.icon} text-lg w-6 text-center flex-shrink-0`}></i>
      {isOpen && <span className="text-sm font-medium">{item.label}</span>}
    </Link>
  )
}

export const Sidebar = ({ isOpen, onToggle }) => {
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

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 overflow-y-auto flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-center">
            <i className="fas fa-dumbbell text-2xl text-blue-400"></i>
            {isOpen && <span className="ml-2 font-bold text-lg">SIPJOK</span>}
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
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <i className="fas fa-chevron-left"></i>
            {isOpen && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        ></div>
      )}
    </>
  )
}

export default Sidebar

