
// This is a one-time script to be run after setting up the new auth system
// It migrates existing users from the employees table to Supabase Auth
// Run it manually or adapt it to a Supabase Edge Function if needed

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const SUPABASE_URL = "https://egmpjdejaeeybvqxuzax.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "YOUR_SERVICE_ROLE_KEY"; // DO NOT COMMIT THIS!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Function to create auth users from employees
async function migrateUsers() {
  try {
    // Get all employees from the employees table
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${employees.length} employees to migrate`);
    
    // Process each employee
    for (const employee of employees) {
      try {
        // 1. Create auth user
        const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
          email: employee.email,
          password: 'tempPassword123', // You might want to generate this or use their existing password
          email_confirm: true,
          user_metadata: {
            first_name: employee.name.split(' ')[0] || '',
            last_name: employee.name.split(' ').slice(1).join(' ') || '',
            employee_id: employee.employee_id,
            position: employee.position,
            department: employee.department || ''
          }
        });
        
        if (createError) {
          console.error(`Error creating auth user for ${employee.email}:`, createError);
          continue;
        }
        
        // 2. Assign role
        const isAdmin = employee.position === 'Administrator';
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authUser.user.id,
            role: isAdmin ? 'admin' : 'employee'
          });
          
        if (roleError) {
          console.error(`Error assigning role for ${employee.email}:`, roleError);
        }
        
        console.log(`Successfully migrated ${employee.email} as ${isAdmin ? 'admin' : 'employee'}`);
      } catch (userError) {
        console.error(`Error processing employee ${employee.email}:`, userError);
      }
    }
    
    console.log('Migration completed');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

// Uncomment to run the migration
// migrateUsers();
