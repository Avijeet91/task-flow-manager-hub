
// This script creates an employee user in the system
// Run it manually or adapt it to a Supabase Edge Function if needed

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://egmpjdejaeeybvqxuzax.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "YOUR_SERVICE_ROLE_KEY"; // DO NOT COMMIT THIS!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createEmployeeUser() {
  try {
    // 1. Create auth user
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'john@example.com',
      password: 'john123',
      email_confirm: true,
      user_metadata: {
        first_name: 'John',
        last_name: 'Doe',
        employee_id: 'EMP001',
        position: 'Software Developer',
        department: 'Engineering'
      }
    });
    
    if (createError) {
      throw createError;
    }
    
    // 2. Assign employee role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'employee'
      });
      
    if (roleError) {
      throw roleError;
    }
    
    console.log('Employee user created successfully:', authUser.user.email);
  } catch (err) {
    console.error('Failed to create employee user:', err);
  }
}

// Uncomment to run
// createEmployeeUser();
