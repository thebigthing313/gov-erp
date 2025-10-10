import { createMCMECClient } from '@/lib/supabase'

export function getContext() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  const supabase = createMCMECClient(supabaseUrl, supabaseKey)
  return {
    supabase,
  }
}
