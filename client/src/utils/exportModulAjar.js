import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx'
import { saveAs } from 'file-saver'

/**
 * Export Modul Ajar to PDF - Format sesuai Pusat Kurikulum
 */
export const exportToPDF = (modulData, profileData = null) => {
  const doc = new jsPDF()
  let yPosition = 15

  // Helper function untuk mapping label DPL
  const getDPLLabel = (code) => {
    const labels = {
      'dpl1': 'DPL 1 - Keimanan dan Ketakwaan pada Tuhan YME',
      'dpl2': 'DPL 2 - Kewargaan',
      'dpl3': 'DPL 3 - Penalaran Kritis',
      'dpl4': 'DPL 4 - Kreativitas',
      'dpl5': 'DPL 5 - Kolaborasi',
      'dpl6': 'DPL 6 - Kemandirian',
      'dpl7': 'DPL 7 - Kesehatan',
      'dpl8': 'DPL 8 - Komunikasi'
    }
    return labels[code] || code
  }

  // Helper function untuk mapping praktik pedagogis
  const getPraktikLabel = (code) => {
    const labels = {
      'inquiry': 'Pembelajaran Berbasis Inkuiri',
      'project': 'Pembelajaran Berbasis Proyek',
      'problem': 'Pembelajaran Berbasis Masalah',
      'discovery': 'Pembelajaran Penemuan',
      'cooperative': 'Pembelajaran Kooperatif',
      'differentiated': 'Pembelajaran Berdiferensiasi'
    }
    return labels[code] || code
  }

  // Helper function untuk mapping digital tools
  const getDigitalToolLabel = (code) => {
    const labels = {
      'video': 'Video Pembelajaran',
      'presentation': 'Presentasi Digital',
      'quiz': 'Kuis Online',
      'simulation': 'Simulasi/Game',
      'lms': 'Learning Management System',
      'collaboration': 'Tools Kolaborasi'
    }
    return labels[code] || code
  }

  // Helper function to add section header with colored background
  const addSectionHeader = (text, bgColor) => {
    doc.setFillColor(...bgColor)
    doc.rect(15, yPosition - 5, 180, 8, 'F')
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(text, 17, yPosition)
    yPosition += 10
  }

  // Helper function to add bordered content
  const addBorderedContent = (text, minHeight = 15) => {
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.3)
    const lines = doc.splitTextToSize(text || '-', 170)
    const contentHeight = Math.max(minHeight, lines.length * 5 + 5)
    doc.rect(15, yPosition, 180, contentHeight)
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.text(lines, 18, yPosition + 5)
    yPosition += contentHeight + 3
  }

  // Helper function to check page break
  const checkPageBreak = (neededSpace = 30) => {
    if (yPosition + neededSpace > 280) {
      doc.addPage()
      yPosition = 15
    }
  }

  // Get teacher info from profile or modulData
  const teacherName = profileData?.full_name || modulData.teacher_name || '-'
  const institusi = profileData?.school_name || modulData.institusi || '-'

  // Header - Fase & Kelas
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.8)
  doc.rect(15, yPosition, 180, 12)
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text(`Fase ${modulData.fase}/Kelas ${modulData.kelas}`, 105, yPosition + 8, { align: 'center' })
  yPosition += 18

  // Informasi Umum Table
  const infoData = [
    ['Judul Modul', modulData.title || '-'],
    ['Mata Pelajaran', modulData.mata_pelajaran || 'PJOK'],
    ['Jenjang Sekolah', 'SD'],
    ['Fase / Kelas', `Fase ${modulData.fase} / Kelas ${modulData.kelas}`],
    ['Alokasi Waktu', `${modulData.alokasi_waktu || 1} JP`],
    ['Tahun Penyusunan', new Date().getFullYear().toString()],
  ]

  doc.autoTable({
    startY: yPosition,
    head: [],
    body: infoData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 120 },
    },
  })

  yPosition = doc.lastAutoTable.finalY + 10
  checkPageBreak()

  // 1. KOMPETENSI AWAL
  if (modulData.kompetensi_awal) {
    addSectionHeader('1. KOMPETENSI AWAL', [187, 247, 208]) // Green
    addBorderedContent(modulData.kompetensi_awal)
    checkPageBreak()
  }

  // 2. 8 DIMENSI PROFIL LULUSAN
  addSectionHeader('2. 8 DIMENSI PROFIL LULUSAN (8DPL)', [254, 249, 195]) // Yellow
  const dplText = modulData.profil_lulusan && modulData.profil_lulusan.length > 0
    ? modulData.profil_lulusan.map(code => getDPLLabel(code)).join('\n')
    : '-'
  addBorderedContent(dplText)
  checkPageBreak()

  // 3. SARANA DAN PRASARANA
  if (modulData.sarana_prasarana) {
    addSectionHeader('3. SARANA DAN PRASARANA', [233, 213, 255]) // Purple
    addBorderedContent(modulData.sarana_prasarana)
    checkPageBreak()
  }

  // 4. PRAKTIK PEDAGOGIS
  if (modulData.praktik_pedagogis) {
    addSectionHeader('4. PRAKTIK PEDAGOGIS', [252, 231, 243]) // Pink
    addBorderedContent(getPraktikLabel(modulData.praktik_pedagogis))
    checkPageBreak()
  }

  // 5. KEMITRAAN PEMBELAJARAN
  if (modulData.kemitraan) {
    addSectionHeader('5. KEMITRAAN PEMBELAJARAN', [224, 231, 255]) // Indigo
    addBorderedContent(modulData.kemitraan)
    checkPageBreak()
  }

  // 6. LINGKUNGAN PEMBELAJARAN
  if (modulData.lingkungan_pembelajaran) {
    addSectionHeader('6. LINGKUNGAN PEMBELAJARAN', [254, 249, 195]) // Yellow
    addBorderedContent(modulData.lingkungan_pembelajaran)
    checkPageBreak()
  }

  // 7. DIGITAL TOOLS
  if (modulData.digital_tools && modulData.digital_tools.length > 0) {
    addSectionHeader('7. DIGITAL TOOLS', [233, 213, 255]) // Purple
    const toolsText = modulData.digital_tools.map(tool => getDigitalToolLabel(tool)).join('\n')
    addBorderedContent(toolsText)
    checkPageBreak()
  }

  // 8. CAPAIAN PEMBELAJARAN
  addSectionHeader('8. CAPAIAN PEMBELAJARAN', [191, 219, 254]) // Blue
  addBorderedContent(modulData.capaian_pembelajaran)
  checkPageBreak()

  // 9. TUJUAN PEMBELAJARAN
  addSectionHeader('9. TUJUAN PEMBELAJARAN', [187, 247, 208]) // Green
  let tpText = '-'
  if (Array.isArray(modulData.tujuan_pembelajaran) && modulData.tujuan_pembelajaran.length > 0) {
    tpText = modulData.tujuan_pembelajaran.map((tp, idx) => {
      const text = typeof tp === 'object' ? tp.text : tp
      return `${idx + 1}. ${text}`
    }).join('\n')
  } else if (typeof modulData.tujuan_pembelajaran === 'string') {
    tpText = modulData.tujuan_pembelajaran
  }
  addBorderedContent(tpText)
  checkPageBreak()

  // 10. KEGIATAN PEMBELAJARAN
  addSectionHeader('10. KEGIATAN PEMBELAJARAN', [252, 231, 243]) // Pink
  if (modulData.skenario_pembelajaran && modulData.skenario_pembelajaran.length > 0) {
    modulData.skenario_pembelajaran.forEach((pertemuan, idx) => {
      checkPageBreak(40)
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      const pertemuanTitle = `Pertemuan ${pertemuan.pertemuan || idx + 1}${pertemuan.topik ? ` - ${pertemuan.topik}` : ''}`
      doc.text(pertemuanTitle, 18, yPosition)
      yPosition += 7

      doc.setFontSize(9)
      doc.text('Fase Memahami:', 18, yPosition)
      yPosition += 5
      addBorderedContent(pertemuan.fase_memahami, 10)

      doc.setFontSize(9)
      doc.text('Fase Mengaplikasi:', 18, yPosition)
      yPosition += 5
      addBorderedContent(pertemuan.fase_mengaplikasi, 10)

      doc.setFontSize(9)
      doc.text('Fase Merefleksi:', 18, yPosition)
      yPosition += 5
      addBorderedContent(pertemuan.fase_merefleksi, 10)
    })
  } else {
    addBorderedContent('-')
  }
  checkPageBreak()

  // 11. ASESMEN
  addSectionHeader('11. ASESMEN', [224, 231, 255]) // Indigo
  if (typeof modulData.asesmen === 'object' && modulData.asesmen !== null) {
    let asesmenText = ''

    // Jenis Asesmen
    const jenisAsesmen = []
    if (modulData.asesmen.diagnostik) jenisAsesmen.push('Diagnostik')
    if (modulData.asesmen.formatif) jenisAsesmen.push('Formatif')
    if (modulData.asesmen.sumatif) jenisAsesmen.push('Sumatif')
    if (jenisAsesmen.length > 0) {
      asesmenText += `Jenis Asesmen: ${jenisAsesmen.join(', ')}\n\n`
    }

    if (modulData.asesmen.deskripsi) {
      asesmenText += `Deskripsi:\n${modulData.asesmen.deskripsi}\n\n`
    }

    if (modulData.asesmen.instrumen) {
      asesmenText += `Instrumen:\n${modulData.asesmen.instrumen}\n\n`
    }

    if (modulData.asesmen.rubrik && modulData.asesmen.rubrik.length > 0) {
      asesmenText += 'Rubrik Penilaian:\n'
      modulData.asesmen.rubrik.forEach((rubrik, idx) => {
        asesmenText += `\nKriteria ${idx + 1}: ${rubrik.kriteria || 'Tidak disebutkan'}\n`
        asesmenText += `- MB: ${rubrik.mb || '-'}\n`
        asesmenText += `- B: ${rubrik.b || '-'}\n`
        asesmenText += `- BSH: ${rubrik.bsh || '-'}\n`
      })
    }

    addBorderedContent(asesmenText || '-')
  } else {
    addBorderedContent(modulData.asesmen || '-')
  }
  checkPageBreak()

  // 12. KESELAMATAN
  if (modulData.keselamatan && (modulData.keselamatan.area_aman || modulData.keselamatan.instruksi || modulData.keselamatan.alternatif)) {
    addSectionHeader('12. KESELAMATAN', [254, 249, 195]) // Yellow
    let keselamatanText = ''

    if (modulData.keselamatan.area_aman) {
      keselamatanText += `Area Aman:\n${modulData.keselamatan.area_aman}\n\n`
    }

    if (modulData.keselamatan.instruksi && modulData.keselamatan.instruksi.length > 0) {
      keselamatanText += 'Instruksi Keamanan:\n'
      modulData.keselamatan.instruksi.forEach((instruksi, idx) => {
        keselamatanText += `${idx + 1}. ${instruksi}\n`
      })
      keselamatanText += '\n'
    }

    if (modulData.keselamatan.alternatif) {
      keselamatanText += `Aktivitas Alternatif:\n${modulData.keselamatan.alternatif}`
    }

    addBorderedContent(keselamatanText)
    checkPageBreak()
  }

  // 13. MEDIA DAN SUMBER BELAJAR
  if (modulData.sumber_belajar && (modulData.sumber_belajar.urls || modulData.sumber_belajar.lkpd || modulData.media_files)) {
    addSectionHeader('13. MEDIA DAN SUMBER BELAJAR', [233, 213, 255]) // Purple
    let mediaText = ''

    if (modulData.sumber_belajar.urls && modulData.sumber_belajar.urls.length > 0) {
      mediaText += 'Sumber Online:\n'
      modulData.sumber_belajar.urls.forEach(url => {
        mediaText += `- ${url}\n`
      })
      mediaText += '\n'
    }

    if (modulData.sumber_belajar.lkpd) {
      mediaText += `LKPD:\n${modulData.sumber_belajar.lkpd}\n\n`
    }

    if (modulData.media_files && modulData.media_files.length > 0) {
      mediaText += 'Media Files:\n'
      modulData.media_files.forEach(file => {
        mediaText += `- ${file.name || file}\n`
      })
    }

    addBorderedContent(mediaText)
    checkPageBreak()
  }

  // 14. REFERENSI
  if (modulData.referensi && modulData.referensi.length > 0) {
    addSectionHeader('14. REFERENSI', [224, 231, 255]) // Indigo
    let refText = ''
    modulData.referensi.forEach((ref, idx) => {
      refText += `${idx + 1}. `
      if (ref.penulis) refText += `${ref.penulis}. `
      if (ref.tahun) refText += `(${ref.tahun}). `
      if (ref.judul) refText += `${ref.judul}. `
      if (ref.penerbit) refText += `${ref.penerbit}. `
      if (ref.url) refText += `${ref.url}`
      refText += '\n'
    })
    addBorderedContent(refText)
    checkPageBreak()
  }

  // 15. REFLEKSI GURU
  if (modulData.refleksi_guru) {
    addSectionHeader('15. REFLEKSI GURU', [187, 247, 208]) // Green
    addBorderedContent(modulData.refleksi_guru)
  }

  // Footer
  yPosition += 5
  doc.setFontSize(8)
  doc.setFont(undefined, 'italic')
  doc.setTextColor(100, 100, 100)
  doc.text(`Modul Ajar - ${modulData.title}`, 105, yPosition, { align: 'center' })
  doc.text(`Dibuat oleh: ${teacherName} | ${new Date().toLocaleDateString('id-ID')}`, 105, yPosition + 5, { align: 'center' })

  // Save PDF
  const fileName = `Modul_Ajar_${modulData.title.replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
}


/**
 * Export Modul Ajar to Word - Format sesuai Pusat Kurikulum
 */
export const exportToWord = async (modulData, profileData = null) => {
  // Helper function untuk mapping label DPL
  const getDPLLabel = (code) => {
    const labels = {
      'dpl1': 'DPL 1 - Keimanan dan Ketakwaan pada Tuhan YME',
      'dpl2': 'DPL 2 - Kewargaan',
      'dpl3': 'DPL 3 - Penalaran Kritis',
      'dpl4': 'DPL 4 - Kreativitas',
      'dpl5': 'DPL 5 - Kolaborasi',
      'dpl6': 'DPL 6 - Kemandirian',
      'dpl7': 'DPL 7 - Kesehatan',
      'dpl8': 'DPL 8 - Komunikasi'
    }
    return labels[code] || code
  }

  // Helper function untuk mapping praktik pedagogis
  const getPraktikLabel = (code) => {
    const labels = {
      'inquiry': 'Pembelajaran Berbasis Inkuiri',
      'project': 'Pembelajaran Berbasis Proyek',
      'problem': 'Pembelajaran Berbasis Masalah',
      'discovery': 'Pembelajaran Penemuan',
      'cooperative': 'Pembelajaran Kooperatif',
      'differentiated': 'Pembelajaran Berdiferensiasi'
    }
    return labels[code] || code
  }

  // Helper function untuk mapping digital tools
  const getDigitalToolLabel = (code) => {
    const labels = {
      'video': 'Video Pembelajaran',
      'presentation': 'Presentasi Digital',
      'quiz': 'Kuis Online',
      'simulation': 'Simulasi/Game',
      'lms': 'Learning Management System',
      'collaboration': 'Tools Kolaborasi'
    }
    return labels[code] || code
  }

  // Get teacher info from profile or modulData
  const teacherName = profileData?.full_name || modulData.teacher_name || '-'
  const institusi = profileData?.school_name || modulData.institusi || '-'

  // Helper function to create section header
  const createSectionHeader = (text, bgColor) => {
    return new Paragraph({
      text: text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      shading: {
        type: ShadingType.SOLID,
        color: bgColor,
      },
      border: {
        left: { style: BorderStyle.SINGLE, size: 24, color: '000000' },
      },
    })
  }

  // Helper function to create content paragraph
  const createContentParagraph = (text) => {
    return new Paragraph({
      text: text || '-',
      spacing: { before: 100, after: 100 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
        left: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
        right: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
      },
    })
  }

  // Collect content sections
  const docContent = []

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header - Fase & Kelas
          new Paragraph({
            text: `Fase ${modulData.fase}/Kelas ${modulData.kelas}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            border: {
              top: { style: BorderStyle.DOUBLE, size: 12, color: '000000' },
              bottom: { style: BorderStyle.DOUBLE, size: 12, color: '000000' },
              left: { style: BorderStyle.DOUBLE, size: 12, color: '000000' },
              right: { style: BorderStyle.DOUBLE, size: 12, color: '000000' },
            },
          }),

          // Informasi Umum Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Judul Modul', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: modulData.title || '-' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mata Pelajaran', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: modulData.mata_pelajaran || 'PJOK' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Jenjang Sekolah', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: 'SD' })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Fase / Kelas', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `Fase ${modulData.fase} / Kelas ${modulData.kelas}` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Alokasi Waktu', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: `${modulData.alokasi_waktu || 1} JP` })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tahun Penyusunan', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: new Date().getFullYear().toString() })] }),
                ],
              }),
            ],
          }),

          // Content sections dengan kondisi
          ...(modulData.kompetensi_awal ? [
            createSectionHeader('1. KOMPETENSI AWAL', 'BBF7D0'),
            createContentParagraph(modulData.kompetensi_awal),
          ] : []),

          createSectionHeader('2. 8 DIMENSI PROFIL LULUSAN (8DPL)', 'FEF9C3'),
          createContentParagraph(modulData.profil_lulusan && modulData.profil_lulusan.length > 0 ? modulData.profil_lulusan.map(code => getDPLLabel(code)).join('\n') : '-'),

          ...(modulData.sarana_prasarana ? [
            createSectionHeader('3. SARANA DAN PRASARANA', 'E9D5FF'),
            createContentParagraph(modulData.sarana_prasarana),
          ] : []),

          ...(modulData.praktik_pedagogis ? [
            createSectionHeader('4. PRAKTIK PEDAGOGIS', 'FCE7F3'),
            createContentParagraph(getPraktikLabel(modulData.praktik_pedagogis)),
          ] : []),

          ...(modulData.kemitraan ? [
            createSectionHeader('5. KEMITRAAN PEMBELAJARAN', 'E0E7FF'),
            createContentParagraph(modulData.kemitraan),
          ] : []),

          ...(modulData.lingkungan_pembelajaran ? [
            createSectionHeader('6. LINGKUNGAN PEMBELAJARAN', 'FEF9C3'),
            createContentParagraph(modulData.lingkungan_pembelajaran),
          ] : []),

          ...(modulData.digital_tools && modulData.digital_tools.length > 0 ? [
            createSectionHeader('7. DIGITAL TOOLS', 'E9D5FF'),
            createContentParagraph(modulData.digital_tools.map(tool => getDigitalToolLabel(tool)).join('\n')),
          ] : []),

          createSectionHeader('8. CAPAIAN PEMBELAJARAN', 'BFE3FE'),
          createContentParagraph(modulData.capaian_pembelajaran),

          createSectionHeader('9. TUJUAN PEMBELAJARAN', 'BBF7D0'),
          createContentParagraph(
            Array.isArray(modulData.tujuan_pembelajaran) && modulData.tujuan_pembelajaran.length > 0
              ? modulData.tujuan_pembelajaran.map((tp, idx) => {
                  const text = typeof tp === 'object' ? tp.text : tp
                  return `${idx + 1}. ${text}`
                }).join('\n')
              : typeof modulData.tujuan_pembelajaran === 'string'
              ? modulData.tujuan_pembelajaran
              : '-'
          ),

          createSectionHeader('10. KEGIATAN PEMBELAJARAN', 'FCE7F3'),
          ...(modulData.skenario_pembelajaran && modulData.skenario_pembelajaran.length > 0
            ? modulData.skenario_pembelajaran.flatMap((pertemuan, idx) => [
                new Paragraph({
                  text: `Pertemuan ${pertemuan.pertemuan || idx + 1}${pertemuan.topik ? ` - ${pertemuan.topik}` : ''}`,
                  bold: true,
                  spacing: { before: 150, after: 100 },
                }),
                new Paragraph({ text: 'Fase Memahami:', bold: true }),
                createContentParagraph(pertemuan.fase_memahami),
                new Paragraph({ text: 'Fase Mengaplikasi:', bold: true }),
                createContentParagraph(pertemuan.fase_mengaplikasi),
                new Paragraph({ text: 'Fase Merefleksi:', bold: true }),
                createContentParagraph(pertemuan.fase_merefleksi),
              ])
            : [createContentParagraph('-')]),

          createSectionHeader('11. ASESMEN', 'E0E7FF'),
          createContentParagraph(
            typeof modulData.asesmen === 'object' && modulData.asesmen !== null
              ? (() => {
                  let text = ''
                  const jenis = []
                  if (modulData.asesmen.diagnostik) jenis.push('Diagnostik')
                  if (modulData.asesmen.formatif) jenis.push('Formatif')
                  if (modulData.asesmen.sumatif) jenis.push('Sumatif')
                  if (jenis.length > 0) text += `Jenis: ${jenis.join(', ')}\n\n`
                  if (modulData.asesmen.deskripsi) text += `Deskripsi:\n${modulData.asesmen.deskripsi}\n\n`
                  if (modulData.asesmen.instrumen) text += `Instrumen:\n${modulData.asesmen.instrumen}\n\n`
                  if (modulData.asesmen.rubrik && modulData.asesmen.rubrik.length > 0) {
                    text += 'Rubrik:\n'
                    modulData.asesmen.rubrik.forEach((r, i) => {
                      text += `\n${i + 1}. ${r.kriteria || '-'}\n- MB: ${r.mb || '-'}\n- B: ${r.b || '-'}\n- BSH: ${r.bsh || '-'}\n`
                    })
                  }
                  return text || '-'
                })()
              : modulData.asesmen || '-'
          ),

          // Footer
          new Paragraph({
            text: `Modul Ajar - ${modulData.title}`,
            alignment: AlignmentType.CENTER,
            spacing: { before: 300 },
            italics: true,
          }),
          new Paragraph({
            text: `Dibuat oleh: ${teacherName} | ${new Date().toLocaleDateString('id-ID')}`,
            alignment: AlignmentType.CENTER,
            italics: true,
          }),
        ],
      },
    ],
  })

  // Generate and save
  const blob = await Packer.toBlob(doc)
  const fileName = `Modul_Ajar_${modulData.title.replace(/\s+/g, '_')}.docx`
  saveAs(blob, fileName)

}