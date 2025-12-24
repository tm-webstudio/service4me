# Phase 7: Comprehensive Testing & Cleanup Checklist

**CRITICAL:** Complete ALL tests before removing any old files!

---

## Pre-Cleanup Testing (MUST PASS ALL)

### Test 1: Fresh Login Flow

**Clear All Data First:**
```javascript
// Run in browser console:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

#### Test 1A: Stylist Login
- [ ] Navigate to `http://localhost:3000/login-v2`
- [ ] Enter stylist credentials
- [ ] Click "Sign in"
- [ ] **Expected:** Redirects to `/dashboard/stylist` immediately (< 2 seconds)
- [ ] **Expected:** Dashboard loads without refresh
- [ ] **Expected:** Profile data appears (no fallback "User" text)
- [ ] **Expected:** Navigation shows stylist name (or email if no name)
- [ ] **Expected:** Role badge shows "stylist"
- [ ] **Check console:** No errors, clean logs

**Console should show:**
```
[LOGIN-FORM-V2] Submitting login for: stylist@example.com
[AUTH-V2] Sign in started for: stylist@example.com
[AUTH-V2] Sign in successful, fetching profile...
[AUTH-V2] Profile fetched successfully
[PROTECTED-ROUTE] Access granted { userRole: 'stylist', allowedRoles: ['stylist'] }
```

**❌ STOP if:**
- Login takes > 3 seconds
- Page refreshes after login
- See "User" text anywhere
- Console shows errors
- Infinite loading state

#### Test 1B: Client Login
- [ ] Sign out
- [ ] Clear browser data again
- [ ] Login as client
- [ ] **Expected:** Redirects to `/dashboard/client` immediately
- [ ] **Expected:** Client dashboard loads
- [ ] **Expected:** No fallback data

#### Test 1C: Admin Login (if available)
- [ ] Sign out
- [ ] Clear browser data
- [ ] Login as admin
- [ ] **Expected:** Redirects to `/admin` immediately
- [ ] **Expected:** Admin dashboard loads

**Result Test 1:** ✅ PASS / ❌ FAIL
**Notes:** _________________

---

### Test 2: Session Persistence

#### Test 2A: Page Reload
- [ ] Login as stylist
- [ ] Navigate to `/dashboard/stylist`
- [ ] **Press Cmd+R (or F5)** to reload
- [ ] **Expected:** Brief loading screen (< 500ms)
- [ ] **Expected:** Dashboard reappears WITHOUT login prompt
- [ ] **Expected:** All data still present
- [ ] **Reload 3 more times**
- [ ] **Expected:** Same behavior every time

**Console should show:**
```
[AUTH-V2] Starting initialization...
[AUTH-V2] Session found for user: xxx
[AUTH-V2] Profile fetched successfully
[AUTH-V2] Initialization complete - user authenticated
```

**❌ STOP if:**
- Redirects to login after reload
- Data disappears
- Shows loading forever
- Console errors

#### Test 2B: New Tab
- [ ] With stylist logged in tab 1
- [ ] Open new tab
- [ ] Navigate to `/dashboard/stylist` in tab 2
- [ ] **Expected:** Dashboard appears without login
- [ ] **Expected:** Session shared between tabs

#### Test 2C: Browser Restart
- [ ] Login as stylist
- [ ] Close browser completely
- [ ] Reopen browser
- [ ] Navigate to `/dashboard/stylist`
- [ ] **Expected:** Session persists (if no incognito mode)

**Result Test 2:** ✅ PASS / ❌ FAIL
**Notes:** _________________

---

### Test 3: Multiple Roles

#### Test 3A: Role Switching
- [ ] Login as **stylist**
- [ ] Verify at `/dashboard/stylist`
- [ ] **Sign out**
- [ ] Login as **client**
- [ ] **Expected:** Redirects to `/dashboard/client` (not stylist)
- [ ] Verify correct dashboard
- [ ] **Sign out**
- [ ] Login as **stylist** again
- [ ] **Expected:** Back to `/dashboard/stylist`

#### Test 3B: Wrong Dashboard Access
- [ ] Login as **client**
- [ ] Try to navigate to `/dashboard/stylist`
- [ ] **Expected:** Immediately redirected to `/dashboard/client`
- [ ] **Expected:** No content flash
- [ ] **Check console:** "User has wrong role, redirecting..."

**Console should show:**
```
[PROTECTED-ROUTE] User has wrong role, redirecting to appropriate dashboard {
  userRole: 'client',
  allowedRoles: ['stylist'],
  redirectTo: '/dashboard/client'
}
```

- [ ] Login as **stylist**
- [ ] Try to navigate to `/dashboard/client`
- [ ] **Expected:** Redirected to `/dashboard/stylist`

**Result Test 3:** ✅ PASS / ❌ FAIL
**Notes:** _________________

---

### Test 4: Error Scenarios

#### Test 4A: Wrong Password
- [ ] Go to `/login-v2`
- [ ] Enter correct email
- [ ] Enter **wrong password**
- [ ] Click "Sign in"
- [ ] **Expected:** Red error banner appears
- [ ] **Expected:** Message: "Invalid email or password"
- [ ] **Expected:** Form stays on page (can retry)
- [ ] **Expected:** No redirect

#### Test 4B: Email Already Exists (Signup)
- [ ] Go to `/signup-v2`
- [ ] Select "Client" tab
- [ ] Enter **existing email**
- [ ] Fill rest of form
- [ ] Click "Create Client Account"
- [ ] **Expected:** Error: "An account with this email already exists"
- [ ] **Expected:** Form stays on page

#### Test 4C: Network Error
- [ ] Open DevTools → Network tab
- [ ] Set to "Offline"
- [ ] Try to login
- [ ] **Expected:** Error message appears
- [ ] **Expected:** No infinite loading
- [ ] Re-enable network
- [ ] **Expected:** Can retry

#### Test 4D: Accessing Protected Route While Logged Out
- [ ] Sign out completely
- [ ] Navigate to `/dashboard/stylist`
- [ ] **Expected:** Redirected to `/login-v2?redirect=/dashboard/stylist`
- [ ] **Expected:** No content flash
- [ ] Login
- [ ] **Expected:** Redirects back to `/dashboard/stylist`

**Result Test 4:** ✅ PASS / ❌ FAIL
**Notes:** _________________

---

### Test 5: No Fallback Data

#### Test 5A: User Without Name
- [ ] Login with account that has NO first_name or last_name
- [ ] Check navigation
- [ ] **Expected:** Shows email address
- [ ] **Expected:** NO "User" text anywhere
- [ ] Check dashboard
- [ ] **Expected:** Shows email or actual data
- [ ] **Expected:** NO placeholder text

#### Test 5B: User With Name
- [ ] Login with account that HAS first_name and last_name
- [ ] Check navigation
- [ ] **Expected:** Shows first name
- [ ] **Expected:** Dropdown shows full name
- [ ] Check dashboard
- [ ] **Expected:** Shows full name

**Result Test 5:** ✅ PASS / ❌ FAIL
**Notes:** _________________

---

### Test 6: Navigation Component

#### Test 6A: Desktop Navigation
- [ ] Login as stylist
- [ ] Check desktop navigation (top right)
- [ ] **Expected:** User dropdown shows:
   - First name (or email)
   - Full email below
   - Role badge: "stylist"
- [ ] Click "Dashboard"
- [ ] **Expected:** Goes to `/dashboard/stylist`
- [ ] **Expected:** "List Your Business" button is HIDDEN (stylist role)

#### Test 6B: Mobile Navigation
- [ ] Open mobile menu (hamburger icon)
- [ ] **Expected:** User profile section shows:
   - Name or email (no "User")
   - Email address
   - Role badge
- [ ] Click "Dashboard"
- [ ] **Expected:** Navigates to correct dashboard
- [ ] Click "Sign Out"
- [ ] **Expected:** Signs out and redirects

#### Test 6C: Not Logged In
- [ ] Sign out
- [ ] Check navigation
- [ ] **Expected:** "Sign In" button links to `/login-v2`
- [ ] **Expected:** "List Your Business" button visible

**Result Test 6:** ✅ PASS / ❌ FAIL
**Notes:** _________________

---

### Test 7: Public Routes

#### Test 7A: Login While Authenticated
- [ ] Login as any user
- [ ] Try to navigate to `/login-v2`
- [ ] **Expected:** Immediately redirected to dashboard
- [ ] **Expected:** No login form shown

**Console should show:**
```
[PUBLIC-ROUTE] User already authenticated, redirecting to dashboard {
  userRole: 'stylist',
  redirectTo: '/dashboard/stylist'
}
```

#### Test 7B: Signup While Authenticated
- [ ] While logged in
- [ ] Try to navigate to `/signup-v2`
- [ ] **Expected:** Redirected to dashboard
- [ ] **Expected:** No signup form shown

**Result Test 7:** ✅ PASS / ❌ FAIL
**Notes:** _________________

---

### Test 8: Console Logs

#### Test 8A: Clean Logs
- [ ] Clear console
- [ ] Login as stylist
- [ ] Navigate to dashboard
- [ ] **Check console:**
   - [ ] No red errors
   - [ ] `[AUTH-V2]` logs present
   - [ ] `[PROTECTED-ROUTE]` logs present
   - [ ] `[LOGIN-FORM-V2]` logs present
   - [ ] Logs are sequential (no duplicates)
   - [ ] No "race condition" warnings

#### Test 8B: No Duplicate Fetches
- [ ] Watch console during login
- [ ] **Expected:** "Fetching user profile" appears ONCE
- [ ] **Expected:** No duplicate profile fetches

**Bad example (should NOT see):**
```
[AUTH-V2] Fetching user profile for: xxx
[AUTH-V2] Fetching user profile for: xxx  ← BAD! Duplicate
```

**Result Test 8:** ✅ PASS / ❌ FAIL
**Notes:** _________________

---

### Test 9: Performance

#### Test 9A: Login Speed
- [ ] Time the login process
- [ ] From click "Sign in" to dashboard appearing
- [ ] **Expected:** < 2 seconds
- [ ] **Actual time:** _______ seconds

#### Test 9B: Initialization Speed
- [ ] Time page reload
- [ ] From page load to dashboard appearing
- [ ] **Expected:** < 500ms
- [ ] **Actual time:** _______ ms

**Result Test 9:** ✅ PASS / ❌ FAIL
**Notes:** _________________

---

### Test 10: Edge Cases

#### Test 10A: Back Button
- [ ] Login → Dashboard → Navigate somewhere → Press Back
- [ ] **Expected:** Returns to dashboard
- [ ] **Expected:** Still authenticated
- [ ] **Expected:** No re-login required

#### Test 10B: Multiple Tabs Sign Out
- [ ] Open dashboard in 2 tabs
- [ ] Sign out in tab 1
- [ ] Switch to tab 2
- [ ] Refresh tab 2
- [ ] **Expected:** Tab 2 also signed out

#### Test 10C: Rapid Navigation
- [ ] Login
- [ ] Rapidly click between dashboard, profile, settings
- [ ] **Expected:** No errors
- [ ] **Expected:** Auth state remains consistent

**Result Test 10:** ✅ PASS / ❌ FAIL
**Notes:** _________________

---

## Testing Summary

**Total Tests:** 10
**Tests Passed:** _______ / 10
**Tests Failed:** _______

**Critical Issues Found:**
1. _________________
2. _________________
3. _________________

**Non-Critical Issues:**
1. _________________
2. _________________

---

## STOP HERE IF ANY TEST FAILED

**❌ DO NOT PROCEED TO CLEANUP if:**
- Any test failed
- Console shows errors
- Loading states don't work
- Session doesn't persist
- Fallback data appears
- Race conditions detected

**✅ PROCEED TO CLEANUP only if:**
- ALL tests pass
- No console errors
- Clean, sequential logs
- Fast performance
- No fallback data

---

## Ready to Proceed?

**Overall Status:** ✅ ALL TESTS PASS / ❌ TESTS FAILED

**Sign-off:**
- Tester: _________________
- Date: _________________
- Ready for cleanup: YES / NO

---

## Next Step After Testing

If all tests pass, proceed to **PHASE_7_CLEANUP_PLAN.md**
