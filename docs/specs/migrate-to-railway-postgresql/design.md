# Design Document: Migrate SIPJOK to Railway PostgreSQL

## Overview

This design document outlines the architecture and implementation strategy for migrating the SIPJOK application from Supabase database to Railway PostgreSQL. The migration maintains Supabase authentication while replacing all database operations with a custom API layer backed by Drizzle ORM and Railway PostgreSQL.

### Goals
- Create a portable, vendor-independent database layer
- Maintain all existing functionality without data loss
- Enable easy future migration to VPS or other hosting providers
- Preserve Supabase authentication (no auth changes)
- Minimize downtime during migration

### Non-Goals
- Migrating authentication away from Supabase (keep Supabase Auth)
- Changing UI/UX or adding new features
- Performance optimization (maintain current performance)

## Architecture

### Current Architecture
```
Frontend (React)
    ↓ (Supabase Client)
Supabase (Auth + Database)
```

### Target Architecture
```
Frontend (React)
    ↓ (HTTP/Fetch API)
Express API Layer
    ↓ (Drizzle ORM)
Railway PostgreSQL

Frontend (React)
    ↓ (Supabase Auth Client)
Supabase (Auth Only)
```

### Key Architectural Decisions

1. **Hybrid Approach**: Keep Supabase for authentication, migrate only database
   - Rationale: Auth migration is complex and risky; database migration provides immediate portability benefits

2. **API Layer Pattern**: Introduce Express REST API between frontend and database
   - Rationale: Decouples frontend from database implementation, enables future flexibility

3. **Drizzle ORM**: Use Drizzle as the database abstraction layer
   - Rationale: Type-safe, lightweight, works with standard PostgreSQL, easy to migrate

4. **Incremental Migration**: Migrate one entity/hook at a time
   - Rationale: Reduces risk, allows testing at each step, enables rollback if needed

## Components and Interfaces

### 1. Database Layer (Drizzle ORM + PostgreSQL)

#### Database Schema Definition
Location: `shared/schema.ts`

Tables to migrate from Supabase:
- `users` - User accounts (linked to Supabase Auth)
- `teacher_profile` - Teacher information
- `classes` - Class/grade information
- `students` - Student records
- `class_schedules` - Weekly class schedules
- `teaching_journal` - Daily teaching logs
- `student_attendance` - Student attendance records
- `modul_ajar` - Learning modules (lesson plans)
- `atp_intracurricular` - Learning flow documents
- `kktp` - Mastery criteria
- `exam_questions` - Assessment questions
- `student_grades` - Student grades/scores
- `curriculum_documents` - School curriculum files
- `calendar_events` - Academic calendar events

#### Schema Structure Example
```typescript
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacher_id: varchar("teacher_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  grade: text("grade").notNull(),
  academic_year: text("academic_year").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
```

#### Database Connection
Location: `server/db.ts`

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

### 2. API Layer (Express Routes)

#### API Structure
Location: `server/routes/`

Organize routes by entity:
- `server/routes/classes.ts` - Class CRUD operations
- `server/routes/students.ts` - Student CRUD operations
- `server/routes/schedules.ts` - Schedule CRUD operations
- `server/routes/journals.ts` - Teaching journal operations
- `server/routes/attendance.ts` - Attendance operations
- `server/routes/modul-ajar.ts` - Learning module operations
- `server/routes/atp.ts` - ATP operations
- `server/routes/kktp.ts` - KKTP operations
- `server/routes/grades.ts` - Grade operations
- `server/routes/exam-questions.ts` - Exam question operations
- `server/routes/teacher-profile.ts` - Teacher profile operations
- `server/routes/curriculum.ts` - Curriculum document operations
- `server/routes/calendar.ts` - Calendar event operations

#### API Endpoint Pattern
```
GET    /api/{entity}              - List all (filtered by user)
GET    /api/{entity}/:id          - Get one by ID
POST   /api/{entity}              - Create new
PUT    /api/{entity}/:id          - Update by ID
DELETE /api/{entity}/:id          - Delete by ID
GET    /api/{entity}/search       - Search with filters
```

#### Authentication Middleware
Location: `server/middleware/auth.ts`

```typescript
export async function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Verify token with Supabase
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.user = user;
  next();
}
```

#### Example Route Implementation
```typescript
// server/routes/classes.ts
import { Router } from 'express';
import { db } from '../db';
import { classes } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Get all classes for authenticated user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userClasses = await db.query.classes.findMany({
      where: eq(classes.teacher_id, req.user.id),
      orderBy: (classes, { desc }) => [desc(classes.created_at)],
    });
    res.json(userClasses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one class by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const classData = await db.query.classes.findFirst({
      where: and(
        eq(classes.id, req.params.id),
        eq(classes.teacher_id, req.user.id)
      ),
    });
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new class
router.post('/', authenticateUser, async (req, res) => {
  try {
    const [newClass] = await db.insert(classes)
      .values({
        ...req.body,
        teacher_id: req.user.id,
      })
      .returning();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update class
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const [updated] = await db.update(classes)
      .set({ ...req.body, updated_at: new Date() })
      .where(and(
        eq(classes.id, req.params.id),
        eq(classes.teacher_id, req.user.id)
      ))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete class
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const [deleted] = await db.delete(classes)
      .where(and(
        eq(classes.id, req.params.id),
        eq(classes.teacher_id, req.user.id)
      ))
      .returning();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### 3. Frontend Layer (React Hooks)

#### API Client Utility
Location: `client/src/lib/api.ts`

```typescript
import { supabase } from '../config/supabase';

class ApiClient {
  private baseURL = '/api';
  
  private async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }
  
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return response.json();
  }
  
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }
  
  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
```

#### Refactored Hook Example
Location: `client/src/hooks/useClasses.js`

Before (Supabase):
```javascript
const fetchClasses = async (teacherId) => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId);
  
  if (error) throw error;
  return data;
};
```

After (API):
```javascript
import { api } from '../lib/api';

const fetchClasses = async () => {
  // No need to pass teacherId - API filters by authenticated user
  return await api.get('/classes');
};
```

## Data Models

### Core Entities

#### User
```typescript
{
  id: string;              // UUID from Supabase Auth
  username: string;
  password: string;        // Hashed (for future custom auth)
  created_at: Date;
}
```

#### Teacher Profile
```typescript
{
  id: string;
  user_id: string;         // FK to users
  name: string;
  nip: string;
  school_name: string;
  school_address: string;
  phone: string;
  created_at: Date;
  updated_at: Date;
}
```

#### Class
```typescript
{
  id: string;
  teacher_id: string;      // FK to users
  name: string;            // e.g., "Kelas 1A"
  grade: string;           // e.g., "1", "2", "3"
  academic_year: string;   // e.g., "2024/2025"
  created_at: Date;
  updated_at: Date;
}
```

#### Student
```typescript
{
  id: string;
  class_id: string;        // FK to classes
  name: string;
  nis: string;             // Student ID number
  gender: string;          // "L" or "P"
  created_at: Date;
  updated_at: Date;
}
```

#### Teaching Journal
```typescript
{
  id: string;
  teacher_id: string;      // FK to users
  class_id: string;        // FK to classes
  tanggal: Date;
  materi: string;
  kegiatan: string;
  catatan: string;
  created_at: Date;
  updated_at: Date;
}
```

#### Student Attendance
```typescript
{
  id: string;
  student_id: string;      // FK to students
  class_id: string;        // FK to classes
  tanggal: Date;
  status: string;          // "Hadir", "Sakit", "Izin", "Alpa"
  notes: string;
  created_at: Date;
  updated_at: Date;
}
```

### Relationships
- User (1) → Teacher Profile (1)
- User (1) → Classes (many)
- Class (1) → Students (many)
- Class (1) → Teaching Journals (many)
- Class (1) → Class Schedules (many)
- Student (1) → Attendance Records (many)
- Student (1) → Grades (many)

## Error Handling

### API Error Responses
```typescript
{
  error: string;           // Human-readable error message
  code?: string;           // Error code for client handling
  details?: any;           // Additional error context
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid auth token
- `403 Forbidden` - User doesn't have access to resource
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server-side error

### Frontend Error Handling
```javascript
try {
  const data = await api.get('/classes');
  setClasses(data);
  setError(null);
} catch (err) {
  setError(err.message);
  console.error('Failed to fetch classes:', err);
}
```

## Testing Strategy

### 1. Unit Tests (Optional)
- Test individual API route handlers
- Test database queries with Drizzle
- Test API client utility functions

### 2. Integration Tests
- Test complete API endpoints with real database
- Test authentication middleware
- Test data validation and error handling

### 3. Manual Testing Checklist
For each migrated entity:
- [ ] List/fetch all records
- [ ] Get single record by ID
- [ ] Create new record
- [ ] Update existing record
- [ ] Delete record
- [ ] Test with invalid data
- [ ] Test with unauthorized user
- [ ] Test with non-existent ID

### 4. End-to-End Testing
- [ ] Login with Supabase Auth
- [ ] Navigate through all pages
- [ ] Perform CRUD operations on each entity
- [ ] Test data relationships (e.g., class → students)
- [ ] Test export/import features
- [ ] Test search and filtering

## Migration Strategy

### Phase 1: Infrastructure Setup
1. Provision Railway PostgreSQL
2. Configure DATABASE_URL in Railway
3. Define complete Drizzle schema
4. Push schema to Railway PostgreSQL
5. Set up database connection in Express

### Phase 2: API Layer Development
1. Create authentication middleware
2. Implement API routes for each entity (13 entities)
3. Test each API endpoint individually
4. Document API endpoints

### Phase 3: Frontend Refactoring
1. Create API client utility
2. Refactor custom hooks one by one (15 hooks)
3. Update components to use new hooks
4. Test each page after refactoring

### Phase 4: Data Migration
1. Export data from Supabase (pg_dump or custom script)
2. Transform data if needed (match new schema)
3. Import data to Railway PostgreSQL
4. Verify data integrity and relationships

### Phase 5: Testing & Deployment
1. Run integration tests
2. Perform manual testing of all features
3. Deploy to Railway with new configuration
4. Monitor for errors
5. Verify production functionality

### Rollback Plan
If critical issues occur:
1. Revert environment variables to use Supabase
2. Redeploy previous version from Git
3. Investigate and fix issues
4. Retry migration

## Performance Considerations

### Database Indexing
Add indexes for frequently queried columns:
```sql
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_attendance_student_id ON student_attendance(student_id);
CREATE INDEX idx_attendance_date ON student_attendance(tanggal);
CREATE INDEX idx_journals_teacher_date ON teaching_journal(teacher_id, tanggal);
```

### Query Optimization
- Use Drizzle's query builder for efficient queries
- Implement pagination for large datasets
- Use `select` to fetch only needed columns
- Leverage database joins instead of multiple queries

### Caching Strategy (Future)
- Consider implementing Redis for frequently accessed data
- Cache user profiles and class lists
- Invalidate cache on data updates

## Security Considerations

### Authentication
- Verify Supabase JWT tokens on every API request
- Never trust client-provided user IDs
- Always filter data by authenticated user

### Authorization
- Implement row-level security in API layer
- Users can only access their own data
- Validate ownership before updates/deletes

### Input Validation
- Validate all input data before database operations
- Use Zod schemas for type-safe validation
- Sanitize user input to prevent SQL injection (Drizzle handles this)

### Environment Variables
- Never commit `.env` files
- Use Railway's environment variable management
- Rotate database credentials periodically

## Deployment Configuration

### Environment Variables (Railway)
```
DATABASE_URL=postgresql://...          # Auto-provided by Railway
VITE_SUPABASE_URL=https://...         # Supabase project URL
VITE_SUPABASE_ANON_KEY=eyJ...         # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # For server-side auth verification
VITE_APP_NAME=SIPJOK
VITE_APP_VERSION=1.0.0
VITE_API_TIMEOUT=30000
NODE_ENV=production
PORT=5000                              # Auto-set by Railway
```

### Build Configuration
Railway will automatically detect and run:
```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push"
  }
}
```

### Post-Deploy Steps
1. Run database migration: `railway run npm run db:push`
2. Import data from Supabase
3. Verify application health
4. Test critical user flows

## Future Enhancements

### Easy VPS Migration
When ready to move to VPS:
1. Set up PostgreSQL on VPS
2. Export data from Railway: `pg_dump`
3. Import to VPS PostgreSQL
4. Update `DATABASE_URL` to VPS connection string
5. Deploy application to VPS
6. No code changes needed!

### Custom Authentication (Optional)
If wanting to remove Supabase Auth dependency:
1. Implement JWT-based auth in Express
2. Add login/register endpoints
3. Update frontend to use custom auth
4. Migrate user accounts

### Additional Features
- Real-time updates with WebSockets
- File upload to Railway volumes or S3
- Advanced reporting and analytics
- Mobile app with same API
