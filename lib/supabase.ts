// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sfrvslkjjxmmlzazxdwa.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmcnZzbGtqanhtbWx6YXp4ZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjkxNjcsImV4cCI6MjA4MDIwNTE2N30.80iAxwVr6PL6IN_pa50y_Z70nanFqhfKDlVBgckjVr0';

// Only create client if both URL and key are provided
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

