# Authentication System Analysis - Service4Me
**Analysis Date:** 2025-12-23
**Status:** Pre-Rebuild Analysis

---

## Executive Summary

The current authentication system uses Supabase Auth with a custom React Context provider. The system has experienced race conditions and data loading issues, requiring a complete rebuild for reliability.

### Key Issues Identified
1. **Race Conditions:** Multiple auth state handlers competing during login
2. **Profile Loading Race:** User authenticated but profile not loaded before dashboard renders
3. **Complex State Management:** Multiple refs and flags to prevent duplicate operations
4. **Session Handling Issues:** INITIAL_SESSION and SIGNED_IN events causing conflicts

---

## 1. Authentication-Related Files

### Core Authentication Files

#### **hooks/use-auth.tsx** (528 lines)
- **Purpose:** Main authentication context and provider
- **Exports:** `AuthProvider`, `useAuth` hook
- **Key Features:**
  - User session management
  - User profile fetching from `users` table
  - Sign up, sign in, sign out functions
  - Role-based dashboard URL routing
  - Extensive logging for debugging

#### **lib/supabase.ts** (18 lines)
- **Purpose:** Supabase client configuration
- **Features:**
  - Creates Supabase client with environment variables
  - `isSupabaseConfigured()` helper function
  - Uses placeholder values when env vars missing

### Authentication UI Components

#### **components/login-form.tsx** (168 lines)
- **Purpose:** Login form with email/password
- **Features:**
  - Email and password inputs
  - Password visibility toggle
  - Remember me checkbox
  - Error handling
  - Role-based redirect after login
  - 50ms delay before navigation to ensure state updates

#### **components/signup-form.tsx** (645 lines)
- **Purpose:** Dual signup form for clients and stylists
- **Features:**
  - Tabbed interface (Client/Stylist)
  - Client signup: Name, email, password, optional profile photo
  - Stylist signup: Name, business name, email, phone, location (postcode), password
  - Profile image upload for clients
  - Email confirmation flow
  - Success screen after signup

### Route Protection Components

#### **components/protected-admin-route.tsx** (92 lines)
- **Purpose:** Protects admin-only pages
- **Checks:**
  - User authentication
  - Admin role (from userProfile or user_metadata)
- **Behavior:**
  - Shows loading spinner while auth loading
  - Redirects non-authenticated to login
  - Redirects non-admin to their dashboard

#### **components/protected-client-route.tsx** (121 lines)
- **Purpose:** Protects client dashboard
- **Checks:**
  - User authentication
  - Client role (defaults to client if no role)
- **Critical Fix:** Waits for userProfile to load before rendering dashboard
- **Behavior:**
  - Shows loading spinner while auth loading
  - Shows loading spinner if user exists but profile not loaded yet
  - Redirects based on actual role

#### **components/protected-stylist-route.tsx** (120 lines)
- **Purpose:** Protects stylist dashboard
- **Checks:**
  - User authentication
  - Stylist role (from userProfile or user_metadata)
- **Critical Fix:** Waits for userProfile to load before rendering dashboard
- **Behavior:**
  - Shows loading spinner while auth loading
  - Shows loading spinner if user exists but profile not loaded yet
  - Redirects based on actual role

### Authentication Pages

#### **app/login/page.tsx** (14 lines)
- **Purpose:** Login page wrapper
- **Components:** Navigation, LoginForm, Footer

#### **app/signup/page.tsx** (14 lines)
- **Purpose:** Signup page wrapper
- **Components:** Navigation, SignupForm, Footer

#### **app/auth/confirm/page.tsx** (134 lines)
- **Purpose:** Email confirmation handler
- **Features:**
  - Handles new-style confirmation (code parameter)
  - Handles legacy confirmation (token_hash parameter)
  - Shows success/error states
  - Redirects to dashboard on success

### Dashboard Pages (Protected)

#### **app/dashboard/client/page.tsx** (23 lines)
- **Wrapper:** `ProtectedClientRoute`
- **Components:** Navigation, ClientDashboard, Footer

#### **app/dashboard/stylist/page.tsx** (17 lines)
- **Wrapper:** `ProtectedStylistRoute`
- **Components:** Navigation, StylistDashboard, Footer

#### **app/admin/page.tsx** (17 lines)
- **Wrapper:** `ProtectedAdminRoute`
- **Components:** Navigation, AdminDashboard, Footer

### API Routes

#### **app/api/admin/create-account/route.ts** (246 lines)
- **Purpose:** Admin-only account creation for stylists
- **Features:**
  - Uses service role key for admin operations
  - Creates auth user with email/password
  - Creates user profile in users table
  - Links existing stylist_profiles to new user
  - Handles orphaned account cleanup
  - Auto-confirms email

### Other Auth-Related Files

#### **app/layout.tsx** (34 lines)
- **Purpose:** Root layout with AuthProvider
- **Wraps:** All pages with AuthProvider context

#### **components/navigation.tsx** (553 lines)
- **Purpose:** Site navigation with auth-aware UI
- **Features:**
  - Shows user dropdown when authenticated
  - Displays user name, email, role
  - Dashboard navigation based on role
  - Sign out functionality
  - Conditional "List Your Business" button

---

## 2. Current Authentication Flow

### Sign Up Flow

```
User fills signup form (client or stylist)
    ↓
signUp() called with email, password, role, additionalData
    ↓
supabase.auth.signUp() creates auth user
    ↓
User metadata stored: role, full_name, phone (if stylist: businessName, location)
    ↓
Email confirmation sent (if enabled)
    ↓
If email confirmed or confirmation not required:
    - Insert into users table (id, email, full_name, role, phone)
    - If stylist: Update stylist_profiles (business_name, location, phone, contact_email)
    ↓
If confirmation required: Show success screen
If auto-confirmed: Redirect to dashboard
```

### Sign In Flow

```
User submits login form
    ↓
signIn() called with email, password
    ↓
Set signInInProgress flag = true
    ↓
supabase.auth.signInWithPassword()
    ↓
If success:
    - setUser(data.user)
    - setSession(data.session)
    - fetchUserProfile(user.id, forceRefresh=true)
    ↓
Profile fetched from users table
    ↓
setLoading(false)
    ↓
Clear signInInProgress flag
    ↓
Login form waits 50ms for state to propagate
    ↓
Redirect based on user.user_metadata.role:
    - admin → /admin
    - stylist → /dashboard/stylist
    - client → /dashboard/client
```

### Session Restoration Flow

```
App loads
    ↓
AuthProvider useEffect runs
    ↓
onAuthStateChange subscription created
    ↓
Two parallel paths:
    1. INITIAL_SESSION event fired immediately
    2. Fallback timeout (100ms) in case event doesn't fire
    ↓
handleSession() processes session:
    - setSession(newSession)
    - setUser(newSession?.user)
    - fetchUserProfile(user.id)
    ↓
setLoading(false)
    ↓
Protected routes check user, userProfile, loading
    ↓
If user but no userProfile: Keep showing loading
If user and userProfile: Render dashboard
```

### Profile Fetch Flow

```
fetchUserProfile(userId, forceRefresh)
    ↓
Check cache (skip if forceRefresh=true or different user)
    ↓
Query users table: SELECT * WHERE id = userId
    ↓
If found:
    - setUserProfile(data)
    - return data
    ↓
If PGRST116 (not found):
    - getUser() from auth
    - createUserProfileFromAuth(user)
    - Return userProfile
    ↓
If error: setUserProfile(null)
```

### Sign Out Flow

```
signOut() called
    ↓
Immediately clear local state (optimistic):
    - setUser(null)
    - setUserProfile(null)
    - setSession(null)
    - Clear lastFetchedUserId
    - sessionStorage.clear()
    ↓
Background: supabase.auth.signOut()
    ↓
SIGNED_OUT event fired
    ↓
Cleanup and reset flags
```

---

## 3. Data Dependencies

### User Data Structure

#### **Supabase Auth User**
```typescript
{
  id: string
  email: string
  email_confirmed_at: timestamp | null
  user_metadata: {
    role: 'client' | 'stylist' | 'admin'
    full_name: string
    phone?: string
    businessName?: string  // stylist only
    location?: string      // stylist only
  }
}
```

#### **users Table Profile**
```typescript
{
  id: string              // matches auth.users.id
  email: string
  full_name: string | null
  role: 'client' | 'stylist' | 'admin'
  avatar_url: string | null
  phone: string | null
  created_at: timestamp
  updated_at: timestamp
}
```

### Role Detection Logic

**Priority Order:**
1. `userProfile?.role` (from users table)
2. `user?.user_metadata?.role` (from auth metadata)
3. Default to 'client' (in some components)

**Issue:** Two sources of truth can get out of sync

### Components Using Auth

#### **Direct useAuth() Consumers:**
- `components/login-form.tsx` - signIn
- `components/signup-form.tsx` - signUp
- `components/protected-admin-route.tsx` - user, userProfile, loading, signOut
- `components/protected-client-route.tsx` - user, userProfile, loading, signOut
- `components/protected-stylist-route.tsx` - user, userProfile, loading, signOut
- `components/navigation.tsx` - user, userProfile, signOut, getDashboardUrl
- `components/client-dashboard.tsx` (inferred) - likely uses userProfile
- `components/stylist-dashboard.tsx` (inferred) - likely uses userProfile
- `components/admin-dashboard.tsx` (inferred) - likely uses userProfile

#### **Session Storage Usage:**
- Cleared on sign out: `sessionStorage.clear()`
- No explicit storage of auth state (relies on Supabase client)

---

## 4. Current Issues & Problems

### Critical Issues

#### **1. Race Conditions During Sign In**
- **Problem:** SIGNED_IN event and signIn() function both try to fetch profile
- **Attempted Fix:** `signInInProgress` flag to prevent duplicate handling
- **Risk:** If flag fails, profile fetched twice causing conflicts

#### **2. Profile Loading Race**
- **Problem:** User authenticated but userProfile is null when dashboard renders
- **Attempted Fix:** Protected routes wait for userProfile before rendering
- **Risk:** If profile fetch fails, user stuck on loading screen

#### **3. Complex State Management**
- **Multiple Refs:**
  - `lastFetchedUserId` - cache busting
  - `initialSessionHandled` - prevent duplicate initial session
  - `signInInProgress` - prevent duplicate sign in handling
- **Problem:** Complex coordination, easy to miss edge cases

#### **4. INITIAL_SESSION Fallback**
- **Issue:** 100ms timeout to manually fetch session if event doesn't fire
- **Risk:** Race between event handler and fallback

#### **5. Dual Source of Truth for Roles**
- `user.user_metadata.role` vs `userProfile.role`
- Can get out of sync during account creation
- Components check both, priority not always consistent

### Minor Issues

#### **1. Profile Creation During Signup**
- Database trigger might auto-create stylist_profiles
- Code tries to disable/re-enable trigger (commented out - not working)
- Cleanup logic deletes default "My Hair Studio" profiles

#### **2. Email Confirmation Flow**
- Confirmation page hardcoded to redirect to `/dashboard/stylist`
- Should use role-based redirect

#### **3. Login Redirect Delay**
- 50ms setTimeout before navigation
- Brittle - depends on React render timing

#### **4. Extensive Logging**
- Many console.log statements throughout use-auth.tsx
- Helpful for debugging but should be removed in production

---

## 5. Database Schema (Inferred)

### Tables Used

#### **auth.users** (Supabase managed)
- Built-in Supabase auth table
- Stores email, encrypted password, user_metadata

#### **public.users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'stylist', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **public.stylist_profiles**
```sql
CREATE TABLE stylist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  business_name TEXT,
  location TEXT,
  phone TEXT,
  contact_email TEXT,
  -- ... other stylist fields
);
```

### Triggers
- Likely has a trigger on `users` INSERT to create default `stylist_profiles`
- Attempted disable/re-enable in admin create-account API (not working)

---

## 6. Environment Configuration

### Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://pwnuawhrgycjdnmfchou.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### Configuration Check
- `isSupabaseConfigured()` validates presence and non-placeholder values
- Components check this before attempting auth operations

---

## 7. What Needs to Be Preserved

### Must Keep
1. **User Data Structure:**
   - users table schema
   - stylist_profiles linkage
   - Role system (client, stylist, admin)

2. **Email Confirmation Flow:**
   - Supabase email templates
   - Confirmation URL handling

3. **Role-Based Access Control:**
   - Three distinct user roles
   - Dashboard routing logic

4. **Profile Metadata:**
   - full_name, phone, avatar_url
   - Stylist: business_name, location

### Can Improve
1. **Auth State Management:**
   - Simplify complex ref/flag system
   - Single source of truth for user data
   - Better handling of loading states

2. **Sign In Flow:**
   - Remove race condition workarounds
   - Cleaner profile fetching
   - Remove arbitrary delays

3. **Error Handling:**
   - More graceful failure modes
   - Better error messages
   - Retry logic

---

## 8. Recommended Rebuild Strategy

### Phase 1: Simplify Auth Context
- Remove complex ref system
- Single, predictable state flow
- Use React Query or SWR for profile fetching
- Better TypeScript types

### Phase 2: Standardize Role Management
- Single source of truth for role (probably userProfile)
- Sync user_metadata.role with users.role on every auth event
- Clear role hierarchy and checking

### Phase 3: Improve Route Protection
- Server-side route protection with middleware
- Client-side as backup
- Consistent loading states

### Phase 4: Better Error Handling
- Graceful degradation
- Clear error messages
- Automatic retries
- Fallback UI

### Phase 5: Testing
- Unit tests for auth flow
- Integration tests for sign up/in/out
- E2E tests for protected routes

---

## 9. Files Backed Up

All authentication files have been backed up to `/backup-auth/`:

```
backup-auth/
├── AUTH_SYSTEM_ANALYSIS.md (this file)
├── use-auth.tsx
├── supabase.ts
├── login-form.tsx
├── signup-form.tsx
├── protected-admin-route.tsx
├── protected-client-route.tsx
├── protected-stylist-route.tsx
├── login/ (directory)
├── signup/ (directory)
└── auth/ (directory)
```

---

## 10. Breaking Changes Risk Assessment

### Low Risk Changes
- Simplifying AuthContext internal logic
- Removing debugging logs
- Adding TypeScript strict mode

### Medium Risk Changes
- Changing profile fetch timing
- Modifying role detection priority
- Updating protected route logic

### High Risk Changes
- Changing database schema
- Modifying auth flow significantly
- Changing role system

---

## Conclusion

The current auth system works but is brittle due to race conditions and complex state management. A rebuild should focus on:

1. **Simplification:** Remove workarounds and complex flag systems
2. **Single Source of Truth:** Standardize role and profile data source
3. **Predictable Flow:** Clear, linear auth state progression
4. **Better DX:** TypeScript, testing, error handling
5. **Preserve Data:** Keep existing users, roles, and permissions intact

**Next Steps:** Await approval before proceeding with rebuild implementation.
