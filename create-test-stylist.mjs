import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pwnuawhrgycjdnmfchou.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bnVhd2hyZ3ljamRubWZjaG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIyNjQsImV4cCI6MjA3MDM2ODI2NH0.Qnbm899tvgPoJMuICqfv7HETkYqn8Z2qr14J1Uy-pEI'
);

async function createTestStylist() {
  console.log('🔧 Creating test stylist account...');
  
  const testEmail = 'test.stylist123@gmail.com';
  const testPassword = 'TestPass123!';
  
  try {
    // Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'stylist',
          full_name: 'Test Stylist'
        }
      }
    });
    
    if (error) {
      console.log('❌ Error creating account:', error.message);
      
      // Try to sign in if account already exists
      console.log('🔑 Trying to sign in with existing account...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        console.log('❌ Sign in failed:', signInError.message);
        return false;
      } else {
        console.log('✅ Successfully signed in with existing account');
        console.log(`📧 Email: ${testEmail}`);
        console.log(`🔑 Password: ${testPassword}`);
        return { email: testEmail, password: testPassword };
      }
    } else {
      console.log('✅ Test account created successfully!');
      console.log(`📧 Email: ${testEmail}`);
      console.log(`🔑 Password: ${testPassword}`);
      console.log(`👤 User ID: ${data.user.id}`);
      
      // Wait a moment then check if user was added to users table by trigger
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (userError) {
        console.log('❌ User profile not found in database:', userError.message);
      } else {
        console.log('✅ User profile created in database');
        console.log(`📋 Role: ${userData.role}`);
      }
      
      // Check stylist profile
      const { data: stylistData, error: stylistError } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      if (stylistError) {
        console.log('❌ Stylist profile not found:', stylistError.message);
      } else {
        console.log('✅ Stylist profile created');
        console.log(`🏢 Business: ${stylistData.business_name}`);
      }
      
      return { email: testEmail, password: testPassword };
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
    return false;
  }
}

createTestStylist().then(result => {
  if (result) {
    console.log('\n🎉 Test stylist account ready!');
    console.log(`📧 Email: ${result.email}`);
    console.log(`🔑 Password: ${result.password}`);
    console.log('\n🔗 You can now test login at: http://localhost:3000/login');
  } else {
    console.log('\n❌ Failed to create test account');
  }
});