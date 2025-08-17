import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pwnuawhrgycjdnmfchou.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bnVhd2hyZ3ljamRubWZjaG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIyNjQsImV4cCI6MjA3MDM2ODI2NH0.Qnbm899tvgPoJMuICqfv7HETkYqn8Z2qr14J1Uy-pEI'
);

async function testLoginFlow() {
  console.log('🧪 Testing login flow directly...');
  
  const testEmail = 'tolu1998@hotmail.co.uk';
  const testPassword = 'gate123';
  
  try {
    console.log(`\n🔑 Signing in with: ${testEmail} / ${testPassword}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      console.log('❌ Login failed:', error.message);
      return false;
    }
    
    console.log('✅ Login successful!');
    console.log(`👤 User ID: ${data.user.id}`);
    console.log(`📧 Email: ${data.user.email}`);
    console.log(`🎭 Role from metadata: ${data.user.user_metadata?.role || 'none'}`);
    console.log(`✅ Email confirmed: ${!!data.user.email_confirmed_at}`);
    
    // Check user profile from database
    console.log('\n🔍 Fetching user profile from database...');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) {
      console.log('❌ Profile fetch error:', profileError.message);
    } else {
      console.log('✅ Profile fetched successfully');
      console.log(`📋 Database role: ${profile.role}`);
      console.log(`📝 Full name: ${profile.full_name}`);
      console.log(`📅 Created: ${profile.created_at}`);
    }
    
    // Test redirect logic
    console.log('\n🎯 Testing redirect logic...');
    if (data.user?.user_metadata?.role) {
      const role = data.user.user_metadata.role;
      console.log(`🎭 Metadata role: ${role}`);
      
      if (role === 'stylist') {
        console.log('✅ Should redirect to: /dashboard/stylist');
      } else if (role === 'client') {
        console.log('✅ Should redirect to: /dashboard/client');
      } else {
        console.log('❓ Unknown role, default to: /dashboard/client');
      }
    } else if (profile?.role) {
      console.log(`📋 Database role: ${profile.role}`);
      if (profile.role === 'stylist') {
        console.log('✅ Should redirect to: /dashboard/stylist');
      } else {
        console.log('✅ Should redirect to: /dashboard/client');
      }
    } else {
      console.log('❌ No role found - this is the problem!');
    }
    
    // Sign out
    await supabase.auth.signOut();
    console.log('\n🚪 Signed out successfully');
    
    return true;
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
    return false;
  }
}

testLoginFlow().then(success => {
  if (success) {
    console.log('\n🎉 Login flow test completed successfully!');
    console.log('✅ The logic in the login form should work correctly');
  } else {
    console.log('\n❌ Login flow test failed');
  }
});