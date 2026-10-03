# API Client Usage Guide

## Overview
The API client provides a simple, type-safe way to interact with the backend API. It automatically handles authentication, error handling, and common patterns.

## Basic Usage

### Import the API Client
```typescript
import { api } from '../lib/api';
```

### GET Request
```typescript
// Fetch all classes
const classes = await api.get('/classes');

// Fetch single class
const classData = await api.get(`/classes/${classId}`);
```

### POST Request
```typescript
// Create new class
const newClass = await api.post('/classes', {
  name: 'Kelas 1A',
  grade: '1',
  academic_year: '2024/2025',
});
```

### PUT Request
```typescript
// Update class
const updated = await api.put(`/classes/${classId}`, {
  name: 'Kelas 1B',
  grade: '1',
  academic_year: '2024/2025',
});
```

### DELETE Request
```typescript
// Delete class
await api.delete(`/classes/${classId}`);
```

### GET with Query Parameters
```typescript
// Search with filters
const results = await api.getWithParams('/classes/search', {
  grade: '1',
  academic_year: '2024/2025',
});
```

## Using in React Hooks

### Basic Fetch Pattern
```typescript
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Class } from '../types/api';

function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.get<Class[]>('/classes');
      setClasses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { classes, loading, error, refetch: fetchClasses };
}
```

### Create Pattern
```typescript
const createClass = async (classData: Partial<Class>) => {
  try {
    const newClass = await api.post<Class>('/classes', classData);
    setClasses(prev => [...prev, newClass]);
    return newClass;
  } catch (err: any) {
    setError(err.message);
    return null;
  }
};
```

### Update Pattern
```typescript
const updateClass = async (id: string, classData: Partial<Class>) => {
  try {
    const updated = await api.put<Class>(`/classes/${id}`, classData);
    setClasses(prev => 
      prev.map(c => c.id === id ? updated : c)
    );
    return updated;
  } catch (err: any) {
    setError(err.message);
    return null;
  }
};
```

### Delete Pattern
```typescript
const deleteClass = async (id: string) => {
  if (!window.confirm('Are you sure?')) return false;
  
  try {
    await api.delete(`/classes/${id}`);
    setClasses(prev => prev.filter(c => c.id !== id));
    return true;
  } catch (err: any) {
    setError(err.message);
    return false;
  }
};
```

## Using Helper Functions

### Fetch with State Management
```typescript
import { fetchWithState } from '../lib/apiHelpers';

const loadClasses = () => {
  fetchWithState(
    () => api.get<Class[]>('/classes'),
    setClasses,
    setLoading,
    setError
  );
};
```

### Create with Optimistic Update
```typescript
import { createWithOptimistic } from '../lib/apiHelpers';

const handleCreate = async (data: Partial<Class>) => {
  await createWithOptimistic(
    () => api.post<Class>('/classes', data),
    (newClass) => {
      setClasses(prev => [...prev, newClass]);
      showNotification('Class created successfully', 'success');
    },
    (error) => {
      showNotification(error, 'error');
    }
  );
};
```

### Delete with Confirmation
```typescript
import { deleteWithConfirmation } from '../lib/apiHelpers';

const handleDelete = async (id: string) => {
  await deleteWithConfirmation(
    () => api.delete(`/classes/${id}`),
    () => {
      setClasses(prev => prev.filter(c => c.id !== id));
      showNotification('Class deleted successfully', 'success');
    },
    (error) => {
      showNotification(error, 'error');
    },
    'Are you sure you want to delete this class?'
  );
};
```

### Fetch with Cache
```typescript
import { fetchWithCache } from '../lib/apiHelpers';

const loadClasses = async () => {
  const data = await fetchWithCache(
    'classes-list',
    () => api.get<Class[]>('/classes'),
    5 * 60 * 1000 // Cache for 5 minutes
  );
  setClasses(data);
};
```

### Debounced Search
```typescript
import { createDebouncedSearch } from '../lib/apiHelpers';

const debouncedSearch = createDebouncedSearch(
  (query: string) => api.getWithParams<Class[]>('/classes/search', { q: query }),
  300 // 300ms delay
);

const handleSearch = async (query: string) => {
  const results = await debouncedSearch(query);
  setSearchResults(results);
};
```

## Error Handling

### Try-Catch Pattern
```typescript
try {
  const data = await api.get('/classes');
  setClasses(data);
} catch (err: any) {
  if (err.message.includes('Not authenticated')) {
    // Redirect to login
    navigate('/login');
  } else {
    setError(err.message);
  }
}
```

### Global Error Handler
```typescript
// In your root component or error boundary
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Not authenticated')) {
    // Redirect to login
    window.location.href = '/login';
  }
});
```

## Type Safety

### Using TypeScript Types
```typescript
import { Class, Student } from '../types/api';

// Type-safe request
const classes = await api.get<Class[]>('/classes');

// Type-safe response
const newStudent = await api.post<Student>('/students', {
  name: 'John Doe',
  class_id: classId,
  gender: 'L',
});

// TypeScript will catch errors
// newStudent.invalid_field; // Error: Property doesn't exist
```

## Migration from Supabase

### Before (Supabase)
```typescript
const { data: classes, error } = await supabase
  .from('classes')
  .select('*')
  .eq('teacher_id', teacherId);

if (error) throw error;
```

### After (API Client)
```typescript
const classes = await api.get<Class[]>('/classes');
// teacher_id filtering is automatic (server-side)
```

### Before (Supabase Insert)
```typescript
const { data, error } = await supabase
  .from('classes')
  .insert([{ name: 'Kelas 1A', grade: '1', teacher_id: userId }])
  .select()
  .single();
```

### After (API Client)
```typescript
const newClass = await api.post<Class>('/classes', {
  name: 'Kelas 1A',
  grade: '1',
  // teacher_id is automatic (from auth token)
});
```

## Best Practices

### 1. Always Handle Errors
```typescript
try {
  const data = await api.get('/classes');
  setClasses(data);
} catch (err: any) {
  setError(err.message);
  console.error('Failed to fetch classes:', err);
}
```

### 2. Use Loading States
```typescript
setLoading(true);
try {
  const data = await api.get('/classes');
  setClasses(data);
} catch (err: any) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

### 3. Provide User Feedback
```typescript
try {
  await api.post('/classes', data);
  showNotification('Class created successfully', 'success');
} catch (err: any) {
  showNotification(err.message, 'error');
}
```

### 4. Use TypeScript Types
```typescript
// Define types for your data
import { Class } from '../types/api';

// Use types in state
const [classes, setClasses] = useState<Class[]>([]);

// Use types in API calls
const data = await api.get<Class[]>('/classes');
```

### 5. Cache Frequently Accessed Data
```typescript
import { fetchWithCache } from '../lib/apiHelpers';

// Cache teacher profile (rarely changes)
const profile = await fetchWithCache(
  'teacher-profile',
  () => api.get('/teacher-profile'),
  30 * 60 * 1000 // 30 minutes
);
```

### 6. Debounce Search Inputs
```typescript
import { createDebouncedSearch } from '../lib/apiHelpers';

const searchStudents = createDebouncedSearch(
  (query) => api.getWithParams('/students/search', { q: query }),
  300
);
```

## Testing

### Mock API Client
```typescript
// In your test file
jest.mock('../lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// In your test
import { api } from '../lib/api';

test('fetches classes', async () => {
  (api.get as jest.Mock).mockResolvedValue([
    { id: '1', name: 'Kelas 1A', grade: '1' },
  ]);

  const { result } = renderHook(() => useClasses());
  
  await waitFor(() => {
    expect(result.current.classes).toHaveLength(1);
  });
});
```

## Troubleshooting

### "Not authenticated" Error
- User session may have expired
- Redirect to login page
- Refresh the page to get new token

### Network Errors
- Check internet connection
- Verify API server is running
- Check browser console for CORS errors

### 404 Not Found
- Verify endpoint URL is correct
- Check if API route is registered on server
- Verify resource ID exists

### 500 Internal Server Error
- Check server logs for details
- Verify request data is valid
- Check database connection
