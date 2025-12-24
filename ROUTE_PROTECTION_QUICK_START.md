# Route Protection - Quick Start Guide

Quick reference for implementing route protection with auth-v2.

---

## Installation

Route protection is already included in `lib/auth-v2`. Just import and use:

```tsx
import { AuthProvider, ProtectedRoute, PublicRoute } from '@/lib/auth-v2'
```

---

## Common Use Cases

### 1. Protect a Stylist-Only Page

```tsx
import { AuthProvider, ProtectedRoute } from '@/lib/auth-v2'

export default function StylistDashboard() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['stylist']}>
        {/* Your stylist dashboard content */}
        <h1>Stylist Dashboard</h1>
      </ProtectedRoute>
    </AuthProvider>
  )
}
```

**What happens:**
- ✅ Stylists can access
- ❌ Clients → redirected to `/dashboard/client`
- ❌ Admins → redirected to `/admin`
- ❌ Not logged in → redirected to `/login-v2`

---

### 2. Protect a Client-Only Page

```tsx
import { AuthProvider, ProtectedRoute } from '@/lib/auth-v2'

export default function ClientDashboard() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['client']}>
        {/* Your client dashboard content */}
        <h1>Client Dashboard</h1>
      </ProtectedRoute>
    </AuthProvider>
  )
}
```

**What happens:**
- ✅ Clients can access
- ❌ Stylists → redirected to `/dashboard/stylist`
- ❌ Admins → redirected to `/admin`
- ❌ Not logged in → redirected to `/login-v2`

---

### 3. Protect an Admin-Only Page

```tsx
import { AuthProvider, ProtectedRoute } from '@/lib/auth-v2'

export default function AdminPanel() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['admin']}>
        {/* Your admin panel content */}
        <h1>Admin Panel</h1>
      </ProtectedRoute>
    </AuthProvider>
  )
}
```

**What happens:**
- ✅ Admins can access
- ❌ Clients → redirected to `/dashboard/client`
- ❌ Stylists → redirected to `/dashboard/stylist`
- ❌ Not logged in → redirected to `/login-v2`

---

### 4. Allow Multiple Roles

**Example: Settings page for clients AND stylists**

```tsx
import { AuthProvider, ProtectedRoute } from '@/lib/auth-v2'

export default function SettingsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['client', 'stylist']}>
        {/* Settings for both clients and stylists */}
        <h1>Account Settings</h1>
      </ProtectedRoute>
    </AuthProvider>
  )
}
```

**What happens:**
- ✅ Clients can access
- ✅ Stylists can access
- ❌ Admins → redirected to `/admin`
- ❌ Not logged in → redirected to `/login-v2`

---

### 5. Allow All Authenticated Users

**Example: Profile page for everyone**

```tsx
import { AuthProvider, ProtectedRoute } from '@/lib/auth-v2'

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['client', 'stylist', 'admin']}>
        {/* All authenticated users can access */}
        <h1>Your Profile</h1>
      </ProtectedRoute>
    </AuthProvider>
  )
}
```

**What happens:**
- ✅ All authenticated users can access
- ❌ Not logged in → redirected to `/login-v2`

---

### 6. Public Pages (Login, Signup)

**Redirect authenticated users away from login**

```tsx
import { AuthProvider, PublicRoute } from '@/lib/auth-v2'
import { LoginFormV2 } from '@/components/auth-v2/login-form'

export default function LoginPage() {
  return (
    <AuthProvider>
      <PublicRoute>
        {/* Login form */}
        <LoginFormV2 />
      </PublicRoute>
    </AuthProvider>
  )
}
```

**What happens:**
- ✅ Not logged in → can access login form
- ❌ Clients (logged in) → redirected to `/dashboard/client`
- ❌ Stylists (logged in) → redirected to `/dashboard/stylist`
- ❌ Admins (logged in) → redirected to `/admin`

---

### 7. Completely Public Page (No Protection)

**Example: Homepage, about page**

```tsx
// No AuthProvider needed
export default function HomePage() {
  return (
    <div>
      {/* Anyone can access */}
      <h1>Welcome to Service4Me</h1>
    </div>
  )
}
```

**What happens:**
- ✅ Everyone can access (logged in or not)

---

## Access User Data Inside Protected Routes

**You can safely use `useAuth()` inside protected routes:**

```tsx
import { AuthProvider, ProtectedRoute, useAuth } from '@/lib/auth-v2'

function DashboardContent() {
  const { user, signOut } = useAuth()

  // Safe to use user! - ProtectedRoute ensures it exists
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

---

## Props Reference

### ProtectedRoute Props

```typescript
interface ProtectedRouteProps {
  // Required: Array of roles that can access this route
  allowedRoles: ('client' | 'stylist' | 'admin')[]

  // Optional: Where to redirect if not authenticated
  // Default: '/login-v2'
  loginPath?: string

  // Optional: Show loading screen during checks
  // Default: true
  showLoadingScreen?: boolean

  // Required: The content to protect
  children: React.ReactNode
}
```

**Example with custom login path:**
```tsx
<ProtectedRoute
  allowedRoles={['stylist']}
  loginPath="/custom-login"
>
  <Content />
</ProtectedRoute>
```

### PublicRoute Props

```typescript
interface PublicRouteProps {
  // Optional: Show loading screen during checks
  // Default: true
  showLoadingScreen?: boolean

  // Required: The public content
  children: React.ReactNode
}
```

---

## Decision Tree

**"Should I use route protection on this page?"**

```
Is this page public to everyone?
├─ YES → No protection needed
└─ NO → Continue...

Should only authenticated users access it?
├─ YES → Use ProtectedRoute
└─ NO → Continue...

Is this a login/signup page?
├─ YES → Use PublicRoute
└─ NO → No protection needed
```

**"Which roles should I allow?"**

| Page Type | allowedRoles |
|-----------|--------------|
| Client dashboard | `['client']` |
| Stylist dashboard | `['stylist']` |
| Admin panel | `['admin']` |
| Shared settings | `['client', 'stylist']` |
| Profile (all users) | `['client', 'stylist', 'admin']` |
| Login/Signup | Use `PublicRoute` |

---

## Common Patterns

### Pattern 1: Dashboard with Navigation

```tsx
import { AuthProvider, ProtectedRoute, useAuth } from '@/lib/auth-v2'

function DashboardNav() {
  const { user, signOut } = useAuth()

  return (
    <nav>
      <span>Welcome, {user!.fullName}</span>
      <button onClick={signOut}>Sign Out</button>
    </nav>
  )
}

function DashboardContent() {
  return <div>Dashboard content...</div>
}

export default function Dashboard() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['client']}>
        <DashboardNav />
        <DashboardContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}
```

### Pattern 2: Conditional Content Based on Role

```tsx
import { AuthProvider, ProtectedRoute, useAuth } from '@/lib/auth-v2'

function SettingsContent() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Settings</h1>

      {/* Show to all users */}
      <section>
        <h2>General Settings</h2>
      </section>

      {/* Only show to stylists */}
      {user!.role === 'stylist' && (
        <section>
          <h2>Business Settings</h2>
        </section>
      )}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['client', 'stylist']}>
        <SettingsContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}
```

### Pattern 3: Nested Layouts

```tsx
import { AuthProvider, ProtectedRoute } from '@/lib/auth-v2'

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['stylist']}>
        <DashboardLayout>
          {/* Page content */}
        </DashboardLayout>
      </ProtectedRoute>
    </AuthProvider>
  )
}
```

---

## Testing Your Protected Routes

### Quick Test Checklist

1. **Access with correct role**
   - Login with the correct role
   - Navigate to protected page
   - ✅ Page should appear

2. **Access with wrong role**
   - Login with a different role
   - Try to access protected page
   - ✅ Should redirect to your dashboard

3. **Access while logged out**
   - Sign out
   - Try to access protected page
   - ✅ Should redirect to login

4. **Access login while logged in**
   - Login as any user
   - Try to access /login-v2
   - ✅ Should redirect to your dashboard

5. **Check console logs**
   - Open browser console
   - Navigate to protected pages
   - ✅ Should see `[PROTECTED-ROUTE]` logs explaining decisions

---

## Troubleshooting

### Problem: "Infinite redirect loop"

**Cause:** Using ProtectedRoute on a login page

**Fix:** Use PublicRoute instead
```tsx
// DON'T
<ProtectedRoute allowedRoles={['client']}>
  <LoginForm />
</ProtectedRoute>

// DO
<PublicRoute>
  <LoginForm />
</PublicRoute>
```

### Problem: "Loading screen never goes away"

**Cause:** Auth initialization stuck

**Debug:**
1. Open browser console
2. Look for `[AUTH-V2]` error logs
3. Check Supabase configuration
4. Verify network connection

### Problem: "User gets redirected even with correct role"

**Cause:** Role mismatch in database vs code

**Debug:**
1. Check console log for user's actual role
2. Verify database: `SELECT role FROM users WHERE email = '...'`
3. Ensure `allowedRoles` includes the user's role

### Problem: "Content flashes before redirect"

**Cause:** Not using ProtectedRoute correctly

**Fix:** Ensure ProtectedRoute wraps ALL content
```tsx
// DON'T
<AuthProvider>
  <Header />  {/* This will show before redirect! */}
  <ProtectedRoute allowedRoles={['client']}>
    <Content />
  </ProtectedRoute>
</AuthProvider>

// DO
<AuthProvider>
  <ProtectedRoute allowedRoles={['client']}>
    <Header />  {/* Everything inside */}
    <Content />
  </ProtectedRoute>
</AuthProvider>
```

---

## More Examples

See these test pages for working examples:
- `/test-protected-client` - Client-only page
- `/test-protected-stylist` - Stylist-only page
- `/test-protected-admin` - Admin-only page
- `/test-protected-multi` - Multi-role page

**Full documentation:** See `PHASE_5_ROUTE_PROTECTION.md`
