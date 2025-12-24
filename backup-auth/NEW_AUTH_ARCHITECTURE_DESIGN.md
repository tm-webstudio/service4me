# New Authentication Architecture Design
**Version:** 2.0
**Date:** 2025-12-23
**Status:** Design Phase - Awaiting Approval

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [Initialization Flow](#initialization-flow)
4. [Session Management](#session-management)
5. [Error Handling Strategy](#error-handling-strategy)
6. [Loading State Management](#loading-state-management)
7. [Route Protection Strategy](#route-protection-strategy)
8. [Migration Path](#migration-path)
9. [Testing Strategy](#testing-strategy)

---

## Design Philosophy

### Core Principles

1. **Single Source of Truth**
   - All auth state lives in one place (AuthContext)
   - No dual storage of role/profile data
   - Database is the ultimate source, context is the cache

2. **Predictable Initialization**
   - Linear, sequential initialization process
   - No race conditions or parallel fetches
   - Clear state transitions with specific names

3. **Defensive Programming**
   - Assume network can fail at any time
   - Assume sessions can expire unexpectedly
   - Never assume data exists without checking

4. **User Experience First**
   - Show loading states immediately
   - Display helpful error messages
   - Never show broken or partial UI

5. **Developer Experience**
   - Clear TypeScript types
   - Self-documenting code
   - Minimal complexity

---

## TypeScript Interfaces

### 1. Auth State Enum

```typescript
/**
 * Represents the current state of authentication initialization
 */
enum AuthStatus {
  /** Initial state - auth system is starting up */
  INITIALIZING = 'initializing',

  /** Auth system ready - user is authenticated */
  AUTHENTICATED = 'authenticated',

  /** Auth system ready - user is not authenticated */
  UNAUTHENTICATED = 'unauthenticated',

  /** Auth operation in progress (login, logout, etc.) */
  LOADING = 'loading',

  /** Auth system encountered an error */
  ERROR = 'error'
}
```

### 2. User Role Type

```typescript
/**
 * User roles in the system
 */
type UserRole = 'client' | 'stylist' | 'admin'
```

### 3. User Profile Interface

```typescript
/**
 * Complete user profile data
 * Combines auth metadata with database profile
 */
interface UserProfile {
  /** User ID (matches auth.users.id) */
  id: string

  /** User email address */
  email: string

  /** User's full name */
  fullName: string | null

  /** User role - SINGLE SOURCE OF TRUTH */
  role: UserRole

  /** Avatar/profile image URL */
  avatarUrl: string | null

  /** Phone number */
  phone: string | null

  /** Account created timestamp */
  createdAt: string

  /** Last updated timestamp */
  updatedAt: string

  /** Stylist-specific data (only if role === 'stylist') */
  stylistProfile?: {
    id: string
    businessName: string
    location: string
    phone: string | null
    contactEmail: string | null
  }
}
```

### 4. Auth Error Interface

```typescript
/**
 * Structured error information
 */
interface AuthError {
  /** Error code for programmatic handling */
  code: string

  /** User-friendly error message */
  message: string

  /** Technical details for debugging */
  details?: string

  /** Whether the error is recoverable */
  recoverable: boolean

  /** Suggested action for the user */
  action?: 'retry' | 'login' | 'contact_support' | 'refresh'
}
```

### 5. Auth Context State Interface

```typescript
/**
 * Complete authentication state
 */
interface AuthState {
  /** Current auth status */
  status: AuthStatus

  /** User profile (null if not authenticated) */
  user: UserProfile | null

  /** Current error (null if no error) */
  error: AuthError | null

  /** Supabase session object (internal use) */
  session: Session | null
}
```

### 6. Auth Context Methods Interface

```typescript
/**
 * Authentication actions
 */
interface AuthActions {
  /**
   * Sign in with email and password
   * @returns Promise that resolves when sign in is complete
   * @throws AuthError if sign in fails
   */
  signIn: (email: string, password: string) => Promise<void>

  /**
   * Sign up a new user
   * @returns Promise that resolves when sign up is complete
   * @throws AuthError if sign up fails
   */
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: {
      fullName?: string
      phone?: string
      businessName?: string
      location?: string
    }
  ) => Promise<void>

  /**
   * Sign out the current user
   * @returns Promise that resolves when sign out is complete
   * @throws AuthError if sign out fails (but clears local state anyway)
   */
  signOut: () => Promise<void>

  /**
   * Refresh user profile data from database
   * @returns Promise that resolves when refresh is complete
   */
  refreshProfile: () => Promise<void>

  /**
   * Clear the current error
   */
  clearError: () => void

  /**
   * Retry the last failed operation
   * Only available if error.recoverable === true
   */
  retry: () => Promise<void>
}
```

### 7. Auth Context Interface (Complete)

```typescript
/**
 * Complete auth context value
 */
interface AuthContextValue extends AuthState, AuthActions {
  /** Convenience: Check if user is authenticated */
  isAuthenticated: boolean

  /** Convenience: Check if auth is initializing */
  isInitializing: boolean

  /** Convenience: Check if an auth operation is in progress */
  isLoading: boolean

  /** Convenience: Get dashboard URL for current user */
  getDashboardUrl: () => string
}
```

### 8. Internal State Machine

```typescript
/**
 * Internal state machine for managing auth flow
 * Not exposed to consumers
 */
interface AuthStateMachine {
  /** Current state */
  current: AuthStatus

  /** Pending operation (if any) */
  pendingOperation: 'signin' | 'signup' | 'signout' | 'refresh' | null

  /** Initialization steps completed */
  initSteps: {
    sessionChecked: boolean
    profileFetched: boolean
  }

  /** Last operation for retry */
  lastOperation?: {
    type: string
    args: any[]
  }
}
```

---

## Initialization Flow

### State Transition Diagram

```
[App Loads]
    ↓
[INITIALIZING]
    ↓
┌─────────────────────────────────────┐
│  Step 1: Check Supabase Connection │
└─────────────────────────────────────┘
    ↓ Success              ↓ Fail
    ↓                      ↓
    ↓                 [ERROR]
    ↓                 "Service unavailable"
    ↓
┌─────────────────────────────────────┐
│  Step 2: Get Session from Supabase  │
│  Method: supabase.auth.getSession() │
└─────────────────────────────────────┘
    ↓ Has Session         ↓ No Session
    ↓                     ↓
    ↓               [UNAUTHENTICATED]
    ↓               (Ready - no user)
    ↓
┌─────────────────────────────────────┐
│  Step 3: Validate Session           │
│  Check: Not expired, has user       │
└─────────────────────────────────────┘
    ↓ Valid               ↓ Invalid
    ↓                     ↓
    ↓               [UNAUTHENTICATED]
    ↓
┌─────────────────────────────────────┐
│  Step 4: Fetch User Profile         │
│  Query: users table by user.id      │
└─────────────────────────────────────┘
    ↓ Found               ↓ Not Found
    ↓                     ↓
    ↓                Create Profile
    ↓                from Auth Metadata
    ↓                     ↓
┌─────────────────────────────────────┐
│  Step 5: Fetch Role-Specific Data   │
│  If stylist: Fetch stylist_profiles │
└─────────────────────────────────────┘
    ↓ Success             ↓ Fail
    ↓                     ↓
    ↓                 [ERROR]
    ↓                 "Profile incomplete"
    ↓
┌─────────────────────────────────────┐
│  Step 6: Construct UserProfile      │
│  Merge all data into single object  │
└─────────────────────────────────────┘
    ↓
[AUTHENTICATED]
(Ready - with user)
```

### Initialization Pseudo-code

```typescript
async function initialize() {
  // Set status to INITIALIZING
  setState({ status: AuthStatus.INITIALIZING })

  try {
    // Step 1: Check Supabase configuration
    if (!isSupabaseConfigured()) {
      throw new AuthError({
        code: 'CONFIG_MISSING',
        message: 'Authentication service is not configured',
        recoverable: false,
        action: 'contact_support'
      })
    }

    // Step 2: Get current session
    const { data: { session }, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError) {
      throw new AuthError({
        code: 'SESSION_ERROR',
        message: 'Failed to restore session',
        details: sessionError.message,
        recoverable: true,
        action: 'retry'
      })
    }

    // Step 3: No session = unauthenticated
    if (!session) {
      setState({
        status: AuthStatus.UNAUTHENTICATED,
        user: null,
        session: null,
        error: null
      })
      return
    }

    // Step 4: Fetch user profile from database
    const profile = await fetchUserProfile(session.user.id)

    if (!profile) {
      // Profile doesn't exist - create from auth metadata
      const created = await createProfileFromAuth(session.user)
      if (!created) {
        throw new AuthError({
          code: 'PROFILE_CREATE_FAILED',
          message: 'Failed to create user profile',
          recoverable: true,
          action: 'retry'
        })
      }
    }

    // Step 5: Fetch role-specific data (if stylist)
    if (profile.role === 'stylist') {
      const stylistProfile = await fetchStylistProfile(profile.id)
      profile.stylistProfile = stylistProfile
    }

    // Step 6: Set authenticated state
    setState({
      status: AuthStatus.AUTHENTICATED,
      user: profile,
      session: session,
      error: null
    })

  } catch (error) {
    // Handle initialization errors
    setState({
      status: AuthStatus.ERROR,
      user: null,
      session: null,
      error: normalizeError(error)
    })
  }
}
```

### Key Design Decisions

1. **Sequential Execution:** No parallel fetches during init
2. **Early Exit:** Unauthenticated state set immediately if no session
3. **Profile Creation:** Automatic profile creation if missing
4. **Error Boundary:** All errors caught and normalized
5. **State Transitions:** Clear status at each step

---

## Session Management

### Session Lifecycle

```
[User Signs In]
    ↓
Create Session (Supabase)
    ↓
Store Session (Supabase handles storage)
    ↓
Fetch User Profile
    ↓
Set AUTHENTICATED state
    ↓
Subscribe to Auth State Changes
    ↓
┌───────────────────────────────────┐
│  Active Session                   │
│  - Token refreshes automatically  │
│  - Listen for changes             │
└───────────────────────────────────┘
    ↓
[Events]
├─ TOKEN_REFRESHED → Update session object
├─ USER_UPDATED → Refresh user profile
├─ SIGNED_OUT → Clear state, set UNAUTHENTICATED
└─ PASSWORD_RECOVERY → Handle recovery flow
```

### Auth State Change Handler

```typescript
/**
 * Handle Supabase auth state changes
 * This is the ONLY place where auth state can change unexpectedly
 */
async function handleAuthStateChange(
  event: AuthChangeEvent,
  session: Session | null
) {
  console.log('[AUTH] Event:', event, 'Has session:', !!session)

  switch (event) {
    case 'SIGNED_IN':
      // User signed in - handled by signIn() method
      // Don't handle here to avoid race conditions
      break

    case 'SIGNED_OUT':
      // User signed out
      setState({
        status: AuthStatus.UNAUTHENTICATED,
        user: null,
        session: null,
        error: null
      })
      break

    case 'TOKEN_REFRESHED':
      // Session token refreshed - update session object
      setState({ session })
      break

    case 'USER_UPDATED':
      // User metadata changed - refresh profile
      if (session?.user) {
        await refreshProfile()
      }
      break

    case 'PASSWORD_RECOVERY':
      // Password recovery initiated
      // Let the recovery page handle this
      break

    default:
      // Unknown event - log and ignore
      console.warn('[AUTH] Unknown event:', event)
  }
}
```

### Session Persistence Strategy

```
┌─────────────────────────────────────────────┐
│  Supabase Handles Storage                   │
│  - localStorage for web                     │
│  - Automatic token refresh                  │
│  - Cross-tab synchronization                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  AuthContext Manages State                  │
│  - In-memory only (no localStorage)         │
│  - Restored on page load via getSession()   │
│  - Single source of truth                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Profile Data Flow                          │
│  - Fetched fresh on auth state change       │
│  - Not stored in localStorage               │
│  - Database is source of truth              │
└─────────────────────────────────────────────┘
```

### Session Expiration Handling

```typescript
/**
 * Session expiration is handled automatically by Supabase
 *
 * Flow:
 * 1. Session expires
 * 2. Supabase attempts automatic refresh
 * 3a. If refresh succeeds → TOKEN_REFRESHED event
 * 3b. If refresh fails → SIGNED_OUT event
 * 4. Auth state updated accordingly
 *
 * No manual intervention needed
 */
```

---

## Error Handling Strategy

### Error Categories

```typescript
/**
 * Error codes with handling strategy
 */
const ERROR_CATALOG = {
  // Network/Connection Errors (Recoverable)
  NETWORK_ERROR: {
    message: 'Unable to connect to authentication service',
    recoverable: true,
    action: 'retry',
    logLevel: 'warn'
  },

  // Configuration Errors (Not Recoverable)
  CONFIG_MISSING: {
    message: 'Authentication service is not configured',
    recoverable: false,
    action: 'contact_support',
    logLevel: 'error'
  },

  // Credential Errors (Not Recoverable - user error)
  INVALID_CREDENTIALS: {
    message: 'Invalid email or password',
    recoverable: false,
    action: 'login',
    logLevel: 'info'
  },

  // Profile Errors (Recoverable)
  PROFILE_NOT_FOUND: {
    message: 'User profile not found',
    recoverable: true,
    action: 'retry',
    logLevel: 'warn'
  },

  PROFILE_CREATE_FAILED: {
    message: 'Failed to create user profile',
    recoverable: true,
    action: 'retry',
    logLevel: 'error'
  },

  // Session Errors (Recoverable)
  SESSION_EXPIRED: {
    message: 'Your session has expired. Please sign in again.',
    recoverable: false,
    action: 'login',
    logLevel: 'info'
  },

  SESSION_ERROR: {
    message: 'Failed to restore session',
    recoverable: true,
    action: 'retry',
    logLevel: 'warn'
  },

  // Database Errors (Recoverable)
  DATABASE_ERROR: {
    message: 'Database error occurred',
    recoverable: true,
    action: 'retry',
    logLevel: 'error'
  },

  // Generic Errors
  UNKNOWN_ERROR: {
    message: 'An unexpected error occurred',
    recoverable: true,
    action: 'retry',
    logLevel: 'error'
  }
}
```

### Error Normalization

```typescript
/**
 * Convert any error into structured AuthError
 */
function normalizeError(error: unknown): AuthError {
  // Already an AuthError
  if (error instanceof AuthError) {
    return error
  }

  // Supabase auth error
  if (error?.message?.includes('Invalid login credentials')) {
    return {
      code: 'INVALID_CREDENTIALS',
      ...ERROR_CATALOG.INVALID_CREDENTIALS
    }
  }

  // Network error
  if (error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('Network request failed')) {
    return {
      code: 'NETWORK_ERROR',
      ...ERROR_CATALOG.NETWORK_ERROR,
      details: error.message
    }
  }

  // Database error (PGRST codes)
  if (error?.code?.startsWith('PGRST')) {
    return {
      code: 'DATABASE_ERROR',
      ...ERROR_CATALOG.DATABASE_ERROR,
      details: error.message
    }
  }

  // Unknown error
  return {
    code: 'UNKNOWN_ERROR',
    ...ERROR_CATALOG.UNKNOWN_ERROR,
    details: error?.message || String(error)
  }
}
```

### Error Display Strategy

```typescript
/**
 * Error UI Display Rules
 */
const ERROR_DISPLAY_RULES = {
  // Initialization errors - Show full-screen error
  INITIALIZING: {
    component: 'FullScreenError',
    showRetry: true,
    allowDismiss: false
  },

  // Login/signup errors - Show inline in form
  AUTHENTICATION: {
    component: 'InlineError',
    showRetry: false,
    allowDismiss: true
  },

  // Profile fetch errors - Show toast notification
  PROFILE_FETCH: {
    component: 'Toast',
    showRetry: true,
    allowDismiss: true,
    autoHide: 5000
  },

  // Session errors - Redirect to login
  SESSION: {
    component: 'Toast',
    showRetry: false,
    allowDismiss: false,
    redirectTo: '/login'
  }
}
```

### Error Recovery Flow

```
[Error Occurs]
    ↓
Normalize to AuthError
    ↓
Log to Console (level based on error type)
    ↓
Set error state
    ↓
Display to user (based on context)
    ↓
┌─────────────────────────────┐
│  Is Recoverable?            │
└─────────────────────────────┘
    ↓ Yes              ↓ No
    ↓                  ↓
Show Retry Button   Show Action Button
    ↓                  ↓
User Clicks         User Clicks
    ↓                  ↓
Execute Retry       Execute Action
    ↓                  (login, support, etc.)
    ↓
Success?
    ↓ Yes              ↓ No
    ↓                  ↓
Clear Error      Update Error Message
                 (increment retry count)
```

---

## Loading State Management

### Loading State Hierarchy

```
┌─────────────────────────────────────────────┐
│  Level 1: Global Auth Loading               │
│  Status: INITIALIZING                       │
│  UI: Full-screen spinner                    │
│  Blocks: Entire app                         │
│  Duration: Until auth initialized           │
└─────────────────────────────────────────────┘
              ↓ Auth Ready
┌─────────────────────────────────────────────┐
│  Level 2: Operation Loading                 │
│  Status: LOADING                            │
│  UI: Button spinner, disabled forms         │
│  Blocks: Current operation                  │
│  Duration: Until operation complete         │
└─────────────────────────────────────────────┘
              ↓ Operation Complete
┌─────────────────────────────────────────────┐
│  Level 3: Component Loading                 │
│  Status: Component-specific state           │
│  UI: Skeleton screens, local spinners       │
│  Blocks: Individual components              │
│  Duration: Until data loaded                │
└─────────────────────────────────────────────┘
```

### Loading State Rules

```typescript
/**
 * Loading State Decision Matrix
 */
const LOADING_RULES = {
  // App just loaded
  APP_MOUNT: {
    status: AuthStatus.INITIALIZING,
    shouldShowUI: false,
    shouldAllowInteraction: false,
    spinner: 'fullscreen'
  },

  // User initiated sign in
  SIGN_IN: {
    status: AuthStatus.LOADING,
    shouldShowUI: true,
    shouldAllowInteraction: false,
    spinner: 'button'
  },

  // User initiated sign up
  SIGN_UP: {
    status: AuthStatus.LOADING,
    shouldShowUI: true,
    shouldAllowInteraction: false,
    spinner: 'button'
  },

  // User initiated sign out
  SIGN_OUT: {
    status: AuthStatus.LOADING,
    shouldShowUI: true,
    shouldAllowInteraction: false,
    spinner: 'none' // Instant UI update
  },

  // Refreshing profile data
  PROFILE_REFRESH: {
    status: AuthStatus.AUTHENTICATED, // Don't change status
    shouldShowUI: true,
    shouldAllowInteraction: true, // Allow interaction
    spinner: 'subtle' // Small indicator
  },

  // Auth is ready
  READY: {
    status: AuthStatus.AUTHENTICATED | AuthStatus.UNAUTHENTICATED,
    shouldShowUI: true,
    shouldAllowInteraction: true,
    spinner: 'none'
  }
}
```

### Loading UI Components

```typescript
/**
 * Loading UI Component Selection
 */
function getLoadingUI(status: AuthStatus, operation: string | null) {
  if (status === AuthStatus.INITIALIZING) {
    return {
      component: 'FullScreenSpinner',
      message: 'Loading Service4Me...',
      showLogo: true
    }
  }

  if (status === AuthStatus.LOADING) {
    switch (operation) {
      case 'signin':
        return {
          component: 'ButtonSpinner',
          message: 'Signing in...',
          disableForm: true
        }

      case 'signup':
        return {
          component: 'ButtonSpinner',
          message: 'Creating account...',
          disableForm: true
        }

      case 'signout':
        return {
          component: 'None',
          message: null,
          disableForm: false
        }

      default:
        return {
          component: 'ButtonSpinner',
          message: 'Loading...',
          disableForm: true
        }
    }
  }

  return null // No loading UI
}
```

### Loading State Transitions

```
[INITIALIZING]
    ↓
  (Session check complete)
    ↓
[AUTHENTICATED / UNAUTHENTICATED]
    ↓
  (User clicks sign in)
    ↓
[LOADING] (operation: 'signin')
    ↓
  (Sign in complete)
    ↓
[AUTHENTICATED]

─────────────────────────

[AUTHENTICATED]
    ↓
  (User clicks sign out)
    ↓
[LOADING] (operation: 'signout') ← Very brief
    ↓
  (Local state cleared immediately)
    ↓
[UNAUTHENTICATED]
    ↓
  (Supabase sign out completes in background)
```

---

## Route Protection Strategy

### Protection Levels

```typescript
/**
 * Three levels of route protection
 */
enum ProtectionLevel {
  /** No protection - anyone can access */
  PUBLIC = 'public',

  /** Must be authenticated - any role */
  AUTHENTICATED = 'authenticated',

  /** Must be authenticated with specific role */
  ROLE_BASED = 'role_based'
}
```

### Route Configuration

```typescript
/**
 * Route protection configuration
 */
const ROUTE_PROTECTION = {
  '/': {
    level: ProtectionLevel.PUBLIC
  },

  '/login': {
    level: ProtectionLevel.PUBLIC,
    redirectIfAuthenticated: '/dashboard' // Smart redirect
  },

  '/signup': {
    level: ProtectionLevel.PUBLIC,
    redirectIfAuthenticated: '/dashboard' // Smart redirect
  },

  '/dashboard/client': {
    level: ProtectionLevel.ROLE_BASED,
    allowedRoles: ['client'],
    redirectIfUnauthorized: '/dashboard' // Smart redirect
  },

  '/dashboard/stylist': {
    level: ProtectionLevel.ROLE_BASED,
    allowedRoles: ['stylist'],
    redirectIfUnauthorized: '/dashboard' // Smart redirect
  },

  '/admin': {
    level: ProtectionLevel.ROLE_BASED,
    allowedRoles: ['admin'],
    redirectIfUnauthorized: '/'
  }
}
```

### Protection Component Design

```typescript
/**
 * Single unified protection component
 * Replaces 3 separate components
 */
interface ProtectedRouteProps {
  /** Protection level */
  level: ProtectionLevel

  /** Allowed roles (for ROLE_BASED) */
  allowedRoles?: UserRole[]

  /** Where to redirect if unauthorized */
  redirectTo?: string

  /** Children to render if authorized */
  children: React.ReactNode

  /** Custom loading component */
  loadingComponent?: React.ReactNode

  /** Custom unauthorized component */
  unauthorizedComponent?: React.ReactNode
}
```

### Protection Logic Flow

```
[Component Renders]
    ↓
Check auth.status
    ↓
┌─────────────────────────┐
│  Is INITIALIZING?       │
└─────────────────────────┘
    ↓ Yes              ↓ No
    ↓                  ↓
Show Loading        Continue
    ↓
    ↓
┌─────────────────────────┐
│  Is ERROR?              │
└─────────────────────────┘
    ↓ Yes              ↓ No
    ↓                  ↓
Show Error         Continue
    ↓
    ↓
┌─────────────────────────┐
│  Level: PUBLIC?         │
└─────────────────────────┘
    ↓ Yes              ↓ No
    ↓                  ↓
Render Children    Continue
    ↓
    ↓
┌─────────────────────────┐
│  Is AUTHENTICATED?      │
└─────────────────────────┘
    ↓ No               ↓ Yes
    ↓                  ↓
Redirect to Login  Continue
    ↓
    ↓
┌─────────────────────────┐
│  Level: ROLE_BASED?     │
└─────────────────────────┘
    ↓ No               ↓ Yes
    ↓                  ↓
Render Children    Check Role
    ↓
    ↓
┌─────────────────────────┐
│  Has Required Role?     │
└─────────────────────────┘
    ↓ No               ↓ Yes
    ↓                  ↓
Show Unauthorized  Render Children
or Redirect
```

### Smart Dashboard Redirect

```typescript
/**
 * Redirect to appropriate dashboard based on role
 */
function getSmartDashboardUrl(user: UserProfile | null): string {
  if (!user) return '/login'

  switch (user.role) {
    case 'admin':
      return '/admin'
    case 'stylist':
      return '/dashboard/stylist'
    case 'client':
      return '/dashboard/client'
    default:
      return '/dashboard/client'
  }
}
```

---

## Migration Path

### Phase 1: Create New Implementation (No Breaking Changes)

1. Create new auth context file: `hooks/use-auth-v2.tsx`
2. Implement new architecture
3. Test thoroughly in isolation
4. Keep old `use-auth.tsx` intact

### Phase 2: Add Feature Flag

```typescript
// .env.local
AUTH_VERSION=v2  # or v1

// Use in app
const useAuth = process.env.AUTH_VERSION === 'v2'
  ? useAuthV2
  : useAuthV1
```

### Phase 3: Parallel Testing

1. Test new auth on staging environment
2. Verify all flows work correctly
3. Check for regressions
4. Monitor error logs

### Phase 4: Gradual Rollout

1. Switch staging to v2
2. Run for 1 week, monitor issues
3. Switch production to v2
4. Monitor for 1 week

### Phase 5: Cleanup

1. Remove old `use-auth.tsx`
2. Rename `use-auth-v2.tsx` to `use-auth.tsx`
3. Remove feature flag
4. Delete backup files after confirming stability

### Data Migration

**No database changes required** - new auth system uses same schema:
- `auth.users` table (Supabase managed)
- `public.users` table (existing)
- `public.stylist_profiles` table (existing)

**No user impact** - existing sessions continue to work

---

## Testing Strategy

### Unit Tests

```typescript
describe('AuthContext', () => {
  it('initializes to INITIALIZING state', () => {})
  it('transitions to UNAUTHENTICATED when no session', () => {})
  it('transitions to AUTHENTICATED when session exists', () => {})
  it('fetches user profile on authentication', () => {})
  it('handles profile fetch errors', () => {})
  it('normalizes errors correctly', () => {})
  it('clears error on clearError()', () => {})
  it('signs in user successfully', () => {})
  it('signs out user successfully', () => {})
  it('handles concurrent sign in attempts', () => {})
})
```

### Integration Tests

```typescript
describe('Auth Flow', () => {
  it('completes full signup flow', async () => {})
  it('completes full signin flow', async () => {})
  it('restores session on page reload', async () => {})
  it('handles token refresh', async () => {})
  it('handles session expiration', async () => {})
  it('redirects to correct dashboard', async () => {})
})
```

### E2E Tests (Playwright)

```typescript
test('User can sign up and access dashboard', async ({ page }) => {})
test('User can sign in with existing account', async ({ page }) => {})
test('Protected routes redirect to login', async ({ page }) => {})
test('User can sign out', async ({ page }) => {})
test('Session persists across page reloads', async ({ page }) => {})
test('Role-based access control works', async ({ page }) => {})
```

---

## Implementation Checklist

### Before Implementation
- [ ] Review this design document
- [ ] Get stakeholder approval
- [ ] Confirm database schema matches expectations
- [ ] Review Supabase configuration

### During Implementation
- [ ] Create TypeScript interfaces
- [ ] Implement AuthContext
- [ ] Implement initialization logic
- [ ] Implement session management
- [ ] Implement error handling
- [ ] Create ProtectedRoute component
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Add E2E tests

### After Implementation
- [ ] Code review
- [ ] Test on staging
- [ ] Monitor error logs
- [ ] Gradual rollout
- [ ] Remove old implementation

---

## Key Improvements Over Current System

| Aspect | Current System | New System |
|--------|---------------|------------|
| **Initialization** | Race conditions, parallel fetches | Sequential, predictable |
| **State Management** | 3 refs, complex flags | Single state machine |
| **Error Handling** | Console logs only | Structured errors with recovery |
| **Loading States** | Confusing, multiple flags | Clear hierarchy |
| **Route Protection** | 3 separate components | 1 unified component |
| **Session Handling** | Manual event management | Automatic with clear handlers |
| **Type Safety** | Partial TypeScript | Full type safety |
| **Testing** | None | Unit + Integration + E2E |
| **Code Complexity** | 528 lines, many workarounds | ~400 lines, clean logic |

---

## Success Metrics

### Technical Metrics
- Zero race conditions in auth flow
- < 500ms initialization time
- < 2% error rate on auth operations
- 100% test coverage on auth logic

### User Experience Metrics
- Clear loading states at all times
- Helpful error messages when things fail
- No broken/partial UI renders
- Instant feedback on all auth actions

---

## Questions for Review

1. **TypeScript Interfaces:** Are the interfaces comprehensive enough?
2. **Error Handling:** Do we need additional error codes?
3. **Loading States:** Is the 3-level hierarchy clear?
4. **Route Protection:** Should we add middleware for server-side protection?
5. **Migration:** Is the gradual rollout plan acceptable?
6. **Testing:** Are the test categories sufficient?

---

## Next Steps

**Pending Approval:**
1. Review this design document
2. Provide feedback on any concerns
3. Approve for implementation

**After Approval:**
1. Create implementation plan (task breakdown)
2. Begin Phase 1: Create new auth context
3. Implement with tests
4. Deploy and monitor

---

**End of Design Document**
