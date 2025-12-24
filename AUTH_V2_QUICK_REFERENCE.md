# Auth V2 - Quick Reference Guide

Quick guide for using the new authentication system in your components.

---

## Basic Usage

### Import the Hook

```typescript
import { useAuth } from '@/lib/auth-v2'
import { AuthStatus } from '@/lib/auth-v2/types'
```

### Use in Component

```typescript
function MyComponent() {
  const { status, user, signIn, signOut } = useAuth()

  // user is UserProfile | null
  // status is AuthStatus enum
}
```

---

## Common Patterns

### Pattern 1: Display User Info

```typescript
import { useAuth } from '@/lib/auth-v2'

function UserProfile() {
  const { user } = useAuth()

  // Inside ProtectedRoute, user is guaranteed to exist
  return (
    <div>
      <h1>Welcome, {user!.fullName || user!.email}</h1>
      <p>Role: {user!.role}</p>
    </div>
  )
}
```

**✅ DO:**
- Use `user!.fullName` (with ! because ProtectedRoute ensures it exists)
- Fallback to `user!.email` if no name
- Use `user!.role` for role

**❌ DON'T:**
- Use `"User"` as fallback
- Use `userProfile?.role || user?.user_metadata?.role`
- Access `user.user_metadata` directly

### Pattern 2: Protect a Page

```typescript
import { AuthProvider, ProtectedRoute } from '@/lib/auth-v2'

export default function StylistDashboard() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['stylist']}>
        <DashboardContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}
```

### Pattern 3: Public Page (Login/Signup)

```typescript
import { AuthProvider, PublicRoute } from '@/lib/auth-v2'

export default function LoginPage() {
  return (
    <AuthProvider>
      <PublicRoute>
        <LoginForm />
      </PublicRoute>
    </AuthProvider>
  )
}
```

### Pattern 4: Conditional Rendering Based on Role

```typescript
import { useAuth } from '@/lib/auth-v2'

function Settings() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Settings</h1>

      {/* Show to all users */}
      <GeneralSettings />

      {/* Show only to stylists */}
      {user!.role === 'stylist' && (
        <BusinessSettings />
      )}

      {/* Show only to admins */}
      {user!.role === 'admin' && (
        <AdminSettings />
      )}
    </div>
  )
}
```

### Pattern 5: Sign In Programmatically

```typescript
import { useAuth } from '@/lib/auth-v2'
import { useRouter } from 'next/navigation'

function LoginForm() {
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (email: string, password: string) => {
    try {
      await signIn(email, password)
      // No need to redirect - ProtectedRoute handles it
    } catch (error) {
      // Error is already in auth context
      console.error('Login failed')
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Pattern 6: Sign Out

```typescript
import { useAuth } from '@/lib/auth-v2'
import { useRouter } from 'next/navigation'

function UserMenu() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return <button onClick={handleSignOut}>Sign Out</button>
}
```

### Pattern 7: Check Auth Status

```typescript
import { useAuth } from '@/lib/auth-v2'
import { AuthStatus } from '@/lib/auth-v2/types'

function MyComponent() {
  const { status, user } = useAuth()

  if (status === AuthStatus.INITIALIZING) {
    return <LoadingSpinner />
  }

  if (status === AuthStatus.LOADING) {
    return <LoadingSpinner />
  }

  if (status === AuthStatus.UNAUTHENTICATED) {
    return <LoginPrompt />
  }

  if (status === AuthStatus.ERROR) {
    return <ErrorMessage />
  }

  // status === AuthStatus.AUTHENTICATED
  return <Content user={user!} />
}
```

### Pattern 8: Access User Data Safely

```typescript
import { useAuth } from '@/lib/auth-v2'

function ProfileDisplay() {
  const { user } = useAuth()

  // Inside ProtectedRoute, user exists
  // But outside, check first:
  if (!user) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Name: {user.fullName || 'Not set'}</p>
      <p>Role: {user.role}</p>

      {/* Stylist-specific data */}
      {user.stylistProfile && (
        <div>
          <p>Business: {user.stylistProfile.businessName}</p>
          <p>Location: {user.stylistProfile.location}</p>
        </div>
      )}
    </div>
  )
}
```

---

## UserProfile Type Reference

```typescript
interface UserProfile {
  id: string                      // User ID
  email: string                   // Email address
  fullName: string | null         // Full name (or null)
  role: 'client' | 'stylist' | 'admin'  // Role (SINGLE SOURCE OF TRUTH)
  avatarUrl: string | null        // Profile image URL
  phone: string | null            // Phone number
  createdAt: string               // Account creation date
  updatedAt: string               // Last update date
  stylistProfile?: StylistProfile // Only if role === 'stylist'
}
```

---

## Auth Context Value Reference

```typescript
interface AuthContextValue {
  // State
  status: AuthStatus              // Current auth status
  user: UserProfile | null        // Current user (or null)
  error: AuthError | null         // Current error (or null)
  session: Session | null         // Supabase session

  // Methods
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: UserRole, profileData?: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
  getDashboardUrl: () => string   // Get URL for user's dashboard
}
```

---

## Route Protection

### Single Role

```typescript
<ProtectedRoute allowedRoles={['stylist']}>
  <StylistDashboard />
</ProtectedRoute>
```

### Multiple Roles

```typescript
<ProtectedRoute allowedRoles={['client', 'stylist']}>
  <SharedSettings />
</ProtectedRoute>
```

### All Authenticated Users

```typescript
<ProtectedRoute allowedRoles={['client', 'stylist', 'admin']}>
  <ProfileSettings />
</ProtectedRoute>
```

### Custom Login Path

```typescript
<ProtectedRoute allowedRoles={['stylist']} loginPath="/custom-login">
  <Content />
</ProtectedRoute>
```

---

## Common Mistakes to Avoid

### ❌ DON'T: Use Fallback Data

```typescript
// BAD
const displayName = user?.fullName || "User"
const userRole = user?.role || "client"
```

### ✅ DO: Use Actual Data

```typescript
// GOOD
const displayName = user?.fullName || user?.email || "Guest"
const userRole = user?.role  // No fallback!
```

### ❌ DON'T: Dual Source of Truth

```typescript
// BAD
const role = userProfile?.role || user?.user_metadata?.role
```

### ✅ DO: Single Source

```typescript
// GOOD
const role = user?.role  // From auth-v2 UserProfile
```

### ❌ DON'T: Access Before Initialization

```typescript
// BAD
function MyComponent() {
  const { user } = useAuth()
  return <div>{user.email}</div>  // Crash if user is null!
}
```

### ✅ DO: Check Null or Use ProtectedRoute

```typescript
// GOOD Option 1: Check null
function MyComponent() {
  const { user } = useAuth()
  if (!user) return <div>Loading...</div>
  return <div>{user.email}</div>
}

// GOOD Option 2: Use ProtectedRoute (recommended)
<ProtectedRoute allowedRoles={['client']}>
  <MyComponent />  {/* user is guaranteed to exist */}
</ProtectedRoute>
```

### ❌ DON'T: Forget AuthProvider

```typescript
// BAD
export default function Page() {
  return <MyComponentUsingAuth />  // Will crash!
}
```

### ✅ DO: Wrap in AuthProvider

```typescript
// GOOD
export default function Page() {
  return (
    <AuthProvider>
      <MyComponentUsingAuth />
    </AuthProvider>
  )
}
```

---

## Decision Tree

**"Should I use ProtectedRoute?"**
```
Is this page only for authenticated users?
├─ YES → Use ProtectedRoute
└─ NO → Continue...

Is this a login/signup page?
├─ YES → Use PublicRoute
└─ NO → No route protection needed
```

**"How do I access user data?"**
```
Is component inside ProtectedRoute?
├─ YES → user! (guaranteed to exist)
└─ NO → Check if user is null first
```

**"Which role should I allow?"**
```
Who can access this page?
├─ Only stylists → allowedRoles={['stylist']}
├─ Only clients → allowedRoles={['client']}
├─ Only admins → allowedRoles={['admin']}
├─ Clients + Stylists → allowedRoles={['client', 'stylist']}
└─ All authenticated → allowedRoles={['client', 'stylist', 'admin']}
```

---

## Examples

### Complete Page Example

```typescript
import { AuthProvider, ProtectedRoute, useAuth } from '@/lib/auth-v2'

function DashboardContent() {
  const { user, signOut } = useAuth()

  return (
    <div>
      <h1>Welcome, {user!.fullName || user!.email}</h1>
      <p>Role: {user!.role}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}

export default function StylistDashboard() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['stylist']}>
        <DashboardContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}
```

### Complete Login Example

```typescript
import { AuthProvider, PublicRoute, useAuth } from '@/lib/auth-v2'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

function LoginForm() {
  const { signIn, error } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, password)
      // Will automatically redirect via ProtectedRoute
    } catch (err) {
      // Error already in context
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error.message}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <PublicRoute>
        <LoginForm />
      </PublicRoute>
    </AuthProvider>
  )
}
```

---

## Troubleshooting

### Issue: "useAuth must be used within AuthProvider"

**Solution:** Wrap your page in `<AuthProvider>`

### Issue: "Cannot read property 'role' of null"

**Solution:** Either:
1. Use `ProtectedRoute` (recommended)
2. Check `if (!user) return <Loading />`

### Issue: User sees "User" instead of name

**Solution:** Remove fallback data, use `user.fullName || user.email`

### Issue: Wrong dashboard after login

**Solution:** Check `allowedRoles` matches user's actual role

### Issue: Session doesn't persist

**Solution:** Ensure AuthProvider is at page level, not nested

---

## More Resources

- **Full Documentation:** `AUTH_V2_OVERVIEW.md`
- **Route Protection:** `ROUTE_PROTECTION_QUICK_START.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Component Docs:** `components/auth-v2/README.md`
