# SIPJOK - Sistem Informasi Pembelajaran PJOK

## Overview

SIPJOK is a comprehensive Teacher Management System designed for Physical Education (PJOK) teachers. The application provides tools for managing teacher profiles, class schedules, student attendance, assessments, lesson plans (Modul Ajar), learning objectives (ATP), teaching journals, and curriculum documents. Built with a focus on Indonesian education standards, it supports the Merdeka Curriculum framework with features like KKTP criteria management and standardized document exports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling

**Design System**: 
- Material Design principles with mobile-first responsive approach
- Breakpoints: Mobile (320-767px), Tablet (768-1024px), Desktop (1025px+)
- Typography: Inter font family from Google Fonts
- Theme: New York style variant with neutral base color and CSS variables

**Routing**: wouter for client-side routing

**State Management**: 
- React Query (@tanstack/react-query) for server state and API data caching
- Custom hooks pattern for encapsulating data operations and business logic

**Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**API Pattern**: RESTful endpoints prefixed with `/api`

**Development Server**: Vite middleware integration for HMR in development

**Storage Interface**: Abstract storage layer (IStorage interface) with in-memory implementation (MemStorage) for development, designed to be swapped with database implementation

**Session Management**: Session storage placeholder with connect-pg-simple for PostgreSQL-backed sessions

### Data Storage Solutions

**Primary Database**: PostgreSQL via Neon serverless driver (@neondatabase/serverless)

**ORM**: Drizzle ORM with schema-first approach
- Schema location: `shared/schema.ts`
- Migration output: `./migrations`
- Type-safe query building and schema validation with Zod

**External Storage**: Supabase integration for:
- Authentication and user management
- File storage (curriculum documents, profile photos)
- Real-time subscriptions (optional)

**Database Tables** (from hooks and utilities analysis):
- `users`: Basic user authentication
- `teacher_profiles`: Comprehensive teacher information including qualifications, certifications
- `classes`: Class management with grade levels
- `students`: Student records with class associations
- `class_schedules`: Weekly schedules with time slots and day mappings
- `student_attendance`: Daily attendance tracking with status (hadir/sakit/izin/alpha)
- `student_grades`: Assessment records with KKTP criteria references
- `kktp_criteria`: Learning achievement criteria (Kriteria Ketercapaian Tujuan Pembelajaran)
- `atp_intracurricular`: Learning objectives flow (Alur Tujuan Pembelajaran)
- `modul_ajar`: Complete lesson plans with 7-step wizard structure
- `teaching_journal`: Daily teaching records with attendance summaries
- `calendar_events`: Academic calendar with categorized events
- `curriculum_documents`: Document metadata with file references
- `exam_questions`: Question bank management

### Authentication & Authorization

**Provider**: Supabase Auth
- JWT-based authentication
- User session management via `getCurrentUserId()` helper
- Authentication state checking with `isAuthenticated()`
- Security: DEV_AUTO_LOGIN disabled (null) to prevent hardcoded user IDs in production

**Access Pattern**: User-scoped data filtering with teacher_id/user_id foreign keys

### External Dependencies

**Supabase**: 
- Authentication service
- PostgreSQL database hosting (Neon-compatible)
- Storage buckets for file uploads
- Real-time capabilities

**Neon Database**: Serverless PostgreSQL with connection pooling

**UI Components**: Comprehensive Radix UI component set including:
- Dialogs, Dropdowns, Popovers for overlays
- Forms elements (Select, Checkbox, Radio, Switch)
- Data display (Accordion, Tabs, Tables)
- Feedback (Toast notifications, Tooltips, Progress)

**Data Visualization**: Chart.js for analytics and reporting

**Document Generation**:
- jsPDF with autotable plugin for PDF exports
- docx library for Word document generation
- xlsx for Excel spreadsheet import/export
- file-saver for client-side downloads

**Utilities**:
- date-fns for date manipulation and formatting
- clsx + tailwind-merge for className composition
- class-variance-authority for component variants
- nanoid for unique ID generation

**Development Tools**:
- Replit-specific plugins (@replit/vite-plugin-runtime-error-modal, cartographer, dev-banner)
- TypeScript with strict mode enabled
- ESBuild for server bundling

### Key Architectural Patterns

**Custom Hooks Pattern**: All data operations encapsulated in reusable hooks (useATP, useClasses, useStudents, useGrades, etc.) providing consistent loading states, error handling, and CRUD operations

**Separation of Concerns**: 
- `/client` - Frontend React application
- `/server` - Express backend
- `/shared` - Shared types, schemas, and utilities
- `/attached_assets/sipjok` - Legacy/reference implementation

**Type Safety**: End-to-end TypeScript with Drizzle schema inference and Zod validation ensuring runtime type safety

**Export/Import Utilities**: Standardized helpers for Excel/PDF generation across all data entities with Indonesian formatting

**Responsive Design**: Mobile-first approach with dedicated breakpoint handling and touch-friendly interactions (44px minimum tap targets)

**Localization**: Indonesian language throughout (date formatting, labels, validation messages)