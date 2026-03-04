window.lmsConfig = {
  supabaseUrl: "https://vsxvojjqmryjncgrilku.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeHZvampxbXJ5am5jZ3JpbGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTIyMjQsImV4cCI6MjA4ODE4ODIyNH0.SayRUStP0bdnOjSZvg4xKmQNoRQ0cYxeLoe7rYp8L5s",
};

window.lmsSupabase = (() => {
  if (!window.supabase || !window.supabase.createClient) {
    throw new Error("Supabase SDK gagal dimuat.");
  }

  const { supabaseUrl, supabaseAnonKey } = window.lmsConfig;
  const missingConfig =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "YOUR_SUPABASE_URL" ||
    supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY";

  if (missingConfig) {
    throw new Error("Konfigurasi Supabase belum diisi di js/supabase-client.js");
  }

  return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
})();
