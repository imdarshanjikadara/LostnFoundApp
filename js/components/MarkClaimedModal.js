// ==========================================================================
// Component: Mark Claimed Modal Prompt
// Handles identity verification and official release record
// ==========================================================================
window.LNF = window.LNF || {};

window.LNF.MarkClaimedModal = function MarkClaimedModal({
  currentUser = null,
  item,
  onClose,
  onConfirm
}) {
  // Compute initials of logged-in user in strict capital letters
  const userInitials = (window.LNF.getUserInitials 
    ? window.LNF.getUserInitials(currentUser) 
    : (currentUser?.initials || '')).toUpperCase();

  const [claimantName, setClaimantName] = React.useState('');
  const [claimantIdOrPhone, setClaimantIdOrPhone] = React.useState('');
  const [releasingStaff, setReleasingStaff] = React.useState(() => {
    return userInitials || (localStorage.getItem('tivoli_staff_initials') || '').toUpperCase();
  });

  React.useEffect(() => {
    if (userInitials) {
      setReleasingStaff(userInitials);
    }
  }, [userInitials]);
  const [verifiedCheckbox, setVerifiedCheckbox] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!claimantName.trim()) {
      setErrorMsg('Claimant full name is required.');
      return;
    }
    if (!releasingStaff.trim()) {
      setErrorMsg('Releasing staff initials are required.');
      return;
    }
    if (!verifiedCheckbox) {
      setErrorMsg('Please confirm physical or ID verification.');
      return;
    }

    onConfirm({
      claimantName: claimantName.trim(),
      claimantIdOrPhone: claimantIdOrPhone.trim(),
      releasingStaff: releasingStaff.toUpperCase().trim()
    });
  };

  const { Icons } = window.LNF;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 transition-opacity">
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-apple-sheet animate-sheet-up border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Icons.Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Release Claimed Item</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 flex items-center justify-center font-bold text-sm active:scale-90 transition-all"
          >
            <Icons.X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item summary pill */}
        <div className="my-3 p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
          <p className="text-[10px] text-[#0047BA] font-bold uppercase tracking-wider">Releasing item</p>
          <p className="text-sm font-bold text-zinc-800 line-clamp-1">{item.title}</p>
          <div className="flex gap-2 text-xs text-zinc-600 mt-1">
            <span>Bin: <b>{item.location}</b></span>
            {item.studentId && <span>• Target ID: <b>{item.studentId}</b></span>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium flex items-center gap-2">
              <Icons.AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Claimant Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full px-3 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-900 focus:bg-white focus:border-emerald-500 outline-none text-[16px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Claimant Student ID # or Phone <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={claimantIdOrPhone}
              onChange={(e) => setClaimantIdOrPhone(e.target.value)}
              placeholder="e.g. 900481203 or (303) 555-0192 (optional)"
              className="w-full px-3 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-900 focus:bg-white focus:border-emerald-500 outline-none text-[16px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-600">
                Releasing Staff Initials <span className="text-red-500">*</span>
              </label>
              {userInitials && (
                <button
                  type="button"
                  onClick={() => setReleasingStaff(userInitials)}
                  title="Click to reset to your logged-in initials"
                  className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Auto:</span>
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">{userInitials}</span>
                </button>
              )}
            </div>
            <input
              type="text"
              required
              maxLength={4}
              value={releasingStaff}
              onChange={(e) => setReleasingStaff(e.target.value.toUpperCase())}
              placeholder={userInitials || "e.g. SUP"}
              className="w-full px-3 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-900 focus:bg-white focus:border-emerald-500 outline-none text-[16px] uppercase font-bold"
            />
          </div>

          {/* Verification Checklist */}
          <label className="flex items-start gap-2.5 pt-1 text-xs text-zinc-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedCheckbox}
              onChange={(e) => setVerifiedCheckbox(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300"
            />
            <span>
              I have verified the claimant's photo ID, student credentials, or matching device passcode before releasing.
            </span>
          </label>

          {/* Action buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-xl font-semibold active:scale-[0.98] transition-all duration-150 min-h-[48px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-semibold shadow-sm border border-emerald-700/20 transition-all duration-150 flex items-center justify-center min-h-[48px]"
            >
              Release Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
