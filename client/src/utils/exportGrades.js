import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

/**
 * Export Grades to Excel
 */
export const exportGradesToExcel = (gradesData, className, semester) => {
  // Prepare data for Excel
  const excelData = gradesData.map((record, index) => ({
    No: index + 1,
    NIS: record.student?.nis || '-',
    'Nama Lengkap': record.student?.nama_lengkap || '-',
    Kelas: className || '-',
    Semester: semester || '-',
    'Aspek Pengetahuan': record.pengetahuan || '-',
    'Aspek Keterampilan': record.keterampilan || '-',
    'Aspek Sikap': record.sikap || '-',
    'Nilai Akhir': record.nilai_akhir || '-',
    Predikat: record.predikat || '-',
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
    { wch: 10 }, // Semester
    { wch: 15 }, // Pengetahuan
    { wch: 15 }, // Keterampilan
    { wch: 12 }, // Sikap
    { wch: 12 }, // Nilai Akhir
    { wch: 10 }, // Predikat
    { wch: 30 }, // Keterangan
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Nilai')

  // Generate filename
  const fileName = `Nilai_${className}_Semester_${semester}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * Export Grades to PDF
 */
export const exportGradesToPDF = (gradesData, className, semester) => {
  const doc = new jsPDF('landscape')

  // Title
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('DAFTAR NILAI SISWA', 148, 15, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(`Kelas: ${className || '-'}`, 15, 25)
  doc.text(`Semester: ${semester || '-'}`, 15, 32)

  // Prepare table data
  const tableData = gradesData.map((record, index) => [
    index + 1,
    record.student?.nis || '-',
    record.student?.nama_lengkap || '-',
    record.pengetahuan || '-',
    record.keterampilan || '-',
    record.sikap || '-',
    record.nilai_akhir || '-',
    record.predikat || '-',
  ])

  // Add table
  doc.autoTable({
    startY: 40,
    head: [['No', 'NIS', 'Nama Lengkap', 'Pengetahuan', 'Keterampilan', 'Sikap', 'Nilai Akhir', 'Predikat']],
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
      4: { halign: 'center', cellWidth: 25 },
      5: { halign: 'center', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 25 },
      7: { halign: 'center', cellWidth: 20 },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  })

  // Add summary
  const yPosition = doc.lastAutoTable.finalY + 10
  const avgPengetahuan = (gradesData.reduce((sum, r) => sum + (parseFloat(r.pengetahuan) || 0), 0) / gradesData.length).toFixed(2)
  const avgKeterampilan = (gradesData.reduce((sum, r) => sum + (parseFloat(r.keterampilan) || 0), 0) / gradesData.length).toFixed(2)
  const avgNilaiAkhir = (gradesData.reduce((sum, r) => sum + (parseFloat(r.nilai_akhir) || 0), 0) / gradesData.length).toFixed(2)

  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text('Rata-rata Kelas:', 15, yPosition)
  doc.setFont(undefined, 'normal')
  doc.text(`Pengetahuan: ${avgPengetahuan}`, 15, yPosition + 7)
  doc.text(`Keterampilan: ${avgKeterampilan}`, 70, yPosition + 7)
  doc.text(`Nilai Akhir: ${avgNilaiAkhir}`, 130, yPosition + 7)

  // Save PDF
  const fileName = `Nilai_${className}_Semester_${semester}.pdf`
  doc.save(fileName)
}

/**
 * Print Grades
 */
export const printGrades = (gradesData, className, semester) => {
  const printWindow = window.open('', '_blank')
  
  const avgPengetahuan = (gradesData.reduce((sum, r) => sum + (parseFloat(r.pengetahuan) || 0), 0) / gradesData.length).toFixed(2)
  const avgKeterampilan = (gradesData.reduce((sum, r) => sum + (parseFloat(r.keterampilan) || 0), 0) / gradesData.length).toFixed(2)
  const avgNilaiAkhir = (gradesData.reduce((sum, r) => sum + (parseFloat(r.nilai_akhir) || 0), 0) / gradesData.length).toFixed(2)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nilai ${className} - Semester ${semester}</title>
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
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9fafb;
        }
        .summary h3 {
          margin-top: 0;
          margin-bottom: 10px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
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
          color: #3b82f6;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>DAFTAR NILAI SISWA</h1>
      <div class="info">
        <p><strong>Kelas:</strong> ${className || '-'}</p>
        <p><strong>Semester:</strong> ${semester || '-'}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 100px;">NIS</th>
            <th>Nama Lengkap</th>
            <th style="width: 100px;">Pengetahuan</th>
            <th style="width: 100px;">Keterampilan</th>
            <th style="width: 80px;">Sikap</th>
            <th style="width: 100px;">Nilai Akhir</th>
            <th style="width: 80px;">Predikat</th>
          </tr>
        </thead>
        <tbody>
          ${gradesData.map((record, index) => `
            <tr>
              <td style="text-align: center;">${index + 1}</td>
              <td style="text-align: center;">${record.student?.nis || '-'}</td>
              <td>${record.student?.nama_lengkap || '-'}</td>
              <td style="text-align: center;">${record.pengetahuan || '-'}</td>
              <td style="text-align: center;">${record.keterampilan || '-'}</td>
              <td style="text-align: center;">${record.sikap || '-'}</td>
              <td style="text-align: center;">${record.nilai_akhir || '-'}</td>
              <td style="text-align: center;">${record.predikat || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary">
        <h3>Rata-rata Kelas</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <strong>Pengetahuan</strong>
            <span>${avgPengetahuan}</span>
          </div>
          <div class="summary-item">
            <strong>Keterampilan</strong>
            <span>${avgKeterampilan}</span>
          </div>
          <div class="summary-item">
            <strong>Nilai Akhir</strong>
            <span>${avgNilaiAkhir}</span>
          </div>
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

