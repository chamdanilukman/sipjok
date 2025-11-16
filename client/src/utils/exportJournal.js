import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

/**
 * Export Teaching Journal to Excel
 */
export const exportJournalToExcel = (journalData, teacherName, dateRange) => {
  // Prepare data for Excel
  const excelData = journalData.map((record, index) => ({
    No: index + 1,
    Tanggal: new Date(record.tanggal).toLocaleDateString('id-ID'),
    Kelas: record.classes?.name || '-',
    'Pertemuan Ke': record.pertemuan_ke || '-',
    'Materi Pokok': record.materi_pokok || '-',
    'Kegiatan Pembelajaran': record.kegiatan_pembelajaran || '-',
    'Metode': record.metode_pembelajaran || '-',
    Hadir: record.jumlah_hadir || 0,
    Sakit: record.jumlah_sakit || 0,
    Izin: record.jumlah_izin || 0,
    Alpha: record.jumlah_alpha || 0,
    'Catatan': record.catatan || '-',
  }))

  // Create workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // Tanggal
    { wch: 15 }, // Kelas
    { wch: 8 },  // Pertemuan Ke
    { wch: 35 }, // Materi Pokok
    { wch: 40 }, // Kegiatan
    { wch: 20 }, // Metode
    { wch: 7 },  // Hadir
    { wch: 7 },  // Sakit
    { wch: 7 },  // Izin
    { wch: 7 },  // Alpha
    { wch: 30 }, // Catatan
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Jurnal Mengajar')

  // Generate filename
  const fileName = `Jurnal_Mengajar_${teacherName}_${dateRange}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * Export Teaching Journal to PDF
 */
export const exportJournalToPDF = (journalData, teacherName, dateRange) => {
  const doc = new jsPDF('landscape')

  // Title
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('JURNAL MENGAJAR', 148, 15, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(`Guru: ${teacherName || '-'}`, 15, 25)
  doc.text(`Periode: ${dateRange || '-'}`, 15, 32)

  // Prepare table data
  const tableData = journalData.map((record, index) => [
    index + 1,
    new Date(record.tanggal).toLocaleDateString('id-ID'),
    record.classes?.name || '-',
    record.pertemuan_ke || '-',
    record.materi_pokok || '-',
    record.metode_pembelajaran || '-',
    `${record.jumlah_hadir || 0}/${record.jumlah_sakit || 0}/${record.jumlah_izin || 0}/${record.jumlah_alpha || 0}`,
    record.catatan || '-',
  ])

  // Add table
  doc.autoTable({
    startY: 40,
    head: [['No', 'Tanggal', 'Kelas', 'Pert.', 'Materi Pokok', 'Metode', 'H/S/I/A', 'Catatan']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 12 },
      4: { cellWidth: 70 },
      5: { cellWidth: 35 },
      6: { halign: 'center', cellWidth: 20 },
      7: { cellWidth: 45 },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
  })

  // Add summary
  const yPosition = doc.lastAutoTable.finalY + 10
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text(`Total Pertemuan: ${journalData.length}`, 15, yPosition)

  // Save PDF
  const fileName = `Jurnal_Mengajar_${teacherName}_${dateRange}.pdf`
  doc.save(fileName)
}

/**
 * Print Teaching Journal
 */
export const printJournal = (journalData, teacherName, dateRange) => {
  const printWindow = window.open('', '_blank')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Jurnal Mengajar ${teacherName}</title>
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
          font-size: 12px;
        }
        th, td {
          border: 1px solid #000;
          padding: 6px;
          text-align: left;
        }
        th {
          background-color: #3b82f6;
          color: white;
          text-align: center;
        }
        .summary {
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9fafb;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>JURNAL MENGAJAR</h1>
      <div class="info">
        <p><strong>Guru:</strong> ${teacherName || '-'}</p>
        <p><strong>Periode:</strong> ${dateRange || '-'}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 30px;">No</th>
            <th style="width: 80px;">Tanggal</th>
            <th style="width: 80px;">Kelas</th>
            <th style="width: 50px;">Pert</th>
            <th>Materi Pokok</th>
            <th style="width: 120px;">Metode</th>
            <th style="width: 40px;">H</th>
            <th style="width: 40px;">S</th>
            <th style="width: 40px;">I</th>
            <th style="width: 40px;">A</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          ${journalData.map((record, index) => `
            <tr>
              <td style="text-align: center;">${index + 1}</td>
              <td style="text-align: center;">${new Date(record.tanggal).toLocaleDateString('id-ID')}</td>
              <td style="text-align: center;">${record.classes?.name || '-'}</td>
              <td style="text-align: center;">${record.pertemuan_ke || '-'}</td>
              <td>${record.materi_pokok || '-'}</td>
              <td>${record.metode_pembelajaran || '-'}</td>
              <td style="text-align: center;">${record.jumlah_hadir || 0}</td>
              <td style="text-align: center;">${record.jumlah_sakit || 0}</td>
              <td style="text-align: center;">${record.jumlah_izin || 0}</td>
              <td style="text-align: center;">${record.jumlah_alpha || 0}</td>
              <td>${record.catatan || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary">
        <strong>Total Pertemuan:</strong> ${journalData.length}
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
 * Export Journal Report to Excel
 */
export const exportJournalReportToExcel = (reportData, className, period, summary) => {
  const excelData = reportData.map((item, index) => ({
    No: index + 1,
    'Materi Pokok': item.materi_pokok || '-',
    'Total Pertemuan': item.totalSessions || 0,
    'Metode Pembelajaran': item.metode.length > 0 ? item.metode.join(', ') : '-'
  }))

  if (summary) {
    excelData.push({
      'Materi Pokok': 'RINGKASAN',
      'Total Pertemuan': '',
      'Metode Pembelajaran': ''
    })
    excelData.push({
      'Materi Pokok': `Total Jurnal: ${summary.totalJournals}`,
      'Total Pertemuan': `Total Materi: ${summary.totalMateri}`,
      'Metode Pembelajaran': `Hari Mengajar: ${summary.uniqueDates}`
    })
    excelData.push({
      'Materi Pokok': `Total Hadir: ${summary.totalHadir}`,
      'Total Pertemuan': `Total Sakit: ${summary.totalSakit}`,
      'Metode Pembelajaran': `Total Izin: ${summary.totalIzin} | Total Alpha: ${summary.totalAlpha}`
    })
  }

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(excelData)

  ws['!cols'] = [
    { wch: 5 },
    { wch: 25 },
    { wch: 12 },
    { wch: 60 }
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Jurnal')

  const fileName = `Rekap_Jurnal_${className}_${period.replace(/\s+/g, '_')}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * Export Journal Report to PDF
 */
export const exportJournalReportToPDF = (reportData, className, period, summary) => {
  const doc = new jsPDF('landscape')

  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('REKAP JURNAL MENGAJAR', 148, 15, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(`Kelas: ${className || '-'}`, 15, 25)
  doc.text(`Periode: ${period || '-'}`, 15, 32)

  const tableData = reportData.map((item, index) => {
    const metodeText = item.metode.length > 0
      ? item.metode.join(', ')
      : '-'

    return [
      index + 1,
      item.materi_pokok || '-',
      item.totalSessions || 0,
      metodeText
    ]
  })

  doc.autoTable({
    startY: 40,
    head: [['No', 'Materi Pokok', 'Total Pertemuan', 'Metode Pembelajaran']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 120 },
      2: { halign: 'center', cellWidth: 30 },
      3: { halign: 'left', cellWidth: 115 }
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  })

  if (summary) {
    const yPosition = doc.lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text('RINGKASAN', 15, yPosition)

    doc.setFont(undefined, 'normal')
    doc.text(`Total Jurnal: ${summary.totalJournals}`, 15, yPosition + 7)
    doc.text(`Total Materi Pokok: ${summary.totalMateri}`, 15, yPosition + 14)
    doc.text(`Hari Mengajar: ${summary.uniqueDates}`, 15, yPosition + 21)

    doc.setFont(undefined, 'bold')
    doc.text('KEHADIRAN', 15, yPosition + 32)
    doc.setFont(undefined, 'normal')
    doc.text(`Hadir: ${summary.totalHadir} | Sakit: ${summary.totalSakit} | Izin: ${summary.totalIzin} | Alpha: ${summary.totalAlpha}`, 15, yPosition + 39)
  }

  const fileName = `Rekap_Jurnal_${className}_${period.replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
}

