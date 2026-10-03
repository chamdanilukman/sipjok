import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Creates (or resets the password of) the admin/teacher login user.
 *
 * Usage:
 *   ADMIN_EMAIL=guru@sekolah.sch.id ADMIN_PASSWORD=rahasia123 npm run seed:admin
 *
 * The `users.username` column is the login identity and holds the email.
 * The `users.password` column holds the bcrypt hash.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('❌ ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.username, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ password: hash, updated_at: new Date() })
      .where(eq(users.id, existing.id));
    console.log(`✅ Password reset for existing user: ${email} (${existing.id})`);
  } else {
    const [created] = await db
      .insert(users)
      .values({ username: email, password: hash })
      .returning();
    console.log(`✅ Admin user created: ${email} (${created.id})`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
