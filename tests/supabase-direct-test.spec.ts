import { test, expect } from '@playwright/test';

test('Test Supabase connection directly', async ({ page }) => {
  console.log('\n=== Testing Supabase Connection Directly ===');
  
  // Setup console logging
  const logs: Array<{type: string, text: string, timestamp: Date}> = [];
  page.on('console', msg => {
    const timestamp = new Date();
    const text = msg.text();
    logs.push({ type: msg.type(), text, timestamp });
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });

  // Test by executing code in the browser context
  await page.goto('/browse');
  
  // Test Supabase configuration and connection
  const result = await page.evaluate(async () => {
    try {
      // Check if variables are available
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log('Environment check:');
      console.log('NEXT_PUBLIC_SUPABASE_URL:', url || 'NOT FOUND');
      console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? 'SET' : 'NOT SET');
      
      // Try to access the window object for client-side env vars
      const clientUrl = (window as any).__ENV__?.NEXT_PUBLIC_SUPABASE_URL || 'CLIENT ENV NOT FOUND';
      const hasClientKey = Boolean((window as any).__ENV__?.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      console.log('Client-side environment:');
      console.log('Client URL:', clientUrl);
      console.log('Client Key:', hasClientKey ? 'SET' : 'NOT SET');
      
      // Try to import and test Supabase directly
      const { createClient } = await import('@supabase/supabase-js');
      
      // Use actual values from .env.local
      const supabaseUrl = 'https://pwnuawhrgycjdnmfchou.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bnVhd2hyZ3ljamRubWZjaG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIyNjQsImV4cCI6MjA3MDM2ODI2NH0.Qnbm899tvgPoJMuICqfv7HETkYqn8Z2qr14J1Uy-pEI';
      
      const testClient = createClient(supabaseUrl, supabaseKey);
      
      console.log('Testing direct Supabase connection...');
      
      // Test fetching stylists
      const { data, error } = await testClient
        .from('stylist_profiles')
        .select('*')
        .limit(5);
      
      if (error) {
        console.error('Supabase query error:', error);
        return {
          success: false,
          error: error.message,
          data: null,
          envUrl: url,
          envKey: Boolean(key),
          clientUrl,
          hasClientKey
        };
      }
      
      console.log('Supabase query successful, data:', data);
      
      return {
        success: true,
        error: null,
        data: data,
        envUrl: url,
        envKey: Boolean(key),
        clientUrl,
        hasClientKey
      };
      
    } catch (err) {
      console.error('Test error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
        data: null,
        envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        envKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      };
    }
  });
  
  console.log('\n=== Test Results ===');
  console.log('Success:', result.success);
  console.log('Error:', result.error);
  console.log('Data count:', result.data?.length || 0);
  console.log('Environment URL:', result.envUrl);
  console.log('Environment Key set:', result.envKey);
  console.log('Client URL:', result.clientUrl);
  console.log('Client Key set:', result.hasClientKey);
  
  if (result.data && result.data.length > 0) {
    console.log('Sample stylist data:');
    console.log(JSON.stringify(result.data[0], null, 2));
  }
  
  // Take a screenshot for reference
  await page.screenshot({ 
    path: 'tests/screenshots/supabase-direct-test.png',
    fullPage: true 
  });
  
  expect(result.success).toBe(true);
});