
// This script creates an admin user in the system
// Run it manually or adapt it to a Supabase Edge Function if needed

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://egmpjdejaeeybvqxuzax.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "YOUR_SERVICE_ROLE_KEY"; // DO NOT COMMIT THIS!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAdminUser() {
  try {
    // 1. Create auth user
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User',
        employee_id: 'ADMIN001',
        position: 'Administrator',
        department: 'Management'
      }
    });
    
    if (createError) {
      throw createError;
    }
    
    // 2. Assign admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'admin'
      });
      
    if (roleError) {
      throw roleError;
    }
    
    console.log('Admin user created successfully:', authUser.user.email);
  } catch (err) {
    console.error('Failed to create admin user:', err);
  }
}

// Uncomment to run
// createAdminUser();
