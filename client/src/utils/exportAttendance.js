import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

/**
 * Export Attendance to Excel
 */
export const exportAttendanceToExcel = (attendanceData, className, date) => {
  // Prepare data for Excel
  const excelData = attendanceData.map((record, index) => ({
    No: index + 1,
    NIS: record.student?.nis || record.student?.student_number || '-',
    'Nama Lengkap': record.student?.name || record.student?.nama_lengkap || '-',
    Kelas: className || '-',
    Tanggal: date || '-',
    Status: record.status === 'hadir' ? 'Hadir' :
            record.status === 'sakit' ? 'Sakit' :
            record.status === 'izin' ? 'Izin' : 'Alpha',
    Keterangan: record.keterangan || '-',
  }))

  // Create workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // NIS
    { wch: 25 }, // Nama
    { wch: 10 }, // Kelas
    { wch: 12 }, // Tanggal
    { wch: 10 }, // Status
    { wch: 30 }, // Keterangan
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Absensi')

  // Generate filename
  const fileName = `Absensi_${className}_${date}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * Export Attendance to PDF
 */
export const exportAttendanceToPDF = (attendanceData, className, date) => {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('DAFTAR ABSENSI SISWA', 105, 15, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(`Kelas: ${className || '-'}`, 15, 25)
  doc.text(`Tanggal: ${date || '-'}`, 15, 32)

  // Prepare table data
  const tableData = attendanceData.map((record, index) => [
    index + 1,
    record.student?.nis || record.student?.student_number || '-',
    record.student?.name || record.student?.nama_lengkap || '-',
    record.status === 'hadir' ? 'Hadir' :
    record.status === 'sakit' ? 'Sakit' :
    record.status === 'izin' ? 'Izin' : 'Alpha',
    record.keterangan || '-',
  ])

  // Add table
  doc.autoTable({
    startY: 40,
    head: [['No', 'NIS', 'Nama Lengkap', 'Status', 'Keterangan']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 25 },
      2: { cellWidth: 60 },
      3: { halign: 'center', cellWidth: 25 },
      4: { cellWidth: 60 },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  })

  // Add summary
  const yPosition = doc.lastAutoTable.finalY + 10
  const summary = {
    hadir: attendanceData.filter(r => r.status === 'hadir').length,
    sakit: attendanceData.filter(r => r.status === 'sakit').length,
    izin: attendanceData.filter(r => r.status === 'izin').length,
    alpha: attendanceData.filter(r => r.status === 'alpha').length,
  }

  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text('Ringkasan:', 15, yPosition)
  doc.setFont(undefined, 'normal')
  doc.text(`Hadir: ${summary.hadir}`, 15, yPosition + 7)
  doc.text(`Sakit: ${summary.sakit}`, 15, yPosition + 14)
  doc.text(`Izin: ${summary.izin}`, 60, yPosition + 7)
  doc.text(`Alpha: ${summary.alpha}`, 60, yPosition + 14)

  // Save PDF
  const fileName = `Absensi_${className}_${date}.pdf`
  doc.save(fileName)
}

/**
 * Print Attendance
 */
export const printAttendance = (attendanceData, className, date) => {
  const printWindow = window.open('', '_blank')
  
  const summary = {
    hadir: attendanceData.filter(r => r.status === 'hadir').length,
    sakit: attendanceData.filter(r => r.status === 'sakit').length,
    izin: attendanceData.filter(r => r.status === 'izin').length,
    alpha: attendanceData.filter(r => r.status === 'alpha').length,
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Absensi ${className} - ${date}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          text-align: center;
          font-size: 18px;
          margin-bottom: 5px;
        }
        .info {
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #3b82f6;
          color: white;
          text-align: center;
        }
        .summary {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .summary-item {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .summary-item strong {
          display: block;
          font-size: 12px;
          color: #666;
        }
        .summary-item span {
          display: block;
          font-size: 20px;
          font-weight: bold;
          margin-top: 5px;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>DAFTAR ABSENSI SISWA</h1>
      <div class="info">
        <p><strong>Kelas:</strong> ${className || '-'}</p>
        <p><strong>Tanggal:</strong> ${date || '-'}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 100px;">NIS</th>
            <th>Nama Lengkap</th>
            <th style="width: 80px;">Status</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${attendanceData.map((record, index) => `
            <tr>
              <td style="text-align: center;">${index + 1}</td>
              <td style="text-align: center;">${record.student?.nis || record.student?.student_number || '-'}</td>
              <td>${record.student?.name || record.student?.nama_lengkap || '-'}</td>
              <td style="text-align: center;">${
                record.status === 'hadir' ? 'Hadir' :
                record.status === 'sakit' ? 'Sakit' :
                record.status === 'izin' ? 'Izin' : 'Alpha'
              }</td>
              <td>${record.keterangan || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-item">
          <strong>Hadir</strong>
          <span style="color: #22c55e;">${summary.hadir}</span>
        </div>
        <div class="summary-item">
          <strong>Sakit</strong>
          <span style="color: #eab308;">${summary.sakit}</span>
        </div>
        <div class="summary-item">
          <strong>Izin</strong>
          <span style="color: #3b82f6;">${summary.izin}</span>
        </div>
        <div class="summary-item">
          <strong>Alpha</strong>
          <span style="color: #ef4444;">${summary.alpha}</span>
        </div>
      </div>

      <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Print
      </button>
      <button onclick="window.close()" style="margin-top: 20px; margin-left: 10px; padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Close
      </button>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

/**
 * Export Attendance Report (Summary) to Excel
 */
export const exportAttendanceReportToExcel = (reportData, className, period, summary) => {
  const excelData = reportData.map((student, index) => ({
    No: index + 1,
    NIS: student.nis || '-',
    'Nama Lengkap': student.name || '-',
    Kelas: className || '-',
    Periode: period || '-',
    'Total Catatan': student.total || 0,
    Hadir: student.hadir || 0,
    Sakit: student.sakit || 0,
    Izin: student.izin || 0,
    Alpha: student.alpha || 0,
    '% Hadir': `${student.hadirPercent || 0}%`
  }))

  if (summary) {
    excelData.push({
      No: '',
      NIS: '',
      'Nama Lengkap': 'TOTAL',
      Kelas: '',
      Periode: '',
      'Total Catatan': summary.totalRecords,
      Hadir: summary.totalHadir,
      Sakit: summary.totalSakit,
      Izin: summary.totalIzin,
      Alpha: summary.totalAlpha,
      '% Hadir': `${summary.avgPresent}%`
    })
  }

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(excelData)

  ws['!cols'] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 25 },
    { wch: 10 },
    { wch: 15 },
    { wch: 12 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 10 }
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Absensi')
  const fileName = `Rekap_Absensi_${className}_${period.replace(/\s+/g, '_')}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * Export Attendance Report (Summary) to PDF
 */
export const exportAttendanceReportToPDF = (reportData, className, period, summary) => {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('REKAP ABSENSI SISWA', 105, 15, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(`Kelas: ${className || '-'}`, 15, 25)
  doc.text(`Periode: ${period || '-'}`, 15, 32)

  const tableData = reportData.map((student, index) => [
    index + 1,
    student.nis || '-',
    student.name || '-',
    student.total || 0,
    student.hadir || 0,
    student.sakit || 0,
    student.izin || 0,
    student.alpha || 0,
    `${student.hadirPercent || 0}%`
  ])

  if (summary) {
    tableData.push([
      '',
      '',
      'TOTAL',
      summary.totalRecords,
      summary.totalHadir,
      summary.totalSakit,
      summary.totalIzin,
      summary.totalAlpha,
      `${summary.avgPresent}%`
    ])
  }

  doc.autoTable({
    startY: 40,
    head: [['No', 'NIS', 'Nama Lengkap', 'Total', 'Hadir', 'Sakit', 'Izin', 'Alpha', '% Hadir']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 20 },
      2: { cellWidth: 50 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'center', cellWidth: 15 },
      6: { halign: 'center', cellWidth: 15 },
      7: { halign: 'center', cellWidth: 15 },
      8: { halign: 'center', cellWidth: 20 }
    },
    styles: {
      fontSize: 8,
      cellPadding: 2
    }
  })

  if (summary) {
    const yPosition = doc.lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text('Ringkasan:', 15, yPosition)
    doc.setFont(undefined, 'normal')
    doc.text(`Total Siswa: ${summary.totalStudents}`, 15, yPosition + 7)
    doc.text(`Total Catatan: ${summary.totalRecords}`, 15, yPosition + 14)
    doc.text(`Rata-rata Kehadiran: ${summary.avgPresent}%`, 15, yPosition + 21)
  }

  const fileName = `Rekap_Absensi_${className}_${period.replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
}

