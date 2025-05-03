import { createClient } from "@supabase/supabase-js";

// Essas variáveis devem ser definidas no seu .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Cria um cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
