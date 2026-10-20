// ==========================================================================
// Component: Sticky Header, Search, Segmented Toggle & Category Pills
// Designed with Auraria Campus Identity & Apple Cupertino Guidelines
// ==========================================================================
window.LNF = window.LNF || {};

window.LNF.Header = function Header({
  currentUser,
  activeCount,
  claimedCount,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenUserManagement,
  onSignOut,
  onExportCsv
}) {
  const { CATEGORIES, getCategoryIcon, Icons } = window.LNF;

  return (
    <header className="sticky top-0 z-30 pt-[env(safe-area-inset-top)] cupertino-glass border-b border-zinc-200/80 shadow-sm transition-all">
      {/* Auraria Campus Top Slim Notification Accent */}
      <div className="bg-[#C2EC00] text-zinc-950 text-[11px] font-bold py-1 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-700 animate-pulse"></span>
        <span>Auraria Campus • Tivoli ID Station & Lost and Found Hub</span>
      </div>

      <div className="max-w-5xl xl:max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Auraria Blue Badge with Official White SVG Logo */}
            <div className="h-9 sm:h-10 px-2 sm:px-2.5 rounded-xl bg-gradient-to-tr from-[#00368C] via-[#0047BA] to-[#0A84FF] shadow-apple-sm flex items-center justify-center border border-white/20 shrink-0">
              <img
                src="./auraria-logo-white-062824.svg"
                alt="Auraria Campus"
                className="h-5 sm:h-6 w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-[15px] sm:text-[17px] font-bold text-zinc-900 tracking-tight leading-tight flex items-center gap-1.5 whitespace-nowrap">
                ID Station
                <span className="text-blue-700 font-semibold text-[11px] sm:text-xs bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200/60 whitespace-nowrap">
                  Lost & Found
                </span>
              </h1>
              <p className="text-xs text-zinc-500 font-medium whitespace-nowrap hidden sm:block">Tivoli Student Union • Auraria Campus</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* CSV Inventory Export Button */}
            <button
              type="button"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold text-zinc-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 active:scale-95 transition-all border border-zinc-200 hover:border-emerald-300 min-h-[36px] shadow-sm shrink-0 whitespace-nowrap"
              title="Export Inventory Log to CSV file"
            >
              <svg className="w-4 h-4 text-emerald-600 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden md:inline font-medium">CSV</span>
            </button>

            {/* Live Count Pill with Auraria Lime dot (Desktop / Tablet) */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-zinc-700 bg-zinc-100/90 py-1.5 px-3 rounded-full border border-zinc-200 whitespace-nowrap shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A5C900] border border-[#8DAF00] shadow-sm shrink-0"></span>
              <span className="whitespace-nowrap">{activeCount} In Bins</span>
            </div>

            {/* Admin Staff Management Trigger (Only rendered if currentUser.role === 'admin') */}
            {currentUser?.role === 'admin' && (
              <button
                type="button"
                onClick={onOpenUserManagement}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold text-[#0047BA] bg-blue-50 hover:bg-blue-100 active:scale-95 transition-all border border-blue-200/80 min-h-[36px] shrink-0 whitespace-nowrap"
                title="Manage Staff Users & Roles"
              >
                <Icons.Users className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden sm:inline">Staff</span>
              </button>
            )}

            {/* Authenticated Staff Pill */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-zinc-100/90 px-2 sm:px-2.5 py-1.5 rounded-full border border-zinc-200 text-xs shrink-0 whitespace-nowrap">
              <span className="font-bold text-zinc-800 text-xs truncate max-w-[120px] hidden sm:inline">
                {currentUser?.name || 'Staff'}
              </span>
              <span className="font-bold text-zinc-800 text-xs sm:hidden">
                {currentUser?.initials || 'ST'}
              </span>
              <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ${
                currentUser?.role === 'admin' ? 'bg-[#0047BA] text-white' : 'bg-zinc-200 text-zinc-700'
              }`}>
                {currentUser?.role === 'admin' ? 'ADMIN' : 'STAFF'}
              </span>
            </div>

            {/* Clear Distinct Log Out Button */}
            <button
              type="button"
              onClick={onSignOut}
              title="Log Out of Session"
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold text-zinc-600 hover:text-red-600 bg-white hover:bg-red-50 border border-zinc-200 hover:border-red-200 active:scale-95 transition-all min-h-[36px] shadow-sm shrink-0 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 stroke-[2.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>

        {/* Fast Instant Search Bar */}
        <div className="mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search item, student ID, bin #, markings..."
            className="w-full pl-10 pr-9 py-2.5 bg-zinc-100/90 hover:bg-zinc-100 focus:bg-white text-zinc-900 rounded-xl border border-transparent focus:border-[#0047BA] focus:ring-4 focus:ring-blue-500/15 transition-all outline-none text-[16px] placeholder-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 active:scale-90 transition-transform"
            >
              <span className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-300">
                <Icons.X className="w-2.5 h-2.5" />
              </span>
            </button>
          )}
        </div>

        {/* iOS-Style Segmented Toggle Control */}
        <div className="mt-3 p-1 bg-zinc-200/70 rounded-xl flex items-center relative text-sm font-medium">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-200 flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeTab === 'active'
                ? 'bg-white text-zinc-900 cupertino-pill-active font-semibold shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 active:bg-zinc-200/50'
            }`}
          >
            <span>Active Items</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'active'
                ? 'bg-[#0047BA] text-white font-bold'
                : 'bg-zinc-300/70 text-zinc-600'
            }`}>
              {activeCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('claimed')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all duration-200 flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeTab === 'claimed'
                ? 'bg-white text-zinc-900 cupertino-pill-active font-semibold shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 active:bg-zinc-200/50'
            }`}
          >
            <span>Claimed Items</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'claimed'
                ? 'bg-zinc-200 text-zinc-800 font-bold'
                : 'bg-zinc-300/70 text-zinc-600'
            }`}>
              {claimedCount}
            </span>
          </button>
        </div>

        {/* Category Pills Bar (Horizontal Scrollable) */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border active:scale-[0.97] min-h-[36px] ${
                  isSelected
                    ? 'bg-[#0047BA] text-white border-[#0047BA] shadow-sm font-bold'
                    : 'bg-white/80 text-zinc-700 border-zinc-200/90 hover:bg-white hover:border-zinc-300'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-zinc-500'}>
                  {getCategoryIcon(cat.id, "w-3.5 h-3.5")}
                </span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
