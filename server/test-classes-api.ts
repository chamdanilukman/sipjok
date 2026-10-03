import 'dotenv/config';
import express from 'express';
import { registerRoutes } from './routes';

const app = express();
app.use(express.json());

(async () => {
  const server = await registerRoutes(app);

  const PORT = 3002;
  server.listen(PORT, () => {
    console.log(`🧪 Test server running on http://localhost:${PORT}`);
    console.log('');
    console.log('Test Classes API endpoints:');
    console.log(`  GET    http://localhost:${PORT}/api/classes`);
    console.log(`  GET    http://localhost:${PORT}/api/classes/:id`);
    console.log(`  POST   http://localhost:${PORT}/api/classes`);
    console.log(`  PUT    http://localhost:${PORT}/api/classes/:id`);
    console.log(`  DELETE http://localhost:${PORT}/api/classes/:id`);
    console.log('');
    console.log('All endpoints require Authorization header:');
    console.log('  Authorization: Bearer YOUR_SUPABASE_TOKEN');
    console.log('');
    console.log('Example POST body:');
    console.log(JSON.stringify({
      name: 'Kelas 1A',
      grade: '1',
      academic_year: '2024/2025'
    }, null, 2));
  });
})();
