import 'dotenv/config';
import postgres from 'postgres';
const client = postgres(process.env.DATABASE_URL!);
async function main() {
  const rows = await client`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`;
  console.log('TABLES:', rows.map(r => r.table_name).join(', '));
  const counts = await client`SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY relname`;
  console.log('ROW ESTIMATES:', counts.map(c => `${c.relname}=${c.n_live_tup}`).join(', '));
  await client.end();
}
main();
