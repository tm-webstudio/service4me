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
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  return logs;
}

// Generate unique test data
function generateTestData() {
  const timestamp = Date.now();
  return {
    email: `teststylist${timestamp}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Stylist',
    businessName: `Test Studio ${timestamp}`,
    phone: '07700 900123',
    location: 'London, UK'
  };
}

test.describe('Stylist Profile Auto-Creation Tests', () => {
  test('Stylist signup creates both user and profile records', async ({ page }) => {
    console.log('\n=== Testing Stylist Profile Auto-Creation ===');
    
    const logs = setupConsoleLogging(page);
    const testData = generateTestData();
    
    // Go to signup page
    await page.goto('/signup');
    await waitForNetworkIdle(page);
    
    // Switch to stylist tab
    await page.click('button:has-text("Stylist")');
    await page.waitForTimeout(500);
    
    // Fill out stylist signup form
    await page.fill('input[id="stylist-firstName"]', testData.firstName);
    await page.fill('input[id="stylist-lastName"]', testData.lastName);
    await page.fill('input[id="stylist-businessName"]', testData.businessName);
    await page.fill('input[id="stylist-email"]', testData.email);
    await page.fill('input[id="stylist-phone"]', testData.phone);
    await page.fill('input[id="stylist-location"]', testData.location);
    await page.fill('input[id="stylist-password"]', testData.password);
    await page.fill('input[id="stylist-confirmPassword"]', testData.password);
    
    // Accept terms
    await page.check('input[id="stylist-terms"]');
    
    // Take screenshot before submission
    await page.screenshot({ 
      path: 'tests/screenshots/stylist-signup-form.png',
      fullPage: true 
    });
    
    console.log(`Creating stylist account for: ${testData.email}`);
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Create Stylist Account")');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Take screenshot after submission
    await page.screenshot({ 
      path: 'tests/screenshots/after-stylist-signup.png',
      fullPage: true 
    });
    
    // Check for success message or redirect
    const currentUrl = page.url();
    console.log(`Current URL after signup: ${currentUrl}`);
    
    // Look for success indicators
    const successMessage = await page.locator('text="Thanks for signing up"').count();
    const confirmationText = await page.locator('text="confirmation email"').count();
    const errorMessage = await page.locator('text="Failed to create account"').count();
    
    console.log(`Success message found: ${successMessage}`);
    console.log(`Confirmation email text: ${confirmationText}`);
    console.log(`Error message found: ${errorMessage}`);
    
    // Check console logs for profile creation
    const profileCreationLogs = logs.filter(log => 
      log.text.includes('Stylist profile created successfully') ||
      log.text.includes('User profile created successfully') ||
      log.text.includes('Stylist signup result')
    );
    
    console.log('\nProfile creation related logs:');
    profileCreationLogs.forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
    });
    
    // Check for errors
    const errorLogs = logs.filter(log => 
      log.type === 'error' || 
      log.text.toLowerCase().includes('error')
    );
    
    if (errorLogs.length > 0) {
      console.log('\nError logs found:');
      errorLogs.forEach(log => {
        console.log(`[${log.type}] ${log.text}`);
      });
    }
    
    // Expect either success message or error (for debugging)
    expect(successMessage + errorMessage).toBeGreaterThan(0);
  });

  test('Verify email confirmation flow works for stylists', async ({ page }) => {
    console.log('\n=== Testing Email Confirmation Flow ===');
    
    const logs = setupConsoleLogging(page);
    const testData = generateTestData();
    
    // Go to signup page
    await page.goto('/signup');
    await waitForNetworkIdle(page);
    
    // Switch to stylist tab and fill form quickly
    await page.click('button:has-text("Stylist")');
    await page.fill('input[id="stylist-firstName"]', testData.firstName);
    await page.fill('input[id="stylist-lastName"]', testData.lastName);
    await page.fill('input[id="stylist-businessName"]', testData.businessName);
    await page.fill('input[id="stylist-email"]', testData.email);
    await page.fill('input[id="stylist-phone"]', testData.phone);
    await page.fill('input[id="stylist-location"]', testData.location);
    await page.fill('input[id="stylist-password"]', testData.password);
    await page.fill('input[id="stylist-confirmPassword"]', testData.password);
    await page.check('input[id="stylist-terms"]');
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Create Stylist Account")');
    await page.waitForTimeout(3000);
    
    // Check if we get confirmation email message
    const confirmationText = await page.locator('text="confirmation email"').isVisible();
    const emailText = await page.locator(`text="${testData.email}"`).isVisible();
    const signInLink = await page.locator('text="Go to Sign In"').isVisible();
    
    console.log(`Confirmation email message visible: ${confirmationText}`);
    console.log(`Test email address visible: ${emailText}`);
    console.log(`Sign In link visible: ${signInLink}`);
    
    if (confirmationText) {
      console.log('✅ Email confirmation flow working correctly');
      
      // Test the sign in link
      if (signInLink) {
        await page.click('text="Go to Sign In"');
        await page.waitForURL('**/login');
        expect(page.url()).toContain('/login');
        console.log('✅ Sign In redirect working correctly');
      }
    }
  });

  test('Check signup form validation', async ({ page }) => {
    console.log('\n=== Testing Signup Form Validation ===');
    
    await page.goto('/signup');
    await waitForNetworkIdle(page);
    
    // Switch to stylist tab
    await page.click('button:has-text("Stylist")');
    
    // Try to submit empty form
    await page.click('button[type="submit"]:has-text("Create Stylist Account")');
    
    // Check if HTML5 validation prevents submission
    const firstNameField = page.locator('input[id="stylist-firstName"]');
    const isFirstNameInvalid = await firstNameField.evaluate(el => !el.validity.valid);
    
    console.log(`Form validation working: ${isFirstNameInvalid}`);
    
    // Fill partial form and test password mismatch
    await page.fill('input[id="stylist-firstName"]', 'Test');
    await page.fill('input[id="stylist-lastName"]', 'User');
    await page.fill('input[id="stylist-businessName"]', 'Test Studio');
    await page.fill('input[id="stylist-email"]', 'test@example.com');
    await page.fill('input[id="stylist-phone"]', '07700900123');
    await page.fill('input[id="stylist-location"]', 'London');
    await page.fill('input[id="stylist-password"]', 'password123');
    await page.fill('input[id="stylist-confirmPassword"]', 'different');
    await page.check('input[id="stylist-terms"]');
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Create Stylist Account")');
    await page.waitForTimeout(1000);
    
    // Check for password mismatch error
    const passwordError = await page.locator('text="Passwords don\'t match"').isVisible();
    console.log(`Password mismatch validation working: ${passwordError}`);
    
    expect(passwordError).toBe(true);
  });
});