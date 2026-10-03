# Database Schema Documentation

## Overview
This document describes the complete database schema for the SIPJOK application using Railway PostgreSQL with Drizzle ORM.

## Tables

### 1. users
User accounts linked to Supabase Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | User ID (matches Supabase Auth user ID) |
| username | text | NOT NULL, UNIQUE | Username for login |
| password | text | NOT NULL | Hashed password |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Relationships:**
- One-to-one with teacher_profile
- One-to-many with classes, teaching_journal, modul_ajar, atp_intracurricular, kktp, exam_questions, student_grades, curriculum_documents, calendar_events

---

### 2. teacher_profile
Teacher information and profile details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | Profile ID |
| user_id | varchar(255) | NOT NULL, UNIQUE, FK → users.id | Reference to user account |
| name | text | NOT NULL | Teacher's full name |
| nip | varchar(50) | | Teacher ID number |
| school_name | text | | School name |
| school_address | text | | School address |
| phone | varchar(20) | | Contact phone number |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Profile creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Relationships:**
- Many-to-one with users

---

### 3. classes
Class/grade information managed by teachers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | Class ID |
| teacher_id | varchar(255) | NOT NULL, FK → users.id | Teacher who manages this class |
| name | text | NOT NULL | Class name (e.g., "Kelas 1A") |
| grade | varchar(10) | NOT NULL | Grade level (e.g., "1", "2", "3") |
| academic_year | varchar(20) | NOT NULL | Academic year (e.g., "2024/2025") |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Class creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_classes_teacher_id
- idx_classes_grade
- idx_classes_academic_year

**Relationships:**
- Many-to-one with users (teacher)
- One-to-many with students, class_schedules, teaching_journal, student_attendance

---

### 4. students
Student records within classes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | Student ID |
| class_id | varchar(255) | NOT NULL, FK → classes.id | Class the student belongs to |
| name | text | NOT NULL | Student's full name |
| nis | varchar(50) | | Student ID number |
| gender | varchar(1) | NOT NULL | Gender (L=Laki-laki, P=Perempuan) |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_students_class_id
- idx_students_nis

**Relationships:**
- Many-to-one with classes
- One-to-many with student_attendance, student_grades

---

### 5. class_schedules
Weekly class schedules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | Schedule ID |
| teacher_id | varchar(255) | NOT NULL, FK → users.id | Teacher for this schedule |
| class_id | varchar(255) | NOT NULL, FK → classes.id | Class for this schedule |
| day | varchar(20) | NOT NULL | Day of week (Senin, Selasa, etc.) |
| start_time | varchar(10) | NOT NULL | Start time (HH:MM format) |
| end_time | varchar(10) | NOT NULL | End time (HH:MM format) |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Schedule creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_class_schedules_teacher_id
- idx_class_schedules_class_id
- idx_class_schedules_day

**Relationships:**
- Many-to-one with users (teacher)
- Many-to-one with classes

---

### 6. teaching_journal
Daily teaching activity logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | Journal entry ID |
| teacher_id | varchar(255) | NOT NULL, FK → users.id | Teacher who created the entry |
| class_id | varchar(255) | NOT NULL, FK → classes.id | Class for this entry |
| tanggal | timestamp | NOT NULL | Date of teaching activity |
| materi | text | NOT NULL | Teaching material/topic |
| kegiatan | text | | Activities conducted |
| catatan | text | | Additional notes |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Entry creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_teaching_journal_teacher_id
- idx_teaching_journal_class_id
- idx_teaching_journal_tanggal
- idx_teaching_journal_teacher_date (composite)

**Relationships:**
- Many-to-one with users (teacher)
- Many-to-one with classes

---

### 7. student_attendance
Student attendance records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | Attendance record ID |
| student_id | varchar(255) | NOT NULL, FK → students.id | Student being recorded |
| class_id | varchar(255) | NOT NULL, FK → classes.id | Class context |
| tanggal | timestamp | NOT NULL | Date of attendance |
| status | varchar(20) | NOT NULL | Status (Hadir, Sakit, Izin, Alpa) |
| notes | text | | Additional notes |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_student_attendance_student_id
- idx_student_attendance_class_id
- idx_student_attendance_tanggal
- idx_student_attendance_student_date (composite)

**Relationships:**
- Many-to-one with students
- Many-to-one with classes

---

### 8. modul_ajar
Learning modules (lesson plans).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | Module ID |
| teacher_id | varchar(255) | NOT NULL, FK → users.id | Teacher who created the module |
| atp_id | varchar(255) | | Reference to ATP (optional) |
| judul | text | NOT NULL | Module title |
| fase | varchar(10) | | Learning phase |
| kelas | varchar(50) | | Target grade/class |
| elemen | text | | Learning elements |
| capaian_pembelajaran | text | | Learning achievements |
| tujuan_pembelajaran | text | | Learning objectives |
| alokasi_waktu | varchar(50) | | Time allocation |
| pertemuan_ke | integer | | Meeting number |
| profil_pelajar_pancasila | text | | Pancasila student profile |
| sarana_prasarana | text | | Facilities and infrastructure |
| target_peserta_didik | text | | Target students |
| model_pembelajaran | text | | Learning model |
| kegiatan_pembelajaran | text | | Learning activities |
| asesmen | text | | Assessment methods |
| pengayaan | text | | Enrichment activities |
| refleksi | text | | Reflection notes |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Module creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_modul_ajar_teacher_id
- idx_modul_ajar_atp_id
- idx_modul_ajar_fase

**Relationships:**
- Many-to-one with users (teacher)

---

### 9. atp_intracurricular
Learning flow documents (Alur Tujuan Pembelajaran).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | ATP ID |
| teacher_id | varchar(255) | NOT NULL, FK → users.id | Teacher who created the ATP |
| judul | text | NOT NULL | ATP title |
| fase | varchar(10) | | Learning phase |
| kelas | varchar(50) | | Target grade/class |
| elemen | text | | Learning elements |
| capaian_pembelajaran | text | | Learning achievements |
| tujuan_pembelajaran | text | | Learning objectives |
| alokasi_waktu | varchar(50) | | Time allocation |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | ATP creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_atp_intracurricular_teacher_id
- idx_atp_intracurricular_fase

**Relationships:**
- Many-to-one with users (teacher)

---

### 10. kktp
Mastery criteria (Kriteria Ketercapaian Tujuan Pembelajaran).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | KKTP ID |
| teacher_id | varchar(255) | NOT NULL, FK → users.id | Teacher who created the criteria |
| class_id | varchar(255) | | Related class (optional) |
| elemen | text | NOT NULL | Learning element |
| tujuan_pembelajaran | text | NOT NULL | Learning objective |
| kriteria_ketuntasan | integer | NOT NULL | Mastery threshold (percentage) |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Criteria creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_kktp_teacher_id
- idx_kktp_class_id

**Relationships:**
- Many-to-one with users (teacher)

---

### 11. exam_questions
Assessment question bank.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | Question ID |
| teacher_id | varchar(255) | NOT NULL, FK → users.id | Teacher who created the question |
| question_text | text | NOT NULL | Question content |
| question_type | varchar(50) | NOT NULL | Type (Multiple Choice, Essay, etc.) |
| options | text | | JSON string for multiple choice options |
| correct_answer | text | | Correct answer |
| difficulty | varchar(20) | | Difficulty level (Easy, Medium, Hard) |
| topic | text | | Question topic |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Question creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_exam_questions_teacher_id
- idx_exam_questions_type
- idx_exam_questions_difficulty

**Relationships:**
- Many-to-one with users (teacher)

---

### 12. student_grades
Student assessment scores and grades.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | Grade record ID |
| teacher_id | varchar(255) | NOT NULL, FK → users.id | Teacher who recorded the grade |
| student_id | varchar(255) | NOT NULL, FK → students.id | Student being graded |
| class_id | varchar(255) | NOT NULL, FK → classes.id | Class context |
| assessment_type | varchar(50) | NOT NULL | Type (Formatif, Sumatif, etc.) |
| assessment_name | text | NOT NULL | Assessment name |
| score | decimal(5,2) | NOT NULL | Score achieved |
| max_score | decimal(5,2) | NOT NULL | Maximum possible score |
| percentage | decimal(5,2) | | Percentage score |
| is_passed | boolean | | Whether student passed |
| notes | text | | Additional notes |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Grade creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_student_grades_teacher_id
- idx_student_grades_student_id
- idx_student_grades_class_id
- idx_student_grades_assessment_type

**Relationships:**
- Many-to-one with users (teacher)
- Many-to-one with students
- Many-to-one with classes

---

### 13. curriculum_documents
School curriculum and related documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | Document ID |
| user_id | varchar(255) | NOT NULL, FK → users.id | User who uploaded the document |
| title | text | NOT NULL | Document title |
| document_type | varchar(50) | NOT NULL | Type (Kurikulum, Silabus, etc.) |
| file_url | text | | URL to document file |
| description | text | | Document description |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Document creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_curriculum_documents_user_id
- idx_curriculum_documents_type

**Relationships:**
- Many-to-one with users

---

### 14. calendar_events
Academic calendar events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | varchar(255) | PRIMARY KEY, DEFAULT uuid | Event ID |
| user_id | varchar(255) | NOT NULL, FK → users.id | User who created the event |
| title | text | NOT NULL | Event title |
| event_type | varchar(50) | | Type (Libur, Ujian, Kegiatan, etc.) |
| start_date | timestamp | NOT NULL | Event start date |
| end_date | timestamp | | Event end date (optional) |
| description | text | | Event description |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | Event creation timestamp |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- idx_calendar_events_user_id
- idx_calendar_events_start_date
- idx_calendar_events_type

**Relationships:**
- Many-to-one with users

---

## Entity Relationship Diagram

```
users (1) ──── (1) teacher_profile
  │
  ├── (1:N) classes
  │     │
  │     ├── (1:N) students
  │     │     │
  │     │     ├── (1:N) student_attendance
  │     │     └── (1:N) student_grades
  │     │
  │     ├── (1:N) class_schedules
  │     ├── (1:N) teaching_journal
  │     └── (1:N) student_attendance
  │
  ├── (1:N) modul_ajar
  ├── (1:N) atp_intracurricular
  ├── (1:N) kktp
  ├── (1:N) exam_questions
  ├── (1:N) student_grades
  ├── (1:N) curriculum_documents
  └── (1:N) calendar_events
```

## Migration Notes

### From Supabase to Railway
- All tables use `varchar(255)` for IDs to maintain compatibility with Supabase UUIDs
- Foreign keys use `ON DELETE CASCADE` to maintain referential integrity
- All tables include `created_at` and `updated_at` timestamps
- Indexes are added for frequently queried columns to optimize performance

### Applying Schema
```bash
# Push schema to Railway PostgreSQL
npm run db:push

# Apply indexes (after schema is pushed)
psql $DATABASE_URL < migrations/add-indexes.sql
```
