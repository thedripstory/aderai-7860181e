// Supabase client wrapper for compatibility
// This wraps the existing Lovable Cloud Supabase client
import { supabase as lovableSupabase } from '@/integrations/supabase/client';

// Export the existing client for compatibility with your code
export const supabase = lovableSupabase;
