# Phase 7: Cleanup Plan

**⚠️ ONLY execute this after ALL tests in PHASE_7_TESTING_CHECKLIST.md PASS!**

---

## Files Still Using Old Auth System

### Components Using `@/hooks/use-auth`

**Need to update (8 files):**
1. `components/admin-dashboard.tsx`
2. `components/login-form.tsx` (old v1 form)
3. `components/list-business-form.tsx`
4. `components/signup-form.tsx` (old v1 form)
5. `components/reviews-display.tsx`
6. `components/stylist-profile.tsx`
7. `app/layout.tsx`
8. `components/review-form.tsx`

### Files Using Old Protected Routes

**Need to update (5 files):**
1. `app/admin/page.tsx`
2. `app/admin/pending-preview/[id]/page.tsx`
3. `hooks/use-saved-stylists.tsx`
4. `components/protected-stylist-route.tsx` (DELETE after)
5. `components/protected-client-route.tsx` (DELETE after)
6. `components/protected-admin-route.tsx` (DELETE after)

---

## Cleanup Steps (Execute in Order)

### Step 1: Update Admin Dashboard Page

**File:** `app/admin/page.tsx`

**Current:**
```tsx
import { ProtectedAdminRoute } from "@/components/protected-admin-route"
```

**Update to:**
```tsx
import { AuthProvider, ProtectedRoute } from "@/lib/auth-v2"

export default function AdminPage() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['admin']}>
        {/* existing content */}
      </ProtectedRoute>
    </AuthProvider>
  )
}
```

### Step 2: Update Admin Preview Page

**File:** `app/admin/pending-preview/[id]/page.tsx`

**Update similarly to admin page**

### Step 3: Update Components Using Old Hook

For each file, update the import and usage:

**Pattern:**
```tsx
// OLD
import { useAuth } from "@/hooks/use-auth"
const { user, userProfile, loading } = useAuth()

// NEW
import { useAuth } from "@/lib/auth-v2"
import { AuthStatus } from "@/lib/auth-v2/types"
const { status, user } = useAuth()
```

**Files to update:**
- `components/admin-dashboard.tsx`
- `components/list-business-form.tsx`
- `components/reviews-display.tsx`
- `components/stylist-profile.tsx`
- `app/layout.tsx`
- `components/review-form.tsx`
- `hooks/use-saved-stylists.tsx`

### Step 4: Remove Old Auth Files

**After confirming all components are updated:**

**Delete these files:**
```
hooks/use-auth.tsx
components/protected-client-route.tsx
components/protected-stylist-route.tsx
components/protected-admin-route.tsx
components/login-form.tsx (old V1 form)
components/signup-form.tsx (old V1 form)
app/login/page.tsx (if exists)
app/signup/page.tsx (if exists)
```

**Keep these (in backup-auth/):**
```
backup-auth/use-auth.tsx
backup-auth/protected-*.tsx
backup-auth/login-form.tsx
backup-auth/signup-form.tsx
```

### Step 5: Update app/layout.tsx

**File:** `app/layout.tsx`

This is critical - need to check what it's using auth for.

### Step 6: Code Cleanup

**Remove debug logs (keep important ones):**
- Keep: `[AUTH-V2]`, `[PROTECTED-ROUTE]`, `[PUBLIC-ROUTE]`
- Remove: Temporary debug logs, commented code

**Check for:**
- Commented-out old code
- Unused imports
- Temporary files

### Step 7: Documentation Update

**Create final documentation:**
- How to use auth-v2
- Common patterns
- Migration guide
- Troubleshooting

---

## Verification After Cleanup

### Test Again After Cleanup

Run these quick tests:

1. **Login Test:**
   - [ ] Login as each role works
   - [ ] Redirects correctly
   - [ ] No console errors

2. **Dashboard Test:**
   - [ ] All dashboards load
   - [ ] Data displays correctly
   - [ ] No old imports remain

3. **Build Test:**
   - [ ] Run `npm run build` (or `pnpm build`)
   - [ ] No TypeScript errors
   - [ ] No import errors
   - [ ] Build succeeds

4. **Grep Test:**
   - [ ] Search for `@/hooks/use-auth` → should only find in backup-auth/
   - [ ] Search for `ProtectedClientRoute` → should only find in backup-auth/
   - [ ] Search for old patterns → all cleaned up

---

## Files to Keep vs Delete

### ✅ KEEP (Working Files)

**Auth V2 System:**
```
lib/auth-v2/
  ├── types.ts
  ├── auth-helpers.ts
  ├── auth-context.tsx
  ├── use-auth.tsx
  ├── route-protection.tsx
  └── index.ts

components/auth-v2/
  ├── login-form.tsx
  ├── signup-form.tsx
  ├── protected-route-client.tsx
  ├── protected-route-stylist.tsx
  ├── protected-route-admin.tsx
  ├── index.ts
  └── README.md

app/
  ├── login-v2/page.tsx
  ├── signup-v2/page.tsx
  ├── auth-test/page.tsx
  └── test-protected-*/page.tsx
```

**Documentation:**
```
AUTH_V2_OVERVIEW.md
PHASE_3_COMPLETE.md
PHASE_4_COMPLETE.md
PHASE_5_ROUTE_PROTECTION.md
PHASE_5_SUMMARY.md
PHASE_6_COMPLETE.md
PHASE_7_TESTING_CHECKLIST.md
PHASE_7_CLEANUP_PLAN.md
TESTING_GUIDE.md
ROUTE_PROTECTION_QUICK_START.md
```

**Backup:**
```
backup-auth/
  └── (all old files safe here)
```

### ❌ DELETE (After Verification)

**Old Auth System:**
```
hooks/use-auth.tsx
components/protected-client-route.tsx
components/protected-stylist-route.tsx
components/protected-admin-route.tsx
components/login-form.tsx (V1 form)
components/signup-form.tsx (V1 form)
```

**Old Pages (if they exist):**
```
app/login/page.tsx
app/signup/page.tsx
```

---

## Grep Commands for Verification

**After cleanup, run these:**

```bash
# Should find ZERO results (except in backup-auth/):
grep -r "@/hooks/use-auth" --exclude-dir=backup-auth --exclude-dir=node_modules

# Should find ZERO results (except in backup-auth/ and docs):
grep -r "ProtectedClientRoute" --exclude-dir=backup-auth --exclude-dir=node_modules *.tsx *.ts

# Should find ZERO results:
grep -r "userProfile?.role" --exclude-dir=backup-auth --exclude-dir=node_modules

# Should find ZERO results:
grep -r "user?.user_metadata?.role" --exclude-dir=backup-auth --exclude-dir=node_modules
```

---

## Final Checklist

### Before Cleanup
- [ ] ALL tests in PHASE_7_TESTING_CHECKLIST.md pass
- [ ] No console errors
- [ ] Session persistence works
- [ ] All dashboards load correctly
- [ ] No fallback data anywhere

### During Cleanup
- [ ] Update admin pages
- [ ] Update components using old hook
- [ ] Delete old protected route files
- [ ] Delete old auth hook
- [ ] Delete old login/signup forms
- [ ] Keep backup-auth/ folder intact

### After Cleanup
- [ ] Quick login test works
- [ ] Build succeeds (`npm run build`)
- [ ] No old imports remain (grep test)
- [ ] TypeScript compiles without errors
- [ ] All dashboards still work
- [ ] Documentation updated

### Final Verification
- [ ] Fresh login works
- [ ] Session persists
- [ ] Role-based redirects work
- [ ] No console errors
- [ ] Clean codebase

---

## Rollback Plan (If Needed)

**If something breaks after cleanup:**

1. **Restore from backup-auth/:**
   ```bash
   # Copy files back from backup-auth/ as needed
   cp backup-auth/use-auth.tsx hooks/
   cp backup-auth/protected-*.tsx components/
   ```

2. **Revert component changes:**
   - Use git to revert specific files
   - `git checkout HEAD -- <filename>`

3. **Test again:**
   - Verify old system works
   - Investigate what broke
   - Fix issues before re-attempting cleanup

---

## Success Criteria

**Cleanup is successful when:**
- ✅ All tests still pass
- ✅ Build succeeds
- ✅ No old auth imports remain (except in backup-auth/)
- ✅ All dashboards work
- ✅ Session persistence works
- ✅ No console errors
- ✅ Codebase is clean

**Documentation is complete:**
- ✅ How to use auth-v2
- ✅ Common patterns documented
- ✅ Migration guide exists
- ✅ Troubleshooting guide available

---

## Status Tracking

**Cleanup Progress:**
- [ ] Step 1: Update admin pages
- [ ] Step 2: Update components
- [ ] Step 3: Delete old files
- [ ] Step 4: Verification tests
- [ ] Step 5: Documentation
- [ ] Step 6: Final checks

**Overall Status:** NOT STARTED / IN PROGRESS / COMPLETE

**Sign-off:**
- Developer: _________________
- Date: _________________
- Cleanup complete: YES / NO
