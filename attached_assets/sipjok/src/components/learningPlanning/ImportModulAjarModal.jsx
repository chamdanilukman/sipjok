import React, { useState } from 'react'
import * as XLSX from 'xlsx'

/**
 * Modal for importing Modul Ajar from Excel
 * Supports template download with dropdowns for choices
 */
export const ImportModulAjarModal = ({ isOpen, onClose, onImport, teacherId }) => {
  const [file, setFile] = useState(null)
  const [previewData, setPreviewData] = useState([])
  const [importing, setImporting] = useState(false)

  const handleDownloadTemplate = () => {
    // Create workbook
    const wb = XLSX.utils.book_new()

    // Template data with example
    const templateData = [
      {
        'Judul': 'Contoh: Permainan Bola Kecil',
        'Mata Pelajaran': 'PJOK',
        'Fase': 'A',
        'Kelas': '1',
        'Alokasi Waktu (JP)': 2,
        'Capaian Pembelajaran': 'Siswa mampu melakukan gerak dasar lokomotor',
        'Tujuan Pembelajaran': 'Siswa dapat melempar dan menangkap bola dengan benar',
        '8 Dimensi Profil Lulusan (8DPL)': 'dpl5, dpl6, dpl7',
        'Praktik Pedagogis': 'Pembelajaran berbasis permainan',
        'Kemitraan': 'Orang tua, Komunitas olahraga',
        'Lingkungan Pembelajaran': 'Lapangan sekolah',
        'Digital Tools': 'Video tutorial, Aplikasi timer',
        'Topik Pertemuan 1': 'Pengenalan bola',
        'Fase Memahami 1': 'Siswa mengamati berbagai jenis bola',
        'Fase Mengaplikasi 1': 'Siswa mencoba melempar dan menangkap',
        'Fase Merefleksi 1': 'Siswa menceritakan pengalaman',
        'Asesmen': 'Diagnostik, Formatif',
        'Deskripsi Asesmen': 'Observasi gerak dasar',
        'Instrumen Asesmen': 'Checklist',
        'Media Pembelajaran': 'Bola plastik, Cone',
        'Sumber Belajar': 'Buku PJOK Kelas 1',
        'Diferensiasi': 'Konten: Ukuran bola berbeda; Proses: Jarak lempar disesuaikan',
        'Refleksi Guru': 'Siswa antusias, perlu lebih banyak waktu praktik',
        'Catatan Tambahan': 'Perhatikan keselamatan saat bermain',
        'Status': 'draft',
      },
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)

    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, // Judul
      { wch: 15 }, // Mata Pelajaran
      { wch: 8 },  // Fase
      { wch: 8 },  // Kelas
      { wch: 18 }, // Alokasi Waktu
      { wch: 50 }, // Capaian Pembelajaran
      { wch: 50 }, // Tujuan Pembelajaran
      { wch: 30 }, // Profil Pelajar Pancasila
      { wch: 30 }, // Praktik Pedagogis
      { wch: 30 }, // Kemitraan
      { wch: 30 }, // Lingkungan Pembelajaran
      { wch: 30 }, // Digital Tools
      { wch: 30 }, // Topik Pertemuan 1
      { wch: 50 }, // Fase Memahami 1
      { wch: 50 }, // Fase Mengaplikasi 1
      { wch: 50 }, // Fase Merefleksi 1
      { wch: 20 }, // Asesmen
      { wch: 40 }, // Deskripsi Asesmen
      { wch: 20 }, // Instrumen Asesmen
      { wch: 30 }, // Media Pembelajaran
      { wch: 30 }, // Sumber Belajar
      { wch: 50 }, // Diferensiasi
      { wch: 50 }, // Refleksi Guru
      { wch: 50 }, // Catatan Tambahan
      { wch: 12 }, // Status
    ]

    // Add data validation for dropdowns
    // Note: XLSX library has limited support for data validation
    // For full dropdown support, consider using exceljs library

    XLSX.utils.book_append_sheet(wb, ws, 'Modul Ajar')

    // Add instructions sheet
    const instructions = [
      { 'Kolom': 'Judul', 'Keterangan': 'Judul modul ajar (wajib diisi)', 'Contoh': 'Permainan Bola Kecil' },
      { 'Kolom': 'Mata Pelajaran', 'Keterangan': 'Mata pelajaran (default: PJOK)', 'Contoh': 'PJOK' },
      { 'Kolom': 'Fase', 'Keterangan': 'Fase kurikulum: A, B, atau C', 'Contoh': 'A' },
      { 'Kolom': 'Kelas', 'Keterangan': 'Kelas: 1-6', 'Contoh': '1' },
      { 'Kolom': 'Alokasi Waktu (JP)', 'Keterangan': 'Jumlah jam pelajaran (angka)', 'Contoh': '2' },
      { 'Kolom': 'Capaian Pembelajaran', 'Keterangan': 'Capaian pembelajaran (wajib diisi)', 'Contoh': 'Siswa mampu...' },
      { 'Kolom': 'Tujuan Pembelajaran', 'Keterangan': 'Tujuan pembelajaran, pisahkan dengan koma jika lebih dari 1', 'Contoh': 'Tujuan 1, Tujuan 2' },
      { 'Kolom': '8 Dimensi Profil Lulusan (8DPL)', 'Keterangan': 'Dimensi profil lulusan: dpl1-dpl8, pisahkan dengan koma. DPL1=Keimanan, DPL2=Kewargaan, DPL3=Penalaran Kritis, DPL4=Kreativitas, DPL5=Kolaborasi, DPL6=Kemandirian, DPL7=Kesehatan, DPL8=Komunikasi', 'Contoh': 'dpl5, dpl6, dpl7' },
      { 'Kolom': 'Praktik Pedagogis', 'Keterangan': 'Praktik pedagogis yang digunakan', 'Contoh': 'Pembelajaran berbasis permainan' },
      { 'Kolom': 'Kemitraan', 'Keterangan': 'Kemitraan dengan pihak lain', 'Contoh': 'Orang tua, Komunitas' },
      { 'Kolom': 'Lingkungan Pembelajaran', 'Keterangan': 'Lingkungan pembelajaran', 'Contoh': 'Lapangan sekolah' },
      { 'Kolom': 'Digital Tools', 'Keterangan': 'Tools digital, pisahkan dengan koma', 'Contoh': 'Video tutorial, Timer' },
      { 'Kolom': 'Topik Pertemuan 1', 'Keterangan': 'Topik pertemuan pertama', 'Contoh': 'Pengenalan bola' },
      { 'Kolom': 'Fase Memahami 1', 'Keterangan': 'Kegiatan fase memahami pertemuan 1', 'Contoh': 'Siswa mengamati...' },
      { 'Kolom': 'Fase Mengaplikasi 1', 'Keterangan': 'Kegiatan fase mengaplikasi pertemuan 1', 'Contoh': 'Siswa mencoba...' },
      { 'Kolom': 'Fase Merefleksi 1', 'Keterangan': 'Kegiatan fase merefleksi pertemuan 1', 'Contoh': 'Siswa menceritakan...' },
      { 'Kolom': 'Asesmen', 'Keterangan': 'Jenis asesmen, pisahkan dengan koma: Diagnostik, Formatif, Sumatif', 'Contoh': 'Diagnostik, Formatif' },
      { 'Kolom': 'Deskripsi Asesmen', 'Keterangan': 'Deskripsi asesmen', 'Contoh': 'Observasi gerak dasar' },
      { 'Kolom': 'Instrumen Asesmen', 'Keterangan': 'Instrumen asesmen', 'Contoh': 'Checklist' },
      { 'Kolom': 'Media Pembelajaran', 'Keterangan': 'Media pembelajaran, pisahkan dengan koma', 'Contoh': 'Bola, Cone' },
      { 'Kolom': 'Sumber Belajar', 'Keterangan': 'Sumber belajar, pisahkan dengan koma', 'Contoh': 'Buku PJOK, Video' },
      { 'Kolom': 'Diferensiasi', 'Keterangan': 'Strategi diferensiasi', 'Contoh': 'Konten: ...; Proses: ...' },
      { 'Kolom': 'Refleksi Guru', 'Keterangan': 'Refleksi guru setelah pembelajaran', 'Contoh': 'Siswa antusias...' },
      { 'Kolom': 'Catatan Tambahan', 'Keterangan': 'Catatan tambahan', 'Contoh': 'Perhatikan keselamatan' },
      { 'Kolom': 'Status', 'Keterangan': 'Status: draft, review, approved, archived', 'Contoh': 'draft' },
    ]

    const wsInstructions = XLSX.utils.json_to_sheet(instructions)
    wsInstructions['!cols'] = [{ wch: 25 }, { wch: 60 }, { wch: 40 }]
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instruksi')

    // Download
    XLSX.writeFile(wb, 'Template_Modul_Ajar.xlsx')
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)

    // Read and preview
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        setPreviewData(jsonData)
      } catch (error) {
        alert('Error membaca file: ' + error.message)
      }
    }
    reader.readAsArrayBuffer(selectedFile)
  }

  const parseModulData = (row) => {
    // Parse tujuan pembelajaran
    const tujuanText = row['Tujuan Pembelajaran'] || ''
    const tujuanArray = tujuanText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t)
      .map((text, index) => ({ id: Date.now() + index, text }))

    // Parse profil lulusan (8DPL)
    const profilText = row['8 Dimensi Profil Lulusan (8DPL)'] || ''
    const profilArray = profilText
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p)

    // Parse digital tools
    const toolsText = row['Digital Tools'] || ''
    const toolsArray = toolsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t)
      .map((name, index) => ({ id: Date.now() + index, name }))

    // Parse skenario pembelajaran (pertemuan 1)
    const skenario = [
      {
        id: Date.now(),
        pertemuan: 1,
        topik: row['Topik Pertemuan 1'] || '',
        fase_memahami: row['Fase Memahami 1'] || '',
        fase_mengaplikasi: row['Fase Mengaplikasi 1'] || '',
        fase_merefleksi: row['Fase Merefleksi 1'] || '',
      },
    ]

    // Parse asesmen
    const asesmenText = row['Asesmen'] || ''
    const asesmen = {
      diagnostik: asesmenText.toLowerCase().includes('diagnostik'),
      formatif: asesmenText.toLowerCase().includes('formatif'),
      sumatif: asesmenText.toLowerCase().includes('sumatif'),
      deskripsi: row['Deskripsi Asesmen'] || '',
      instrumen: row['Instrumen Asesmen'] || '',
      rubrik: [],
    }

    // Parse media files
    const mediaText = row['Media Pembelajaran'] || ''
    const mediaArray = mediaText
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m)
      .map((name, index) => ({ id: Date.now() + index, name, type: 'other' }))

    // Parse sumber belajar
    const sumberText = row['Sumber Belajar'] || ''
    const sumberUrls = sumberText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s)
      .map((url, index) => ({ id: Date.now() + index, url }))

    return {
      title: row['Judul'] || '',
      mata_pelajaran: row['Mata Pelajaran'] || 'PJOK',
      fase: row['Fase'] || 'A',
      kelas: String(row['Kelas'] || '1'),
      alokasi_waktu: parseInt(row['Alokasi Waktu (JP)']) || 1,
      capaian_pembelajaran: row['Capaian Pembelajaran'] || '',
      tujuan_pembelajaran: tujuanArray.length > 0 ? tujuanArray : [{ id: Date.now(), text: '' }],
      profil_lulusan: profilArray,
      praktik_pedagogis: row['Praktik Pedagogis'] || '',
      kemitraan: row['Kemitraan'] || '',
      lingkungan_pembelajaran: row['Lingkungan Pembelajaran'] || '',
      digital_tools: toolsArray,
      skenario_pembelajaran: skenario,
      asesmen: asesmen,
      media_files: mediaArray,
      sumber_belajar: {
        urls: sumberUrls,
        lkpd: '',
      },
      diferensiasi: {
        strategi: row['Diferensiasi'] || '',
      },
      refleksi_guru: row['Refleksi Guru'] || '',
      catatan_tambahan: row['Catatan Tambahan'] || '',
      status: row['Status'] || 'draft',
    }
  }

  const handleImport = async () => {
    if (previewData.length === 0) {
      alert('Tidak ada data untuk diimport')
      return
    }

    setImporting(true)
    try {
      const modulDataArray = previewData.map(parseModulData)
      await onImport(modulDataArray)
      handleClose()
    } catch (error) {
      alert('Error saat import: ' + error.message)
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreviewData([])
    setImporting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Import Modul Ajar dari Excel</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="mb-6 space-y-4">
          {/* Download Template */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">
              <i className="fas fa-info-circle mr-2"></i>
              Langkah 1: Download Template
            </h3>
            <p className="mb-3 text-sm text-blue-800">
              Download template Excel, isi data modul ajar sesuai kolom yang tersedia
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <i className="fas fa-download mr-2"></i>
              Download Template Excel
            </button>
          </div>

          {/* Upload File */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">
              <i className="fas fa-upload mr-2"></i>
              Langkah 2: Upload File
            </h3>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-gray-300 p-2"
            />
          </div>

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">
                <i className="fas fa-check-circle mr-2"></i>
                Preview Data ({previewData.length} modul)
              </h3>
              <div className="max-h-60 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="p-2 text-left">No</th>
                      <th className="p-2 text-left">Judul</th>
                      <th className="p-2 text-left">Fase</th>
                      <th className="p-2 text-left">Kelas</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t border-green-200">
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">{row['Judul']}</td>
                        <td className="p-2">{row['Fase']}</td>
                        <td className="p-2">{row['Kelas']}</td>
                        <td className="p-2">{row['Status'] || 'draft'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={previewData.length === 0 || importing}
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            {importing ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Importing...
              </>
            ) : (
              <>
                <i className="fas fa-file-import mr-2"></i>
                Import {previewData.length} Modul
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImportModulAjarModal

