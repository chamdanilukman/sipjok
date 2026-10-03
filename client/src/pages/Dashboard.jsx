import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { api } from '../lib/api'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export const Dashboard = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalModulAjar: 0,
    totalAbsensiHariIni: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [attendanceData, setAttendanceData] = useState(null)
  const [gradeData, setGradeData] = useState(null)
  const [activityData, setActivityData] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load all data in parallel using API client
      const [classes, students, modulAjar, attendance, journals] = await Promise.all([
        api.get('/classes'),
        api.get('/students'),
        api.get('/modul-ajar'),
        api.get('/attendance'),
        api.get('/journals'),
      ])

      // Filter today's attendance
      const today = new Date().toISOString().split('T')[0]
      const todayAttendance = attendance.filter(a => 
        a.tanggal && a.tanggal.startsWith(today)
      )

      setStats({
        totalKelas: classes?.length || 0,
        totalSiswa: students?.length || 0,
        totalModulAjar: modulAjar?.length || 0,
        totalAbsensiHariIni: todayAttendance?.length || 0,
      })

      setRecentActivities(journals || [])

      // Prepare chart data
      prepareAttendanceChart()
      prepareGradeChart()
      prepareActivityChart()
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    }
  }

  const prepareAttendanceChart = () => {
    // Last 7 days attendance data
    const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
    const data = {
      labels,
      datasets: [
        {
          label: 'Hadir',
          data: [28, 30, 29, 31, 30, 0, 0],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
        },
        {
          label: 'Sakit',
          data: [2, 0, 1, 0, 0, 0, 0],
          borderColor: 'rgb(234, 179, 8)',
          backgroundColor: 'rgba(234, 179, 8, 0.5)',
        },
        {
          label: 'Izin',
          data: [0, 0, 0, 0, 1, 0, 0],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        },
        {
          label: 'Alpha',
          data: [0, 0, 0, 0, 0, 0, 0],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
        },
      ],
    }
    setAttendanceData(data)
  }

  const prepareGradeChart = () => {
    // Grade distribution
    const data = {
      labels: ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'E (<60)'],
      datasets: [
        {
          label: 'Jumlah Siswa',
          data: [12, 15, 8, 3, 2],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
        },
      ],
    }
    setGradeData(data)
  }

  const prepareActivityChart = () => {
    // Monthly activity
    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
      datasets: [
        {
          label: 'Jurnal Mengajar',
          data: [20, 22, 21, 23, 22, 18],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: 'Modul Ajar',
          data: [3, 2, 4, 3, 2, 3],
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
        },
      ],
    }
    setActivityData(data)
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-4 md:p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard SIPJOK</h1>
        <p className="mt-2 text-sm md:text-base opacity-90">
          Selamat datang! Pantau perkembangan siswa dan aktivitas pembelajaran Anda
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Total Kelas"
          value={stats.totalKelas}
          icon="fas fa-school"
          color="bg-blue-500"
          onClick={() => navigate('/schedule-attendance/student-attendance')}
        />
        <StatCard
          title="Total Siswa"
          value={stats.totalSiswa}
          icon="fas fa-users"
          color="bg-green-500"
          onClick={() => navigate('/schedule-attendance/student-attendance')}
        />
        <StatCard
          title="Modul Ajar"
          value={stats.totalModulAjar}
          icon="fas fa-book"
          color="bg-purple-500"
          onClick={() => navigate('/learning-planning/lesson-plans')}
        />
        <StatCard
          title="Absensi Hari Ini"
          value={stats.totalAbsensiHariIni}
          icon="fas fa-clipboard-list"
          color="bg-orange-500"
          onClick={() => navigate('/schedule-attendance/student-attendance')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Attendance Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            <i className="fas fa-chart-line mr-2 text-blue-600"></i>
            Grafik Absensi (7 Hari Terakhir)
          </h2>
          {attendanceData && (
            <div className="h-64 md:h-80">
              <Line
                data={attendanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { boxWidth: 12, font: { size: 10 } },
                    },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Grade Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            <i className="fas fa-chart-pie mr-2 text-green-600"></i>
            Distribusi Nilai
          </h2>
          {gradeData && (
            <div className="h-64 md:h-80 flex items-center justify-center">
              <Doughnut
                data={gradeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { boxWidth: 12, font: { size: 10 } },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          <i className="fas fa-chart-bar mr-2 text-purple-600"></i>
          Aktivitas Bulanan
        </h2>
        {activityData && (
          <div className="h-64 md:h-80">
            <Bar
              data={activityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, font: { size: 10 } },
                  },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          <i className="fas fa-history mr-2 text-orange-600"></i>
          Aktivitas Terbaru
        </h2>
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-book text-blue-600"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Jurnal Mengajar - {activity.classes?.name || 'Kelas'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {activity.materi_pokok || 'Tidak ada deskripsi'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    <i className="fas fa-calendar mr-1"></i>
                    {new Date(activity.tanggal).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-inbox text-3xl mb-2"></i>
            <p className="text-sm">Belum ada aktivitas terbaru</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          <i className="fas fa-bolt mr-2 text-yellow-600"></i>
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <QuickActionButton
            icon="fas fa-clipboard-list"
            label="Input Absensi"
            color="bg-green-600"
            onClick={() => navigate('/schedule-attendance/student-attendance')}
          />
          <QuickActionButton
            icon="fas fa-star"
            label="Input Nilai"
            color="bg-purple-600"
            onClick={() => navigate('/assessment/grade-list')}
          />
          <QuickActionButton
            icon="fas fa-book"
            label="Buat Modul Ajar"
            color="bg-orange-600"
            onClick={() => navigate('/learning-planning/lesson-plans')}
          />
          <QuickActionButton
            icon="fas fa-journal-whills"
            label="Jurnal Mengajar"
            color="bg-blue-600"
            onClick={() => navigate('/schedule-attendance/teaching-journal')}
          />
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-lg shadow-md p-4 md:p-6 cursor-pointer hover:shadow-lg transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-gray-600 text-xs md:text-sm font-medium truncate">{title}</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{value}</p>
      </div>
      <div className={`${color} text-white p-3 md:p-4 rounded-lg flex-shrink-0`}>
        <i className={`${icon} text-lg md:text-2xl`}></i>
      </div>
    </div>
  </div>
)

const QuickActionButton = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`${color} text-white px-3 md:px-4 py-3 rounded-lg hover:opacity-90 transition-opacity flex flex-col md:flex-row items-center justify-center gap-2`}
  >
    <i className={`${icon} text-lg md:text-base`}></i>
    <span className="text-xs md:text-sm text-center">{label}</span>
  </button>
)

export default Dashboard

