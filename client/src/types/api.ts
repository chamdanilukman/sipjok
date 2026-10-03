/**
 * API Response Types
 * These types match the database schema from shared/schema.ts
 */

// Base types
export interface User {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  name: string;
  nip?: string;
  school_name?: string;
  school_address?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  grade: string;
  academic_year: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  class_id: string;
  name: string;
  nis?: string;
  gender: 'L' | 'P';
  created_at: string;
  updated_at: string;
}

export interface ClassSchedule {
  id: string;
  teacher_id: string;
  class_id: string;
  day: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface TeachingJournal {
  id: string;
  teacher_id: string;
  class_id: string;
  tanggal: string;
  materi: string;
  kegiatan?: string;
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentAttendance {
  id: string;
  student_id: string;
  class_id: string;
  tanggal: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ModulAjar {
  id: string;
  teacher_id: string;
  atp_id?: string;
  judul: string;
  fase?: string;
  kelas?: string;
  elemen?: string;
  capaian_pembelajaran?: string;
  tujuan_pembelajaran?: string;
  alokasi_waktu?: string;
  pertemuan_ke?: number;
  profil_pelajar_pancasila?: string;
  sarana_prasarana?: string;
  target_peserta_didik?: string;
  model_pembelajaran?: string;
  kegiatan_pembelajaran?: string;
  asesmen?: string;
  pengayaan?: string;
  refleksi?: string;
  created_at: string;
  updated_at: string;
}

export interface AtpIntracurricular {
  id: string;
  teacher_id: string;
  judul: string;
  fase?: string;
  kelas?: string;
  elemen?: string;
  capaian_pembelajaran?: string;
  tujuan_pembelajaran?: string;
  alokasi_waktu?: string;
  created_at: string;
  updated_at: string;
}

export interface Kktp {
  id: string;
  teacher_id: string;
  class_id?: string;
  elemen: string;
  tujuan_pembelajaran: string;
  kriteria_ketuntasan: number;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion {
  id: string;
  teacher_id: string;
  question_text: string;
  question_type: string;
  options?: string;
  correct_answer?: string;
  difficulty?: string;
  topic?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentGrade {
  id: string;
  teacher_id: string;
  student_id: string;
  class_id: string;
  assessment_type: string;
  assessment_name: string;
  score: string;
  max_score: string;
  percentage?: string;
  is_passed?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CurriculumDocument {
  id: string;
  user_id: string;
  title: string;
  document_type: string;
  file_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_type?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// API Error Response
export interface ApiError {
  error: string;
  message?: string;
  code?: string;
  details?: any;
}

// Generic API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
