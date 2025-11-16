import React, { useState, useEffect, useRef } from 'react'
import { useDataContext } from '../../context/DataContext'
import useCalendarEvents from '../../hooks/useCalendarEvents'
import supabase from '../../config/supabase'
import { getMonthName } from '../../utils/helpers'
import { parseCalendarFile, downloadCalendarTemplate, downloadCalendarTemplateCSV, validateEvents } from '../../utils/calendarImport'

export const AcademicCalendar = () => {
  const { showNotification } = useDataContext()
  const { events, loading, error, CATEGORIES, loadEvents, createEvent, updateEvent, deleteEvent, getEventsForDate, getCategoryInfo } = useCalendarEvents()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [userId, setUserId] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [eventForm, setEventForm] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'pembelajaran',
    tanggal_mulai: '',
    tanggal_selesai: '',
    jam_mulai: '',
    jam_selesai: '',
    lokasi: '',
  })
  const [editingEventId, setEditingEventId] = useState(null)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [importPreview, setImportPreview] = useState([])
  const fileUploadRef = useRef(null)

  // Get current user and load events
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        loadEvents(user.id, currentDate.getFullYear(), currentDate.getMonth())
      }
    }
    getCurrentUser()
  }, [currentDate, loadEvents])

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(date)

    // Format date manually to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const dayStr = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${dayStr}`

    setEventForm({
      judul: '',
      deskripsi: '',
      kategori: 'pembelajaran',
      tanggal_mulai: dateStr,
      tanggal_selesai: dateStr,
      jam_mulai: '',
      jam_selesai: '',
      lokasi: '',
    })
    setEditingEventId(null)
    setShowEventModal(true)
  }

  const handleEventClick = (event, e) => {
    e.stopPropagation()
    setSelectedDate(new Date(event.tanggal_mulai))
    setEventForm({
      judul: event.judul,
      deskripsi: event.deskripsi || '',
      kategori: event.kategori,
      tanggal_mulai: event.tanggal_mulai,
      tanggal_selesai: event.tanggal_selesai || event.tanggal_mulai,
      jam_mulai: event.jam_mulai || '',
      jam_selesai: event.jam_selesai || '',
      lokasi: event.lokasi || '',
    })
    setEditingEventId(event.id)
    setShowEventModal(true)
  }

  const handleSaveEvent = async () => {
    if (!eventForm.judul.trim()) {
      showNotification('Judul event harus diisi', 'error')
      return
    }

    if (!userId) return

    try {
      if (editingEventId) {
        await updateEvent(editingEventId, eventForm)
        showNotification('Event berhasil diperbarui', 'success')
      } else {
        await createEvent(userId, eventForm)
        showNotification('Event berhasil ditambahkan', 'success')
      }
      setShowEventModal(false)
      await loadEvents(userId, currentDate.getFullYear(), currentDate.getMonth())
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan event', 'error')
    }
  }

  const handleDeleteEvent = async () => {
    if (!editingEventId) return
    if (!window.confirm('Apakah Anda yakin ingin menghapus event ini?')) return

    try {
      await deleteEvent(editingEventId)
      showNotification('Event berhasil dihapus', 'success')
      setShowEventModal(false)
      await loadEvents(userId, currentDate.getFullYear(), currentDate.getMonth())
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus event', 'error')
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    if (!validTypes.includes(file.type)) {
      showNotification('Format file tidak valid. Gunakan CSV atau Excel (.xlsx)', 'error')
      return
    }

    try {
      setBulkUploading(true)
      const parsedEvents = await parseCalendarFile(file)

      // Validate events
      const validationErrors = validateEvents(parsedEvents)
      if (validationErrors.length > 0) {
        showNotification(`Validasi gagal:\n${validationErrors.slice(0, 3).join('\n')}`, 'error')
        setBulkUploading(false)
        return
      }

      // Show preview
      setImportPreview(parsedEvents)
      showNotification(`${parsedEvents.length} event berhasil diparse. Preview di bawah.`, 'success')
    } catch (err) {
      showNotification(err.message || 'Gagal membaca file', 'error')
    } finally {
      setBulkUploading(false)
    }
  }

  const handleBulkImport = async () => {
    if (importPreview.length === 0) return

    try {
      setBulkUploading(true)

      // Insert all events
      const eventsWithUser = importPreview.map(event => ({
        ...event,
        user_id: userId,
      }))

      const { error: importError } = await supabase
        .from('calendar_events')
        .insert(eventsWithUser)

      if (importError) throw importError

      showNotification(`${importPreview.length} event berhasil diimport!`, 'success')
      setShowBulkUploadModal(false)
      setImportPreview([])
      await loadEvents(userId, currentDate.getFullYear(), currentDate.getMonth())
    } catch (err) {
      showNotification(err.message || 'Gagal mengimport event', 'error')
    } finally {
      setBulkUploading(false)
    }
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 p-2"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

      // Format date manually to avoid timezone issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const dayStr = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${dayStr}`

      const dayEvents = events.filter((e) => e.tanggal_mulai === dateStr)
      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`min-h-24 p-2 border cursor-pointer transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className={`font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => {
              const catInfo = getCategoryInfo(event.kategori)
              return (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  className={`text-xs p-1 rounded cursor-pointer truncate bg-${catInfo.color}-100 text-${catInfo.color}-800 hover:opacity-80`}
                  title={event.judul}
                >
                  {event.judul}
                </div>
              )
            })}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 px-1">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kalender Akademik</h1>
          <p className="text-gray-600 mt-2">Kelola kalender akademik dengan event dan jadwal</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <i className="fas fa-file-upload mr-2"></i>
            Import CSV/Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <i className="fas fa-chevron-left mr-2"></i>
            Sebelumnya
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={handleNextMonth}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Selanjutnya
              <i className="fas fa-chevron-right ml-2"></i>
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
            <p className="text-gray-600">Memuat kalender...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
            {renderCalendarDays()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori Event</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded bg-${cat.color}-500`}></div>
              <span className="text-sm text-gray-700">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingEventId ? 'Edit Event' : 'Tambah Event'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                <input
                  type="text"
                  value={eventForm.judul}
                  onChange={(e) => setEventForm({ ...eventForm, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={eventForm.kategori}
                  onChange={(e) => setEventForm({ ...eventForm, kategori: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={eventForm.tanggal_mulai}
                  onChange={(e) => setEventForm({ ...eventForm, tanggal_mulai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={eventForm.tanggal_selesai}
                  onChange={(e) => setEventForm({ ...eventForm, tanggal_selesai: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={eventForm.jam_mulai}
                    onChange={(e) => setEventForm({ ...eventForm, jam_mulai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={eventForm.jam_selesai}
                    onChange={(e) => setEventForm({ ...eventForm, jam_selesai: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={eventForm.lokasi}
                  onChange={(e) => setEventForm({ ...eventForm, lokasi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={eventForm.deskripsi}
                  onChange={(e) => setEventForm({ ...eventForm, deskripsi: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveEvent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
              {editingEventId && (
                <button
                  onClick={handleDeleteEvent}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              )}
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Import Event dari CSV/Excel</h3>
              <button
                onClick={() => {
                  setShowBulkUploadModal(false)
                  setImportPreview([])
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Download Template Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                <i className="fas fa-info-circle mr-2"></i>
                Download Template
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Download template untuk melihat format yang benar. Isi template dengan data event Anda, lalu upload.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={downloadCalendarTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <i className="fas fa-file-excel mr-2"></i>
                  Download Template Excel
                </button>
                <button
                  onClick={downloadCalendarTemplateCSV}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <i className="fas fa-file-csv mr-2"></i>
                  Download Template CSV
                </button>
              </div>
            </div>

            {/* Upload Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File CSV/Excel</label>
              <input
                ref={fileUploadRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: CSV, Excel (.xlsx, .xls). Max 100 event per upload.
              </p>
            </div>

            {/* Preview Section */}
            {importPreview.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Preview: {importPreview.length} event akan diimport
                </h4>
                <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Judul</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Kategori</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Tanggal</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Jam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((event, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="py-2 px-3">{event.judul}</td>
                          <td className="py-2 px-3">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
                              {event.kategori}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            {event.tanggal_mulai}
                            {event.tanggal_selesai !== event.tanggal_mulai && ` - ${event.tanggal_selesai}`}
                          </td>
                          <td className="py-2 px-3">
                            {event.jam_mulai && event.jam_selesai
                              ? `${event.jam_mulai} - ${event.jam_selesai}`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              {importPreview.length > 0 && (
                <button
                  onClick={handleBulkImport}
                  disabled={bulkUploading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {bulkUploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Mengimport...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Import {importPreview.length} Event
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setShowBulkUploadModal(false)
                  setImportPreview([])
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Tutup
              </button>
            </div>

            {/* Format Info */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h5 className="font-semibold text-gray-900 text-sm mb-2">Format Kolom:</h5>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><strong>judul</strong> (wajib): Judul event</li>
                <li><strong>kategori</strong>: pembelajaran, ujian, kegiatan, libur, kurikulum (default: kegiatan)</li>
                <li><strong>tanggal_mulai</strong> (wajib): Format YYYY-MM-DD atau DD/MM/YYYY</li>
                <li><strong>tanggal_selesai</strong>: Format sama dengan tanggal_mulai (opsional)</li>
                <li><strong>jam_mulai</strong>, <strong>jam_selesai</strong>: Format HH:MM, contoh: 08:00 (opsional)</li>
                <li><strong>lokasi</strong>, <strong>deskripsi</strong>: Teks bebas (opsional)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AcademicCalendar

