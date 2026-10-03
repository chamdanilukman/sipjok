import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { db } from '../db';
import * as schema from '../../shared/schema';

// Supabase client for reading data
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MigrationStats {
  table: string;
  exported: number;
  imported: number;
  errors: number;
}

const stats: MigrationStats[] = [];

async function migrateTable(
  tableName: string,
  drizzleTable: any,
  transformFn?: (data: any[]) => any[]
) {
  console.log(`\n📦 Migrating ${tableName}...`);
  
  try {
    // Export from Supabase
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) throw error;

    const exported = data?.length || 0;
    console.log(`  ✓ Exported ${exported} records from Supabase`);

    if (exported === 0) {
      stats.push({ table: tableName, exported: 0, imported: 0, errors: 0 });
      return;
    }

    // Transform data if needed
    const transformedData = transformFn ? transformFn(data) : data;

    // Import to Railway PostgreSQL
    let imported = 0;
    let errors = 0;

    // Batch insert (100 records at a time)
    const batchSize = 100;
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      try {
        await db.insert(drizzleTable).values(batch);
        imported += batch.length;
        console.log(`  ✓ Imported ${imported}/${transformedData.length} records`);
      } catch (err: any) {
        console.error(`  ✗ Error importing batch: ${err.message}`);
        errors += batch.length;
      }
    }

    stats.push({ table: tableName, exported, imported, errors });
    console.log(`  ✅ Migration complete: ${imported} imported, ${errors} errors`);

  } catch (err: any) {
    console.error(`  ❌ Migration failed: ${err.message}`);
    stats.push({ table: tableName, exported: 0, imported: 0, errors: 1 });
  }
}

async function runMigration() {
  console.log('🚀 Starting data migration from Supabase to Railway PostgreSQL\n');
  console.log('=' .repeat(60));

  try {
    // 1. Migrate users (if any custom users exist)
    await migrateTable('users', schema.users);

    // 2. Migrate teacher profiles
    await migrateTable('teacher_profile', schema.teacherProfile);

    // 3. Migrate classes
    await migrateTable('classes', schema.classes);

    // 4. Migrate students
    await migrateTable('students', schema.students);

    // 5. Migrate class schedules
    await migrateTable('class_schedules', schema.classSchedules);

    // 6. Migrate teaching journals
    await migrateTable('teaching_journal', schema.teachingJournal);

    // 7. Migrate student attendance
    await migrateTable('student_attendance', schema.studentAttendance);

    // 8. Migrate modul ajar
    await migrateTable('modul_ajar', schema.modulAjar);

    // 9. Migrate ATP
    await migrateTable('atp_intracurricular', schema.atpIntracurricular);

    // 10. Migrate KKTP
    await migrateTable('kktp', schema.kktp);

    // 11. Migrate exam questions
    await migrateTable('exam_questions', schema.examQuestions);

    // 12. Migrate student grades
    await migrateTable('student_grades', schema.studentGrades);

    // 13. Migrate curriculum documents
    await migrateTable('curriculum_documents', schema.curriculumDocuments);

    // 14. Migrate calendar events
    await migrateTable('calendar_events', schema.calendarEvents);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary\n');
    console.log('Table'.padEnd(30) + 'Exported'.padEnd(12) + 'Imported'.padEnd(12) + 'Errors');
    console.log('-'.repeat(60));

    let totalExported = 0;
    let totalImported = 0;
    let totalErrors = 0;

    stats.forEach(stat => {
      console.log(
        stat.table.padEnd(30) +
        stat.exported.toString().padEnd(12) +
        stat.imported.toString().padEnd(12) +
        stat.errors.toString()
      );
      totalExported += stat.exported;
      totalImported += stat.imported;
      totalErrors += stat.errors;
    });

    console.log('-'.repeat(60));
    console.log(
      'TOTAL'.padEnd(30) +
      totalExported.toString().padEnd(12) +
      totalImported.toString().padEnd(12) +
      totalErrors.toString()
    );

    console.log('\n' + '='.repeat(60));
    
    if (totalErrors === 0) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.log(`⚠️  Migration completed with ${totalErrors} errors`);
    }

  } catch (err: any) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Fatal error:', err);
    process.exit(1);
  });
