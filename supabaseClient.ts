
import { createClient } from '@supabase/supabase-js';

// URL do Projeto e Chave ANON do Supabase atualizados com os valores fornecidos
const supabaseUrl = 'https://wzuviwgvgnlhtjmypyob.supabase.co'.trim();
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dXZpd2d2Z25saHRqbXlweW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTYwMTMsImV4cCI6MjA4NDQ3MjAxM30.h5gy9uz-qPGuvlz2uPmXkc42tL_vVssiofmbcD8-XVQ'.trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
