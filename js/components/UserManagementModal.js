// ==========================================================================
// Component: Admin User & Staff Management Console
// Role-Protected (Admin Only): Manage student staff, credentials, & promote admins
// ==========================================================================
window.LNF = window.LNF || {};

window.LNF.UserManagementModal = function UserManagementModal({
  currentUser,
  users,
  onClose,
  onCreateUser,
  onToggleRole,
  onDeleteUser,
  onResetPassword
}) {
  const { security } = window.LNF;
  const [isAddingUser, setIsAddingUser] = React.useState(false);
  const [resettingUserId, setResettingUserId] = React.useState(null);
  const [newPassword, setNewPassword] = React.useState('');

  const [name, setName] = React.useState('');
  const [identifier, setIdentifier] = React.useState('');
  const [initials, setInitials] = React.useState('');
  const [initialsEdited, setInitialsEdited] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState('staff');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState('');

  // Supabase Configuration State
  const supabaseService = window.LNF.supabaseService;
  const [supaUrl, setSupaUrl] = React.useState(() => supabaseService?.getSupabaseUrl() || '');
  const [supaKey, setSupaKey] = React.useState(() => supabaseService?.getSupabaseAnonKey() || '');
  const [isSupaConnected, setIsSupaConnected] = React.useState(() => supabaseService?.isConfigured() || false);
  const [testingSupa, setTestingSupa] = React.useState(false);

  const handleSaveSupabase = async (e) => {
    e.preventDefault();
    if (!supaUrl.trim() || !supaKey.trim()) {
      setErrorMsg('Please enter both Supabase Project URL and public Anon Key.');
      return;
    }
    setTestingSupa(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      supabaseService.saveConfig(supaUrl.trim(), supaKey.trim());
      const items = await supabaseService.fetchItems();
      setIsSupaConnected(true);
      setSuccessMsg('Successfully connected to Supabase! Reloading live inventory...');
      setTimeout(() => { window.location.reload(); }, 1200);
    } catch (err) {
      console.error('Supabase test failed:', err);
      setErrorMsg('Supabase connection failed: ' + (err.message || 'Check URL and Anon Key.'));
      setIsSupaConnected(false);
    } finally {
      setTestingSupa(false);
    }
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!initialsEdited) {
      const autoInit = (window.LNF.getUserInitials 
        ? window.LNF.getUserInitials({ name: val }) 
        : val.trim().split(/\s+/).filter(Boolean).map(n => n[0]).join('').slice(0, 4)
      ).toUpperCase();
      setInitials(autoInit);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !identifier.trim() || !password.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    // Check if identifier already exists
    const cleanId = identifier.trim().toLowerCase();
    if (users.some(u => u.identifier.toLowerCase() === cleanId)) {
      setErrorMsg('A user with this Email / Staff ID already exists.');
      return;
    }

    const passwordHash = await security.hashPassword(password);
    const computedInitials = (
      initials.trim() || 
      (window.LNF.getUserInitials ? window.LNF.getUserInitials({ name, identifier }) : '') ||
      'ST'
    ).toUpperCase();

    onCreateUser({
      name: name.trim(),
      identifier: cleanId,
      initials: computedInitials,
      role,
      passwordHash
    });

    setSuccessMsg(`Created user ${name.trim()} successfully!`);
    setName('');
    setIdentifier('');
    setInitials('');
    setInitialsEdited(false);
    setPassword('');
    setIsAddingUser(false);
  };

  const handlePasswordResetSubmit = async (userId) => {
    if (!newPassword.trim() || newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    const hash = await security.hashPassword(newPassword);
    onResetPassword(userId, hash);
    setResettingUserId(null);
    setNewPassword('');
    setSuccessMsg('Password updated successfully.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-0 sm:p-4">
      <div
        className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto animate-sheet-up pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-apple-sheet flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-full pt-3 pb-2 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full"></div>
        </div>

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00368C] to-[#0047BA] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <window.LNF.Icons.Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 leading-tight">
                Staff & User Management
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Admin Console • Manage Student Staff Credentials & Roles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 flex items-center justify-center font-bold text-sm active:scale-90 transition-all"
          >
            <window.LNF.Icons.X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <window.LNF.Icons.Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>{successMsg}</span>
              </span>
              <button onClick={() => setSuccessMsg('')} className="p-1 text-emerald-700 hover:text-emerald-900">
                <window.LNF.Icons.X className="w-3 h-3" />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <window.LNF.Icons.AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </span>
              <button onClick={() => setErrorMsg('')} className="p-1 text-red-700 hover:text-red-900">
                <window.LNF.Icons.X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-zinc-800">Station Staff Accounts</h4>
              <p className="text-xs text-zinc-400">Total: {users.length} authorized accounts</p>
            </div>
            <button
              onClick={() => { setIsAddingUser(!isAddingUser); setErrorMsg(''); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0047BA] hover:bg-[#00368C] text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-all duration-150 shadow-sm border border-black/10 min-h-[40px]"
            >
              {isAddingUser ? (
                <>
                  <window.LNF.Icons.X className="w-3.5 h-3.5" />
                  <span>Close Form</span>
                </>
              ) : (
                <>
                  <window.LNF.Icons.Plus className="w-3.5 h-3.5" />
                  <span>Add New Staff</span>
                </>
              )}
            </button>
          </div>

          {/* Add New User Collapsible Form */}
          {isAddingUser && (
            <form onSubmit={handleCreateSubmit} className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-3.5 animate-sheet-up">
              <h5 className="text-xs font-bold text-[#0047BA] uppercase tracking-wider">
                Create New Staff Account
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Carlos Gomez"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-zinc-900 text-[16px] outline-none focus:border-[#0047BA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Staff Email / Station ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. carlos.staff@auraria.edu"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-zinc-900 text-[16px] outline-none focus:border-[#0047BA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-zinc-700">
                      Staff Initials
                    </label>
                    {initials && (
                      <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-1.5 py-0.5 rounded">
                        {initialsEdited ? 'Custom' : 'Auto'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={initials}
                    onChange={(e) => {
                      setInitials(e.target.value.toUpperCase());
                      setInitialsEdited(true);
                    }}
                    placeholder="e.g. CG"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-zinc-900 text-[16px] uppercase font-bold outline-none focus:border-[#0047BA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-zinc-900 text-[16px] outline-none focus:border-[#0047BA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-zinc-900 text-[16px] outline-none focus:border-[#0047BA]"
                  >
                    <option value="staff">Student Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-semibold border border-zinc-200 active:scale-[0.98] transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0047BA] hover:bg-[#00368C] text-white rounded-xl text-xs font-bold shadow-sm border border-black/10 active:scale-[0.98] transition-all duration-150"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          )}

          {/* User List Table / Cards */}
          <div className="space-y-2.5">
            {users.map(u => {
              const isCurrent = currentUser?.userId === u.id;
              const isAdmin = u.role === 'admin';

              return (
                <div
                  key={u.id}
                  className="p-3.5 bg-zinc-50 hover:bg-zinc-100/70 rounded-2xl border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isAdmin ? 'bg-blue-100 text-[#0047BA]' : 'bg-zinc-200 text-zinc-700'
                    }`}>
                      {u.initials || 'ST'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-zinc-900 text-sm">{u.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-100 text-[#0047BA] font-extrabold px-1.5 py-0.5 rounded-md">
                            YOU
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          isAdmin 
                            ? 'bg-blue-50 text-[#0047BA] border-blue-200' 
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        }`}>
                          {isAdmin ? (
                            <>
                              <window.LNF.Icons.Crown className="w-3 h-3 text-[#0047BA]" />
                              <span>Admin</span>
                            </>
                          ) : (
                            <>
                              <window.LNF.Icons.IdCard className="w-3 h-3 text-zinc-600" />
                              <span>Staff</span>
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{u.identifier}</p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200/60 justify-end flex-wrap">
                    {/* Reset Password Trigger */}
                    {resettingUserId === u.id ? (
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-zinc-300">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New password"
                          className="px-2 py-1 text-xs text-zinc-900 outline-none w-28"
                        />
                        <button
                          type="button"
                          onClick={() => handlePasswordResetSubmit(u.id)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-[11px] font-bold"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => { setResettingUserId(null); setNewPassword(''); }}
                          className="p-1 text-zinc-400 hover:text-zinc-700 text-xs font-bold"
                        >
                          <window.LNF.Icons.X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setResettingUserId(u.id); setNewPassword(''); }}
                        className="px-2.5 py-1.5 text-zinc-600 hover:text-zinc-900 bg-white rounded-xl text-xs font-medium border border-zinc-200 active:scale-95"
                      >
                        Reset PW
                      </button>
                    )}

                    {/* Role Toggle: Promote to Admin or Demote */}
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => onToggleRole(u.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 border transition-all ${
                          isAdmin
                            ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-zinc-300'
                            : 'bg-blue-50 text-[#0047BA] hover:bg-blue-100 border-blue-200'
                        }`}
                      >
                        {isAdmin ? 'Demote to Staff' : 'Make Admin'}
                      </button>
                    )}

                    {/* Delete Account */}
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => onDeleteUser(u.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors active:scale-90"
                        title="Delete user account"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Supabase Cloud Database & Storage Card */}
          <div className="mt-6 pt-5 border-t border-zinc-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <window.LNF.Icons.Bolt className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="text-sm font-bold text-zinc-800">Supabase Cloud Database & Storage</h4>
                  <p className="text-xs text-zinc-500">Live PostgreSQL synchronization & photo uploads</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isSupaConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {isSupaConnected ? '● Live Connected' : '○ Local Storage Mode'}
              </span>
            </div>

            <form onSubmit={handleSaveSupabase} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={supaUrl}
                  onChange={(e) => setSupaUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-zinc-900 text-[16px] outline-none focus:border-[#0047BA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Supabase Public Anon Key (Never use service_role)
                </label>
                <input
                  type="password"
                  value={supaKey}
                  onChange={(e) => setSupaKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-zinc-900 text-[16px] outline-none focus:border-[#0047BA]"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-zinc-500">
                  You can also edit <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-700 font-mono">js/config.js</code> directly.
                </span>
                <button
                  type="submit"
                  disabled={testingSupa}
                  className="px-4 py-2 bg-[#0047BA] hover:bg-[#00368C] text-white rounded-xl text-xs font-bold shadow-sm border border-black/10 active:scale-[0.98] transition-all duration-150 min-h-[38px] shrink-0"
                >
                  {testingSupa ? 'Testing Connection...' : 'Save & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
