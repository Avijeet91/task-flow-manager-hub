
-- Function to get an employee by email
CREATE OR REPLACE FUNCTION public.get_employee_by_email(email_param TEXT)
RETURNS TABLE (
  id UUID,
  employee_id TEXT,
  name TEXT,
  email TEXT,
  password TEXT,
  position TEXT,
  department TEXT,
  join_date DATE,
  contact TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    id,
    employee_id,
    name,
    email,
    password,
    position,
    department,
    join_date,
    contact
  FROM public.employees
  WHERE email = email_param
  LIMIT 1;
$$;

-- Function to get all employees
CREATE OR REPLACE FUNCTION public.get_all_employees()
RETURNS TABLE (
  id UUID,
  employee_id TEXT,
  name TEXT,
  email TEXT,
  position TEXT,
  department TEXT,
  join_date DATE,
  contact TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    id,
    employee_id,
    name,
    email,
    position,
    department,
    join_date,
    contact
  FROM public.employees
  ORDER BY name;
$$;

-- Function to add a new employee
CREATE OR REPLACE FUNCTION public.add_employee(
  employee_id_param TEXT,
  name_param TEXT,
  email_param TEXT,
  password_param TEXT,
  position_param TEXT,
  department_param TEXT,
  join_date_param DATE,
  contact_param TEXT
)
RETURNS TABLE (
  id UUID,
  employee_id TEXT,
  name TEXT,
  email TEXT,
  position TEXT,
  department TEXT,
  join_date DATE,
  contact TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.employees (
    employee_id,
    name,
    email,
    password,
    position,
    department,
    join_date,
    contact
  ) VALUES (
    employee_id_param,
    name_param,
    email_param,
    password_param,
    position_param,
    department_param,
    join_date_param,
    contact_param
  )
  RETURNING id INTO new_id;
  
  RETURN QUERY SELECT 
    e.id,
    e.employee_id,
    e.name,
    e.email,
    e.position,
    e.department,
    e.join_date,
    e.contact
  FROM public.employees e
  WHERE e.id = new_id;
END;
$$;

-- Function to update an employee
CREATE OR REPLACE FUNCTION public.update_employee(
  employee_id_param TEXT,
  name_param TEXT DEFAULT NULL,
  email_param TEXT DEFAULT NULL,
  position_param TEXT DEFAULT NULL,
  department_param TEXT DEFAULT NULL,
  join_date_param DATE DEFAULT NULL,
  contact_param TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.employees
  SET
    name = COALESCE(name_param, name),
    email = COALESCE(email_param, email),
    position = COALESCE(position_param, position),
    department = COALESCE(department_param, department),
    join_date = COALESCE(join_date_param, join_date),
    contact = COALESCE(contact_param, contact),
    updated_at = now()
  WHERE employee_id = employee_id_param;
END;
$$;

-- Function to delete an employee
CREATE OR REPLACE FUNCTION public.delete_employee(
  employee_id_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.employees
  WHERE employee_id = employee_id_param;
END;
$$;

-- Function to get all tasks with their comments
CREATE OR REPLACE FUNCTION public.get_all_tasks()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  assigned_to TEXT,
  assigned_to_name TEXT,
  assigned_by TEXT,
  assigned_by_name TEXT,
  status TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  progress INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    id,
    title,
    description,
    assigned_to,
    assigned_to_name,
    assigned_by,
    assigned_by_name,
    status,
    priority,
    created_at,
    due_date,
    completed_at,
    progress
  FROM public.tasks
  ORDER BY created_at DESC;
$$;

-- Function to get all task comments
CREATE OR REPLACE FUNCTION public.get_all_task_comments()
RETURNS TABLE (
  id UUID,
  task_id UUID,
  user_id TEXT,
  user_name TEXT,
  text TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    id,
    task_id,
    user_id,
    user_name,
    text,
    created_at
  FROM public.task_comments
  ORDER BY created_at;
$$;

-- Function to add a new task
CREATE OR REPLACE FUNCTION public.add_task(
  title_param TEXT,
  description_param TEXT,
  assigned_to_param TEXT,
  assigned_to_name_param TEXT,
  assigned_by_param TEXT,
  assigned_by_name_param TEXT,
  status_param TEXT,
  priority_param TEXT,
  due_date_param TIMESTAMPTZ,
  progress_param INTEGER
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  assigned_to TEXT,
  assigned_to_name TEXT,
  assigned_by TEXT,
  assigned_by_name TEXT,
  status TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  progress INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.tasks (
    title,
    description,
    assigned_to,
    assigned_to_name,
    assigned_by,
    assigned_by_name,
    status,
    priority,
    due_date,
    progress
  ) VALUES (
    title_param,
    description_param,
    assigned_to_param,
    assigned_to_name_param,
    assigned_by_param,
    assigned_by_name_param,
    status_param,
    priority_param,
    due_date_param,
    progress_param
  )
  RETURNING id INTO new_id;
  
  RETURN QUERY SELECT 
    t.id,
    t.title,
    t.description,
    t.assigned_to,
    t.assigned_to_name,
    t.assigned_by,
    t.assigned_by_name,
    t.status,
    t.priority,
    t.created_at,
    t.due_date,
    t.completed_at,
    t.progress
  FROM public.tasks t
  WHERE t.id = new_id;
END;
$$;

-- Function to update a task
CREATE OR REPLACE FUNCTION public.update_task(
  task_id_param UUID,
  title_param TEXT DEFAULT NULL,
  description_param TEXT DEFAULT NULL,
  status_param TEXT DEFAULT NULL,
  priority_param TEXT DEFAULT NULL,
  due_date_param TIMESTAMPTZ DEFAULT NULL,
  completed_at_param TIMESTAMPTZ DEFAULT NULL,
  progress_param INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tasks
  SET
    title = COALESCE(title_param, title),
    description = COALESCE(description_param, description),
    status = COALESCE(status_param, status),
    priority = COALESCE(priority_param, priority),
    due_date = COALESCE(due_date_param, due_date),
    completed_at = COALESCE(completed_at_param, completed_at),
    progress = COALESCE(progress_param, progress),
    updated_at = now()
  WHERE id = task_id_param;
END;
$$;

-- Function to update task progress and potentially status
CREATE OR REPLACE FUNCTION public.update_task_progress(
  task_id_param UUID,
  progress_param INTEGER,
  status_param TEXT DEFAULT NULL,
  completed_at_param TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tasks
  SET
    progress = progress_param,
    status = COALESCE(status_param, status),
    completed_at = CASE 
                     WHEN status_param = 'completed' THEN COALESCE(completed_at_param, now()) 
                     ELSE completed_at 
                   END,
    updated_at = now()
  WHERE id = task_id_param;
END;
$$;

-- Function to add a task comment
CREATE OR REPLACE FUNCTION public.add_task_comment(
  task_id_param UUID,
  user_id_param TEXT,
  user_name_param TEXT,
  text_param TEXT
)
RETURNS TABLE (
  id UUID,
  task_id UUID,
  user_id TEXT,
  user_name TEXT,
  text TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.task_comments (
    task_id,
    user_id,
    user_name,
    text
  ) VALUES (
    task_id_param,
    user_id_param,
    user_name_param,
    text_param
  )
  RETURNING id INTO new_id;
  
  RETURN QUERY SELECT 
    c.id,
    c.task_id,
    c.user_id,
    c.user_name,
    c.text,
    c.created_at
  FROM public.task_comments c
  WHERE c.id = new_id;
END;
$$;

-- Function to delete a task
CREATE OR REPLACE FUNCTION public.delete_task(
  task_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.tasks
  WHERE id = task_id_param;
END;
$$;
