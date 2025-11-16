import React from 'react'

export const PreviewModulAjar = ({ modul, onClose, onDownloadPDF, onDownloadWord }) => {
  if (!modul) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Preview Modul Ajar</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-file-pdf"></i>
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              onClick={onDownloadWord}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-file-word"></i>
              <span className="hidden sm:inline">Download Word</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Content - Format sesuai tangkapan layar */}
        <div className="p-8 bg-white" id="modul-preview-content">
          {/* Header Fase & Kelas */}
          <div className="text-center mb-6 border-2 border-gray-800 p-3">
            <h1 className="text-lg font-bold">Fase {modul.fase}/Kelas {modul.kelas}</h1>
          </div>

          {/* Informasi Umum */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 w-48 bg-gray-50 font-semibold">Judul Modul</td>
                  <td className="border border-gray-400 px-3 py-2">{modul.title || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 bg-gray-50 font-semibold">Mata Pelajaran</td>
                  <td className="border border-gray-400 px-3 py-2">{modul.mata_pelajaran || 'PJOK'}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 bg-gray-50 font-semibold">Jenjang Sekolah</td>
                  <td className="border border-gray-400 px-3 py-2">SD</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 bg-gray-50 font-semibold">Fase / Kelas</td>
                  <td className="border border-gray-400 px-3 py-2">Fase {modul.fase} / Kelas {modul.kelas}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 bg-gray-50 font-semibold">Alokasi Waktu</td>
                  <td className="border border-gray-400 px-3 py-2">{modul.alokasi_waktu || 1} JP</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 bg-gray-50 font-semibold">Tahun Penyusunan</td>
                  <td className="border border-gray-400 px-3 py-2">{new Date().getFullYear()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 1. KOMPETENSI AWAL */}
          <div className="mb-6">
            <div className="bg-green-100 border-l-4 border-green-600 px-4 py-2 mb-3">
              <h2 className="font-bold text-gray-900">1. KOMPETENSI AWAL</h2>
            </div>
            <div className="border border-gray-400 px-4 py-3">
              <p className="text-gray-800 whitespace-pre-wrap">{modul.kompetensi_awal || '-'}</p>
            </div>
          </div>

          {/* 2. PROFIL PELAJAR PANCASILA */}
          <div className="mb-6">
            <div className="bg-yellow-100 border-l-4 border-yellow-600 px-4 py-2 mb-3">
              <h2 className="font-bold text-gray-900">2. 8 DIMENSI PROFIL LULUSAN (8DPL)</h2>
            </div>
            <div className="border border-gray-400 px-4 py-3">
              {modul.profil_lulusan && modul.profil_lulusan.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {modul.profil_lulusan.map((item, index) => {
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
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-600"></i>
                        <span className="text-gray-800">{labels[item] || item}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500">-</p>
              )}
            </div>
          </div>

          {/* 3. SARANA DAN PRASARANA */}
          {modul.sarana_prasarana && (
            <div className="mb-6">
              <div className="bg-purple-100 border-l-4 border-purple-600 px-4 py-2 mb-3">
                <h2 className="font-bold text-gray-900">3. SARANA DAN PRASARANA</h2>
              </div>
              <div className="border border-gray-400 px-4 py-3">
                <p className="text-gray-800 whitespace-pre-wrap">{modul.sarana_prasarana}</p>
              </div>
            </div>
          )}

          {/* 4. PRAKTIK PEDAGOGIS */}
          <div className="mb-6">
            <div className="bg-pink-100 border-l-4 border-pink-600 px-4 py-2 mb-3">
              <h2 className="font-bold text-gray-900">4. PRAKTIK PEDAGOGIS</h2>
            </div>
            <div className="border border-gray-400 px-4 py-3">
              {modul.praktik_pedagogis ? (
                <p className="text-gray-800 whitespace-pre-wrap">
                  {modul.praktik_pedagogis === 'inquiry' && 'Pembelajaran Berbasis Inkuiri'}
                  {modul.praktik_pedagogis === 'project' && 'Pembelajaran Berbasis Proyek'}
                  {modul.praktik_pedagogis === 'problem' && 'Pembelajaran Berbasis Masalah'}
                  {modul.praktik_pedagogis === 'discovery' && 'Pembelajaran Penemuan'}
                  {modul.praktik_pedagogis === 'cooperative' && 'Pembelajaran Kooperatif'}
                  {modul.praktik_pedagogis === 'differentiated' && 'Pembelajaran Berdiferensiasi'}
                </p>
              ) : (
                <p className="text-gray-500">-</p>
              )}
            </div>
          </div>

          {/* 6. KEMITRAAN PEMBELAJARAN */}
          <div className="mb-6">
            <div className="bg-indigo-100 border-l-4 border-indigo-600 px-4 py-2 mb-3">
              <h2 className="font-bold text-gray-900">5. KEMITRAAN PEMBELAJARAN</h2>
            </div>
            <div className="border border-gray-400 px-4 py-3">
              <p className="text-gray-800 whitespace-pre-wrap">{modul.kemitraan || '-'}</p>
            </div>
          </div>

          {/* 7. LINGKUNGAN PEMBELAJARAN */}
          <div className="mb-6">
            <div className="bg-yellow-100 border-l-4 border-yellow-600 px-4 py-2 mb-3">
              <h2 className="font-bold text-gray-900">6. LINGKUNGAN PEMBELAJARAN</h2>
            </div>
            <div className="border border-gray-400 px-4 py-3">
              <p className="text-gray-800 whitespace-pre-wrap">{modul.lingkungan_pembelajaran || '-'}</p>
            </div>
          </div>

          {/* 8. DIGITAL TOOLS */}
          {modul.digital_tools && modul.digital_tools.length > 0 && (
            <div className="mb-6">
              <div className="bg-purple-100 border-l-4 border-purple-600 px-4 py-2 mb-3">
                <h2 className="font-bold text-gray-900">7. DIGITAL TOOLS</h2>
              </div>
              <div className="border border-gray-400 px-4 py-3">
                <div className="grid grid-cols-2 gap-3">
                  {modul.digital_tools.map((tool, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-green-600"></i>
                      <span className="text-gray-800">
                        {tool === 'video' && 'Video Pembelajaran'}
                        {tool === 'presentation' && 'Presentasi Digital'}
                        {tool === 'quiz' && 'Kuis Online'}
                        {tool === 'simulation' && 'Simulasi/Game'}
                        {tool === 'lms' && 'Learning Management System'}
                        {tool === 'collaboration' && 'Tools Kolaborasi'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 9. CAPAIAN PEMBELAJARAN */}
          <div className="mb-6">
            <div className="bg-blue-100 border-l-4 border-blue-600 px-4 py-2 mb-3">
              <h2 className="font-bold text-gray-900">8. CAPAIAN PEMBELAJARAN</h2>
            </div>
            <div className="border border-gray-400 px-4 py-3">
              <p className="text-gray-800 whitespace-pre-wrap">{modul.capaian_pembelajaran || '-'}</p>
            </div>
          </div>

          {/* 10. TUJUAN PEMBELAJARAN */}
          <div className="mb-6">
            <div className="bg-green-100 border-l-4 border-green-600 px-4 py-2 mb-3">
              <h2 className="font-bold text-gray-900">9. TUJUAN PEMBELAJARAN</h2>
            </div>
            <div className="border border-gray-400 px-4 py-3">
              {Array.isArray(modul.tujuan_pembelajaran) && modul.tujuan_pembelajaran.length > 0 ? (
                <ul className="list-decimal list-inside space-y-2">
                  {modul.tujuan_pembelajaran.map((tp, index) => (
                    <li key={index} className="text-gray-800">
                      {typeof tp === 'object' ? tp.text : tp}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-800">{typeof modul.tujuan_pembelajaran === 'string' ? modul.tujuan_pembelajaran : '-'}</p>
              )}
            </div>
          </div>

          {/* 11. KEGIATAN PEMBELAJARAN */}
          <div className="mb-6">
            <div className="bg-pink-100 border-l-4 border-pink-600 px-4 py-2 mb-3">
              <h2 className="font-bold text-gray-900">10. KEGIATAN PEMBELAJARAN</h2>
            </div>
            <div className="border border-gray-400 px-4 py-3">
              {modul.skenario_pembelajaran && modul.skenario_pembelajaran.length > 0 ? (
                modul.skenario_pembelajaran.map((pertemuan, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <h3 className="font-bold text-gray-900 mb-3 bg-gray-100 px-3 py-2 rounded">
                      Pertemuan {pertemuan.pertemuan || idx + 1}
                      {pertemuan.topik && ` - ${pertemuan.topik}`}
                    </h3>
                    <div className="pl-4 space-y-3">
                      {/* Fase Memahami */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fas fa-book-open text-blue-600"></i>
                          <h4 className="font-semibold text-gray-800">Fase Memahami:</h4>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{pertemuan.fase_memahami || '-'}</p>
                      </div>

                      {/* Fase Mengaplikasi */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fas fa-running text-green-600"></i>
                          <h4 className="font-semibold text-gray-800">Fase Mengaplikasi:</h4>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{pertemuan.fase_mengaplikasi || '-'}</p>
                      </div>

                      {/* Fase Merefleksi */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fas fa-comments text-purple-600"></i>
                          <h4 className="font-semibold text-gray-800">Fase Merefleksi:</h4>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{pertemuan.fase_merefleksi || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">-</p>
              )}
            </div>
          </div>

          {/* 12. ASESMEN */}
          <div className="mb-6">
            <div className="bg-indigo-100 border-l-4 border-indigo-600 px-4 py-2 mb-3">
              <h2 className="font-bold text-gray-900">11. ASESMEN</h2>
            </div>
            <div className="border border-gray-400 px-4 py-3">
              {typeof modul.asesmen === 'object' && modul.asesmen !== null ? (
                <div className="space-y-3">
                  {/* Asesmen Types */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {modul.asesmen.diagnostik && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Diagnostik
                      </span>
                    )}
                    {modul.asesmen.formatif && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Formatif
                      </span>
                    )}
                    {modul.asesmen.sumatif && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Sumatif
                      </span>
                    )}
                  </div>

                  {modul.asesmen.deskripsi && (
                    <div className="mb-3">
                      <strong className="text-gray-800">Deskripsi:</strong>
                      <p className="text-gray-700 whitespace-pre-wrap">{modul.asesmen.deskripsi}</p>
                    </div>
                  )}

                  {modul.asesmen.instrumen && (
                    <div className="mb-3">
                      <strong className="text-gray-800">Instrumen:</strong>
                      <p className="text-gray-700 whitespace-pre-wrap">{modul.asesmen.instrumen}</p>
                    </div>
                  )}

                  {modul.asesmen.rubrik && Array.isArray(modul.asesmen.rubrik) && modul.asesmen.rubrik.length > 0 && (
                    <div className="mt-4">
                      <strong className="text-gray-800 mb-3 block">Rubrik Penilaian:</strong>
                      <div className="space-y-4">
                        {modul.asesmen.rubrik.map((rubrikItem, index) => (
                          <div key={rubrikItem.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Kriteria {index + 1}: {rubrikItem.kriteria || 'Tidak disebutkan'}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                <h5 className="font-medium text-yellow-800 mb-1">MB (Mulai Berkembang)</h5>
                                <p className="text-sm text-yellow-700">{rubrikItem.mb || '-'}</p>
                              </div>
                              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                <h5 className="font-medium text-blue-800 mb-1">B (Berkembang)</h5>
                                <p className="text-sm text-blue-700">{rubrikItem.b || '-'}</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded border border-green-200">
                                <h5 className="font-medium text-green-800 mb-1">BSH (Berkembang Sesuai Harapan)</h5>
                                <p className="text-sm text-green-700">{rubrikItem.bsh || '-'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-800 whitespace-pre-wrap">{modul.asesmen || '-'}</p>
              )}
            </div>
          </div>

          {/* 13. KESELAMATAN */}
          {modul.keselamatan && (modul.keselamatan.area_aman || modul.keselamatan.instruksi || modul.keselamatan.alternatif) && (
            <div className="mb-6">
              <div className="bg-yellow-100 border-l-4 border-yellow-600 px-4 py-2 mb-3">
                <h2 className="font-bold text-gray-900">12. KESELAMATAN</h2>
              </div>
              <div className="border border-gray-400 px-4 py-3 space-y-4">
                {/* Area Aman */}
                {modul.keselamatan.area_aman && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fas fa-shield-alt text-green-600"></i>
                      Area Aman:
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{modul.keselamatan.area_aman}</p>
                  </div>
                )}

                {/* Instruksi Keamanan */}
                {modul.keselamatan.instruksi && modul.keselamatan.instruksi.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fas fa-list-check text-blue-600"></i>
                      Instruksi Keamanan:
                    </h4>
                    <ul className="list-decimal list-inside space-y-1">
                      {modul.keselamatan.instruksi.map((instruksi, index) => (
                        <li key={index} className="text-gray-700">{instruksi}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Aktivitas Alternatif */}
                {modul.keselamatan.alternatif && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <i className="fas fa-exchange-alt text-purple-600"></i>
                      Aktivitas Alternatif:
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{modul.keselamatan.alternatif}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 14. MEDIA DAN SUMBER BELAJAR */}
          {modul.sumber_belajar && (modul.sumber_belajar.urls || modul.sumber_belajar.lkpd || modul.media_files) && (
            <div className="mb-6">
              <div className="bg-purple-100 border-l-4 border-purple-600 px-4 py-2 mb-3">
                <h2 className="font-bold text-gray-900">13. MEDIA DAN SUMBER BELAJAR</h2>
              </div>
              <div className="border border-gray-400 px-4 py-3 space-y-4">
                {/* URLs */}
                {modul.sumber_belajar.urls && modul.sumber_belajar.urls.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Sumber Online:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {modul.sumber_belajar.urls.map((url, index) => (
                        <li key={index} className="text-gray-700">
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* LKPD */}
                {modul.sumber_belajar.lkpd && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">LKPD:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{modul.sumber_belajar.lkpd}</p>
                  </div>
                )}

                {/* Media Files */}
                {modul.media_files && modul.media_files.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Media Files:</h4>
                    <div className="flex flex-wrap gap-2">
                      {modul.media_files.map((file, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                          <i className="fas fa-file mr-2"></i>
                          {file.name || file}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 15. REFERENSI */}
          {modul.referensi && modul.referensi.length > 0 && (
            <div className="mb-6">
              <div className="bg-indigo-100 border-l-4 border-indigo-600 px-4 py-2 mb-3">
                <h2 className="font-bold text-gray-900">14. REFERENSI</h2>
              </div>
              <div className="border border-gray-400 px-4 py-3">
                <ol className="list-decimal list-inside space-y-2">
                  {modul.referensi.map((ref, index) => (
                    <li key={ref.id || index} className="text-gray-700">
                      {ref.penulis && <span className="font-semibold">{ref.penulis}. </span>}
                      {ref.tahun && <span>({ref.tahun}). </span>}
                      {ref.judul && <span className="italic">{ref.judul}. </span>}
                      {ref.penerbit && <span>{ref.penerbit}. </span>}
                      {ref.url && (
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {ref.url}
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* 16. REFLEKSI GURU */}
          {modul.refleksi_guru && (
            <div className="mb-6">
              <div className="bg-green-100 border-l-4 border-green-600 px-4 py-2 mb-3">
                <h2 className="font-bold text-gray-900">15. REFLEKSI GURU</h2>
              </div>
              <div className="border border-gray-400 px-4 py-3">
                <p className="text-gray-800 whitespace-pre-wrap">{modul.refleksi_guru || '-'}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
            <p>Modul Ajar - {modul.title}</p>
            <p>Dibuat oleh: {modul.teacher_name || '-'} | {new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
