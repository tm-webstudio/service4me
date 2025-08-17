import { test, expect } from '@playwright/test';

test('Investigate Supabase data loading issue', async ({ page }) => {
  console.log('\n=== Investigating Supabase Data Loading Issue ===');
  
  // Setup console logging
  const logs: Array<{type: string, text: string, timestamp: Date}> = [];
  page.on('console', msg => {
    const timestamp = new Date();
    const text = msg.text();
    logs.push({ type: msg.type(), text, timestamp });
    
    // Log interesting messages immediately
    if (text.includes('supabase') || text.includes('error') || text.includes('stylist') || text.includes('loading')) {
      console.log(`[${msg.type().toUpperCase()}] ${text}`);
    }
  });

  // Monitor network requests
  const networkActivity: Array<{url: string, method: string, status?: number, type: 'request' | 'response'}> = [];
  
  page.on('request', request => {
    const url = request.url();
    networkActivity.push({
      url,
      method: request.method(),
      type: 'request'
    });
    
    if (url.includes('supabase') || url.includes('stylist')) {
      console.log(`📤 REQUEST: ${request.method()} ${url}`);
    }
  });
  
  page.on('response', response => {
    const url = response.url();
    networkActivity.push({
      url,
      method: response.request().method(),
      status: response.status(),
      type: 'response'
    });
    
    if (url.includes('supabase') || url.includes('stylist')) {
      console.log(`📥 RESPONSE: ${response.status()} ${url}`);
    }
  });

  // Test 1: Go to browse page and wait for full load
  console.log('\n1. Testing browse page initial load...');
  await page.goto('/browse');
  
  // Wait for page to settle
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  // Take screenshot immediately
  await page.screenshot({ 
    path: 'tests/screenshots/investigate-initial-load.png',
    fullPage: true 
  });
  
  // Wait a bit more for any async operations
  await page.waitForTimeout(5000);
  
  // Check current state
  const loadingVisible = await page.locator('text="Loading stylists"').isVisible();
  const stylistCards = await page.locator('a[href^="/stylist/"]').count();
  const errorMessages = await page.locator('text="Unable to load stylists"').count();
  const mockDataMessages = await page.locator('text="sample data"').count();
  
  console.log(`Loading indicator visible: ${loadingVisible}`);
  console.log(`Stylist cards found: ${stylistCards}`);
  console.log(`Error messages: ${errorMessages}`);
  console.log(`Mock data messages: ${mockDataMessages}`);
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/investigate-final-state.png',
    fullPage: true 
  });
  
  // Test 2: Check what happens if we wait longer
  console.log('\n2. Waiting longer to see if data eventually loads...');
  await page.waitForTimeout(10000); // Wait 10 more seconds
  
  const stylistCardsAfterWait = await page.locator('a[href^="/stylist/"]').count();
  const loadingAfterWait = await page.locator('text="Loading stylists"').isVisible();
  
  console.log(`Stylist cards after extended wait: ${stylistCardsAfterWait}`);
  console.log(`Loading indicator after extended wait: ${loadingAfterWait}`);
  
  await page.screenshot({ 
    path: 'tests/screenshots/investigate-after-long-wait.png',
    fullPage: true 
  });
  
  // Test 3: Force reload to see if behavior changes
  console.log('\n3. Testing page reload behavior...');
  await page.reload();
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.waitForTimeout(5000);
  
  const stylistCardsAfterReload = await page.locator('a[href^="/stylist/"]').count();
  console.log(`Stylist cards after reload: ${stylistCardsAfterReload}`);
  
  await page.screenshot({ 
    path: 'tests/screenshots/investigate-after-reload.png',
    fullPage: true 
  });
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Initial load: ${stylistCards} stylists`);
  console.log(`After wait: ${stylistCardsAfterWait} stylists`);
  console.log(`After reload: ${stylistCardsAfterReload} stylists`);
  
  // Check for specific error patterns
  const supabaseErrors = logs.filter(log => 
    log.text.toLowerCase().includes('supabase') && 
    log.text.toLowerCase().includes('error')
  );
  
  const authErrors = logs.filter(log => 
    log.text.toLowerCase().includes('auth') && 
    log.text.toLowerCase().includes('error')
  );
  
  if (supabaseErrors.length > 0) {
    console.log('\nSupabase Errors Found:');
    supabaseErrors.forEach(log => console.log(`- ${log.text}`));
  }
  
  if (authErrors.length > 0) {
    console.log('\nAuth Errors Found:');
    authErrors.forEach(log => console.log(`- ${log.text}`));
  }
  
  // Check network activity
  const supabaseRequests = networkActivity.filter(activity => 
    activity.url.includes('supabase.co') || 
    activity.url.includes('pwnuawhrgycjdnmfchou')
  );
  
  console.log(`\nTotal Supabase network activity: ${supabaseRequests.length}`);
  if (supabaseRequests.length > 0) {
    console.log('Supabase network activity:');
    supabaseRequests.forEach(activity => {
      if (activity.type === 'response') {
        console.log(`- ${activity.method} ${activity.url} → ${activity.status}`);
      }
    });
  }
});