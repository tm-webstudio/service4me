import { test, expect } from '@playwright/test';

// Helper function to wait for network requests to settle
async function waitForNetworkIdle(page, timeout = 5000) {
  return page.waitForLoadState('networkidle', { timeout });
}

// Helper function to capture console logs
function setupConsoleLogging(page) {
  const logs: Array<{type: string, text: string, timestamp: Date}> = [];
  
  page.on('console', msg => {
    const timestamp = new Date();
    logs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp
    });
  });

  return logs;
}

// Helper function to check for Supabase errors specifically
function getSupabaseErrors(logs) {
  return logs.filter(log => 
    log.text.toLowerCase().includes('supabase') ||
    log.text.toLowerCase().includes('auth') ||
    log.text.toLowerCase().includes('error') ||
    log.text.toLowerCase().includes('failed')
  );
}

test.describe('Supabase Data Loading Investigation', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    setupConsoleLogging(page);
  });

  test('Browse page loads stylists before login', async ({ page }) => {
    console.log('\n=== Testing Browse Page Before Login ===');
    
    // Go to browse page
    await page.goto('/browse');
    
    // Wait for page to load
    await waitForNetworkIdle(page);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/browse-before-login.png',
      fullPage: true 
    });
    
    // Check if stylists are loading
    await expect(page.locator('[data-testid="loading"]')).not.toBeVisible({ timeout: 10000 });
    
    // Check for stylist cards
    const stylistCards = page.locator('a[href^="/stylist/"]');
    const cardCount = await stylistCards.count();
    console.log(`Found ${cardCount} stylist cards before login`);
    
    // Verify at least one stylist is shown
    expect(cardCount).toBeGreaterThan(0);
    
    // Check for specific content
    await expect(page.getByText('Browse Stylists')).toBeVisible();
    
    // Look for stylist business names or locations
    const hasBusinessNames = await page.locator('h3').count();
    console.log(`Found ${hasBusinessNames} business name headers`);
    
    // Check for error messages
    const errorMessages = await page.locator('text="Unable to load stylists"').count();
    console.log(`Error messages found: ${errorMessages}`);
    
    // Check what data source is being used
    const mockDataIndicator = await page.locator('text="Using sample data"').count();
    const connectionIssues = await page.locator('text="Connection issues"').count();
    
    console.log(`Mock data indicator: ${mockDataIndicator}`);
    console.log(`Connection issues: ${connectionIssues}`);
  });

  test('User can access login/signup', async ({ page }) => {
    console.log('\n=== Testing Login Access ===');
    
    await page.goto('/');
    
    // Look for login/signup options in navigation
    const loginButton = page.locator('text="Sign In"').first();
    const userIcon = page.locator('[data-icon="user"]').first();
    
    // Check desktop navigation
    if (await loginButton.isVisible()) {
      await loginButton.click();
    } else if (await userIcon.isVisible()) {
      await userIcon.click();
    } else {
      // Try mobile menu
      const mobileMenuButton = page.locator('button:has(svg)').last();
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.waitForTimeout(500);
        await page.locator('text="Sign In"').first().click();
      }
    }
    
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/.*\/login/);
    
    await page.screenshot({ 
      path: 'tests/screenshots/login-page.png',
      fullPage: true 
    });
  });

  test('Complete login flow and test data loading', async ({ page }) => {
    console.log('\n=== Testing Complete Login Flow ===');
    
    const logs = setupConsoleLogging(page);
    
    // Go to login
    await page.goto('/login');
    await waitForNetworkIdle(page);
    
    // Check if we can see the login form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Try to use a test account (this may fail if no test data exists)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Take screenshot before login attempt
    await page.screenshot({ 
      path: 'tests/screenshots/login-form-filled.png',
      fullPage: true 
    });
    
    // Attempt login (expect this might fail)
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    
    // Wait a moment for any response
    await page.waitForTimeout(3000);
    
    // Take screenshot after login attempt
    await page.screenshot({ 
      path: 'tests/screenshots/after-login-attempt.png',
      fullPage: true 
    });
    
    // Check console for errors
    const supabaseErrors = getSupabaseErrors(logs);
    console.log('Supabase-related logs after login attempt:');
    supabaseErrors.forEach(log => {
      console.log(`[${log.type.toUpperCase()}] ${log.text}`);
    });
    
    // If login failed, try to create a test account instead
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('Login failed, attempting to create test account...');
      
      // Go to signup
      await page.goto('/signup');
      await waitForNetworkIdle(page);
      
      // Fill signup form
      await page.fill('input[name="email"]', 'testuser@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.fill('input[name="full_name"]', 'Test User');
      
      // Select client role if available
      const clientRadio = page.locator('input[value="client"]');
      if (await clientRadio.isVisible()) {
        await clientRadio.click();
      }
      
      await page.screenshot({ 
        path: 'tests/screenshots/signup-form-filled.png',
        fullPage: true 
      });
      
      const signupButton = page.locator('button[type="submit"]');
      await signupButton.click();
      
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: 'tests/screenshots/after-signup-attempt.png',
        fullPage: true 
      });
    }
  });

  test('Test data loading after simulated login state', async ({ page }) => {
    console.log('\n=== Testing Data Loading in Different Auth States ===');
    
    const logs = setupConsoleLogging(page);
    
    // Test 1: Browse page without auth
    console.log('Testing browse page without authentication...');
    await page.goto('/browse');
    await waitForNetworkIdle(page);
    
    // Count stylists
    let stylistCountBefore = await page.locator('a[href^="/stylist/"]').count();
    console.log(`Stylists shown without auth: ${stylistCountBefore}`);
    
    await page.screenshot({ 
      path: 'tests/screenshots/browse-no-auth.png',
      fullPage: true 
    });
    
    // Test 2: Try to simulate authenticated state using localStorage
    console.log('Simulating authenticated state...');
    await page.evaluate(() => {
      // Simulate having a session in localStorage
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: 'mock-user-id',
          email: 'test@example.com'
        }
      }));
    });
    
    // Reload page to see if behavior changes
    await page.reload();
    await waitForNetworkIdle(page);
    
    let stylistCountAfter = await page.locator('a[href^="/stylist/"]').count();
    console.log(`Stylists shown with simulated auth: ${stylistCountAfter}`);
    
    await page.screenshot({ 
      path: 'tests/screenshots/browse-simulated-auth.png',
      fullPage: true 
    });
    
    // Test 3: Clear auth and reload
    console.log('Clearing simulated auth state...');
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    
    await page.reload();
    await waitForNetworkIdle(page);
    
    let stylistCountAfterClear = await page.locator('a[href^="/stylist/"]').count();
    console.log(`Stylists shown after clearing auth: ${stylistCountAfterClear}`);
    
    await page.screenshot({ 
      path: 'tests/screenshots/browse-auth-cleared.png',
      fullPage: true 
    });
    
    // Compare results
    console.log('Data Loading Comparison:');
    console.log(`- No Auth: ${stylistCountBefore} stylists`);
    console.log(`- Simulated Auth: ${stylistCountAfter} stylists`);
    console.log(`- Auth Cleared: ${stylistCountAfterClear} stylists`);
    
    // Check for any auth-related errors
    const authErrors = logs.filter(log => 
      log.text.includes('auth') || 
      log.text.includes('token') ||
      log.text.includes('session') ||
      log.text.includes('supabase')
    );
    
    if (authErrors.length > 0) {
      console.log('Auth-related console messages:');
      authErrors.forEach(log => {
        console.log(`[${log.type}] ${log.text}`);
      });
    }
  });

  test('Test individual stylist page navigation', async ({ page }) => {
    console.log('\n=== Testing Stylist Profile Navigation ===');
    
    const logs = setupConsoleLogging(page);
    
    // Go to browse page
    await page.goto('/browse');
    await waitForNetworkIdle(page);
    
    // Find first stylist card
    const firstStylist = page.locator('a[href^="/stylist/"]').first();
    
    if (await firstStylist.count() > 0) {
      // Get the href before clicking
      const href = await firstStylist.getAttribute('href');
      console.log(`Clicking on stylist: ${href}`);
      
      // Click on stylist
      await firstStylist.click();
      
      // Wait for navigation
      await page.waitForURL(`**${href}`);
      await waitForNetworkIdle(page);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'tests/screenshots/stylist-profile.png',
        fullPage: true 
      });
      
      // Check if profile loaded
      const profileContent = await page.locator('h1, h2').count();
      console.log(`Profile content headers found: ${profileContent}`);
      
      // Look for error states
      const errorCount = await page.locator('text=/error|not found|404/i').count();
      console.log(`Error indicators: ${errorCount}`);
      
      // Check console for any errors during navigation
      const navigationErrors = getSupabaseErrors(logs);
      if (navigationErrors.length > 0) {
        console.log('Navigation-related errors:');
        navigationErrors.forEach(log => {
          console.log(`[${log.type}] ${log.text}`);
        });
      }
    } else {
      console.log('No stylist cards found to test navigation');
    }
  });

  test('Monitor network requests for Supabase calls', async ({ page }) => {
    console.log('\n=== Monitoring Network Requests ===');
    
    const requests: Array<{url: string, method: string, timestamp: Date}> = [];
    const responses: Array<{url: string, status: number, timestamp: Date}> = [];
    
    // Monitor requests
    page.on('request', request => {
      const url = request.url();
      if (url.includes('supabase') || url.includes('pwnuawhrgycjdnmfchou')) {
        requests.push({
          url,
          method: request.method(),
          timestamp: new Date()
        });
        console.log(`📤 REQUEST: ${request.method()} ${url}`);
      }
    });
    
    // Monitor responses
    page.on('response', response => {
      const url = response.url();
      if (url.includes('supabase') || url.includes('pwnuawhrgycjdnmfchou')) {
        responses.push({
          url,
          status: response.status(),
          timestamp: new Date()
        });
        console.log(`📥 RESPONSE: ${response.status()} ${url}`);
      }
    });
    
    // Visit browse page
    await page.goto('/browse');
    await waitForNetworkIdle(page);
    
    // Wait a bit more to catch any delayed requests
    await page.waitForTimeout(5000);
    
    console.log('\nNetwork Summary:');
    console.log(`Total Supabase requests: ${requests.length}`);
    console.log(`Total Supabase responses: ${responses.length}`);
    
    if (requests.length > 0) {
      console.log('\nRequest Details:');
      requests.forEach(req => {
        console.log(`- ${req.method} ${req.url}`);
      });
    }
    
    if (responses.length > 0) {
      console.log('\nResponse Details:');
      responses.forEach(res => {
        console.log(`- ${res.status} ${res.url}`);
      });
      
      // Check for error responses
      const errorResponses = responses.filter(res => res.status >= 400);
      if (errorResponses.length > 0) {
        console.log('\n❌ Error Responses:');
        errorResponses.forEach(res => {
          console.log(`- ${res.status} ${res.url}`);
        });
      }
    }
  });
});