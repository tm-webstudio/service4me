# Phase 5 Complete: Protected Routes Using Auth V2

## Overview

Phase 5 builds protected route components that use the auth-v2 system. These replace the old protected route components with cleaner, more reliable versions.

**Status:** ✅ Complete

**Files Created:**
- `components/auth-v2/protected-route-client.tsx` - Client-only route protection
- `components/auth-v2/protected-route-stylist.tsx` - Stylist-only route protection
- `components/auth-v2/protected-route-admin.tsx` - Admin-only route protection
- `components/auth-v2/index.ts` - Central export file (updated)

---

## What Was Built

### 1. Protected Route Components

Three new protected route components that wrap page content and enforce role-based access control:

#### ProtectedClientRouteV2
**File:** `components/auth-v2/protected-route-client.tsx`

**Purpose:** Protects client-only pages

**Features:**
- Uses `AuthStatus` enum from auth-v2
- Single source of truth (`user.role`)
- Waits for initialization before rendering
- Shows loading states during auth operations
- Displays clear error messages
- Redirects non-clients to appropriate dashboards
- Offers "Switch Account" option

**Usage:**
```tsx
import { ProtectedClientRouteV2 } from '@/components/auth-v2/protected-route-client'
import { AuthProvider } from '@/lib/auth-v2'

export default function ClientDashboard() {
  return (
    <AuthProvider>
      <ProtectedClientRouteV2>
        {/* Your client dashboard content here */}
        <h1>Client Dashboard</h1>
      </ProtectedClientRouteV2>
    </AuthProvider>
  )
}
```

#### ProtectedStylistRouteV2
**File:** `components/auth-v2/protected-route-stylist.tsx`

**Purpose:** Protects stylist-only pages

**Features:**
- Same core features as client version
- Checks for `user.role === 'stylist'`
- Redirects non-stylists appropriately

**Usage:**
```tsx
import { ProtectedStylistRouteV2 } from '@/components/auth-v2/protected-route-stylist'
import { AuthProvider } from '@/lib/auth-v2'

export default function StylistDashboard() {
  return (
    <AuthProvider>
      <ProtectedStylistRouteV2>
        {/* Your stylist dashboard content here */}
        <h1>Stylist Dashboard</h1>
      </ProtectedStylistRouteV2>
    </AuthProvider>
  )
}
```

#### ProtectedAdminRouteV2
**File:** `components/auth-v2/protected-route-admin.tsx`

**Purpose:** Protects admin-only pages

**Features:**
- Same core features as other versions
- Checks for `user.role === 'admin'`
- Strictest access control

**Usage:**
```tsx
import { ProtectedAdminRouteV2 } from '@/components/auth-v2/protected-route-admin'
import { AuthProvider } from '@/lib/auth-v2'

export default function AdminDashboard() {
  return (
    <AuthProvider>
      <ProtectedAdminRouteV2>
        {/* Your admin dashboard content here */}
        <h1>Admin Dashboard</h1>
      </ProtectedAdminRouteV2>
    </AuthProvider>
  )
}
```

---

## Key Improvements Over V1

### 1. Single Source of Truth
**V1:**
```typescript
// Dual source of truth - checking multiple places
const role = userProfile?.role || user?.user_metadata?.role
const isClient = role === 'client' || !role
```

**V2:**
```typescript
// Single source of truth - auth-v2 provides unified user object
const isClient = user.role === 'client' || !user.role
```

### 2. Clear State Management
**V1:**
```typescript
// Boolean loading flag
if (loading) {
  return <LoadingScreen />
}

// Manual check for profile
if (user && !userProfile) {
  return <LoadingScreen />
}
```

**V2:**
```typescript
// Status enum with clear states
if (status === AuthStatus.INITIALIZING) {
  return <InitializingScreen />
}

if (status === AuthStatus.LOADING) {
  return <LoadingScreen />
}

if (status === AuthStatus.ERROR && error) {
  return <ErrorScreen error={error} />
}
```

### 3. Proper Error Handling
**V1:**
```typescript
// No error state handling - errors just logged to console
```

**V2:**
```typescript
// Full error state UI with recovery options
if (status === AuthStatus.ERROR && error) {
  return (
    <ErrorScreen>
      <p>{error.message}</p>
      <button onClick={() => clearError()}>Retry</button>
    </ErrorScreen>
  )
}
```

### 4. No Race Conditions
**V1:**
```typescript
// Could render before userProfile loads
// Relied on fallback values
```

**V2:**
```typescript
// CRITICAL: Wait for initialization to complete
if (status === AuthStatus.INITIALIZING) {
  // Won't render children until auth is ready
  return <InitializingScreen />
}
```

---

## Component Flow

### Initialization Flow

```
1. Component mounts
   ↓
2. AuthProvider initializes auth-v2
   ↓
3. Status = INITIALIZING
   ↓
4. Protected route shows "Initializing..."
   ↓
5. Auth completes initialization
   ↓
6. Status = AUTHENTICATED | UNAUTHENTICATED
   ↓
7. Protected route checks role
   ↓
8. Either:
   - Render children (correct role)
   - Show access denied (wrong role)
   - Show login prompt (not authenticated)
```

### State Transitions

```
INITIALIZING
  ↓
  ├─→ AUTHENTICATED (user logged in)
  │   ↓
  │   ├─→ Correct role → Render children
  │   └─→ Wrong role → Show redirect screen
  │
  ├─→ UNAUTHENTICATED (no user)
  │   ↓
  │   └─→ Show login prompt
  │
  └─→ ERROR (auth failed)
      ↓
      └─→ Show error screen with retry

During operations:
AUTHENTICATED → LOADING → AUTHENTICATED
```

---

## Console Logs

### Expected Logs - Successful Access

**Client Route:**
```
[PROTECTED-CLIENT-V2] Render { status: 'initializing', hasUser: false, role: undefined }
[PROTECTED-CLIENT-V2] Waiting for initialization...
[AUTH-V2] Initialization complete - user authenticated
[PROTECTED-CLIENT-V2] Render { status: 'authenticated', hasUser: true, role: 'client' }
[PROTECTED-CLIENT-V2] Access granted, rendering children
```

**Stylist Route:**
```
[PROTECTED-STYLIST-V2] Render { status: 'initializing', hasUser: false, role: undefined }
[PROTECTED-STYLIST-V2] Waiting for initialization...
[AUTH-V2] Initialization complete - user authenticated
[PROTECTED-STYLIST-V2] Render { status: 'authenticated', hasUser: true, role: 'stylist' }
[PROTECTED-STYLIST-V2] Access granted, rendering children
```

**Admin Route:**
```
[PROTECTED-ADMIN-V2] Render { status: 'initializing', hasUser: false, role: undefined }
[PROTECTED-ADMIN-V2] Waiting for initialization...
[AUTH-V2] Initialization complete - user authenticated
[PROTECTED-ADMIN-V2] Render { status: 'authenticated', hasUser: true, role: 'admin' }
[PROTECTED-ADMIN-V2] Access granted, rendering children
```

### Expected Logs - Wrong Role

**Client tries to access Stylist page:**
```
[PROTECTED-STYLIST-V2] Render { status: 'authenticated', hasUser: true, role: 'client' }
[PROTECTED-STYLIST-V2] Wrong role, showing redirect { role: 'client', redirectPath: '/dashboard/client' }
```

### Expected Logs - Not Authenticated

**No user tries to access protected page:**
```
[PROTECTED-CLIENT-V2] Render { status: 'unauthenticated', hasUser: false, role: undefined }
[PROTECTED-CLIENT-V2] User not authenticated, showing login prompt
```

---

## Testing Checklist

### ✅ Initialization Tests

**Test 1: Fresh page load (not logged in)**
1. Clear browser cache and session
2. Navigate directly to `/dashboard/client` (if using V2 protected route)
3. **Expected:**
   - Brief "Initializing..." screen
   - Then "Client Dashboard Locked" with login button
   - Console shows: INITIALIZING → UNAUTHENTICATED
4. **No errors in console**

**Test 2: Page reload (logged in)**
1. Login as a client
2. Navigate to client dashboard
3. Press Cmd+R (reload)
4. **Expected:**
   - Brief "Initializing..." screen
   - Dashboard content appears
   - No duplicate fetches
   - Console shows: INITIALIZING → AUTHENTICATED → Access granted

### ✅ Role-Based Access Tests

**Test 3: Correct role access**
1. Login as a client
2. Navigate to client dashboard (with ProtectedClientRouteV2)
3. **Expected:**
   - Dashboard renders
   - Console: "Access granted, rendering children"

**Test 4: Wrong role redirect**
1. Login as a stylist
2. Try to navigate to `/dashboard/client` (with ProtectedClientRouteV2)
3. **Expected:**
   - "Clients Only" screen
   - Button to go to stylist dashboard
   - Button to switch account
   - Console: "Wrong role, showing redirect"

**Test 5: Admin override**
1. Login as admin
2. Try to access client or stylist dashboards
3. **Expected:**
   - Redirect message for both
   - Buttons point to `/admin`

### ✅ Error Handling Tests

**Test 6: Network error during init**
1. Disconnect network
2. Reload protected page
3. **Expected:**
   - Error screen with clear message
   - "Go to Login" and "Back Home" buttons
   - No infinite loading state

**Test 7: Session expired**
1. Login successfully
2. Manually expire session in Supabase
3. Reload page
4. **Expected:**
   - Returns to unauthenticated state
   - Shows login prompt
   - No errors thrown

### ✅ Loading State Tests

**Test 8: During sign out**
1. Be on protected page
2. Click sign out
3. **Expected:**
   - Loading spinner appears
   - Then redirects to login
   - No content flash

### ✅ Browser Tests

**Test 9: Multiple tabs**
1. Login in tab 1
2. Open tab 2 to protected page
3. **Expected:**
   - Tab 2 initializes and shows content
   - Both tabs share session

**Test 10: Back/forward navigation**
1. Navigate: Login → Dashboard → Profile → Back
2. **Expected:**
   - No re-initialization on back
   - Content appears immediately
   - Session maintained

---

## Migration Guide

### How to Migrate Existing Pages

**Before (Old V1):**
```tsx
import { ProtectedClientRoute } from '@/components/protected-client-route'

export default function ClientDashboard() {
  return (
    <ProtectedClientRoute>
      <h1>Dashboard</h1>
    </ProtectedClientRoute>
  )
}
```

**After (New V2):**
```tsx
import { ProtectedClientRouteV2 } from '@/components/auth-v2/protected-route-client'
import { AuthProvider } from '@/lib/auth-v2'

export default function ClientDashboard() {
  return (
    <AuthProvider>
      <ProtectedClientRouteV2>
        <h1>Dashboard</h1>
      </ProtectedClientRouteV2>
    </AuthProvider>
  )
}
```

**Key changes:**
1. Import from `@/components/auth-v2/` instead of `@/components/`
2. Add `V2` suffix to component name
3. Wrap in `<AuthProvider>` from `@/lib/auth-v2`

### Updating Dashboard Components

**If your dashboard uses auth data:**

**Before:**
```tsx
import { useAuth } from '@/hooks/use-auth'

function Dashboard() {
  const { user, userProfile, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return <div>Hello {userProfile?.full_name}</div>
}
```

**After:**
```tsx
import { useAuth } from '@/lib/auth-v2'
import { AuthStatus } from '@/lib/auth-v2/types'

function Dashboard() {
  const { status, user } = useAuth()

  // Protected route already handles initialization
  // So you can safely use user here

  return <div>Hello {user?.fullName}</div>
}
```

**Note:** The protected route handles all initialization, so your dashboard component doesn't need to check `loading` or `status` - it only renders when auth is ready.

---

## Common Patterns

### Pattern 1: Dashboard with User Data

```tsx
import { ProtectedClientRouteV2 } from '@/components/auth-v2/protected-route-client'
import { AuthProvider, useAuth } from '@/lib/auth-v2'

function DashboardContent() {
  const { user } = useAuth()

  // Safe to use user - protected route ensures it exists
  return (
    <div>
      <h1>Welcome, {user!.fullName || user!.email}</h1>
      <p>Role: {user!.role}</p>
    </div>
  )
}

export default function ClientDashboard() {
  return (
    <AuthProvider>
      <ProtectedClientRouteV2>
        <DashboardContent />
      </ProtectedClientRouteV2>
    </AuthProvider>
  )
}
```

### Pattern 2: Dashboard with Sign Out

```tsx
import { ProtectedStylistRouteV2 } from '@/components/auth-v2/protected-route-stylist'
import { AuthProvider, useAuth } from '@/lib/auth-v2'

function DashboardContent() {
  const { user, signOut } = useAuth()

  return (
    <div>
      <h1>Stylist Dashboard</h1>
      <p>Business: {user!.stylistProfile?.businessName}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

export default function StylistDashboard() {
  return (
    <AuthProvider>
      <ProtectedStylistRouteV2>
        <DashboardContent />
      </ProtectedStylistRouteV2>
    </AuthProvider>
  )
}
```

### Pattern 3: Admin Dashboard with User Management

```tsx
import { ProtectedAdminRouteV2 } from '@/components/auth-v2/protected-route-admin'
import { AuthProvider, useAuth } from '@/lib/auth-v2'

function AdminContent() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Logged in as: {user!.email}</p>
      {/* Admin functionality */}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AuthProvider>
      <ProtectedAdminRouteV2>
        <AdminContent />
      </ProtectedAdminRouteV2>
    </AuthProvider>
  )
}
```

---

## Troubleshooting

### Issue: "Initializing..." never completes

**Possible causes:**
1. Supabase not configured
2. Network error
3. Database query failing

**Debug:**
```
1. Check console for [AUTH-V2] logs
2. Look for error messages
3. Check Network tab for failed requests
4. Verify Supabase credentials in .env
```

### Issue: Infinite redirect loop

**Possible causes:**
1. Protected route on login page
2. Redirect URL pointing to itself

**Fix:**
```
- Don't wrap login/signup pages in protected routes
- Check redirect query parameters
- Verify role-based redirect URLs
```

### Issue: Flash of wrong content

**Possible causes:**
1. Not waiting for INITIALIZING to complete
2. Rendering before auth state is ready

**Fix:**
```tsx
// Ensure you check INITIALIZING state first
if (status === AuthStatus.INITIALIZING) {
  return <LoadingScreen />
}

// Then check other states
if (status === AuthStatus.UNAUTHENTICATED) {
  return <LoginPrompt />
}
```

### Issue: User data is null even though authenticated

**Possible causes:**
1. Not waiting for profile fetch
2. Database query error

**Debug:**
```
1. Check console logs for profile fetch
2. Verify users table has the record
3. Check RLS policies on users table
4. Look for [AUTH-V2] "Profile fetched successfully" log
```

---

## Performance Notes

### Initialization Time

**Expected:** < 500ms for returning users (session exists)
**Expected:** 0ms for new users (immediately UNAUTHENTICATED)

### Measurement:

Watch console logs:
```
[AUTH-V2] Starting initialization...
[AUTH-V2] Checking for existing session...
[AUTH-V2] Session found for user: xxx
[AUTH-V2] Fetching user profile for: xxx
[AUTH-V2] Profile fetched successfully
[AUTH-V2] Initialization complete - user authenticated
```

Time from "Starting" to "complete" should be < 500ms.

### Optimization Tips

1. **Supabase connection pooling** - Ensure Supabase client is configured properly
2. **Database indexes** - Add index on `users.id` (should exist)
3. **RLS policy efficiency** - Keep policies simple
4. **Minimize profile data** - Only fetch what you need

---

## Next Steps

After protected routes are tested and working:

1. **Update existing dashboards** to use V2 protected routes
2. **Update navigation** to use `/login-v2` and `/signup-v2`
3. **Add redirect parameter handling** to login/signup forms
4. **Feature flag implementation** for gradual rollout
5. **Monitor for errors** in production
6. **Remove old protected routes** after verification

---

## Summary

**Phase 5 delivers:**
- ✅ Three protected route components using auth-v2
- ✅ Single source of truth for roles
- ✅ Proper state management with AuthStatus
- ✅ Clear error handling with recovery options
- ✅ No race conditions or timing issues
- ✅ Comprehensive documentation

**Key improvements:**
- Cleaner code (no dual source of truth)
- Better UX (proper loading states, clear errors)
- More reliable (no race conditions)
- Easier to test (clear state transitions)

**Ready for:**
- Integration with existing dashboards
- Testing in production-like environment
- Migration from V1 protected routes
