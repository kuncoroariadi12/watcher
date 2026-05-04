import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://guiwhqfmbuqtqundlpea.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1aXdocWZtYnVxdHF1bmRscGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1ODAxMDUsImV4cCI6MjA5MTE1NjEwNX0.odTDVFtpzkKdGMz_N-sf0WeVUC3mqjtwbzn4bUTAD44'

export const supabase = createClient(supabaseUrl, supabaseKey)