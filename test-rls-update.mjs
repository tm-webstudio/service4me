import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwnuawhrgycjdnmfchou.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bnVhd2hyZ3ljamRubWZjaG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIyNjQsImV4cCI6MjA3MDM2ODI2NH0.Qnbm899tvgPoJMuICqfv7HETkYqn8Z2qr14J1Uy-pEI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRLSUpdate() {
  const userId = '4b4899ca-171d-460a-b226-f401b1e2c55c'
  
  console.log('🔍 Testing RLS and permissions for update...')
  
  try {
    // 1. Test update without .single() to see how many rows are affected
    console.log('\n🔄 Step 1: Testing update without .single()...')
    const testUpdate = {
      business_name: `TM Hair Studio - Test ${new Date().toISOString().slice(11, 19)}`
    }
    
    const { data: updateDataArray, error: updateError1 } = await supabase
      .from('stylist_profiles')
      .update(testUpdate)
      .eq('user_id', userId)
      .select()
    
    if (updateError1) {
      console.log('❌ Error updating without .single():', updateError1)
    } else {
      console.log('✅ Update without .single() result:', JSON.stringify(updateDataArray, null, 2))
      console.log('📊 Number of rows affected:', updateDataArray?.length || 0)
    }
    
    // 2. Test different user authentication scenarios
    console.log('\n🔍 Step 2: Testing with different user context...')
    
    // Check if we're authenticated at all
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('❌ Auth error:', authError)
    } else {
      console.log('👤 Current authenticated user:', user ? user.id : 'No user authenticated')
      console.log('👤 User metadata:', user ? JSON.stringify(user.user_metadata, null, 2) : 'N/A')
    }
    
    // 3. Check RLS policies by trying a simple select with detailed filter
    console.log('\n🔍 Step 3: Testing RLS with select...')
    const { data: selectData, error: selectError } = await supabase
      .from('stylist_profiles')
      .select('id, user_id, business_name, updated_at')
      .eq('user_id', userId)
    
    if (selectError) {
      console.log('❌ Error with select:', selectError)
    } else {
      console.log('✅ Select result:', JSON.stringify(selectData, null, 2))
    }
    
    // 4. Try a different approach: check what the update query actually sees
    console.log('\n🔍 Step 4: Checking what update query can see...')
    const { count, error: countError } = await supabase
      .from('stylist_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (countError) {
      console.log('❌ Error getting count:', countError)
    } else {
      console.log('📊 Records visible to update query:', count)
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err)
  }
}

testRLSUpdate()