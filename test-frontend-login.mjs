import puppeteer from 'puppeteer';

async function testLoginInBrowser() {
  console.log('🚀 Testing login in browser...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen to console logs
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🖥️  [${type.toUpperCase()}] ${text}`);
    });
    
    // Go to login page
    console.log('📱 Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[type="email"]');
    
    console.log('📝 Filling login form...');
    await page.type('input[type="email"]', 'tolu1998@hotmail.co.uk');
    await page.type('input[type="password"]', 'gate123');
    
    console.log('🔑 Clicking sign in...');
    
    // Wait for navigation after click
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);
    
    const currentUrl = page.url();
    console.log(`🔗 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/dashboard/stylist')) {
      console.log('✅ SUCCESS: Redirected to stylist dashboard!');
    } else if (currentUrl.includes('/dashboard/client')) {
      console.log('❌ ISSUE: Redirected to client dashboard instead of stylist');
    } else if (currentUrl.includes('/login')) {
      console.log('❌ ISSUE: Still on login page');
    } else {
      console.log(`❓ Unexpected URL: ${currentUrl}`);
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'login-test-result.png', fullPage: true });
    console.log('📸 Screenshot saved as login-test-result.png');
    
  } catch (error) {
    console.log('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is available
try {
  testLoginInBrowser();
} catch (error) {
  console.log('❌ Puppeteer not available, trying alternative approach...');
  console.log('💡 Please manually test the login at: http://localhost:3000/login');
  console.log('📧 Email: tolu1998@hotmail.co.uk');
  console.log('🔑 Password: gate123');
  console.log('🎯 Expected: Should redirect to /dashboard/stylist');
}