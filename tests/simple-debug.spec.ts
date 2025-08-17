import { test } from '@playwright/test'

test('debug profile update - capture all logs', async ({ page }) => {
  // Capture all console messages
  page.on('console', msg => {
    console.log(`🌐 BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`)
  })

  // Capture all network requests
  page.on('request', request => {
    console.log(`📤 REQUEST: ${request.method()} ${request.url()}`)
  })

  page.on('response', response => {
    console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`)
  })

  // Navigate to the dashboard
  console.log('🔍 Navigating to dashboard...')
  await page.goto('http://localhost:3000/dashboard/stylist')

  // Wait a bit to see what happens
  await page.waitForTimeout(5000)

  console.log('📊 Current URL:', page.url())

  // Take a screenshot to see what we're looking at
  await page.screenshot({ path: 'dashboard-debug.png', fullPage: true })

  // If we're on login page, let's see the form
  if (page.url().includes('login')) {
    console.log('🔐 On login page - checking form elements')
    
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    
    const emailExists = await emailInput.count() > 0
    const passwordExists = await passwordInput.count() > 0
    
    console.log('📧 Email input exists:', emailExists)
    console.log('🔒 Password input exists:', passwordExists)
  } else {
    console.log('✅ Landed on dashboard page')
    
    // Look for form elements
    const firstNameInput = page.locator('#first-name')
    const surnameInput = page.locator('#surname')
    const businessNameInput = page.locator('#business-name')
    const saveButton = page.locator('button:has-text("Save Changes")')
    
    const firstNameExists = await firstNameInput.count() > 0
    const surnameExists = await surnameInput.count() > 0
    const businessNameExists = await businessNameInput.count() > 0
    const saveButtonExists = await saveButton.count() > 0
    
    console.log('📝 First name input exists:', firstNameExists)
    console.log('📝 Surname input exists:', surnameExists)
    console.log('📝 Business name input exists:', businessNameExists)
    console.log('💾 Save button exists:', saveButtonExists)
    
    if (firstNameExists && surnameExists && businessNameExists && saveButtonExists) {
      console.log('🎯 All form elements found - testing update...')
      
      // Fill form
      await firstNameInput.fill('TestFirst')
      await surnameInput.fill('TestLast')
      await businessNameInput.fill('Test Business')
      
      console.log('📝 Form filled, clicking save...')
      await saveButton.click()
      
      // Wait for any response
      await page.waitForTimeout(3000)
      
      // Check for any error or success messages
      const successMsg = page.locator('.bg-green-50, .text-green-800')
      const errorMsg = page.locator('.bg-red-50, .text-red-800')
      
      const hasSuccess = await successMsg.count() > 0
      const hasError = await errorMsg.count() > 0
      
      console.log('✅ Success message shown:', hasSuccess)
      console.log('❌ Error message shown:', hasError)
      
      if (hasSuccess) {
        const successText = await successMsg.first().textContent()
        console.log('✅ Success text:', successText)
      }
      
      if (hasError) {
        const errorText = await errorMsg.first().textContent()
        console.log('❌ Error text:', errorText)
      }
      
      // Take another screenshot after save attempt
      await page.screenshot({ path: 'after-save-debug.png', fullPage: true })
    }
  }
})