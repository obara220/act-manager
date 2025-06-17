import { createClient } from "@supabase/supabase-js";

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error("Missing REACT_APP_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing REACT_APP_SUPABASE_ANON_KEY environment variable");
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export configuration for debugging
export const supabaseConfig = {
  url: supabaseUrl,
  environment: process.env.REACT_APP_ENVIRONMENT || "development",
  // Don't export the key for security
};
