import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testManualStylistCreation() {
  console.log('Testing manual stylist account creation with profile auto-creation...');
  
  // Generate unique email for testing
  const testEmail = `manual.stylist.${Date.now()}@gmail.com`;
  
  try {
    console.log('\n1. Creating stylist account through auth...');
    
    // This simulates what happens when someone signs up but bypasses the email confirmation requirement
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          role: 'stylist',
          full_name: 'Manual Test Stylist',
          phone: '020-1111-2222'
        },
        emailRedirectTo: undefined // Disable email confirmation for testing
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return;
    }

    console.log('✓ Auth user created:', authData.user?.id);

    if (authData.user) {
      console.log('\n2. Manually creating user profile (simulating confirmed email)...');
      
      // Manually create the user profile as the auth system would do after email confirmation
      // This will trigger our stylist profile creation
      const { error: profileError } = await supabase.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true }
      );

      if (profileError) {
        console.log('Could not confirm email, trying direct approach...');
        
        // Direct approach - sign in to get an authenticated session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: 'TestPassword123!'
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          return;
        }

        console.log('✓ Signed in successfully');

        // Now create the user profile while authenticated
        const { error: userInsertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: 'Manual Test Stylist',
            role: 'stylist',
            phone: '020-1111-2222'
          });

        if (userInsertError) {
          console.error('User profile creation error:', userInsertError);
          return;
        }

        console.log('✓ User profile created manually');
      }

      // Wait a moment for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('\n3. Checking if stylist profile was auto-created...');
      
      const { data: profileData, error: checkError } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (checkError) {
        console.error('❌ Profile check error:', checkError);
        return;
      }

      console.log('✅ SUCCESS! Stylist profile auto-created:');
      console.log('  - Profile ID:', profileData.id);
      console.log('  - Business name:', profileData.business_name);
      console.log('  - Location:', profileData.location);
      console.log('  - Bio:', profileData.bio);
      console.log('  - Specialties:', profileData.specialties);
      console.log('  - Years experience:', profileData.years_experience);
      console.log('  - Hourly rate:', profileData.hourly_rate);

      console.log('\n🎉 Manual test completed successfully! Auto-creation is working.');

      // Clean up test data
      console.log('\n4. Cleaning up test data...');
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.log('✓ Test user cleaned up');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testManualStylistCreation();