// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://spwptlyleyrokvvmjbsw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwd3B0bHlsZXlyb2t2dm1qYnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNzk1NDYsImV4cCI6MjA2MDY1NTU0Nn0.or3g6QUiMyjRDxjYA7_xebrQCTlxpb30Az1Z-T5Ujvk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);