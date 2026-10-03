# Data Migration Guide: Supabase to Railway PostgreSQL

## Overview
This guide explains how to migrate your data from Supabase to Railway PostgreSQL.

## Prerequisites

1. **Railway PostgreSQL Setup**
   - Railway PostgreSQL database provisioned
   - `DATABASE_URL` environment variable set
   - Database schema pushed (`npm run db:push`)

2. **Supabase Access**
   - `VITE_SUPABASE_URL` set in `.env`
   - `SUPABASE_SERVICE_ROLE_KEY` set in `.env`
   - Supabase database contains data to migrate

3. **Dependencies Installed**
   ```bash
   npm install
   ```

## Migration Steps

### Step 1: Backup Supabase Data (Optional but Recommended)

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or export via Supabase Dashboard
# Project Settings → Database → Backups → Export
```

### Step 2: Push Schema to Railway

```bash
# Ensure DATABASE_URL points to Railway PostgreSQL
npm run db:push
```

This will create all tables in Railway PostgreSQL.

### Step 3: Run Migration Script

```bash
npx tsx server/scripts/migrate-from-supabase.ts
```

The script will:
1. Connect to Supabase and export all data
2. Transform data if needed
3. Import data to Railway PostgreSQL in batches
4. Display progress and summary

### Step 4: Verify Migration

Check the migration summary output:

```
📊 Migration Summary

Table                         Exported    Imported    Errors
------------------------------------------------------------
users                         5           5           0
teacher_profile               5           5           0
classes                       12          12          0
students                      150         150         0
...
------------------------------------------------------------
TOTAL                         500         500         0
```

### Step 5: Test Application

1. Update `DATABASE_URL` in Railway to point to Railway PostgreSQL
2. Deploy application to Railway
3. Test all features:
   - Login/Authentication
   - View classes and students
   - Create/update/delete operations
   - Reports and exports

## Migration Script Details

### What Gets Migrated

The script migrates all 14 tables in order:

1. `users` - User accounts
2. `teacher_profile` - Teacher information
3. `classes` - Class/grade data
4. `students` - Student records
5. `class_schedules` - Weekly schedules
6. `teaching_journal` - Teaching logs
7. `student_attendance` - Attendance records
8. `modul_ajar` - Learning modules
9. `atp_intracurricular` - Learning flows
10. `kktp` - Mastery criteria
11. `exam_questions` - Question bank
12. `student_grades` - Grade records
13. `curriculum_documents` - Documents
14. `calendar_events` - Calendar events

### Batch Processing

- Data is imported in batches of 100 records
- Prevents memory issues with large datasets
- Shows progress for each batch

### Error Handling

- Continues migration even if one table fails
- Logs errors for each failed batch
- Provides summary of errors at the end

## Troubleshooting

### "DATABASE_URL environment variable is not set"

**Solution:** Ensure `.env` file has `DATABASE_URL` pointing to Railway PostgreSQL.

```env
DATABASE_URL=postgresql://postgres:password@host:port/database
```

### "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"

**Solution:** Add service role key to `.env`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get this from Supabase Dashboard → Project Settings → API → service_role key.

### "Table does not exist"

**Solution:** Run schema migration first:

```bash
npm run db:push
```

### "Duplicate key value violates unique constraint"

**Cause:** Data already exists in Railway PostgreSQL.

**Solution:** 
1. Clear Railway database:
   ```sql
   -- Connect to Railway PostgreSQL
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```
2. Push schema again: `npm run db:push`
3. Re-run migration script

### "Foreign key constraint violation"

**Cause:** Referenced records don't exist (e.g., student references non-existent class).

**Solution:** Migration script handles this by migrating tables in dependency order. If issue persists, check data integrity in Supabase.

### Migration Hangs or Times Out

**Cause:** Large dataset or slow connection.

**Solution:**
1. Increase batch size in migration script (line 50)
2. Run migration from server closer to databases
3. Migrate tables individually

## Manual Migration (Alternative)

If automated script fails, you can migrate manually:

### 1. Export from Supabase

```sql
-- Connect to Supabase PostgreSQL
COPY users TO '/tmp/users.csv' CSV HEADER;
COPY classes TO '/tmp/classes.csv' CSV HEADER;
-- ... repeat for all tables
```

### 2. Import to Railway

```sql
-- Connect to Railway PostgreSQL
COPY users FROM '/tmp/users.csv' CSV HEADER;
COPY classes FROM '/tmp/classes.csv' CSV HEADER;
-- ... repeat for all tables
```

## Post-Migration Checklist

- [ ] All tables migrated successfully
- [ ] Record counts match between Supabase and Railway
- [ ] Foreign key relationships intact
- [ ] Application connects to Railway PostgreSQL
- [ ] Authentication works
- [ ] All CRUD operations work
- [ ] Reports generate correctly
- [ ] No errors in application logs

## Rollback Plan

If migration fails or issues occur:

1. **Keep Supabase Running**
   - Don't delete Supabase data immediately
   - Keep as backup for at least 1 week

2. **Revert Environment Variables**
   ```env
   # Point back to Supabase if needed
   DATABASE_URL=your-supabase-connection-string
   ```

3. **Redeploy Previous Version**
   ```bash
   git revert HEAD
   git push
   ```

## Performance Tips

### For Large Datasets (>10,000 records)

1. **Increase Batch Size**
   ```typescript
   const batchSize = 500; // Instead of 100
   ```

2. **Disable Indexes During Migration**
   ```sql
   -- Before migration
   DROP INDEX IF EXISTS idx_students_class_id;
   
   -- After migration
   CREATE INDEX idx_students_class_id ON students(class_id);
   ```

3. **Run During Off-Peak Hours**
   - Less load on databases
   - Faster migration

## Verification Queries

### Check Record Counts

```sql
-- Run on both Supabase and Railway
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'students', COUNT(*) FROM students
-- ... add all tables
ORDER BY table_name;
```

### Check Foreign Key Integrity

```sql
-- Find students without valid class
SELECT s.* 
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
WHERE c.id IS NULL;

-- Should return 0 rows
```

### Check Data Completeness

```sql
-- Check for NULL values in required fields
SELECT COUNT(*) FROM students WHERE name IS NULL;
SELECT COUNT(*) FROM classes WHERE teacher_id IS NULL;
```

## Support

If you encounter issues:

1. Check migration script output for specific errors
2. Verify environment variables are correct
3. Ensure Railway PostgreSQL is accessible
4. Check Supabase connection is working
5. Review application logs for errors

## Next Steps

After successful migration:

1. Update Railway environment variables
2. Deploy application
3. Test thoroughly
4. Monitor for errors
5. Keep Supabase backup for 1-2 weeks
6. Once stable, can delete Supabase data
