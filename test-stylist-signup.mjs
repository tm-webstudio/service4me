import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStylistSignup() {
  console.log('Testing stylist signup and profile creation...');
  
  // Generate unique email for testing
  const testEmail = `stylist.test.${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    // Step 1: Sign up as stylist
    console.log('1. Creating stylist account...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'stylist',
          full_name: 'Test Stylist',
          phone: '020-1234-5678'
        }
      }
    });

    if (signupError) {
      console.error('Signup error:', signupError);
      return;
    }

    console.log('✓ Signup successful, user ID:', signupData.user?.id);

    // Step 2: Create user profile if user was created and confirmed
    if (signupData.user && (signupData.user.email_confirmed_at || !signupData.user.confirmation_sent_at)) {
      console.log('2. Creating user profile...');
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: signupData.user.id,
          email: signupData.user.email,
          full_name: 'Test Stylist',
          role: 'stylist',
          phone: '020-1234-5678'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return;
      }

      console.log('✓ User profile created');

      // Step 3: Update stylist profile with specific data
      console.log('3. Updating stylist profile...');
      const { error: stylistUpdateError } = await supabase
        .from('stylist_profiles')
        .update({
          business_name: 'Test Hair Studio',
          location: 'London, UK'
        })
        .eq('user_id', signupData.user.id);

      if (stylistUpdateError) {
        console.error('Stylist profile update error:', stylistUpdateError);
        return;
      }

      console.log('✓ Stylist profile updated');

      // Step 4: Verify profile was created
      console.log('4. Verifying stylist profile...');
      const { data: profileData, error: verifyError } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', signupData.user.id)
        .single();

      if (verifyError) {
        console.error('Verification error:', verifyError);
        return;
      }

      console.log('✓ Stylist profile verified:');
      console.log('  - Business name:', profileData.business_name);
      console.log('  - Location:', profileData.location);
      console.log('  - Bio:', profileData.bio);
      console.log('  - Specialties:', profileData.specialties);
      console.log('  - Years experience:', profileData.years_experience);
      console.log('  - Hourly rate:', profileData.hourly_rate);

      console.log('\n🎉 Test completed successfully! Profile auto-creation working.');
    } else {
      console.log('⚠️  User created but email confirmation required. Check your email.');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStylistSignup();