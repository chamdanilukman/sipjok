import * as XLSX from 'xlsx'

/**
 * Parse CSV/Excel file untuk calendar events
 * Expected columns: judul, kategori, tanggal_mulai, tanggal_selesai, jam_mulai, jam_selesai, lokasi, deskripsi
 */
export const parseCalendarFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Validate and transform data
        const events = jsonData.map((row, index) => {
          // Validate required fields
          if (!row.judul || !row.tanggal_mulai) {
            throw new Error(`Baris ${index + 2}: Judul dan Tanggal Mulai wajib diisi`)
          }

          // Validate kategori
          const validKategori = ['pembelajaran', 'ujian', 'kegiatan', 'libur', 'kurikulum']
          const kategori = (row.kategori || 'kegiatan').toLowerCase()
          if (!validKategori.includes(kategori)) {
            throw new Error(`Baris ${index + 2}: Kategori tidak valid. Pilihan: ${validKategori.join(', ')}`)
          }

          // Parse dates
          let tanggalMulai, tanggalSelesai

          // Handle Excel date serial number or string date
          if (typeof row.tanggal_mulai === 'number') {
            tanggalMulai = excelDateToJSDate(row.tanggal_mulai)
          } else {
            tanggalMulai = parseDate(row.tanggal_mulai)
          }

          if (row.tanggal_selesai) {
            if (typeof row.tanggal_selesai === 'number') {
              tanggalSelesai = excelDateToJSDate(row.tanggal_selesai)
            } else {
              tanggalSelesai = parseDate(row.tanggal_selesai)
            }
          } else {
            tanggalSelesai = tanggalMulai
          }

          return {
            judul: String(row.judul).trim(),
            deskripsi: row.deskripsi ? String(row.deskripsi).trim() : '',
            kategori: kategori,
            tanggal_mulai: tanggalMulai,
            tanggal_selesai: tanggalSelesai,
            jam_mulai: row.jam_mulai ? String(row.jam_mulai).trim() : '',
            jam_selesai: row.jam_selesai ? String(row.jam_selesai).trim() : '',
            lokasi: row.lokasi ? String(row.lokasi).trim() : '',
          }
        })

        resolve(events)
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => {
      reject(new Error('Gagal membaca file'))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * Convert Excel date serial number to JavaScript Date
 */
const excelDateToJSDate = (serial) => {
  const utc_days = Math.floor(serial - 25569)
  const utc_value = utc_days * 86400
  const date_info = new Date(utc_value * 1000)

  const year = date_info.getUTCFullYear()
  const month = String(date_info.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date_info.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Parse date string to YYYY-MM-DD format
 */
const parseDate = (dateStr) => {
  if (!dateStr) return null

  // Try parsing various date formats
  const str = String(dateStr).trim()

  // Format: YYYY-MM-DD (already correct)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str
  }

  // Format: DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [day, month, year] = str.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Format: DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(str)) {
    const [day, month, year] = str.split('-')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Try parsing with Date constructor
  const date = new Date(str)
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  throw new Error(`Format tanggal tidak valid: ${str}. Gunakan format: YYYY-MM-DD atau DD/MM/YYYY`)
}

/**
 * Generate template CSV untuk download
 */
export const generateCalendarTemplate = () => {
  const template = [
    ['judul', 'kategori', 'tanggal_mulai', 'tanggal_selesai', 'jam_mulai', 'jam_selesai', 'lokasi', 'deskripsi'],
    ['Upacara Bendera', 'kegiatan', '2025-01-06', '2025-01-06', '07:00', '08:00', 'Lapangan', 'Upacara bendera rutin setiap Senin'],
    ['Ujian Tengah Semester', 'ujian', '2025-02-10', '2025-02-14', '08:00', '10:00', 'Ruang Kelas', 'UTS Semester Genap'],
    ['Libur Tahun Baru Imlek', 'libur', '2025-01-29', '2025-01-29', '', '', '', 'Libur nasional Tahun Baru Imlek'],
    ['Penyusunan RPP', 'pembelajaran', '2025-01-15', '2025-01-15', '13:00', '15:00', 'Ruang Guru', 'Workshop penyusunan RPP'],
    ['Review Kurikulum', 'kurikulum', '2025-01-20', '2025-01-20', '09:00', '12:00', 'Aula', 'Review dan evaluasi kurikulum'],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(template)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Kalender')

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // judul
    { wch: 15 }, // kategori
    { wch: 15 }, // tanggal_mulai
    { wch: 15 }, // tanggal_selesai
    { wch: 10 }, // jam_mulai
    { wch: 10 }, // jam_selesai
    { wch: 15 }, // lokasi
    { wch: 40 }, // deskripsi
  ]

  return workbook
}

/**
 * Download template as Excel file
 */
export const downloadCalendarTemplate = () => {
  const workbook = generateCalendarTemplate()
  XLSX.writeFile(workbook, 'Template_Kalender_Akademik.xlsx')
}

/**
 * Download template as CSV file
 */
export const downloadCalendarTemplateCSV = () => {
  const template = [
    ['judul', 'kategori', 'tanggal_mulai', 'tanggal_selesai', 'jam_mulai', 'jam_selesai', 'lokasi', 'deskripsi'],
    ['Upacara Bendera', 'kegiatan', '2025-01-06', '2025-01-06', '07:00', '08:00', 'Lapangan', 'Upacara bendera rutin setiap Senin'],
    ['Ujian Tengah Semester', 'ujian', '2025-02-10', '2025-02-14', '08:00', '10:00', 'Ruang Kelas', 'UTS Semester Genap'],
    ['Libur Tahun Baru Imlek', 'libur', '2025-01-29', '2025-01-29', '', '', '', 'Libur nasional Tahun Baru Imlek'],
  ]

  const csvContent = template.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', 'Template_Kalender_Akademik.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Validate events before import
 */
export const validateEvents = (events) => {
  const errors = []

  events.forEach((event, index) => {
    // Check required fields
    if (!event.judul || event.judul.trim() === '') {
      errors.push(`Baris ${index + 2}: Judul tidak boleh kosong`)
    }

    if (!event.tanggal_mulai) {
      errors.push(`Baris ${index + 2}: Tanggal mulai tidak boleh kosong`)
    }

    // Validate date format
    if (event.tanggal_mulai && !/^\d{4}-\d{2}-\d{2}$/.test(event.tanggal_mulai)) {
      errors.push(`Baris ${index + 2}: Format tanggal mulai tidak valid (gunakan YYYY-MM-DD)`)
    }

    if (event.tanggal_selesai && !/^\d{4}-\d{2}-\d{2}$/.test(event.tanggal_selesai)) {
      errors.push(`Baris ${index + 2}: Format tanggal selesai tidak valid (gunakan YYYY-MM-DD)`)
    }

    // Validate time format if provided
    if (event.jam_mulai && !/^\d{2}:\d{2}$/.test(event.jam_mulai)) {
      errors.push(`Baris ${index + 2}: Format jam mulai tidak valid (gunakan HH:MM)`)
    }

    if (event.jam_selesai && !/^\d{2}:\d{2}$/.test(event.jam_selesai)) {
      errors.push(`Baris ${index + 2}: Format jam selesai tidak valid (gunakan HH:MM)`)
    }

    // Validate date range
    if (event.tanggal_mulai && event.tanggal_selesai && event.tanggal_mulai > event.tanggal_selesai) {
      errors.push(`Baris ${index + 2}: Tanggal mulai harus lebih awal dari tanggal selesai`)
    }
  })

  return errors
}

export default {
  parseCalendarFile,
  generateCalendarTemplate,
  downloadCalendarTemplate,
  downloadCalendarTemplateCSV,
  validateEvents,
}
