import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { ProfileProvider } from './context/ProfileContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Auth
import Login from './pages/Login'

// Dashboard
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'

// Profile & Identity
import TeacherProfile from './pages/profile/TeacherProfile'
import SchoolCurriculum from './pages/profile/SchoolCurriculum'
import AcademicCalendar from './pages/profile/AcademicCalendar'

// Schedule & Attendance
import ClassSchedule from './pages/scheduleAttendance/ClassSchedule'
import StudentAttendance from './pages/scheduleAttendance/StudentAttendance'
import TeachingJournal from './pages/scheduleAttendance/TeachingJournal'
import AttendanceReport from './pages/scheduleAttendance/AttendanceReport'
import JournalReport from './pages/scheduleAttendance/JournalReport'

// Learning Planning
import ATPIntracurricular from './pages/learningPlanning/ATPIntracurricular'
import LessonPlans from './pages/learningPlanning/LessonPlans'

// Co-curricular
import CocurricularSchedule from './pages/cocurricular/CocurricularSchedule'
import CocurricularPrograms from './pages/cocurricular/CocurricularPrograms'
import CocurricularModules from './pages/cocurricular/CocurricularModules'

// Extracurricular
import ExtracurricularPrograms from './pages/extracurricular/ExtracurricularPrograms'
import ExtracurricularSchedule from './pages/extracurricular/ExtracurricularSchedule'
import CompetitionRecords from './pages/extracurricular/CompetitionRecords'

// Monitoring & Evaluation
import VisitationLog from './pages/monitoringEvaluation/VisitationLog'
import StudentReflection from './pages/monitoringEvaluation/StudentReflection'

// Assessment
import ExamQuestions from './pages/assessment/ExamQuestions'
import GradeList from './pages/assessment/GradeList'
import MasteryCriteria from './pages/assessment/MasteryCriteria'
import EvaluationAnalysis from './pages/assessment/EvaluationAnalysis'

function App() {
  return (
    <Router>
      <DataProvider>
        <ProfileProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<Layout />}>
              {/* Dashboard */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />

              {/* Profile & Identity */}
              <Route path="/profile/teacher-profile" element={<ProtectedRoute><TeacherProfile /></ProtectedRoute>} />
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
        </ProfileProvider>
      </DataProvider>
    </Router>
  )
}

export default App

