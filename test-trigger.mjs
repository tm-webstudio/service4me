import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTrigger() {
  console.log('Testing stylist profile auto-creation trigger...');
  
  try {
    // Generate a test user ID
    const testUserId = crypto.randomUUID();
    const testEmail = `trigger.test.${Date.now()}@gmail.com`;
    
    console.log('1. Creating stylist user record...');
    
    // Insert a stylist user directly into the users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: testEmail,
        full_name: 'Trigger Test Stylist',
        role: 'stylist',
        phone: '020-9876-5432'
      });

    if (userError) {
      console.error('User creation error:', userError);
      return;
    }

    console.log('✓ Stylist user created with ID:', testUserId);

    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if stylist profile was auto-created
    console.log('2. Checking if stylist profile was auto-created...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('stylist_profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (profileError) {
      console.error('❌ Profile not found or error:', profileError);
      return;
    }

    console.log('✅ SUCCESS! Stylist profile was auto-created:');
    console.log('  - Profile ID:', profileData.id);
    console.log('  - Business name:', profileData.business_name);
    console.log('  - Location:', profileData.location);
    console.log('  - Bio:', profileData.bio);
    console.log('  - Specialties:', profileData.specialties);
    console.log('  - Years experience:', profileData.years_experience);
    console.log('  - Hourly rate:', profileData.hourly_rate);
    console.log('  - Verified:', profileData.is_verified);

    console.log('\n🎉 Trigger test completed successfully!');

    // Clean up test data
    console.log('\n3. Cleaning up test data...');
    await supabase.from('stylist_profiles').delete().eq('user_id', testUserId);
    await supabase.from('users').delete().eq('id', testUserId);
    console.log('✓ Test data cleaned up');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testTrigger();