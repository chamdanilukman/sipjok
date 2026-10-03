import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
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
  academic_year: varchar("academic_year", { length: 20 }).notNull(),
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
  day: varchar("day", { length: 20 }).notNull(), // Senin, Selasa, etc.
  start_time: varchar("start_time", { length: 10 }).notNull(), // HH:MM format
  end_time: varchar("end_time", { length: 10 }).notNull(), // HH:MM format
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
  tanggal: timestamp("tanggal").notNull(),
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
  tanggal: timestamp("tanggal").notNull(),
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
  fase: varchar("fase", { length: 10 }),
  kelas: varchar("kelas", { length: 50 }),
  elemen: text("elemen"),
  capaian_pembelajaran: text("capaian_pembelajaran"),
  tujuan_pembelajaran: text("tujuan_pembelajaran"),
  alokasi_waktu: varchar("alokasi_waktu", { length: 50 }),
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
  elemen: text("elemen").notNull(),
  tujuan_pembelajaran: text("tujuan_pembelajaran").notNull(),
  kriteria_ketuntasan: integer("kriteria_ketuntasan").notNull(), // Percentage
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
  difficulty: varchar("difficulty", { length: 20 }), // Easy, Medium, Hard
  topic: text("topic"),
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
  assessment_type: varchar("assessment_type", { length: 50 }).notNull(), // Formatif, Sumatif, etc.
  assessment_name: text("assessment_name").notNull(),
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
  title: text("title").notNull(),
  event_type: varchar("event_type", { length: 50 }), // Libur, Ujian, Kegiatan, etc.
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  description: text("description"),
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
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectTeacherProfileSchema = createSelectSchema(teacherProfile);

// Classes
export const insertClassSchema = createInsertSchema(classes).omit({
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
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectClassScheduleSchema = createSelectSchema(classSchedules);

// Teaching Journal
export const insertTeachingJournalSchema = createInsertSchema(teachingJournal).omit({
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
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectModulAjarSchema = createSelectSchema(modulAjar);

// ATP Intracurricular
export const insertAtpIntracurricularSchema = createInsertSchema(atpIntracurricular).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectAtpIntracurricularSchema = createSelectSchema(atpIntracurricular);

// KKTP
export const insertKktpSchema = createInsertSchema(kktp).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectKktpSchema = createSelectSchema(kktp);

// Exam Questions
export const insertExamQuestionSchema = createInsertSchema(examQuestions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectExamQuestionSchema = createSelectSchema(examQuestions);

// Student Grades
export const insertStudentGradeSchema = createInsertSchema(studentGrades).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectStudentGradeSchema = createSelectSchema(studentGrades);

// Curriculum Documents
export const insertCurriculumDocumentSchema = createInsertSchema(curriculumDocuments).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectCurriculumDocumentSchema = createSelectSchema(curriculumDocuments);

// Calendar Events
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const selectCalendarEventSchema = createSelectSchema(calendarEvents);

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
