# Authentication Architecture - Visual Diagrams

---

## 1. Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Login Page  │  │ Signup Page  │  │  Dashboards  │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                         AUTH CONTEXT                            │
│                    (Single Source of Truth)                     │
│                                                                 │
│  State:                                                         │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ status: AuthStatus (enum)                                 │ │
│  │ user: UserProfile | null                                  │ │
│  │ error: AuthError | null                                   │ │
│  │ session: Session | null                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Methods:                                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ signIn(), signUp(), signOut()                            │ │
│  │ refreshProfile(), clearError(), retry()                  │ │
│  │ getDashboardUrl()                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE AUTH LAYER                        │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │ Authentication  │  │  Session Mgmt   │  │  Auth Events   │ │
│  │  (Auth API)     │  │  (localStorage) │  │  (Listener)    │ │
│  └─────────────────┘  └─────────────────┘  └────────────────┘ │
│                                                                 │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ auth.users   │  │  public.users    │  │ stylist_        │  │
│  │ (Supabase)   │  │  (Profiles)      │  │ profiles        │  │
│  └──────────────┘  └──────────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. State Machine Diagram (Detailed)

```
                    ┌─────────────────┐
                    │  APP MOUNTS     │
                    └────────┬────────┘
                             │
                             ↓
                  ┌──────────────────────┐
                  │    INITIALIZING      │
                  │                      │
                  │ • Show full spinner  │
                  │ • Block all UI       │
                  │ • Fetch session      │
                  └──────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
          No Session                Has Session
                │                         │
                ↓                         ↓
     ┌──────────────────┐      ┌────────────────────┐
     │ UNAUTHENTICATED  │      │  Fetch Profile     │
     │                  │      │  from Database     │
     │ • No user data   │      └─────────┬──────────┘
     │ • Ready to login │                │
     └──────┬───────────┘          ┌─────┴─────┐
            │                 Success        Fail
            │                      │            │
            │                      ↓            ↓
            │          ┌────────────────┐  ┌────────┐
            │          │ AUTHENTICATED  │  │ ERROR  │
            │          │                │  └────────┘
            │          │ • Has user     │
            │          │ • Has profile  │
            │          │ • Ready        │
            │          └───────┬────────┘
            │                  │
            │                  │
        ┌───┴───────────────┬──┴────────────┐
        │                   │               │
   User Clicks         Auto Refresh    User Clicks
   "Sign In"           (Token)         "Sign Out"
        │                   │               │
        ↓                   ↓               ↓
   ┌─────────┐         ┌─────────┐    ┌─────────┐
   │ LOADING │         │ Update  │    │ LOADING │
   │         │         │ Session │    │         │
   │ signin  │         └────┬────┘    │ signout │
   └────┬────┘              │         └────┬────┘
        │                   │              │
   Success/Fail        Continue       Clear State
        │                   │              │
        ↓                   ↓              ↓
   AUTHENTICATED      AUTHENTICATED   UNAUTHENTICATED
   or ERROR
```

---

## 3. Sign In Flow (Sequence Diagram)

```
User         LoginForm      AuthContext     Supabase      Database
 │               │              │              │             │
 │  Enter creds  │              │              │             │
 │──────────────→│              │              │             │
 │               │              │              │             │
 │  Click Sign In│              │              │             │
 │──────────────→│              │              │             │
 │               │              │              │             │
 │               │  signIn()    │              │             │
 │               │─────────────→│              │             │
 │               │              │              │             │
 │               │              │  Set status  │             │
 │               │              │  = LOADING   │             │
 │               │              │              │             │
 │               │              │  signInWith  │             │
 │               │              │  Password()  │             │
 │               │              │─────────────→│             │
 │               │              │              │             │
 │               │              │   Session +  │             │
 │               │              │   User       │             │
 │               │              │←─────────────│             │
 │               │              │              │             │
 │               │              │  SELECT * FROM users      │
 │               │              │  WHERE id = user.id       │
 │               │              │────────────────────────→  │
 │               │              │              │             │
 │               │              │         UserProfile       │
 │               │              │←──────────────────────────│
 │               │              │              │             │
 │               │              │  If stylist: │             │
 │               │              │  Fetch stylist_profiles   │
 │               │              │────────────────────────→  │
 │               │              │              │             │
 │               │              │    StylistProfile         │
 │               │              │←──────────────────────────│
 │               │              │              │             │
 │               │              │  Set status  │             │
 │               │              │  = AUTHENTICATED          │
 │               │              │  Set user = profile       │
 │               │              │              │             │
 │               │  Success     │              │             │
 │               │←─────────────│              │             │
 │               │              │              │             │
 │  Navigate to  │              │              │             │
 │  Dashboard    │              │              │             │
 │←──────────────│              │              │             │
```

---

## 4. Initialization Flow (Detailed Steps)

```
┌────────────────────────────────────────────────────────────────┐
│ STEP 1: Check Configuration                                   │
├────────────────────────────────────────────────────────────────┤
│ if (!SUPABASE_URL || !SUPABASE_ANON_KEY)                      │
│   → throw CONFIG_MISSING error                                │
└────────────────────────────┬───────────────────────────────────┘
                             │ ✓ Config exists
                             ↓
┌────────────────────────────────────────────────────────────────┐
│ STEP 2: Get Session                                           │
├────────────────────────────────────────────────────────────────┤
│ const { session } = await supabase.auth.getSession()          │
│                                                                │
│ Error? → throw SESSION_ERROR                                  │
└────────────────────────────┬───────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              No Session        Has Session
                    │                 │
                    ↓                 ↓
         ┌──────────────────┐  ┌─────────────────────────────────┐
         │ Set State:       │  │ STEP 3: Fetch User Profile      │
         │ UNAUTHENTICATED  │  ├──────────────────────────────────┤
         │ DONE ✓           │  │ SELECT * FROM users              │
         └──────────────────┘  │ WHERE id = session.user.id       │
                               │                                  │
                               │ Not found? → Create from auth    │
                               └──────────────┬───────────────────┘
                                              │ ✓ Profile exists
                                              ↓
                               ┌─────────────────────────────────┐
                               │ STEP 4: Check Role              │
                               ├─────────────────────────────────┤
                               │ if (profile.role === 'stylist') │
                               │   → Fetch stylist_profiles      │
                               └──────────────┬──────────────────┘
                                              │ ✓ All data fetched
                                              ↓
                               ┌─────────────────────────────────┐
                               │ STEP 5: Merge Data              │
                               ├─────────────────────────────────┤
                               │ Create complete UserProfile:    │
                               │ • Basic info from users table   │
                               │ • Stylist info (if applicable)  │
                               │ • Session data                  │
                               └──────────────┬──────────────────┘
                                              │
                                              ↓
                               ┌─────────────────────────────────┐
                               │ STEP 6: Set State               │
                               ├─────────────────────────────────┤
                               │ status: AUTHENTICATED           │
                               │ user: completeProfile           │
                               │ session: session                │
                               │ error: null                     │
                               │                                 │
                               │ DONE ✓                          │
                               └─────────────────────────────────┘
```

---

## 5. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Error Occurs Anywhere                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
              ┌───────────────────────┐
              │  normalizeError()     │
              │                       │
              │  Convert any error    │
              │  to AuthError type    │
              └───────────┬───────────┘
                          │
                          ↓
              ┌───────────────────────┐
              │  Classify Error       │
              └───────────┬───────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ↓               ↓               ↓
    ┌─────────┐   ┌─────────────┐  ┌──────────┐
    │ Network │   │ Credentials │  │ Database │
    │ Error   │   │ Error       │  │ Error    │
    └────┬────┘   └──────┬──────┘  └─────┬────┘
         │               │                │
         │ Recoverable   │ Not            │ Recoverable
         │ = true        │ Recoverable    │ = true
         │               │ = false        │
         └───────────────┴────────────────┘
                         │
                         ↓
              ┌──────────────────────┐
              │  Set Error State     │
              │                      │
              │  status: ERROR       │
              │  error: AuthError    │
              └──────────┬───────────┘
                         │
                         ↓
              ┌──────────────────────┐
              │  Log to Console      │
              │  (level based on     │
              │   error severity)    │
              └──────────┬───────────┘
                         │
                         ↓
              ┌──────────────────────┐
              │  Display to User     │
              └──────────┬───────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
    recoverable?                  recoverable?
      = true                        = false
          │                             │
          ↓                             ↓
   ┌────────────┐              ┌────────────────┐
   │ Show Retry │              │ Show Action    │
   │ Button     │              │ Button         │
   └─────┬──────┘              │ (Login/Support)│
         │                     └────────┬───────┘
         │                              │
    User Clicks                    User Clicks
         │                              │
         ↓                              ↓
   ┌────────────┐              ┌────────────────┐
   │ retry()    │              │ Navigate to    │
   │ Last Op    │              │ Appropriate    │
   └─────┬──────┘              │ Page           │
         │                     └────────────────┘
    Success?
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    ↓         ↓
 Clear    Update
 Error    Error
          Message
```

---

## 6. Protected Route Logic

```
┌─────────────────────────────────────────────────────────────────┐
│              <ProtectedRoute> Component Renders                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ↓
              ┌───────────────────────┐
              │  Read auth.status     │
              └───────────┬───────────┘
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
       ↓                  ↓                  ↓
  INITIALIZING         ERROR            Other Status
       │                  │                  │
       ↓                  ↓                  ↓
  ┌─────────┐      ┌──────────┐      ┌──────────────┐
  │ Show    │      │ Show     │      │ Continue     │
  │ Loading │      │ Error    │      │ Checking     │
  │ Spinner │      │ UI       │      └──────┬───────┘
  └─────────┘      └──────────┘             │
                                             ↓
                                  ┌──────────────────┐
                                  │ Check Protection │
                                  │ Level            │
                                  └─────────┬────────┘
                                            │
                         ┌──────────────────┼──────────────────┐
                         │                  │                  │
                         ↓                  ↓                  ↓
                    PUBLIC           AUTHENTICATED        ROLE_BASED
                         │                  │                  │
                         │                  │                  │
                         ↓                  ↓                  ↓
                  ┌──────────┐      ┌──────────────┐  ┌──────────────┐
                  │ Render   │      │ Check if     │  │ Check if     │
                  │ Children │      │ Authenticated│  │ Authenticated│
                  └──────────┘      └──────┬───────┘  └──────┬───────┘
                                           │                  │
                                    ┌──────┴──────┐           │
                                    │             │           │
                                   Yes           No           │
                                    │             │           │
                                    ↓             ↓           ↓
                             ┌──────────┐  ┌──────────┐  ┌─────────┐
                             │ Render   │  │ Redirect │  │ Check   │
                             │ Children │  │ to Login │  │ Role    │
                             └──────────┘  └──────────┘  └────┬────┘
                                                               │
                                                        ┌──────┴──────┐
                                                        │             │
                                                  Has Role       No Role
                                                        │             │
                                                        ↓             ↓
                                                 ┌──────────┐  ┌──────────┐
                                                 │ Render   │  │ Show     │
                                                 │ Children │  │ Unauth   │
                                                 └──────────┘  │ or       │
                                                               │ Redirect │
                                                               └──────────┘
```

---

## 7. Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         User Actions                           │
│                                                                │
│   Sign In  │  Sign Up  │  Sign Out  │  Page Load  │  Refresh  │
└─────┬──────┴─────┬─────┴──────┬─────┴──────┬──────┴─────┬─────┘
      │            │            │            │            │
      └────────────┴────────────┴────────────┴────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        AuthContext                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    State Updates                          │ │
│  │                                                           │ │
│  │  setAuthState({                                          │ │
│  │    status: AuthStatus,                                   │ │
│  │    user: UserProfile | null,                            │ │
│  │    error: AuthError | null,                             │ │
│  │    session: Session | null                              │ │
│  │  })                                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ↓              ↓              ↓
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Supabase │   │ Database │   │ Computed │
        │ Auth API │   │ Queries  │   │ Values   │
        └────┬─────┘   └────┬─────┘   └────┬─────┘
             │              │              │
             │              │              │
        ┌────┴──────────────┴──────────────┴────┐
        │                                       │
        ↓                                       ↓
  ┌────────────┐                         ┌────────────┐
  │  Session   │                         │  Derived   │
  │  Updates   │                         │  State     │
  └────────────┘                         └────────────┘
        │                                       │
        │                                       │
        └───────────────┬───────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                    React Components                             │
│                                                                 │
│  const { status, user, error } = useAuth()                     │
│                                                                 │
│  • Forms read auth state                                       │
│  • Dashboards read user data                                   │
│  • Routes check authentication                                 │
│  • Nav shows user info                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Comparison: Old vs New Loading Flow

### OLD SYSTEM (Race Conditions)

```
[App Loads]
    │
    ├─→ onAuthStateChange subscription
    │       │
    │       ├─→ INITIAL_SESSION event
    │       │       │
    │       │       └─→ handleSession() [Path A]
    │       │               │
    │       │               └─→ fetchUserProfile()
    │       │
    │       └─→ SIGNED_IN event (maybe?)
    │               │
    │               └─→ handleSession() [Path B] ← RACE!
    │                       │
    │                       └─→ fetchUserProfile() ← DUPLICATE!
    │
    └─→ 100ms fallback timeout
            │
            └─→ getSession() manually [Path C]
                    │
                    └─→ handleSession() ← MAYBE RACE!

RESULT: Multiple profile fetches, timing issues, 50ms delay hacks
```

### NEW SYSTEM (Sequential)

```
[App Loads]
    │
    ↓
Set status = INITIALIZING
    │
    ↓
await getSession()
    │
    ├─→ No session?
    │   │
    │   └─→ Set status = UNAUTHENTICATED
    │       DONE ✓
    │
    └─→ Has session?
        │
        ↓
    await fetchProfile()
        │
        ↓
    Set status = AUTHENTICATED
        │
        DONE ✓

RESULT: One path, predictable timing, no races
```

---

**End of Diagrams**

These visual diagrams complement the detailed design document.
