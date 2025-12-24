# Testing Guide - Auth V2 Forms

**Quick reference for testing new authentication forms**

---

## Test URLs

**Login Form V2:**
```
http://localhost:3000/login-v2
```

**Signup Form V2:**
```
http://localhost:3000/signup-v2
```

**Auth Test Page (Core System):**
```
http://localhost:3000/auth-test
```

**Protected Route Tests:**
```
http://localhost:3000/test-protected-client    (Client-only)
http://localhost:3000/test-protected-stylist   (Stylist-only)
http://localhost:3000/test-protected-admin     (Admin-only)
http://localhost:3000/test-protected-multi     (Client + Stylist)
```

---

## Quick Test Scenarios

### ✅ Happy Path - Login

1. Go to `/login-v2`
2. Enter valid email and password
3. Click "Sign in"
4. **Expected:** Redirect to dashboard based on role
5. **Check:** Console shows sequential logs (no duplicates)

**Console should show:**
```
[LOGIN-FORM-V2] Submitting login for: user@example.com
[AUTH-V2] Sign in started for: user@example.com
[AUTH-V2] Sign in successful, fetching profile...
[AUTH-V2] Profile fetched successfully
[AUTH-V2] Sign in complete
[LOGIN-FORM-V2] Redirecting to: /dashboard/stylist
```

### ✅ Happy Path - Client Signup

1. Go to `/signup-v2`
2. Select "Client" tab
3. Fill in:
   - First name: Test
   - Last name: User
   - Email: newclient@example.com
   - Password: password123
   - Confirm: password123
4. Check terms checkbox
5. Click "Create Client Account"
6. **Expected:** Redirect to `/dashboard/client` OR email confirmation screen
7. **Check:** Console shows profile creation

**Console should show:**
```
[SIGNUP-FORM-V2] Submitting client signup for: newclient@example.com
[AUTH-V2] Sign up started for: newclient@example.com as client
[AUTH-V2] Sign up successful, user: xxx
[AUTH-V2] Creating profile from auth for: xxx
[AUTH-V2] Profile created successfully
[SIGNUP-FORM-V2] Client signup successful
```

### ✅ Happy Path - Stylist Signup

1. Go to `/signup-v2`
2. Select "Stylist" tab
3. Fill in:
   - First name: Test
   - Last name: Stylist
   - Business name: Test Hair Studio
   - Email: newstylist@example.com
   - Phone: 020 7946 0892
   - Postcode: SW1A 1AA
   - Password: password123
   - Confirm: password123
4. Check terms checkbox
5. Click "Create Stylist Account"
6. **Expected:** Redirect to `/dashboard/stylist` OR email confirmation screen
7. **Check:** Console shows stylist profile update

**Console should show:**
```
[SIGNUP-FORM-V2] Submitting stylist signup for: newstylist@example.com
[AUTH-V2] Sign up started for: newstylist@example.com as stylist
[AUTH-V2] Sign up successful, user: xxx
[AUTH-V2] Creating profile from auth for: xxx
[AUTH-V2] Updating stylist profile...
[AUTH-V2] Profile created successfully
[SIGNUP-FORM-V2] Stylist signup successful
```

---

## Route Protection Test Scenarios

### ✅ Protected Route - Correct Role

1. **Login as a client**
2. Go to `/test-protected-client`
3. **Expected:** Page content appears
4. **Expected:** Profile information displayed
5. **Check:** Console shows "Access granted"

**Console should show:**
```
[PROTECTED-ROUTE] Checking access { status: 'initializing', ... }
[PROTECTED-ROUTE] Waiting for auth initialization...
[AUTH-V2] Initialization complete - user authenticated
[PROTECTED-ROUTE] Checking access { status: 'authenticated', userRole: 'client', allowedRoles: ['client'] }
[PROTECTED-ROUTE] Access granted { userRole: 'client', allowedRoles: ['client'] }
```

### ❌ Protected Route - Wrong Role

1. **Login as a stylist**
2. Try to go to `/test-protected-client`
3. **Expected:** Redirects to `/dashboard/stylist`
4. **Expected:** No content flash
5. **Check:** Console shows redirect decision

**Console should show:**
```
[PROTECTED-ROUTE] Checking access { status: 'authenticated', userRole: 'stylist', allowedRoles: ['client'] }
[PROTECTED-ROUTE] User has wrong role, redirecting to appropriate dashboard { userRole: 'stylist', redirectTo: '/dashboard/stylist' }
```

### ❌ Protected Route - Not Authenticated

1. **Sign out (or clear session)**
2. Try to go to `/test-protected-client`
3. **Expected:** Redirects to `/login-v2?redirect=/test-protected-client`
4. **Expected:** No content flash
5. **Check:** Console shows redirect to login

**Console should show:**
```
[PROTECTED-ROUTE] Checking access { status: 'unauthenticated', hasUser: false }
[PROTECTED-ROUTE] User not authenticated, redirecting to login
```

### ✅ Public Route - Not Authenticated

1. **Sign out**
2. Go to `/login-v2`
3. **Expected:** Login form appears
4. **Expected:** No redirect
5. **Check:** Console shows access granted

**Console should show:**
```
[PUBLIC-ROUTE] Checking access { status: 'unauthenticated', hasUser: false }
[PUBLIC-ROUTE] Access granted (user not authenticated)
```

### ✅ Public Route - Authenticated (Redirect)

1. **Login as any user**
2. Try to go to `/login-v2`
3. **Expected:** Redirects to appropriate dashboard
4. **Expected:** No login form shown
5. **Check:** Console shows redirect decision

**Console should show:**
```
[PUBLIC-ROUTE] Checking access { status: 'authenticated', hasUser: true, userRole: 'client' }
[PUBLIC-ROUTE] User already authenticated, redirecting to dashboard { userRole: 'client', redirectTo: '/dashboard/client' }
```

### ✅ Multi-Role Access

1. **Login as a client**
2. Go to `/test-protected-multi`
3. **Expected:** Page accessible
4. **Sign out and login as stylist**
5. Go to `/test-protected-multi`
6. **Expected:** Page accessible
7. **Sign out and login as admin (if available)**
8. Go to `/test-protected-multi`
9. **Expected:** Redirects to `/admin`

---

## Error Test Scenarios

### ❌ Invalid Credentials (Login)

1. Go to `/login-v2`
2. Enter: wrong@example.com / wrongpassword
3. Click "Sign in"
4. **Expected:** Red error banner: "Invalid email or password"
5. **Expected:** Form stays on page, can retry

### ❌ Email Already Exists (Signup)

1. Go to `/signup-v2`
2. Use existing email address
3. Fill rest of form
4. Click submit
5. **Expected:** Red error banner: "An account with this email already exists"
6. **Expected:** Form stays on page

### ❌ Password Mismatch (Signup)

1. Go to `/signup-v2`
2. Password: password123
3. Confirm: different123
4. Click submit
5. **Expected:** Red error banner: "Passwords don't match"
6. **Expected:** No API call (check console - no [AUTH-V2] logs)

### ❌ Missing Required Fields (Stylist)

1. Go to `/signup-v2`
2. Select "Stylist" tab
3. Leave business name empty
4. Fill other fields
5. Click submit
6. **Expected:** Red error banner: "Business name is required"
7. **Expected:** No API call

### ❌ Network Error

1. Go to `/login-v2`
2. Open DevTools → Network tab → "Offline"
3. Try to sign in
4. **Expected:** Red error banner: "Unable to connect to authentication service"
5. **Expected:** Retry button appears
6. Re-enable network and click retry

---

## Session Persistence Test

### ✅ Reload After Login

1. Login successfully
2. Verify redirect to dashboard
3. **Press Cmd+R (or F5) to reload page**
4. **Expected:** User stays logged in
5. **Expected:** Console shows session restoration

**Console should show:**
```
[AUTH-V2] Starting initialization...
[AUTH-V2] Checking for existing session...
[AUTH-V2] Session found for user: xxx
[AUTH-V2] Fetching user profile for: xxx
[AUTH-V2] Profile fetched successfully
[AUTH-V2] Initialization complete - user authenticated
```

### ✅ New Tab

1. Login successfully
2. Open new tab
3. Go to `/login-v2`
4. **Expected:** Already logged in (or auto-redirect)

### ✅ Close and Reopen Browser

1. Login successfully
2. Close browser completely
3. Reopen browser
4. Go to site
5. **Expected:** Session persisted (if "Remember me" was checked)

---

## Role-Based Redirect Test

### ✅ Admin → /admin

1. Login with admin account
2. **Expected:** Redirect to `/admin`

### ✅ Stylist → /dashboard/stylist

1. Login with stylist account
2. **Expected:** Redirect to `/dashboard/stylist`

### ✅ Client → /dashboard/client

1. Login with client account
2. **Expected:** Redirect to `/dashboard/client`

---

## Loading States Test

### ✅ During Login

1. Go to `/login-v2`
2. Enter credentials
3. Click "Sign in"
4. **Expected During Loading:**
   - Button text: "Signing in..."
   - Button shows spinner
   - All inputs disabled
   - Cannot click button again

### ✅ During Signup

1. Go to `/signup-v2`
2. Fill form
3. Click "Create Account"
4. **Expected During Loading:**
   - Button text: "Creating Account..."
   - Button shows spinner
   - All inputs disabled
   - Tab switching disabled
   - Cannot click button again

---

## Database Verification

### After Client Signup

**Check `users` table:**
```sql
SELECT * FROM users WHERE email = 'newclient@example.com';
```

**Expected:**
- `id`: UUID
- `email`: newclient@example.com
- `full_name`: Test User
- `role`: client
- `created_at`: timestamp

### After Stylist Signup

**Check `users` table:**
```sql
SELECT * FROM users WHERE email = 'newstylist@example.com';
```

**Expected:**
- `role`: stylist

**Check `stylist_profiles` table:**
```sql
SELECT * FROM stylist_profiles WHERE user_id = (
  SELECT id FROM users WHERE email = 'newstylist@example.com'
);
```

**Expected:**
- `business_name`: Test Hair Studio
- `location`: SW1A 1AA
- `phone`: 020 7946 0892
- `contact_email`: newstylist@example.com
- `user_id`: matches user ID

---

## Console Log Checklist

### ✅ Good Logs (What to Look For)

- Sequential execution (one after another)
- No duplicate fetches
- Clear status transitions
- Appropriate log levels
- Timestamps make sense

### ❌ Bad Logs (Red Flags)

- **Duplicate fetches:**
  ```
  [AUTH-V2] Fetching user profile for: xxx
  [AUTH-V2] Fetching user profile for: xxx  ← BAD!
  ```

- **Errors after success:**
  ```
  [AUTH-V2] Sign in complete
  Error: Cannot read property...  ← BAD!
  ```

- **Out of order:**
  ```
  [AUTH-V2] Profile fetched successfully
  [AUTH-V2] Fetching user profile...  ← BAD! (backwards)
  ```

---

## Performance Check

### Login Speed

**Expected:** < 2 seconds from click to redirect

**Measure:**
1. Click "Sign in"
2. Note time
3. Wait for redirect
4. Should be fast

**If slow (>3 seconds):**
- Check network tab
- Check Supabase latency
- Check database query time

### Signup Speed

**Expected:** < 3 seconds from click to redirect

**If slow (>4 seconds):**
- Check network tab
- Check profile creation time
- Check stylist profile update time

---

## Comparison Test (V1 vs V2)

### Side-by-side Test

1. Open two tabs
2. Tab 1: `/login` (old)
3. Tab 2: `/login-v2` (new)
4. Login in both
5. Compare:
   - Speed
   - Console logs
   - Redirect behavior
   - Error handling

**V2 should be:**
- Faster (no delays)
- Cleaner logs (no race conditions)
- Clearer errors
- More predictable

---

## Bug Report Template

If you find an issue:

```markdown
## Bug Report

**Component:** Login / Signup (V2)
**URL:** /login-v2 or /signup-v2
**User Type:** Client / Stylist / Admin

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**


**Console Logs:**
```
[paste relevant console logs]
```

**Screenshots:**
[attach if helpful]

**Database State:**
[relevant table data]
```

---

## Quick Commands

### Check if server is running:
```bash
lsof -ti:3000
```

### View Supabase logs (if using CLI):
```bash
supabase logs
```

### Clear browser cache:
- Chrome: Cmd+Shift+Delete
- Choose "Cookies and other site data"

### Clear local storage (console):
```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

## Success Criteria

### Must Pass All

**Authentication:**
- [ ] Login with all role types works
- [ ] Client signup creates account and profile
- [ ] Stylist signup creates account, profile, and stylist details
- [ ] All errors display clearly
- [ ] Loading states show during operations
- [ ] Session persists after page reload
- [ ] No race conditions in console
- [ ] No duplicate profile fetches
- [ ] Database records created correctly
- [ ] Performance is fast (<2-3 seconds)

**Route Protection:**
- [ ] Protected routes show loading screen during initialization
- [ ] Correct role grants access to protected routes
- [ ] Wrong role redirects to appropriate dashboard
- [ ] Unauthenticated users redirect to login
- [ ] PublicRoute redirects authenticated users to dashboard
- [ ] Multi-role access works correctly
- [ ] No content flash before redirects
- [ ] Redirect URLs preserve destination (?redirect=...)
- [ ] Console logs show clear decision-making
- [ ] Session persistence works across page reloads

---

## Ready to Test!

Start with happy path scenarios, then test error cases.

Check console logs carefully for any issues.

Report any bugs using the template above.

**Good luck!** 🚀
