# Auth V2 Components

New authentication forms using the auth-v2 system.

## Components

### LoginFormV2
Location: `components/auth-v2/login-form.tsx`

**Features:**
- Uses new `useAuth()` hook from auth-v2
- Clear error handling from auth context
- Proper loading states
- Role-based redirect after login
- No race conditions
- No timing hacks

**Usage:**
```tsx
import { LoginFormV2 } from '@/components/auth-v2/login-form'
import { AuthProvider } from '@/lib/auth-v2'

function LoginPage() {
  return (
    <AuthProvider>
      <LoginFormV2 />
    </AuthProvider>
  )
}
```

### SignupFormV2
Location: `components/auth-v2/signup-form.tsx`

**Features:**
- Dual role support (Client/Stylist)
- Uses new `useAuth()` hook from auth-v2
- Profile creation for stylists
- Optional profile image for clients
- Clear error handling
- Proper loading states
- Email confirmation support
- Role-based redirect

**Usage:**
```tsx
import { SignupFormV2 } from '@/components/auth-v2/signup-form'
import { AuthProvider } from '@/lib/auth-v2'

function SignupPage() {
  return (
    <AuthProvider>
      <SignupFormV2 />
    </AuthProvider>
  )
}
```

### ProtectedClientRouteV2
Location: `components/auth-v2/protected-route-client.tsx`

**Features:**
- Protects client-only pages
- Uses AuthStatus enum from auth-v2
- Single source of truth (user.role)
- Waits for initialization before rendering
- Clear error states with recovery options
- Role-based redirects for wrong roles

**Usage:**
```tsx
import { ProtectedClientRouteV2 } from '@/components/auth-v2/protected-route-client'
import { AuthProvider } from '@/lib/auth-v2'

export default function ClientDashboard() {
  return (
    <AuthProvider>
      <ProtectedClientRouteV2>
        {/* Your client dashboard content */}
      </ProtectedClientRouteV2>
    </AuthProvider>
  )
}
```

### ProtectedStylistRouteV2
Location: `components/auth-v2/protected-route-stylist.tsx`

**Features:**
- Protects stylist-only pages
- Same core features as ProtectedClientRouteV2
- Checks for stylist role specifically

**Usage:**
```tsx
import { ProtectedStylistRouteV2 } from '@/components/auth-v2/protected-route-stylist'
import { AuthProvider } from '@/lib/auth-v2'

export default function StylistDashboard() {
  return (
    <AuthProvider>
      <ProtectedStylistRouteV2>
        {/* Your stylist dashboard content */}
      </ProtectedStylistRouteV2>
    </AuthProvider>
  )
}
```

### ProtectedAdminRouteV2
Location: `components/auth-v2/protected-route-admin.tsx`

**Features:**
- Protects admin-only pages
- Same core features as other protected routes
- Strictest access control

**Usage:**
```tsx
import { ProtectedAdminRouteV2 } from '@/components/auth-v2/protected-route-admin'
import { AuthProvider } from '@/lib/auth-v2'

export default function AdminDashboard() {
  return (
    <AuthProvider>
      <ProtectedAdminRouteV2>
        {/* Your admin dashboard content */}
      </ProtectedAdminRouteV2>
    </AuthProvider>
  )
}
```

## Test Pages

### Login Test Page
URL: `http://localhost:3000/login-v2`

**Test scenarios:**
1. Sign in with valid credentials
2. Sign in with invalid credentials
3. Check role-based redirect
4. Verify session persistence
5. Test error display
6. Test loading states

### Signup Test Page
URL: `http://localhost:3000/signup-v2`

**Test scenarios:**
1. Client signup
2. Stylist signup with business details
3. Password mismatch error
4. Email already exists error
5. Missing required fields
6. Profile creation for stylists
7. Role-based redirect

## Key Differences from V1

| Feature | V1 Forms | V2 Forms |
|---------|----------|----------|
| **Auth Hook** | `useAuth()` from hooks/use-auth | `useAuth()` from lib/auth-v2 |
| **Error Handling** | Local state only | Auth context + local |
| **Loading States** | Boolean flag | Status enum |
| **Redirects** | 50ms delay | Immediate |
| **Profile Creation** | Manual | Automatic |
| **Type Safety** | Partial | Full |

## Error Handling

### Login Errors

**Invalid Credentials:**
```
Code: INVALID_CREDENTIALS
Message: "Invalid email or password"
Recoverable: No
```

**Network Error:**
```
Code: NETWORK_ERROR
Message: "Unable to connect to authentication service"
Recoverable: Yes (shows retry button)
```

### Signup Errors

**Email Already Exists:**
```
Code: EMAIL_ALREADY_EXISTS
Message: "An account with this email already exists"
Recoverable: No
```

**Weak Password:**
```
Code: WEAK_PASSWORD
Message: "Password is too weak. Please use a stronger password."
Recoverable: No
```

## Role-Based Redirects

After successful login/signup:

```typescript
role === 'admin' → '/admin'
role === 'stylist' → '/dashboard/stylist'
role === 'client' → '/dashboard/client'
default → '/dashboard/client'
```

## Loading States

### During Submission
- Form inputs disabled
- Submit button shows spinner
- "Signing in..." or "Creating Account..." text
- Prevents multiple submissions

### After Success
- Immediate redirect (no delay)
- Loading handled by auth context

## Testing Checklist

### Login Form
- [ ] Valid login redirects correctly
- [ ] Invalid credentials show error
- [ ] Loading state displays during sign in
- [ ] Role-based redirect works
- [ ] Session persists after redirect
- [ ] Error clears on retry

### Signup Form (Client)
- [ ] All required fields validated
- [ ] Password match validated
- [ ] Account created successfully
- [ ] Profile created in database
- [ ] Redirects to client dashboard
- [ ] Optional profile image works

### Signup Form (Stylist)
- [ ] All required fields validated
- [ ] Business name required
- [ ] Phone number required
- [ ] Postcode required
- [ ] Account created successfully
- [ ] Stylist profile created
- [ ] Redirects to stylist dashboard

### Protected Routes
- [ ] Shows "Initializing..." during auth init
- [ ] Client route allows clients only
- [ ] Stylist route allows stylists only
- [ ] Admin route allows admins only
- [ ] Wrong role shows redirect screen
- [ ] Unauthenticated shows login prompt
- [ ] Error state shows clear message
- [ ] No flash of wrong content
- [ ] Session persists on reload
- [ ] Multiple tabs share session

### Error Scenarios
- [ ] Email already exists
- [ ] Network error (offline)
- [ ] Weak password
- [ ] Invalid email format
- [ ] Missing required fields
- [ ] Session expired on protected route
- [ ] Network error during init

## Console Logs

Watch for these logs during testing:

**Login:**
```
[LOGIN-FORM-V2] Submitting login for: user@example.com
[AUTH-V2] Sign in started for: user@example.com
[AUTH-V2] Sign in successful, fetching profile...
[AUTH-V2] Profile fetched successfully
[AUTH-V2] Sign in complete
[LOGIN-FORM-V2] Sign in successful, redirecting...
[LOGIN-FORM-V2] Redirecting to: /dashboard/stylist
```

**Signup:**
```
[SIGNUP-FORM-V2] Submitting stylist signup for: new@example.com
[AUTH-V2] Sign up started for: new@example.com as stylist
[AUTH-V2] Sign up successful, user: xxx
[AUTH-V2] Creating profile from auth for: xxx
[AUTH-V2] Profile created successfully
[SIGNUP-FORM-V2] Stylist signup successful
[SIGNUP-FORM-V2] Redirecting to: /dashboard/stylist
```

## Known Issues

None currently. Report any issues found during testing.

## Next Steps

After testing passes:
1. Update navigation links to use V2 forms
2. Add feature flag for gradual rollout
3. Migrate protected routes to use auth-v2
4. Remove old forms after verification
5. Update documentation
