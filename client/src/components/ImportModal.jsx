import { useState } from 'react'
import * as XLSX from 'xlsx'

/**
 * Import Modal Component
 * Supports importing Classes and Students from Excel/CSV
 */
export const ImportModal = ({ isOpen, onClose, onImport, type = 'students' }) => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)

    // Read and preview file
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)

        setPreview(jsonData.slice(0, 5)) // Show first 5 rows
      } catch (err) {
        setError('Error reading file: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(selectedFile)
  }

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)

          // Call onImport callback with data
          await onImport(jsonData)

          // Close modal on success
          handleClose()
        } catch (err) {
          setError('Error importing data: ' + err.message)
        } finally {
          setLoading(false)
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (err) {
      setError('Error processing file: ' + err.message)
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setError(null)
    onClose()
  }

  const downloadTemplate = () => {
    let template
    let filename

    if (type === 'students') {
      template = [
        {
          'Kelas': '1A',
          'Nama': 'Ahmad Fauzi',
          'NIS': '12345',
          'NISN': '0012345678',
          'Tempat Lahir': 'Jakarta',
          'Tanggal Lahir': '2015-01-15',
          'Jenis Kelamin': 'Laki-laki',
          'Agama': 'Islam',
        },
        {
          'Kelas': '1A',
          'Nama': 'Siti Nurhaliza',
          'NIS': '12346',
          'NISN': '0012345679',
          'Tempat Lahir': 'Bandung',
          'Tanggal Lahir': '2015-03-20',
          'Jenis Kelamin': 'Perempuan',
          'Agama': 'Islam',
        },
        {
          'Kelas': '2B',
          'Nama': 'Budi Santoso',
          'NIS': '12347',
          'NISN': '0012345680',
          'Tempat Lahir': 'Surabaya',
          'Tanggal Lahir': '2014-05-10',
          'Jenis Kelamin': 'Laki-laki',
          'Agama': 'Kristen',
        },
      ]
      filename = 'template_import_siswa.xlsx'
    } else {
      template = [
        {
          'Nama Kelas': 'Kelas 1A',
          'Tingkat': 1,
          'Tahun Ajaran': '2024/2025',
          'Jumlah Siswa': 25,
          'Wali Kelas': 'Ibu Siti',
          'Ruang Kelas': 'R101',
        },
        {
          'Nama Kelas': 'Kelas 1B',
          'Tingkat': 1,
          'Tahun Ajaran': '2024/2025',
          'Jumlah Siswa': 24,
          'Wali Kelas': 'Ibu Ani',
          'Ruang Kelas': 'R102',
        },
      ]
      filename = 'template_import_kelas.xlsx'
    }

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, filename)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            <i className={`fas fa-${type === 'students' ? 'users' : 'school'} mr-2 text-blue-600`}></i>
            Import {type === 'students' ? 'Siswa' : 'Kelas'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">
              <i className="fas fa-info-circle mr-2"></i>
              Petunjuk Import
            </h3>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
              <li>Download template Excel dengan klik tombol "Download Template"</li>
              <li>Isi data {type === 'students' ? 'siswa' : 'kelas'} sesuai format template</li>
              <li>Upload file Excel yang sudah diisi</li>
              <li>Preview data akan muncul di bawah</li>
              <li>Klik "Import" untuk menyimpan data</li>
            </ol>
          </div>

          {/* Download Template Button */}
          <button
            onClick={downloadTemplate}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            <i className="fas fa-download mr-2"></i>
            Download Template Excel
          </button>

          {/* File Upload */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              <i className="fas fa-file-excel mr-2 text-green-600"></i>
              Upload File Excel/CSV
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              Format yang didukung: .xlsx, .xls, .csv
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </p>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                <i className="fas fa-eye mr-2 text-blue-600"></i>
                Preview Data (5 baris pertama)
              </h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {Object.values(row).map((value, vidx) => (
                          <td key={vidx} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Total data yang akan diimport: <strong>{preview.length}</strong> baris
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
            disabled={loading}
          >
            <i className="fas fa-times mr-2"></i>
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Importing...
              </>
            ) : (
              <>
                <i className="fas fa-upload mr-2"></i>
                Import Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImportModal

