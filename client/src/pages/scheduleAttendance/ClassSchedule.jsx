import React, { useState, useEffect } from 'react'
import { useNotification } from '../../context/NotificationContext'
import useClassSchedule from '../../hooks/useClassSchedule'
import { api } from '../../lib/api'
import useClasses from '../../hooks/useClasses'

export const ClassSchedule = () => {
  const { showNotification } = useNotification()
  const {
    schedules,
    loading,
    error,
    DAYS_OF_WEEK,
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useClassSchedule()

  const { loadClasses: loadClassesHook } = useClasses()

  const [userId, setUserId] = useState(null)
  const [classes, setClasses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [formData, setFormData] = useState({
    class_id: '',
    subject: '',
    day_of_week: 0,
    time_start: '07:00',
    time_end: '08:00',
    room: '',
    notes: '',
  })

  // Get current user and load data
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await api.get('/auth/me')
        if (user && user.id) {
          setUserId(user.id)
          loadSchedules(user.id)
          const classData = await loadClassesHook()
          setClasses(classData || [])
        }
      } catch (err) {
        console.error('Error getting current user:', err)
      }
    }
    getCurrentUser()
  }, [loadSchedules, loadClassesHook])

  const handleOpenModal = (day, schedule = null) => {
    setSelectedDay(day)
    if (schedule) {
      setEditingScheduleId(schedule.id)
      setFormData({
        class_id: schedule.class_id,
        subject: schedule.subject,
        day_of_week: schedule.day_of_week,
        time_start: schedule.time_start,
        time_end: schedule.time_end,
        room: schedule.room || '',
        notes: schedule.notes || '',
      })
    } else {
      setEditingScheduleId(null)
      setFormData({
        class_id: '',
        subject: '',
        day_of_week: day,
        time_start: '07:00',
        time_end: '08:00',
        room: '',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleSaveSchedule = async () => {
    if (!formData.class_id || !formData.subject) {
      showNotification('Kelas dan mata pelajaran harus diisi', 'error')
      return
    }

    if (formData.time_start >= formData.time_end) {
      showNotification('Jam mulai harus lebih awal dari jam selesai', 'error')
      return
    }

    try {
      if (editingScheduleId) {
        await updateSchedule(editingScheduleId, formData)
        showNotification('Jadwal berhasil diperbarui', 'success')
      } else {
        await createSchedule(userId, formData)
        showNotification('Jadwal berhasil ditambahkan', 'success')
      }
      setShowModal(false)
      await loadSchedules(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal menyimpan jadwal', 'error')
    }
  }

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return

    try {
      await deleteSchedule(scheduleId)
      showNotification('Jadwal berhasil dihapus', 'success')
      await loadSchedules(userId)
    } catch (err) {
      showNotification(err.message || 'Gagal menghapus jadwal', 'error')
    }
  }

  const handleAddScheduleToCalendar = async (schedule) => {
    try {
      // Get next occurrence of this day of week using local time
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      const currentDate = now.getDate()

      // Create date object with local midnight (avoid timezone shift)
      const today = new Date(currentYear, currentMonth, currentDate)

      const targetDay = schedule.day_of_week // 0=Monday, 1=Tuesday, etc.
      const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1 // Convert Sunday=0 to Monday=0

      let daysUntilTarget = targetDay - currentDay
      if (daysUntilTarget < 0) daysUntilTarget += 7

      // Calculate target date using local date arithmetic
      const targetDate = new Date(currentYear, currentMonth, currentDate + daysUntilTarget)

      // Format date as YYYY-MM-DD in local timezone
      const year = targetDate.getFullYear()
      const month = String(targetDate.getMonth() + 1).padStart(2, '0')
      const day = String(targetDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`

      // Ensure time format is HH:MM (remove seconds if present)
      const formatTime = (time) => {
        if (!time) return null
        return time.substring(0, 5) // Extract HH:MM from HH:MM:SS
      }

      const eventData = {
        judul: `${schedule.subject} - ${schedule.classes?.name || 'Kelas'}`,
        deskripsi: `Jadwal pelajaran ${schedule.subject}\nKelas: ${schedule.classes?.name || 'Kelas'} - Kelas ${schedule.classes?.grade || ''}\nRuangan: ${schedule.room || '-'}`,
        kategori: 'pembelajaran',
        tanggal_mulai: dateStr,
        tanggal_selesai: dateStr,
        jam_mulai: formatTime(schedule.time_start),
        jam_selesai: formatTime(schedule.time_end),
        lokasi: schedule.room || 'Sekolah',
        user_id: userId,
      }

      const { error: calendarError } = await api.post('/calendar', eventData)
      if (calendarError) throw calendarError

      showNotification('Jadwal berhasil ditambahkan ke kalender', 'success')
    } catch (err) {
      console.error('Calendar sync error:', err)
      showNotification(err.message || 'Gagal menambahkan ke kalender', 'error')
    }
  }

  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  const getScheduleForTimeSlot = (day, time) => {
    return schedules.find(
      (s) => s.day_of_week === day && s.time_start.substring(0, 5) === time
    )
  }

  const getClassColor = (classId) => {
    const colors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100']
    return colors[classId.charCodeAt(0) % colors.length]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jadwal Pelajaran</h1>
          <p className="text-gray-600 mt-2">Kelola jadwal pelajaran mingguan</p>
        </div>
        <button
          onClick={() => handleOpenModal(0)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Tambah Jadwal
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Timetable */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
          <p className="text-gray-600">Memuat jadwal...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 w-20">Jam</th>
                {Object.entries(DAYS_OF_WEEK).map(([day, name]) => (
                  <th key={day} className="px-4 py-3 text-center font-semibold text-gray-700 min-w-40">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-50">{time}</td>
                  {Object.keys(DAYS_OF_WEEK).map((day) => {
                    const dayNum = parseInt(day)
                    const schedule = getScheduleForTimeSlot(dayNum, time)
                    return (
                      <td
                        key={`${day}-${time}`}
                        onClick={() => handleOpenModal(dayNum)}
                        className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        {schedule ? (
                          <div
                            className={`p-2 rounded ${getClassColor(schedule.class_id)} border border-gray-300`}
                          >
                            <p className="font-semibold text-sm text-gray-900">{schedule.subject}</p>
                            <p className="text-xs text-gray-600">{schedule.classes?.name} - Kelas {schedule.classes?.grade}</p>
                            <p className="text-xs text-gray-500">
                              {schedule.time_start}-{schedule.time_end}
                            </p>
                            <div className="flex gap-1 mt-1 justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenModal(dayNum, schedule)
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit jadwal"
                              >
                                <i className="fas fa-edit text-xs"></i>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddScheduleToCalendar(schedule)
                                }}
                                className="text-purple-600 hover:text-purple-800"
                                title="Tambah ke kalender"
                              >
                                <i className="fas fa-calendar-plus text-xs"></i>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteSchedule(schedule.id)
                                }}
                                className="text-red-600 hover:text-red-800"
                                title="Hapus jadwal"
                              >
                                <i className="fas fa-trash text-xs"></i>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">-</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingScheduleId ? 'Edit Jadwal' : 'Tambah Jadwal'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas *</label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - Kelas {cls.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: PJOK, Matematika"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(DAYS_OF_WEEK).map(([day, name]) => (
                    <option key={day} value={day}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={formData.time_start}
                    onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={formData.time_end}
                    onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Ruang 1A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveSchedule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassSchedule
