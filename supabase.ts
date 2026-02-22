import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dvbwqiqadasliajpmpwk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YndxaXFhZGFzbGlhanBtcHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODU5NTEsImV4cCI6MjA4NjE2MTk1MX0.01zeykC9o0Emz3xxFhQSInNGzm7sTnYlUNmp8Bmtu1o';

export const supabase = createClient(supabaseUrl, supabaseKey);