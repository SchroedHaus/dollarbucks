// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ykzgmsckdwwhcequqabm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlremdtc2NrZHd3aGNlcXVxYWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjgzNTEsImV4cCI6MjA2NTc0NDM1MX0.ezrAJsg6qaS1nxjoKTO8d3gTZgu7d_MBXb4-4Z2knP0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
