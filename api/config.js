// =============================================================================
// Vercel Serverless Function: Expose Public Environment Variables
// Safely provides VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY from Vercel Settings
// =============================================================================

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  // Only expose client-safe public keys, NEVER service_role
  return res.status(200).json({
    supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
  });
}
