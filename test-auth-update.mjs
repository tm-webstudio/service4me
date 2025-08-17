import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwnuawhrgycjdnmfchou.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bnVhd2hyZ3ljamRubWZjaG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIyNjQsImV4cCI6MjA3MDM2ODI2NH0.Qnbm899tvgPoJMuICqfv7HETkYqn8Z2qr14J1Uy-pEI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuthenticatedUpdate() {
  console.log('🔍 Testing authenticated profile update...')
  
  try {
    // First, let's try to sign in with a test user
    console.log('\n🔐 Step 1: Attempting to sign in...')
    
    // Try to sign in with the existing user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'stylist@example.com',
      password: 'password123'
    })
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message)
      
      // If sign in fails, let's see what users exist
      console.log('\n🔍 Checking existing users...')
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
      
      if (usersError) {
        console.log('❌ Could not list users:', usersError.message)
      } else {
        console.log('👥 Existing users:', users.users.map(u => ({ id: u.id, email: u.email, role: u.user_metadata?.role })))
      }
      
      // Try with a different approach - let's see if we can get the current user from the existing session
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.log('❌ No authenticated user found, ending test')
        return
      }
      
      console.log('✅ Found existing authenticated user:', user.id)
    } else {
      console.log('✅ Sign in successful for user:', signInData.user?.id)
    }
    
    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('❌ Could not get authenticated user:', userError)
      return
    }
    
    console.log('✅ Authenticated user:', user.id)
    console.log('📋 User metadata:', JSON.stringify(user.user_metadata, null, 2))
    
    // Now try to fetch their stylist profile
    console.log('\n📊 Step 2: Fetching stylist profile...')
    const { data: profile, error: fetchError } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (fetchError) {
      console.log('❌ Error fetching profile:', fetchError)
      return
    }
    
    console.log('✅ Current profile:', JSON.stringify(profile, null, 2))
    
    // Now try to update the profile
    console.log('\n🔄 Step 3: Attempting profile update...')
    const updateData = {
      business_name: `TM Hair Studio - Auth Test ${new Date().toISOString().slice(11, 19)}`,
      bio: `Updated with authenticated client at ${new Date().toISOString()}`
    }
    
    console.log('🔍 Update payload:', JSON.stringify(updateData, null, 2))
    
    const { data: updateResult, error: updateError } = await supabase
      .from('stylist_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (updateError) {
      console.log('❌ Update failed:', updateError)
      console.log('❌ Error details:', JSON.stringify(updateError, null, 2))
    } else {
      console.log('✅ Update successful!')
      console.log('📊 Updated data:', JSON.stringify(updateResult, null, 2))
      
      // Verify by fetching again
      console.log('\n🔍 Step 4: Verifying update...')
      const { data: verifyData, error: verifyError } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (verifyError) {
        console.log('❌ Verification failed:', verifyError)
      } else {
        console.log('✅ Verification successful!')
        console.log('📊 Final data:', JSON.stringify(verifyData, null, 2))
        console.log('🎯 Business name updated:', verifyData.business_name === updateData.business_name)
        console.log('🎯 Bio updated:', verifyData.bio === updateData.bio)
      }
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err)
  }
}

testAuthenticatedUpdate()