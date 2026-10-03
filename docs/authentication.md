# Authentication Documentation

## Overview
The SIPJOK API uses Supabase JWT tokens for authentication. All protected endpoints require a valid Bearer token in the Authorization header.

## Authentication Flow

```
1. User logs in via frontend (Supabase Auth)
2. Frontend receives JWT access token
3. Frontend includes token in API requests
4. Server validates token with Supabase
5. Server attaches user info to request
6. Route handler processes request with user context
```

## Middleware

### `authenticateUser`
Required authentication middleware. Blocks requests without valid tokens.

**Usage:**
```typescript
import { authenticateUser } from './middleware/auth';

router.get('/api/protected', authenticateUser, (req, res) => {
  // req.user is available here
  res.json({ userId: req.user.id });
});
```

**Response on failure:**
```json
{
  "error": "Unauthorized",
  "message": "No authorization header provided"
}
```

### `optionalAuth`
Optional authentication middleware. Attaches user if token is valid, but doesn't block if missing.

**Usage:**
```typescript
import { optionalAuth } from './middleware/auth';

router.get('/api/public', optionalAuth, (req, res) => {
  // req.user may or may not be present
  if (req.user) {
    res.json({ message: 'Hello ' + req.user.email });
  } else {
    res.json({ message: 'Hello guest' });
  }
});
```

## Request Format

### Headers
```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

### Example Request (curl)
```bash
curl -X GET \
  http://localhost:5000/api/classes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Example Request (JavaScript)
```javascript
const token = await supabase.auth.getSession().then(
  ({ data: { session } }) => session?.access_token
);

const response = await fetch('/api/classes', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## User Object

After successful authentication, `req.user` contains:

```typescript
{
  id: string;        // Supabase user ID (UUID)
  email?: string;    // User email
  // ... other user metadata
}
```

## Error Responses

### 401 Unauthorized
Missing or invalid token.

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
Valid token but insufficient permissions.

```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 500 Internal Server Error
Server-side authentication error.

```json
{
  "error": "Internal Server Error",
  "message": "Authentication failed"
}
```

## Security Best Practices

### Server-Side
1. ✅ Always use `SUPABASE_SERVICE_ROLE_KEY` for token verification
2. ✅ Never expose service role key to frontend
3. ✅ Validate user ownership before returning data
4. ✅ Use HTTPS in production
5. ✅ Implement rate limiting on auth endpoints

### Client-Side
1. ✅ Store tokens securely (Supabase handles this)
2. ✅ Refresh tokens before expiry
3. ✅ Clear tokens on logout
4. ✅ Never log tokens to console in production
5. ✅ Use HTTPS for all API calls

## Testing Authentication

### Manual Testing
1. Start test server:
   ```bash
   npx tsx server/test-auth.ts
   ```

2. Get token from browser:
   - Login to app
   - Open DevTools → Application → Local Storage
   - Find Supabase session token

3. Test with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/test-auth
   ```

### Automated Testing
```typescript
import { authenticateUser } from './middleware/auth';
import { Request, Response } from 'express';

// Mock request with valid token
const mockReq = {
  headers: {
    authorization: 'Bearer valid_token_here'
  }
} as Request;

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as unknown as Response;

const mockNext = jest.fn();

await authenticateUser(mockReq, mockRes, mockNext);

// Assert mockNext was called (authentication succeeded)
expect(mockNext).toHaveBeenCalled();
```

## Troubleshooting

### "No authorization header provided"
- Check if Authorization header is included in request
- Verify header format: `Bearer <token>`

### "Invalid or expired token"
- Token may have expired (default: 1 hour)
- Refresh token using Supabase client
- Check if user is still logged in

### "User not found"
- User may have been deleted from Supabase
- Token may be from different Supabase project
- Verify SUPABASE_SERVICE_ROLE_KEY is correct

### "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
- Add key to `.env` file
- Restart server after adding environment variable
- Verify key is correct in Supabase dashboard

## Environment Variables

Required for authentication:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from:
1. Supabase Dashboard
2. Project Settings → API
3. Copy "URL" and "service_role" key (not anon key!)

## Migration Notes

### From Supabase Client to API
Before (direct Supabase):
```javascript
const { data } = await supabase
  .from('classes')
  .select('*');
```

After (API with auth):
```javascript
const token = await supabase.auth.getSession().then(
  ({ data: { session } }) => session?.access_token
);

const response = await fetch('/api/classes', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
```

The API client utility handles this automatically:
```javascript
import { api } from './lib/api';

const data = await api.get('/classes');
// Token is automatically included
```
