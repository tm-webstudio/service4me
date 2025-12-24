# Route Protection Testing Checklist

Use this checklist to verify route protection is working correctly.

**Date Tested:** _____________

**Tester:** _____________

---

## Pre-Test Setup

- [ ] Server is running: `npm run dev` or `pnpm dev`
- [ ] Browser console is open (F12)
- [ ] Network tab visible (for debugging)
- [ ] Have test accounts ready:
  - [ ] Client account
  - [ ] Stylist account
  - [ ] Admin account (if available)

---

## Test 1: Protected Route - Client Access

**URL:** http://localhost:3000/test-protected-client

### Test 1A: Correct Role (Client)
- [ ] Login as **CLIENT**
- [ ] Navigate to `/test-protected-client`
- [ ] **Expected:** Page content appears
- [ ] **Expected:** Profile information displayed (email, role, etc.)
- [ ] **Expected:** Green "Client Access" badge visible
- [ ] **Check console:** "Access granted" log appears
- [ ] **Check console:** No errors

**Console should show:**
```
[PROTECTED-ROUTE] Waiting for auth initialization...
[PROTECTED-ROUTE] Access granted { userRole: 'client', allowedRoles: ['client'] }
```

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 1B: Wrong Role (Stylist)
- [ ] Login as **STYLIST**
- [ ] Navigate to `/test-protected-client`
- [ ] **Expected:** Immediately redirected to `/dashboard/stylist`
- [ ] **Expected:** No content flash
- [ ] **Check console:** "User has wrong role" log appears

**Console should show:**
```
[PROTECTED-ROUTE] User has wrong role, redirecting to appropriate dashboard
```

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 1C: Not Authenticated
- [ ] Sign out (or clear session)
- [ ] Navigate to `/test-protected-client`
- [ ] **Expected:** Redirected to `/login-v2?redirect=/test-protected-client`
- [ ] **Expected:** No content flash
- [ ] **Check console:** "User not authenticated" log appears

**Console should show:**
```
[PROTECTED-ROUTE] User not authenticated, redirecting to login
```

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

---

## Test 2: Protected Route - Stylist Access

**URL:** http://localhost:3000/test-protected-stylist

### Test 2A: Correct Role (Stylist)
- [ ] Login as **STYLIST**
- [ ] Navigate to `/test-protected-stylist`
- [ ] **Expected:** Page content appears
- [ ] **Expected:** Profile information displayed
- [ ] **Expected:** Purple "Stylist Access" badge visible
- [ ] **Expected:** Business name shown (if set)
- [ ] **Check console:** "Access granted" log appears

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 2B: Wrong Role (Client)
- [ ] Login as **CLIENT**
- [ ] Navigate to `/test-protected-stylist`
- [ ] **Expected:** Redirected to `/dashboard/client`
- [ ] **Expected:** No content flash

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 2C: Not Authenticated
- [ ] Sign out
- [ ] Navigate to `/test-protected-stylist`
- [ ] **Expected:** Redirected to `/login-v2?redirect=/test-protected-stylist`

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

---

## Test 3: Protected Route - Admin Access

**URL:** http://localhost:3000/test-protected-admin

### Test 3A: Correct Role (Admin)
- [ ] Login as **ADMIN** (if available)
- [ ] Navigate to `/test-protected-admin`
- [ ] **Expected:** Page content appears
- [ ] **Expected:** Red "Admin Access" badge visible

**Result:** ✅ PASS / ❌ FAIL / ⏭️ SKIP (no admin account)

**Notes:** _______________

### Test 3B: Wrong Role (Client)
- [ ] Login as **CLIENT**
- [ ] Navigate to `/test-protected-admin`
- [ ] **Expected:** Redirected to `/dashboard/client`

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 3C: Wrong Role (Stylist)
- [ ] Login as **STYLIST**
- [ ] Navigate to `/test-protected-admin`
- [ ] **Expected:** Redirected to `/dashboard/stylist`

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

---

## Test 4: Multi-Role Access

**URL:** http://localhost:3000/test-protected-multi

### Test 4A: Client Access
- [ ] Login as **CLIENT**
- [ ] Navigate to `/test-protected-multi`
- [ ] **Expected:** Page content appears
- [ ] **Expected:** Blue "Multi-Role Access" badge visible
- [ ] **Expected:** Shows "Clients: Can access this page" (green box)

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 4B: Stylist Access
- [ ] Login as **STYLIST**
- [ ] Navigate to `/test-protected-multi`
- [ ] **Expected:** Page content appears
- [ ] **Expected:** Shows "Stylists: Can access this page" (green box)

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 4C: Admin Denied
- [ ] Login as **ADMIN** (if available)
- [ ] Navigate to `/test-protected-multi`
- [ ] **Expected:** Redirected to `/admin`
- [ ] **Expected:** Page explains admins cannot access

**Result:** ✅ PASS / ❌ FAIL / ⏭️ SKIP (no admin account)

**Notes:** _______________

---

## Test 5: Public Route - Login Page

**URL:** http://localhost:3000/login-v2

### Test 5A: Not Authenticated
- [ ] Sign out
- [ ] Navigate to `/login-v2`
- [ ] **Expected:** Login form appears
- [ ] **Expected:** No redirect
- [ ] **Check console:** "Access granted (user not authenticated)"

**Console should show:**
```
[PUBLIC-ROUTE] Access granted (user not authenticated)
```

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 5B: Already Authenticated (Client)
- [ ] Login as **CLIENT**
- [ ] Navigate to `/login-v2`
- [ ] **Expected:** Redirected to `/dashboard/client`
- [ ] **Expected:** No login form shown
- [ ] **Check console:** "User already authenticated, redirecting"

**Console should show:**
```
[PUBLIC-ROUTE] User already authenticated, redirecting to dashboard
```

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 5C: Already Authenticated (Stylist)
- [ ] Login as **STYLIST**
- [ ] Navigate to `/login-v2`
- [ ] **Expected:** Redirected to `/dashboard/stylist`

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

---

## Test 6: Public Route - Signup Page

**URL:** http://localhost:3000/signup-v2

### Test 6A: Not Authenticated
- [ ] Sign out
- [ ] Navigate to `/signup-v2`
- [ ] **Expected:** Signup form appears
- [ ] **Expected:** Both "Client" and "Stylist" tabs visible

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 6B: Already Authenticated
- [ ] Login as any user
- [ ] Navigate to `/signup-v2`
- [ ] **Expected:** Redirected to appropriate dashboard
- [ ] **Expected:** No signup form shown

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

---

## Test 7: Session Persistence

### Test 7A: Page Reload
- [ ] Login as **CLIENT**
- [ ] Navigate to `/test-protected-client`
- [ ] **Verify:** Content appears
- [ ] **Press Cmd+R (or F5)** to reload page
- [ ] **Expected:** Brief loading screen
- [ ] **Expected:** Content reappears without login
- [ ] **Expected:** No redirect to login
- [ ] **Check console:** Session restoration logs

**Console should show:**
```
[AUTH-V2] Starting initialization...
[AUTH-V2] Session found for user: xxx
[AUTH-V2] Initialization complete - user authenticated
```

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 7B: Multiple Tabs
- [ ] Login in Tab 1
- [ ] Navigate to protected page in Tab 1
- [ ] **Open new tab** (Tab 2)
- [ ] Navigate to same protected page in Tab 2
- [ ] **Expected:** Tab 2 shows content without login
- [ ] **Expected:** Session shared between tabs

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 7C: Back/Forward Navigation
- [ ] Navigate: Home → Login → Dashboard → Protected Route
- [ ] **Press browser back button**
- [ ] **Expected:** Returns to dashboard
- [ ] **Expected:** No re-login required
- [ ] **Press forward button**
- [ ] **Expected:** Returns to protected route
- [ ] **Expected:** Content appears immediately

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

---

## Test 8: Loading States

### Test 8A: Initialization Loading
- [ ] Clear browser cache (Cmd+Shift+Delete)
- [ ] Navigate to any protected route
- [ ] **Expected:** Brief "Loading..." message appears
- [ ] **Expected:** Spinner visible
- [ ] **Expected:** Loading screen disappears when auth completes

**Duration:** _______ ms (should be < 1000ms)

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 8B: Redirect Loading
- [ ] Login as **STYLIST**
- [ ] Navigate to `/test-protected-client`
- [ ] **Expected:** Brief "Redirecting..." message
- [ ] **Expected:** No content flash
- [ ] **Expected:** Smooth redirect to stylist dashboard

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

---

## Test 9: Console Logs

### Test 9A: Log Clarity
- [ ] Open console
- [ ] Navigate to protected route
- [ ] **Check:** Logs start with `[PROTECTED-ROUTE]` or `[PUBLIC-ROUTE]`
- [ ] **Check:** Logs include relevant context (status, role, allowedRoles)
- [ ] **Check:** Logs explain decisions clearly

**Sample good log:**
```
[PROTECTED-ROUTE] Checking access {
  status: 'authenticated',
  hasUser: true,
  userRole: 'client',
  allowedRoles: ['client']
}
[PROTECTED-ROUTE] Access granted { userRole: 'client', allowedRoles: ['client'] }
```

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 9B: No Errors
- [ ] Navigate through all test pages
- [ ] **Check console:** No red error messages
- [ ] **Check console:** No warnings about missing dependencies
- [ ] **Check console:** No race condition indicators

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

---

## Test 10: Edge Cases

### Test 10A: Network Error During Init
- [ ] Open DevTools → Network tab
- [ ] Set throttling to "Offline"
- [ ] Navigate to protected route
- [ ] **Expected:** Shows loading or error state
- [ ] **Expected:** No crash
- [ ] Re-enable network
- [ ] **Expected:** Page recovers or allows retry

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 10B: Expired Session
- [ ] Login successfully
- [ ] Manually clear Supabase session (localStorage)
- [ ] Navigate to protected route
- [ ] **Expected:** Redirects to login
- [ ] **Expected:** No errors

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 10C: Role Change Mid-Session
(Only if you can manually change role in database)
- [ ] Login as **CLIENT**
- [ ] Access `/test-protected-client`
- [ ] **Manually change role to 'stylist' in database**
- [ ] Reload page
- [ ] **Expected:** Redirects to stylist dashboard
- [ ] **Expected:** No errors

**Result:** ✅ PASS / ❌ FAIL / ⏭️ SKIP (cannot change role)

**Notes:** _______________

---

## Performance Tests

### Test 11A: Initial Load Time
- [ ] Clear cache
- [ ] Use Network tab to measure
- [ ] Navigate to protected route
- [ ] **Measure:** Time from navigation to content appearing

**Time:** _______ ms

**Expected:** < 1000ms for first load

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 11B: Subsequent Load Time
- [ ] With session cached
- [ ] Navigate to protected route
- [ ] **Measure:** Time from navigation to content

**Time:** _______ ms

**Expected:** < 500ms for cached session

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

### Test 11C: Redirect Speed
- [ ] Login as **CLIENT**
- [ ] Navigate to `/test-protected-stylist`
- [ ] **Measure:** Time from navigation to redirect completion

**Time:** _______ ms

**Expected:** < 200ms

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________

---

## Cross-Browser Testing

### Test 12A: Chrome
- [ ] All tests pass in Chrome
- [ ] No browser-specific errors

**Result:** ✅ PASS / ❌ FAIL

**Chrome Version:** _____________

### Test 12B: Safari
- [ ] All tests pass in Safari
- [ ] No browser-specific errors

**Result:** ✅ PASS / ❌ FAIL / ⏭️ SKIP

**Safari Version:** _____________

### Test 12C: Firefox
- [ ] All tests pass in Firefox
- [ ] No browser-specific errors

**Result:** ✅ PASS / ❌ FAIL / ⏭️ SKIP

**Firefox Version:** _____________

---

## Final Verification

### All Core Features Work
- [ ] ProtectedRoute blocks access correctly
- [ ] PublicRoute redirects authenticated users
- [ ] Loading screens appear during initialization
- [ ] Redirects happen without content flash
- [ ] Session persists across reloads
- [ ] Multi-role access works
- [ ] Console logs are clear and helpful

### No Critical Issues
- [ ] No console errors
- [ ] No infinite redirect loops
- [ ] No race conditions
- [ ] No content flashing
- [ ] No slow performance (> 2 seconds)

### Documentation Matches Implementation
- [ ] Examples in docs work as shown
- [ ] Console logs match documentation
- [ ] Behavior matches descriptions

---

## Overall Assessment

**Total Tests Run:** _______ / 45

**Tests Passed:** _______

**Tests Failed:** _______

**Tests Skipped:** _______

**Pass Rate:** _______ %

**Critical Issues Found:** _______

**Non-Critical Issues Found:** _______

---

## Issues Found

**Issue 1:**
- **Description:** _______________
- **Severity:** Critical / High / Medium / Low
- **Steps to Reproduce:** _______________
- **Expected:** _______________
- **Actual:** _______________

**Issue 2:**
- **Description:** _______________
- **Severity:** Critical / High / Medium / Low
- **Steps to Reproduce:** _______________
- **Expected:** _______________
- **Actual:** _______________

**Issue 3:**
- **Description:** _______________
- **Severity:** Critical / High / Medium / Low
- **Steps to Reproduce:** _______________
- **Expected:** _______________
- **Actual:** _______________

---

## Recommendations

**Ready for production?** ✅ YES / ❌ NO

**Recommended next steps:**
- [ ] _______________
- [ ] _______________
- [ ] _______________

**Additional testing needed:**
- [ ] _______________
- [ ] _______________

---

## Sign-Off

**Tester Signature:** _____________

**Date:** _____________

**Overall Status:** ✅ APPROVED / ⚠️ APPROVED WITH CONDITIONS / ❌ NOT APPROVED

**Conditions (if any):** _______________

---

## Quick Reference

**Test URLs:**
- `/test-protected-client` - Client-only
- `/test-protected-stylist` - Stylist-only
- `/test-protected-admin` - Admin-only
- `/test-protected-multi` - Multi-role
- `/login-v2` - Login (public)
- `/signup-v2` - Signup (public)

**Expected Console Logs:**
- `[PROTECTED-ROUTE]` - Route protection decisions
- `[PUBLIC-ROUTE]` - Public route decisions
- `[AUTH-V2]` - Auth system operations

**Pass Criteria:**
- All "MUST PASS" tests pass
- No critical issues
- Performance meets benchmarks
- Console logs are clear
