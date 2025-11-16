import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Export Modul Ajar to PDF
 * Generates a comprehensive PDF document with all 7 sections
 */
export const exportModulAjarToPDF = (modulData) => {
  const doc = new jsPDF()
  let yPosition = 20

  // Helper function to add text with word wrap
  const addText = (text, x, y, maxWidth = 170) => {
    const lines = doc.splitTextToSize(text || '-', maxWidth)
    doc.text(lines, x, y)
    return y + (lines.length * 7)
  }

  // Helper function to add section header
  const addSectionHeader = (title, y) => {
    doc.setFillColor(59, 130, 246) // Blue
    doc.rect(10, y - 5, 190, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text(title, 15, y + 2)
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'normal')
    return y + 12
  }

  // ===== COVER PAGE =====
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('MODUL AJAR', 105, 40, { align: 'center' })
  doc.text('PENDIDIKAN JASMANI, OLAHRAGA, DAN KESEHATAN', 105, 50, { align: 'center' })
  
  doc.setFontSize(16)
  yPosition = 70
  yPosition = addText(modulData.title || 'Untitled', 105, yPosition, 170)
  yPosition += 10

  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(`Fase ${modulData.fase} - Kelas ${modulData.kelas}`, 105, yPosition, { align: 'center' })
  yPosition += 10
  doc.text(`Alokasi Waktu: ${modulData.alokasi_waktu} JP`, 105, yPosition, { align: 'center' })
  yPosition += 10
  doc.text(`Status: ${modulData.status?.toUpperCase()}`, 105, yPosition, { align: 'center' })

  // Footer
  doc.setFontSize(10)
  doc.text(`Dibuat: ${new Date(modulData.created_at).toLocaleDateString('id-ID')}`, 105, 280, { align: 'center' })

  // ===== PAGE 2: INFORMASI DASAR =====
  doc.addPage()
  yPosition = 20
  yPosition = addSectionHeader('1. INFORMASI DASAR', yPosition)

  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text('Judul Modul:', 15, yPosition)
  doc.setFont(undefined, 'normal')
  yPosition = addText(modulData.title, 15, yPosition + 7)
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('Mata Pelajaran:', 15, yPosition)
  doc.setFont(undefined, 'normal')
  yPosition = addText(modulData.mata_pelajaran, 15, yPosition + 7)
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('Capaian Pembelajaran (CP):', 15, yPosition)
  doc.setFont(undefined, 'normal')
  yPosition = addText(modulData.capaian_pembelajaran, 15, yPosition + 7)
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('Tujuan Pembelajaran (TP):', 15, yPosition)
  yPosition += 7
  doc.setFont(undefined, 'normal')
  
  if (modulData.tujuan_pembelajaran && modulData.tujuan_pembelajaran.length > 0) {
    modulData.tujuan_pembelajaran.forEach((tp, index) => {
      yPosition = addText(`${index + 1}. ${tp.text || tp}`, 20, yPosition)
      yPosition += 2
    })
  } else {
    yPosition = addText('-', 20, yPosition)
  }
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('Profil Pelajar Pancasila:', 15, yPosition)
  yPosition += 7
  doc.setFont(undefined, 'normal')
  
  if (modulData.profil_lulusan && modulData.profil_lulusan.length > 0) {
    yPosition = addText(modulData.profil_lulusan.join(', '), 20, yPosition)
  } else {
    yPosition = addText('-', 20, yPosition)
  }

  // ===== PAGE 3: DESAIN PEMBELAJARAN =====
  doc.addPage()
  yPosition = 20
  yPosition = addSectionHeader('2. DESAIN PEMBELAJARAN', yPosition)

  doc.setFont(undefined, 'bold')
  doc.text('Praktik Pedagogis:', 15, yPosition)
  doc.setFont(undefined, 'normal')
  yPosition = addText(modulData.praktik_pedagogis || '-', 15, yPosition + 7)
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('Kemitraan:', 15, yPosition)
  doc.setFont(undefined, 'normal')
  yPosition = addText(modulData.kemitraan || '-', 15, yPosition + 7)
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('Lingkungan Pembelajaran:', 15, yPosition)
  doc.setFont(undefined, 'normal')
  yPosition = addText(modulData.lingkungan_pembelajaran || '-', 15, yPosition + 7)
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('Digital Tools:', 15, yPosition)
  yPosition += 7
  doc.setFont(undefined, 'normal')
  
  if (modulData.digital_tools && modulData.digital_tools.length > 0) {
    yPosition = addText(modulData.digital_tools.join(', '), 20, yPosition)
  } else {
    yPosition = addText('-', 20, yPosition)
  }

  // ===== PAGE 4: SKENARIO PEMBELAJARAN =====
  doc.addPage()
  yPosition = 20
  yPosition = addSectionHeader('3. SKENARIO PEMBELAJARAN', yPosition)

  if (modulData.skenario_pembelajaran && modulData.skenario_pembelajaran.length > 0) {
    modulData.skenario_pembelajaran.forEach((pertemuan, index) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFont(undefined, 'bold')
      doc.text(`Pertemuan ${pertemuan.pertemuan || index + 1}: ${pertemuan.topik || 'Untitled'}`, 15, yPosition)
      yPosition += 7
      doc.setFont(undefined, 'normal')

      doc.setFont(undefined, 'bold')
      doc.text('Fase Memahami:', 20, yPosition)
      doc.setFont(undefined, 'normal')
      yPosition = addText(pertemuan.fase_memahami || '-', 20, yPosition + 7, 165)
      yPosition += 3

      doc.setFont(undefined, 'bold')
      doc.text('Fase Mengaplikasi:', 20, yPosition)
      doc.setFont(undefined, 'normal')
      yPosition = addText(pertemuan.fase_mengaplikasi || '-', 20, yPosition + 7, 165)
      yPosition += 3

      doc.setFont(undefined, 'bold')
      doc.text('Fase Merefleksi:', 20, yPosition)
      doc.setFont(undefined, 'normal')
      yPosition = addText(pertemuan.fase_merefleksi || '-', 20, yPosition + 7, 165)
      yPosition += 8
    })
  } else {
    yPosition = addText('Belum ada skenario pembelajaran', 15, yPosition)
  }

  // ===== PAGE 5: ASESMEN =====
  doc.addPage()
  yPosition = 20
  yPosition = addSectionHeader('4. ASESMEN', yPosition)

  const asesmen = modulData.asesmen || {}

  doc.setFont(undefined, 'bold')
  doc.text('Jenis Asesmen:', 15, yPosition)
  yPosition += 7
  doc.setFont(undefined, 'normal')
  
  const jenisAsesmen = []
  if (asesmen.diagnostik) jenisAsesmen.push('Diagnostik')
  if (asesmen.formatif) jenisAsesmen.push('Formatif')
  if (asesmen.sumatif) jenisAsesmen.push('Sumatif')
  
  yPosition = addText(jenisAsesmen.length > 0 ? jenisAsesmen.join(', ') : '-', 20, yPosition)
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('Deskripsi:', 15, yPosition)
  doc.setFont(undefined, 'normal')
  yPosition = addText(asesmen.deskripsi || '-', 15, yPosition + 7)
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('Instrumen:', 15, yPosition)
  doc.setFont(undefined, 'normal')
  yPosition = addText(asesmen.instrumen || '-', 15, yPosition + 7)
  yPosition += 5

  // Rubrik table
  if (asesmen.rubrik && asesmen.rubrik.length > 0) {
    doc.setFont(undefined, 'bold')
    doc.text('Rubrik Penilaian:', 15, yPosition)
    yPosition += 7

    const tableData = asesmen.rubrik.map(r => [
      r.kriteria || '-',
      r.mb || '-',
      r.b || '-',
      r.bsh || '-'
    ])

    doc.autoTable({
      startY: yPosition,
      head: [['Kriteria', 'MB', 'B', 'BSH']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 15, right: 15 },
    })

    yPosition = doc.lastAutoTable.finalY + 10
  }

  // ===== PAGE 6: MEDIA & SUMBER =====
  doc.addPage()
  yPosition = 20
  yPosition = addSectionHeader('5. MEDIA & SUMBER BELAJAR', yPosition)

  doc.setFont(undefined, 'bold')
  doc.text('Media Pembelajaran:', 15, yPosition)
  yPosition += 7
  doc.setFont(undefined, 'normal')

  if (modulData.media_files && modulData.media_files.length > 0) {
    modulData.media_files.forEach((file, index) => {
      yPosition = addText(`${index + 1}. ${file.name || file}`, 20, yPosition)
      yPosition += 2
    })
  } else {
    yPosition = addText('-', 20, yPosition)
  }
  yPosition += 5

  const sumberBelajar = modulData.sumber_belajar || {}

  doc.setFont(undefined, 'bold')
  doc.text('Sumber Belajar (URL):', 15, yPosition)
  yPosition += 7
  doc.setFont(undefined, 'normal')

  if (sumberBelajar.urls && sumberBelajar.urls.length > 0) {
    sumberBelajar.urls.forEach((url, index) => {
      yPosition = addText(`${index + 1}. ${url}`, 20, yPosition, 165)
      yPosition += 2
    })
  } else {
    yPosition = addText('-', 20, yPosition)
  }
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('LKPD (Lembar Kerja Peserta Didik):', 15, yPosition)
  doc.setFont(undefined, 'normal')
  yPosition = addText(sumberBelajar.lkpd || '-', 15, yPosition + 7)

  // ===== PAGE 7: KESELAMATAN =====
  doc.addPage()
  yPosition = 20
  yPosition = addSectionHeader('6. KESELAMATAN (PJOK)', yPosition)

  const keselamatan = modulData.keselamatan || {}

  doc.setFont(undefined, 'bold')
  doc.text('Area Aman:', 15, yPosition)
  doc.setFont(undefined, 'normal')
  yPosition = addText(keselamatan.area_aman || '-', 15, yPosition + 7)
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('Instruksi Keamanan:', 15, yPosition)
  yPosition += 7
  doc.setFont(undefined, 'normal')

  if (keselamatan.instruksi && keselamatan.instruksi.length > 0) {
    keselamatan.instruksi.forEach((instruksi, index) => {
      yPosition = addText(`${index + 1}. ${instruksi}`, 20, yPosition)
      yPosition += 2
    })
  } else {
    yPosition = addText('-', 20, yPosition)
  }
  yPosition += 5

  doc.setFont(undefined, 'bold')
  doc.text('Alternatif Aktivitas:', 15, yPosition)
  doc.setFont(undefined, 'normal')
  yPosition = addText(keselamatan.alternatif || '-', 15, yPosition + 7)

  // ===== PAGE 8: REFERENSI =====
  doc.addPage()
  yPosition = 20
  yPosition = addSectionHeader('7. REFERENSI', yPosition)

  if (modulData.referensi && modulData.referensi.length > 0) {
    modulData.referensi.forEach((ref, index) => {
      if (yPosition > 260) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFont(undefined, 'normal')
      let refText = `${index + 1}. `
      
      if (ref.penulis) refText += `${ref.penulis}. `
      if (ref.judul) refText += `${ref.judul}. `
      if (ref.jenis) refText += `(${ref.jenis}). `
      if (ref.url) refText += `${ref.url}`

      yPosition = addText(refText, 15, yPosition, 180)
      yPosition += 5
    })
  } else {
    yPosition = addText('Belum ada referensi', 15, yPosition)
  }

  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' })
  }

  // Save PDF
  const fileName = `Modul_Ajar_${modulData.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
  doc.save(fileName)
}

