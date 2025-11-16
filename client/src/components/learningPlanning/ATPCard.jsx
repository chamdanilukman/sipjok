import React from 'react'

/**
 * ATP Card Component
 * Displays an ATP in card format with actions
 */
export const ATPCard = ({ atp, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getFaseColor = (fase) => {
    const colors = {
      A: 'bg-blue-100 text-blue-800',
      B: 'bg-green-100 text-green-800',
      C: 'bg-purple-100 text-purple-800',
    }
    return colors[fase] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="p-5">
        {/* Fase Badge */}
        <div className="mb-3 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getFaseColor(atp.fase)}`}>
            <i className="fas fa-layer-group text-xs"></i>
            Fase {atp.fase}
          </span>
          <span className="text-xs font-medium text-gray-500">Kelas {atp.kelas}</span>
        </div>

        {/* Title */}
        <h4 className="mb-2 text-base font-semibold text-gray-900 line-clamp-2">
          {atp.judul}
        </h4>

        {/* Metadata */}
        <div className="space-y-1 text-sm text-gray-500">
          <p>
            <i className="fas fa-book mr-2 w-4 text-gray-400"></i>
            {atp.mata_pelajaran}
          </p>
          <p>
            <i className="fas fa-clock mr-2 w-4 text-gray-400"></i>
            {atp.alokasi_waktu} JP
          </p>
          <p>
            <i className="fas fa-list mr-2 w-4 text-gray-400"></i>
            {atp.tujuan_pembelajaran?.length || 0} Tujuan Pembelajaran
          </p>
        </div>

        {/* Capaian Pembelajaran Preview */}
        <p className="mt-3 text-xs text-gray-600 line-clamp-2">
          {atp.capaian_pembelajaran}
        </p>

        {/* Date */}
        <p className="mt-3 text-xs text-gray-400">
          <i className="fas fa-calendar mr-1"></i>
          {formatDate(atp.created_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 border-t border-gray-100 bg-gray-50 p-3">
        <button
          onClick={() => onEdit(atp)}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
          title="Edit"
        >
          <i className="fas fa-edit text-sm"></i>
        </button>
        <button
          onClick={() => onDelete(atp.id)}
          className="rounded-md p-2 text-red-500 hover:bg-red-100"
          title="Delete"
        >
          <i className="fas fa-trash text-sm"></i>
        </button>
      </div>
    </div>
  )
}

export default ATPCard

