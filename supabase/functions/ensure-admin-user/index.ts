
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables are automatically available
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

Deno.serve(async (req) => {
  try {
    // Check if admin user exists
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 10,
    });

    if (searchError) {
      throw searchError;
    }

    const adminExists = existingUsers.users.some(user => 
      user.email === "admin@example.com"
    );

    if (adminExists) {
      return new Response(JSON.stringify({ message: "Admin user already exists" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create admin user if doesn't exist
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@example.com",
      password: "admin123",
      email_confirm: true,
      user_metadata: {
        first_name: "Admin",
        last_name: "User",
        employee_id: "ADMIN001",
        position: "Administrator",
        department: "Management"
      }
    });
    
    if (createError) {
      throw createError;
    }
    
    // Assign admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'admin'
      });
      
    if (roleError) {
      throw roleError;
    }
    
    return new Response(JSON.stringify({ message: "Admin user created successfully", user: authUser.user.email }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
