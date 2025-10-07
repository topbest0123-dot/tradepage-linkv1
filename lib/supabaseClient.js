import { createClient } from '@supabase/supabase-js'

// Ion's project (you gave these)
const supabaseUrl = 'https://ezwvavoikoirrvxujnfm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6d3Zhdm9pa29pcnJ2eHVqbmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODc3NzgsImV4cCI6MjA3NTA2Mzc3OH0.6F4rDAMNrBRivWSos88Emb39gBChQCd37YSyizm5bYk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
