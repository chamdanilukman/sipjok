import 'dotenv/config';
import express from 'express';
import { authenticateUser } from './middleware/auth';

const app = express();
app.use(express.json());

// Test route with authentication
app.get('/api/test-auth', authenticateUser, (req, res) => {
  res.json({
    message: 'Authentication successful!',
    user: req.user,
  });
});

// Test route without authentication
app.get('/api/test-public', (req, res) => {
  res.json({
    message: 'This is a public route',
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Test endpoints:');
  console.log(`  GET http://localhost:${PORT}/api/test-public (no auth required)`);
  console.log(`  GET http://localhost:${PORT}/api/test-auth (auth required)`);
  console.log('');
  console.log('To test authenticated endpoint:');
  console.log('  1. Login to your app and get the access token from browser DevTools');
  console.log('  2. Use curl or Postman with Authorization header:');
  console.log('     curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/test-auth');
});
