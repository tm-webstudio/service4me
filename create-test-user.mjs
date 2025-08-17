import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwnuawhrgycjdnmfchou.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bnVhd2hyZ3ljamRubWZjaG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIyNjQsImV4cCI6MjA3MDM2ODI2NH0.Qnbm899tvgPoJMuICqfv7HETkYqn8Z2qr14J1Uy-pEI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  console.log('🔐 Creating test stylist user...')
  
  const testEmail = 'teststylist@gmail.com'
  const testPassword = 'TestPassword123!'
  
  try {
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'stylist',
          full_name: 'Test Stylist'
        }
      }
    })
    
    if (error) {
      console.log('❌ Error creating user:', error.message)
      
      // If user already exists, try to sign in
      if (error.message.includes('already registered')) {
        console.log('📧 User already exists, trying to sign in...')
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        })
        
        if (signInError) {
          console.log('❌ Sign in failed:', signInError.message)
          return
        }
        
        console.log('✅ Signed in successfully!')
        console.log('👤 User ID:', signInData.user?.id)
        return
      }
      
      return
    }
    
    console.log('✅ Test user created successfully!')
    console.log('📧 Email:', testEmail)
    console.log('🔒 Password:', testPassword)
    console.log('👤 User ID:', data.user?.id)
    
    if (data.user?.id) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: testEmail,
          full_name: 'Test Stylist',
          role: 'stylist'
        })
      
      if (profileError && profileError.code !== '23505') {
        console.log('❌ Error creating user profile:', profileError)
      } else {
        console.log('✅ User profile created')
      }
      
      // Create stylist profile
      const { error: stylistError } = await supabase
        .from('stylist_profiles')
        .insert({
          user_id: data.user.id,
          business_name: 'Test Hair Studio',
          bio: 'Test stylist for debugging',
          specialties: ['Hair Styling'],
          years_experience: 1,
          hourly_rate: 50,
          location: 'Test Location',
          portfolio_images: [],
          certifications: [],
          availability_schedule: {
            monday: { available: true, hours: '9:00-17:00' },
            tuesday: { available: true, hours: '9:00-17:00' },
            wednesday: { available: true, hours: '9:00-17:00' },
            thursday: { available: true, hours: '9:00-17:00' },
            friday: { available: true, hours: '9:00-17:00' },
            saturday: { available: false, hours: null },
            sunday: { available: false, hours: null }
          },
          is_verified: false,
          rating: 0,
          total_reviews: 0
        })
      
      if (stylistError) {
        console.log('❌ Error creating stylist profile:', stylistError)
      } else {
        console.log('✅ Stylist profile created')
        console.log('\n🎯 You can now log in with:')
        console.log('📧 Email: test.stylist@example.com')
        console.log('🔒 Password: TestPassword123!')
      }
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err)
  }
}

createTestUser()