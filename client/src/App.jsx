import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { NotificationProvider } from './context/NotificationContext'
import { ProfileProvider } from './context/ProfileContext'
import { AcademicYearProvider } from './context/AcademicYearContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Auth (eager - first paint)
import Login from './pages/Login'

// Dashboard (eager - landing page)
import Dashboard from './pages/Dashboard'

// All other pages are code-split per route
const DataSiswa = lazy(() => import('./pages/dataMaster/DataSiswa'))
const DataKelas = lazy(() => import('./pages/dataMaster/DataKelas'))

// Profile & Identity
const TeacherProfile = lazy(() => import('./pages/profile/TeacherProfile'))
const ChangePassword = lazy(() => import('./pages/profile/ChangePassword'))
const SchoolCurriculum = lazy(() => import('./pages/profile/SchoolCurriculum'))
const AcademicCalendar = lazy(() => import('./pages/profile/AcademicCalendar'))

// Schedule & Attendance
const ClassSchedule = lazy(() => import('./pages/scheduleAttendance/ClassSchedule'))
const StudentAttendance = lazy(() => import('./pages/scheduleAttendance/StudentAttendance'))
const TeachingJournal = lazy(() => import('./pages/scheduleAttendance/TeachingJournal'))
const AttendanceReport = lazy(() => import('./pages/scheduleAttendance/AttendanceReport'))
const JournalReport = lazy(() => import('./pages/scheduleAttendance/JournalReport'))

// Learning Planning
const ATPIntracurricular = lazy(() => import('./pages/learningPlanning/ATPIntracurricular'))
const LessonPlans = lazy(() => import('./pages/learningPlanning/LessonPlans'))

// Co-curricular
const CocurricularSchedule = lazy(() => import('./pages/cocurricular/CocurricularSchedule'))
const CocurricularPrograms = lazy(() => import('./pages/cocurricular/CocurricularPrograms'))
const CocurricularModules = lazy(() => import('./pages/cocurricular/CocurricularModules'))

// Extracurricular
const ExtracurricularPrograms = lazy(() => import('./pages/extracurricular/ExtracurricularPrograms'))
const ExtracurricularSchedule = lazy(() => import('./pages/extracurricular/ExtracurricularSchedule'))
const CompetitionRecords = lazy(() => import('./pages/extracurricular/CompetitionRecords'))

// Monitoring & Evaluation
const VisitationLog = lazy(() => import('./pages/monitoringEvaluation/VisitationLog'))
const StudentReflection = lazy(() => import('./pages/monitoringEvaluation/StudentReflection'))

// Assessment
const ExamQuestions = lazy(() => import('./pages/assessment/ExamQuestions'))
const GradeList = lazy(() => import('./pages/assessment/GradeList'))
const MasteryCriteria = lazy(() => import('./pages/assessment/MasteryCriteria'))
const EvaluationAnalysis = lazy(() => import('./pages/assessment/EvaluationAnalysis'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
)

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AcademicYearProvider>
        <ProfileProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route element={<Layout />}>
                {/* Dashboard */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                {/* Data Siswa & Kelas */}
                <Route path="/data-siswa" element={<ProtectedRoute><DataSiswa /></ProtectedRoute>} />
                <Route path="/data-kelas" element={<ProtectedRoute><DataKelas /></ProtectedRoute>} />

                {/* Profile & Identity */}
                <Route path="/profile/teacher-profile" element={<ProtectedRoute><TeacherProfile /></ProtectedRoute>} />
                <Route path="/profile/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/profile/school-curriculum" element={<ProtectedRoute><SchoolCurriculum /></ProtectedRoute>} />
                <Route path="/profile/academic-calendar" element={<ProtectedRoute><AcademicCalendar /></ProtectedRoute>} />

                {/* Schedule & Attendance */}
                <Route path="/schedule-attendance/class-schedule" element={<ProtectedRoute><ClassSchedule /></ProtectedRoute>} />
                <Route path="/schedule-attendance/student-attendance" element={<ProtectedRoute><StudentAttendance /></ProtectedRoute>} />
                <Route path="/schedule-attendance/teaching-journal" element={<ProtectedRoute><TeachingJournal /></ProtectedRoute>} />
                <Route path="/schedule-attendance/attendance-report" element={<ProtectedRoute><AttendanceReport /></ProtectedRoute>} />
                <Route path="/schedule-attendance/journal-report" element={<ProtectedRoute><JournalReport /></ProtectedRoute>} />

                {/* Learning Planning */}
                <Route path="/learning-planning/atp-intracurricular" element={<ProtectedRoute><ATPIntracurricular /></ProtectedRoute>} />
                <Route path="/learning-planning/lesson-plans" element={<ProtectedRoute><LessonPlans /></ProtectedRoute>} />

                {/* Co-curricular */}
                <Route path="/cocurricular/schedule" element={<ProtectedRoute><CocurricularSchedule /></ProtectedRoute>} />
                <Route path="/cocurricular/programs" element={<ProtectedRoute><CocurricularPrograms /></ProtectedRoute>} />
                <Route path="/cocurricular/modules" element={<ProtectedRoute><CocurricularModules /></ProtectedRoute>} />

                {/* Extracurricular */}
                <Route path="/extracurricular/programs" element={<ProtectedRoute><ExtracurricularPrograms /></ProtectedRoute>} />
                <Route path="/extracurricular/schedule" element={<ProtectedRoute><ExtracurricularSchedule /></ProtectedRoute>} />
                <Route path="/extracurricular/competition-records" element={<ProtectedRoute><CompetitionRecords /></ProtectedRoute>} />

                {/* Monitoring & Evaluation */}
                <Route path="/monitoring-evaluation/visitation-log" element={<ProtectedRoute><VisitationLog /></ProtectedRoute>} />
                <Route path="/monitoring-evaluation/student-reflection" element={<ProtectedRoute><StudentReflection /></ProtectedRoute>} />

                {/* Assessment */}
                <Route path="/assessment/exam-questions" element={<ProtectedRoute><ExamQuestions /></ProtectedRoute>} />
                <Route path="/assessment/grade-list" element={<ProtectedRoute><GradeList /></ProtectedRoute>} />
                <Route path="/assessment/mastery-criteria" element={<ProtectedRoute><MasteryCriteria /></ProtectedRoute>} />
                <Route path="/assessment/evaluation-analysis" element={<ProtectedRoute><EvaluationAnalysis /></ProtectedRoute>} />
              </Route>
            </Routes>
          </Suspense>
        </ProfileProvider>
        </AcademicYearProvider>
      </NotificationProvider>
    </Router>
  )
}

export default App
