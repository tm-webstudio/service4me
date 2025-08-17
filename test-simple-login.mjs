import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pwnuawhrgycjdnmfchou.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bnVhd2hyZ3ljamRubWZjaG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIyNjQsImV4cCI6MjA3MDM2ODI2NH0.Qnbm899tvgPoJMuICqfv7HETkYqn8Z2qr14J1Uy-pEI'
);

async function testLogin() {
  console.log('🔧 Testing login with different password combinations...');
  
  const testEmails = [
    'tolu1998@hotmail.co.uk',
    'tmwebstudio1@gmail.com'
  ];
  
  const testPasswords = [
    'password123',
    'Password123',
    'Password123!',
    'password',
    'Passw0rd!',
    '123456789',
    'password1'
  ];
  
  for (const email of testEmails) {
    console.log(`\n📧 Testing email: ${email}`);
    
    for (const password of testPasswords) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.log(`  ❌ ${password}: ${error.message}`);
        } else {
          console.log(`  ✅ ${password}: SUCCESS!`);
          console.log(`     👤 User ID: ${data.user.id}`);
          console.log(`     🎭 Role: ${data.user.user_metadata.role}`);
          
          // Try to get user profile from database
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileError) {
            console.log(`     ❌ Profile fetch error: ${profileError.message}`);
          } else {
            console.log(`     📋 Profile role: ${profile.role}`);
          }
          
          // Sign out after successful test
          await supabase.auth.signOut();
          return { email, password, success: true };
        }
      } catch (err) {
        console.log(`  ❌ ${password}: ${err.message}`);
      }
    }
  }
  
  return { success: false };
}

testLogin().then(result => {
  if (result.success) {
    console.log(`\n🎉 Found working credentials: ${result.email} / ${result.password}`);
  } else {
    console.log('\n❌ No working credentials found. You may need to create a new account.');
  }
});