// ==========================================================================
// Component: Item Detail Modal Sheet
// Displays high-resolution photo, location, audit log & claim status
// ==========================================================================
window.LNF = window.LNF || {};

window.LNF.ItemDetailSheet = function ItemDetailSheet({
  item,
  onClose,
  onEditClick,
  onClaimClick
}) {
  const { CATEGORIES, formatDateTime, getCategoryIcon, Icons } = window.LNF;
  const categoryMeta = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[6];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto animate-sheet-up pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-apple-sheet flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle for iOS Sheet */}
        <div className="w-full pt-3 pb-2 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryMeta.color}`}>
              {item.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#0047BA] border border-blue-200/60">
              <Icons.MapPin className="w-3.5 h-3.5 text-[#0047BA]" />
              <span>{item.location}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEditClick}
              className="px-3 py-1.5 rounded-full bg-blue-50 text-[#0047BA] hover:bg-blue-100 flex items-center gap-1.5 font-semibold text-xs active:scale-[0.98] transition-all border border-blue-200/60 min-h-[36px]"
            >
              <svg className="w-3.5 h-3.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 flex items-center justify-center font-bold text-sm active:scale-90 transition-all"
            >
              <Icons.X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          {/* Photo preview */}
          {item.image ? (
            <div className="w-full h-56 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 relative group">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-32 rounded-2xl bg-zinc-50 border border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400">
              <div className="mb-1 text-zinc-400">
                {getCategoryIcon(item.category, "w-10 h-10")}
              </div>
              <span className="text-xs">No photo captured</span>
            </div>
          )}

          <div>
            <h3 className="text-xl font-bold text-zinc-900 leading-snug">{item.title}</h3>
            <p className="text-xs text-zinc-400 mt-1">Logged on {formatDateTime(item.dateLogged)} by Staff {item.staffInitials}</p>
          </div>

          {/* Details Grid */}
          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 space-y-2.5 text-sm">
            <div className="flex justify-between items-start">
              <span className="text-zinc-500">Storage Location:</span>
              <span className="font-bold text-[#0047BA] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200/60">
                {item.location}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-zinc-500">Student ID / Tag:</span>
              <span className="font-semibold text-zinc-900">{item.studentId || 'None noted'}</span>
            </div>
            <div className="pt-2 border-t border-zinc-200/60">
              <span className="text-zinc-500 block mb-1">Distinct Markings & Description:</span>
              <p className="text-zinc-800 bg-white p-2.5 rounded-xl border border-zinc-200/60 leading-relaxed text-xs sm:text-sm">
                {item.markings || 'No additional markings recorded.'}
              </p>
            </div>
          </div>

          {/* Status Section (Claimed details) */}
          {item.status === 'claimed' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1.5 text-xs text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-sm">
                <Icons.Check className="w-4 h-4 stroke-[2.5] text-emerald-600" />
                <span>Item Released & Claimed</span>
              </div>
              <p><b>Claimant:</b> {item.claimedBy}</p>
              <p><b>Verification ID / Phone:</b> {item.claimedPhone}</p>
              <p><b>Released Date:</b> {formatDateTime(item.claimedAt)}</p>
              <p><b>Releasing Staff:</b> {item.releasingStaff}</p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-5 pt-0 flex gap-3">
          <button
            type="button"
            onClick={onEditClick}
            className="py-3.5 px-4 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-800 rounded-2xl font-semibold active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-1.5 min-h-[48px] border border-zinc-200/60"
          >
            <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit</span>
          </button>

          {item.status === 'active' ? (
            <button
              onClick={onClaimClick}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-semibold shadow-sm border border-emerald-700/20 transition-all duration-150 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Icons.Check className="w-4 h-4 stroke-[2.5]" />
              <span>Mark Claimed</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-2xl font-semibold active:scale-[0.98] transition-all duration-150 min-h-[44px]"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
