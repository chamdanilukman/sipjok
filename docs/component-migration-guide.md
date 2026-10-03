# Component Migration Guide

## Overview
This guide explains how to update components that use Supabase hooks to use the new API-based hooks.

## Classes Hook Migration

### Before (Supabase)
```javascript
import useClasses from '../hooks/useClasses';
import supabase from '../config/supabase';

function MyComponent() {
  const { classes, loadClasses, createClass } = useClasses();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadClasses(user.id); // Pass userId
      }
    };
    getCurrentUser();
  }, []);

  const handleCreate = async (data) => {
    await createClass(userId, data); // Pass userId
  };
}
```

### After (API)
```javascript
import useClasses from '../hooks/useClasses';

function MyComponent() {
  const { classes, loadClasses, createClass } = useClasses();

  useEffect(() => {
    loadClasses(); // No userId needed - automatic from token
  }, []);

  const handleCreate = async (data) => {
    await createClass(data); // No userId needed
  };
}
```

## Key Changes

### 1. Remove userId Parameter
**Before:**
```javascript
loadClasses(userId)
createClass(userId, data)
updateClass(classId, data)
deleteClass(classId)
```

**After:**
```javascript
loadClasses()        // No userId
createClass(data)    // No userId
updateClass(classId, data)
deleteClass(classId)
```

### 2. Remove Supabase Auth Calls
**Before:**
```javascript
import supabase from '../config/supabase';

const { data: { user } } = await supabase.auth.getUser();
if (user) {
  setUserId(user.id);
  loadClasses(user.id);
}
```

**After:**
```javascript
// No need to get user - authentication is automatic
loadClasses();
```

### 3. Simplify useEffect
**Before:**
```javascript
useEffect(() => {
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      loadClasses(user.id);
    }
  };
  getCurrentUser();
}, []);
```

**After:**
```javascript
useEffect(() => {
  loadClasses();
}, [loadClasses]);
```

## Component Examples

### Example 1: StudentAttendance.jsx

**Before:**
```javascript
const { classes, loadClasses, createClass, deleteClass } = useClasses();
const [userId, setUserId] = useState(null);

useEffect(() => {
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      loadClasses();
    }
  };
  getCurrentUser();
}, []);

const handleSaveClass = async () => {
  try {
    await createClass(userId, {
      name: className,
      grade: classGrade,
      academic_year: academicYear,
    });
    loadClasses();
  } catch (err) {
    showNotification(err.message, 'error');
  }
};
```

**After:**
```javascript
const { classes, loadClasses, createClass, deleteClass } = useClasses();

useEffect(() => {
  loadClasses();
}, [loadClasses]);

const handleSaveClass = async () => {
  try {
    await createClass({
      name: className,
      grade: classGrade,
      academic_year: academicYear,
    });
    // No need to reload - createClass updates state automatically
  } catch (err) {
    showNotification(err.message, 'error');
  }
};
```

### Example 2: GradeList.jsx

**Before:**
```javascript
const { classes, loadClasses } = useClasses();
const [userId, setUserId] = useState(null);

useEffect(() => {
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      loadGrades(user.id);
      loadClasses(user.id);
      loadKKTP(user.id);
    }
  };
  getCurrentUser();
}, []);
```

**After:**
```javascript
const { classes, loadClasses } = useClasses();

useEffect(() => {
  const loadData = async () => {
    await Promise.all([
      loadGrades(),
      loadClasses(),
      loadKKTP(),
    ]);
  };
  loadData();
}, [loadGrades, loadClasses, loadKKTP]);
```

### Example 3: ClassSchedule.jsx

**Before:**
```javascript
const { classes, loadClasses } = useClasses();
const { schedules, loadSchedules } = useClassSchedule();
const [userId, setUserId] = useState(null);

useEffect(() => {
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      loadSchedules(user.id);
      loadClasses(user.id);
    }
  };
  getCurrentUser();
}, []);
```

**After:**
```javascript
const { classes, loadClasses } = useClasses();
const { schedules, loadSchedules } = useClassSchedule();

useEffect(() => {
  loadSchedules();
  loadClasses();
}, [loadSchedules, loadClasses]);
```

## Common Patterns

### Pattern 1: Load Data on Mount
```javascript
useEffect(() => {
  loadClasses();
}, [loadClasses]);
```

### Pattern 2: Load Multiple Resources
```javascript
useEffect(() => {
  const loadData = async () => {
    try {
      await Promise.all([
        loadClasses(),
        loadStudents(),
        loadSchedules(),
      ]);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };
  loadData();
}, [loadClasses, loadStudents, loadSchedules]);
```

### Pattern 3: Create with Feedback
```javascript
const handleCreate = async (data) => {
  try {
    await createClass(data);
    showNotification('Class created successfully', 'success');
    setShowModal(false);
  } catch (err) {
    showNotification(err.message, 'error');
  }
};
```

### Pattern 4: Delete with Confirmation
```javascript
const handleDelete = async (classId) => {
  if (!window.confirm('Are you sure?')) return;
  
  try {
    await deleteClass(classId);
    showNotification('Class deleted successfully', 'success');
  } catch (err) {
    showNotification(err.message, 'error');
  }
};
```

## Checklist for Each Component

- [ ] Remove `import supabase` if only used for auth
- [ ] Remove `userId` state variable
- [ ] Remove `getCurrentUser` function
- [ ] Remove `userId` parameter from hook calls
- [ ] Simplify `useEffect` to call hooks directly
- [ ] Remove manual state updates after create/update/delete (hooks handle this)
- [ ] Test all CRUD operations
- [ ] Verify error handling still works
- [ ] Check loading states display correctly

## Files to Update

Based on grep search, these files need updates:

1. `client/src/pages/assessment/GradeList.jsx`
2. `client/src/pages/assessment/EvaluationAnalysis.jsx`
3. `client/src/pages/scheduleAttendance/AttendanceReport.jsx`
4. `client/src/pages/scheduleAttendance/ClassSchedule.jsx`
5. `client/src/pages/scheduleAttendance/JournalReport.jsx`
6. `client/src/pages/scheduleAttendance/StudentAttendance.jsx`
7. `client/src/pages/scheduleAttendance/TeachingJournal.jsx`
8. `client/src/pages/scheduleAttendance/TeachingJournal_FIXED.jsx`

## Testing After Migration

### Manual Testing
1. Login to the application
2. Navigate to each page that uses classes
3. Test loading classes
4. Test creating a new class
5. Test updating a class
6. Test deleting a class
7. Verify error messages display correctly
8. Check loading states work

### Console Checks
- No errors in browser console
- API calls show in Network tab with 200 status
- Authorization header is present in requests
- Response data matches expected format

## Troubleshooting

### "Not authenticated" Error
- User session expired - redirect to login
- Token not being sent - check API client implementation

### Classes Not Loading
- Check Network tab for API call
- Verify endpoint returns data
- Check console for errors

### Create/Update Not Working
- Verify request body format
- Check for validation errors in response
- Ensure all required fields are provided

### State Not Updating
- Hook should update state automatically
- Check if error occurred during operation
- Verify success callback is called
