import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  teacherProfile: one(teacherProfile, {
    fields: [users.id],
    references: [teacherProfile.user_id],
  }),
  classes: many(classes),
  teachingJournals: many(teachingJournal),
  modulAjar: many(modulAjar),
  atpIntracurricular: many(atpIntracurricular),
  kktp: many(kktp),
  examQuestions: many(examQuestions),
  studentGrades: many(studentGrades),
  curriculumDocuments: many(curriculumDocuments),
  calendarEvents: many(calendarEvents),
}));

// ============================================================================
// TEACHER PROFILE TABLE
// ============================================================================
export const teacherProfile = pgTable("teacher_profile", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  name: text("name").notNull(),
  nip: varchar("nip", { length: 50 }),
  school_name: text("school_name"),
  school_address: text("school_address"),
  phone: varchar("phone", { length: 20 }),
  profile_photo_url: text("profile_photo_url"),
  profile_photo_path: text("profile_photo_path"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const teacherProfileRelations = relations(teacherProfile, ({ one }) => ({
  user: one(users, {
    fields: [teacherProfile.user_id],
    references: [users.id],
  }),
}));

// ============================================================================
// CLASSES TABLE
// ============================================================================
export const classes = pgTable("classes", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  grade: varchar("grade", { length: 10 }).notNull(),
  academic_year: varchar("academic_year", { length: 20 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacher_id],
    references: [users.id],
  }),
  students: many(students),
  classSchedules: many(classSchedules),
  teachingJournals: many(teachingJournal),
  studentAttendance: many(studentAttendance),
}));

// ============================================================================
// STUDENTS TABLE
// ============================================================================
export const students = pgTable("students", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  class_id: varchar("class_id", { length: 255 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  nis: varchar("nis", { length: 50 }),
  gender: varchar("gender", { length: 1 }).notNull(), // L or P
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, {
    fields: [students.class_id],
    references: [classes.id],
  }),
  attendance: many(studentAttendance),
  grades: many(studentGrades),
}));

// ============================================================================
// CLASS SCHEDULES TABLE
// ============================================================================
export const classSchedules = pgTable("class_schedules", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  class_id: varchar("class_id", { length: 255 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 50 }),
  day_of_week: integer("day_of_week").notNull(), // 0=Senin ... 6=Minggu
  time_start: varchar("time_start", { length: 10 }).notNull(), // HH:MM
  time_end: varchar("time_end", { length: 10 }).notNull(), // HH:MM
  room: varchar("room", { length: 100 }),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const classSchedulesRelations = relations(classSchedules, ({ one }) => ({
  teacher: one(users, {
    fields: [classSchedules.teacher_id],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [classSchedules.class_id],
    references: [classes.id],
  }),
}));

// ============================================================================
// TEACHING JOURNAL TABLE
// ============================================================================
export const teachingJournal = pgTable("teaching_journal", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  class_id: varchar("class_id", { length: 255 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
  tanggal: date("tanggal").notNull(),
  materi: text("materi").notNull(),
  kegiatan: text("kegiatan"),
  catatan: text("catatan"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const teachingJournalRelations = relations(teachingJournal, ({ one }) => ({
  teacher: one(users, {
    fields: [teachingJournal.teacher_id],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [teachingJournal.class_id],
    references: [classes.id],
  }),
}));

// ============================================================================
// STUDENT ATTENDANCE TABLE
// ============================================================================
export const studentAttendance = pgTable("student_attendance", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  student_id: varchar("student_id", { length: 255 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  class_id: varchar("class_id", { length: 255 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
  tanggal: date("tanggal").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // Hadir, Sakit, Izin, Alpa
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const studentAttendanceRelations = relations(studentAttendance, ({ one }) => ({
  student: one(students, {
    fields: [studentAttendance.student_id],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [studentAttendance.class_id],
    references: [classes.id],
  }),
}));

// ============================================================================
// MODUL AJAR (LEARNING MODULES) TABLE
// ============================================================================
export const modulAjar = pgTable("modul_ajar", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  atp_id: varchar("atp_id", { length: 255 }),
  judul: text("judul").notNull(),
  fase: varchar("fase", { length: 10 }),
  kelas: varchar("kelas", { length: 50 }),
  elemen: text("elemen"),
  capaian_pembelajaran: text("capaian_pembelajaran"),
  tujuan_pembelajaran: text("tujuan_pembelajaran"),
  alokasi_waktu: varchar("alokasi_waktu", { length: 50 }),
  pertemuan_ke: integer("pertemuan_ke"),
  profil_pelajar_pancasila: text("profil_pelajar_pancasila"),
  sarana_prasarana: text("sarana_prasarana"),
  target_peserta_didik: text("target_peserta_didik"),
  model_pembelajaran: text("model_pembelajaran"),
  kegiatan_pembelajaran: text("kegiatan_pembelajaran"),
  asesmen: text("asesmen"),
  pengayaan: text("pengayaan"),
  refleksi: text("refleksi"),
  file_url: text("file_url"),
  file_name: text("file_name"),
  file_type: text("file_type"),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft | approved
  data: jsonb("data"), // payload lengkap wizard Modul Ajar (bentuk asli UI)
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const modulAjarRelations = relations(modulAjar, ({ one }) => ({
  teacher: one(users, {
    fields: [modulAjar.teacher_id],
    references: [users.id],
  }),
}));

// ============================================================================
// ATP INTRACURRICULAR (LEARNING FLOW) TABLE
// ============================================================================
export const atpIntracurricular = pgTable("atp_intracurricular", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  mata_pelajaran: varchar("mata_pelajaran", { length: 50 }),
  fase: varchar("fase", { length: 10 }),
  kelas: varchar("kelas", { length: 50 }),
  elemen: text("elemen"),
  capaian_pembelajaran: text("capaian_pembelajaran"),
  tujuan_pembelajaran: jsonb("tujuan_pembelajaran"), // [{id, text}]
  alokasi_waktu: integer("alokasi_waktu"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const atpIntracurricularRelations = relations(atpIntracurricular, ({ one }) => ({
  teacher: one(users, {
    fields: [atpIntracurricular.teacher_id],
    references: [users.id],
  }),
}));

// ============================================================================
// KKTP (MASTERY CRITERIA) TABLE
// ============================================================================
export const kktp = pgTable("kktp", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  class_id: varchar("class_id", { length: 255 }),
  subject: varchar("subject", { length: 50 }).notNull(),
  fase: varchar("fase", { length: 10 }),
  kelas: varchar("kelas", { length: 10 }),
  tujuan_pembelajaran: text("tujuan_pembelajaran").notNull(),
  kktp_percentage: integer("kktp_percentage").notNull(), // batas ketuntasan (%)
  indicators: jsonb("indicators"), // [{level, min_score, max_score, description}]
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const kktpRelations = relations(kktp, ({ one }) => ({
  teacher: one(users, {
    fields: [kktp.teacher_id],
    references: [users.id],
  }),
}));

// ============================================================================
// EXAM QUESTIONS TABLE
// ============================================================================
export const examQuestions = pgTable("exam_questions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  question_text: text("question_text").notNull(),
  question_type: varchar("question_type", { length: 50 }).notNull(), // Multiple Choice, Essay, etc.
  options: text("options"), // JSON string for multiple choice options
  correct_answer: text("correct_answer"),
  answer_key: text("answer_key"), // pembahasan/jawaban untuk soal essay
  difficulty: varchar("difficulty", { length: 20 }), // Easy, Medium, Hard
  topic: text("topic"),
  title: text("title"),
  subject: text("subject"),
  fase: varchar("fase", { length: 10 }),
  kelas: varchar("kelas", { length: 10 }),
  points: integer("points"),
  tags: jsonb("tags"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const examQuestionsRelations = relations(examQuestions, ({ one }) => ({
  teacher: one(users, {
    fields: [examQuestions.teacher_id],
    references: [users.id],
  }),
}));

// ============================================================================
// STUDENT GRADES TABLE
// ============================================================================
export const studentGrades = pgTable("student_grades", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  student_id: varchar("student_id", { length: 255 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  class_id: varchar("class_id", { length: 255 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
  assessment_type: varchar("assessment_type", { length: 50 }).notNull(), // daily_test, midterm, final, practical, project, attitude
  assessment_title: text("assessment_title").notNull(),
  assessment_date: date("assessment_date"),
  subject: varchar("subject", { length: 50 }),
  kktp_id: varchar("kktp_id", { length: 255 }),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  max_score: decimal("max_score", { precision: 5, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  is_passed: boolean("is_passed"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const studentGradesRelations = relations(studentGrades, ({ one }) => ({
  teacher: one(users, {
    fields: [studentGrades.teacher_id],
    references: [users.id],
  }),
  student: one(students, {
    fields: [studentGrades.student_id],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [studentGrades.class_id],
    references: [classes.id],
  }),
}));

// ============================================================================
// CURRICULUM DOCUMENTS TABLE
// ============================================================================
export const curriculumDocuments = pgTable("curriculum_documents", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  document_type: varchar("document_type", { length: 50 }).notNull(), // Kurikulum, Silabus, etc.
  file_url: text("file_url"),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const curriculumDocumentsRelations = relations(curriculumDocuments, ({ one }) => ({
  user: one(users, {
    fields: [curriculumDocuments.user_id],
    references: [users.id],
  }),
}));

// ============================================================================
// CALENDAR EVENTS TABLE
// ============================================================================
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  kategori: varchar("kategori", { length: 50 }).default("kegiatan"), // pembelajaran, ujian, kegiatan, libur, kurikulum
  tanggal_mulai: date("tanggal_mulai").notNull(),
  tanggal_selesai: date("tanggal_selesai"),
  jam_mulai: varchar("jam_mulai", { length: 10 }),
  jam_selesai: varchar("jam_selesai", { length: 10 }),
  lokasi: text("lokasi"),
  deskripsi: text("deskripsi"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  user: one(users, {
    fields: [calendarEvents.user_id],
    references: [users.id],
  }),
}));

// ============================================================================
// COCURRICULAR PROGRAMS TABLE (Kokurikuler — permendikdasmen 13/2025:
// kegiatan penguatan 8 dimensi profil lulusan, menggantikan istilah P5)
// ============================================================================
export const cocurricularPrograms = pgTable("cocurricular_programs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  tema: varchar("tema", { length: 100 }), // tema kokurikuler, mis. Bangunlah Jiwa dan Raganya
  topik: varchar("topik", { length: 150 }), // mis. Gaya Hidup Sehat
  fase: varchar("fase", { length: 10 }),
  kelas: varchar("kelas", { length: 20 }),
  dimensi: jsonb("dimensi"), // array key 8 dimensi profil lulusan
  deskripsi: text("deskripsi"),
  tujuan_kegiatan: text("tujuan_kegiatan"),
  alokasi_waktu: varchar("alokasi_waktu", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("rencana"), // rencana | berjalan | selesai
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const cocurricularProgramsRelations = relations(cocurricularPrograms, ({ one }) => ({
  teacher: one(users, {
    fields: [cocurricularPrograms.teacher_id],
    references: [users.id],
  }),
}));

// ============================================================================
// COCURRICULAR SCHEDULES TABLE — jadwal rutin kegiatan kokurikuler
// ============================================================================
export const cocurricularSchedules = pgTable("cocurricular_schedules", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  program_id: varchar("program_id", { length: 255 }).references(() => cocurricularPrograms.id, { onDelete: "set null" }),
  kegiatan: text("kegiatan").notNull(),
  day_of_week: integer("day_of_week").notNull(), // 0=Senin ... 6=Minggu
  jam_mulai: varchar("jam_mulai", { length: 10 }),
  jam_selesai: varchar("jam_selesai", { length: 10 }),
  lokasi: varchar("lokasi", { length: 150 }),
  keterangan: text("keterangan"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const cocurricularSchedulesRelations = relations(cocurricularSchedules, ({ one }) => ({
  teacher: one(users, {
    fields: [cocurricularSchedules.teacher_id],
    references: [users.id],
  }),
  program: one(cocurricularPrograms, {
    fields: [cocurricularSchedules.program_id],
    references: [cocurricularPrograms.id],
  }),
}));

// ============================================================================
// COCURRICULAR MODULES TABLE — repositori materi/modul kegiatan kokurikuler
// ============================================================================
export const cocurricularModules = pgTable("cocurricular_modules", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  program_id: varchar("program_id", { length: 255 }).references(() => cocurricularPrograms.id, { onDelete: "set null" }),
  judul: text("judul").notNull(),
  tema: varchar("tema", { length: 100 }),
  topik: varchar("topik", { length: 150 }),
  fase: varchar("fase", { length: 10 }),
  kelas: varchar("kelas", { length: 20 }),
  deskripsi: text("deskripsi"),
  konten_materi: text("konten_materi"),
  file_url: text("file_url"),
  file_name: text("file_name"),
  file_type: text("file_type"),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft | publikasi
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const cocurricularModulesRelations = relations(cocurricularModules, ({ one }) => ({
  teacher: one(users, {
    fields: [cocurricularModules.teacher_id],
    references: [users.id],
  }),
  program: one(cocurricularPrograms, {
    fields: [cocurricularModules.program_id],
    references: [cocurricularPrograms.id],
  }),
}));

// ============================================================================
// EXTRACURRICULAR PROGRAMS TABLE (Permendikdasmen 13/2025: ekstrakurikuler
// wajib diselenggarakan, siswa mengikuti minimal satu kegiatan)
// ============================================================================
export const extracurricularPrograms = pgTable("extracurricular_programs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  nama: text("nama").notNull(),
  kategori: varchar("kategori", { length: 50 }).default("olahraga"), // olahraga | seni | keagamaan | kepemimpinan | teknologi
  pembina: varchar("pembina", { length: 150 }),
  lokasi: varchar("lokasi", { length: 150 }),
  deskripsi: text("deskripsi"),
  target: varchar("target", { length: 200 }), // target kegiatan/prestasi
  status: varchar("status", { length: 20 }).notNull().default("aktif"), // aktif | nonaktif
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const extracurricularProgramsRelations = relations(extracurricularPrograms, ({ one }) => ({
  teacher: one(users, {
    fields: [extracurricularPrograms.teacher_id],
    references: [users.id],
  }),
}));

// ============================================================================
// EXTRACURRICULAR SCHEDULES TABLE — jadwal latihan/sesi ekstrakurikuler
// ============================================================================
export const extracurricularSchedules = pgTable("extracurricular_schedules", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  program_id: varchar("program_id", { length: 255 }).references(() => extracurricularPrograms.id, { onDelete: "set null" }),
  kegiatan: text("kegiatan").notNull(),
  day_of_week: integer("day_of_week").notNull(), // 0=Senin ... 6=Minggu
  jam_mulai: varchar("jam_mulai", { length: 10 }),
  jam_selesai: varchar("jam_selesai", { length: 10 }),
  lokasi: varchar("lokasi", { length: 150 }),
  pembina: varchar("pembina", { length: 150 }),
  keterangan: text("keterangan"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const extracurricularSchedulesRelations = relations(extracurricularSchedules, ({ one }) => ({
  teacher: one(users, {
    fields: [extracurricularSchedules.teacher_id],
    references: [users.id],
  }),
  program: one(extracurricularPrograms, {
    fields: [extracurricularSchedules.program_id],
    references: [extracurricularPrograms.id],
  }),
}));

// ============================================================================
// COMPETITION RECORDS TABLE — catatan peserta lomba & prestasi siswa
// (alur kompetisi: O2SN kecamatan → POPDA/Kejurda kabupaten → PROVDA provinsi → POPNAS)
// ============================================================================
export const competitionRecords = pgTable("competition_records", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  student_id: varchar("student_id", { length: 255 }).references(() => students.id, { onDelete: "set null" }),
  nama_peserta: varchar("nama_peserta", { length: 150 }).notNull(),
  nama_lomba: text("nama_lomba").notNull(),
  tingkat: varchar("tingkat", { length: 50 }).notNull(), // sekolah | kecamatan | kabupaten | provinsi | nasional | internasional
  jenis: varchar("jenis", { length: 50 }).default("olahraga"), // olahraga | seni | akademik
  cabang: varchar("cabang", { length: 100 }), // cabang/nomor lomba, mis. Atletik Kids - Kanga Escape
  penyelenggara: varchar("penyelenggara", { length: 200 }),
  tempat: varchar("tempat", { length: 200 }),
  tanggal_lomba: date("tanggal_lomba"),
  hasil: varchar("hasil", { length: 50 }), // Juara 1 | Juara 2 | Juara 3 | Harapan | Finalis | Peserta
  peringkat: integer("peringkat"),
  catatan: text("catatan"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const competitionRecordsRelations = relations(competitionRecords, ({ one }) => ({
  teacher: one(users, {
    fields: [competitionRecords.teacher_id],
    references: [users.id],
  }),
  student: one(students, {
    fields: [competitionRecords.student_id],
    references: [students.id],
  }),
}));

// ============================================================================
// VISITATION LOGS TABLE — buku kunjungan/visitasi kelas (supervisi kepala
// sekolah, pengawas, atau kunjungan guru ke sarana & kelas lain)
// ============================================================================
export const visitationLogs = pgTable("visitation_logs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  tanggal: date("tanggal").notNull(),
  jam_mulai: varchar("jam_mulai", { length: 10 }),
  jam_selesai: varchar("jam_selesai", { length: 10 }),
  class_id: varchar("class_id", { length: 255 }).references(() => classes.id, { onDelete: "set null" }),
  lokasi: varchar("lokasi", { length: 150 }),
  pengunjung: varchar("pengunjung", { length: 150 }).notNull(),
  jabatan: varchar("jabatan", { length: 50 }), // Kepala Sekolah | Pengawas | Dinas | Guru
  jenis: varchar("jenis", { length: 50 }).default("Supervisi Pembelajaran"),
  materi: varchar("materi", { length: 200 }),
  hasil_observasi: text("hasil_observasi"),
  rekomendasi: text("rekomendasi"),
  tindak_lanjut: text("tindak_lanjut"),
  status: varchar("status", { length: 20 }).notNull().default("selesai"), // terjadwal | selesai
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const visitationLogsRelations = relations(visitationLogs, ({ one }) => ({
  teacher: one(users, {
    fields: [visitationLogs.teacher_id],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [visitationLogs.class_id],
    references: [classes.id],
  }),
}));

// ============================================================================
// STUDENT REFLECTIONS TABLE — refleksi diri siswa pasca pembelajaran PJOK
// (pengalaman belajar "merefleksi" dalam kerangka Pembelajaran Mendalam)
// ============================================================================
export const studentReflections = pgTable("student_reflections", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  student_id: varchar("student_id", { length: 255 }).notNull().references(() => students.id, { onDelete: "cascade" }),
  class_id: varchar("class_id", { length: 255 }).notNull().references(() => classes.id, { onDelete: "cascade" }),
  tanggal: date("tanggal").notNull(),
  materi: varchar("materi", { length: 200 }),
  perasaan: varchar("perasaan", { length: 20 }), // senang | biasa | sedih
  tingkat_pemahaman: integer("tingkat_pemahaman"), // 1-5
  yang_dipelajari: text("yang_dipelajari"),
  kesulitan: text("kesulitan"),
  rencana: text("rencana"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const studentReflectionsRelations = relations(studentReflections, ({ one }) => ({
  teacher: one(users, {
    fields: [studentReflections.teacher_id],
    references: [users.id],
  }),
  student: one(students, {
    fields: [studentReflections.student_id],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [studentReflections.class_id],
    references: [classes.id],
  }),
}));

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

// Users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
export const selectUserSchema = createSelectSchema(users);

// Teacher Profile
export const insertTeacherProfileSchema = createInsertSchema(teacherProfile).omit({
  user_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectTeacherProfileSchema = createSelectSchema(teacherProfile);

// Classes
export const insertClassSchema = createInsertSchema(classes).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectClassSchema = createSelectSchema(classes);

// Students
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectStudentSchema = createSelectSchema(students);

// Class Schedules
export const insertClassScheduleSchema = createInsertSchema(classSchedules).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectClassScheduleSchema = createSelectSchema(classSchedules);

// Teaching Journal
export const insertTeachingJournalSchema = createInsertSchema(teachingJournal).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectTeachingJournalSchema = createSelectSchema(teachingJournal);

// Student Attendance
export const insertStudentAttendanceSchema = createInsertSchema(studentAttendance).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectStudentAttendanceSchema = createSelectSchema(studentAttendance);

// Modul Ajar
export const insertModulAjarSchema = createInsertSchema(modulAjar).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectModulAjarSchema = createSelectSchema(modulAjar);

// ATP Intracurricular
export const insertAtpIntracurricularSchema = createInsertSchema(atpIntracurricular).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectAtpIntracurricularSchema = createSelectSchema(atpIntracurricular);

// KKTP
export const insertKktpSchema = createInsertSchema(kktp).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectKktpSchema = createSelectSchema(kktp);

// Exam Questions
export const insertExamQuestionSchema = createInsertSchema(examQuestions).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectExamQuestionSchema = createSelectSchema(examQuestions);

// Student Grades
// score/max_score numeric — terima angka maupun string dari client
export const insertStudentGradeSchema = createInsertSchema(studentGrades, {
  score: z.coerce.string(),
  max_score: z.coerce.string(),
}).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectStudentGradeSchema = createSelectSchema(studentGrades);

// Curriculum Documents
export const insertCurriculumDocumentSchema = createInsertSchema(curriculumDocuments).omit({
  user_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectCurriculumDocumentSchema = createSelectSchema(curriculumDocuments);

// Calendar Events
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  user_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectCalendarEventSchema = createSelectSchema(calendarEvents);

// Cocurricular Programs
export const insertCocurricularProgramSchema = createInsertSchema(cocurricularPrograms).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectCocurricularProgramSchema = createSelectSchema(cocurricularPrograms);

// Cocurricular Schedules
export const insertCocurricularScheduleSchema = createInsertSchema(cocurricularSchedules).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectCocurricularScheduleSchema = createSelectSchema(cocurricularSchedules);

// Cocurricular Modules
export const insertCocurricularModuleSchema = createInsertSchema(cocurricularModules).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectCocurricularModuleSchema = createSelectSchema(cocurricularModules);

// Extracurricular Programs
export const insertExtracurricularProgramSchema = createInsertSchema(extracurricularPrograms).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectExtracurricularProgramSchema = createSelectSchema(extracurricularPrograms);

// Extracurricular Schedules
export const insertExtracurricularScheduleSchema = createInsertSchema(extracurricularSchedules).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectExtracurricularScheduleSchema = createSelectSchema(extracurricularSchedules);

// Competition Records
export const insertCompetitionRecordSchema = createInsertSchema(competitionRecords).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectCompetitionRecordSchema = createSelectSchema(competitionRecords);

// Visitation Logs
export const insertVisitationLogSchema = createInsertSchema(visitationLogs).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectVisitationLogSchema = createSelectSchema(visitationLogs);

// Student Reflections
export const insertStudentReflectionSchema = createInsertSchema(studentReflections).omit({
  teacher_id: true,
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectStudentReflectionSchema = createSelectSchema(studentReflections);

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTeacherProfile = z.infer<typeof insertTeacherProfileSchema>;
export type TeacherProfile = typeof teacherProfile.$inferSelect;

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertClassSchedule = z.infer<typeof insertClassScheduleSchema>;
export type ClassSchedule = typeof classSchedules.$inferSelect;

export type InsertTeachingJournal = z.infer<typeof insertTeachingJournalSchema>;
export type TeachingJournal = typeof teachingJournal.$inferSelect;

export type InsertStudentAttendance = z.infer<typeof insertStudentAttendanceSchema>;
export type StudentAttendance = typeof studentAttendance.$inferSelect;

export type InsertModulAjar = z.infer<typeof insertModulAjarSchema>;
export type ModulAjar = typeof modulAjar.$inferSelect;

export type InsertAtpIntracurricular = z.infer<typeof insertAtpIntracurricularSchema>;
export type AtpIntracurricular = typeof atpIntracurricular.$inferSelect;

export type InsertKktp = z.infer<typeof insertKktpSchema>;
export type Kktp = typeof kktp.$inferSelect;

export type InsertExamQuestion = z.infer<typeof insertExamQuestionSchema>;
export type ExamQuestion = typeof examQuestions.$inferSelect;

export type InsertStudentGrade = z.infer<typeof insertStudentGradeSchema>;
export type StudentGrade = typeof studentGrades.$inferSelect;

export type InsertCurriculumDocument = z.infer<typeof insertCurriculumDocumentSchema>;
export type CurriculumDocument = typeof curriculumDocuments.$inferSelect;

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

export type InsertCocurricularProgram = z.infer<typeof insertCocurricularProgramSchema>;
export type CocurricularProgram = typeof cocurricularPrograms.$inferSelect;

export type InsertCocurricularSchedule = z.infer<typeof insertCocurricularScheduleSchema>;
export type CocurricularSchedule = typeof cocurricularSchedules.$inferSelect;

export type InsertCocurricularModule = z.infer<typeof insertCocurricularModuleSchema>;
export type CocurricularModule = typeof cocurricularModules.$inferSelect;

export type InsertExtracurricularProgram = z.infer<typeof insertExtracurricularProgramSchema>;
export type ExtracurricularProgram = typeof extracurricularPrograms.$inferSelect;

export type InsertExtracurricularSchedule = z.infer<typeof insertExtracurricularScheduleSchema>;
export type ExtracurricularSchedule = typeof extracurricularSchedules.$inferSelect;

export type InsertCompetitionRecord = z.infer<typeof insertCompetitionRecordSchema>;
export type CompetitionRecord = typeof competitionRecords.$inferSelect;

export type InsertVisitationLog = z.infer<typeof insertVisitationLogSchema>;
export type VisitationLog = typeof visitationLogs.$inferSelect;

export type InsertStudentReflection = z.infer<typeof insertStudentReflectionSchema>;
export type StudentReflection = typeof studentReflections.$inferSelect;
