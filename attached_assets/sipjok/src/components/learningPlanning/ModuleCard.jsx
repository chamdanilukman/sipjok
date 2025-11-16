import React, { useState } from 'react'
import { exportToPDF, exportToWord } from '../../utils/exportModulAjar'

/**
 * Module Card Component
 * Displays a modul ajar in card format with actions
 */
export const ModuleCard = ({ module, onEdit, onDelete, onCopy, onPreview }) => {
  const [showExportMenu, setShowExportMenu] = useState(false)

  const getStatusBadge = (status) => {
    const badges = {
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: 'fas fa-check-circle',
        label: 'Approved',
      },
      draft: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: 'fas fa-edit',
        label: 'Draft',
      },
      review: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: 'fas fa-eye',
        label: 'Review',
      },
      archived: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: 'fas fa-archive',
        label: 'Archived',
      },
    }

    return badges[status] || badges.draft
  }

  const badge = getStatusBadge(module.status)

  const handleExportPDF = () => {
    try {
      exportToPDF(module)
      setShowExportMenu(false)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Gagal mengekspor PDF: ' + error.message)
    }
  }

  const handleExportWord = async () => {
    try {
      await exportToWord(module)
      setShowExportMenu(false)
    } catch (error) {
      console.error('Error exporting Word:', error)
      alert('Gagal mengekspor Word: ' + error.message)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="p-5">
        {/* Status Badge */}
        <div className="mb-3 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
            <i className={`${badge.icon} text-xs`}></i>
            {badge.label}
          </span>
          <span className="text-xs font-medium text-blue-600">{module.mata_pelajaran}</span>
        </div>

        {/* Title */}
        <h4 className="mb-2 text-base font-semibold text-gray-900 line-clamp-2">
          {module.title}
        </h4>

        {/* Metadata */}
        <div className="space-y-1 text-sm text-gray-500">
          <p>
            <i className="fas fa-layer-group mr-2 w-4 text-gray-400"></i>
            Fase {module.fase} / Kelas {module.kelas}
          </p>
          <p>
            <i className="fas fa-clock mr-2 w-4 text-gray-400"></i>
            {module.alokasi_waktu} JP
          </p>
          {module.atp && (
            <p className="text-xs">
              <i className="fas fa-link mr-2 w-4 text-gray-400"></i>
              ATP: {module.atp.judul}
            </p>
          )}
        </div>

        {/* Date */}
        <p className="mt-3 text-xs text-gray-400">
          <i className="fas fa-calendar mr-1"></i>
          {formatDate(module.created_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-1 border-t border-gray-100 bg-gray-50 p-3">
        <div className="flex gap-1">
          {/* Preview Button */}
          <button
            onClick={() => onPreview(module)}
            className="rounded-md p-2 text-purple-600 hover:bg-purple-100 hover:text-purple-800"
            title="Preview"
          >
            <i className="fas fa-eye text-sm"></i>
          </button>
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
              title="Export"
            >
              <i className="fas fa-download text-sm"></i>
            </button>
            {showExportMenu && (
              <div className="absolute bottom-full left-0 mb-1 w-32 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                <button
                  onClick={handleExportPDF}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-file-pdf text-red-500"></i>
                  Export PDF
                </button>
                <button
                  onClick={handleExportWord}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <i className="fas fa-file-word text-blue-500"></i>
                  Export Word
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => onEdit(module)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            title="Edit"
          >
            <i className="fas fa-edit text-sm"></i>
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onCopy(module.id)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            title="Copy"
          >
            <i className="fas fa-copy text-sm"></i>
          </button>
          <button
            onClick={() => onDelete(module.id)}
            className="rounded-md p-2 text-red-500 hover:bg-red-100"
            title="Delete"
          >
            <i className="fas fa-trash text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModuleCard

