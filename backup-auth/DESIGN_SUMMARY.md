# New Auth Architecture - Quick Reference
**Design Document:** See NEW_AUTH_ARCHITECTURE_DESIGN.md for full details

---

## Core Concept: State Machine

```
     ┌──────────────┐
     │ INITIALIZING │ ← App loads
     └──────┬───────┘
            │
      Check Session
            │
      ┌─────┴─────┐
      │           │
      ↓           ↓
┌──────────┐  ┌────────────────┐
│   UNAUTH │  │ AUTHENTICATED  │
└────┬─────┘  └────────┬───────┘
     │                 │
     │    Sign In      │
     │ ────────────→   │
     │                 │
     │   Sign Out      │
     │ ←────────────   │
     │                 │
     └─────────────────┘
```

---

## Key Improvements

### 1. Single State Object (No More Refs!)

**Old:**
```typescript
const [user, setUser] = useState()
const [userProfile, setUserProfile] = useState()
const [loading, setLoading] = useState()
const lastFetchedUserId = useRef()
const signInInProgress = useRef()
const initialSessionHandled = useRef()
```

**New:**
```typescript
const [authState, setAuthState] = useState<AuthState>({
  status: 'initializing',
  user: null,
  error: null,
  session: null
})
```

### 2. Clear Status Enum

**Old:** Multiple boolean flags
**New:** Single status field

```typescript
enum AuthStatus {
  INITIALIZING   // App loading
  AUTHENTICATED  // User logged in
  UNAUTHENTICATED // No user
  LOADING        // Operation in progress
  ERROR          // Something failed
}
```

### 3. Structured Errors

**Old:** `console.error()` and hope
**New:** Rich error objects

```typescript
interface AuthError {
  code: string           // 'INVALID_CREDENTIALS'
  message: string        // User-friendly message
  recoverable: boolean   // Can retry?
  action: string        // 'retry' | 'login' | etc.
}
```

### 4. Sequential Initialization

**Old:** Parallel fetches with race conditions
**New:** Step-by-step flow

```
1. Check config
2. Get session
3. Fetch profile
4. Fetch role data
5. Set AUTHENTICATED
```

### 5. One Protection Component

**Old:**
- ProtectedAdminRoute
- ProtectedClientRoute
- ProtectedStylistRoute

**New:**
```typescript
<ProtectedRoute
  level="role_based"
  allowedRoles={['stylist']}
>
  <Dashboard />
</ProtectedRoute>
```

---

## API Comparison

### Old Auth Hook

```typescript
const {
  user,              // Supabase user
  userProfile,       // Database profile (maybe null?)
  session,           // Supabase session
  loading,           // Boolean
  signIn,
  signUp,
  signOut,
  getDashboardUrl
} = useAuth()
```

### New Auth Hook

```typescript
const {
  status,            // 'initializing' | 'authenticated' | etc.
  user,              // Complete UserProfile or null
  error,             // AuthError or null
  isAuthenticated,   // Computed boolean
  isInitializing,    // Computed boolean
  isLoading,         // Computed boolean
  signIn,
  signUp,
  signOut,
  refreshProfile,
  clearError,
  retry,
  getDashboardUrl
} = useAuth()
```

---

## UserProfile Type (Single Source of Truth)

```typescript
interface UserProfile {
  id: string
  email: string
  fullName: string | null
  role: 'client' | 'stylist' | 'admin'  ← SINGLE SOURCE
  avatarUrl: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
  stylistProfile?: {                     ← Only if stylist
    id: string
    businessName: string
    location: string
    phone: string | null
    contactEmail: string | null
  }
}
```

**No more checking both `user.user_metadata.role` and `userProfile.role`!**

---

## Error Handling Example

```typescript
// Error occurs
try {
  await signIn(email, password)
} catch (error) {
  // Normalized to AuthError
  {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
    recoverable: false,
    action: 'login'
  }
}

// Display to user
if (error.recoverable) {
  <Button onClick={retry}>Try Again</Button>
} else {
  <Button onClick={() => navigate(error.action)}>
    {error.action === 'login' ? 'Back to Login' : 'Get Help'}
  </Button>
}
```

---

## Loading States (3 Levels)

```
Level 1: INITIALIZING
  → Full-screen spinner
  → Blocks entire app
  → Until auth ready

Level 2: LOADING
  → Button spinner
  → Disables forms
  → During operations

Level 3: Component Loading
  → Local spinners
  → Component-specific
  → For data fetching
```

---

## Sign In Flow

**Old Flow (Problematic):**
```
User clicks → signIn() sets flag → Supabase auth
  → SIGNED_IN event fires → Handler checks flag
  → Profile fetch (maybe race?) → Wait 50ms
  → Navigate
```

**New Flow (Clean):**
```
User clicks → Set status=LOADING → Supabase auth
  → Fetch profile → Set status=AUTHENTICATED
  → Navigate immediately
```

**No flags, no timeouts, no race conditions!**

---

## Session Restoration

**Old:**
- INITIAL_SESSION event
- Fallback timeout
- Multiple handlers

**New:**
```typescript
// On mount
async function initialize() {
  const { session } = await supabase.auth.getSession()

  if (!session) {
    setState({ status: 'unauthenticated' })
    return
  }

  const profile = await fetchProfile(session.user.id)
  setState({
    status: 'authenticated',
    user: profile
  })
}
```

**Simple, predictable, testable!**

---

## Benefits Summary

| Metric | Old | New |
|--------|-----|-----|
| **Lines of Code** | 528 | ~400 |
| **Refs Used** | 3 | 0 |
| **Race Conditions** | Multiple | 0 |
| **Error Types** | Unstructured | Structured |
| **Loading States** | Boolean | Enum |
| **Type Safety** | Partial | Full |
| **Test Coverage** | 0% | Target 100% |
| **Protection Components** | 3 | 1 |

---

## Migration Safety

✓ **No database changes** - Uses same schema
✓ **No data migration** - Existing users work
✓ **No breaking changes** - Can run in parallel
✓ **Gradual rollout** - Test before switching
✓ **Easy rollback** - Keep old code until verified

---

## Review Checklist

### Architecture
- [ ] State machine approach makes sense?
- [ ] AuthStatus enum covers all cases?
- [ ] UserProfile type is comprehensive?
- [ ] Error handling strategy is clear?

### Implementation
- [ ] TypeScript interfaces look good?
- [ ] Initialization flow is logical?
- [ ] Session management is robust?
- [ ] Loading states are clear?

### Testing
- [ ] Test categories are sufficient?
- [ ] E2E scenarios cover main flows?
- [ ] Error cases are tested?

### Migration
- [ ] Parallel implementation approach OK?
- [ ] Rollout plan is safe?
- [ ] Rollback plan exists?

---

## Questions?

1. Should we add server-side middleware for route protection?
2. Need additional error codes?
3. Comfortable with state machine approach?
4. Any concerns about migration plan?

---

**Ready for implementation after approval!**

See full design: `NEW_AUTH_ARCHITECTURE_DESIGN.md`
