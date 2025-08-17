import { test, expect } from '@playwright/test'

test.describe('Stylist Profile Update', () => {
  test('should update stylist profile successfully', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`BROWSER: ${msg.type()}: ${msg.text()}`)
    })

    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('supabase') || request.url().includes('api/stylists')) {
        console.log(`REQUEST: ${request.method()} ${request.url()}`)
      }
    })

    page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('api/stylists')) {
        console.log(`RESPONSE: ${response.status()} ${response.url()}`)
      }
    })

    // Navigate to the stylist dashboard
    await page.goto('http://localhost:3000/dashboard/stylist')

    // Wait for the page to load and check if we're redirected to login
    await page.waitForTimeout(2000)
    
    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)

    if (currentUrl.includes('/login')) {
      console.log('User not authenticated, need to sign in first')
      
      // Fill in login form
      await page.fill('input[type="email"]', 'stylist@example.com')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button[type="submit"]')
      
      // Wait for redirect back to dashboard
      await page.waitForURL('**/dashboard/stylist', { timeout: 10000 })
    }

    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="stylist-dashboard"], .stylist-dashboard, h1:has-text("Hello")', { timeout: 10000 })
    
    console.log('Dashboard loaded successfully')

    // Find and fill the form fields
    const firstNameInput = page.locator('#first-name, input[id="first-name"]')
    const surnameInput = page.locator('#surname, input[id="surname"]')
    const businessNameInput = page.locator('#business-name, input[id="business-name"]')
    const bioTextarea = page.locator('#bio, textarea[id="bio"]')

    // Wait for form fields to be available
    await firstNameInput.waitFor({ timeout: 5000 })

    // Clear and fill form fields with test data
    const timestamp = new Date().toISOString().slice(11, 19)
    
    await firstNameInput.clear()
    await firstNameInput.fill(`TestFirst${timestamp}`)
    
    await surnameInput.clear()
    await surnameInput.fill(`TestLast${timestamp}`)
    
    await businessNameInput.clear()
    await businessNameInput.fill(`Test Studio ${timestamp}`)
    
    await bioTextarea.clear()
    await bioTextarea.fill(`Updated bio at ${timestamp}`)

    console.log(`Filled form with test data including timestamp: ${timestamp}`)

    // Click the save button
    const saveButton = page.locator('button:has-text("Save Changes"), button:has-text("Save")')
    await saveButton.waitFor({ timeout: 5000 })
    
    console.log('Clicking save button...')
    await saveButton.click()

    // Wait for any loading states or success messages
    await page.waitForTimeout(3000)

    // Check for success or error messages
    const successMessage = page.locator('text*="successfully", text*="updated", .bg-green-50')
    const errorMessage = page.locator('text*="error", text*="failed", .bg-red-50')

    const hasSuccess = await successMessage.count() > 0
    const hasError = await errorMessage.count() > 0

    console.log('Success message found:', hasSuccess)
    console.log('Error message found:', hasError)

    if (hasSuccess) {
      const successText = await successMessage.first().textContent()
      console.log('Success message text:', successText)
    }

    if (hasError) {
      const errorText = await errorMessage.first().textContent()
      console.log('Error message text:', errorText)
    }

    // Check if the form values persisted (reload and verify)
    console.log('Reloading page to verify persistence...')
    await page.reload()
    
    // Wait for page to reload
    await page.waitForSelector('#first-name, input[id="first-name"]', { timeout: 10000 })
    await page.waitForTimeout(2000)

    // Check if the values are still there
    const firstNameValue = await firstNameInput.inputValue()
    const surnameValue = await surnameInput.inputValue()
    const businessNameValue = await businessNameInput.inputValue()
    const bioValue = await bioTextarea.inputValue()

    console.log('Values after reload:')
    console.log('First Name:', firstNameValue)
    console.log('Surname:', surnameValue)
    console.log('Business Name:', businessNameValue)
    console.log('Bio:', bioValue)

    // Check if our test values persisted
    const valuesMatch = firstNameValue.includes(timestamp) && 
                       surnameValue.includes(timestamp) && 
                       businessNameValue.includes(timestamp) && 
                       bioValue.includes(timestamp)

    console.log('Test values persisted:', valuesMatch)

    // Take a screenshot for debugging
    await page.screenshot({ path: 'profile-update-test.png', fullPage: true })

    // The test will fail if values didn't persist, which helps us identify the issue
    expect(valuesMatch).toBe(true)
  })
})