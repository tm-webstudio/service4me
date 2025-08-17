import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pwnuawhrgycjdnmfchou.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bnVhd2hyZ3ljamRubWZjaG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIyNjQsImV4cCI6MjA3MDM2ODI2NH0.Qnbm899tvgPoJMuICqfv7HETkYqn8Z2qr14J1Uy-pEI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCurrentState() {
  const userId = '4b4899ca-171d-460a-b226-f401b1e2c55c'
  
  console.log('🔍 Checking current database state...')
  
  try {
    const { data, error } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.log('❌ Error fetching profile:', error)
      return
    }
    
    console.log('📊 Current profile state:')
    console.log('  Business Name:', data.business_name)
    console.log('  Bio:', data.bio)
    console.log('  Location:', data.location)
    console.log('  Years Experience:', data.years_experience)
    console.log('  Hourly Rate:', data.hourly_rate)
    console.log('  Updated At:', data.updated_at)
    console.log('  Specialties:', JSON.stringify(data.specialties))
    
    console.log('\n🕐 Run this script again after attempting to save in the browser to see if anything changed.')
    
  } catch (err) {
    console.log('❌ Unexpected error:', err)
  }
}

checkCurrentState()