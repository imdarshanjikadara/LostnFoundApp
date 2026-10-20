// ==========================================================================
// Component: Staff & Admin Secure Sign-In Portal
// Replaces simple PIN with enterprise authentication & anti-brute-force defense
// ==========================================================================
window.LNF = window.LNF || {};

window.LNF.StaffSignInModal = function StaffSignInModal({
  onLoginSuccess,
  users
}) {
  const { security } = window.LNF;
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [lockoutSeconds, setLockoutSeconds] = React.useState(0);

  // Check rate limit on mount and periodically if locked out
  React.useEffect(() => {
    const rateCheck = security.checkLoginRateLimit();
    if (!rateCheck.allowed) {
      setLockoutSeconds(rateCheck.remainingSeconds);
    }
  }, []);

  React.useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setErrorMsg('');
    setLoading(true);

    try {
      const cleanIdentifier = identifier.trim().toLowerCase();
      const enteredHash = await security.hashPassword(password);

      // Find matching user
      const user = users.find(u => 
        u.identifier.toLowerCase() === cleanIdentifier && u.status === 'active'
      );

      if (user && user.passwordHash === enteredHash) {
        security.resetLoginAttempts();
        // Generate secure session token and timestamp
        const sessionToken = security.generateSessionToken();
        const userInitials = (window.LNF.getUserInitials ? window.LNF.getUserInitials(user) : (user.initials || 'ST')).toUpperCase();
        const sessionPayload = {
          token: sessionToken,
          userId: user.id,
          name: user.name,
          identifier: user.identifier,
          initials: userInitials,
          role: user.role,
          expiresAt: Date.now() + 8 * 60 * 60 * 1000 // 8 hour active shift
        };
        sessionStorage.setItem('tivoli_auth_session', JSON.stringify(sessionPayload));
        localStorage.setItem('tivoli_staff_initials', userInitials);
        onLoginSuccess(sessionPayload);
      } else {
        const lockout = security.recordFailedLogin();
        if (lockout > 0) {
          setLockoutSeconds(lockout);
          setErrorMsg(`Too many failed attempts. Login locked for ${lockout}s.`);
        } else {
          setErrorMsg('Invalid Staff ID / Email or Password. Please check credentials.');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMsg('An authentication error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoIdentifier, demoPassword) => {
    setIdentifier(demoIdentifier);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00368C] via-[#0047BA] to-[#082046] flex flex-col justify-between items-center py-8 px-4 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] text-white selection:bg-[#C2EC00] selection:text-black">
      {/* Auraria Campus Top Lime Banner */}
      <div className="w-full max-w-md mx-auto bg-[#C2EC00] text-zinc-950 text-[11px] font-bold px-3 py-1.5 rounded-full text-center shadow-md flex items-center justify-center gap-1.5 tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-blue-700 animate-pulse"></span>
        <span>Auraria Higher Education Center • Staff Authentication Portal</span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-900 my-auto border border-white/20 animate-sheet-up">
        {/* Brand Header inside card */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 mb-3 rounded-2xl bg-[#0047BA] shadow-apple-sm flex items-center justify-center">
            <img
              src="./auraria-logo-white-062824.svg"
              alt="Auraria Campus"
              className="h-8 w-auto object-contain"
            />
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight uppercase">
            ID Station Staff Sign-In
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Tivoli Student Union • Lost & Found Desk
          </p>
        </div>

        {/* Error / Lockout Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-semibold flex items-center gap-2">
            <window.LNF.Icons.AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {lockoutSeconds > 0 && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <window.LNF.Icons.Lock className="w-4 h-4 text-amber-700" />
              <span>Security Lockout Active</span>
            </span>
            <span className="bg-amber-200 px-2 py-0.5 rounded text-[11px]">{lockoutSeconds}s</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
              Staff Email / Station ID
            </label>
            <input
              type="text"
              required
              disabled={lockoutSeconds > 0}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@auraria.edu"
              className="w-full px-3.5 py-2.5 bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white rounded-xl border border-zinc-200 text-zinc-900 focus:border-[#0047BA] focus:ring-4 focus:ring-blue-500/15 outline-none transition-all text-[16px]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-semibold text-[#0047BA] hover:underline"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={lockoutSeconds > 0}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white rounded-xl border border-zinc-200 text-zinc-900 focus:border-[#0047BA] focus:ring-4 focus:ring-blue-500/15 outline-none transition-all text-[16px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutSeconds > 0}
            className="w-full py-3.5 bg-[#0047BA] hover:bg-[#00368C] disabled:bg-zinc-300 text-white rounded-xl font-bold text-sm shadow-sm border border-black/10 active:scale-[0.98] transition-all duration-150 min-h-[48px] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <window.LNF.Icons.Spinner className="w-4 h-4 text-white" />
            ) : (
              <span>Secure Sign In</span>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials for Fast Testing */}
        <div className="mt-6 pt-4 border-t border-zinc-100">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-center mb-2">
            Quick Staff Testing Roles
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('admin@auraria.edu', 'Admin2026!')}
              className="p-2 text-left bg-blue-50/70 hover:bg-blue-100/70 rounded-xl border border-blue-200/60 active:scale-[0.98] transition-all text-xs"
            >
              <div className="font-bold text-[#0047BA] flex items-center gap-1.5">
                <window.LNF.Icons.Crown className="w-3.5 h-3.5 text-[#0047BA]" />
                <span>Admin Access</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5 truncate">admin@auraria.edu</p>
            </button>

            <button
              type="button"
              onClick={() => fillQuickDemo('maya.staff@auraria.edu', 'Staff2026!')}
              className="p-2 text-left bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-200 active:scale-[0.98] transition-all text-xs"
            >
              <div className="font-bold text-zinc-800 flex items-center gap-1.5">
                <window.LNF.Icons.IdCard className="w-3.5 h-3.5 text-zinc-700" />
                <span>Staff Access</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5 truncate">maya.staff@auraria.edu</p>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-blue-200/80">
        <p>Auraria Campus Lost & Found System • Role-Based Protected</p>
      </div>
    </div>
  );
};
