-- Add indexes for frequently queried columns to improve performance

-- Classes indexes
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year);

-- Students indexes
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_nis ON students(nis);

-- Class Schedules indexes
CREATE INDEX IF NOT EXISTS idx_class_schedules_teacher_id ON class_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_class_id ON class_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_day ON class_schedules(day);

-- Teaching Journal indexes
CREATE INDEX IF NOT EXISTS idx_teaching_journal_teacher_id ON teaching_journal(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teaching_journal_class_id ON teaching_journal(class_id);
CREATE INDEX IF NOT EXISTS idx_teaching_journal_tanggal ON teaching_journal(tanggal);
CREATE INDEX IF NOT EXISTS idx_teaching_journal_teacher_date ON teaching_journal(teacher_id, tanggal);

-- Student Attendance indexes
CREATE INDEX IF NOT EXISTS idx_student_attendance_student_id ON student_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_class_id ON student_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_tanggal ON student_attendance(tanggal);
CREATE INDEX IF NOT EXISTS idx_student_attendance_student_date ON student_attendance(student_id, tanggal);

-- Modul Ajar indexes
CREATE INDEX IF NOT EXISTS idx_modul_ajar_teacher_id ON modul_ajar(teacher_id);
CREATE INDEX IF NOT EXISTS idx_modul_ajar_atp_id ON modul_ajar(atp_id);
CREATE INDEX IF NOT EXISTS idx_modul_ajar_fase ON modul_ajar(fase);

-- ATP Intracurricular indexes
CREATE INDEX IF NOT EXISTS idx_atp_intracurricular_teacher_id ON atp_intracurricular(teacher_id);
CREATE INDEX IF NOT EXISTS idx_atp_intracurricular_fase ON atp_intracurricular(fase);

-- KKTP indexes
CREATE INDEX IF NOT EXISTS idx_kktp_teacher_id ON kktp(teacher_id);
CREATE INDEX IF NOT EXISTS idx_kktp_class_id ON kktp(class_id);

-- Exam Questions indexes
CREATE INDEX IF NOT EXISTS idx_exam_questions_teacher_id ON exam_questions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_type ON exam_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_exam_questions_difficulty ON exam_questions(difficulty);

-- Student Grades indexes
CREATE INDEX IF NOT EXISTS idx_student_grades_teacher_id ON student_grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_student_id ON student_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_class_id ON student_grades(class_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_assessment_type ON student_grades(assessment_type);

-- Curriculum Documents indexes
CREATE INDEX IF NOT EXISTS idx_curriculum_documents_user_id ON curriculum_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_documents_type ON curriculum_documents(document_type);

-- Calendar Events indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);

-- Teacher Profile index
CREATE INDEX IF NOT EXISTS idx_teacher_profile_user_id ON teacher_profile(user_id);
