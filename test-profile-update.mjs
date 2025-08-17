import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwnuawhrgycjdnmfchou.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bnVhd2hyZ3ljamRubWZjaG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIyNjQsImV4cCI6MjA3MDM2ODI2NH0.Qnbm899tvgPoJMuICqfv7HETkYqn8Z2qr14J1Uy-pEI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProfileUpdate() {
  const userId = '4b4899ca-171d-460a-b226-f401b1e2c55c' // This is the user ID we see in the logs
  
  console.log('🔍 Testing profile update for user:', userId)
  
  try {
    // 1. First, let's see the current state
    console.log('\n📊 Step 1: Fetching current profile...')
    const { data: currentData, error: fetchError } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (fetchError) {
      console.log('❌ Error fetching current profile:', fetchError)
      return
    }
    
    console.log('✅ Current profile:', JSON.stringify(currentData, null, 2))
    
    // 2. Now let's try a simple update
    console.log('\n🔄 Step 2: Attempting to update business_name...')
    const testUpdate = {
      business_name: `TM Hair Studio - Updated ${new Date().toISOString().slice(0, 19)}`
    }
    
    console.log('🔍 Update payload:', JSON.stringify(testUpdate, null, 2))
    
    const { data: updateData, error: updateError } = await supabase
      .from('stylist_profiles')
      .update(testUpdate)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (updateError) {
      console.log('❌ Error updating profile:', updateError)
      console.log('❌ Error details:', JSON.stringify(updateError, null, 2))
      return
    }
    
    console.log('✅ Update response:', JSON.stringify(updateData, null, 2))
    
    // 3. Verify the update by fetching again
    console.log('\n🔍 Step 3: Verifying update by fetching again...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError)
      return
    }
    
    console.log('✅ Verified profile after update:', JSON.stringify(verifyData, null, 2))
    
    // 4. Compare before and after
    console.log('\n📊 Step 4: Comparison')
    console.log('Before business_name:', currentData.business_name)
    console.log('After business_name:', verifyData.business_name)
    console.log('✅ Update successful:', currentData.business_name !== verifyData.business_name)
    
  } catch (err) {
    console.log('❌ Unexpected error:', err)
  }
}

testProfileUpdate()