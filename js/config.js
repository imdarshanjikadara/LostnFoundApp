// ==========================================================================
// Tivoli Lost & Found — Client Configuration
// ==========================================================================
// This file is safe to commit to GitHub / Version Control.
// Sensitive keys are NOT stored here. They are loaded securely from:
// 1. Local development: .env file (auto-loaded, protected by .gitignore)
// 2. Production (Vercel): Vercel Dashboard -> Environment Variables (/api/config)
// 3. Desk Admin Console: In-app Supabase Cloud settings (saved to localStorage)
// ==========================================================================

window.LNF_CONFIG = window.LNF_CONFIG || {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: ""
};

// Global aliases
window.VITE_SUPABASE_URL = window.LNF_CONFIG.SUPABASE_URL || "";
window.VITE_SUPABASE_ANON_KEY = window.LNF_CONFIG.SUPABASE_ANON_KEY || "";
