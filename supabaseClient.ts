
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzuviwgvgnlhtjmypyob.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dXZpd2d2Z25saHRqbXlweW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzODU5NDYsImV4cCI6MjA1Njk2MTk0Nn0.2T01mU_pLgP36tU_nSOfY0p205D6nF8_8-V6l-3x-oE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
