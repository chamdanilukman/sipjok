> **STATUS UPDATE (2026-10-03) — hasil audit kode aktual:**
>
> - Tugas 1–19: **SELESAI**. Seluruh 14 route API (`server/routes/*.ts`) ada, terdaftar di `server/routes.ts`, dan 15 hook frontend sudah memakai API client (`client/src/lib/api.ts`). Skrip migrasi `server/scripts/migrate-from-supabase.ts` lengkap untuk 14 tabel.
> - Tugas 20 (eksekusi migrasi data): **TERTUNGA EKSTERNAL** — butuh `DATABASE_URL` Railway asli; jalankan `npm run migrate:supabase`.
> - Tugas 21 (env): sisi kode selesai (`.env.example` lengkap); pengisian variabel di dashboard Railway eksternal.
> - Tugas 22 (deploy): sisi git selesai; push ke GitHub & verifikasi build Railway eksternal.
> - Tugas 23 (E2E): sebagian terverifikasi lokal (server boot, auth 401, 404 handler, DB connect); pengujian menyeluruh butuh env produksi.
> - Tugas 24 (performa): `migrations/add-indexes.sql` tersedia + code-splitting route diterapkan; monitoring metrik Railway eksternal.
> - Tugas 25 (dokumentasi & cleanup): README, `/api/health`, skrip `migrate:supabase`/`db:check`, pembersihan repo — selesai.
> - Delapan menu yang masih placeholder (3 Kokurikuler, 3 Ekstrakurikuler, Buku Kunjungan, Refleksi Siswa) **tidak termasuk scope spec ini** — belum pernah diimplementasikan sejak aplikasi referensi; lihat README bagian Roadmap.

# Implementation Plan: Migrate SIPJOK to Railway PostgreSQL

- [x] 1. Setup Railway PostgreSQL and Database Infrastructure



  - Configure Railway PostgreSQL database service
  - Set up DATABASE_URL environment variable in Railway
  - Install required dependencies (drizzle-orm, postgres, @supabase/supabase-js for server)
  - Create database connection module in server
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Define Complete Database Schema with Drizzle ORM



  - Define all 14 table schemas in shared/schema.ts (users, teacher_profile, classes, students, class_schedules, teaching_journal, student_attendance, modul_ajar, atp_intracurricular, kktp, exam_questions, student_grades, curriculum_documents, calendar_events)
  - Add foreign key relationships between tables
  - Add timestamp columns (created_at, updated_at) with defaults
  - Add indexes for frequently queried columns
  - Push schema to Railway PostgreSQL using drizzle-kit
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Create Authentication Middleware



  - Implement Supabase token verification middleware in server/middleware/auth.ts
  - Add user extraction from JWT token
  - Handle authentication errors (401 responses)
  - Test middleware with valid and invalid tokens
  - _Requirements: 3.3, 3.4, 4.5_

- [x] 4. Implement API Client Utility




  - Create API client class in client/src/lib/api.ts
  - Implement request method with automatic token injection
  - Add methods for GET, POST, PUT, DELETE operations
  - Handle API errors and return meaningful messages
  - _Requirements: 4.3, 4.4_

- [x] 5. Implement Classes API and Refactor Frontend



  - Create server/routes/classes.ts with CRUD endpoints
  - Implement GET /api/classes (list all for user)
  - Implement GET /api/classes/:id (get one)
  - Implement POST /api/classes (create)
  - Implement PUT /api/classes/:id (update)
  - Implement DELETE /api/classes/:id (delete)
  - Refactor client/src/hooks/useClasses.js to use API client
  - Test all class operations in UI
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_

- [x] 6. Implement Students API and Refactor Frontend



  - Create server/routes/students.ts with CRUD endpoints
  - Implement all CRUD operations for students
  - Add endpoint to get students by class_id
  - Refactor client/src/hooks/useStudents.js to use API client
  - Test student management in UI
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_

- [x] 7. Implement Class Schedules API and Refactor Frontend


  - Create server/routes/schedules.ts with CRUD endpoints
  - Implement schedule CRUD operations with class relationships
  - Add endpoint to get schedules by class_id
  - Refactor client/src/hooks/useClassSchedule.js to use API client
  - Test schedule management in UI
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_



- [ ] 8. Implement Teaching Journal API and Refactor Frontend
  - Create server/routes/journals.ts with CRUD endpoints
  - Implement journal CRUD operations with class relationships
  - Add filtering by date range
  - Refactor client/src/hooks/useTeachingJournal.js to use API client
  - Test journal entry and reporting in UI

  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_

- [ ] 9. Implement Student Attendance API and Refactor Frontend
  - Create server/routes/attendance.ts with CRUD endpoints
  - Implement attendance CRUD operations
  - Add bulk attendance recording endpoint
  - Add attendance reporting endpoints (by date, by student, by class)
  - Refactor client/src/hooks/useStudentAttendance.js to use API client

  - Test attendance recording and reporting in UI
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_

- [ ] 10. Implement Modul Ajar (Learning Modules) API and Refactor Frontend
  - Create server/routes/modul-ajar.ts with CRUD endpoints
  - Implement modul ajar CRUD operations
  - Add filtering by ATP and class


  - Refactor client/src/hooks/useModulAjar.js to use API client
  - Test modul ajar management in UI
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_

- [ ] 11. Implement ATP (Learning Flow) API and Refactor Frontend
  - Create server/routes/atp.ts with CRUD endpoints
  - Implement ATP CRUD operations

  - Add filtering by fase and grade
  - Add search functionality
  - Refactor client/src/hooks/useATP.js to use API client
  - Test ATP management in UI
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_

- [x] 12. Implement KKTP (Mastery Criteria) API and Refactor Frontend

  - Create server/routes/kktp.ts with CRUD endpoints
  - Implement KKTP CRUD operations
  - Add filtering by class and subject
  - Refactor client/src/hooks/useKKTP.js to use API client
  - Test KKTP management in UI
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_


- [ ] 13. Implement Exam Questions API and Refactor Frontend
  - Create server/routes/exam-questions.ts with CRUD endpoints
  - Implement exam questions CRUD operations
  - Add filtering by type and difficulty
  - Refactor client/src/hooks/useExamQuestions.js to use API client
  - Test exam question management in UI
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_

- [x] 14. Implement Student Grades API and Refactor Frontend

  - Create server/routes/grades.ts with CRUD endpoints
  - Implement grades CRUD operations
  - Add bulk grade entry endpoint
  - Add grade statistics endpoint
  - Add filtering by class, student, and assessment type
  - Refactor client/src/hooks/useGrades.js to use API client
  - Test grade entry and reporting in UI

  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_

- [ ] 15. Implement Teacher Profile API and Refactor Frontend
  - Create server/routes/teacher-profile.ts with CRUD endpoints
  - Implement teacher profile get and update operations
  - Refactor client/src/hooks/useTeacherProfile.js to use API client
  - Update ProfileContext to use API client


  - Test profile viewing and editing in UI
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_

- [ ] 16. Implement Curriculum Documents API and Refactor Frontend
  - Create server/routes/curriculum.ts with CRUD endpoints
  - Implement curriculum documents CRUD operations
  - Add document type filtering
  - Refactor client/src/hooks/useCurriculumDocuments.js to use API client
  - Test curriculum document management in UI
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_

- [ ] 17. Implement Calendar Events API and Refactor Frontend
  - Create server/routes/calendar.ts with CRUD endpoints
  - Implement calendar events CRUD operations
  - Add bulk event import endpoint
  - Add filtering by date range and event type
  - Refactor client/src/hooks/useCalendarEvents.js to use API client
  - Test calendar management and import in UI
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 6.2, 6.3_

- [x] 18. Update Dashboard to Use API Client


  - Refactor client/src/pages/Dashboard.jsx to use API client
  - Update all data fetching to use new API endpoints
  - Test dashboard statistics and charts
  - _Requirements: 4.1, 4.2, 6.2, 6.3_

- [-] 19. Create Data Migration Script

  - Create migration script in server/scripts/migrate-from-supabase.ts
  - Implement Supabase data export for all tables
  - Implement data transformation if needed
  - Implement Railway PostgreSQL data import
  - Add progress logging and error handling
  - Generate migration summary report
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 20. Execute Data Migration
  - Run migration script to export data from Supabase
  - Verify exported data completeness
  - Import data to Railway PostgreSQL
  - Verify all records migrated successfully
  - Check foreign key relationships
  - Compare record counts between Supabase and Railway
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 21. Update Environment Configuration
  - Add SUPABASE_SERVICE_ROLE_KEY to Railway environment variables
  - Verify DATABASE_URL is correctly set
  - Verify all VITE_ variables are set for frontend
  - Update .env.example with new variables
  - _Requirements: 7.2, 7.3_

- [ ] 22. Deploy to Railway and Verify
  - Commit all changes to Git
  - Push to GitHub repository
  - Verify Railway auto-deploys successfully
  - Check build logs for errors
  - Verify application starts without errors
  - Test application URL is accessible
  - _Requirements: 7.1, 7.3, 7.5_

- [ ] 23. Perform End-to-End Testing
  - Test login with Supabase Auth
  - Test all CRUD operations for each entity
  - Test data relationships (class → students, etc.)
  - Test search and filtering features
  - Test export/import features
  - Test all pages and navigation
  - Verify data persistence across sessions
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.4_

- [ ] 24. Performance Optimization and Monitoring
  - Add database indexes for frequently queried columns
  - Test query performance with realistic data volumes
  - Monitor Railway database metrics
  - Check API response times
  - Optimize slow queries if needed
  - _Requirements: 6.3, 7.4_

- [ ] 25. Documentation and Cleanup
  - Document API endpoints in README or API docs
  - Update deployment instructions
  - Remove unused Supabase database code
  - Clean up commented code
  - Update package.json scripts if needed
  - _Requirements: 7.4, 7.5_
