import React from 'react'

/**
 * ATP Selector Component
 * Allows user to select an existing ATP to auto-fill modul ajar data
 */
export const ATPSelector = ({ atpList, selectedATP, onSelectATP, onClearSelection }) => {
  const handleChange = (e) => {
    const atpId = e.target.value
    if (atpId) {
      const atp = atpList.find((a) => a.id === atpId)
      onSelectATP(atp)
    } else {
      onClearSelection()
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <i className="fas fa-link text-blue-600"></i>
        <h4 className="font-semibold text-blue-900">Pilih ATP (Opsional)</h4>
      </div>
      
      <p className="mb-3 text-sm text-blue-700">
        Gunakan ATP yang sudah ada untuk mengisi data otomatis, atau buat dari awal.
      </p>

      <select
        value={selectedATP?.id || ''}
        onChange={handleChange}
        className="w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">-- Buat dari awal (tanpa ATP) --</option>
        {atpList.map((atp) => (
          <option key={atp.id} value={atp.id}>
            {atp.judul} (Fase {atp.fase}, Kelas {atp.kelas})
          </option>
        ))}
      </select>

      {selectedATP && (
        <div className="mt-3 rounded-md border border-blue-300 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              <i className="fas fa-check-circle mr-1 text-green-600"></i>
              ATP Terpilih:
            </span>
            <button
              onClick={onClearSelection}
              className="text-xs text-red-600 hover:text-red-800"
            >
              <i className="fas fa-times mr-1"></i>
              Hapus Pilihan
            </button>
          </div>
          
          <div className="space-y-1 text-sm text-gray-700">
            <p className="font-medium">{selectedATP.judul}</p>
            <p className="text-xs text-gray-500">
              Fase {selectedATP.fase} • Kelas {selectedATP.kelas} • {selectedATP.alokasi_waktu} JP
            </p>
            <p className="text-xs text-gray-600 line-clamp-2">
              {selectedATP.capaian_pembelajaran}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ATPSelector

