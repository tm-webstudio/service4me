import { test, expect } from '@playwright/test';

test('Test login simulation and data behavior', async ({ page }) => {
  console.log('\n=== Testing Login Simulation and Data Behavior ===');
  
  // Setup console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('stylists') || text.includes('loading') || text.includes('error') || text.includes('auth')) {
      console.log(`[${msg.type().toUpperCase()}] ${text}`);
    }
  });

  console.log('\n1. Testing browse page without login...');
  await page.goto('/browse');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  let stylistCount1 = await page.locator('a[href^="/stylist/"]').count();
  console.log(`Stylists without login: ${stylistCount1}`);
  
  await page.screenshot({ 
    path: 'tests/screenshots/login-sim-no-auth.png',
    fullPage: true 
  });

  console.log('\n2. Clicking on user icon to access login...');
  
  // Click on the user icon in the navigation
  const userIcon = page.locator('button:has(svg)').last(); // User icon button
  if (await userIcon.isVisible()) {
    await userIcon.click();
    await page.waitForTimeout(500);
    
    // Look for Sign In link in the mobile menu
    const signInLink = page.locator('text="Sign In"');
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await page.waitForURL('**/login');
      console.log('Successfully navigated to login page');
    } else {
      console.log('Sign In link not found in menu');
      // Try clicking the user icon itself to go to login
      await page.goto('/login');
    }
  } else {
    console.log('User icon not found, navigating directly to login');
    await page.goto('/login');
  }
  
  await page.screenshot({ 
    path: 'tests/screenshots/login-sim-login-page.png',
    fullPage: true 
  });

  console.log('\n3. Testing login attempt...');
  
  // Fill in login form with test credentials
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'testpassword123');
  
  await page.screenshot({ 
    path: 'tests/screenshots/login-sim-form-filled.png',
    fullPage: true 
  });
  
  // Click login button
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ 
    path: 'tests/screenshots/login-sim-after-attempt.png',
    fullPage: true 
  });
  
  console.log('\n4. Testing browse page after login attempt...');
  
  // Go back to browse page regardless of login success/failure
  await page.goto('/browse');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  let stylistCount2 = await page.locator('a[href^="/stylist/"]').count();
  console.log(`Stylists after login attempt: ${stylistCount2}`);
  
  await page.screenshot({ 
    path: 'tests/screenshots/login-sim-after-login.png',
    fullPage: true 
  });

  console.log('\n5. Testing with localStorage auth simulation...');
  
  // Simulate being logged in with localStorage
  await page.evaluate(() => {
    localStorage.setItem('sb-pwnuawhrgycjdnmfchou-auth-token', JSON.stringify({
      access_token: 'fake-token',
      refresh_token: 'fake-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'fake-user-id',
        email: 'test@example.com'
      }
    }));
  });
  
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  let stylistCount3 = await page.locator('a[href^="/stylist/"]').count();
  console.log(`Stylists with simulated auth: ${stylistCount3}`);
  
  await page.screenshot({ 
    path: 'tests/screenshots/login-sim-simulated-auth.png',
    fullPage: true 
  });

  console.log('\n6. Testing logout simulation...');
  
  // Clear auth state
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  let stylistCount4 = await page.locator('a[href^="/stylist/"]').count();
  console.log(`Stylists after logout: ${stylistCount4}`);
  
  await page.screenshot({ 
    path: 'tests/screenshots/login-sim-after-logout.png',
    fullPage: true 
  });

  console.log('\n=== COMPARISON RESULTS ===');
  console.log(`No auth: ${stylistCount1} stylists`);
  console.log(`After login attempt: ${stylistCount2} stylists`);
  console.log(`Simulated auth: ${stylistCount3} stylists`);
  console.log(`After logout: ${stylistCount4} stylists`);
  
  if (stylistCount1 === stylistCount2 && stylistCount2 === stylistCount3 && stylistCount3 === stylistCount4) {
    console.log('✅ Data loading is CONSISTENT across all auth states');
  } else {
    console.log('❌ Data loading VARIES between auth states');
  }
});