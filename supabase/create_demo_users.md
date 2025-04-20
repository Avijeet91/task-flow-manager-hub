
# Setting Up Demo Users in Supabase

This guide will help you set up demo users in your Supabase project. We'll create two demo users:
1. Admin user (admin@example.com)
2. Employee user (john@example.com)

## Steps

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/egmpjdejaeeybvqxuzax

2. Navigate to Authentication > Users

3. Click "Add User" button

4. For Admin User:
   - Email: admin@example.com
   - Password: admin123
   - Metadata (click "Edit" on metadata):
   ```json
   {
     "first_name": "Admin",
     "last_name": "User",
     "employee_id": "ADMIN001",
     "position": "Administrator",
     "department": "Management"
   }
   ```
   - Click "Create User"

5. After creating the Admin user, find their UUID in the users list

6. Go to the SQL Editor in Supabase

7. Insert admin role for the user:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('admin-user-uuid-here', 'admin');
   ```

8. For Employee User:
   - Email: john@example.com
   - Password: john123
   - Metadata (click "Edit" on metadata):
   ```json
   {
     "first_name": "John",
     "last_name": "Doe",
     "employee_id": "EMP001",
     "position": "Software Developer", 
     "department": "Engineering"
   }
   ```
   - Click "Create User"

9. After creating the Employee user, find their UUID in the users list

10. Insert employee role for the user:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('employee-user-uuid-here', 'employee');
   ```

11. Optional: Disable email confirmation in Authentication > Settings > Auth Providers to simplify testing

## Verification

1. Try logging in as admin@example.com/admin123
2. Verify the admin can access the Employees page
3. Try logging in as john@example.com/john123
4. Verify the employee cannot access the Employees page

If you have any issues, check the Supabase dashboard for error logs.
