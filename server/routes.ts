import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { apiLimiter } from "./middleware/rateLimit";
import { UPLOAD_DIR } from "./routes/uploads";
import classesRouter from "./routes/classes";
import studentsRouter from "./routes/students";
import schedulesRouter from "./routes/schedules";
import journalsRouter from "./routes/journals";
import attendanceRouter from "./routes/attendance";
import modulAjarRouter from "./routes/modul-ajar";
import atpRouter from "./routes/atp";
import kktpRouter from "./routes/kktp";
import examQuestionsRouter from "./routes/exam-questions";
import gradesRouter from "./routes/grades";
import teacherProfileRouter from "./routes/teacher-profile";
import curriculumRouter from "./routes/curriculum";
import calendarRouter from "./routes/calendar";
import authRouter from "./routes/auth";
import healthRouter from "./routes/health";
import uploadsRouter from "./routes/uploads";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply rate limiting to all API routes
  app.use('/api', apiLimiter);

  // Register API routes
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/uploads', uploadsRouter);

  // Serve uploaded files (stored on local disk by POST /api/uploads)
  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use('/api/classes', classesRouter);
  app.use('/api/students', studentsRouter);
  app.use('/api/schedules', schedulesRouter);
  app.use('/api/journals', journalsRouter);
  app.use('/api/attendance', attendanceRouter);
  app.use('/api/modul-ajar', modulAjarRouter);
  app.use('/api/atp', atpRouter);
  app.use('/api/kktp', kktpRouter);
  app.use('/api/exam-questions', examQuestionsRouter);
  app.use('/api/grades', gradesRouter);
  app.use('/api/teacher-profile', teacherProfileRouter);
  app.use('/api/curriculum', curriculumRouter);
  app.use('/api/calendar', calendarRouter);

  // 404 handler for undefined routes
  app.use('/api/*', notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  const httpServer = createServer(app);

  return httpServer;
}
