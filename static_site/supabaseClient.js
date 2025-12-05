import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://edzqjailcajqxwxjxidg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkenFqYWlsY2FqcXh3eGp4aWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTE2NTQsImV4cCI6MjA3NjYyNzY1NH0.BKKCyEjW-l_CpOMKnpuAPO9ZCuBSL0Hr2lgAZjIeqb0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
