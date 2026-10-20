// ==========================================================================
// Component: Individual Item Card
// Optimized for one-handed mobile scrolling & tactile feedback
// ==========================================================================
window.LNF = window.LNF || {};

window.LNF.ItemCard = function ItemCard({
  item,
  onOpenDetail,
  onEditClick,
  onClaimClick
}) {
  const { CATEGORIES, formatTimeAgo, getCategoryIcon, Icons } = window.LNF;
  const categoryMeta = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[6];

  return (
    <div
      onClick={onOpenDetail}
      className="bg-white rounded-2xl p-3 sm:p-3.5 border border-zinc-200/80 shadow-apple-sm hover:shadow-apple-card hover:border-zinc-300 active:scale-[0.985] transition-all duration-150 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Row: Thumbnail + Category Pill + Location Tag */}
        <div className="flex gap-2.5 sm:gap-3 items-start">
          {/* Thumbnail / Icon (strictly constrained on mobile) */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shrink-0 flex items-center justify-center">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="p-3 text-zinc-400 flex items-center justify-center w-full h-full">
                {getCategoryIcon(item.category, "w-8 h-8")}
              </div>
            )}
            <span className="absolute bottom-1 right-1 p-1 bg-black/65 text-white rounded-md backdrop-blur-sm">
              {getCategoryIcon(item.category, "w-3 h-3 text-white")}
            </span>
          </div>

          {/* Content info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border ${categoryMeta.color}`}>
                {item.category}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0047BA] border border-blue-200/60 truncate max-w-[140px] sm:max-w-none">
                <Icons.MapPin className="w-3 h-3 text-[#0047BA] shrink-0" />
                <span className="truncate">{item.location}</span>
              </span>
            </div>

            <h2 className="text-[14px] sm:text-[15px] font-bold text-zinc-900 mt-1 leading-snug line-clamp-2">
              {item.title}
            </h2>

            {item.studentId && (
              <p className="text-[11px] sm:text-xs text-zinc-600 mt-0.5 sm:mt-1 truncate">
                <span className="font-semibold text-zinc-400">ID / Mark:</span> {item.studentId}
              </p>
            )}
          </div>
        </div>

        {/* Markings excerpt */}
        {item.markings && (
          <p className="text-xs text-zinc-600 mt-2 sm:mt-2.5 bg-zinc-50 rounded-lg p-2 line-clamp-2 border border-zinc-100 leading-relaxed">
            {item.markings}
          </p>
        )}
      </div>

      {/* Bottom Card Footer: Meta Info & Status / Claim Action */}
      <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400 min-w-0 truncate">
          <span className="truncate">{formatTimeAgo(item.dateLogged)}</span>
          <span>•</span>
          <span className="bg-zinc-100 text-zinc-600 font-semibold px-1.5 py-0.5 rounded text-[10px] shrink-0">
            {item.staffInitials}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Edit Button */}
          <button
            type="button"
            onClick={onEditClick}
            title="Edit item details"
            className="p-2 rounded-xl text-zinc-500 hover:text-[#0047BA] hover:bg-blue-50 active:scale-95 transition-all duration-150 min-h-[38px] min-w-[38px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center border border-zinc-200/60"
          >
            <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {item.status === 'active' ? (
            <button
              onClick={onClaimClick}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold shadow-sm border border-emerald-700/20 transition-all duration-150 min-h-[38px] sm:min-h-[44px]"
            >
              <Icons.Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="whitespace-nowrap">Mark Claimed</span>
            </button>
          ) : (
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                <Icons.Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-none">Claimed by {item.claimedBy || 'Student'}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
